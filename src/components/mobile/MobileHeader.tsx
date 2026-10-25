import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenMenu: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenMenu,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f1f5f9',
      padding: '0.65rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Left: Either Back Button + Title or Brand Logo Emblem */}
      {showBack ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1e293b'
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title || 'Sai Deveena'}
          </h1>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Circular Logo Emblem without cut S */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(22, 101, 52, 0.18), 0 0 0 1.5px rgba(234, 88, 12, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img
              src="/logo-icon.png?v=7"
              alt="Sai Deveena Traders Emblem"
              style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            />
          </div>

          {/* Clean Typography */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem',
              fontWeight: 900,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}>
              <span style={{ color: '#15803d' }}>SAI</span>
              <span style={{ color: '#ea580c' }}>DEVEENA</span>
            </div>
            <div style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              color: '#64748b',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              marginTop: '1px'
            }}>
              TRADERS & GENERAL STORE
            </div>
          </div>
        </div>
      )}

      {/* Right Action: Clean Menu Drawer button only */}
      <button
        onClick={onOpenMenu}
        aria-label="Menu"
        style={{
          background: 'none',
          border: 'none',
          padding: '0.45rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#334155',
          borderRadius: '50%'
        }}
      >
        <Menu size={23} />
      </button>
    </header>
  );
};
