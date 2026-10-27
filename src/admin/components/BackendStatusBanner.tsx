import React from 'react';
import { Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface BackendStatusBannerProps {
  onLearnMore?: () => void;
}

export const BackendStatusBanner: React.FC<BackendStatusBannerProps> = ({ onLearnMore }) => {
  const configured = isSupabaseConfigured();

  if (configured) {
    return (
      <aside
        aria-label="Backend status"
        style={{
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.45rem 0.85rem',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.45rem',
          zIndex: 25,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '0.12rem 0.45rem',
            borderRadius: '9999px',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap'
          }}>
            <Database size={11} />
            SUPABASE CONNECTED
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
            Live PostgreSQL catalog active with RLS.
          </span>
        </div>

        {onLearnMore && (
          <button
            onClick={onLearnMore}
            style={{
              background: 'none',
              border: 'none',
              color: '#15803d',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              flexShrink: 0
            }}
          >
            Settings →
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside
      aria-label="Backend status"
      style={{
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #fde68a',
        color: '#92400e',
        padding: '0.45rem 0.85rem',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.45rem',
        zIndex: 25,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, flexWrap: 'wrap', minWidth: 0 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          backgroundColor: '#f59e0b',
          color: '#ffffff',
          padding: '0.12rem 0.45rem',
          borderRadius: '9999px',
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap'
        }}>
          <Database size={11} />
          CONFIG REQUIRED
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
          Supabase credentials required for live sync.
        </span>
      </div>

      {onLearnMore && (
        <button
          onClick={onLearnMore}
          style={{
            background: 'none',
            border: 'none',
            color: '#b45309',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            flexShrink: 0
          }}
        >
          Guide →
        </button>
      )}
    </aside>
  );
};
