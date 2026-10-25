import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X, MapPin } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../translations';
import { shopConfig } from '../config/shopConfig';
import { getGeneralWhatsappUrl, getPhoneDialUrl } from '../utils/whatsapp';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLang];
  const { url: phoneUrl, isConfigured: isPhoneReady } = getPhoneDialUrl();
  const { url: whatsappUrl, isConfigured: isWhatsappReady } = getGeneralWhatsappUrl(currentLang);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
    }}>
      {/* Top Location & Notice Bar with subtle green-to-orange gradient line */}
      <div style={{
        background: 'linear-gradient(90deg, #14532d 0%, #15803d 60%, #c2410c 100%)',
        color: '#f8fafc',
        padding: '0.4rem 1rem',
        fontSize: '0.82rem',
        fontWeight: 600
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <MapPin size={14} style={{ color: '#fdba74', flexShrink: 0 }} />
            <span>
              {currentLang === 'te' 
                ? 'భైంసా, నిర్మల్ జిల్లా, తెలంగాణ 504103' 
                : 'Bhainsa, Nirmal District, Telangana 504103'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem'
      }}>
        {/* Official Brand Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0
          }}
          aria-label={t.nav.home}
        >
          <img
            src="/logo.png?v=4"
            alt="Sai Deveena Traders & General Store"
            className="navbar-brand-logo"
            style={{
              height: '84px',
              maxWidth: '380px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              transition: 'transform 0.2s ease',
              imageRendering: 'auto'
            }}
          />
        </button>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '1.75rem',
        }} className="desktop-nav">
          <button onClick={() => handleNavClick('hero')} className="nav-link">{t.nav.home}</button>
          <button onClick={() => handleNavClick('categories')} className="nav-link">{t.nav.categories}</button>
          <button onClick={() => handleNavClick('catalogue')} className="nav-link">{t.nav.products}</button>
          <button onClick={() => handleNavClick('about')} className="nav-link">{t.nav.about}</button>
        </nav>

        {/* Right Actions: Language Switcher & Quick Contact */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Language Toggle with Smooth Styling */}
          <div style={{
            display: 'inline-flex',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#f1f5f9',
            border: '1.5px solid var(--border-light)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
          }} role="group" aria-label={t.nav.langSelect}>
            <button
              onClick={() => onLanguageChange('en')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.82rem',
                fontWeight: currentLang === 'en' ? 800 : 600,
                color: currentLang === 'en' ? 'white' : 'var(--text-secondary)',
                background: currentLang === 'en' ? 'linear-gradient(135deg, #15803d, #14532d)' : 'transparent',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: currentLang === 'en' ? '0 2px 6px rgba(22, 101, 52, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
              aria-pressed={currentLang === 'en'}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('te')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.82rem',
                fontWeight: currentLang === 'te' ? 800 : 600,
                color: currentLang === 'te' ? 'white' : 'var(--text-secondary)',
                background: currentLang === 'te' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'transparent',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: currentLang === 'te' ? '0 2px 6px rgba(234, 88, 12, 0.3)' : 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-telugu)'
              }}
              aria-pressed={currentLang === 'te'}
            >
              తెలుగు
            </button>
          </div>

          {/* Quick Call Button (Desktop) */}
          <a
            href={phoneUrl}
            className="btn btn-phone header-call-btn"
            style={{
              padding: '0.55rem 1.05rem',
              fontSize: '0.85rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-full)'
            }}
            title={isPhoneReady ? `Call ${shopConfig.phoneNumber}` : t.contact.callCard.notConfigured}
            onClick={(e) => {
              if (!isPhoneReady) {
                e.preventDefault();
                handleNavClick('contact');
              }
            }}
          >
            <Phone size={15} />
            <span>{t.nav.callUs}</span>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              background: 'white',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--primary-950)',
              boxShadow: 'var(--shadow-xs)'
            }}
            className="mobile-menu-btn"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'white',
          borderBottom: '3px solid #16a34a',
          padding: '1.25rem 1.25rem 1.75rem',
          boxShadow: 'var(--shadow-xl)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={() => handleNavClick('hero')} className="mobile-nav-link">
              {t.nav.home}
            </button>
            <button onClick={() => handleNavClick('categories')} className="mobile-nav-link">
              {t.nav.categories}
            </button>
            <button onClick={() => handleNavClick('catalogue')} className="mobile-nav-link">
              {t.nav.products}
            </button>
            <button onClick={() => handleNavClick('about')} className="mobile-nav-link">
              {t.nav.about}
            </button>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)'
            }}>
              <a
                href={phoneUrl}
                className="btn btn-phone"
                style={{ width: '100%', fontSize: '0.9rem' }}
                onClick={(e) => {
                  if (!isPhoneReady) {
                    e.preventDefault();
                    handleNavClick('contact');
                  }
                }}
              >
                <Phone size={16} />
                <span>{t.hero.callBtn}</span>
              </a>
              <a
                href={whatsappUrl}
                target={isWhatsappReady ? "_blank" : undefined}
                rel={isWhatsappReady ? "noopener noreferrer" : undefined}
                className="btn btn-whatsapp"
                style={{ width: '100%', fontSize: '0.9rem' }}
                onClick={(e) => {
                  if (!isWhatsappReady) {
                    e.preventDefault();
                    handleNavClick('contact');
                  }
                }}
              >
                <MessageCircle size={16} />
                <span>{currentLang === 'te' ? 'వాట్సాప్' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-link {
          background: none;
          border: none;
          font-weight: 700;
          color: var(--text-secondary);
          font-size: 0.96rem;
          cursor: pointer;
          padding: 0.5rem 0.25rem;
          transition: all 0.15s ease;
          position: relative;
        }
        .nav-link:hover {
          color: var(--primary-800);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: #ea580c;
          transition: all 0.2s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .mobile-nav-link {
          background: none;
          border: none;
          text-align: left;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--primary-950);
          padding: 0.65rem 0;
          cursor: pointer;
          border-bottom: 1px solid var(--border-subtle);
        }
        .mobile-nav-link:hover {
          color: var(--orange-600);
          padding-left: 0.5rem;
          transition: all 0.2s ease;
        }
        @media (max-width: 1024px) {
          .navbar-brand-logo {
            height: 72px !important;
            max-width: 300px !important;
          }
        }
        @media (max-width: 640px) {
          .navbar-brand-logo {
            height: 58px !important;
            max-width: 250px !important;
          }
        }
        @media (max-width: 400px) {
          .navbar-brand-logo {
            height: 48px !important;
            max-width: 200px !important;
          }
        }
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-call-btn {
            display: inline-flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
