import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Layers,
  ShieldCheck,
  Wrench,
  ShoppingBag
} from 'lucide-react';
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

export interface BannerSlide {
  id: string | number;
  categoryId: string;
  displayMode: 'full_image' | 'content_overlay';
  imageDesktop: string;
  imageMobile?: string | null;
  subLabel?: {
    en: string;
    te: string;
  };
  headlineLine1?: {
    en: string;
    te: string;
  };
  headlineLine2?: {
    en: string;
    te: string;
  };
  buttonText?: {
    en: string;
    te: string;
  };
  buttonLink: string;
  iconType?: 'seeds' | 'fertilizers' | 'crop-protection' | 'tools' | 'groceries';
}

const FALLBACK_CATEGORY_SLIDES: BannerSlide[] = [
  {
    id: 'seeds',
    categoryId: 'seeds',
    displayMode: 'content_overlay',
    imageDesktop: '/images/bighaat-seeds-banner.jpg',
    subLabel: {
      en: '🌾 Certified Hybrid Seeds',
      te: '🌾 నాణ్యమైన హైబ్రిడ్ విత్తనాలు'
    },
    headlineLine1: {
      en: 'High-Yield Seeds',
      te: 'అధిక దిగుబడి విత్తనాలు'
    },
    headlineLine2: {
      en: 'Cotton, Chilli, Paddy & Veg',
      te: 'పత్తి, మిరప, వరి & కూరగాయలు'
    },
    buttonText: {
      en: 'Explore Seeds',
      te: 'విత్తనాలు చూడండి'
    },
    buttonLink: 'seeds',
    iconType: 'seeds'
  },
  {
    id: 'fertilizers',
    categoryId: 'fertilizers',
    displayMode: 'content_overlay',
    imageDesktop: '/images/bighaat-fert-banner.jpg',
    subLabel: {
      en: '🌱 Genuine Fertilizers',
      te: '🌱 అసలైన రసాయన & సేంద్రీయ ఎరువులు'
    },
    headlineLine1: {
      en: 'Plant Nutrition & Growth',
      te: 'మొక్కల పోషణ & వేగవంత పెరుగుదల'
    },
    headlineLine2: {
      en: 'DAP, Urea, NPK & Zinc',
      te: 'యూరియా, డీఏపీ, ఎన్‌పికె & జింక్'
    },
    buttonText: {
      en: 'Explore Fertilizers',
      te: 'ఎరువులు చూడండి'
    },
    buttonLink: 'fertilizers',
    iconType: 'fertilizers'
  },
  {
    id: 'crop-protection',
    categoryId: 'crop-protection',
    displayMode: 'content_overlay',
    imageDesktop: '/images/categories/crop-protection.jpg',
    subLabel: {
      en: '🛡️ Crop Protection & Care',
      te: '🛡️ పంట రక్షణ & పురుగుమందులు'
    },
    headlineLine1: {
      en: 'Pesticides & Bio-Cure',
      te: 'పురుగు & తెగులు నివారణ'
    },
    headlineLine2: {
      en: 'Insecticides & Fungicides',
      te: 'శిలీంధ్రనాశకాలు & కలుపు నివారిణులు'
    },
    buttonText: {
      en: 'Shop Crop Care',
      te: 'పంట రక్షణ చూడండి'
    },
    buttonLink: 'crop-protection',
    iconType: 'crop-protection'
  },
  {
    id: 'tools',
    categoryId: 'tools',
    displayMode: 'content_overlay',
    imageDesktop: '/images/categories/irrigation.jpg',
    subLabel: {
      en: '💧 Tools & Irrigation',
      te: '💧 వ్యవసాయ పరికరాలు & డ్రిప్'
    },
    headlineLine1: {
      en: 'Modern Farm Equipment',
      te: 'ఆధునిక వ్యవసాయ పరికరాలు'
    },
    headlineLine2: {
      en: 'Sprayers, Pipes & Tarpaulins',
      te: 'స్ప్రేయర్లు, టార్పాలిన్లు & పైపులు'
    },
    buttonText: {
      en: 'Shop Farm Tools',
      te: 'పరికరాలు చూడండి'
    },
    buttonLink: 'tools',
    iconType: 'tools'
  },
  {
    id: 'groceries',
    categoryId: 'groceries',
    displayMode: 'content_overlay',
    imageDesktop: '/images/categories/other.jpg',
    subLabel: {
      en: '🛒 General Store & Provisions',
      te: '🛒 కిరాణా & నిత్యావసరాలు'
    },
    headlineLine1: {
      en: 'Daily Farm Essentials',
      te: 'రైతు కుటుంబాల నిత్యావసరాలు'
    },
    headlineLine2: {
      en: 'Dal, Cooking Oils & Grains',
      te: 'నాణ్యమైన పప్పులు, నూనెలు & సరుకులు'
    },
    buttonText: {
      en: 'Shop Groceries',
      te: 'కిరాణా చూడండి'
    },
    buttonLink: 'groceries',
    iconType: 'groceries'
  }
];

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

  // Helper for category icon in overlay mode
  const renderCategoryIcon = (iconType?: BannerSlide['iconType'], size = 14) => {
    switch (iconType) {
      case 'seeds': return <Sprout size={size} />;
      case 'fertilizers': return <Layers size={size} />;
      case 'crop-protection': return <ShieldCheck size={size} />;
      case 'tools': return <Wrench size={size} />;
      case 'groceries': return <ShoppingBag size={size} />;
      default: return <Sprout size={size} />;
    }
  };

  // Smart resolution to find matching database category ID
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
            id.includes('crop') || id.includes('pest') || id.includes('protect') ||
            en.includes('protect') || en.includes('pest') || te.includes('రక్షణ') || te.includes('మందు')
          );
        }
        if (targetKey === 'tools' || targetKey === 'irrigation') {
          return (
            id.includes('tool') || id.includes('irrig') || id.includes('equip') ||
            en.includes('tool') || en.includes('irrig') || te.includes('పరికర')
          );
        }
        if (targetKey === 'groceries') {
          return (
            id.includes('groc') || id.includes('store') || id.includes('prov') ||
            id.includes('house') || en.includes('groc') || te.includes('కిరాణా')
          );
        }
        return false;
      });

      return fuzzy ? fuzzy.id : targetKey;
    },
    [categories]
  );

  // Handle banner click action
  const handleBannerClick = useCallback(
    (slide: BannerSlide) => {
      const link = (slide.buttonLink || '#categories').trim();

      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
        return;
      }
      if (link.startsWith('tel:') || link.startsWith('mailto:') || link.startsWith('whatsapp:')) {
        window.location.href = link;
        return;
      }

      const cleanTarget = link.replace(/^#/, '');
      if (cleanTarget === 'categories' || cleanTarget === 'catalogue' || cleanTarget === 'products' || cleanTarget === '') {
        if (onExploreClick) {
          onExploreClick();
        } else {
          const el = document.getElementById('categories') || document.getElementById('catalogue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.location.hash = '#categories';
        }
        return;
      }

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

  // Active slides definition: Dynamic Supabase banners take precedence
  const slides = useMemo<BannerSlide[]>(() => {
    if (banners && banners.length > 0) {
      return banners.map((b) => {
        const mode = b.displayMode || 'full_image';
        return {
          id: b.id,
          categoryId: b.buttonLink ? b.buttonLink.replace(/^#/, '') : 'categories',
          displayMode: mode,
          imageDesktop: b.imageDesktop,
          imageMobile: b.imageMobile,
          subLabel: b.subtitle.en || b.subtitle.te ? b.subtitle : undefined,
          headlineLine1: b.title.en || b.title.te ? b.title : undefined,
          headlineLine2: undefined,
          buttonText: b.buttonText.en ? b.buttonText : { en: 'Shop Now', te: 'ఇప్పుడు చూడండి' },
          buttonLink: b.buttonLink || '#categories',
          iconType: 'seeds'
        };
      });
    }

    return FALLBACK_CATEGORY_SLIDES;
  }, [banners]);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay carousel every 5 seconds if multiple slides exist
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const activeSlide = slides[currentSlide % slides.length] || slides[0];

  return (
    <section
      id="hero-banner-section"
      className={`dynamic-hero-banner-container ${className}`}
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
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        ...style
      }}
    >
      {/* Main Banner Visual Container */}
      <div
        className="dynamic-banner-viewport"
        onClick={() => handleBannerClick(activeSlide)}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          cursor: 'pointer'
        }}
        title={`View banner: ${activeSlide.headlineLine1?.[isTe ? 'te' : 'en'] || 'Promotional Banner'}`}
      >
        {/* Render Carousel Slides with Clean Crossfade */}
        {slides.map((item, index) => {
          const isActive = index === (currentSlide % slides.length);
          const isFullImage = item.displayMode === 'full_image';

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
                transition: 'opacity 0.4s ease-in-out',
                pointerEvents: isActive ? 'auto' : 'none',
                width: '100%'
              }}
            >
              {/* Clean Responsive Picture Tag: Preserves 100% natural colors and clarity */}
              <picture style={{ width: '100%', display: 'block' }}>
                {item.imageMobile && (
                  <source media="(max-width: 767px)" srcSet={item.imageMobile} />
                )}
                <img
                  src={item.imageDesktop}
                  alt={item.headlineLine1?.[isTe ? 'te' : 'en'] || 'Sai Deveena Traders'}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: isFullImage ? '480px' : '420px',
                    objectFit: isFullImage ? 'contain' : 'cover',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '16px'
                  }}
                />
              </picture>

              {/* CONTENT OVERLAY MODE ONLY: Rendered ONLY if displayMode is content_overlay */}
              {!isFullImage && item.headlineLine1 && (
                <>
                  {/* Subtle Contrast Wash: active only in overlay mode */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 2,
                      pointerEvents: 'none',
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.92) 75%, rgba(255,255,255,0.98) 100%)'
                    }}
                  />

                  {/* Headline & CTA Card */}
                  <div
                    className="overlay-headline-wrapper"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 3,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      padding: '1.5rem 3rem 1.5rem 1.5rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      className="overlay-headline-card"
                      style={{
                        maxWidth: '460px',
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '18px',
                        padding: '1.5rem 2rem',
                        border: '1.5px solid rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                        textAlign: 'left'
                      }}
                    >
                      {item.subLabel && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            marginBottom: '0.5rem',
                            border: '1px solid #86efac'
                          }}
                        >
                          {renderCategoryIcon(item.iconType, 13)}
                          <span>{isTe ? item.subLabel.te : item.subLabel.en}</span>
                        </div>
                      )}

                      <h2
                        style={{
                          fontSize: 'clamp(1.2rem, 2.4vw, 1.95rem)',
                          fontWeight: 800,
                          color: '#15803d',
                          margin: 0,
                          lineHeight: 1.18,
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {isTe ? item.headlineLine1.te : item.headlineLine1.en}
                      </h2>

                      {item.headlineLine2 && (
                        <h3
                          style={{
                            fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
                            fontWeight: 900,
                            color: '#14532d',
                            margin: '0.25rem 0 0.85rem 0',
                            lineHeight: 1.18
                          }}
                        >
                          {isTe ? item.headlineLine2.te : item.headlineLine2.en}
                        </h3>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBannerClick(item);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #16a34a, #15803d)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '0.6rem 1.35rem',
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)',
                          marginTop: item.headlineLine2 ? '0' : '0.75rem',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        <span>{isTe ? (item.buttonText?.te || 'ఇప్పుడు చూడండి') : (item.buttonText?.en || 'Shop Now')}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Small, Clean, Professional Carousel Chevron Arrows (Shown only if > 1 banner) */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Banner"
            className="clean-chevron-btn"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {slides.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Banner"
            className="clean-chevron-btn"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Small, Clean Capsule Pagination Indicators (Shown only if > 1 banner) */}
        {slides.length > 1 && (
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
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '3px 8px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {slides.map((b, idx) => {
              const isActive = idx === (currentSlide % slides.length);
              return (
                <button
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: isActive ? '18px' : '5px',
                    height: '5px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.65)',
                    boxShadow: isActive ? '0 0 6px rgba(34, 197, 94, 0.85)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.2s ease'
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .clean-chevron-btn:hover {
          background-color: #ffffff !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
        @media (max-width: 767px) {
          .overlay-headline-wrapper {
            padding: 0.6rem 0.85rem !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .overlay-headline-card {
            max-width: 100% !important;
            padding: 0.85rem 1rem !important;
          }
          .clean-chevron-btn {
            width: 26px !important;
            height: 26px !important;
            left: 0.35rem !important;
          }
          .clean-chevron-btn:last-of-type {
            right: 0.35rem !important;
            left: auto !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
