import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Handle banner click destination
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
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        ...style
      }}
    >
      {/* Main Banner Body: displays the full, clean uploaded banner image */}
      <div
        className="admin-banner-body"
        onClick={() => handleBannerClick(activeBanner)}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          display: 'block'
        }}
        title={`View banner: ${activeBanner.title?.[isTe ? 'te' : 'en'] || activeBanner.title?.en || 'Promotional Banner'}`}
      >
        {/* Render Banner Slides with Natural Height & Smooth Transition */}
        {banners.map((item, index) => {
          const isActive = index === (currentSlide % banners.length);
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              style={{
                position: isActive ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: isActive ? undefined : 0,
                zIndex: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                pointerEvents: isActive ? 'auto' : 'none',
                width: '100%'
              }}
            >
              <picture style={{ width: '100%', display: 'block' }}>
                {item.imageMobile && (
                  <source media="(max-width: 767px)" srcSet={item.imageMobile} />
                )}
                <img
                  src={item.imageDesktop}
                  alt={item.title?.en || item.title?.te || 'Sai Deveena Traders Banner'}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '480px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
              </picture>
            </div>
          );
        })}

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
              width: '36px',
              height: '36px',
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
              width: '36px',
              height: '36px',
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
              bottom: '0.65rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: '3px 8px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.25)'
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
                    width: isActive ? '18px' : '5px',
                    height: '5px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.65)',
                    boxShadow: isActive ? '0 0 6px rgba(34, 197, 94, 0.9)' : 'none',
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
        .admin-hero-banner-container:hover .admin-chevron-btn {
          opacity: 1;
        }
        @media (max-width: 767px) {
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
