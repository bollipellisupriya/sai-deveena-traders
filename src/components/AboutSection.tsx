import React from 'react';
import { MapPin, UserCheck, Sparkles } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../translations';
import { shopConfig } from '../config/shopConfig';

interface AboutSectionProps {
  currentLang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  return (
    <section id="about" className="section" style={{ backgroundColor: 'white' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(1.75rem, 4vw, 3.5rem)',
          alignItems: 'center'
        }}>
          {/* Left Column: Narrative with Brand Header */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#ea580c',
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.5rem'
            }}>
              <Sparkles size={16} />
              <span>{currentLang === 'te' ? 'మా పరిచయం & సేవలు' : 'About Sai Deveena Traders'}</span>
            </div>

            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
              {t.about.heading}
            </h2>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--primary-900)',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: '1.25rem'
            }}>
              {t.about.subheading}
            </p>

            <p style={{
              fontSize: '0.96rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '1.15rem'
            }}>
              {t.about.paragraph1}
            </p>

            <p style={{
              fontSize: '0.96rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '1.75rem'
            }}>
              {t.about.paragraph2}
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#fff7ed',
              border: '1.5px solid #fed7aa',
              borderRadius: 'var(--radius-md)',
              color: '#9a3412',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              <MapPin size={18} style={{ color: '#ea580c' }} />
              <span>{shopConfig.address[currentLang]}</span>
            </div>
          </div>

          {/* Right Column: Key Commitments Card with Logo Branding */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)',
            padding: 'clamp(1.25rem, 4vw, 2.25rem)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid rgba(187, 247, 208, 0.8)',
            boxShadow: '0 12px 30px rgba(22, 101, 52, 0.08)'
          }}>
            {/* Logo Emblem Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingBottom: '1.5rem',
              marginBottom: '1.5rem',
              borderBottom: '1.5px dashed var(--border-light)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.2)',
                padding: '3px',
                flexShrink: 0
              }}>
                <img
                  src="/logo-icon.png"
                  alt="Sai Deveena Traders"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                />
              </div>
              <div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: 'var(--primary-950)',
                  lineHeight: 1.2
                }}>
                  {currentLang === 'te' ? 'మా ప్రాధాన్యతలు' : 'Our Core Commitments'}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: '#ea580c',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  marginTop: '2px'
                }}>
                  QUALITY SEEDS • FERTILIZERS • BETTER YIELDS
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {t.about.highlights.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'white',
                    color: idx === 1 ? '#ea580c' : '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1.5px solid var(--border-light)'
                  }}>
                    {idx === 0 && <MapPin size={20} />}
                    {idx === 1 && <Sparkles size={20} />}
                    {idx === 2 && <UserCheck size={20} />}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      color: 'var(--primary-950)',
                      marginBottom: '0.25rem'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
