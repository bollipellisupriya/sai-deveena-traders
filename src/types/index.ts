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
}

export interface Product {
  id: string;
  category: string;
  name: LocalizedText;
  brand?: string;
  packSize?: string;
  price: number | null; // null indicates "Contact for price"
  description: LocalizedText;
  image?: string;
  active: boolean;
  featured?: boolean;
  usage?: LocalizedText;
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
