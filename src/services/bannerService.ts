import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Banner, BannerInput } from '../types';
import type { DbBanner } from '../lib/database.types';

export interface BannerServiceResult<T> {
  data: T | null;
  error: string | null;
}

export function mapDbBanner(raw: DbBanner): Banner {
  let displayMode: 'full_image' | 'content_overlay' = 'full_image';
  let cleanSubtitleTe = raw.subtitle_te || '';

  if (cleanSubtitleTe.includes('<!--mode:content_overlay-->')) {
    displayMode = 'content_overlay';
    cleanSubtitleTe = cleanSubtitleTe.replace('<!--mode:content_overlay-->', '').trim();
  } else if (cleanSubtitleTe.includes('<!--mode:full_image-->')) {
    displayMode = 'full_image';
    cleanSubtitleTe = cleanSubtitleTe.replace('<!--mode:full_image-->', '').trim();
  } else {
    // If not tagged, default to full_image mode unless subtitle specifically exists
    displayMode = (raw.subtitle_en && raw.subtitle_en.trim().length > 0) ? 'content_overlay' : 'full_image';
  }

  return {
    id: raw.id,
    title: {
      en: raw.title_en || '',
      te: raw.title_te || raw.title_en || ''
    },
    subtitle: {
      en: raw.subtitle_en || '',
      te: cleanSubtitleTe || raw.subtitle_en || ''
    },
    imageDesktop: raw.image_desktop,
    imageMobile: raw.image_mobile || null,
    buttonText: {
      en: raw.button_text_en || 'Shop Now',
      te: raw.button_text_te || 'ఇప్పుడు చూడండి'
    },
    buttonLink: raw.button_link || '#categories',
    isActive: raw.is_active,
    sortOrder: raw.sort_order ?? 0,
    startAt: raw.start_at || null,
    endAt: raw.end_at || null,
    displayMode,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at
  };
}

