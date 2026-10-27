import React, { useState, useMemo } from 'react';
import { Heart, ArrowLeft, ArrowRight, MessageCircle, Sparkles, Phone, Search, X, CheckCircle, Star } from 'lucide-react';
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
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const isTe = currentLang === 'te';

  // Format category title nicely
  const formatTitle = (rawName: string) => {
    if (!rawName) return '';
    if (isTe) return rawName;
    return rawName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Filtered categories for View 1
  const filteredCategories = useMemo(() => {
    const q = categorySearchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => {
      const en = (c.name.en || '').toLowerCase();
      const te = (c.name.te || '').toLowerCase();
      const descEn = (c.description?.en || '').toLowerCase();
      const descTe = (c.description?.te || '').toLowerCase();
      return en.includes(q) || te.includes(q) || descEn.includes(q) || descTe.includes(q);
    });
  }, [categories, categorySearchQuery]);

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
  // VIEW 1: ALL CATEGORIES DIRECTORY (Compact & Elegant)
  // ==========================================
  if (!selectedCategory) {
    return (
      <div style={{
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
        backgroundColor: '#f8fafc',
        overflowX: 'clip'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* 1. Sleek, Compact Header Banner (Not too long in phone view) */}
          <div style={{ padding: '0.65rem 1rem 0.35rem' }}>
            <div style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #15803d 100%)',
              padding: '0.85rem 1.15rem',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(5, 46, 22, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              border: '1px solid rgba(134, 239, 172, 0.25)'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#fef08a',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  marginBottom: '0.15rem'
                }}>
                  <Sparkles size={12} style={{ color: '#facc15' }} />
                  <span>{isTe ? 'ధృవీకరించిన విభాగాలు' : 'Verified Store Departments'}</span>
                </div>

                <h2 style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.2,
                  margin: '0 0 0.15rem 0',
                  letterSpacing: '-0.01em'
                }}>
                  {isTe ? 'వ్యవసాయ విభాగాలు' : 'Shop by Category'}
                </h2>

                <p style={{
                  fontSize: '0.72rem',
                  color: '#bbf7d0',
                  margin: 0,
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {isTe ? 'భైంసాలో అసలైన విత్తనాలు, ఎరువులు & మందులు' : 'Seeds, Fertilizers, Pesticides & Farm Tools'}
                </p>
              </div>

              {/* Compact Visual Emblem */}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
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

          {/* 2. Compact Search Filter */}
          <div style={{ padding: '0.35rem 1rem 0.5rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '9999px',
              border: '1.5px solid #cbd5e1',
              height: '40px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              padding: '0 0.85rem'
            }}>
              <Search size={15} style={{ color: '#15803d', flexShrink: 0, marginRight: '0.5rem' }} />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder={isTe ? "విభాగాన్ని వెతకండి (విత్తనాలు, ఎరువులు...)" : "Search department (seeds, fertilizer, cotton)..."}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#0f172a'
                }}
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  aria-label="Clear category search"
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    flexShrink: 0
                  }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* 3. Clean Showcase Grid of Categories (No product counts) */}
          <div
            className="category-directory-grid"
            style={{
              padding: '0.4rem 1rem 1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '0.75rem'
            }}
          >
            {filteredCategories.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px dashed #cbd5e1',
                padding: '2.5rem 1.25rem',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <Sparkles size={28} style={{ color: '#ea580c', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {isTe ? 'విభాగాలు కనుగొనబడలేదు' : 'No Department Found'}
                </div>
                <p style={{ fontSize: '0.8rem', margin: '0 0 0.85rem 0' }}>
                  {isTe ? 'దయచేసి వేరే పదంతో శోధించండి.' : `No matching category for "${categorySearchQuery}".`}
                </p>
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isTe ? 'అన్ని విభాగాలు చూపించు' : 'Show All Departments'}
                </button>
              </div>
            ) : (
              filteredCategories.map((cat, idx) => {
                const catName = formatTitle(cat.name[currentLang] || cat.name.en);
                const altName = isTe ? (cat.name.en || '') : (cat.name.te || '');
                const catDesc = cat.description?.[currentLang] || cat.description?.en || '';

                // Subtle vibrant gradient accents per card
                const accents = [
                  'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                  'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                ];
                const cardAccent = accents[idx % accents.length];

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setSelectedSubCat('All');
                    }}
                    className="category-showcase-card"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      padding: '0.9rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.95rem',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {/* Top Accent Stripe */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: cardAccent
                    }} />

                    {/* Circular Avatar with Ring */}
                    <div
                      className="category-card-icon-wrap"
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                        border: '2px solid #86efac',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 3px 10px rgba(22, 163, 74, 0.1)',
                        transition: 'transform 0.25s ease'
                      }}
                    >
                      <img
                        src={cat.image || '/images/categories/quick-seeds.svg'}
                        alt={catName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/categories/quick-seeds.svg';
                        }}
                      />
                    </div>

                    {/* Info (No products count) */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                        <h3 style={{
                          fontSize: '0.98rem',
                          fontWeight: 900,
                          color: '#0f172a',
                          margin: 0,
                          lineHeight: 1.25,
                          letterSpacing: '-0.01em'
                        }}>
                          {catName}
                        </h3>
                        {altName && (
                          <span style={{
                            fontSize: '0.68rem',
                            color: '#64748b',
                            fontWeight: 700,
                            backgroundColor: '#f1f5f9',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {altName}
                          </span>
                        )}
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
                        {catDesc || (isTe ? 'అధిక నాణ్యత కలిగిన ధృవీకృత ఉత్పత్తులు' : 'Verified authentic stocks with farm guidance')}
                      </p>
                    </div>

                    {/* Right Interactive Arrow Pill */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DRILL-DOWN CATEGORY PRODUCTS VIEW (Sleek, Compact & No counts)
  // ==========================================
  const categoryTitle = currentCategoryObj ? formatTitle(currentCategoryObj.name[currentLang] || currentCategoryObj.name.en) : 'Products';

  return (
    <div style={{
      paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#f8fafc',
      overflowX: 'clip'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* 1. Back to All Categories Bar (Without products count) */}
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
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              transition: 'background-color 0.15s ease'
            }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span>{isTe ? 'అన్ని విభాగాలు' : 'All Departments'}</span>
          </button>
        </div>

        {/* 2. Sleek, Compact Category Banner */}
        <div style={{ padding: '0.55rem 1rem 0.35rem' }}>
          <div style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #15803d 100%)',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            color: '#ffffff',
            boxShadow: '0 6px 18px rgba(5, 46, 22, 0.18)',
            border: '1px solid rgba(134, 239, 172, 0.25)'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#fef08a',
                fontSize: '0.68rem',
                fontWeight: 800,
                marginBottom: '0.15rem'
              }}>
                <Sparkles size={11} />
                <span>{isTe ? 'ధృవీకరించిన నాణ్యత' : 'Certified Authentic Stock'}</span>
              </div>

              <h2 style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                lineHeight: 1.2,
                margin: '0 0 0.15rem 0',
                color: '#ffffff'
              }}>
                {categoryTitle}
              </h2>

              <p style={{
                fontSize: '0.72rem',
                color: '#dcfce7',
                margin: '0 0 0.45rem 0',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentCategoryObj?.description?.[currentLang] || (isTe ? 'భైంసాలో అత్యుత్తమ వ్యవసాయ సమాహారం' : 'Direct from authorized distributors in Bhainsa')}
              </p>

              {/* Fast Expert Advice Button */}
              <a
                href="tel:9010454541"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#15803d',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <Phone size={11} style={{ color: '#ea580c' }} />
                <span>{isTe ? 'సలహా కోసం కాల్ చేయండి' : 'Need advice? Call Expert'}</span>
              </a>
            </div>

            <div style={{
              width: '50px',
              height: '50px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
          padding: '0.45rem 1rem 0.65rem',
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
                  padding: '0.38rem 1rem',
                  borderRadius: '9999px',
                  border: isActive ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#15803d' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '0.78rem',
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

        {/* 4. Responsive Product Grid */}
        <div style={{ padding: '0 1rem' }}>
          {filteredProducts.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem 1.25rem',
              textAlign: 'center',
              border: '1.5px dashed #cbd5e1'
            }}>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '0.85rem', fontWeight: 600 }}>
                {isTe ? 'ఈ విభాగంలో ఉత్పత్తులు త్వరలో చేర్చబడతాయి.' : 'Products in this subcategory are arriving soon.'}
              </p>
              <button
                onClick={() => setSelectedSubCat('All')}
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isTe ? 'అన్ని ఉత్పత్తులు చూడండి' : 'Show All Products'}
              </button>
            </div>
          ) : (
            <div
              className="responsive-product-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem'
              }}
            >
              {filteredProducts.map((prod) => {
                const isWishlisted = wishlist.has(prod.id);
                const name = prod.name[currentLang] || prod.name.en;
                return (
                  <div
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className="product-card-modern"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      padding: '0.85rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* In Stock Pill */}
                    <div style={{
                      position: 'absolute',
                      top: '0.65rem',
                      left: '0.65rem',
                      zIndex: 3
                    }}>
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <CheckCircle size={10} />
                        <span>{isTe ? 'స్టాక్ ఉంది' : 'In Stock'}</span>
                      </span>
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(prod.id);
                      }}
                      aria-label="Wishlist"
                      style={{
                        position: 'absolute',
                        top: '0.55rem',
                        right: '0.55rem',
                        background: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 3,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        color: isWishlisted ? '#ef4444' : '#94a3b8'
                      }}
                    >
                      <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
                    </button>

                    {/* Product Pouch Image */}
                    <div style={{
                      width: '100%',
                      height: '135px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.55rem',
                      marginTop: '0.45rem'
                    }}>
                      <img
                        src={prod.image || '/images/products/paddy-seeds-pouch.svg'}
                        alt={name}
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          transition: 'transform 0.2s ease'
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

                    {/* Rating micro badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginBottom: '0.35rem'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 800
                      }}>
                        <Star size={10} fill="#b45309" />
                        <span>4.8</span>
                      </div>
                      <span style={{ fontSize: '0.64rem', color: '#64748b' }}>
                        {isTe ? 'ధృవీకృతం' : 'Verified'}
                      </span>
                    </div>

                    {/* Price */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.4rem',
                      marginBottom: '0.65rem'
                    }}>
                      <span style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0f172a' }}>
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

                    {/* Action Buttons: WhatsApp & Call (Never overflows) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: 'auto'
                    }}>
                      {/* WhatsApp Button */}
                      <button
                        onClick={(e) => handleQuickOrder(prod, e)}
                        title={isTe ? 'వాట్సాప్‌లో ఆర్డర్ చేయండి' : 'Order on WhatsApp'}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.5rem 0.4rem',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)',
                          transition: 'background-color 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <MessageCircle size={14} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{isTe ? 'వాట్సాప్' : 'WhatsApp'}</span>
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
                        title={isTe ? 'కాల్ ద్వారా ఆర్డర్ చేయండి' : 'Order via Phone Call'}
                        style={{
                          width: '34px',
                          height: '34px',
                          flexShrink: 0,
                          backgroundColor: '#ffffff',
                          color: '#15803d',
                          border: '1.5px solid #86efac',
                          borderRadius: '10px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(21, 128, 61, 0.06)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Phone size={14} style={{ color: '#ea580c' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
