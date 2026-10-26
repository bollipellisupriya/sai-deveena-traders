import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { DbCustomerProfile } from '../lib/database.types';

export interface CustomerAuthResult<T> {
  data: T | null;
  error: string | null;
}

export interface CustomerUser {
  id: string;
  phone?: string;
  email?: string | null;
  fullName: string;
  villageOrCity?: string;
  preferredLanguage?: 'en' | 'te';
  status?: 'active' | 'suspended' | 'inactive';
}

export interface CustomerStatusCheck {
  isAllowed: boolean;
  status: 'active' | 'suspended' | 'inactive' | 'unauthenticated' | 'unverified';
  error?: string;
  customer?: CustomerUser;
}

export const customerAuthService = {
  /**
   * Normalizes and formats a mobile number to international E.164 format (defaults to India +91)
   */
  formatPhoneNumber(input: string): string {
    const cleaned = input.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleaned) return '';

    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // If starts with 91 and has 12 digits
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }

    // Standard 10-digit Indian mobile number
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    return cleaned;
  },

  /**
   * Validates whether the current customer has an active, valid Supabase session
   * AND an 'active' profile status in public.customer_profiles.
   * Fails closed if session is missing, profile record is missing, or status is suspended/inactive.
   */
  async validateCustomerStatus(): Promise<CustomerStatusCheck> {
    if (!isSupabaseConfigured()) {
      return { isAllowed: false, status: 'unverified', error: 'Database service is not configured.' };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { isAllowed: false, status: 'unauthenticated' };
      }

      // Query customer_profiles to confirm status
      const { data: profileRow, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.warn('Could not verify customer profile status from database:', error);
        return {
          isAllowed: false,
          status: 'unverified',
          error: 'Unable to verify account status. Please check your network and try again.'
        };
      }

      if (!profileRow) {
        // Fail closed if customer profile is missing
        return {
          isAllowed: false,
          status: 'unverified',
          error: 'Customer profile record was not found. Please verify your phone number again.'
        };
      }

      const profile = profileRow as DbCustomerProfile;
      const customerUser: CustomerUser = {
        id: session.user.id,
        phone: profile.phone || session.user.phone || undefined,
        email: session.user.email || profile.email || null,
        fullName: profile.full_name || session.user.user_metadata?.full_name || 'Customer',
        villageOrCity: profile.village_or_city || undefined,
        preferredLanguage: profile.preferred_language || 'en',
        status: profile.status
      };

      if (profile.status === 'suspended') {
        return {
          isAllowed: false,
          status: 'suspended',
          customer: customerUser,
          error: 'Your account has been suspended by store administration. Please contact support at 9010454541.'
        };
      }

      if (profile.status === 'inactive') {
        return {
          isAllowed: false,
          status: 'inactive',
          customer: customerUser,
          error: 'Your account is currently inactive. Please contact store support at 9010454541.'
        };
      }

      if (profile.status !== 'active') {
        return {
          isAllowed: false,
          status: 'unverified',
          customer: customerUser,
          error: 'Account status could not be verified. Please contact store support at 9010454541.'
        };
      }

      return {
        isAllowed: true,
        status: 'active',
        customer: customerUser
      };
    } catch (err: any) {
      console.warn('Exception during customer status verification:', err);
      return {
        isAllowed: false,
        status: 'unverified',
        error: 'Failed to verify account status.'
      };
    }
  },

  /**
   * Fast check if a customer currently has an active, persistent Supabase session
   * and valid 'active' status in public.customer_profiles (fails closed if suspended)
   */
  async isAuthenticated(): Promise<boolean> {
    const check = await this.validateCustomerStatus();
    return check.isAllowed;
  },

  /**
   * Send SMS OTP verification code to customer's mobile number via Supabase Auth
   * Automatically handles both existing customer sign-in and new customer registration
   * without creating duplicate accounts or requiring passwords
   */
  async sendPhoneOtp(phone: string): Promise<{ success: boolean; formattedPhone: string; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, formattedPhone: '', error: 'Database service is not configured.' };
    }

    const formattedPhone = this.formatPhoneNumber(phone);
    if (!/^\+[1-9]\d{9,14}$/.test(formattedPhone)) {
      return {
        success: false,
        formattedPhone,
        error: 'Please enter a valid 10-digit mobile number.'
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms'
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || (error as any).status === 429) {
          return {
            success: false,
            formattedPhone,
            error: 'Too many OTP requests. Please wait a minute before requesting another code.'
          };
        }
        return { success: false, formattedPhone, error: error.message };
      }

      return { success: true, formattedPhone, error: null };
    } catch (err: any) {
      return { success: false, formattedPhone, error: err.message || 'Failed to send verification code.' };
    }
  },

  /**
   * Verify the 6-digit SMS OTP code and securely log in / register the customer
   * Never treats entering a phone number as identity proof without successful OTP verification
   */
  async verifyPhoneOtp(
    phone: string,
    token: string,
    profileData?: {
      fullName?: string;
      villageOrCity?: string;
      preferredLanguage?: 'en' | 'te';
    }
  ): Promise<{ user: CustomerUser | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Database service is not configured.' };
    }

    const formattedPhone = this.formatPhoneNumber(phone);
    const cleanToken = token.trim().replace(/\D/g, '');

    if (cleanToken.length !== 6) {
      return { user: null, error: 'Please enter the 6-digit verification code.' };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: cleanToken,
        type: 'sms'
      });

      if (error) {
        if (error.message.toLowerCase().includes('expired')) {
          return { user: null, error: 'Verification code has expired. Please request a new code.' };
        }
        return { user: null, error: 'Incorrect verification code. Please check your SMS and try again.' };
      }

      if (!data.user) {
        return { user: null, error: 'Verification succeeded but user session could not be established.' };
      }

      const authUser = data.user;
      const finalName = profileData?.fullName?.trim() || authUser.user_metadata?.full_name || 'Customer';
      const finalVillage = profileData?.villageOrCity?.trim() || authUser.user_metadata?.village_or_city || null;
      const finalLang = profileData?.preferredLanguage || 'en';

      // Check customer profile status immediately after OTP verification
      const { data: profileRow } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const profile = profileRow as DbCustomerProfile | null;

      if (profile && (profile.status === 'suspended' || profile.status === 'inactive')) {
        await supabase.auth.signOut();
        return {
          user: null,
          error: profile.status === 'suspended'
            ? 'Your account has been suspended by store administration. Please contact support at 9010454541.'
            : 'Your account is currently inactive. Please contact store support at 9010454541.'
        };
      }

      // Safely update customer profile created by the database Auth trigger
      try {
        await supabase
          .from('customer_profiles')
          .update({
            phone: formattedPhone,
            full_name: finalName,
            village_or_city: finalVillage,
            preferred_language: finalLang
          })
          .eq('id', authUser.id);
      } catch (updateErr) {
        console.warn('Could not update customer profile directly (non-blocking):', updateErr);
      }

      // Update auth user metadata for fallback sync
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: finalName,
            village_or_city: finalVillage,
            preferred_language: finalLang
          }
        });
      } catch {}

      const customerUser: CustomerUser = {
        id: authUser.id,
        phone: formattedPhone,
        email: authUser.email || null,
        fullName: finalName,
        villageOrCity: finalVillage || undefined,
        preferredLanguage: finalLang,
        status: profile?.status || 'active'
      };

      return { user: customerUser, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'OTP verification failed.' };
    }
  },

  /**
   * Log out current customer
   */
  async logoutCustomer(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Logout failed' };
    }
  },

  /**
   * Get current authenticated customer details from persistent session
   */
  async getCurrentCustomer(): Promise<CustomerUser | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Try reading from customer_profiles
      const { data: profileRow } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const profile = profileRow as DbCustomerProfile | null;

      return {
        id: user.id,
        phone: profile?.phone || user.phone || undefined,
        email: user.email || profile?.email || null,
        fullName: profile?.full_name || user.user_metadata?.full_name || 'Customer',
        villageOrCity: profile?.village_or_city || user.user_metadata?.village_or_city,
        preferredLanguage: profile?.preferred_language || user.user_metadata?.preferred_language || 'en',
        status: profile?.status
      };
    } catch (err) {
      console.warn('Could not load customer profile:', err);
      return null;
    }
  },

  /**
   * Update customer profile details
   */
  async updateCustomerProfile(
    userId: string,
    updates: { fullName?: string; phone?: string; villageOrCity?: string; preferredLanguage?: 'en' | 'te' }
  ): Promise<CustomerAuthResult<CustomerUser>> {
    try {
      const dbPayload: Partial<DbCustomerProfile> = {};
      if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
      if (updates.phone !== undefined) dbPayload.phone = updates.phone;
      if (updates.villageOrCity !== undefined) dbPayload.village_or_city = updates.villageOrCity;
      if (updates.preferredLanguage !== undefined) dbPayload.preferred_language = updates.preferredLanguage;

      const { data, error } = await supabase
        .from('customer_profiles')
        .update(dbPayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      const row = data as DbCustomerProfile;
      return {
        data: {
          id: row.id,
          phone: row.phone || undefined,
          email: row.email || null,
          fullName: row.full_name,
          villageOrCity: row.village_or_city || undefined,
          preferredLanguage: row.preferred_language
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update profile' };
    }
  }
};
