import React from 'react';
import { Sprout, Layers, ShieldCheck, Droplets, Wrench, Package, ArrowRight, Sparkles } from 'lucide-react';
import type { Category, Product, Language } from '../types';
import { translations } from '../translations';

interface CategorySectionProps {
  categories: Category[];
  products: Product[];
  currentLang: Language;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  products,
  currentLang,
  selectedCategory,
  onSelectCategory
}) => {
  const t = translations[currentLang];

  // Map icon name to Lucide component
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout size={26} />;
      case 'Layers': return <Layers size={26} />;
      case 'ShieldCheck': return <ShieldCheck size={26} />;
      case 'Droplets': return <Droplets size={26} />;
      case 'Wrench': return <Wrench size={26} />;
      case 'Package': return <Package size={26} />;
      default: return <Sprout size={26} />;
    }
  };

  const getCategoryTheme = (id: string, isSelected: boolean) => {
    if (isSelected) {
      return {
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #fff7ed 100%)',
        border: '2px solid #16a34a',
        iconBg: 'linear-gradient(135deg, #15803d, #14532d)',
        iconColor: 'white',
        badgeBg: '#ea580c',
        badgeColor: 'white'
      };
    }
    switch (id) {
      case 'seeds':
        return {
          bg: 'white',
          border: '1.5px solid #bbf7d0',
          iconBg: '#dcfce7',
          iconColor: '#15803d',
          badgeBg: '#dcfce7',
          badgeColor: '#166534'
        };
      case 'fertilizers':
        return {
          bg: 'white',
          border: '1.5px solid #fed7aa',
          iconBg: '#ffedd5',
          iconColor: '#c2410c',
          badgeBg: '#ffedd5',
          badgeColor: '#9a3412'
        };
      case 'crop-protection':
        return {
          bg: 'white',
          border: '1.5px solid #bbf7d0',
          iconBg: '#dcfce7',
          iconColor: '#166534',
          badgeBg: '#dcfce7',
          badgeColor: '#14532d'
        };
      case 'irrigation':
        return {
          bg: 'white',
          border: '1.5px solid #bae6fd',
          iconBg: '#e0f2fe',
          iconColor: '#0369a1',
          badgeBg: '#e0f2fe',
          badgeColor: '#075985'
        };
      default:
        return {
          bg: 'white',
          border: '1.5px solid var(--border-light)',
          iconBg: 'var(--surface-muted)',
          iconColor: 'var(--primary-800)',
          badgeBg: 'var(--surface-muted)',
          badgeColor: 'var(--text-secondary)'
        };
    }
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.category === categoryId && p.active !== false).length;
  };

  return (
    <section id="categories" className="section section-muted" style={{ paddingTop: '1.5rem', paddingBottom: '2.25rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#ea580c',
            fontWeight: 800,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.4rem'
          }}>
            <Sparkles size={16} />
            <span>{currentLang === 'te' ? 'పూర్తి శ్రేణి ఉత్పత్తులు' : 'Complete Agricultural Range'}</span>
          </div>
          <h2 className="section-title">{t.categories.heading}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {t.categories.subheading}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: '1.25rem'
        }}>
          {categories.map((category) => {
            const count = getProductCount(category.id);
            const isSelected = selectedCategory === category.id;
            const theme = getCategoryTheme(category.id, isSelected);
            const categoryName = category.name[currentLang] || category.name.en;
            const categoryDesc = category.description?.[currentLang] || category.description?.en;

            return (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className="card category-card"
                style={{
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  background: isSelected ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' : 'white',
                  border: isSelected ? '2.5px solid #16a34a' : '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: isSelected 
                    ? '0 14px 32px rgba(22, 101, 52, 0.18), 0 0 0 1px rgba(22, 163, 74, 0.3)' 
                    : 'var(--shadow-sm)',
                  position: 'relative',
                  transform: isSelected ? 'translateY(-3px)' : undefined,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCategory(category.id);
                  }
                }}
                aria-pressed={isSelected}
              >
                {/* Category Card Image Header */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '175px',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9'
                }}>
                  <img
                    src={category.image || `/images/categories/${category.id}.jpg`}
                    alt={categoryName}
                    className="category-card-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.45s ease'
                    }}
                    onError={(e) => {
                      // Fallback to SVG or banner if image fails
                      const target = e.currentTarget;
                      if (!target.src.endsWith('.svg')) {
                        target.src = `/images/categories/${category.id}.svg`;
                      }
                    }}
                  />

                  {/* Gradient shadow overlay for legibility */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(0, 0, 0, 0.05) 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Top-Right Item Count Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: isSelected ? '#ea580c' : 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(6px)',
                    color: isSelected ? 'white' : '#0f172a',
                    padding: '0.32rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <span>{count} {currentLang === 'te' ? 'ఉత్పత్తులు' : 'items'}</span>
                  </div>

                  {/* Top-Left Active/Selected Indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      background: '#16a34a',
                      color: 'white',
                      padding: '0.28rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      ✓ {currentLang === 'te' ? 'ఎంపికైంది' : 'Selected'}
                    </div>
                  )}

                  {/* Category Floating Icon on bottom-left of image */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '0.85rem',
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'linear-gradient(135deg, #15803d, #14532d)' : 'white',
                    color: isSelected ? 'white' : theme.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.25s ease'
                  }}>
                    {getCategoryIcon(category.icon)}
                  </div>
                </div>

                {/* Card Body Information */}
                <div style={{
                  padding: '1.25rem 1.4rem 1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.22rem',
                      fontWeight: 800,
                      color: 'var(--primary-950)',
                      marginBottom: '0.45rem',
                      lineHeight: 1.3
                    }}>
                      {categoryName}
                    </h3>

                    {categoryDesc && (
                      <p style={{
                        fontSize: '0.86rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {categoryDesc}
                      </p>
                    )}
                  </div>

                  {/* View Products Action Link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: isSelected ? '#ea580c' : 'var(--primary-700)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <span>{t.categories.viewCategory}</span>
                    <ArrowRight size={16} className="category-card-arrow" style={{ transition: 'transform 0.25s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .category-card:hover .category-card-img {
          transform: scale(1.08);
        }
        .category-card:hover .category-card-arrow {
          transform: translateX(5px);
        }
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
        }
      `}</style>
    </section>
  );
};
