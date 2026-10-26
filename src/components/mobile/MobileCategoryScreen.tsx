import React, { useState, useMemo } from 'react';
import { Heart, ArrowLeft, ArrowRight, MessageCircle, Sparkles, Phone } from 'lucide-react';
import type { Product, Category, Language } from '../../types';

interface MobileCategoryScreenProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  products: Product[];
  currentLang: Language;
  onSelectProduct: (product: Product) => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
  onCustomerAction?: (action: 'call' | 'whatsapp', product?: Product, customText?: string) => void;
}

export const MobileCategoryScreen: React.FC<MobileCategoryScreenProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  products,
  currentLang,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  onCustomerAction
}) => {
  const [selectedSubCat, setSelectedSubCat] = useState<string>('All');
  const isTe = currentLang === 'te';

  // Sub-category filter pills for drilled-down category
  const subCategoryPills = [
    { id: 'All', label: isTe ? 'అన్నీ' : 'All' },
    { id: 'Paddy', label: isTe ? 'వరి & ధాన్యాలు' : 'Paddy' },
    { id: 'Vegetables', label: isTe ? 'కూరగాయలు' : 'Vegetables' },
    { id: 'Flowers', label: isTe ? 'పువ్వులు & నూనె' : 'Flowers' }
  ];

  // Current category object when in drill-down mode
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  // Filter products by selectedCategory and selectedSubCat
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p) => {
      const matchCat = p.category === selectedCategory;
      if (!matchCat) return false;
      if (selectedSubCat === 'All') return true;
      return p.subCategory === selectedSubCat;
    });
  }, [products, selectedCategory, selectedSubCat]);

  // Quick WhatsApp order (guarded by Supabase phone auth)
  const handleQuickOrder = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomerAction) {
      onCustomerAction('whatsapp', prod);
    } else {
      const text = encodeURIComponent(
        `Hello Sai Deveena Traders, I want to order:\n- Product: ${prod.name.en} (${prod.name.te})\n- Price: ₹${prod.price}\nPlease confirm availability and delivery.`
      );
      window.open(`https://wa.me/919010454541?text=${text}`, '_blank');
    }
  };

  // ==========================================
  // VIEW 1: ALL CATEGORIES LIST / GRID (When selectedCategory is null)
  // ==========================================
  if (!selectedCategory) {
    return (
      <div style={{
        paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
        backgroundColor: '#f8fafc',
        overflowX: 'hidden'
      }}>
        {/* Top Header Banner */}
        <div style={{ padding: '0.85rem 1rem 0.5rem' }}>
          <div style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
            padding: '1.25rem',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(21, 128, 61, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#fef08a',
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '0.25rem'
              }}>
                <Sparkles size={14} />
                <span>{isTe ? 'అన్ని ఉత్పత్తుల విభాగాలు' : 'All Product Categories'}</span>
              </div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.25,
                margin: 0
              }}>
                {isTe ? 'మీకు కావలసిన విభాగాన్ని ఎంచుకోండి' : 'Explore by Category'}
              </h2>
            </div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img
                src="/images/categories/quick-seeds.svg"
                alt="Categories"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        {/* Categories List Cards */}
        <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {categories.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <Sparkles size={28} style={{ color: '#ea580c', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                {isTe ? 'విభాగాలు త్వరలో అందుబాటులోకి వస్తాయి' : 'Categories Arriving Soon'}
              </div>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                {isTe ? 'సాయి దీవెన ట్రేడర్స్ కొత్త ఉత్పత్తుల విభాగాలను నమోదు చేస్తోంది.' : 'Store departments are being updated live from Supabase.'}
              </p>
            </div>
          ) : (
            categories.map((cat) => {
              const count = products.filter(p => p.category === cat.id).length;
              const catName = cat.name[currentLang] || cat.name.en;
              const catDesc = cat.description?.[currentLang] || cat.description?.en || '';

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setSelectedSubCat('All');
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.95rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, border-color 0.15s ease'
                  }}
                >
                  {/* Category Visual Avatar */}
                  <div style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '14px',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(22, 101, 52, 0.1)'
                  }}>
                    <img
                      src={cat.image || '/images/categories/quick-seeds.svg'}
                      alt={catName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/categories/quick-seeds.svg';
                      }}
                    />
                  </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                    <h3 style={{
                      fontSize: '0.98rem',
                      fontWeight: 900,
                      color: '#0f172a',
                      margin: 0
                    }}>
                      {catName}
                    </h3>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px'
                    }}>
                      {count > 0 ? `${count} Items` : 'Available'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.76rem',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {catDesc}
                  </p>
                </div>

                {/* Right Arrow */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DRILL-DOWN CATEGORY PRODUCTS VIEW
  // ==========================================
  const categoryTitle = currentCategoryObj ? (currentCategoryObj.name[currentLang] || currentCategoryObj.name.en) : 'Products';

  return (
    <div style={{
      paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#f8fafc',
      overflowX: 'hidden'
    }}>
      {/* 1. Back to All Categories Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.55rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => onSelectCategory(null)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#15803d',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>{isTe ? 'అన్ని విభాగాలు చూడండి' : 'All Categories'}</span>
        </button>

        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
          {filteredProducts.length} {isTe ? 'ఉత్పత్తులు' : 'Products'}
        </span>
      </div>

      {/* 2. Category Hero Banner */}
      <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
        <div style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #15803d 100%)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(5, 46, 22, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ zIndex: 2, maxWidth: '65%' }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: '0.25rem',
              color: '#ffffff'
            }}>
              {categoryTitle}
            </h2>
            <p style={{
              fontSize: '0.76rem',
              color: '#dcfce7',
              margin: 0
            }}>
              {currentCategoryObj?.description?.[currentLang] || (isTe ? '100% ధృవీకృత నాణ్యత' : '100% Certified High Yield Varieties')}
            </p>
          </div>

          <div style={{
            width: '74px',
            height: '74px',
            position: 'absolute',
            right: '0.5rem',
            bottom: '0',
            opacity: 0.95
          }}>
            <img
              src={currentCategoryObj?.image || '/images/categories/quick-seeds.svg'}
              alt={categoryTitle}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Sub-Category Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0.5rem 1rem 0.75rem',
        scrollbarWidth: 'none'
      }}>
        {subCategoryPills.map((pill) => {
          const isActive = selectedSubCat === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setSelectedSubCat(pill.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.4rem 1.05rem',
                borderRadius: '9999px',
                border: isActive ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#15803d' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(21, 128, 61, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 4. 2-Column Product Grid */}
      <div style={{ padding: '0 1rem' }}>
        {filteredProducts.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            border: '1px dashed #cbd5e1'
          }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {isTe ? 'ఈ విభాగంలో ఉత్పత్తులు త్వరలో చేర్చబడతాయి.' : 'Products in this subcategory are arriving soon.'}
            </p>
            <button
              onClick={() => setSelectedSubCat('All')}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {isTe ? 'అన్ని ఉత్పత్తులు చూడండి' : 'Show All Products'}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.85rem'
          }}>
            {filteredProducts.map((prod) => {
              const isWishlisted = wishlist.has(prod.id);
              const name = prod.name[currentLang] || prod.name.en;
              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
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

                  {/* Product Pouch Image */}
                  <div style={{
                    width: '100%',
                    height: '135px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.55rem'
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

                  {/* Title */}
                  <h4 style={{
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    minHeight: '2.2rem',
                    marginBottom: '0.35rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {name}
                  </h4>

                  {/* Price */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.4rem',
                    marginBottom: '0.65rem'
                  }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                      ₹{prod.price}
                    </span>
                    {prod.originalPrice && (
                      <span style={{
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        textDecoration: 'line-through',
                        fontWeight: 600
                      }}>
                        ₹{prod.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Dual Action Buttons: WhatsApp & Call */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.4rem',
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
                        borderRadius: '9999px',
                        padding: '0.48rem 0.2rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(21, 128, 61, 0.22)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <MessageCircle size={14} />
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
                        borderRadius: '9999px',
                        padding: '0.48rem 0.2rem',
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
        )}
      </div>
    </div>
  );
};
