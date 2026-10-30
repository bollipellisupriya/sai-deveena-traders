import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sprout, MessageCircle } from 'lucide-react';
import type { Language } from '../types';

export interface HeroProps {
  currentLang?: Language;
  onExploreClick?: () => void;
  onContactClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface BigHaatSlide {
  id: number;
  bgImage: string;
  subLabel: {
    en: string;
    te: string;
  };
  headlineLine1: {
    en: string;
    te: string;
  };
  headlineLine2: {
    en: string;
    te: string;
  };
  ribbonText: {
    en: string;
    te: string;
  };
  buttonText: {
    en: string;
    te: string;
  };
  actionType: 'explore' | 'whatsapp' | 'call';
  objectPosition?: string;
}

const BURL = '/images/';

const SLIDES: BigHaatSlide[] = [
  {
    id: 1,
    bgImage: `${BURL}bighaat-seeds-banner.jpg`,
    subLabel: {
      en: '🌾 Certified Seeds',
      te: '🌾 నాణ్యమైన విత్తనాలు'
    },
    headlineLine1: {
      en: 'Premium Seeds',
      te: 'ప్రీమియం విత్తనాలు'
    },
    headlineLine2: {
      en: 'For Better Yield',
      te: 'అధిక దిగుబడి కోసం'
    },
    ribbonText: {
      en: '',
      te: ''
    },
    buttonText: {
      en: 'Shop Seeds',
      te: 'విత్తనాలు చూడండి'
    },
    actionType: 'explore',
    objectPosition: 'left 15%'
  },
  {
    id: 2,
    bgImage: `${BURL}bighaat-fert-banner.jpg`,
    subLabel: {
      en: '🌱 Genuine Fertilizers',
      te: '🌱 అసలైన ఎరువులు'
    },
    headlineLine1: {
      en: 'Quality Fertilizers',
      te: 'నాణ్యమైన ఎరువులు'
    },
    headlineLine2: {
      en: '& Crop Protection',
      te: '& పంట రక్షణ'
    },
    ribbonText: {
      en: '',
      te: ''
    },
    buttonText: {
      en: 'Shop Now',
      te: 'ఇప్పుడు చూడండి'
    },
    actionType: 'explore',
    objectPosition: 'left 15%'
  },
  {
    id: 3,
    bgImage: `${BURL}bighaat-delivery-banner.jpg`,
    subLabel: {
      en: '🚚 Farm Delivery',
      te: '🚚 పొలానికి డెలివరీ'
    },
    headlineLine1: {
      en: 'Doorstep Delivery',
      te: 'ఇంటి వద్దకే డెలివరీ'
    },
    headlineLine2: {
      en: 'To Your Village',
      te: 'మీ ఊరికి చేరుస్తాము'
    },
    ribbonText: {
      en: '',
      te: ''
    },
    buttonText: {
      en: 'Order Now',
      te: 'ఆర్డర్ చేయండి'
    },
    actionType: 'whatsapp',
    objectPosition: 'center 40%'
  }
];

export const Hero: React.FC<HeroProps> = ({
  currentLang = 'en',
  onExploreClick,
  onContactClick,
  className = '',
  style = {}
}) => {
  const isTe = currentLang === 'te';
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Navigate to product catalogue or contact action
  const handleAction = useCallback((actionType: 'explore' | 'whatsapp' | 'call') => {
    if (actionType === 'whatsapp') {
      window.open('https://wa.me/919010454541?text=Hello%20Sai%20Deveena%20Traders,%20I%20want%20to%20order%20seeds%20and%20fertilizers.', '_blank');
      return;
    }
    if (actionType === 'call') {
      if (onContactClick) {
        onContactClick();
      } else {
        window.location.href = 'tel:9010454541';
      }
      return;
    }
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const catalogueEl = document.getElementById('catalogue') || document.getElementById('categories');
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#categories';
    }
  }, [onContactClick, onExploreClick]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Automatic scrolling every 4.8 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4800);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = SLIDES[currentSlide];

