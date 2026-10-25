import React, { useState } from 'react';
import { Search, Heart, ArrowRight, Truck, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';
import type { Product, Category, Language } from '../../types';

interface MobileHomeScreenProps {
  products: Product[];
  categories: Category[];
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onViewAllProducts: () => void;
  onViewAllCategories: () => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
}

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  products,
  categories,
  currentLang,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectProduct,
  onViewAllProducts,
  onViewAllCategories,
  wishlist,
  onToggleWishlist
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const isTe = currentLang === 'te';

  // 8 Quick categories matching reference image (2 rows of 4)
  const quickCategories = [
    { id: 'seeds', label: isTe ? 'విత్తనాలు' : 'Seeds', iconImg: '/images/categories/quick-seeds.svg' },
    { id: 'fertilizers', label: isTe ? 'ఎరువులు' : 'Fertilizers', iconImg: '/images/categories/quick-fertilizers.svg' },
    { id: 'crop-protection', label: isTe ? 'పంట సంరక్షణ' : 'Crop Care', iconImg: '/images/categories/quick-cropcare.svg' },
    { id: 'groceries', label: isTe ? 'కిరాణా' : 'Groceries', iconImg: '/images/categories/quick-groceries.svg' },
    { id: 'household', label: isTe ? 'గృహోపకరణాలు' : 'Household', iconImg: '/images/categories/quick-household.svg' },
    { id: 'cleaning', label: isTe ? 'క్లీనింగ్' : 'Cleaning', iconImg: '/images/categories/quick-cleaning.svg' },
    { id: 'personal-care', label: isTe ? 'వ్యక్తిగత సంరక్షణ' : 'Personal Care', iconImg: '/images/categories/quick-personal-care.svg' },
    { id: 'more', label: isTe ? 'మరిన్ని' : 'More', iconImg: '/images/categories/quick-more.svg' }
  ];

  // Best Selling Products for the horizontal shelf
  const bestSellers = products.filter(p => p.featured || ['paddy-seed-hy', 'dap-fert-50kg', 'sunflower-oil-1l', 'maize-seed-hy'].includes(p.id)).slice(0, 4);

  // 4 Main categories for "Shop by Category"
  const shopByCategories = categories.slice(0, 4).map(c => ({
    id: c.id,
    name: c.name[currentLang] || c.name.en,
    img: c.image || '/images/categories/seeds.jpg'
  }));

  // Quick WhatsApp order for a product
  const handleQuickOrder = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hello Sai Deveena Traders, I want to order:\n- Product: ${prod.name.en} (${prod.name.te})\n- Price: ₹${prod.price}\nPlease confirm availability and delivery to Bhainsa.`
    );
    window.open(`https://wa.me/919010454541?text=${text}`, '_blank');
  };

  return (
    <div style={{ paddingBottom: '6rem', backgroundColor: '#f8fafc' }}>
      {/* 1. Top Language Selection Bar - Above Search (Simple for customers to use) */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderBottom: '1.5px solid #bbf7d0',
        padding: '0.45rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.78rem',
          fontWeight: 800,
          color: '#15803d'
        }}>
          <Sparkles size={14} style={{ color: '#ea580c' }} />
          <span>{isTe ? 'భాషను ఎంచుకోండి:' : 'Select Language:'}</span>
        </div>

        {/* 2 Big Clear Language Switcher Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#ffffff',
          padding: '2px',
          borderRadius: '9999px',
          border: '1px solid #86efac'
        }}>
          <button
            onClick={() => onLanguageChange('en')}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: currentLang === 'en' ? '#15803d' : 'transparent',
              color: currentLang === 'en' ? '#ffffff' : '#334155',
              fontSize: '0.78rem',
              fontWeight: 900,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('te')}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: currentLang === 'te' ? '#15803d' : 'transparent',
              color: currentLang === 'te' ? '#ffffff' : '#334155',
              fontSize: '0.78rem',
              fontWeight: 900,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* 2. Search Bar Directly Under Header */}
      <div style={{ padding: '0.75rem 1rem 0.5rem', backgroundColor: '#ffffff' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0',
          padding: '0.65rem 1rem'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isTe ? "విత్తనాలు, ఎరువులు, కిరాణా కోసం శోధించండి..." : "Search for seeds, fertilizers, groceries..."}
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
            right: '1rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={18} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0.85rem 1rem' }}>
        {/* 3. Main Hero Promo Banner (Green Card with Telugu headline & smiling farmer) */}
        <div style={{
          position: 'relative',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 55%, #166534 100%)',
          color: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(21, 128, 61, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '175px',
          padding: '1.25rem 1.15rem',
          marginBottom: '1rem'
        }}>
          {/* Left Text & CTA */}
          <div style={{ zIndex: 2, maxWidth: '62%' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '0.35rem',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--font-telugu)'
            }}>
              రైతుల అభివృద్ధి మా లక్ష్యం
            </h2>
            <p style={{
              fontSize: '0.78rem',
              color: '#dcfce7',
              fontWeight: 600,
              marginBottom: '0.85rem',
              lineHeight: 1.3
            }}>
              Quality Products For Better Harvest
            </p>
            <button
              onClick={() => onSelectCategory('seeds')}
              style={{
                backgroundColor: '#052e16',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              <span>Shop Now</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Right Farmer Graphic */}
          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            width: '150px',
            height: '185px',
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            <img
              src="/images/farmer-hero.svg"
              alt="Farmer with thumbs up"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Bottom Center 3 Dots */}
          <div style={{
            position: 'absolute',
            bottom: '0.45rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.35rem',
            zIndex: 3
          }}>
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: activeSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* 4. NEW PROMO BANNER 1: FREE DOORSTEP DELIVERY */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #fefce8 100%)',
          border: '1.5px solid #fde68a',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)',
          marginBottom: '0.85rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#ea580c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)'
          }}>
            <Truck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.15rem'
            }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 900,
                color: '#9a3412',
                lineHeight: 1.2
              }}>
                {isTe ? 'పొలాల వద్దకే ఉచిత డెలివరీ' : 'Free Doorstep Farm Delivery'}
              </span>
              <span style={{
                backgroundColor: '#fed7aa',
                color: '#c2410c',
                fontSize: '0.65rem',
                fontWeight: 900,
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                BHAINSA
              </span>
            </div>
            <p style={{
              fontSize: '0.74rem',
              color: '#78350f',
              margin: 0,
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              {isTe
                ? 'భైంసా మరియు చుట్టుపక్కల గ్రామాల రైతులకు తక్షణ రవాణా సౌకర్యం.'
                : 'Fast delivery for seeds & fertilizers directly to farms & villages.'}
            </p>
          </div>
        </div>

        {/* 5. NEW PROMO BANNER 2: 100% GENUINE & DIRECT WHATSAPP BOOKING */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#15803d',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(21, 128, 61, 0.3)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 900,
              color: '#14532d',
              marginBottom: '0.15rem',
              lineHeight: 1.2
            }}>
              {isTe ? '100% అసలైన ధృవీకృత బ్రాండ్లు' : '100% Certified Genuine Brands'}
            </div>
            <p style={{
              fontSize: '0.74rem',
              color: '#166534',
              margin: 0,
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              {isTe
                ? 'వ్యక్తిగత పంట సంరక్షణ సలహాలు & సరసమైన ప్రభుత్వ నియంత్రిత ధరలు.'
                : 'Government approved rates, genuine seeds & expert farmer guidance.'}
            </p>
          </div>
          <a
            href="https://wa.me/919010454541"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(21, 128, 61, 0.3)'
            }}
            title="Chat on WhatsApp"
          >
            <MessageCircle size={18} />
          </a>
        </div>

        {/* 6. Circular Quick Category Navigation (8 Icons in 2 Rows of 4) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem 0.5rem',
          margin: '0.5rem 0 1.25rem',
          textAlign: 'center'
        }}>
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id === 'more' ? 'seeds' : cat.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {/* Circular Avatar */}
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.35rem',
                padding: '4px',
                transition: 'transform 0.15s ease'
              }}>
                <img
                  src={cat.iconImg}
                  alt={cat.label}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#334155',
                lineHeight: 1.15
              }}>
                {cat.label}
              </span>
            </button>
          ))}
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

          {/* 3-Column Product Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.65rem'
          }}>
            {bestSellers.map((prod) => {
              const isWishlisted = wishlist.has(prod.id);
              const name = prod.name[currentLang] || prod.name.en;
              return (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '0.65rem',
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
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 3,
                      padding: 0,
                      color: isWishlisted ? '#ef4444' : '#94a3b8'
                    }}
                  >
                    <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
                  </button>

                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '95px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.45rem'
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
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    minHeight: '2rem',
                    marginBottom: '0.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {name}
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    marginBottom: '0.55rem'
                  }}>
                    ₹{prod.price}
                  </div>

                  {/* Direct WhatsApp Order Button */}
                  <button
                    onClick={(e) => handleQuickOrder(prod, e)}
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 0',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <MessageCircle size={13} />
                    <span>{isTe ? 'ఆర్డర్' : 'Order'}</span>
                  </button>
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
