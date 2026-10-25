import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Language } from '../types';

interface BannerSlide {
  id: number;
  imageUrl: string;
  altText: string;
  badge: {
    en: string;
    te: string;
  };
  title: {
    en: string;
    te: string;
  };
  subtitle: {
    en: string;
    te: string;
  };
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 1,
    imageUrl: '/images/banner-1.jpg',
    altText: 'Lush green trees and agricultural farmland in Bhainsa',
    badge: {
      en: '🌾 Bhainsa, Nirmal District',
      te: '🌾 భైంసా, నిర్మల్ జిల్లా'
    },
    title: {
      en: 'Sai Deveena Traders',
      te: 'సాయి దీవెన ట్రేడర్స్'
    },
    subtitle: {
      en: 'Quality Seeds & Fertilizers',
      te: 'నాణ్యమైన విత్తనాలు & ఎరువులు'
    }
  },
  {
    id: 2,
    imageUrl: '/images/banner-2.jpg',
    altText: 'Vibrant green agricultural crops and tree border',
    badge: {
      en: '🌱 Better Harvests',
      te: '🌱 అధిక దిగుబడులు'
    },
    title: {
      en: 'Healthy Crops, Better Yields',
      te: 'మంచి పంట దిగుబడి'
    },
    subtitle: {
      en: '100% Genuine Certified Brands',
      te: '100% అసలైన ధృవీకృత బ్రాండ్లు'
    }
  },
  {
    id: 3,
    imageUrl: '/images/banner-3.jpg',
    altText: 'Rural agricultural landscape with green orchard and stepped fields',
    badge: {
      en: '🤝 Trusted Partner',
      te: '🤝 రైతు నమ్మకం'
    },
    title: {
      en: 'Direct Farmer Support',
      te: 'రైతుల నమ్మకమైన కేంద్రం'
    },
    subtitle: {
      en: 'Personal Guidance & Transparent Rates',
      te: 'వ్యక్తిగత సలహాలు & సరసమైన ధరలు'
    }
  }
];

interface AgriculturalBannerProps {
  currentLang?: Language;
  onExploreClick?: () => void;
  onContactClick?: () => void;
}

export const AgriculturalBanner: React.FC<AgriculturalBannerProps> = ({
  currentLang = 'en',
  onExploreClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const isTe = currentLang === 'te';
  const totalSlides = BANNER_SLIDES.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-scroll timer: slides automatically every 4.5 seconds when not hovered
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      goToNext();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, goToNext]);

  return (
    <section
      id="hero"
      aria-label="Agricultural Showcase Carousel"
      style={{
        paddingTop: '0.75rem',
        paddingBottom: '0.5rem'
      }}
    >
      <div className="container">
        {/* Main Auto-Scrolling Visual Banner Carousel */}
        <div
          className="banner-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(270px, 35vw, 440px)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 12px 35px -5px rgba(22, 101, 52, 0.22), 0 4px 12px rgba(0, 0, 0, 0.06)',
            border: '2px solid rgba(187, 247, 208, 0.65)',
            backgroundColor: '#dcfce7'
          }}
        >
          {/* Slides */}
          {BANNER_SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                role={onExploreClick ? 'button' : undefined}
                tabIndex={onExploreClick ? 0 : undefined}
                onClick={onExploreClick}
                onKeyDown={(e) => {
                  if (onExploreClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onExploreClick();
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: isActive ? 1 : 0,
                  visibility: isActive ? 'visible' : 'hidden',
                  transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isActive ? 'scale(1)' : 'scale(1.03)',
                  cursor: onExploreClick ? 'pointer' : 'default'
                }}
                aria-hidden={!isActive}
              >
                {/* Scenic Background Image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.altText}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 50%',
                    display: 'block'
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle Bottom Vignette for gentle contrast */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(5, 46, 22, 0.45) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Little Clean Glass Text Capsule in the Corner */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2.5rem',
                    left: 'clamp(1rem, 3vw, 2.5rem)',
                    zIndex: 5,
                    maxWidth: '460px',
                    backgroundColor: 'rgba(5, 46, 22, 0.58)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '14px',
                    padding: '0.75rem 1.25rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                    color: '#ffffff',
                    pointerEvents: 'none',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#fef08a',
                      letterSpacing: '0.03em',
                      marginBottom: '0.15rem'
                    }}
                  >
                    {isTe ? slide.badge.te : slide.badge.en}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(1.1rem, 2.2vw, 1.38rem)',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      marginBottom: '0.15rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {isTe ? slide.title.te : slide.title.en}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(0.8rem, 1.4vw, 0.88rem)',
                      color: '#e2e8f0',
                      lineHeight: 1.4
                    }}
                  >
                    {isTe ? slide.subtitle.te : slide.subtitle.en}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Left / Previous Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous Banner"
            className="carousel-nav-btn prev-btn"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              color: '#14532d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right / Next Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next Banner"
            className="carousel-nav-btn next-btn"
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              color: '#14532d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Bottom Dot Indicators */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.85rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.7rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            {BANNER_SLIDES.map((slide, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  aria-label={`Go to banner slide ${idx + 1}`}
                  style={{
                    width: active ? '22px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: active ? '#4ade80' : 'rgba(255, 255, 255, 0.65)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Scoped CSS for hover interactions */}
      <style>{`
        .carousel-nav-btn:hover {
          background-color: #ffffff !important;
          transform: translateY(-50%) scale(1.08) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28) !important;
        }
        .carousel-nav-btn:active {
          transform: translateY(-50%) scale(0.95) !important;
        }
      `}</style>
    </section>
  );
};
