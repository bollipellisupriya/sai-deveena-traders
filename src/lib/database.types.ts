export interface DbAdminUser {
  id: string; // UUID references auth.users(id)
  email: string;
  role: 'super_admin' | 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CustomerAccountStatus = 'active' | 'suspended' | 'inactive';

export interface DbCustomerProfile {
  id: string; // UUID references auth.users(id)
  full_name: string;
  email: string | null;
  phone?: string | null;
  village_or_city?: string | null;
  preferred_language?: 'en' | 'te';
  status: CustomerAccountStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DbCategory {
  id: string; // slug
  name_en: string;
  name_te: string;
  icon?: string | null;
  image?: string | null;
  photo?: string | null;
  description_en?: string | null;
  description_te?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbProduct {
  id: string; // slug
  category_id: string;
  sub_category?: string | null;
  name_en: string;
  name_te: string;
  brand?: string | null;
  pack_size?: string | null;
  price: number | null;
  original_price?: number | null;
  description_en: string;
  description_te: string;
  image?: string | null;
  active: boolean;
  featured: boolean;
  in_stock: boolean;
  key_features: string[]; // JSONB array of strings
  usage_en?: string | null;
  usage_te?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'upi'
  | 'bank_transfer'
  | 'in_store';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded';

export type OrderSource =
  | 'web'
  | 'whatsapp'
  | 'phone'
  | 'in_store';

export interface DbOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  delivery_location: string;
  order_source: OrderSource;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_en: string;
  product_name_te: string | null;
  brand: string | null;
  pack_size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface DbBanner {
  id: string;
  title_en: string;
  title_te: string;
  subtitle_en: string;
  subtitle_te: string;
  image_desktop: string;
  image_mobile: string | null;
  button_text_en: string;
  button_text_te: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
}
