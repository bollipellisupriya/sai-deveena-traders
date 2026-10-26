import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbToCategory, categoryToDb, dbToProduct, productToDb } from '../lib/adapters';
import type { DbCategory, DbProduct } from '../lib/database.types';
import type { Category, Product, CatalogData } from '../types';

export interface CatalogServiceResult<T> {
  data: T | null;
  error: string | null;
}

export const catalogService = {
  /**
   * Fetches the live public catalog (active categories and active products)
   * Starts with an empty catalog if database has no records yet.
   */
  async fetchPublicCatalog(): Promise<CatalogData> {
    const emptyCatalog: CatalogData = {
      schemaVersion: 1,
      shop: {
        name: "Sai Deveena Traders",
        city: "Bhainsa",
        state: "Telangana",
        currency: "INR"
      },
      categories: [],
      products: []
    };

    if (!isSupabaseConfigured()) {
      return emptyCatalog;
    }

    try {
      // 1. Fetch active categories
      const { data: catRows, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catError) {
        console.error('Error fetching categories from Supabase:', catError);
        return emptyCatalog;
      }

      // 2. Fetch active products
      const { data: prodRows, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (prodError) {
        console.error('Error fetching products from Supabase:', prodError);
        return emptyCatalog;
      }

      const categories: Category[] = (catRows as DbCategory[] || []).map(dbToCategory);
      const products: Product[] = (prodRows as DbProduct[] || []).map(dbToProduct);

      return {
        ...emptyCatalog,
        categories,
        products
      };
    } catch (err: any) {
      console.error('Unexpected error loading live catalog from Supabase:', err);
      return emptyCatalog;
    }
  },

  /**
   * Admin: Fetches all categories (including inactive)
   */
  async fetchAllAdminCategories(): Promise<CatalogServiceResult<Category[]>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase credentials not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data as DbCategory[]).map(dbToCategory), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to load categories' };
    }
  },

  /**
   * Admin: Fetches all products (including inactive and out-of-stock)
   */
  async fetchAllAdminProducts(): Promise<CatalogServiceResult<Product[]>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase credentials not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data as DbProduct[]).map(dbToProduct), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to load products' };
    }
  },

  /**
   * Admin: Inserts a new category
   */
  async createCategory(cat: Category, displayOrder: number = 0, isActive: boolean = true): Promise<CatalogServiceResult<Category>> {
    try {
      const dbRow = categoryToDb(cat, displayOrder, isActive);
      const { data, error } = await supabase
        .from('categories')
        .insert(dbRow)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: dbToCategory(data as DbCategory), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create category' };
    }
  },

  /**
   * Admin: Updates an existing category
   */
  async updateCategory(
    id: string,
    cat: Category,
    displayOrder?: number,
    isActive?: boolean
  ): Promise<CatalogServiceResult<Category>> {
    try {
      const dbRow = categoryToDb(cat, displayOrder, isActive);
      const updatePayload: Record<string, any> = {
        name_en: dbRow.name_en,
        name_te: dbRow.name_te,
        icon: dbRow.icon,
        image: dbRow.image,
        description_en: dbRow.description_en,
        description_te: dbRow.description_te,
        display_order: dbRow.display_order,
        is_active: dbRow.is_active
      };

      const { data, error } = await supabase
        .from('categories')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: dbToCategory(data as DbCategory), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update category' };
    }
  },

  /**
   * Admin: Toggles category active status
   */
  async updateCategoryStatus(id: string, isActive: boolean): Promise<CatalogServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) return { data: false, error: error.message };
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to update category status' };
    }
  },

  /**
   * Admin: Deletes a category
   */
  async deleteCategory(id: string): Promise<CatalogServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) return { data: false, error: error.message };
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to delete category' };
    }
  },

  /**
   * Admin: Inserts a new product
   */
  async createProduct(prod: Product): Promise<CatalogServiceResult<Product>> {
    try {
      const dbRow = productToDb(prod);
      const { data, error } = await supabase
        .from('products')
        .insert(dbRow)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: dbToProduct(data as DbProduct), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create product' };
    }
  },

  /**
   * Admin: Updates an existing product
   */
  async updateProduct(id: string, prod: Product): Promise<CatalogServiceResult<Product>> {
    try {
      const dbRow = productToDb(prod);
      const { data, error } = await supabase
        .from('products')
        .update({
          category_id: dbRow.category_id,
          sub_category: dbRow.sub_category,
          name_en: dbRow.name_en,
          name_te: dbRow.name_te,
          brand: dbRow.brand,
          pack_size: dbRow.pack_size,
          price: dbRow.price,
          original_price: dbRow.original_price,
          description_en: dbRow.description_en,
          description_te: dbRow.description_te,
          image: dbRow.image,
          active: dbRow.active,
          featured: dbRow.featured,
          in_stock: dbRow.in_stock,
          key_features: dbRow.key_features,
          usage_en: dbRow.usage_en,
          usage_te: dbRow.usage_te
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: dbToProduct(data as DbProduct), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update product' };
    }
  },

  /**
   * Admin: Deletes a product
   */
  async deleteProduct(id: string): Promise<CatalogServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) return { data: false, error: error.message };
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to delete product' };
    }
  },

  /**
   * Admin: Fast one-click toggle for stock status
   */
  async updateStockStatus(id: string, inStock: boolean): Promise<CatalogServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: inStock })
        .eq('id', id);

      if (error) return { data: false, error: error.message };
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to update stock' };
    }
  },

  /**
   * Verifies if the currently logged-in user is an active administrator in public.admin_users
   */
  async verifyAdminSession(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check admin_users record directly
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error verifying admin session:', err);
      return false;
    }
  },

  /**
   * Generalized image upload to Supabase Storage bucket 'product-images'
   * Validates JPG, PNG, WebP up to 5 MB
   */
  async uploadImage(file: File, folder: 'categories' | 'products' = 'products'): Promise<CatalogServiceResult<string>> {
    try {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return { data: null, error: 'Only JPG, PNG, and WebP image formats are supported.' };
      }

      const maxBytes = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxBytes) {
        return { data: null, error: 'Image size exceeds 5 MB. Please choose a smaller image.' };
      }

      const dotIndex = file.name.lastIndexOf('.');
      const rawBaseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      const fileExt = (dotIndex !== -1 ? file.name.substring(dotIndex + 1) : 'jpg').toLowerCase();
      const sanitizedBase = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase().slice(0, 50) || 'image';
      const fileName = `${Date.now()}_${sanitizedBase}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        const errorMsg = uploadError.message || (uploadError as any).error || '';
        const statusCode = (uploadError as any).statusCode || (uploadError as any).status;
        const errorCode = (uploadError as any).code || '';

        if (
          errorMsg.toLowerCase().includes('bucket not found') ||
          errorCode === 'NoSuchBucket' ||
          statusCode === '404' ||
          (statusCode === 400 && errorMsg.toLowerCase().includes('bucket'))
        ) {
          return {
            data: null,
            error: "Storage bucket 'product-images' not found (HTTP 400). Please create the public bucket 'product-images' in Supabase Storage or run the storage setup SQL."
          };
        }

        if (statusCode === 403 || errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('policy')) {
          return {
            data: null,
            error: 'Storage permission denied. Only authenticated, active administrators can upload images.'
          };
        }

        return {
          data: null,
          error: `Storage upload failed (${statusCode || 'Error'}): ${errorMsg || 'Unknown storage error'}`
        };
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { data: urlData.publicUrl, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to upload image' };
    }
  },

  async uploadProductImage(file: File): Promise<CatalogServiceResult<string>> {
    return this.uploadImage(file, 'products');
  },

  async uploadCategoryImage(file: File): Promise<CatalogServiceResult<string>> {
    return this.uploadImage(file, 'categories');
  }
};
