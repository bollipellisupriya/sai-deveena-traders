import React, { useState, useMemo } from 'react';
import { Heart } from 'lucide-react';
import type { Product, Category, Language } from '../../types';

interface MobileCategoryScreenProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  products: Product[];
  currentLang: Language;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
}

export const MobileCategoryScreen: React.FC<MobileCategoryScreenProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  products,
  currentLang,
  onSelectProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist
}) => {
  const [selectedSubCat, setSelectedSubCat] = useState<string>('All');
  const isTe = currentLang === 'te';

  const currentCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];
  const categoryTitle = currentCategoryObj ? (currentCategoryObj.name[currentLang] || currentCategoryObj.name.en) : 'Seeds';

  // Sub-category filter pills matching Screen 2
  const subCategoryPills = [
    { id: 'All', label: isTe ? 'అన్నీ' : 'All' },
    { id: 'Paddy', label: isTe ? 'వరి & తృణధాన్యాలు' : 'Paddy' },
    { id: 'Vegetables', label: isTe ? 'కూరగాయలు' : 'Vegetables' },
    { id: 'Flowers', label: isTe ? 'పువ్వులు & నూనె' : 'Flowers' }
  ];

  // Filter products by selectedCategory and selectedSubCat
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      if (!matchCat) return false;
      if (selectedSubCat === 'All') return true;
      return p.subCategory === selectedSubCat;
    });
  }, [products, selectedCategory, selectedSubCat]);

  return (
    <div style={{ paddingBottom: '6rem', backgroundColor: '#f8fafc' }}>
      {/* 1. Category Switcher Scroll */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        overflowX: 'auto',
        padding: '0.65rem 1rem 0.25rem',
        scrollbarWidth: 'none'
      }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setSelectedSubCat('All');
              }}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: isSelected ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                color: isSelected ? '#15803d' : '#64748b',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {cat.name[currentLang] || cat.name.en}
            </button>
          );
        })}
      </div>

      {/* 2. Category Hero Banner */}
      <div style={{ padding: '0.65rem 1rem 0.5rem' }}>
        <div style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #15803d 100%)',
          padding: '1.25rem',
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
              fontSize: '1.25rem',
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

          {/* Sprout Icon / Artwork */}
          <div style={{
            width: '90px',
            height: '90px',
            position: 'absolute',
            right: '0.5rem',
            bottom: '0',
            opacity: 0.95
          }}>
            <img
              src="/images/categories/quick-seeds.svg"
              alt="Seedling"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Sub-Category Filter Pills (Horizontal Scroll) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0.65rem 1rem 0.85rem',
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
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                border: isActive ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#15803d' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontSize: '0.82rem',
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

      {/* 3. 2-Column Product Grid (Matching Screen 2) */}
      <div style={{ padding: '0 1rem' }}>
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

                {/* "Add to Cart" Button */}
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
                    borderRadius: '9999px',
                    padding: '0.48rem 0',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {isTe ? 'కార్ట్‌కి జోడించండి' : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
