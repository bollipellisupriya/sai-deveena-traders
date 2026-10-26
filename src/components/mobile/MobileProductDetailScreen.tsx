import React, { useState } from 'react';
import { Heart, Check, Plus, Minus, Truck, ShieldCheck, RotateCcw, MessageCircle, Phone } from 'lucide-react';
import type { Product, Language } from '../../types';
import { getProductWhatsappUrl } from '../../utils/whatsapp';

interface MobileProductDetailScreenProps {
  product: Product;
  allProducts: Product[];
  currentLang: Language;
  onSelectProduct: (product: Product) => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
  onCustomerAction?: (action: 'call' | 'whatsapp', product?: Product, customText?: string) => void;
}

export const MobileProductDetailScreen: React.FC<MobileProductDetailScreenProps> = ({
  product,
  allProducts,
  currentLang,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  onCustomerAction
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const isTe = currentLang === 'te';
  const isWishlisted = wishlist.has(product.id);

  const name = product.name[currentLang] || product.name.en;
  const description = product.description[currentLang] || product.description.en;

  const keyFeatures = product.keyFeatures || [
    isTe ? 'అధిక మొలక శాతం' : 'High germination rate',
    isTe ? 'మంచి పంట దిగుబడి' : 'Better crop yield',
    isTe ? 'తెగుళ్లను తట్టుకునే రకం' : 'Disease resistant variety',
    isTe ? 'అన్ని కాలాలకు అనుకూలం' : 'Suitable for multiple seasons'
  ];

  // Thumbnail alternatives
  const thumbnails = [
    product.image || '/images/products/paddy-seeds-pouch.svg',
    '/images/categories/quick-seeds.svg',
    '/images/banner-1.jpg',
    '/images/farmer-hero.svg'
  ];

  // Recommendations "You May Also Like"
  const recommendations = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  // Direct WhatsApp order link with pre-filled message for this product & quantity
  const { url: whatsappUrl } = getProductWhatsappUrl(product, currentLang);

  const handleBuyNow = () => {
    const customText = quantity > 1
      ? `Hello Sai Deveena Traders, I want to buy:\n- Product: ${product.name.en} (${product.name.te})\n- Quantity: ${quantity}\n- Price: ₹${(product.price || 0) * quantity}\nPlease confirm availability and payment/delivery details.`
      : undefined;

    if (onCustomerAction) {
      onCustomerAction('whatsapp', product, customText);
    } else {
      if (quantity === 1 && whatsappUrl) {
        window.open(whatsappUrl, '_blank');
        return;
      }
      const text = encodeURIComponent(
        customText || `Hello Sai Deveena Traders, I want to buy:\n- Product: ${product.name.en} (${product.name.te})\n- Quantity: ${quantity}\n- Price: ₹${(product.price || 0) * quantity}\nPlease confirm availability and payment/delivery details.`
      );
      window.open(`https://wa.me/919010454541?text=${text}`, '_blank');
    }
  };

  return (
    <div style={{
      paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#ffffff',
      overflowX: 'hidden'
    }}>
      {/* 1. Main Product Showcase & Thumbnails */}
      <div style={{
        position: 'relative',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '1.5rem 1rem 1rem'
      }}>
        {/* Wishlist Heart Top Right */}
        <button
          onClick={() => onToggleWishlist(product.id)}
          aria-label="Wishlist"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            color: isWishlisted ? '#ef4444' : '#64748b'
          }}
        >
          <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* Large Pouch Display */}
        <div style={{
          width: '100%',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <img
            src={thumbnails[selectedThumb] || product.image || '/images/products/paddy-seeds-pouch.svg'}
            alt={name}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* 4 Thumbnails Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem'
        }}>
          {thumbnails.map((thumb, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedThumb(idx)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                border: selectedThumb === idx ? '2px solid #15803d' : '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                padding: '3px',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <img
                src={thumb}
                alt={`Thumbnail ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Product Information Area */}
      <div style={{ padding: '1.25rem 1rem' }}>
        <h2 style={{
          fontSize: '1.35rem',
          fontWeight: 900,
          color: '#0f172a',
          marginBottom: '0.5rem',
          lineHeight: 1.25
        }}>
          {name}
        </h2>

        {/* Price, Discount & Stock Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '0.45rem'
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ea580c' }}>
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span style={{
              fontSize: '1rem',
              color: '#94a3b8',
              textDecoration: 'line-through',
              fontWeight: 600
            }}>
              ₹{product.originalPrice}
            </span>
          )}
          <span style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px'
          }}>
            10% OFF
          </span>
        </div>

        {/* In Stock Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#15803d',
          fontSize: '0.82rem',
          fontWeight: 800,
          marginBottom: '1rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#15803d',
            display: 'inline-block'
          }} />
          <span>{isTe ? 'స్టాక్‌లో ఉంది' : 'In Stock'}</span>
        </div>

        {/* Short Description */}
        <p style={{
          fontSize: '0.86rem',
          color: '#475569',
          lineHeight: 1.6,
          marginBottom: '1.25rem'
        }}>
          {description}
        </p>

        {/* Key Features Checklist Matching Screen 3 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.98rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.65rem'
          }}>
            {isTe ? 'ప్రధాన విశేషాలు' : 'Key Features'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {keyFeatures.map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            {isTe ? 'పరిమాణం' : 'Quantity'}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1.5px solid #cbd5e1',
            borderRadius: '9999px',
            backgroundColor: '#f8fafc',
            padding: '0.2rem'
          }}>
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              aria-label="Decrease quantity"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              <Minus size={16} />
            </button>
            <span style={{
              width: '45px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '0.98rem',
              color: '#0f172a'
            }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              aria-label="Increase quantity"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons: Order via WhatsApp & Call Shop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.75rem'
        }}>
          <button
            onClick={handleBuyNow}
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.75rem 0.5rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.28)'
            }}
          >
            <MessageCircle size={18} />
            <span>{isTe ? 'వాట్సాప్ ఆర్డర్' : 'WhatsApp Order'}</span>
          </button>

          {/* Call Shop Button (guarded by Supabase phone auth) */}
          <button
            type="button"
            onClick={() => {
              if (onCustomerAction) {
                onCustomerAction('call', product);
              } else {
                window.location.href = 'tel:9010454541';
              }
            }}
            style={{
              backgroundColor: '#ffffff',
              color: '#15803d',
              border: '2px solid #15803d',
              borderRadius: '9999px',
              padding: '0.75rem 0.5rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(21, 128, 61, 0.1)'
            }}
          >
            <Phone size={17} />
            <span>{isTe ? 'కాల్ ఆర్డర్' : 'Call to Order'}</span>
          </button>
        </div>

        {/* 3 Trust Badges Matching Screen 3 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Truck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                {isTe ? 'ఉచిత డెలివరీ' : 'Free Delivery'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {isTe ? '₹999 పైన ఆర్డర్లపై వర్తిస్తుంది' : 'On orders above ₹999'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                {isTe ? 'సురక్షిత చెల్లింపు' : 'Secure Payment'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {isTe ? '100% సురక్షితమైన చెల్లింపులు' : '100% secure payments'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <RotateCcw size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                {isTe ? 'సులభమైన రిటర్న్స్' : 'Easy Returns'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {isTe ? '7 రోజుల రిటర్న్ పాలసీ' : '7 days return policy'}
              </div>
            </div>
          </div>
        </div>

        {/* "You May Also Like" Recommendation Carousel */}
        <div>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '0.85rem'
          }}>
            {isTe ? 'మీకు ఇవి కూడా నచ్చవచ్చు' : 'You May Also Like'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}>
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectProduct(rec)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.35rem'
                }}>
                  <img
                    src={rec.image || '/images/products/paddy-seeds-pouch.svg'}
                    alt={rec.name.en}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  marginBottom: '0.25rem'
                }}>
                  {rec.name[currentLang] || rec.name.en}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                  ₹{rec.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
