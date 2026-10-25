import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

interface BackendStatusBannerProps {
  onLearnMore?: () => void;
}

export const BackendStatusBanner: React.FC<BackendStatusBannerProps> = ({ onLearnMore }) => {
  return (
    <aside
      aria-label="Admin Phase 1 notice"
      style={{
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #fde68a',
        color: '#92400e',
        padding: '0.55rem 1.25rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        zIndex: 40
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 600 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          backgroundColor: '#f59e0b',
          color: '#ffffff',
          padding: '0.15rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.03em'
        }}>
          <Database size={12} />
          PHASE 1 UI FOUNDATION
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0 }} />
          Database connection is pending (Phase 2 setup). You are viewing the UI layout with static catalog data.
        </span>
      </div>

      {onLearnMore && (
        <button
          onClick={onLearnMore}
          style={{
            background: 'none',
            border: 'none',
            color: '#b45309',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          View Phase 2 Setup Guide →
        </button>
      )}
    </aside>
  );
};
