export type AdminTab = 'dashboard' | 'products' | 'categories' | 'inventory' | 'enquiries' | 'orders' | 'customers' | 'settings';

export interface AdminUser {
  email: string;
  role: 'admin' | 'manager';
  name: string;
}

export interface AdminMetric {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}
