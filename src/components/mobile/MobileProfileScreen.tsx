import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Headphones, ShieldCheck, Truck, Sprout, Star, Award } from 'lucide-react';
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
    <div style={{ padding: '0.85rem 1rem 6rem', backgroundColor: '#f8fafc' }}>
      {/* 1. Verified Merchant Brand Identity Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem 1.25rem 1.25rem',
        border: '1.5px solid #bbf7d0',
        boxShadow: '0 8px 30px rgba(22, 101, 52, 0.08)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        {/* Top Decorative Arc Glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 222, 128, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Circular Brand Logo Emblem with Golden Ring */}
        <div style={{
          width: '78px',
          height: '78px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(22, 101, 52, 0.22), 0 0 0 2.5px #ea580c',
          margin: '0 auto 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          position: 'relative'
        }}>
          <img
            src="/logo-icon.png?v=6"
            alt="Sai Deveena Traders"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Verified Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          backgroundColor: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #86efac',
          borderRadius: '9999px',
          padding: '0.2rem 0.65rem',
          fontSize: '0.72rem',
          fontWeight: 800,
          marginBottom: '0.5rem'
        }}>
          <Award size={13} style={{ color: '#ea580c' }} />
          <span>{isTe ? 'ధృవీకరించబడిన వ్యవసాయ వ్యాపారి' : 'Verified Agri Merchant'}</span>
        </div>

        {/* Shop Name & Subtitle */}
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 900,
          color: '#14532d',
          marginBottom: '0.2rem',
          lineHeight: 1.25
        }}>
          {shopConfig.shopName[currentLang]}
        </h2>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#ea580c',
          letterSpacing: '0.04em',
          marginBottom: '1rem'
        }}>
          TRADERS & GENERAL STORE • BHAINSA
        </div>

        {/* Quick Language Toggle */}
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
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: currentLang === 'en' ? '#15803d' : 'transparent',
              color: currentLang === 'en' ? '#ffffff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('te')}
            style={{
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: currentLang === 'te' ? '#15803d' : 'transparent',
              color: currentLang === 'te' ? '#ffffff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* 2. Four Key Merchant Pillars Grid (2x2) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.65rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '0.75rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
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
            <Sprout size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
              {isTe ? '100% నాణ్యమైన విత్తనాలు' : 'Certified Seeds'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {isTe ? 'అధిక దిగుబడి రకాలు' : 'Government certified'}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '0.75rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
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
            <Truck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
              {isTe ? 'పొలాల వద్దకే రవాణా' : 'Farm Delivery'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {isTe ? 'భైంసా పరిసర ప్రాంతాలు' : 'Direct to your fields'}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '0.75rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#dbeafe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
              {isTe ? 'రైతు భరోసా' : 'Farmer Support'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {isTe ? 'ఉచిత పంట సలహాలు' : 'Expert crop guidance'}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '0.75rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
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
            <Star size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
              {isTe ? 'నమ్మకమైన ధరలు' : 'Best Rates'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {isTe ? 'నియంత్రిత సరసమైన ధరలు' : 'Fair transparent pricing'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Direct Contact Channels Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.15rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
      }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.85rem' }}>
          {isTe ? 'సంప్రదించండి & ఆర్డర్లు' : 'Direct Contact & Ordering'}
        </h3>

        {/* Primary Order Call (9010454541) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {isTe ? 'ఉత్పత్తుల ఆర్డర్లు & విక్రయాలు' : 'Orders & Product Sales'}
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#15803d' }}>
                9010454541
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <a
              href="tel:9010454541"
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0.4rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              {isTe ? 'కాల్' : 'Call'}
            </a>
            <a
              href="https://wa.me/919010454541"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#25d366',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0.4rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Support Helpline (9014397044) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Headphones size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {isTe ? 'కస్టమర్ సపోర్ట్ & సహాయం' : 'Customer Support Helpline'}
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0284c7' }}>
                9014397044
              </div>
            </div>
          </div>
          <a
            href="tel:9014397044"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.4rem 0.65rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            {isTe ? 'సహాయం' : 'Help'}
          </a>
        </div>
      </div>

      {/* 4. Address & Timings Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.15rem',
        marginBottom: '1rem'
      }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.85rem' }}>
          {isTe ? 'దుకాణం వివరాలు & వేళలు' : 'Store Location & Timings'}
        </h3>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
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
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {isTe ? 'చిరునామా' : 'Store Address'}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.4, marginBottom: '0.35rem' }}>
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
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <span>{isTe ? 'గూగుల్ మ్యాప్స్‌లో తెరవండి' : 'Open in Google Maps'}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Working Hours */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {isTe ? 'పనిచేయు వేళలు' : 'Opening Hours'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e293b' }}>
              {shopConfig.openingHours[currentLang]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
