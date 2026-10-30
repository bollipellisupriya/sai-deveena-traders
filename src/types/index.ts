export type Language = 'en' | 'te';

export interface LocalizedText {
  en: string;
  te: string;
}

export interface Category {
  id: string;
  name: LocalizedText;
  icon?: string;
  description?: LocalizedText;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface Product {
  id: string;
  category: string;
  name: LocalizedText;
  brand?: string;
  packSize?: string;
  price: number | null; // null indicates "Contact for price"
  originalPrice?: number | null;
  description: LocalizedText;
  image?: string;
  active: boolean;
  featured?: boolean;
  usage?: LocalizedText;
  subCategory?: string;
  keyFeatures?: string[];
  inStock?: boolean;
}

export interface CatalogData {
  schemaVersion: number;
  shop: {
    name: string;
    city: string;
    state: string;
    currency: string;
  };
  categories: Category[];
  products: Product[];
}

export type OrderStatus =
  | 'pending'
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
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

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productNameEn: string;
  productNameTe?: string | null;
  brand?: string | null;
  packSize?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  deliveryLocation: string;
  villageTown?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  deliveryInstructions?: string | null;
  idempotencyKey?: string | null;
  guestAccessToken?: string | null;
  orderSource: OrderSource;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface StoreSettings {
  id: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  deliveryEnabled: boolean;
  businessWhatsappNumber: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GuestCheckoutData {
  fullName: string;
  phone: string;
  deliveryAddress: string;
  villageTown: string;
  pincode: string;
  landmark?: string;
  deliveryInstructions?: string;
  paymentMethod?: PaymentMethod;
  email?: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string | null;
  phone?: string | null;
  villageOrCity?: string | null;
  preferredLanguage?: 'en' | 'te';
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  updatedAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export type CustomerActionType = 'call' | 'whatsapp';

export interface PendingCustomerAction {
  type: CustomerActionType;
  product?: Product;
  customText?: string;
}

export type EnquiryStatus = 'new' | 'contacted' | 'interested' | 'order_confirmed' | 'closed';

export type PreferredContactMethod = 'whatsapp' | 'call';

export interface CustomerEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  villageCity: string;
  address?: string | null;
  preferredContact: PreferredContactMethod;
  productId?: string | null;
  productName?: string | null;
  status: EnquiryStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerEnquiryInput {
  name: string;
  phone: string;
  email?: string | null;
  villageCity: string;
  address?: string | null;
  preferredContact: PreferredContactMethod;
  productId?: string | null;
  productName?: string | null;
}

export interface StoredCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  villageCity: string;
  address?: string;
  preferredContact: PreferredContactMethod;
}


