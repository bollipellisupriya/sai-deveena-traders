import React from 'react';
import { Menu, ArrowLeft, Languages, Phone } from 'lucide-react';
import type { Language } from '../../types';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenMenu: () => void;
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onCallStore?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenMenu,
  currentLang = 'en',
  onLanguageChange,
  onCallStore,
}) => {
  const isTe = currentLang === 'te';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f1f5f9',
      paddingTop: 'calc(0.65rem + env(safe-area-inset-top, 0px))',
      paddingBottom: '0.65rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
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
            fontSize: '1.12rem',
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
          {/* Circular Logo Emblem */}
          <div style={{
            width: '40px',
            height: '40px',
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
              fontSize: '1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}>
              <span style={{ color: '#15803d' }}>SAI</span>
              <span style={{ color: '#ea580c' }}>DEVEENA</span>
            </div>
            <div style={{
              fontSize: '0.56rem',
              fontWeight: 800,
              color: '#64748b',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              marginTop: '1px'
            }}>
              TRADERS • BHAINSA
            </div>
          </div>
        </div>
      )}

      {/* Right Actions: Language Switcher, Quick Call, and Menu Drawer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Compact 1-Tap Language Pill */}
        {onLanguageChange && (
          <button
            type="button"
            onClick={() => onLanguageChange(isTe ? 'en' : 'te')}
            aria-label="Switch Language"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.3rem 0.55rem',
              borderRadius: '9999px',
              backgroundColor: isTe ? '#ecfdf5' : '#f0fdf4',
              border: '1px solid #86efac',
              color: '#15803d',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            <Languages size={13} style={{ color: '#15803d' }} />
            <span>{isTe ? 'ENG' : 'తెలుగు'}</span>
          </button>
        )}

        {/* Quick Phone Call Button */}
        <a
          href="tel:9010454541"
          onClick={(e) => {
            if (onCallStore) {
              e.preventDefault();
              onCallStore();
            }
          }}
          aria-label="Call Sai Deveena Traders"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}
        >
          <Phone size={15} />
        </a>

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMenu}
          aria-label="Menu"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#334155',
            borderRadius: '50%'
          }}
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
};

