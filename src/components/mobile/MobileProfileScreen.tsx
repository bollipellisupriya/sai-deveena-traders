import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Headphones } from 'lucide-react';
import type { Language } from '../../types';
import { shopConfig } from '../../config/shopConfig';

interface MobileProfileScreenProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const MobileProfileScreen: React.FC<MobileProfileScreenProps> = ({
  currentLang,
  onLanguageChange
}) => {
  const isTe = currentLang === 'te';

  return (
    <div style={{ padding: '1rem', paddingBottom: '6rem', backgroundColor: '#f8fafc' }}>
      {/* Brand Profile Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 14px rgba(22, 101, 52, 0.2)',
          border: '2px solid #ea580c',
          margin: '0 auto 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px'
        }}>
          <img
            src="/logo-icon.png?v=6"
            alt="Sai Deveena Traders"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <h2 style={{
          fontSize: '1.2rem',
          fontWeight: 900,
          color: '#14532d',
          marginBottom: '0.2rem'
        }}>
          {shopConfig.shopName[currentLang]}
        </h2>
        <div style={{
          fontSize: '0.74rem',
          fontWeight: 800,
          color: '#ea580c',
          letterSpacing: '0.04em',
          marginBottom: '0.75rem'
        }}>
          TRADERS & GENERAL STORE • BHAINSA
        </div>

        {/* Language Switcher Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          borderRadius: '9999px',
          padding: '0.25rem',
          border: '1px solid #cbd5e1'
        }}>
          <button
            onClick={() => onLanguageChange('en')}
            style={{
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: currentLang === 'en' ? '#15803d' : 'transparent',
              color: currentLang === 'en' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('te')}
            style={{
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: currentLang === 'te' ? '#15803d' : 'transparent',
              color: currentLang === 'te' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* Shop Details List */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        {/* Contact 1 */}
        <a
          href="tel:9010454541"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem',
            borderBottom: '1px solid #f1f5f9',
            textDecoration: 'none',
            color: '#0f172a'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Phone size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isTe ? 'ఉత్పత్తుల విక్రయాలు & ఆర్డర్లు' : 'Product Sales & Orders'}
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#15803d' }}>
              9010454541
            </div>
          </div>
        </a>

        {/* Support 2 */}
        <a
          href="tel:9014397044"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem',
            borderBottom: '1px solid #f1f5f9',
            textDecoration: 'none',
            color: '#0f172a'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Headphones size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isTe ? 'కస్టమర్ సపోర్ట్ హెల్ప్‌లైన్' : 'Customer Support Helpline'}
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7' }}>
              9014397044
            </div>
          </div>
        </a>

        {/* Address */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          padding: '1rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#ffedd5',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MapPin size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isTe ? 'దుకాణం చిరునామా' : 'Store Location'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>
              {shopConfig.address[currentLang]}
            </div>
            {shopConfig.googleMapsUrl && (
              <a
                href={shopConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: '#ea580c',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  marginTop: '0.35rem',
                  textDecoration: 'none'
                }}
              >
                <span>{isTe ? 'మ్యాప్స్‌లో తెరవండి' : 'Open in Google Maps'}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Opening Hours */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '1rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isTe ? 'తెరిచి ఉండే సమయాలు' : 'Working Hours'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
              {shopConfig.openingHours[currentLang]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
