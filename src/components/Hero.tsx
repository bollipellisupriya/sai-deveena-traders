import React from 'react';
import { Sprout, Phone, MessageCircle, Store, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../translations';
import { getPhoneDialUrl, getGeneralWhatsappUrl } from '../utils/whatsapp';

interface HeroProps {
  currentLang: Language;
  onExploreClick: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang,
  onExploreClick,
  onContactClick
}) => {
  const t = translations[currentLang];
  const { url: phoneUrl, isConfigured: isPhoneReady } = getPhoneDialUrl();
  const { url: whatsappUrl, isConfigured: isWhatsappReady } = getGeneralWhatsappUrl(currentLang);

  return (
    <section id="hero" style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 70%, #fff7ed 100%)',
      paddingTop: '3.5rem',
      paddingBottom: '4.5rem',
      borderBottom: '1px solid var(--border-light)',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Gradient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-5%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(254, 215, 170, 0.35) 0%, rgba(240, 253, 244, 0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(187, 247, 208, 0.4) 0%, rgba(240, 253, 244, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          marginBottom: '3.5rem'
        }}>
          {/* Left Column: Headlines & Call to Actions */}
          <div>
            {/* Top Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1.1rem',
              backgroundColor: 'white',
              border: '1.5px solid var(--primary-300)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-900)',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '1.25rem',
              boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ea580c',
                display: 'inline-block'
              }} />
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline with Brand Gradient */}
            <h1 style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)',
              fontWeight: 900,
              color: 'var(--primary-950)',
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              marginBottom: '1.25rem'
            }}>
              {currentLang === 'te' ? (
                <>
                  మంచి పంట దిగుబడికి <span style={{ color: '#ea580c' }}>నమ్మకమైన</span> వ్యవసాయ ఉత్పత్తులు
                </>
              ) : (
                <>
                  Quality Agricultural Products for <span style={{ color: '#ea580c' }}>Better Crop Yields</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(1.02rem, 2vw, 1.18rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2rem',
              maxWidth: '620px'
            }}>
              {t.hero.subtitle}
            </p>

            {/* CTAs Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.85rem',
              marginBottom: '2.5rem'
            }}>
              <button
                onClick={onExploreClick}
                className="btn btn-primary"
                style={{
                  fontSize: '1rem',
                  padding: '0.9rem 1.85rem'
                }}
              >
                <Sprout size={20} />
                <span>{t.hero.exploreBtn}</span>
                <ArrowRight size={17} />
              </button>

              <a
                href={whatsappUrl}
                target={isWhatsappReady ? "_blank" : undefined}
                rel={isWhatsappReady ? "noopener noreferrer" : undefined}
                className="btn btn-whatsapp"
                style={{
                  fontSize: '1rem',
                  padding: '0.9rem 1.6rem'
                }}
                onClick={(e) => {
                  if (!isWhatsappReady) {
                    e.preventDefault();
                    onContactClick();
                  }
                }}
              >
                <MessageCircle size={19} />
                <span>{t.hero.whatsappBtn}</span>
              </a>

              <a
                href={phoneUrl}
                className="btn btn-secondary"
                style={{
                  fontSize: '1rem',
                  padding: '0.9rem 1.45rem'
                }}
                onClick={(e) => {
                  if (!isPhoneReady) {
                    e.preventDefault();
                    onContactClick();
                  }
                }}
              >
                <Phone size={18} style={{ color: 'var(--primary-700)' }} />
                <span>{t.hero.callBtn}</span>
              </a>
            </div>

            {/* Live Stats Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-900)' }}>
                  30+
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {currentLang === 'te' ? 'రైతు ఉత్పత్తులు' : 'Quality Products'}
                </div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-light)' }} />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {currentLang === 'te' ? 'అసలైన బ్రాండ్లు' : 'Genuine Brands'}
                </div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-light)' }} />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-900)' }}>
                  భైంసా
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {currentLang === 'te' ? 'స్థానిక సేవలు' : 'Bhainsa & Villages'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase featuring Official Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Glow backing */}
            <div style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, rgba(22, 163, 74, 0.25) 50%, transparent 70%)',
              filter: 'blur(35px)',
              zIndex: 1
            }} />

            {/* Main Showcase Card */}
            <div
              className="card animate-float"
              style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: '420px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '2rem 1.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid rgba(254, 215, 170, 0.8)',
                boxShadow: '0 20px 45px -10px rgba(22, 101, 52, 0.15), 0 0 25px rgba(234, 88, 12, 0.1)',
                textAlign: 'center'
              }}
            >
              {/* Circular Emblem Image Container */}
              <div style={{
                width: '190px',
                height: '190px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 10px 25px rgba(22, 101, 52, 0.2), 0 0 0 4px #ffedd5',
                padding: '4px'
              }}>
                <img
                  src="/logo-icon.png"
                  alt="Sai Deveena Traders Official Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '50%'
                  }}
                />
              </div>

              {/* Tagline Badge from logo */}
              <div style={{
                display: 'inline-block',
                padding: '0.45rem 1rem',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 'var(--radius-full)',
                color: '#9a3412',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}>
                QUALITY SEEDS • PREMIUM FERTILIZERS • BETTER YIELDS
              </div>

              <div style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                {currentLang === 'te' 
                  ? 'భైంసా మరియు పరిసర గ్రామాల రైతులకు నమ్మకమైన వ్యవసాయ భాగస్వామి.' 
                  : 'Your dedicated agricultural partner in Bhainsa, Telangana.'}
              </div>

              {/* Bottom Quick Callout */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px dashed var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                color: '#15803d',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                <ShieldCheck size={17} style={{ color: '#ea580c' }} />
                <span>
                  {currentLang === 'te' ? 'ప్రత్యక్ష సంప్రదింపులు & దుకాణం వద్ద లభ్యం' : 'Direct Call & Shop Pickup in Bhainsa'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillar Cards for Farmers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          textAlign: 'left'
        }}>
          {t.hero.features.map((feature, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: idx === 1 ? '#ffedd5' : 'var(--primary-100)',
                color: idx === 1 ? '#ea580c' : 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-xs)'
              }}>
                {idx === 0 && <Sprout size={24} />}
                {idx === 1 && <Sparkles size={24} />}
                {idx === 2 && <Store size={24} />}
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--primary-950)',
                  marginBottom: '0.3rem'
                }}>
                  {feature.title}
                </h2>
                <p style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