  return (
    <section
      id="hero"
      className={`bighaat-hero-container ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '18px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        ...style
      }}
    >
      {/* 1. Main Banner Body Area */}
      <div className="bighaat-banner-body" style={{
        position: 'relative',
        minHeight: '450px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#f8fafc'
      }}>
        {/* Active Banner Background Photography with Smooth Crossfade */}
        {SLIDES.map((item, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(1.02)',
                transition: 'opacity 0.65s ease-in-out, transform 0.8s ease-out',
                pointerEvents: 'none'
              }}
            >
              <img
                src={item.bgImage}
                alt="Sai Deveena Traders & General Store Banner"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: item.objectPosition || 'left 0%'
                }}
              />
            </div>
          );
        })}

        {/* Soft, Translucent Light Wash on Right for Text Crispness (No dark murky veil) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.85) 75%, rgba(255, 255, 255, 0.95) 100%)'
          }}
        />


        {/* Clean Headline & CTA - Neatly aligned to the side (Right side for clear subject visibility) */}
        <div
          className="bighaat-headline-block"
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            minHeight: '360px',
            width: '100%',
            height: '100%',
            padding: '2.5rem 4rem 2.5rem 2rem',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="bighaat-headline-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left'
            }}
          >
            {/* Subtitle Pill */}
            <div
              className="bighaat-sub-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.25rem 0.7rem',
                borderRadius: '9999px',
                marginBottom: '0.5rem',
                border: '1.5px solid #86efac',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)'
              }}
            >
              <Sprout size={12} />
              <span>{isTe ? slide.subLabel.te : slide.subLabel.en}</span>
            </div>

            {/* Headline */}
            <h2
              className="bighaat-title-1"
              style={{
                fontSize: 'clamp(1.2rem, 2.8vw, 2.2rem)',
                fontWeight: 800,
                color: '#15803d',
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              {isTe ? slide.headlineLine1.te : slide.headlineLine1.en}
            </h2>

            {/* Subheadline */}
            <h2
              className="bighaat-title-2"
              style={{
                fontSize: 'clamp(1.3rem, 3.2vw, 2.4rem)',
                fontWeight: 900,
                color: '#14532d',
                margin: '0.15rem 0 0.85rem 0',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              {isTe ? slide.headlineLine2.te : slide.headlineLine2.en}
            </h2>

            {/* Clean Primary Action Button */}
            <button
              onClick={() => handleAction(slide.actionType)}
              className="bighaat-btn-primary"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.6rem 1.35rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(21, 128, 61, 0.35)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {slide.actionType === 'whatsapp' ? <MessageCircle size={16} /> : <Sprout size={16} />}
              <span>{isTe ? slide.buttonText.te : slide.buttonText.en}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Previous Chevron Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="bighaat-chevron-btn"
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(203, 213, 225, 0.8)',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next Chevron Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="bighaat-chevron-btn"
          style={{
            position: 'absolute',
            right: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(203, 213, 225, 0.8)',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronRight size={20} />
        </button>

        {/* Floating Capsule Pagination Indicators (Modern, Clean, Zero-clutter) */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '4px 10px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          {SLIDES.map((b, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={b.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: isActive ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.6)',
                  boxShadow: isActive ? '0 0 8px rgba(34, 197, 94, 0.9)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.25s ease'
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .bighaat-banner-body {
            min-height: 380px !important;
            height: 400px !important;
          }
          .bighaat-headline-block {
            min-height: 380px !important;
            height: 400px !important;
            padding: 1.5rem 4.5rem 1.5rem 2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
          }
          .bighaat-headline-card {
            max-width: 460px !important;
            background: rgba(255, 255, 255, 0.92) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border-radius: 20px !important;
            padding: 1.75rem 2rem !important;
            border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
            margin-right: 1.5rem !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .bighaat-banner-body {
            min-height: 330px !important;
            height: 340px !important;
          }
          .bighaat-headline-block {
            min-height: 330px !important;
            height: 340px !important;
            padding: 1rem 3.5rem 1rem 1.5rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
          }
          .bighaat-headline-card {
            max-width: 400px !important;
            background: rgba(255, 255, 255, 0.92) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border-radius: 18px !important;
            padding: 1.25rem 1.5rem !important;
            border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
            margin-right: 1.5rem !important;
          }
        }
        @media (max-width: 767px) {
          .bighaat-banner-body {
            min-height: 180px !important;
            height: 190px !important;
          }
          .bighaat-headline-block {
            min-height: 180px !important;
            padding: 0.6rem 0.85rem 0.6rem 1rem !important;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.95) 65%, #ffffff 100%) !important;
            justify-content: flex-end !important;
            align-items: center !important;
          }
          .bighaat-headline-card {
            max-width: 63% !important;
            background: transparent !important;
            backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-right: 0 !important;
          }
          .bighaat-sub-pill {
            font-size: 0.58rem !important;
            padding: 0.12rem 0.45rem !important;
            margin-bottom: 0.15rem !important;
          }
          .bighaat-title-1 {
            font-size: 0.88rem !important;
            line-height: 1.15 !important;
          }
          .bighaat-title-2 {
            font-size: 0.95rem !important;
            line-height: 1.15 !important;
            margin: 0.08rem 0 0.35rem 0 !important;
          }
          .bighaat-btn-primary {
            padding: 0.32rem 0.7rem !important;
            font-size: 0.72rem !important;
          }
          .bighaat-chevron-btn {
            width: 26px !important;
            height: 26px !important;
            left: 0.4rem !important;
          }
          .bighaat-chevron-btn:last-of-type {
            right: 0.4rem !important;
            left: auto !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
