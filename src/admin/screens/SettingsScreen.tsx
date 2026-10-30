import React, { useState, useEffect } from 'react';
import { Database, Truck, CheckCircle2, AlertCircle, RefreshCw, Save, MessageCircle } from 'lucide-react';
import { shopConfig } from '../../config/shopConfig';
import { orderService } from '../../services/orderService';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { StoreSettings } from '../../types';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    id: 'default',
    freeDeliveryThreshold: 199,
    deliveryFee: 50,
    deliveryEnabled: true,
    businessWhatsappNumber: '919010454541'
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load live delivery settings from Supabase
  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      setLoading(true);
      try {
        const live = await orderService.fetchDeliverySettings();
        if (mounted) setSettings(live);
      } catch (e) {
        console.warn('Failed to load live settings:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveDeliverySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    const res = await orderService.updateDeliverySettings({
      freeDeliveryThreshold: Number(settings.freeDeliveryThreshold),
      deliveryFee: Number(settings.deliveryFee),
      deliveryEnabled: Boolean(settings.deliveryEnabled),
      businessWhatsappNumber: settings.businessWhatsappNumber.trim()
    });

    setSaving(false);
    if (res.error) {
      setToast({ message: `Error updating settings: ${res.error}`, type: 'error' });
    } else {
      setToast({ message: 'Delivery settings saved and updated successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '840px' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          backgroundColor: toast.type === 'success' ? '#15803d' : '#dc2626',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Delivery Charge & Threshold Configuration */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Delivery Fee & Threshold Configuration
            </h2>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Dynamic delivery charge rules applied at checkout and verified server-side in Supabase.
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem', color: '#15803d' }} />
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Loading store settings from Supabase...</div>
          </div>
        ) : (
          <form onSubmit={handleSaveDeliverySettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Free Delivery Minimum */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  Free Delivery Minimum (₹)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Cart subtotal of ₹{settings.freeDeliveryThreshold} or above gets <strong>FREE delivery</strong>.
                </div>
              </div>

              {/* Delivery Fee Below Minimum */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  Delivery Charge Below Minimum (₹)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Fee charged when subtotal is below ₹{settings.freeDeliveryThreshold}.
                </div>
              </div>

              {/* Business WhatsApp Number for Order Confirmation */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  Business WhatsApp Contact Number
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MessageCircle size={16} style={{ position: 'absolute', left: '0.85rem', color: '#25D366' }} />
                  <input
                    type="text"
                    required
                    placeholder="919010454541"
                    value={settings.businessWhatsappNumber}
                    onChange={(e) => setSettings({ ...settings, businessWhatsappNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Customers send WhatsApp confirmations to this phone.
                </div>
              </div>
            </div>

            {/* Enable / Disable Delivery Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                  Enable Home & Farm Doorstep Delivery
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  When disabled, orders are for in-store pickup only with ₹0 delivery charge.
                </div>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.deliveryEnabled}
                  onChange={(e) => setSettings({ ...settings, deliveryEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#15803d' }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: settings.deliveryEnabled ? '#15803d' : '#64748b' }}>
                  {settings.deliveryEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {/* Save Button */}
            <div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
                }}
              >
                {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                <span>{saving ? 'Saving to Database...' : 'Save & Update Delivery Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Supabase Backend Status */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: isConfigured ? '#dcfce7' : '#fef3c7',
            color: isConfigured ? '#15803d' : '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Supabase Backend Status
            </h2>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Connection status to Sai Deveena Traders database
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Database Environment</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>PostgreSQL + Row Level Security (RLS)</div>
            </div>
            <span style={{
              backgroundColor: isConfigured ? '#dcfce7' : '#fee2e2',
              color: isConfigured ? '#15803d' : '#dc2626',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {isConfigured ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {isConfigured ? 'Connected & Active' : 'Credentials Missing'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Store Profile & Shop Details */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem' }}>
          Store Profile & Configuration
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Business Name</div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{shopConfig.shopName.en}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Primary Orders Phone</div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#15803d' }}>{shopConfig.phoneNumber}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Location / City</div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{shopConfig.city}, {shopConfig.state} ({shopConfig.pincode})</div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Operating Hours</div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{shopConfig.openingHours.en}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
