import React, { useState } from 'react';
import { Search, Heart, ArrowRight } from 'lucide-react';
import type { Product, Category, Language } from '../../types';

interface MobileHomeScreenProps {
  products: Product[];
  categories: Category[];
  currentLang: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewAllProducts: () => void;
  onViewAllCategories: () => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
}

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  products,
  categories,
  currentLang,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
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

  // Best Selling Products for the horizontal shelf (Paddy Seeds, DAP, Sunflower Oil, Maize)
  const bestSellers = products.filter(p => p.featured || ['paddy-seed-hy', 'dap-fert-50kg', 'sunflower-oil-1l', 'maize-seed-hy'].includes(p.id)).slice(0, 4);

  // 4 Main categories for "Shop by Category"
  const shopByCategories = categories.slice(0, 4).map(c => ({
    id: c.id,
    name: c.name[currentLang] || c.name.en,
    img: c.image || '/images/categories/seeds.jpg'
  }));

  return (
    <div style={{ paddingBottom: '6rem', backgroundColor: '#f8fafc' }}>
      {/* 1. Search Bar Directly Under Header */}
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
        {/* 2. Main Hero Promo Banner (Green Card with Telugu headline & smiling farmer) */}
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
          padding: '1.25rem 1.15rem'
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

        {/* 3. Circular Quick Category Navigation (8 Icons in 2 Rows of 4) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem 0.5rem',
          margin: '1.5rem 0 1.25rem',
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

        {/* 4. Secondary Promo Banner Card (Cream rounded card) */}
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)'
        }}>
          {/* Left Plant Artwork Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            flexShrink: 0
          }}>
            <img
              src="/images/categories/quick-cropcare.svg"
              alt="Agri Products"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Right Content */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '0.98rem',
              fontWeight: 900,
              color: '#14532d',
              marginBottom: '0.2rem',
              lineHeight: 1.2
            }}>
              Trusted Agricultural Products
            </h3>
            <p style={{
              fontSize: '0.72rem',
              color: '#78350f',
              fontWeight: 600,
              lineHeight: 1.35,
              marginBottom: '0.65rem'
            }}>
              Seeds | Fertilizers | Pesticides<br />Crop Care | General Items
            </p>
            <button
              onClick={onViewAllProducts}
              style={{
                backgroundColor: '#14532d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.35rem 0.8rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
            >
              <span>View Products</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* 5. Best Selling Products Section (Matching Screen 1) */}
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

                  {/* Solid Green "Add" Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(prod);
                    }}
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.38rem 0',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Shop by Category Section (Matching Screen 1) */}
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
