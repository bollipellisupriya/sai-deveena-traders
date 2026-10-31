import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Language, Category, Banner } from '../types';

export interface HeroProps {
  currentLang?: Language;
  banners?: Banner[];
  categories?: Category[];
  onExploreClick?: () => void;
  onSelectCategory?: (categoryId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang = 'en',
  banners = [],
  categories = [],
  onExploreClick,
  onSelectCategory,
  className = '',
  style = {}
}) => {
  const isTe = currentLang === 'te';
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // If no admin-added banners exist or active, do not render any frontend fallback banners
  if (!banners || banners.length === 0) {
    return null;
  }

  // Resolve category link to category ID in catalog
  const resolveTargetCategoryId = useCallback(
    (targetKey: string): string => {
      if (!categories || categories.length === 0) return targetKey;

      const direct = categories.find(c => c.id.toLowerCase() === targetKey.toLowerCase());
      if (direct) return direct.id;

      const fuzzy = categories.find(c => {
        const id = (c.id || '').toLowerCase();
        const en = (c.name?.en || '').toLowerCase();
        const te = (c.name?.te || '').toLowerCase();

        if (targetKey === 'seeds') return id.includes('seed') || en.includes('seed') || te.includes('విత్తన');
        if (targetKey === 'fertilizers') return id.includes('fert') || en.includes('fert') || te.includes('ఎరువు');
        if (targetKey === 'crop-protection' || targetKey === 'cropcare') {
          return (
            id.includes('crop') ||
            id.includes('pest') ||
            id.includes('protect') ||
            en.includes('protect') ||
            en.includes('pest') ||
            te.includes('రక్షణ') ||
            te.includes('మందు')
          );
        }
        if (targetKey === 'tools' || targetKey === 'irrigation') {
          return (
            id.includes('tool') ||
            id.includes('irrig') ||
            id.includes('equip') ||
            en.includes('tool') ||
            en.includes('irrig') ||
            te.includes('పరికర')
          );
        }
        if (targetKey === 'groceries') {
          return (
            id.includes('groc') ||
            id.includes('store') ||
            id.includes('prov') ||
            id.includes('house') ||
            en.includes('groc') ||
            te.includes('కిరాణా')
          );
        }
        return false;
      });

      return fuzzy ? fuzzy.id : targetKey;
    },
    [categories]
  );

  // Handle banner or CTA button action click
  const handleBannerClick = useCallback(
    (banner: Banner) => {
      const link = (banner.buttonLink || '#categories').trim();

      // External website URL
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
        return;
      }

      // Telephone or WhatsApp or Email
      if (link.startsWith('tel:') || link.startsWith('mailto:') || link.startsWith('whatsapp:')) {
        window.location.href = link;
        return;
      }

      const cleanTarget = link.replace(/^#/, '');

      // Explore catalogue / categories
      if (cleanTarget === 'categories' || cleanTarget === 'catalogue' || cleanTarget === 'products' || cleanTarget === '') {
        if (onExploreClick) {
          onExploreClick();
        } else {
          const el = document.getElementById('categories') || document.getElementById('catalogue');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.hash = '#categories';
          }
        }
        return;
      }

      // Specific Category Selection
      const targetCatId = resolveTargetCategoryId(cleanTarget);
      if (onSelectCategory) {
        onSelectCategory(targetCatId);
      } else if (onExploreClick) {
        onExploreClick();
      } else {
        const el = document.getElementById('categories') || document.getElementById('catalogue');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [onExploreClick, onSelectCategory, resolveTargetCategoryId]
  );

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentSlide(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Autoplay banner carousel every 5 seconds if multiple banners exist
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, banners.length]);

  const activeBanner = banners[currentSlide % banners.length] || banners[0];

  // Check if active banner has textual overlay (titles or subtitle)
  const hasTextOverlay = useMemo(() => {
    const title = activeBanner.title?.[isTe ? 'te' : 'en'] || activeBanner.title?.en || activeBanner.title?.te || '';
    const subtitle = activeBanner.subtitle?.[isTe ? 'te' : 'en'] || activeBanner.subtitle?.en || activeBanner.subtitle?.te || '';
    return Boolean(title.trim().length > 0 || subtitle.trim().length > 0);
  }, [activeBanner, isTe]);

  return (
    <section
      id="hero-banners"
      className={`admin-hero-banner-container ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        ...style
      }}
    >
      {/* Main Banner Interactive Body */}
      <div
        className="admin-banner-body"
        onClick={() => handleBannerClick(activeBanner)}
        style={{
          position: 'relative',
          minHeight: '380px',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          cursor: 'pointer'
        }}
        title={`View banner: ${activeBanner.title?.[isTe ? 'te' : 'en'] || activeBanner.title?.en || 'Promotional Banner'}`}
      >
        {/* Render Banner Slides with Crossfade Animation */}
        {banners.map((item, index) => {
          const isActive = index === (currentSlide % banners.length);
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
                transition: 'opacity 0.6s ease-in-out, transform 0.8s ease-out',
                pointerEvents: 'none'
              }}
            >
              <picture style={{ width: '100%', height: '100%' }}>
                {item.imageMobile && (
                  <source media="(max-width: 767px)" srcSet={item.imageMobile} />
                )}
                <img
                  src={item.imageDesktop}
                  alt={item.title?.en || item.title?.te || 'Sai Deveena Traders Banner'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center'
                  }}
                />
              </picture>
            </div>
          );
        })}

        {/* Text Overlay Card (Rendered ONLY if admin provided title or subtitle) */}
        {hasTextOverlay && (
          <>
            {/* Soft Translucent Light Wash for Text Contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'none',
                background:
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.25) 35%, rgba(255, 255, 255, 0.88) 70%, rgba(255, 255, 255, 0.96) 100%)'
              }}
            />

            <div
              className="admin-headline-block"
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                minHeight: '340px',
                width: '100%',
                height: '100%',
                padding: '2rem 3.5rem 2rem 2rem',
                boxSizing: 'border-box'
              }}
            >
              <div
                className="admin-headline-card"
                style={{
                  maxWidth: '480px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left'
                }}
              >
                {/* Subtitle Pill (if configured) */}
                {(activeBanner.subtitle?.en || activeBanner.subtitle?.te) && (
                  <div
                    className="admin-sub-pill"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.85rem',
                      borderRadius: '9999px',
                      marginBottom: '0.55rem',
                      border: '1.5px solid #86efac',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.12)'
                    }}
                  >
                    <span>
                      {isTe
                        ? (activeBanner.subtitle.te || activeBanner.subtitle.en)
                        : (activeBanner.subtitle.en || activeBanner.subtitle.te)}
                    </span>
                  </div>
                )}

                {/* Banner Main Title */}
                {(activeBanner.title?.en || activeBanner.title?.te) && (
                  <h2
                    className="admin-title-1"
                    style={{
                      fontSize: 'clamp(1.25rem, 2.6vw, 2.1rem)',
                      fontWeight: 900,
                      color: '#14532d',
                      margin: '0 0 0.85rem 0',
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {isTe
                      ? (activeBanner.title.te || activeBanner.title.en)
                      : (activeBanner.title.en || activeBanner.title.te)}
                  </h2>
                )}

                {/* Call to Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick(activeBanner);
                  }}
                  className="admin-btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.65rem 1.45rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(21, 128, 61, 0.35)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>
                    {isTe
                      ? (activeBanner.buttonText?.te || activeBanner.buttonText?.en || 'ఇప్పుడు చూడండి')
                      : (activeBanner.buttonText?.en || activeBanner.buttonText?.te || 'Shop Now')}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Previous Chevron (Shown only if > 1 banner) */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Banner"
            className="admin-chevron-btn"
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next Chevron (Shown only if > 1 banner) */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Banner"
            className="admin-chevron-btn"
            style={{
              position: 'absolute',
              right: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Capsule Pagination Indicators (Shown only if > 1 banner) */}
        {banners.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {banners.map((b, idx) => {
              const isActive = idx === (currentSlide % banners.length);
              return (
                <button
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Go to banner ${idx + 1}`}
                  style={{
                    width: isActive ? '22px' : '6px',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.65)',
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
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .admin-banner-body {
            min-height: 380px !important;
            height: 400px !important;
          }
          .admin-headline-block {
            min-height: 380px !important;
            height: 400px !important;
            padding: 1.5rem 4.5rem 1.5rem 2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
          }
          .admin-headline-card {
            max-width: 470px !important;
            background: rgba(255, 255, 255, 0.94) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border-radius: 20px !important;
            padding: 1.75rem 2.2rem !important;
            border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
            margin-right: 1.5rem !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .admin-banner-body {
            min-height: 320px !important;
            height: 340px !important;
          }
          .admin-headline-block {
            min-height: 320px !important;
            height: 340px !important;
            padding: 1rem 3.5rem 1rem 1.5rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
          }
          .admin-headline-card {
            max-width: 410px !important;
            background: rgba(255, 255, 255, 0.94) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border-radius: 18px !important;
            padding: 1.35rem 1.6rem !important;
            border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
            margin-right: 1.5rem !important;
          }
        }
        @media (max-width: 767px) {
          .admin-banner-body {
            min-height: 185px !important;
            height: 195px !important;
          }
          .admin-headline-block {
            min-height: 185px !important;
            padding: 0.6rem 0.85rem 0.6rem 1rem !important;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.95) 65%, #ffffff 100%) !important;
            justify-content: flex-end !important;
            align-items: center !important;
          }
          .admin-headline-card {
            max-width: 65% !important;
            background: transparent !important;
            backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-right: 0 !important;
          }
          .admin-sub-pill {
            font-size: 0.6rem !important;
            padding: 0.15rem 0.45rem !important;
            margin-bottom: 0.2rem !important;
          }
          .admin-title-1 {
            font-size: 0.92rem !important;
            line-height: 1.15 !important;
            margin-bottom: 0.4rem !important;
          }
          .admin-btn-primary {
            padding: 0.35rem 0.8rem !important;
            font-size: 0.74rem !important;
          }
          .admin-chevron-btn {
            width: 28px !important;
            height: 28px !important;
            left: 0.4rem !important;
          }
          .admin-chevron-btn:last-of-type {
            right: 0.4rem !important;
            left: auto !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
