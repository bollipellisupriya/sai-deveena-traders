import React, { useState, useEffect, useCallback } from 'react';
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
import type { Language, Category } from '../types';

export interface HeroProps {
  currentLang?: Language;
  categories?: Category[];
  onExploreClick?: () => void;
  onContactClick?: () => void;
  onSelectCategory?: (categoryId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CategoryBannerSlide {
  id: number;
  categoryId: string;
  categoryName: {
    en: string;
    te: string;
  };
  iconType: 'seeds' | 'fertilizers' | 'crop-protection' | 'tools' | 'groceries';
  bgImage: string;
  fallbackImage: string;
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
  buttonText: {
    en: string;
    te: string;
  };
  badgeText: {
    en: string;
    te: string;
  };
  objectPosition?: string;
}

const CATEGORY_SLIDES: CategoryBannerSlide[] = [
  {
    id: 1,
    categoryId: 'seeds',
    categoryName: {
      en: 'Seeds',
      te: 'విత్తనాలు'
    },
    iconType: 'seeds',
    bgImage: '/images/bighaat-seeds-banner.jpg',
    fallbackImage: '/images/categories/seeds.jpg',
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
    badgeText: {
      en: '100% Germination Tested',
      te: '100% మొలక శాతం పరీక్షితం'
    },
    buttonText: {
      en: 'Explore Seeds',
      te: 'విత్తనాలు చూడండి'
    },
    objectPosition: 'left 15%'
  },
  {
    id: 2,
    categoryId: 'fertilizers',
    categoryName: {
      en: 'Fertilizers',
      te: 'ఎరువులు'
    },
    iconType: 'fertilizers',
    bgImage: '/images/bighaat-fert-banner.jpg',
    fallbackImage: '/images/categories/fertilizers.jpg',
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
    badgeText: {
      en: 'Govt Certified Brands',
      te: 'ధృవీకృత నాణ్యత'
    },
    buttonText: {
      en: 'Explore Fertilizers',
      te: 'ఎరువులు చూడండి'
    },
    objectPosition: 'left 15%'
  },
  {
    id: 3,
    categoryId: 'crop-protection',
    categoryName: {
      en: 'Crop Care',
      te: 'పంట రక్షణ'
    },
    iconType: 'crop-protection',
    bgImage: '/images/categories/crop-protection.jpg',
    fallbackImage: '/images/categories/crop-protection.jpg',
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
    badgeText: {
      en: 'Effective Pest Control',
      te: 'సంపూర్ణ పంట సంరక్షణ'
    },
    buttonText: {
      en: 'Shop Crop Care',
      te: 'పంట రక్షణ చూడండి'
    },
    objectPosition: 'center 35%'
  },
  {
    id: 4,
    categoryId: 'tools',
    categoryName: {
      en: 'Farm Tools',
      te: 'పరికరాలు'
    },
    iconType: 'tools',
    bgImage: '/images/categories/irrigation.jpg',
    fallbackImage: '/images/categories/tools.jpg',
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
    badgeText: {
      en: 'Durable & Farm Tested',
      te: 'మన్నికైన పరికరాలు'
    },
    buttonText: {
      en: 'Shop Farm Tools',
      te: 'పరికరాలు చూడండి'
    },
    objectPosition: 'center 40%'
  },
  {
    id: 5,
    categoryId: 'groceries',
    categoryName: {
      en: 'Groceries',
      te: 'కిరాణా'
    },
    iconType: 'groceries',
    bgImage: '/images/categories/other.jpg',
    fallbackImage: '/images/banner-1.jpg',
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
    badgeText: {
      en: 'Wholesale Rates',
      te: 'హోల్‌సేల్ ధరలు'
    },
    buttonText: {
      en: 'Shop Groceries',
      te: 'కిరాణా చూడండి'
    },
    objectPosition: 'center 30%'
  }
];

export const Hero: React.FC<HeroProps> = ({
  currentLang = 'en',
  categories = [],
  onExploreClick,
  onSelectCategory,
  className = '',
  style = {}
}) => {
  const isTe = currentLang === 'te';
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Helper to map slide icon
  const renderCategoryIcon = (iconType: CategoryBannerSlide['iconType'], size = 14) => {
    switch (iconType) {
      case 'seeds':
        return <Sprout size={size} />;
      case 'fertilizers':
        return <Layers size={size} />;
      case 'crop-protection':
        return <ShieldCheck size={size} />;
      case 'tools':
        return <Wrench size={size} />;
      case 'groceries':
        return <ShoppingBag size={size} />;
      default:
        return <Sprout size={size} />;
    }
  };

  // Smart resolution to find matching database category ID
  const resolveTargetCategoryId = useCallback((targetKey: string): string => {
    if (!categories || categories.length === 0) return targetKey;

    // 1. Direct ID match
    const direct = categories.find(c => c.id.toLowerCase() === targetKey.toLowerCase());
    if (direct) return direct.id;

    // 2. Fuzzy match by name or subcategory
    const fuzzy = categories.find(c => {
      const id = (c.id || '').toLowerCase();
      const en = (c.name?.en || '').toLowerCase();
      const te = (c.name?.te || '').toLowerCase();

      if (targetKey === 'seeds') {
        return id.includes('seed') || en.includes('seed') || te.includes('విత్తన');
      }
      if (targetKey === 'fertilizers') {
        return id.includes('fert') || en.includes('fert') || te.includes('ఎరువు');
      }
      if (targetKey === 'crop-protection') {
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
      if (targetKey === 'tools') {
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
  }, [categories]);

  // Navigate to category or callback
  const handleCategoryClick = useCallback((targetCatKey: string) => {
    const finalId = resolveTargetCategoryId(targetCatKey);
    if (onSelectCategory) {
      onSelectCategory(finalId);
    } else if (onExploreClick) {
      onExploreClick();
    } else {
      const catalogueEl = document.getElementById('catalogue') || document.getElementById('categories');
      if (catalogueEl) {
        catalogueEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = '#categories';
      }
    }
  }, [onSelectCategory, onExploreClick, resolveTargetCategoryId]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % CATEGORY_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + CATEGORY_SLIDES.length) % CATEGORY_SLIDES.length);
  }, []);

  // Automatic scrolling every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = CATEGORY_SLIDES[currentSlide];

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
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        ...style
      }}
    >
      {/* 1. Main Banner Body Area */}
      <div
        className="bighaat-banner-body"
        onClick={() => handleCategoryClick(slide.categoryId)}
        style={{
          position: 'relative',
          minHeight: '420px',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          cursor: 'pointer'
        }}
        title={`View ${isTe ? slide.categoryName.te : slide.categoryName.en} Category`}
      >
        {/* Active Banner Background Photography with Smooth Crossfade */}
        {CATEGORY_SLIDES.map((item, index) => {
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
                transform: isActive ? 'scale(1)' : 'scale(1.03)',
                transition: 'opacity 0.65s ease-in-out, transform 0.8s ease-out',
                pointerEvents: 'none'
              }}
            >
              <img
                src={item.bgImage}
                alt={`${item.categoryName.en} Banner - Sai Deveena Traders`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = item.fallbackImage;
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: item.objectPosition || 'center center'
                }}
              />
            </div>
          );
        })}

        {/* Soft, Translucent Light Wash on Right for Text Crispness */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.88) 72%, rgba(255, 255, 255, 0.96) 100%)'
          }}
        />

        {/* Clean Headline & CTA Card */}
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
            {/* Category Tag Pill */}
            <div
              className="bighaat-sub-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                marginBottom: '0.55rem',
                border: '1.5px solid #86efac',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.12)'
              }}
            >
              {renderCategoryIcon(slide.iconType, 13)}
              <span>{isTe ? slide.subLabel.te : slide.subLabel.en}</span>
            </div>

            {/* Headline Line 1 */}
            <h2
              className="bighaat-title-1"
              style={{
                fontSize: 'clamp(1.25rem, 2.8vw, 2.2rem)',
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

            {/* Headline Line 2 */}
            <h2
              className="bighaat-title-2"
              style={{
                fontSize: 'clamp(1.35rem, 3.2vw, 2.45rem)',
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick(slide.categoryId);
              }}
              className="bighaat-btn-primary"
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
              {renderCategoryIcon(slide.iconType, 16)}
              <span>{isTe ? slide.buttonText.te : slide.buttonText.en}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Previous Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Category Banner"
          className="bighaat-chevron-btn"
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
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Category Banner"
          className="bighaat-chevron-btn"
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
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronRight size={20} />
        </button>

        {/* Capsule Pagination Indicators */}
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
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}
        >
          {CATEGORY_SLIDES.map((b, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                aria-label={`Go to ${b.categoryName.en} banner`}
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
      </div>

      {/* 2. Interactive Category Tabs Quick Strip */}
      <div
        className="bighaat-category-tabs-strip"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.35rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {CATEGORY_SLIDES.map((item, idx) => {
          const isCurrent = idx === currentSlide;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (isCurrent) {
                  handleCategoryClick(item.categoryId);
                } else {
                  setCurrentSlide(idx);
                }
              }}
              className={`bighaat-cat-chip ${isCurrent ? 'active' : ''}`}
              style={{
                flex: '1 0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: isCurrent ? '0.45rem 0.85rem' : '0.4rem 0.75rem',
                borderRadius: '9999px',
                border: isCurrent ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                backgroundColor: isCurrent ? '#f0fdf4' : '#f8fafc',
                color: isCurrent ? '#15803d' : '#475569',
                fontSize: '0.78rem',
                fontWeight: isCurrent ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isCurrent ? '0 2px 8px rgba(22, 163, 74, 0.16)' : 'none'
              }}
              title={`Switch to ${isTe ? item.categoryName.te : item.categoryName.en}`}
            >
              <span style={{ display: 'inline-flex', color: isCurrent ? '#16a34a' : '#64748b' }}>
                {renderCategoryIcon(item.iconType, 13)}
              </span>
              <span>{isTe ? item.categoryName.te : item.categoryName.en}</span>
            </button>
          );
        })}
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
          .bighaat-banner-body {
            min-height: 185px !important;
            height: 195px !important;
          }
          .bighaat-headline-block {
            min-height: 185px !important;
            padding: 0.6rem 0.85rem 0.6rem 1rem !important;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.95) 65%, #ffffff 100%) !important;
            justify-content: flex-end !important;
            align-items: center !important;
          }
          .bighaat-headline-card {
            max-width: 64% !important;
            background: transparent !important;
            backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-right: 0 !important;
          }
          .bighaat-sub-pill {
            font-size: 0.58rem !important;
            padding: 0.15rem 0.45rem !important;
            margin-bottom: 0.18rem !important;
          }
          .bighaat-title-1 {
            font-size: 0.9rem !important;
            line-height: 1.15 !important;
          }
          .bighaat-title-2 {
            font-size: 0.98rem !important;
            line-height: 1.15 !important;
            margin: 0.08rem 0 0.35rem 0 !important;
          }
          .bighaat-btn-primary {
            padding: 0.34rem 0.75rem !important;
            font-size: 0.72rem !important;
          }
          .bighaat-chevron-btn {
            width: 28px !important;
            height: 28px !important;
            left: 0.4rem !important;
          }
          .bighaat-chevron-btn:last-of-type {
            right: 0.4rem !important;
            left: auto !important;
          }
          .bighaat-category-tabs-strip {
            padding: 0.5rem 0.65rem !important;
            gap: 0.3rem !important;
          }
          .bighaat-cat-chip {
            font-size: 0.72rem !important;
            padding: 0.35rem 0.65rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
