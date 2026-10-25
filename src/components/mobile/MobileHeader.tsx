import React from 'react';
import { Search, Menu, ArrowLeft, Phone } from 'lucide-react';
import type { Language } from '../../types';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenMenu: () => void;
  onSearchClick: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenMenu,
  onSearchClick,
  currentLang,
  onLanguageChange
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f1f5f9',
      padding: '0.6rem 0.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
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
              src="/logo-icon.png?v=6"
              alt="Sai Deveena Traders"
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
              fontSize: '1.02rem',
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
              TRADERS & GENERAL STORE
            </div>
          </div>
        </div>
      )}

      {/* Right Actions: Quick Language Toggle, Search, Call, Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {/* Quick Language Toggle Pill */}
        <button
          onClick={() => onLanguageChange(currentLang === 'en' ? 'te' : 'en')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.55rem',
            borderRadius: '9999px',
            border: '1.5px solid #16a34a',
            backgroundColor: currentLang === 'te' ? '#f0fdf4' : '#ffffff',
            color: '#15803d',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
          title="Switch Language"
        >
          <span>{currentLang === 'te' ? 'English' : 'తెలుగు'}</span>
        </button>

        {/* Search Icon */}
        <button
          onClick={onSearchClick}
          aria-label="Search"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#334155'
          }}
        >
          <Search size={20} />
        </button>

        {/* Quick Call Button */}
        <a
          href="tel:9010454541"
          aria-label="Call Shop"
          style={{
            background: '#dcfce7',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803d',
            textDecoration: 'none'
          }}
        >
          <Phone size={15} />
        </a>

        {/* Menu Icon */}
        <button
          onClick={onOpenMenu}
          aria-label="Menu"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#334155'
          }}
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
};
