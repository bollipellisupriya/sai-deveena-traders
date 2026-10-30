import React, { useState } from 'react';
import { Heart, Check, Plus, Minus, Truck, ShieldCheck, MessageCircle, Phone, Sparkles, Tag, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Product, Language } from '../../types';
import { getProductWhatsappUrl } from '../../utils/whatsapp';
import { useCart } from '../../context/CartContext';

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
  const { addToCart, openCart, setCheckoutStep } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const isTe = currentLang === 'te';
  const isWishlisted = wishlist.has(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleFastCheckout = () => {
    addToCart(product, quantity);
    openCart();
    setCheckoutStep('checkout');
  };

  const name = product.name[currentLang] || product.name.en;
  const rawDescription = product.description[currentLang] || product.description.en || '';

  // Parse structured specifications (e.g. Brand: ..., Crop Type: ..., etc.)
  const parseDescriptionSpecs = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const specs: { label: string; value: string }[] = [];
    const normalText: string[] = [];

    for (const line of lines) {
      if (line.includes(':')) {
        const parts = line.split(':');
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        if (label.length < 35 && value.length > 0) {
          specs.push({ label, value });
          continue;
        }
      }
      if (line.includes('\t')) {
        const parts = line.split('\t');
        if (parts.length === 2 && parts[0].length < 35) {
          specs.push({ label: parts[0].trim(), value: parts[1].trim() });
          continue;
        }
      }
      normalText.push(line);
    }

    return { specs, normalText: normalText.join('\n') };
  };

  const { specs, normalText } = parseDescriptionSpecs(rawDescription);

  const keyFeatures = product.keyFeatures && product.keyFeatures.length > 0
    ? product.keyFeatures
    : [
        isTe ? '100% అధిక మొలక శాతం మరియు నాణ్యత' : '100% High germination rate & certified purity',
        isTe ? 'అధిక పంట దిగుబడినిచ్చే హైబ్రిడ్ రకం' : 'High yield potential hybrid crop variety',
        isTe ? 'తెగుళ్లు మరియు వ్యాధులను తట్టుకునే శక్తి' : 'Strong resistance to common pests & diseases',
        isTe ? 'భైంసా మరియు తెలంగాణ నేలలకు అత్యంత అనుకూలం' : 'Well suited for regional farming conditions'
      ];

  // Thumbnail alternatives
  const thumbnails = [
    product.image || '/images/products/paddy-seeds-pouch.svg',
    '/images/categories/quick-seeds.svg',
    '/images/bighaat-seeds-banner.jpg',
    '/images/bighaat-fert-banner.jpg'
  ];

  // Recommendations "You May Also Like"
  const recommendations = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  // Discount calculation
  const currentPrice = product.price ?? 0;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > currentPrice);
  const discountPercent = hasDiscount
    ? Math.round((((product.originalPrice || 0) - currentPrice) / (product.originalPrice || 1)) * 100)
    : 0;
  const savingsAmount = hasDiscount ? (product.originalPrice || 0) - currentPrice : 0;

  // Direct WhatsApp order link with pre-filled message for this product & quantity
  const { url: whatsappUrl } = getProductWhatsappUrl(product, currentLang);

  const handleBuyNow = () => {
    const customText = quantity > 1
      ? `Hello Sai Deveena Traders & General Store, I want to buy:\n- Product: ${product.name.en} (${product.name.te})\n- Quantity: ${quantity}\n- Total Price: ₹${(product.price || 0) * quantity}\nPlease confirm availability and delivery details.`
      : undefined;

    if (onCustomerAction) {
      onCustomerAction('whatsapp', product, customText);
    } else {
      if (quantity === 1 && whatsappUrl) {
        window.open(whatsappUrl, '_blank');
        return;
      }
      const text = encodeURIComponent(
        customText || `Hello Sai Deveena Traders & General Store, I want to buy:\n- Product: ${product.name.en} (${product.name.te})\n- Quantity: ${quantity}\n- Total Price: ₹${(product.price || 0) * quantity}\nPlease confirm availability and delivery details.`
      );
      window.open(`https://wa.me/919010454541?text=${text}`, '_blank');
    }
  };

  const handleCallOrder = () => {
    if (onCustomerAction) {
      onCustomerAction('call', product);
    } else {
      window.location.href = 'tel:9010454541';
    }
  };

  return (
    <div className="product-detail-page-wrapper" style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      overflowX: 'clip'
    }}>
      {/* Breadcrumb Header Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 1rem'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <span style={{ cursor: 'pointer', color: '#15803d', fontWeight: 700 }}>
            {isTe ? 'హోమ్' : 'Home'}
          </span>
          <ChevronRight size={14} />
          <span style={{ cursor: 'pointer', color: '#15803d', fontWeight: 700 }}>
            {product.category || (isTe ? 'ఉత్పత్తులు' : 'Products')}
          </span>
          <ChevronRight size={14} />
          <span style={{
            color: '#0f172a',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '320px'
          }}>
            {name}
          </span>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '1.25rem 1rem'
      }}>
        <div className="product-layout-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* =========================================================
              LEFT COLUMN: Product Image Gallery Card
             ========================================================= */}
          <div className="product-gallery-card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            {/* Wishlist Heart Toggle */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              aria-label="Wishlist"
              style={{
                position: 'absolute',
                top: '1.15rem',
                right: '1.15rem',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 5,
                color: isWishlisted ? '#ef4444' : '#64748b',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart size={22} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>

            {/* Quality Badge Top Left */}
            <div style={{
              position: 'absolute',
              top: '1.15rem',
              left: '1.15rem',
              zIndex: 4,
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              border: '1px solid #86efac'
            }}>
              <ShieldCheck size={14} />
              <span>{isTe ? '100% అసలైనది' : '100% Genuine'}</span>
            </div>

            {/* Large Product Image Frame */}
            <div className="product-main-image-wrap" style={{
              width: '100%',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              padding: '1.5rem 0.5rem',
              boxSizing: 'border-box'
            }}>
              <img
                src={thumbnails[selectedThumb] || product.image || '/images/products/paddy-seeds-pouch.svg'}
                alt={name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.08))',
                  transition: 'transform 0.25s ease'
                }}
              />
            </div>

            {/* Thumbnails Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedThumb(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    border: selectedThumb === idx ? '2.5px solid #15803d' : '1.5px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    padding: '4px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: selectedThumb === idx ? '0 4px 12px rgba(21, 128, 61, 0.2)' : 'none',
                    transform: selectedThumb === idx ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Product Information, Pricing & Order Hub
             ========================================================= */}
          <div className="product-info-card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #e2e8f0',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Category / Brand Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #86efac',
              borderRadius: '9999px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              marginBottom: '0.75rem'
            }}>
              <Sparkles size={13} />
              <span>{isTe ? 'ధృవీకరించిన వ్యవసాయ ఉత్పత్తులు' : 'Certified Farm Inputs'}</span>
            </div>

            {/* Product Title */}
            <h1 style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.85rem)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.25,
              marginBottom: '0.85rem'
            }}>
              {name}
            </h1>

            {/* In-Stock & Availability Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#15803d', display: 'inline-block' }} />
                <span>{isTe ? 'స్టాక్‌లో అందుబాటులో ఉంది' : 'In Stock (Fresh 2026 Batch)'}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {isTe ? 'భైంసా & పరిసర గ్రామాలకు తక్షణ డెలివరీ' : 'Direct Dispatch from Bhainsa Store'}
              </span>
            </div>

            {/* Price, Savings & Offers Card */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '18px',
              padding: '1.15rem 1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)',
                  fontWeight: 900,
                  color: '#15803d'
                }}>
                  ₹{product.price}
                </span>

                {hasDiscount && product.originalPrice && (
                  <span style={{
                    fontSize: '1.15rem',
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                    fontWeight: 700
                  }}>
                    MRP ₹{product.originalPrice}
                  </span>
                )}

                {hasDiscount && (
                  <span style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Tag size={13} />
                    <span>{discountPercent}% OFF (SAVE ₹{savingsAmount})</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, marginTop: '0.45rem' }}>
                ✓ {isTe ? 'అన్ని పన్నులతో కలిపి • ₹999 కంటే ఎక్కువ ఆర్డర్లపై ఉచిత డెలివరీ' : 'Inclusive of all taxes • Free farm doorstep delivery over ₹999'}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {isTe ? 'పరిమాణం (బ్యాగులు / ప్యాకెట్లు):' : 'Quantity (Packets):'}
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1.5px solid #cbd5e1',
                borderRadius: '9999px',
                backgroundColor: '#f8fafc',
                padding: '0.25rem'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
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
                  width: '48px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  color: '#0f172a'
                }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  aria-label="Increase quantity"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
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

            {/* Cart Added Toast */}
            {addedToast && (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1.5px solid #86efac',
                color: '#15803d',
                borderRadius: '12px',
                padding: '0.65rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} />
                  <span>{isTe ? 'కార్ట్‌కి విజయవంతంగా జోడించబడింది!' : 'Item added to your cart!'}</span>
                </div>
                <button
                  type="button"
                  onClick={openCart}
                  style={{
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isTe ? 'కార్ట్ చూడండి' : 'View Cart'}
                </button>
              </div>
            )}

            {/* PRIMARY CONVERSION ACTION BUTTONS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.75rem'
            }}>
              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#15803d',
                  border: '2px solid #15803d',
                  borderRadius: '16px',
                  padding: '0.95rem 1.25rem',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShoppingBag size={20} />
                <span>{isTe ? 'కార్ట్‌కి జోడించండి' : 'Add to Cart'}</span>
              </button>

              {/* Fast Guest Checkout */}
              <button
                type="button"
                onClick={handleFastCheckout}
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '0.95rem 1.25rem',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(21, 128, 61, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{isTe ? 'ఇప్పుడే కొనండి (చెక్అవుట్)' : 'Buy Now (Guest Checkout)'}</span>
              </button>

              {/* WhatsApp Fast Order */}
              <button
                type="button"
                onClick={handleBuyNow}
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '0.95rem 1.25rem',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageCircle size={20} />
                <span>{isTe ? 'వాట్సాప్‌లో ఆర్డర్ చేయండి' : 'Order via WhatsApp'}</span>
              </button>

              {/* Call Shop Button */}
              <button
                type="button"
                onClick={handleCallOrder}
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '0.95rem 1.25rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Phone size={18} style={{ color: '#ea580c' }} />
                <span>{isTe ? 'కాల్ చేయండి: 9010454541' : 'Call: 9010454541'}</span>
              </button>
            </div>

            {/* 3 Trust Service Highlights */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.65rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ffedd5',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    {isTe ? 'పొలాల డెలివరీ' : 'Farm Delivery'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isTe ? 'భైంసా & పరిసర గ్రామాలు' : 'Bhainsa & Village fields'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    {isTe ? '100% అసలైన నాణ్యత' : '100% Certified'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isTe ? 'ధృవీకరించిన బ్రాండ్లు' : 'Govt Approved Brands'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Phone size={19} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    {isTe ? 'రైతు సలహాలు' : 'Agri Advice'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isTe ? 'ఉచిత పంట మార్గదర్శనం' : 'Free Expert Guidance'}
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Table (Cleanly Parsed from database) */}
            {specs.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  marginBottom: '0.65rem'
                }}>
                  {isTe ? 'ఉత్పత్తి వివరాలు' : 'Product Specifications'}
                </h3>
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  overflow: 'hidden'
                }}>
                  {specs.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr',
                        padding: '0.65rem 0.95rem',
                        backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                        borderBottom: idx !== specs.length - 1 ? '1px solid #f1f5f9' : 'none',
                        fontSize: '0.84rem'
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#475569' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description (Formatted with pre-line to preserve paragraphs) */}
            {normalText.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  marginBottom: '0.5rem'
                }}>
                  {isTe ? 'వివరణ' : 'Description'}
                </h3>
                <p style={{
                  fontSize: '0.88rem',
                  color: '#334155',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  margin: 0
                }}>
                  {normalText}
                </p>
              </div>
            )}

            {/* Key Features Checklist */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: '0.75rem'
              }}>
                {isTe ? 'ప్రధాన విశేషాలు & ఉపయోగాలు' : 'Key Features & Benefits'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {keyFeatures.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.45 }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM: Related Products "You May Also Like" Shelf
           ========================================================= */}
        {recommendations.length > 0 && (
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#0f172a'
              }}>
                {isTe ? 'ఇతర నాణ్యమైన ఉత్పత్తులు' : 'Related Products You May Also Like'}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    onSelectProduct(rec);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #e2e8f0',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#86efac';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '0.5rem'
                  }}>
                    <img
                      src={rec.image || '/images/products/paddy-seeds-pouch.svg'}
                      alt={rec.name.en}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    minHeight: '2.3rem',
                    marginBottom: '0.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {rec.name[currentLang] || rec.name.en}
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: '#15803d',
                    marginTop: 'auto'
                  }}>
                    ₹{rec.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Bar (Visible on mobile screens for instant order access) */}
      <div className="mobile-only-buy-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            {isTe ? 'మొత్తం ధర' : 'Total Price'}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d' }}>
            ₹{(product.price || 0) * quantity}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="Add to cart"
            style={{
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1.5px solid #86efac',
              borderRadius: '9999px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <ShoppingBag size={16} />
            <span className="hide-on-very-small">{isTe ? 'కార్ట్' : 'Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleFastCheckout}
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 1rem',
              fontSize: '0.86rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(21, 128, 61, 0.3)'
            }}
          >
            <span>{isTe ? 'కొనండి' : 'Buy Now'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            aria-label="WhatsApp order"
            style={{
              backgroundColor: '#25D366',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.84rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(37, 211, 102, 0.25)'
            }}
          >
            <MessageCircle size={17} />
          </button>

          <button
            type="button"
            onClick={handleCallOrder}
            aria-label="Call store"
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1.5px solid #cbd5e1',
              borderRadius: '9999px',
              padding: '0.65rem 0.75rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <Phone size={15} style={{ color: '#ea580c' }} />
          </button>
        </div>
      </div>

      {/* Embedded CSS for responsive 2-column layout on desktop vs 1-column on phone */}
      <style>{`
        @media (min-width: 860px) {
          .product-layout-grid {
            grid-template-columns: 46% 54% !important;
            gap: 2.25rem !important;
          }
          .product-gallery-card {
            position: sticky !important;
            top: 85px !important;
          }
          .product-main-image-wrap {
            height: 420px !important;
          }
          .mobile-only-buy-bar {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .mobile-only-buy-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileProductDetailScreen;