export const bannerService = {
  /**
   * Public storefront query: Fetches currently active banners within their scheduled date range.
   * Enforced both by Supabase RLS policies and client-side scheduling filters.
   */
  async fetchActiveBanners(): Promise<Banner[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        // If banners table does not exist yet in database, fail silently with empty array
        console.warn('Could not fetch banners from database:', error.message);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const all = (data as DbBanner[]).map(mapDbBanner);

      // Verify active schedule (hide expired or future scheduled banners)
      const now = new Date();
      return all.filter((b) => {
        if (!b.isActive) return false;
        if (b.startAt && new Date(b.startAt) > now) return false;
        if (b.endAt && new Date(b.endAt) < now) return false;
        return true;
      });
    } catch (err) {
      console.warn('Unexpected error in fetchActiveBanners:', err);
      return [];
    }
  },

  /**
   * Admin portal query: Fetches ALL banners (active, inactive, future scheduled, and expired).
   */
  async fetchAllAdminBanners(): Promise<BannerServiceResult<Banner[]>> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: 'Database service is not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      const banners = (data as DbBanner[] || []).map(mapDbBanner);
      return { data: banners, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch admin banners.' };
    }
  },

  /**
   * Admin create banner
   */
  async createBanner(input: BannerInput): Promise<BannerServiceResult<Banner>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database service is not configured.' };
    }

    try {
      const mode = input.displayMode || 'full_image';
      const modeTag = mode === 'content_overlay' ? '<!--mode:content_overlay-->' : '<!--mode:full_image-->';
      const rawSubTe = input.subtitleTe ? input.subtitleTe.trim().replace(/<!--mode:[^>]+-->/g, '') : '';

      const dbPayload = {
        title_en: input.titleEn.trim(),
        title_te: input.titleTe.trim() || input.titleEn.trim(),
        subtitle_en: input.subtitleEn.trim(),
        subtitle_te: `${rawSubTe}${modeTag}`,
        image_desktop: input.imageDesktop.trim(),
        image_mobile: input.imageMobile?.trim() || null,
        button_text_en: input.buttonTextEn.trim() || 'Shop Now',
        button_text_te: input.buttonTextTe.trim() || 'ఇప్పుడు చూడండి',
        button_link: input.buttonLink?.trim() || '#categories',
        is_active: Boolean(input.isActive),
        sort_order: Number(input.sortOrder) || 0,
        start_at: input.startAt ? new Date(input.startAt).toISOString() : null,
        end_at: input.endAt ? new Date(input.endAt).toISOString() : null
      };

      const { data, error } = await supabase
        .from('banners')
        .insert(dbPayload)
        .select('*')
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapDbBanner(data as DbBanner), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create banner.' };
    }
  },

  /**
   * Admin update banner
   */
  async updateBanner(id: string, input: Partial<BannerInput>): Promise<BannerServiceResult<Banner>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database service is not configured.' };
    }

    try {
      const dbPayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (input.titleEn !== undefined) dbPayload.title_en = input.titleEn.trim();
      if (input.titleTe !== undefined) dbPayload.title_te = input.titleTe.trim();
      if (input.subtitleEn !== undefined) dbPayload.subtitle_en = input.subtitleEn.trim();

      if (input.displayMode !== undefined || input.subtitleTe !== undefined) {
        const mode = input.displayMode || 'full_image';
        const modeTag = mode === 'content_overlay' ? '<!--mode:content_overlay-->' : '<!--mode:full_image-->';
        let baseSubTe = input.subtitleTe !== undefined ? input.subtitleTe.trim() : '';
        baseSubTe = baseSubTe.replace(/<!--mode:[^>]+-->/g, '').trim();
        dbPayload.subtitle_te = `${baseSubTe}${modeTag}`;
      }

      if (input.imageDesktop !== undefined) dbPayload.image_desktop = input.imageDesktop.trim();
      if (input.imageMobile !== undefined) dbPayload.image_mobile = input.imageMobile?.trim() || null;
      if (input.buttonTextEn !== undefined) dbPayload.button_text_en = input.buttonTextEn.trim();
      if (input.buttonTextTe !== undefined) dbPayload.button_text_te = input.buttonTextTe.trim();
      if (input.buttonLink !== undefined) dbPayload.button_link = input.buttonLink.trim();
      if (input.isActive !== undefined) dbPayload.is_active = Boolean(input.isActive);
      if (input.sortOrder !== undefined) dbPayload.sort_order = Number(input.sortOrder);
      if (input.startAt !== undefined) dbPayload.start_at = input.startAt ? new Date(input.startAt).toISOString() : null;
      if (input.endAt !== undefined) dbPayload.end_at = input.endAt ? new Date(input.endAt).toISOString() : null;

      const { data, error } = await supabase
        .from('banners')
        .update(dbPayload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapDbBanner(data as DbBanner), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update banner.' };
    }
  },

  /**
   * Admin delete banner
   */
  async deleteBanner(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete banner.' };
    }
  },

  /**
   * Admin toggle banner active status
   */
  async toggleBannerStatus(id: string, isActive: boolean): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const { error } = await supabase
        .from('banners')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update banner status.' };
    }
  },

  /**
   * Admin batch update display sort orders
   */
  async updateBannerSortOrders(items: Array<{ id: string; sortOrder: number }>): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database service is not configured.' };
    }

    try {
      const updates = items.map(it => 
        supabase
          .from('banners')
          .update({ sort_order: it.sortOrder, updated_at: new Date().toISOString() })
          .eq('id', it.id)
      );

      await Promise.all(updates);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update sort orders.' };
    }
  },

  /**
   * Upload desktop or mobile banner image to Supabase Storage bucket 'banners'.
   * Validates file size (max 5 MB) and allowed image MIME types.
   */
  async uploadBannerImage(file: File, variant: 'desktop' | 'mobile' = 'desktop'): Promise<BannerServiceResult<string>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database service is not configured.' };
    }

    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return {
          data: null,
          error: `Invalid file format "${file.type}". Allowed: JPG, PNG, WebP, SVG.`
        };
      }

      const maxBytes = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxBytes) {
        return {
          data: null,
          error: `File size exceeds 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select an optimized banner image.`
        };
      }

      const dotIndex = file.name.lastIndexOf('.');
      const fileExt = dotIndex !== -1 ? file.name.substring(dotIndex + 1).toLowerCase() : 'jpg';
      const sanitizedBase = (dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase()
        .slice(0, 40) || 'banner';

      const fileName = `${variant}_${Date.now()}_${sanitizedBase}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to 'banners' bucket
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        const errorMsg = uploadError.message || (uploadError as any).error || '';
        const statusCode = (uploadError as any).statusCode || (uploadError as any).status;

        // If 'banners' bucket does not exist yet, attempt fallback to 'product-images' bucket
        if (
          errorMsg.toLowerCase().includes('bucket not found') ||
          (uploadError as any).code === 'NoSuchBucket' ||
          statusCode === 404 ||
          (statusCode === 400 && errorMsg.toLowerCase().includes('bucket'))
        ) {
          console.warn("Storage bucket 'banners' not found. Attempting upload to 'product-images/banners'...");
          const fallbackPath = `banners/${fileName}`;
          const { error: fallbackError } = await supabase.storage
            .from('product-images')
            .upload(fallbackPath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (fallbackError) {
            return {
              data: null,
              error: "Storage bucket 'banners' not found. Please execute the SQL migration or create the public bucket 'banners' in Supabase Storage."
            };
          }

          const { data: fallbackUrl } = supabase.storage
            .from('product-images')
            .getPublicUrl(fallbackPath);

          return { data: fallbackUrl.publicUrl, error: null };
        }

        if (statusCode === 403 || errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('policy')) {
          return {
            data: null,
            error: 'Storage permission denied. Only authenticated, active administrators can upload banner images.'
          };
        }

        return {
          data: null,
          error: `Banner upload failed: ${errorMsg || 'Unknown error'}`
        };
      }

      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      return { data: urlData.publicUrl, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to upload banner image.' };
    }
  }
};
