import type { Category, Product } from '../types';
import type { DbCategory, DbProduct } from './database.types';

/**
 * Transforms a Supabase categories table row into the frontend Category interface
 */
export const dbToCategory = (row: DbCategory): Category => {
  return {
    id: row.id,
    name: {
      en: row.name_en || '',
      te: row.name_te || row.name_en || ''
    },
    icon: row.icon || undefined,
    image: row.image || undefined,
    description: {
      en: row.description_en || '',
      te: row.description_te || row.description_en || ''
    },
    isActive: row.is_active !== false,
    displayOrder: row.display_order ?? 0
  };
};

/**
 * Transforms frontend Category form data into a Supabase categories table row
 */
export const categoryToDb = (cat: Category, displayOrder: number = 0, isActive: boolean = true): DbCategory => {
  return {
    id: cat.id.trim(),
    name_en: cat.name.en.trim(),
    name_te: cat.name.te.trim(),
    icon: cat.icon || null,
    image: cat.image || null,
    photo: null,
    description_en: cat.description?.en || '',
    description_te: cat.description?.te || '',
    display_order: cat.displayOrder ?? displayOrder,
    is_active: cat.isActive !== undefined ? cat.isActive : isActive
  };
};

/**
 * Transforms a Supabase products table row into the frontend Product interface
 */
export const dbToProduct = (row: DbProduct): Product => {
  return {
    id: row.id,
    category: row.category_id,
    subCategory: row.sub_category || undefined,
    name: {
      en: row.name_en || '',
      te: row.name_te || row.name_en || ''
    },
    brand: row.brand || undefined,
    packSize: row.pack_size || undefined,
    price: row.price !== null ? Number(row.price) : null,
    originalPrice: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : null,
    description: {
      en: row.description_en || '',
      te: row.description_te || row.description_en || ''
    },
    image: row.image || undefined,
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    inStock: Boolean(row.in_stock),
    keyFeatures: Array.isArray(row.key_features) ? row.key_features : [],
    usage: (row.usage_en || row.usage_te) ? {
      en: row.usage_en || '',
      te: row.usage_te || row.usage_en || ''
    } : undefined
  };
};

/**
 * Transforms frontend Product form data into a Supabase products table row
 */
export const productToDb = (prod: Product): DbProduct => {
  return {
    id: prod.id.trim(),
    category_id: prod.category.trim(),
    sub_category: prod.subCategory || null,
    name_en: prod.name.en.trim(),
    name_te: prod.name.te.trim(),
    brand: prod.brand || null,
    pack_size: prod.packSize || null,
    price: prod.price !== null ? Number(prod.price) : null,
    original_price: prod.originalPrice !== null && prod.originalPrice !== undefined ? Number(prod.originalPrice) : null,
    description_en: prod.description.en || '',
    description_te: prod.description.te || '',
    image: prod.image || null,
    active: prod.active !== false,
    featured: Boolean(prod.featured),
    in_stock: prod.inStock !== false,
    key_features: Array.isArray(prod.keyFeatures) ? prod.keyFeatures : [],
    usage_en: prod.usage?.en || null,
    usage_te: prod.usage?.te || null
  };
};
