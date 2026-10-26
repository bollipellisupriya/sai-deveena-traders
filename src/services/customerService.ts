import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CustomerProfile } from '../types';
import type { DbCustomerProfile } from '../lib/database.types';

export interface CustomerFilterParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerListResponse {
  customers: CustomerProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const customerService = {
  /**
   * Fetch paginated list of customers for Admin portal
   * Automatically filters out administrative users (from public.admin_users)
   * Joins order count and total spend (excluding cancelled orders)
   */
  async fetchCustomersList(params: CustomerFilterParams = {}): Promise<CustomerListResponse> {
    if (!isSupabaseConfigured()) {
      return { customers: [], totalCount: 0, page: 1, pageSize: 20 };
    }

    try {
      const page = params.page && params.page > 0 ? params.page : 1;
      const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
      const offset = (page - 1) * pageSize;

      // 1. Fetch admin IDs so admins are never displayed in the customer list or counted as customers
      const { data: adminRows } = await supabase
        .from('admin_users')
        .select('id');
      const adminIds = (adminRows || []).map((r: any) => r.id);

      // 2. Query customer_profiles
      let query = supabase
        .from('customer_profiles')
        .select('*', { count: 'exact' });

      // Exclude admin accounts
      if (adminIds.length > 0) {
        query = query.not('id', 'in', `(${adminIds.join(',')})`);
      }

      // Filter by status if provided
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      // Filter by search query (name, email, phone, village)
      if (params.search && params.search.trim() !== '') {
        const s = params.search.trim();
        query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,village_or_city.ilike.%${s}%`);
      }

      // Order & paginate
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: profileRows, error, count } = await query;

      if (error) {
        console.error('Error fetching customer profiles:', error);
        return { customers: [], totalCount: 0, page, pageSize };
      }

      if (!profileRows || profileRows.length === 0) {
        return { customers: [], totalCount: count || 0, page, pageSize };
      }

      const customerIds = profileRows.map((r: any) => r.id);

      // 3. Fetch aggregated order statistics for these customers (order count, total spend excluding cancelled)
      const { data: orderRows } = await supabase
        .from('orders')
        .select('id, customer_id, total_amount, status')
        .in('customer_id', customerIds);

      const statsMap: Record<string, { count: number; spend: number }> = {};
      (orderRows || []).forEach((ord: any) => {
        if (!ord.customer_id) return;
        if (!statsMap[ord.customer_id]) {
          statsMap[ord.customer_id] = { count: 0, spend: 0 };
        }
        statsMap[ord.customer_id].count += 1;
        // Exclude cancelled orders from total spend
        if (ord.status !== 'cancelled') {
          statsMap[ord.customer_id].spend += Number(ord.total_amount) || 0;
        }
      });

      const customers: CustomerProfile[] = profileRows.map((row: DbCustomerProfile) => {
        const stats = statsMap[row.id] || { count: 0, spend: 0 };
        return {
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone || null,
          villageOrCity: row.village_or_city || null,
          preferredLanguage: row.preferred_language || 'en',
          status: row.status || 'active',
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
          orderCount: stats.count,
          totalSpent: stats.spend
        };
      });

      return {
        customers,
        totalCount: count || customers.length,
        page,
        pageSize
      };
    } catch (err) {
      console.error('Error in fetchCustomersList:', err);
      return { customers: [], totalCount: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Fetch customer details and complete order history
   */
  async fetchCustomerDetail(customerId: string): Promise<{ profile: CustomerProfile | null; orders: any[] }> {
    if (!isSupabaseConfigured()) {
      return { profile: null, orders: [] };
    }

    try {
      const { data: profileRow, error: pErr } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();

      if (pErr || !profileRow) {
        return { profile: null, orders: [] };
      }

      // Fetch customer orders
      const { data: orderRows, error: oErr } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (oErr) {
        console.error('Error fetching customer orders:', oErr);
      }

      const orders = orderRows || [];
      const totalSpent = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);

      const profile: CustomerProfile = {
        id: profileRow.id,
        fullName: profileRow.full_name,
        email: profileRow.email,
        phone: profileRow.phone || null,
        villageOrCity: profileRow.village_or_city || null,
        preferredLanguage: profileRow.preferred_language || 'en',
        status: profileRow.status || 'active',
        createdAt: profileRow.created_at || new Date().toISOString(),
        updatedAt: profileRow.updated_at || new Date().toISOString(),
        orderCount: orders.length,
        totalSpent
      };

      return { profile, orders };
    } catch (err) {
      console.error('Error in fetchCustomerDetail:', err);
      return { profile: null, orders: [] };
    }
  },

  /**
   * Update customer account status (active, suspended, inactive) - Admin only
   */
  async updateCustomerStatus(
    customerId: string,
    status: 'active' | 'suspended' | 'inactive'
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({ status })
        .eq('id', customerId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update status' };
    }
  },

  /**
   * Count total active customers (excluding admin accounts)
   */
  async fetchActiveCustomersCount(): Promise<number> {
    if (!isSupabaseConfigured()) return 0;

    try {
      const { data: adminRows } = await supabase
        .from('admin_users')
        .select('id');
      const adminIds = (adminRows || []).map((r: any) => r.id);

      let query = supabase
        .from('customer_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (adminIds.length > 0) {
        query = query.not('id', 'in', `(${adminIds.join(',')})`);
      }

      const { count, error } = await query;
      if (error) {
        console.warn('Could not count active customers:', error);
        return 0;
      }

      return count || 0;
    } catch {
      return 0;
    }
  }
};
