import React from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import type { Product, Language } from '../../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface MobileCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentLang: Language;
}

export const MobileCartDrawer: React.FC<MobileCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentLang
}) => {
  if (!isOpen) return null;
  const isTe = currentLang === 'te';

  const subtotal = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  // WhatsApp Order payload
  const handleWhatsAppOrder = () => {
    let orderList = items.map((item, i) => `${i + 1}. ${item.product.name.en} x ${item.quantity} = ₹${(item.product.price || 0) * item.quantity}`).join('\n');
    const message = encodeURIComponent(
      `Hello Sai Deveena Traders,\nI want to place an order from your website:\n\n${orderList}\n\n*Item Total: ₹${subtotal}*\n*Delivery: ${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}*\n*Grand Total: ₹${grandTotal}*\n\nPlease confirm availability and payment/delivery details to Bhainsa.`
    );
    window.open(`https://wa.me/919010454541?text=${message}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.15rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <ShoppingBag size={20} style={{ color: '#15803d' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTe ? 'మీ షాపింగ్ కార్ట్' : 'Your Shopping Cart'} ({items.length})
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isTe ? 'ఖాళీ చేయండి' : 'Clear All'}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close cart"
              style={{
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div style={{
          padding: '1rem 1.25rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {items.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#94a3b8'
              }}>
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                {isTe ? 'కార్ట్ ఖాళీగా ఉంది' : 'Your Cart is Empty'}
              </h4>
              <p style={{ fontSize: '0.84rem', marginBottom: '1.5rem' }}>
                {isTe ? 'దయచేసి ఉత్పత్తులను కార్ట్‌కి జోడించండి.' : 'Add items from the store to proceed.'}
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isTe ? 'షాపింగ్ ప్రారంభించండి' : 'Start Shopping'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {items.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <img
                      src={item.product.image || '/images/products/paddy-seeds-pouch.svg'}
                      alt={item.product.name.en}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.25
                    }}>
                      {item.product.name[currentLang] || item.product.name.en}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#ea580c', marginTop: '0.15rem' }}>
                      ₹{(item.product.price || 0) * item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    padding: '0.15rem'
                  }}>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ width: '28px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    aria-label="Remove item"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      padding: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout CTAs */}
        {items.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff'
          }}>
            {/* Bill Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#64748b' }}>
              <span>{isTe ? 'ఉత్పత్తుల మొత్తం' : 'Items Total'}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem', color: '#64748b' }}>
              <span>{isTe ? 'డెలివరీ ఛార్జీ' : 'Delivery'}</span>
              <span style={{ fontWeight: 800, color: deliveryFee === 0 ? '#15803d' : '#0f172a' }}>
                {deliveryFee === 0 ? (isTe ? 'ఉచితం' : 'FREE') : `₹${deliveryFee}`}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: 900,
              color: '#0f172a',
              borderTop: '1px dashed #e2e8f0',
              paddingTop: '0.5rem'
            }}>
              <span>{isTe ? 'మొత్తం చెల్లించవలసినది' : 'Grand Total'}</span>
              <span style={{ color: '#15803d' }}>₹{grandTotal}</span>
            </div>

            {/* Direct WhatsApp Order CTA */}
            <button
              onClick={handleWhatsAppOrder}
              style={{
                width: '100%',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.85rem',
                fontSize: '0.96rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.35)',
                marginBottom: '0.5rem'
              }}
            >
              <MessageCircle size={20} />
              <span>{isTe ? 'వాట్సాప్ ద్వారా ఆర్డర్ చేయండి' : 'Order via WhatsApp (9010454541)'}</span>
            </button>

            {/* Phone Call Button */}
            <a
              href="tel:9010454541"
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '9999px',
                padding: '0.65rem',
                fontSize: '0.86rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                textDecoration: 'none'
              }}
            >
              <Phone size={16} />
              <span>{isTe ? 'దుకాణానికి నేరుగా కాల్ చేయండి (9010454541)' : 'Call Shop Directly (9010454541)'}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
