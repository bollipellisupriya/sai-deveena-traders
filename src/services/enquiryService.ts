import { supabase } from '../lib/supabase';
import type {
  CustomerEnquiry,
  CustomerEnquiryInput,
  EnquiryStatus,
  StoredCustomerInfo
} from '../types';

const STORED_CUSTOMER_KEY = 'sdt_customer_enquiry_info';
const RECENT_ENQUIRIES_KEY = 'sdt_recent_enquiries';

// Helper to clean Indian phone number to 10 digits
export function cleanIndianPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove spaces, dashes, parentheses
  let digits = rawPhone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, strip country code
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

// Validate 10-digit Indian mobile number
export function isValidIndianMobile(cleanPhone: string): boolean {
  return /^[6-9]\d{9}$/.test(cleanPhone);
}

// Validate email format if provided
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return true; // Optional
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());
}

// Map database row to TypeScript CustomerEnquiry
function mapRowToEnquiry(row: any): CustomerEnquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    villageCity: row.village_city,
    address: row.address,
    preferredContact: row.preferred_contact || 'whatsapp',
    productId: row.product_id,
    productName: row.product_name,
    status: row.status || 'new',
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const enquiryService = {
  /**
   * Save customer information in browser localStorage for convenient repeat enquiries
   */
  getStoredCustomerInfo(): StoredCustomerInfo | null {
    try {
      const stored = localStorage.getItem(STORED_CUSTOMER_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as StoredCustomerInfo;
    } catch {
      return null;
    }
  },

  saveStoredCustomerInfo(info: StoredCustomerInfo): void {
    try {
      localStorage.setItem(STORED_CUSTOMER_KEY, JSON.stringify(info));
    } catch (e) {
      console.warn('Unable to cache customer enquiry details in localStorage', e);
    }
  },

  /**
   * Get recent enquiries sent from this browser/device
   */
  getRecentEnquiries(): CustomerEnquiry[] {
    try {
      const stored = localStorage.getItem(RECENT_ENQUIRIES_KEY);
      if (stored) {
        return JSON.parse(stored) as CustomerEnquiry[];
      }
      // Fallback: If no list exists but user has cached customer info, return synthesized enquiry
      const storedCustomer = this.getStoredCustomerInfo();
      if (storedCustomer && storedCustomer.name && storedCustomer.phone) {
        return [{
          id: 'recent_prev',
          name: storedCustomer.name,
          phone: storedCustomer.phone,
          email: storedCustomer.email || null,
          villageCity: storedCustomer.villageCity || 'Bhainsa',
          address: storedCustomer.address || null,
          preferredContact: storedCustomer.preferredContact || 'whatsapp',
          productId: null,
          productName: 'Agricultural Product / Store Enquiry',
          status: 'new',
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Save an enquiry to recent enquiries list in localStorage
   */
  saveRecentEnquiry(enquiry: CustomerEnquiry): void {
    try {
      const existing = this.getRecentEnquiries().filter(e => e.id !== 'recent_prev');
      const updated = [enquiry, ...existing.filter(e => e.id !== enquiry.id)].slice(0, 20);
      localStorage.setItem(RECENT_ENQUIRIES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to cache recent enquiry in localStorage', e);
    }
  },

  /**
   * Submit a new customer enquiry (public anonymous or authenticated visitor)
   */
  async submitEnquiry(input: CustomerEnquiryInput): Promise<{
    success: boolean;
    enquiry?: CustomerEnquiry;
    error?: string;
  }> {
    // 1. Client-Side Validation
    const name = input.name ? input.name.trim() : '';
    if (name.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const cleanPhone = cleanIndianPhoneNumber(input.phone);
    if (!isValidIndianMobile(cleanPhone)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).' };
    }

    if (input.email && input.email.trim() && !isValidEmail(input.email)) {
      return { success: false, error: 'Please enter a valid email address, or leave it blank.' };
    }

    const villageCity = input.villageCity ? input.villageCity.trim() : '';
    if (villageCity.length < 2) {
      return { success: false, error: 'Please enter your village or city name.' };
    }

    // 2. Insert into Supabase customer_enquiries table
    try {
      // Only include columns granted to anonymous visitors
      // status and timestamps rely on database defaults
      const payload = {
        name,
        phone: cleanPhone,
        email: input.email?.trim() || null,
        village_city: villageCity,
        address: input.address?.trim() || null,
        preferred_contact: input.preferredContact || 'whatsapp',
        product_id: input.productId || null,
        product_name: input.productName?.trim() || null
      };

      // Pure write-only insert without .select() because anon visitors cannot SELECT rows
      const { error } = await supabase
        .from('customer_enquiries')
        .insert(payload);

      if (error) {
        console.error('Supabase error inserting customer enquiry:', error);
        return {
          success: false,
          error: error.message || 'Unable to record enquiry in the database. Please try again or call 9010454541.'
        };
      }

      const clientRefId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `enq_${Date.now()}`;

      const enquiry: CustomerEnquiry = {
        id: clientRefId,
        name,
        phone: cleanPhone,
        email: input.email?.trim() || null,
        villageCity,
        address: input.address?.trim() || null,
        preferredContact: input.preferredContact || 'whatsapp',
        productId: input.productId || null,
        productName: input.productName?.trim() || null,
        status: 'new',
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cache details for seamless repeat enquiries
      this.saveStoredCustomerInfo({
        name,
        phone: cleanPhone,
        email: input.email?.trim() || '',
        villageCity,
        address: input.address?.trim() || '',
        preferredContact: input.preferredContact
      });

      // Track in recent enquiries on this device
      this.saveRecentEnquiry(enquiry);

      return {
        success: true,
        enquiry
      };
    } catch (err: any) {
      console.error('Unexpected exception during enquiry submission:', err);
      return {
        success: false,
        error: err.message || 'Network error occurred while submitting your enquiry.'
      };
    }
  },

  /**
   * Fetch all enquiries for authenticated administrators
   */
  async fetchEnquiries(options?: {
    statusFilter?: string;
    searchQuery?: string;
  }): Promise<{
    enquiries: CustomerEnquiry[];
    error?: string;
  }> {
    try {
      let query = supabase
        .from('customer_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options?.searchQuery && options.searchQuery.trim()) {
        const term = options.searchQuery.trim();
        query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,village_city.ilike.%${term}%,product_name.ilike.%${term}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Admin enquiry fetch error:', error);
        return { enquiries: [], error: error.message };
      }

      const enquiries = (data || []).map(mapRowToEnquiry);
      return { enquiries };
    } catch (err: any) {
      console.error('Unexpected error fetching enquiries:', err);
      return { enquiries: [], error: err.message || 'Failed to fetch enquiries' };
    }
  },

  /**
   * Update enquiry status and optional notes (admin only)
   */
  async updateEnquiryStatus(
    id: string,
    status: EnquiryStatus,
    notes?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const updatePayload: Record<string, any> = { status };
      if (notes !== undefined) {
        updatePayload.notes = notes.trim() || null;
      }

      const { error } = await supabase
        .from('customer_enquiries')
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        console.error('Error updating enquiry status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Exception updating enquiry status:', err);
      return { success: false, error: err.message || 'Failed to update enquiry status' };
    }
  }
};
