import React from 'react';
import { Menu, ArrowLeft, Languages, Phone } from 'lucide-react';
import type { Language } from '../../types';
import type { TabType } from './MobileBottomNav';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenMenu: () => void;
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onCallStore?: () => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenMenu,
  currentLang = 'en',
  onLanguageChange,
  onCallStore,
  activeTab = 'home',
  onTabChange,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
}) => {
  const isTe = currentLang === 'te';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      borderBottom: '1.5px solid rgba(134, 239, 172, 0.35)',
      paddingTop: 'calc(0.7rem + env(safe-area-inset-top, 0px))',
      paddingBottom: '0.7rem',
      paddingLeft: '1.25rem',
      paddingRight: '1.25rem',
      boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.07)'
    }}>
      <div className="header-inner-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
      {/* Left: Either Back Button + Title or Brand Logo Emblem */}
      {showBack ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#15803d',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={19} />
          </button>
          <h1 style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '380px'
          }}>
            {title || 'Sai Deveena Traders & General Store'}
          </h1>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Circular Logo Emblem with glowing gradient ring */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 2px #22c55e, 0 4px 14px rgba(22, 163, 74, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img
              src="/logo-icon.png?v=7"
              alt="Sai Deveena Traders & General Store Emblem"
              style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            />
          </div>

          {/* Clean Premium Typography */}
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
              <span style={{
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                SAI DEVEENA
              </span>
            </div>
            <div style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              color: '#166534',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              marginTop: '1px',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap'
            }}>
              <span>TRADERS & GENERAL STORE</span>
            </div>
          </div>
        </div>
      )}



      {/* Desktop Navigation Links (Visible only on tablets & desktops >= 768px) */}
      {onTabChange && (
        <nav className="desktop-only-nav" style={{ alignItems: 'center', gap: '0.5rem', margin: '0 0.5rem' }}>
          {[
            { id: 'home', label: isTe ? 'హోమ్' : 'Home' },
            { id: 'categories', label: isTe ? 'విభాగాలు' : 'Categories' },
            { id: 'orders', label: isTe ? 'ఆర్డర్లు' : 'Orders' },
            { id: 'profile', label: isTe ? 'దుకాణం వివరాలు' : 'Store Profile' }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as TabType)}
                style={{
                  backgroundColor: isActive ? '#dcfce7' : 'transparent',
                  color: isActive ? '#14532d' : '#475569',
                  border: isActive ? '1.5px solid #86efac' : '1.5px solid transparent',
                  borderRadius: '9999px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 8px rgba(22, 163, 74, 0.12)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Actions: Language Switcher, Quick Call, and Menu Drawer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Compact 1-Tap Language Pill */}
        {onLanguageChange && (
          <button
            type="button"
            onClick={() => onLanguageChange(isTe ? 'en' : 'te')}
            aria-label="Switch Language"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: isTe ? '#ecfdf5' : '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#15803d',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              lineHeight: 1,
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            <Languages size={14} style={{ color: '#15803d' }} />
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
          aria-label="Call Sai Deveena Traders & General Store"
          style={{
            height: '34px',
            borderRadius: '9999px',
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #86efac',
            color: '#15803d',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0 0.75rem',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.1)'
          }}
        >
          <Phone size={14} style={{ color: '#ea580c' }} />
          <span className="desktop-only-call-text">9010454541</span>
        </a>

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMenu}
          aria-label="Menu"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1e293b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <Menu size={19} />
        </button>
      </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .desktop-only-call-text {
            display: none !important;
          }
        }
        @media (max-width: 860px) {
          .desktop-header-search {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

