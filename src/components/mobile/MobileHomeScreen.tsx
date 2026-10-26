import React from 'react';
import { Search, Heart, ArrowRight, Truck, ShieldCheck, MessageCircle, Phone } from 'lucide-react';
import type { Product, Category, Language } from '../../types';
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

  // Dynamic categories directly from active Supabase categories
  const dynamicCategories = categories.map(c => ({
    id: c.id,
    label: c.name[currentLang] || c.name.en,
    iconImg: c.image || '/images/categories/quick-seeds.svg'
  }));

  // Dynamic quick categories grid (first 7 + "More" if many categories, or all categories)
  const quickCategories = dynamicCategories.length > 0
    ? (dynamicCategories.length > 8
        ? [...dynamicCategories.slice(0, 7), { id: 'more', label: isTe ? 'మరిన్ని' : 'More', iconImg: '/images/categories/quick-more.svg' }]
        : dynamicCategories)
    : [];

  // Best Selling Products for the horizontal shelf
  const bestSellers = products.filter(p => p.featured || p.inStock !== false).slice(0, 6);

  // Main categories for "Shop by Category"
  const shopByCategories = categories.slice(0, 6).map(c => ({
    id: c.id,
    name: c.name[currentLang] || c.name.en,
    img: c.image || '/images/categories/quick-seeds.svg'
  }));

  // Quick WhatsApp order for a product (guarded by Supabase phone auth)
  const handleQuickOrder = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomerAction) {
      onCustomerAction('whatsapp', prod);
    } else {
      const text = encodeURIComponent(
        `Hello Sai Deveena Traders, I want to order:\n- Product: ${prod.name.en} (${prod.name.te})\n- Price: ₹${prod.price}\nPlease confirm availability and delivery to Bhainsa.`
      );
      window.open(`https://wa.me/919010454541?text=${text}`, '_blank');
    }
  };

  return (
    <div style={{
      paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#f8fafc',
      overflowX: 'hidden'
    }}>
      {/* 1. Sleek Search Bar */}
      <div style={{ padding: '0.65rem 1rem 0.4rem', backgroundColor: '#ffffff' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0',
          padding: '0.6rem 1rem',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isTe ? "విత్తనాలు, ఎరువులు, కూరగాయలు..." : "Search seeds, fertilizers, vegetables..."}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.86rem',
              color: '#1e293b',
              paddingRight: '1.75rem'
            }}
          />
          <div style={{
            position: 'absolute',
            right: '0.9rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={18} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem' }}>
        {/* 2. Main 3D Organic Video Hero Section */}
        <div style={{ marginBottom: '1rem' }}>
          <Hero
            currentLang={currentLang}
            onExploreClick={onViewAllProducts}
          />
        </div>

        {/* 3. Circular Quick Category Navigation (Prominently placed right under Hero) */}
        {quickCategories.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '0.85rem 0.65rem 0.75rem',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '0.35rem',
              paddingRight: '0.35rem',
              marginBottom: '0.65rem'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                {isTe ? 'ప్రసిద్ధ విభాగాలు' : 'Quick Categories'}
              </span>
              <button
                type="button"
                onClick={onViewAllCategories}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {isTe ? 'అన్నీ చూడండి' : 'See All'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem 0.35rem',
              textAlign: 'center'
            }}>
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
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {/* Circular Avatar */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #dcfce7',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.3rem',
                    padding: '6px',
                    transition: 'transform 0.15s ease'
                  }}>
                    <img
                      src={cat.iconImg}
                      alt={cat.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/categories/quick-seeds.svg';
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#334155',
                    lineHeight: 1.15,
                    maxHeight: '2.3rem',
                    overflow: 'hidden'
                  }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Compact 2-Column Trust & Highlights Strip (Clean & Non-intrusive) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.65rem',
          marginBottom: '1.15rem'
        }}>
          {/* Card 1: Doorstep Delivery */}
          <a
            href="https://wa.me/919010454541?text=Hello%20Sai%20Deveena%20Traders,%20I%20want%20to%20inquire%20about%20farm%20doorstep%20delivery%20to%20my%20village."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: '1px solid #fed7aa',
              borderRadius: '14px',
              padding: '0.75rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Truck size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#9a3412', lineHeight: 1.2 }}>
                  {isTe ? 'పొలాల డెలివరీ' : 'Farm Delivery'}
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ea580c' }}>
                  FREE &gt; ₹999
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#c2410c',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginTop: '0.2rem'
            }}>
              <span>{isTe ? 'ఆర్డర్ చేయండి' : 'WhatsApp Book'}</span>
              <ArrowRight size={11} />
            </div>
          </a>

          {/* Card 2: 100% Certified Genuine Brands */}
          <a
            href="tel:9010454541"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac',
              borderRadius: '14px',
              padding: '0.75rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#15803d',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#14532d', lineHeight: 1.2 }}>
                  {isTe ? '100% అసలైనవి' : '100% Certified'}
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#15803d' }}>
                  GOVT APPROVED
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#166534',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginTop: '0.2rem'
            }}>
              <span>{isTe ? 'సలహాల కోసం కాల్' : 'Call Advice'}</span>
              <ArrowRight size={11} />
            </div>
          </a>
        </div>

        {/* 7. Best Selling Products Section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              {isTe ? 'అత్యధికంగా అమ్ముడవుతున్నవి' : 'Best Selling Products'}
            </h3>
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
                gap: '0.2rem',
                cursor: 'pointer'
              }}
            >
              <span>See All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 2-Column Product Cards Grid (Matching Mobile E-commerce Apps) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}>
            {bestSellers.map((prod) => {
              const isWishlisted = wishlist.has(prod.id);
              const name = prod.name[currentLang] || prod.name.en;
              return (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectProduct(prod)}
                >
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
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 3,
                      padding: 0,
                      color: isWishlisted ? '#ef4444' : '#94a3b8'
                    }}
                  >
                    <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
                  </button>

                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <img
                      src={prod.image || '/images/products/paddy-seeds-pouch.svg'}
                      alt={name}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  {/* Product Title */}
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    minHeight: '2.1rem',
                    marginBottom: '0.35rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {name}
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    marginBottom: '0.65rem'
                  }}>
                    ₹{prod.price}
                  </div>

                  {/* Dual Action Buttons: WhatsApp & Call */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.35rem',
                    marginTop: 'auto'
                  }}>
                    {/* WhatsApp Button */}
                    <button
                      onClick={(e) => handleQuickOrder(prod, e)}
                      title={isTe ? 'వాట్సాప్‌లో ఆర్డర్ చేయండి' : 'Order on WhatsApp'}
                      style={{
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.45rem 0.2rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <MessageCircle size={13} />
                      <span>{isTe ? 'వాట్సాప్' : 'WhatsApp'}</span>
                    </button>

                    {/* Call Button (guarded by Supabase phone auth) */}
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
                      title={isTe ? 'కాల్ ద్వారా ఆర్డర్ చేయండి' : 'Order via Phone Call'}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#15803d',
                        border: '1.5px solid #15803d',
                        borderRadius: '8px',
                        padding: '0.45rem 0.2rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(21, 128, 61, 0.08)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Phone size={13} />
                      <span>{isTe ? 'కాల్' : 'Call'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. Shop by Category Section */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              {isTe ? 'విభాగాల వారిగా షాపింగ్' : 'Shop by Category'}
            </h3>
            <button
              onClick={onViewAllCategories}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                cursor: 'pointer'
              }}
            >
              <span>See All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 4 Category Pill Tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            textAlign: 'center'
          }}>
            {shopByCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.55rem 0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '0.35rem',
                  backgroundColor: '#f1f5f9'
                }}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/categories/quick-seeds.svg';
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  lineHeight: 1.15
                }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
