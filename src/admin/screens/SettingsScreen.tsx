import React from 'react';
import { Database, Clock } from 'lucide-react';
import { shopConfig } from '../../config/shopConfig';

export const SettingsScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      {/* 1. Supabase Backend Connection Status */}
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
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Supabase Backend Readiness
            </h2>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Phase 1 UI complete. Required credentials for Phase 2:
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
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>VITE_SUPABASE_URL</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Your Supabase project API HTTPS URL</div>
            </div>
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexShrink: 0
            }}>
              <Clock size={12} />
              Pending Phase 2
            </span>
          </div>

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
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>VITE_SUPABASE_ANON_KEY</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Public anon client key with Row Level Security</div>
            </div>
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexShrink: 0
            }}>
              <Clock size={12} />
              Pending Phase 2
            </span>
          </div>
        </div>
      </div>

      {/* 2. Store Details */}
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
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Primary Phone</div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#15803d' }}>{shopConfig.phoneNumber}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Location / City</div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{shopConfig.city}, {shopConfig.state}</div>
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
