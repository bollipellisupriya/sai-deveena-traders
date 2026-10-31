import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, ArrowRight, Truck, ShieldCheck, MessageCircle, Phone, Award, Sparkles, X, Star, MapPin, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import type { Product, Category, Language, Banner } from '../../types';
import { bannerService } from '../../services/bannerService';
import { Hero } from '../Hero';

interface MobileHomeScreenProps {
  products: Product[];
  categories: Category[];
  currentLang: Language;
  onLanguageChange?: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onViewAllProducts: () => void;
  onViewAllCategories: () => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
  onCustomerAction?: (action: 'call' | 'whatsapp', product?: Product, customText?: string) => void;
}

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  products,
  categories,
  currentLang,
  onLanguageChange: _onLanguageChange,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectProduct,
  onViewAllProducts,
  onViewAllCategories,
  wishlist,
  onToggleWishlist,
  onCustomerAction
}) => {
  const isTe = currentLang === 'te';
  const [liveBanners, setLiveBanners] = useState<Banner[]>([]);

  useEffect(() => {
    let mounted = true;
    bannerService.fetchActiveBanners()
      .then((res) => {
        if (mounted) {
          setLiveBanners(res || []);
        }
      })
      .catch((err) => {
        console.warn('Could not load active banners:', err);
        if (mounted) {
          setLiveBanners([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Capitalize and format category labels cleanly (e.g. 'growth-promoters' -> 'Growth Promoters')
  const formatCategoryTitle = (rawName: string) => {
    if (!rawName) return '';
    if (isTe) return rawName;
    return rawName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Fallback image resolver when uploaded image URL is missing or fails
  const getCategoryFallbackImage = (catId: string): string => {
    switch (catId) {
      case 'seeds': return '/images/categories/seeds.jpg';
      case 'fertilizers': return '/images/categories/fertilizers.jpg';
      case 'crop-protection':
      case 'cropcare': return '/images/categories/crop-protection.jpg';
      case 'tools':
      case 'household': return '/images/categories/tools.jpg';
      case 'irrigation': return '/images/categories/irrigation.jpg';
      case 'groceries':
      case 'cleaning':
      case 'personal-care':
      case 'other': return '/images/categories/other.jpg';
      case 'more': return '/images/categories/quick-more.svg';
      default: return '/images/categories/seeds.jpg';
    }
  };

  // Dynamic categories directly from active Supabase categories
  const dynamicCategories = categories.map(c => {
    const fallback = getCategoryFallbackImage(c.id);
    const validImage = c.image && typeof c.image === 'string' && c.image.trim().length > 0
      ? c.image.trim()
      : fallback;

    return {
      id: c.id,
      label: formatCategoryTitle(c.name[currentLang] || c.name.en),
      iconImg: validImage,
      fallbackImg: fallback
    };
  });

  // Dynamic quick categories grid (first 7 + "More" if many categories, or all categories)
  const quickCategories = dynamicCategories.length > 0
    ? (dynamicCategories.length > 8
        ? [...dynamicCategories.slice(0, 7), { id: 'more', label: isTe ? 'మరిన్ని' : 'More', iconImg: '/images/categories/quick-more.svg', fallbackImg: '/images/categories/quick-more.svg' }]
        : dynamicCategories)
    : [];

  // Best Selling Products for the horizontal shelf
  const bestSellers = products.filter(p => p.featured || p.inStock !== false).slice(0, 6);

  // Live real-time filtered products when searchQuery is entered
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const enName = (p.name?.en || '').toLowerCase();
      const teName = (p.name?.te || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const descEn = (p.description?.en || '').toLowerCase();
      const descTe = (p.description?.te || '').toLowerCase();
      return enName.includes(q) || teName.includes(q) || cat.includes(q) || descEn.includes(q) || descTe.includes(q);
    });
  }, [products, searchQuery]);

  // Quick WhatsApp order for a product (guarded by Supabase phone auth)
  const handleQuickOrder = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomerAction) {
      onCustomerAction('whatsapp', prod);
    } else {
      const text = encodeURIComponent(
        `Hello Sai Deveena Traders & General Store, I want to order:\n- Product: ${prod.name.en} (${prod.name.te})\n- Price: ₹${prod.price}\nPlease confirm availability and delivery to Bhainsa.`
      );
      window.open(`https://wa.me/919010454541?text=${text}`, '_blank');
    }
  };

  return (
    <div style={{
      paddingBottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#f8fafc',
      overflowX: 'clip'
    }}>
      {/* 1. Sleek, Modern, Centered Search Bar */}
      <section className="home-search-section">
        <div className="home-search-bar-container">
          <div className="home-search-bar-inner">
            {/* Glowing Search Bar Pill */}
            <div className="home-search-pill">
              {/* Left Search Icon */}
              <Search
                size={19}
                strokeWidth={2.4}
                style={{
                  position: 'absolute',
                  left: '16px',
                  color: '#16a34a',
                  pointerEvents: 'none'
                }}
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isTe ? "విత్తనాలు, ఎరువులు, పురుగుమందులు వెతకండి..." : "Search seeds, fertilizers, pesticides..."}
                style={{
                  paddingRight: searchQuery ? '7.5rem' : '6rem'
                }}
              />

              {/* Clear (X) Button when query is typed */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '6.2rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#cbd5e1')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                >
                  <X size={13} />
                </button>
              )}

              {/* Search Submit / Action Pill Button */}
              <button
                type="button"
                aria-label="Search"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '38px',
                  padding: '0 16px',
                  borderRadius: '9999px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  boxShadow: '0 2px 8px rgba(21, 128, 61, 0.28)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#166534')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
              >
                <Search size={14} strokeWidth={2.5} />
                <span>{isTe ? 'వెతకండి' : 'Search'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Conditionally Render Search Results OR Home Screen Content */}
      {searchQuery.trim().length > 0 ? (
        <div className="home-main-content-container" style={{ padding: '1rem' }}>
          {/* Search Results Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1.5px solid #e2e8f0'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {isTe ? `"${searchQuery}" శోధన ఫలితాలు` : `Results for "${searchQuery}"`}
              </h3>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                {searchResults.length} {isTe ? 'ఉత్పత్తులు కనుగొనబడ్డాయి' : 'products found'}
              </span>
            </div>
            <button
              onClick={() => onSearchChange('')}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '9999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              {isTe ? 'శోధనను క్లియర్ చేయండి' : 'Clear Search'}
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div
              className="responsive-product-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem'
              }}
            >
              {searchResults.map((prod) => {
                const isWishlisted = wishlist.has(prod.id);
                const name = prod.name[currentLang] || prod.name.en;
                const hasDiscount = prod.originalPrice && prod.price && prod.originalPrice > prod.price;
                const discountPercent = hasDiscount
                  ? Math.round(((prod.originalPrice! - prod.price!) / prod.originalPrice!) * 100)
                  : null;

                return (
                  <div
                    key={prod.id}
                    className="product-card-modern"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      border: '1.5px solid #e2e8f0',
                      padding: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box',
                      position: 'relative',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      overflow: 'hidden'
                    }}
                    onClick={() => onSelectProduct(prod)}
                  >
                    <div>
                      {/* Badge Pill */}
                      {hasDiscount ? (
                        <span style={{
                          position: 'absolute',
                          top: '0.7rem',
                          left: '0.7rem',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          zIndex: 3,
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                        }}>
                          {discountPercent}% OFF
                        </span>
                      ) : (
                        <span style={{
                          position: 'absolute',
                          top: '0.7rem',
                          left: '0.7rem',
                          background: 'linear-gradient(135deg, #15803d, #16a34a)',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          zIndex: 3,
                          letterSpacing: '0.02em',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                        }}>
                          {isTe ? 'అసలైనది' : 'GENUINE'}
                        </span>
                      )}

                      {/* Wishlist Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(prod.id);
                        }}
                        aria-label="Wishlist"
                        style={{
                          position: 'absolute',
                          top: '0.65rem',
                          right: '0.65rem',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(6px)',
                          border: isWishlisted ? '1px solid #fecaca' : '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: isWishlisted ? '#dc2626' : '#94a3b8',
                          zIndex: 3,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                      >
                        <Heart size={15} fill={isWishlisted ? '#dc2626' : 'none'} />
                      </button>

                      {/* Product Image */}
                      <div style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem',
                        position: 'relative'
                      }}>
                        <img
                          src={prod.image || '/logo-icon.png'}
                          alt={name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '0.45rem',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-icon.png';
                          }}
                        />
                      </div>

                      {/* Product Name */}
                      <div style={{
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        lineHeight: 1.25,
                        minHeight: '2.2rem',
                        maxHeight: '2.2rem',
                        marginBottom: '0.4rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {name}
                      </div>

                      {/* Price Block */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.35rem',
                        marginBottom: '0.65rem'
                      }}>
                        <span style={{
                          fontSize: '1.02rem',
                          fontWeight: 900,
                          color: '#0f172a'
                        }}>
                          {prod.price !== null ? `₹${prod.price}` : (isTe ? 'ధర కోసం సంప్రదించండి' : 'Contact for Price')}
                        </span>
                        {hasDiscount && (
                          <span style={{
                            fontSize: '0.74rem',
                            color: '#94a3b8',
                            textDecoration: 'line-through',
                            fontWeight: 600
                          }}>
                            ₹{prod.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Message & Call */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.35rem',
                      marginTop: 'auto'
                    }}>
                      <button
                        onClick={(e) => handleQuickOrder(prod, e)}
                        title={isTe ? 'వాట్సాప్‌లో మెసేజ్ చేయండి' : 'Chat on WhatsApp'}
                        style={{
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.52rem 0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.28)',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <MessageCircle size={14} style={{ flexShrink: 0 }} />
                        <span>{isTe ? 'మెసేజ్' : 'Chat'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCustomerAction) {
                            onCustomerAction('call', prod);
                          } else {
                            window.location.href = 'tel:9010454541';
                          }
                        }}
                        title={isTe ? 'స్టోర్‌కు కాల్ చేయండి' : 'Call Store'}
                        style={{
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          border: '1.5px solid #86efac',
                          borderRadius: '10px',
                          padding: '0.52rem 0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.06)',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Phone size={13} style={{ flexShrink: 0, color: '#ea580c' }} />
                        <span>{isTe ? 'కాల్' : 'Call'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1.5px dashed #cbd5e1'
            }}>
              <Search size={42} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                {isTe ? `"${searchQuery}" కి ఉత్పత్తులు కనుగొనబడలేదు` : `No products found for "${searchQuery}"`}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                {isTe ? 'దయచేసి సరైన పేరుతో మళ్ళీ ప్రయత్నించండి లేదా కేటలాగ్ చూడండి.' : 'Try searching for seeds, fertilizers, pesticides, or browse all categories.'}
              </p>
              <button
                onClick={() => onSearchChange('')}
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isTe ? 'అన్ని ఉత్పత్తులు చూడండి' : 'Show All Products'}
              </button>
            </div>
          )}
        </div>
      ) : (
      <div className="home-main-content-container" style={{ padding: '0.85rem 1rem 1rem' }}>
        {/* 2. Admin Added Banners Hero Carousel (renders only when admin has added active banners) */}
        {liveBanners.length > 0 && (
          <div style={{ marginBottom: '1.15rem' }}>
            <Hero
              currentLang={currentLang}
              banners={liveBanners}
              categories={categories}
              onExploreClick={onViewAllProducts}
              onSelectCategory={onSelectCategory}
            />
          </div>
        )}

        {/* 3. Circular Quick Category Navigation (Prominently placed right under Hero) */}
        {quickCategories.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1rem 0.75rem 0.85rem',
            marginBottom: '1.15rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '0.35rem',
              paddingRight: '0.35rem',
              marginBottom: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                  {isTe ? 'ప్రసిద్ధ విభాగాలు' : 'Quick Categories'}
                </span>
              </div>
              <button
                type="button"
                onClick={onViewAllCategories}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <span>{isTe ? 'అన్నీ చూడండి' : 'See All'}</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div
              className="responsive-quick-cats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.85rem 0.4rem',
                textAlign: 'center'
              }}
            >
              {quickCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'more') {
                      onViewAllCategories();
                    } else {
                      onSelectCategory(cat.id);
                    }
                  }}
                  className="quick-cat-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Circular Category Image Container (Full-bleed, circular crop) */}
                  <div
                    className="quick-cat-avatar category-image-container"
                    style={{
                      borderRadius: '50%',
                      border: '2px solid #86efac',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: 0,
                      margin: '0 auto 0.45rem auto',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <img
                      src={cat.iconImg}
                      alt={cat.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        borderRadius: '50%'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = (cat as any).fallbackImg || getCategoryFallbackImage(cat.id);
                        if (target.src !== fallback && !target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                  <span
                    className="quick-cat-label"
                    style={{
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.25,
                      maxHeight: '2.4rem',
                      overflow: 'hidden'
                    }}
                  >
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Balanced 4-Card Trust & Highlights Strip (2x2 on mobile, 4 in a row on desktop) */}
        <div
          className="responsive-highlights-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* Card 1: Doorstep Delivery */}
          <a
            href="https://wa.me/919010454541?text=Hello%20Sai%20Deveena%20Traders,%20I%20want%20to%20inquire%20about%20farm%20doorstep%20delivery%20to%20my%20village."
            target="_blank"
            rel="noopener noreferrer"
            className="highlight-card-modern"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(145deg, #fffaf5 0%, #ffedd5 100%)',
              border: '1.5px solid #fed7aa',
              borderRadius: '16px',
              padding: '0.85rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 3px 12px rgba(234, 88, 12, 0.08)',
              transition: 'all 0.25s ease'
            }}
          >
            <div>
              {/* Header: Icon & Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                gap: '0.35rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 8px rgba(234, 88, 12, 0.3)'
                }}>
                  <Truck size={17} />
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: '#ea580c',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid #fed7aa',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}>
                  FREE &gt; ₹999
                </span>
              </div>

              {/* Title & Micro-desc */}
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 900,
                color: '#9a3412',
                lineHeight: 1.25,
                marginBottom: '0.15rem'
              }}>
                {isTe ? 'పొలాల డెలివరీ' : 'Farm Delivery'}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#c2410c',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '0.55rem'
              }}>
                {isTe ? 'గ్రామాలకు ఉచిత రవాణా' : 'Direct to village'}
              </div>
            </div>

            {/* Bottom Link */}
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#ea580c',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginTop: 'auto'
            }}>
              <span>{isTe ? 'వాట్సాప్ ఆర్డర్' : 'WhatsApp Book'}</span>
              <ArrowRight size={12} />
            </div>
          </a>

          {/* Card 2: 100% Certified Genuine Brands */}
          <div
            onClick={() => onSelectCategory('seeds')}
            className="highlight-card-modern"
            style={{
              background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1.5px solid #86efac',
              borderRadius: '16px',
              padding: '0.85rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 3px 12px rgba(22, 101, 52, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div>
              {/* Header: Icon & Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                gap: '0.35rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 8px rgba(21, 128, 61, 0.3)'
                }}>
                  <ShieldCheck size={17} />
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: '#15803d',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid #bbf7d0',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}>
                  CERTIFIED
                </span>
              </div>

              {/* Title & Micro-desc */}
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 900,
                color: '#14532d',
                lineHeight: 1.25,
                marginBottom: '0.15rem'
              }}>
                {isTe ? '100% అసలైనవి' : '100% Genuine'}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#166534',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '0.55rem'
              }}>
                {isTe ? 'ధృవీకరించిన విత్తనాలు' : 'Govt verified stocks'}
              </div>
            </div>

            {/* Bottom Link */}
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#15803d',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginTop: 'auto'
            }}>
              <span>{isTe ? 'నాణ్యత గ్యారెంటీ' : 'Certified Seeds'}</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 3: Free Agronomist Advice */}
          <a
            href="tel:9010454541"
            className="highlight-card-modern"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1.5px solid #bae6fd',
              borderRadius: '16px',
              padding: '0.85rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 3px 12px rgba(2, 132, 199, 0.08)',
              transition: 'all 0.25s ease'
            }}
          >
            <div>
              {/* Header: Icon & Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                gap: '0.35rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 8px rgba(2, 132, 199, 0.3)'
                }}>
                  <Phone size={17} />
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: '#0284c7',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid #bae6fd',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}>
                  FREE CALL
                </span>
              </div>

              {/* Title & Micro-desc */}
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 900,
                color: '#0369a1',
                lineHeight: 1.25,
                marginBottom: '0.15rem'
              }}>
                {isTe ? 'ఉచిత సలహాలు' : 'Crop Advice'}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#0284c7',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '0.55rem'
              }}>
                {isTe ? 'అనుభవజ్ఞులైన సలహాలు' : 'Dial 9010454541'}
              </div>
            </div>

            {/* Bottom Link */}
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginTop: 'auto'
            }}>
              <span>{isTe ? 'ఇప్పుడే మాట్లాడండి' : 'Call Store'}</span>
              <ArrowRight size={12} />
            </div>
          </a>

          {/* Card 4: Best Wholesale & Retail Price */}
          <div
            onClick={onViewAllProducts}
            className="highlight-card-modern"
            style={{
              background: 'linear-gradient(145deg, #fefce8 0%, #fef9c3 100%)',
              border: '1.5px solid #fde047',
              borderRadius: '16px',
              padding: '0.85rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 3px 12px rgba(161, 98, 7, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div>
              {/* Header: Icon & Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                gap: '0.35rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#ca8a04',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 8px rgba(202, 138, 4, 0.3)'
                }}>
                  <MessageCircle size={17} />
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: '#a16207',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid #fde047',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}>
                  WHOLESALE
                </span>
              </div>

              {/* Title & Micro-desc */}
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 900,
                color: '#854d0e',
                lineHeight: 1.25,
                marginBottom: '0.15rem'
              }}>
                {isTe ? 'సరసమైన ధరలు' : 'Best Prices'}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#a16207',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '0.55rem'
              }}>
                {isTe ? 'హోల్‌సేల్ & రీటైల్ రేట్లు' : 'Factory direct rates'}
              </div>
            </div>

            {/* Bottom Link */}
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#ca8a04',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginTop: 'auto'
            }}>
              <span>{isTe ? 'ధరల వివరాలు' : 'Check Rates'}</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>

        {/* 7. Best Selling Products Section */}
        {bestSellers.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                  {isTe ? 'అత్యధికంగా అమ్ముడవుతున్న ఉత్పత్తులు' : 'Best Selling Products'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  {isTe ? 'రైతుల విశ్వసనీయ ఎంపికలు' : 'Trusted by top farmers in Telangana'}
                </span>
              </div>
              <button
                onClick={onViewAllProducts}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <span>{isTe ? 'అన్నీ చూడండి' : 'See All'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Product Cards Grid (Responsive 2 cols on mobile, 3-4 cols on desktop) */}
            <div
              className="responsive-product-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem'
              }}
            >
              {bestSellers.map((prod) => {
                const isWishlisted = wishlist.has(prod.id);
                const name = prod.name[currentLang] || prod.name.en;
                const hasDiscount = prod.originalPrice && prod.price && prod.originalPrice > prod.price;
                const discountPercent = hasDiscount
                  ? Math.round(((prod.originalPrice! - prod.price!) / prod.originalPrice!) * 100)
                  : null;

                return (
                  <div
                    key={prod.id}
                    className="product-card-modern"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      border: '1.5px solid #e2e8f0',
                      padding: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box',
                      position: 'relative',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      overflow: 'hidden'
                    }}
                    onClick={() => onSelectProduct(prod)}
                  >
                    <div>
                      {/* Badge Pill: Discount or 100% Genuine */}
                      {hasDiscount ? (
                        <span style={{
                          position: 'absolute',
                          top: '0.7rem',
                          left: '0.7rem',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          zIndex: 3,
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                        }}>
                          {discountPercent}% OFF
                        </span>
                      ) : (
                        <span style={{
                          position: 'absolute',
                          top: '0.7rem',
                          left: '0.7rem',
                          background: 'linear-gradient(135deg, #15803d, #16a34a)',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          zIndex: 3,
                          letterSpacing: '0.02em',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                        }}>
                          {isTe ? 'అసలైనది' : 'GENUINE'}
                        </span>
                      )}

                      {/* Wishlist Heart Button (Frosted Pill) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(prod.id);
                        }}
                        aria-label="Wishlist"
                        style={{
                          position: 'absolute',
                          top: '0.65rem',
                          right: '0.65rem',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          cursor: 'pointer',
                          zIndex: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          color: isWishlisted ? '#ef4444' : '#94a3b8',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <Heart size={15} fill={isWishlisted ? '#ef4444' : 'none'} />
                      </button>

                      {/* Product Image Frame with Radial Glow */}
                      <div style={{
                        width: '100%',
                        height: '125px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.55rem',
                        background: 'radial-gradient(circle, #f0fdf4 0%, #ffffff 80%)',
                        borderRadius: '12px',
                        padding: '6px'
                      }}>
                        <img
                          src={prod.image || '/images/products/paddy-seeds-pouch.svg'}
                          alt={name}
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.05))',
                            transition: 'transform 0.25s ease'
                          }}
                        />
                      </div>

                      {/* Brand & Pack Size Row (Uniform height baseline) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        minHeight: '1.1rem',
                        marginBottom: '0.2rem',
                        overflow: 'hidden'
                      }}>
                        {prod.brand && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: '#15803d',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap'
                          }}>
                            {prod.brand}
                          </span>
                        )}
                        {prod.packSize && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#64748b',
                            whiteSpace: 'nowrap'
                          }}>
                            {prod.brand ? '• ' : ''}{prod.packSize}
                          </span>
                        )}
                      </div>

                      {/* Product Title (Locked 2-line height) */}
                      <div style={{
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        lineHeight: 1.25,
                        minHeight: '2.2rem',
                        maxHeight: '2.2rem',
                        marginBottom: '0.4rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {name}
                      </div>

                      {/* Price Block */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.35rem',
                        marginBottom: '0.65rem'
                      }}>
                        <span style={{
                          fontSize: '1.02rem',
                          fontWeight: 900,
                          color: '#0f172a'
                        }}>
                          {prod.price !== null ? `₹${prod.price}` : (isTe ? 'ధర కోసం సంప్రదించండి' : 'Contact for Price')}
                        </span>
                        {hasDiscount && (
                          <span style={{
                            fontSize: '0.74rem',
                            color: '#94a3b8',
                            textDecoration: 'line-through',
                            fontWeight: 600
                          }}>
                            ₹{prod.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Clear 50/50 Chat & Call (Locked to bottom) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.35rem',
                      marginTop: 'auto'
                    }}>
                      {/* Message/WhatsApp Button */}
                      <button
                        onClick={(e) => handleQuickOrder(prod, e)}
                        title={isTe ? 'వాట్సాప్‌లో మెసేజ్ చేయండి' : 'Chat on WhatsApp'}
                        style={{
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.52rem 0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.28)',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <MessageCircle size={14} style={{ flexShrink: 0 }} />
                        <span>{isTe ? 'మెసేజ్' : 'Chat'}</span>
                      </button>

                      {/* Call Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCustomerAction) {
                            onCustomerAction('call', prod);
                          } else {
                            window.location.href = 'tel:9010454541';
                          }
                        }}
                        title={isTe ? 'స్టోర్‌కు కాల్ చేయండి' : 'Call Store'}
                        style={{
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          border: '1.5px solid #86efac',
                          borderRadius: '10px',
                          padding: '0.52rem 0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.06)',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Phone size={13} style={{ flexShrink: 0, color: '#ea580c' }} />
                        <span>{isTe ? 'కాల్' : 'Call'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. Interactive Seasonal Crop Health Advisory Banner (Compact Mobile & Desktop) */}
        <div style={{
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 55%, #16a34a 100%)',
          borderRadius: '18px',
          padding: '1rem 1.15rem',
          color: '#ffffff',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(20, 83, 45, 0.18)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(134, 239, 172, 0.35)'
        }}>
          {/* Animated decorative glow blob */}
          <div style={{
            position: 'absolute',
            top: '-35px',
            right: '-35px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(134, 239, 172, 0.22) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Line: Pulse Badge + Free Advice Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(5, 46, 22, 0.45)',
              border: '1px solid rgba(134, 239, 172, 0.35)',
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              <span className="pulse-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#dcfce7' }}>
                {isTe ? 'క్రాప్ డాక్టర్ అందుబాటులో ఉన్నారు' : 'Crop Specialist Online'}
              </span>
            </div>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#fef08a', backgroundColor: 'rgba(254, 240, 138, 0.15)', border: '1px solid rgba(254, 240, 138, 0.25)', padding: '2px 7px', borderRadius: '9999px' }}>
              {isTe ? '100% ఉచిత సలహా' : '100% Free Advice'}
            </span>
          </div>

          {/* Punchy Title */}
          <h3 style={{
            fontSize: '0.98rem',
            fontWeight: 900,
            margin: '0 0 0.25rem 0',
            lineHeight: 1.3,
            color: '#ffffff'
          }}>
            {isTe ? 'పంటలో తెగుళ్లు లేదా పురుగు సమస్య ఉందా?' : 'Pest Infestation or Crop Disease?'}
          </h3>

          {/* Concise 1-liner subtitle */}
          <p style={{
            fontSize: '0.76rem',
            color: '#bbf7d0',
            margin: '0 0 0.75rem 0',
            lineHeight: 1.35,
            fontWeight: 500
          }}>
            {isTe
              ? 'వాట్సాప్‌లో ఫోటో పంపండి • సరైన పురుగు మందు మరియు డోసేజ్ సలహా పొందండి.'
              : 'Send crop photo on WhatsApp for instant pesticide & dosage guidance.'}
          </p>

          {/* Dual Action Grid (50% / 50% on mobile so neither button is cut off or long) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <a
              href="https://wa.me/919010454541?text=Hello%20Sai%20Deveena%20Traders,%20I%20need%20expert%20crop%20advisory%20for%20my%20farm."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: '#25d366',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '0.55rem 0.5rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <MessageCircle size={15} />
              <span>{isTe ? 'వాట్సాప్ ఫోటో' : 'WhatsApp Photo'}</span>
            </a>

            <a
              href="tel:9010454541"
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1.2px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '12px',
                padding: '0.55rem 0.5rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <Phone size={14} style={{ color: '#fed7aa' }} />
              <span>{isTe ? 'కాల్ చేయండి' : 'Call 9010454541'}</span>
            </a>
          </div>
        </div>

        {/* 9. Why 15,000+ Farmers Trust Sai Deveena (4 Animated 3D Floating Stat Cards) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '1.5rem 1.25rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.35rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 800,
              marginBottom: '0.45rem',
              border: '1px solid #bbf7d0'
            }}>
              <Sparkles size={13} />
              <span>{isTe ? '15+ సంవత్సరాల నమ్మకమైన సేవ' : '15+ Years of Agricultural Excellence'}</span>
            </div>
            <h4 style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#0f172a',
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.02em'
            }}>
              {isTe ? 'రైతుల మొదటి ఎంపిక - సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్' : 'Why Farmers Trust Sai Deveena Traders & General Store'}
            </h4>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              {isTe ? 'భైంసా & నిర్మల్ జిల్లా రైతులకు అధికారిక సేవా కేంద్రం' : 'Govt Licensed Inputs Distributor • Bhainsa, Telangana'}
            </span>
          </div>

          {/* 4 Interactive Animated Stat Cards */}
          <div
            className="responsive-highlights-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            {/* Metric 1 */}
            <div className="animated-stat-card" style={{
              background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1.5px solid #86efac',
              borderRadius: '16px',
              padding: '1rem 0.85rem',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#15803d', lineHeight: 1.1 }}>
                15,000+
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#14532d', marginTop: '0.25rem' }}>
                {isTe ? 'హ్యాపీ రైతులు' : 'Farmers Served'}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                {isTe ? 'నిర్మల్ & ఆదిలాబాద్' : 'Telangana Region'}
              </div>
            </div>

            {/* Metric 2 */}
            <div className="animated-stat-card" style={{
              background: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)',
              border: '1.5px solid #fdba74',
              borderRadius: '16px',
              padding: '1rem 0.85rem',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ea580c', lineHeight: 1.1 }}>
                100%
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#9a3412', marginTop: '0.25rem' }}>
                {isTe ? 'ధృవీకరించిన నాణ్యత' : 'Govt Certified'}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#c2410c', fontWeight: 600, marginTop: '2px' }}>
                {isTe ? 'అసలైన కంపెనీ స్టాక్స్' : 'Authentic Brands'}
              </div>
            </div>

            {/* Metric 3 */}
            <div className="animated-stat-card" style={{
              background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1.5px solid #7dd3fc',
              borderRadius: '16px',
              padding: '1rem 0.85rem',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0284c7', lineHeight: 1.1 }}>
                24-48h
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0369a1', marginTop: '0.25rem' }}>
                {isTe ? 'పొలాల డెలివరీ' : 'Farm Delivery'}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                {isTe ? 'మీ గ్రామానికే నేరుగా' : 'To Your Village'}
              </div>
            </div>

            {/* Metric 4 */}
            <div className="animated-stat-card" style={{
              background: 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)',
              border: '1.5px solid #fde047',
              borderRadius: '16px',
              padding: '1rem 0.85rem',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(202, 138, 4, 0.08)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ca8a04', lineHeight: 1.1 }}>
                4.9 ★
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#854d0e', marginTop: '0.25rem' }}>
                {isTe ? 'రైతుల రేటింగ్' : 'Farmer Rating'}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#a16207', fontWeight: 600, marginTop: '2px' }}>
                {isTe ? '650+ నమ్మకమైన రివ్యూలు' : '650+ Verified Reviews'}
              </div>
            </div>
          </div>

          {/* Official License Badge Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: '14px',
            padding: '0.65rem 1rem'
          }}>
            <Award size={20} style={{ color: '#15803d', flexShrink: 0 }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#14532d', textAlign: 'center' }}>
              {isTe
                ? 'తెలంగాణ ప్రభుత్వం ఆమోదించిన అధికారిక డీలర్ • లైసెన్స్ నం. BHS/AGRI/2024'
                : 'Govt of Telangana Licensed Agricultural Dealer • Authentic Stocks Guaranteed'}
            </span>
          </div>
        </div>

        {/* 10. Real Farmer Testimonials & Success Stories */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '1.5rem 1.25rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <CheckCircle2 size={13} />
                <span>{isTe ? 'ధృవీకరించబడిన అనుభవాలు' : 'Verified Farmer Voices'}</span>
              </div>
              <h4 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#0f172a', margin: '0.15rem 0 0 0' }}>
                {isTe ? 'రైతుల నిజమైన అనుభవాలు' : 'What Telangana Farmers Say'}
              </h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#eab308" />
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {/* Review 1 */}
            <div className="farmer-review-card" style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308', marginBottom: '0.45rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#eab308" />
                  ))}
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#15803d', marginLeft: '0.35rem' }}>5.0 ★</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                  {isTe
                    ? '"సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ ఇచ్చిన హైబ్రిడ్ పత్తి విత్తనాలతో ఎకరాకు 14 క్వింటాళ్ల దిగుబడి వచ్చింది. నకిలీలు లేని నిజమైన విత్తనాలు!"'
                    : '"Got hybrid cotton seeds from Sai Deveena Traders & General Store. Harvested 14 quintals per acre! 100% genuine products with accurate billing."'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.55rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a' }}>రమేష్ పటేల్ / Ramesh Patel</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>📍 భైంసా (Bhainsa) • పత్తి రైతు</div>
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: '9999px' }}>
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="farmer-review-card" style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308', marginBottom: '0.45rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#eab308" />
                  ))}
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#15803d', marginLeft: '0.35rem' }}>5.0 ★</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                  {isTe
                    ? '"మిర్చి పంటలో ముడత తెగులుకు సరైన మోతాదులో మందు ఇచ్చారు. 3 రోజుల్లోనే పంట పచ్చబడింది. చాలా నమ్మకమైన దుకాణం."'
                    : '"They guided me with the exact dosage for chilli leaf curl disease. The crop recovered within 3 days. Truly trusted store!"'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.55rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a' }}>నర్సయ్య గౌడ్ / Narsaiah Goud</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>📍 నిర్మల్ (Nirmal) • మిర్చి రైతు</div>
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: '9999px' }}>
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="farmer-review-card" style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308', marginBottom: '0.45rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#eab308" />
                  ))}
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#15803d', marginLeft: '0.35rem' }}>5.0 ★</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                  {isTe
                    ? '"హోల్‌సేల్ ధరలకే ఎరువులు మరియు పురుగు మందులు ఇస్తారు. ఊరికి నేరుగా ట్రాక్టర్ డెలివరీ కూడా చేశారు."'
                    : '"Wholesale direct rates on fertilizers and quick farm delivery right to our village. Very helpful store owners."'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.55rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a' }}>గంగారెడ్డి / Ganga Reddy</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>📍 ముథోల్ (Mudhole) • వరి రైతు</div>
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: '9999px' }}>
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 11. Store Hub, Physical Address & Live Direction Button */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '24px',
          padding: '1.5rem 1.25rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
            <MapPin size={18} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isTe ? 'దుకాణం వివరాలు & చిరునామా' : 'Store Location & Timings'}
            </span>
          </div>

          <h4 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 0.45rem 0', color: '#ffffff' }}>
            సాయి దీవెన ట్రేడర్స్ &amp; జనరల్ స్టోర్ • Sai Deveena Traders &amp; General Store
          </h4>

          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45, margin: '0 0 1rem 0' }}>
            {isTe
              ? 'మెయిన్ రోడ్, వ్యవసాయ మార్కెట్ యార్డ్ సమీపంలో, భైంసా, నిర్మల్ జిల్లా, తెలంగాణ - 504103'
              : 'Main Road, Near Agriculture Market Yard, Bhainsa, Nirmal District, Telangana - 504103'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.76rem', marginBottom: '1.25rem' }}>
            <Clock size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span>{isTe ? 'ప్రతిరోజు ఉదయం 7:00 నుండి రాత్రి 9:00 వరకు తెరిచి ఉంటుంది' : 'Open 7 Days a Week • 7:00 AM to 9:00 PM'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="https://maps.google.com/?q=Sai+Deveena+Traders+Bhainsa"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                backgroundColor: '#15803d',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <ExternalLink size={15} />
              <span>{isTe ? 'గూగుల్ మ్యాప్స్‌లో చూడండి' : 'Open in Google Maps'}</span>
            </a>

            <a
              href="tel:9010454541"
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '0.6rem 1.2rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Phone size={14} style={{ color: '#ea580c' }} />
              <span>9010454541</span>
            </a>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
