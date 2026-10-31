import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderSource,
  StoreSettings,
  GuestCheckoutData
} from '../types';
import type { DbOrderItem } from '../lib/database.types';

export interface CreateOrderPayload {
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  deliveryLocation: string;
  paymentMethod: PaymentMethod;
  orderSource?: OrderSource;
  items: Array<{ productId: string; quantity: number }>;
  notes?: string | null;
  customerId?: string | null; // Admin only: override to attach to a registered customer
}

export interface AdminOrderFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminOrdersResponse {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface OrderStatistics {
  totalRevenue: number; // Strictly excludes cancelled orders
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

function mapDbOrder(raw: any): Order {
  const items: OrderItem[] = (raw.order_items || []).map((it: DbOrderItem) => ({
    id: it.id,
    orderId: it.order_id,
    productId: it.product_id,
    productNameEn: it.product_name_en,
    productNameTe: it.product_name_te || null,
    brand: it.brand || null,
    packSize: it.pack_size || null,
    quantity: it.quantity,
    unitPrice: Number(it.unit_price) || 0,
    totalPrice: Number(it.total_price) || 0,
    createdAt: it.created_at
  }));

  return {
    id: raw.id,
    orderNumber: raw.order_number,
    customerId: raw.customer_id,
    customerName: raw.customer_name,
    customerEmail: raw.customer_email,
    customerPhone: raw.customer_phone,
    deliveryLocation: raw.delivery_location,
    villageTown: raw.village_town || null,
    pincode: raw.pincode || null,
    landmark: raw.landmark || null,
    deliveryInstructions: raw.delivery_instructions || null,
    idempotencyKey: raw.idempotency_key || null,
    guestAccessToken: raw.guest_access_token || null,
    orderSource: raw.order_source as OrderSource,
    status: raw.status as OrderStatus,
    paymentMethod: raw.payment_method as PaymentMethod,
    paymentStatus: raw.payment_status as PaymentStatus,
    subtotal: Number(raw.subtotal) || 0,
    deliveryCharge: Number(raw.delivery_charge) || 0,
    discount: Number(raw.discount) || 0,
    totalAmount: Number(raw.total_amount) || 0,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    items
  };
}

export const orderService = {
  /**
   * Securely create an order via PostgreSQL SECURITY DEFINER function `create_order_secure`.
   * Enforces server-side product pricing, stock availability, active customer account checks,
   * and atomic transaction.
   */
  async createOrderSecure(payload: CreateOrderPayload): Promise<{
    data: { orderId: string; orderNumber: string; subtotal: number; totalAmount: number; status: string } | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database service is not configured.' };
    }

    try {
      if (!payload.items || payload.items.length === 0) {
        return { data: null, error: 'Order must contain at least one item.' };
      }

      // Format payload for RPC parameters
      const rpcArgs = {
        p_customer_name: payload.customerName.trim(),
        p_customer_phone: payload.customerPhone?.trim() || null,
        p_customer_email: payload.customerEmail?.trim() || null,
        p_delivery_location: payload.deliveryLocation.trim(),
        p_payment_method: payload.paymentMethod || 'cash_on_delivery',
        p_order_source: payload.orderSource || 'web',
        p_items: payload.items.map(it => ({
          productId: it.productId,
          quantity: it.quantity
        })),
        p_notes: payload.notes?.trim() || null,
        p_customer_id: payload.customerId || null
      };

      const { data, error } = await supabase.rpc('create_order_secure', rpcArgs);

      if (error) {
        console.error('Error in create_order_secure RPC:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error in createOrderSecure:', err);
      return { data: null, error: err.message || 'Failed to place order.' };
    }
  },

  /**
   * Fetch orders placed by the currently authenticated customer
   * Enforced by Supabase RLS (customers can view only their own orders)
   */
  async fetchCustomerOrders(): Promise<{ orders: Order[]; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { orders: [], error: 'Database is not configured.' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { orders: [], error: 'Customer is not logged in.' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { orders: [], error: error.message };
      }

      const orders = (data || []).map(mapDbOrder);
      return { orders, error: null };
    } catch (err: any) {
      return { orders: [], error: err.message || 'Failed to load customer orders.' };
    }
  },

  /**
   * Fetch all orders for the Admin portal with filters, search, and pagination
   */
  async fetchAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrdersResponse> {
    if (!isSupabaseConfigured()) {
      return { orders: [], totalCount: 0, page: 1, pageSize: 20 };
    }

    try {
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
      const offset = (page - 1) * pageSize;

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `, { count: 'exact' });

      // Status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Search filter
      if (filters.search && filters.search.trim() !== '') {
        const s = filters.search.trim();
        query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,delivery_location.ilike.%${s}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching admin orders:', error);
        return { orders: [], totalCount: 0, page, pageSize };
      }

      const orders = (data || []).map(mapDbOrder);
      return {
        orders,
        totalCount: count || orders.length,
        page,
        pageSize
      };
    } catch (err) {
      console.error('Error in fetchAdminOrders:', err);
      return { orders: [], totalCount: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Update the status of an order (Admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update order status.' };
    }
  },

  /**
   * Update the payment status of an order (Admin only)
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update payment status.' };
    }
  },

  /**
   * Fetch aggregated sales and order statistics
   * Note: strictly excludes 'cancelled' orders from totalRevenue
   */
  async fetchOrderStatistics(): Promise<OrderStatistics> {
    const defaultStats: OrderStatistics = {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };

    if (!isSupabaseConfigured()) return defaultStats;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_amount');

      if (error || !data) {
        return defaultStats;
      }

      let totalRevenue = 0;
      let pendingOrders = 0;
      let confirmedOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;

      data.forEach((ord: any) => {
        const amt = Number(ord.total_amount) || 0;
        const st = ord.status;

        if (st === 'cancelled') {
          cancelledOrders += 1;
        } else {
          // Exclude cancelled orders from total revenue
          totalRevenue += amt;
        }

        if (st === 'pending') pendingOrders += 1;
        else if (st === 'confirmed' || st === 'processing') confirmedOrders += 1;
        else if (st === 'delivered') deliveredOrders += 1;
      });

      return {
        totalRevenue,
        totalOrders: data.length,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders
      };
    } catch (err) {
      console.warn('Could not fetch order statistics:', err);
      return defaultStats;
    }
  },

  /**
   * Fetch current store delivery settings from Supabase.
   * Business rule default fallback: free delivery >= ₹199, ₹50 fee below ₹199.
   */
  async fetchDeliverySettings(): Promise<StoreSettings> {
    const defaultSettings: StoreSettings = {
      id: 'default',
      freeDeliveryThreshold: 199,
      deliveryFee: 50,
      deliveryEnabled: true,
      businessWhatsappNumber: '919010454541'
    };

    if (!isSupabaseConfigured()) return defaultSettings;

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error || !data) {
        return defaultSettings;
      }

      return {
        id: data.id,
        freeDeliveryThreshold: Number(data.free_delivery_threshold) >= 0 ? Number(data.free_delivery_threshold) : 199,
        deliveryFee: Number(data.delivery_fee) >= 0 ? Number(data.delivery_fee) : 50,
        deliveryEnabled: data.delivery_enabled ?? true,
        businessWhatsappNumber: data.business_whatsapp_number || '919010454541',
        updatedAt: data.updated_at
      };
    } catch (e) {
      console.warn('Using default delivery settings fallback:', e);
      return defaultSettings;
    }
  },

  /**
   * Update store delivery rules (Admin only)
   */
  async updateDeliverySettings(
    settings: Partial<StoreSettings>
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const payload: Record<string, any> = {
        id: 'default',
        updated_at: new Date().toISOString()
      };

      if (settings.freeDeliveryThreshold !== undefined) {
        payload.free_delivery_threshold = Number(settings.freeDeliveryThreshold);
      }
      if (settings.deliveryFee !== undefined) {
        payload.delivery_fee = Number(settings.deliveryFee);
      }
      if (settings.deliveryEnabled !== undefined) {
        payload.delivery_enabled = Boolean(settings.deliveryEnabled);
      }
      if (settings.businessWhatsappNumber !== undefined) {
        payload.business_whatsapp_number = settings.businessWhatsappNumber.trim();
      }

      const { error } = await supabase
        .from('store_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update delivery settings.' };
    }
  },

  /**
   * Secure Guest & Customer Order Creation via PostgreSQL SECURITY DEFINER RPC.
   * Does NOT require user login or OTP. Validates product IDs, prices, stock,
   * calculates subtotal and delivery charge server-side, and generates an order number atomically.
   */
  async createGuestOrderSecure(
    guestData: GuestCheckoutData,
    items: Array<{ productId: string; quantity: number }>,
    idempotencyKey?: string,
    retrySecret?: string
  ): Promise<{
    data: {
      orderId: string;
      orderNumber: string;
      subtotal: number;
      deliveryCharge: number;
      totalAmount: number;
      status: string;
      guestAccessToken?: string;
      isDuplicate?: boolean;
    } | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database service is not configured.' };
    }

    try {
      if (!items || items.length === 0) {
        return { data: null, error: 'Your cart is empty. Please add items before checking out.' };
      }

      const validKey = (idempotencyKey && idempotencyKey.trim() !== '')
        ? idempotencyKey.trim()
        : (typeof crypto !== 'undefined' && crypto.randomUUID
            ? `guest_${crypto.randomUUID()}`
            : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}`);

      const validSecret = (retrySecret && retrySecret.trim() !== '')
        ? retrySecret.trim()
        : (typeof crypto !== 'undefined' && crypto.randomUUID
            ? `sec_${crypto.randomUUID()}`
            : `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`);

      const rpcArgs = {
        p_customer_name: guestData.fullName.trim(),
        p_customer_phone: guestData.phone.trim(),
        p_delivery_address: guestData.deliveryAddress.trim(),
        p_village_town: guestData.villageTown.trim(),
        p_pincode: guestData.pincode.trim(),
        p_items: items.map(it => ({
          productId: it.productId,
          quantity: it.quantity
        })),
        p_landmark: guestData.landmark?.trim() || null,
        p_delivery_instructions: guestData.deliveryInstructions?.trim() || null,
        p_customer_email: guestData.email?.trim() || null,
        p_payment_method: guestData.paymentMethod || 'cash_on_delivery',
        p_order_source: 'web',
        p_idempotency_key: validKey,
        p_retry_secret: validSecret
      };

      const { data, error } = await supabase.rpc('create_guest_order_secure', rpcArgs);

      if (error) {
        console.error('Error in create_guest_order_secure RPC:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error in createGuestOrderSecure:', err);
      return { data: null, error: err.message || 'Failed to place order.' };
    }
  },

  /**
   * Secure Guest Order Lookup via high-entropy access token.
   * Prevents unauthorized order enumeration or leaking customer data.
   */
  async getGuestOrderByToken(token: string): Promise<{ data: any | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database service is not configured.' };
    }

    try {
      if (!token || token.trim() === '') {
        return { data: null, error: 'Invalid or missing tracking token.' };
      }

      const { data, error } = await supabase.rpc('get_guest_order_by_token', {
        p_guest_access_token: token.trim()
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch order.' };
    }
  }
};
