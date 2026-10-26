import React from 'react';
import { X, Home, LayoutGrid, ShoppingBag, Info, Phone, MessageCircle, MapPin, Globe, ShieldCheck, User } from 'lucide-react';
import type { Language } from '../../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'home' | 'categories' | 'orders' | 'profile') => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAdmin?: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentLang,
  onLanguageChange,
  onOpenAdmin
}) => {
  if (!isOpen) return null;
  const isTe = currentLang === 'te';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 110,
      display: 'flex',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '82%',
        maxWidth: '340px',
        backgroundColor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '10px 0 30px rgba(0,0,0,0.2)',
        overflowY: 'auto'
      }}>
        {/* Drawer Header with Logo & Close */}
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.2)',
              border: '1.5px solid #ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/logo-icon.png?v=6" alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#15803d' }}>
                SAI DEVEENA
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b' }}>
                TRADERS & GENERAL STORE
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Official Banner Image */}
        <div style={{ padding: '0.85rem 1rem 0.5rem', backgroundColor: '#f1f5f9' }}>
          <img
            src="/logo.png?v=6"
            alt="Official Banner"
            style={{ width: '100%', height: 'auto', maxHeight: '55px', objectFit: 'contain' }}
          />
        </div>

        {/* Language Selection Bar */}
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.45rem',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#64748b'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={14} /> Language / భాష
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.45rem'
          }}>
            <button
              onClick={() => onLanguageChange('en')}
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                border: currentLang === 'en' ? '2px solid #15803d' : '1px solid #cbd5e1',
                backgroundColor: currentLang === 'en' ? '#dcfce7' : '#ffffff',
                color: currentLang === 'en' ? '#15803d' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('te')}
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                border: currentLang === 'te' ? '2px solid #15803d' : '1px solid #cbd5e1',
                backgroundColor: currentLang === 'te' ? '#dcfce7' : '#ffffff',
                color: currentLang === 'te' ? '#15803d' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              తెలుగు
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
          <button
            onClick={() => {
              onNavigateTab('home');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Home size={19} style={{ color: '#15803d' }} />
            <span>{isTe ? 'హోమ్' : 'Home'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateTab('categories');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LayoutGrid size={19} style={{ color: '#15803d' }} />
            <span>{isTe ? 'విభాగాలు & ఉత్పత్తులు' : 'Categories & Products'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateTab('orders');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ShoppingBag size={19} style={{ color: '#15803d' }} />
            <span>{isTe ? 'నా ఆర్డర్లు' : 'My Orders'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateTab('profile');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <User size={19} style={{ color: '#15803d' }} />
            <span>{isTe ? 'రైతు ఖాతా (లాగిన్ / నమోదు)' : 'Farmer Account (Sign In / Register)'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateTab('profile');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Info size={19} style={{ color: '#15803d' }} />
            <span>{isTe ? 'దుకాణం వివరాలు & సంప్రదించండి' : 'Store Info & Contact'}</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '0.5rem',
                borderTop: '1px dashed #e2e8f0'
              }}
            >
              <ShieldCheck size={18} style={{ color: '#0f172a' }} />
              <span>Admin Portal (Login)</span>
            </button>
          )}
        </div>

        {/* Drawer Footer with Quick Calls */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={14} style={{ color: '#ea580c' }} />
            <span>Bhainsa, Nirmal Dist, Telangana</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <a
              href="https://wa.me/919010454541"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0.55rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:9010454541"
              style={{
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.55rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                textDecoration: 'none'
              }}
            >
              <Phone size={14} />
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div style={{ flex: 1 }} onClick={onClose} />
    </div>
  );
};
