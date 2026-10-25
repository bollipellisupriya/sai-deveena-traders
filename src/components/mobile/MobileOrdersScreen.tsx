import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Phone, CheckCircle, Clock, RotateCw, MapPin, Package, ArrowRight } from 'lucide-react';
import type { Language } from '../../types';

interface MobileOrdersScreenProps {
  currentLang: Language;
  onExplore: () => void;
}

export interface PlacedOrder {
  orderId: string;
  date: string;
  status: 'Completed' | 'Processing';
  items: Array<{ name: { en: string; te: string }; qty: number; price: number }>;
  total: number;
  deliveryLocation: string;
}

export const MobileOrdersScreen: React.FC<MobileOrdersScreenProps> = ({ currentLang, onExplore }) => {
  const isTe = currentLang === 'te';
  const [orders, setOrders] = useState<PlacedOrder[]>([]);

  // Load real orders from localStorage (default is empty, so no fake orders are shown!)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sdt_user_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading orders:', e);
    }
  }, []);

  // Send an order list to WhatsApp
  const handleSendOrderToWhatsApp = (order: PlacedOrder) => {
    const itemsList = order.items
      .map(it => `- ${it.name.en} x ${it.qty} (₹${it.price * it.qty})`)
      .join('\n');

    const message = encodeURIComponent(
      `Hello Sai Deveena Traders,\nI want to repeat / check my order #${order.orderId}:\n\n${itemsList}\n\n*Total: ₹${order.total}*\n*Delivery Location: ${order.deliveryLocation}*\n\nPlease confirm availability for dispatch.`
    );
    window.open(`https://wa.me/919010454541?text=${message}`, '_blank');
  };

  // General custom WhatsApp order
  const handleCustomWhatsAppOrder = () => {
    const message = encodeURIComponent(
      `Hello Sai Deveena Traders,\nI want to place an order for seeds and fertilizers.\nPlease send me current stock details.`
    );
    window.open(`https://wa.me/919010454541?text=${message}`, '_blank');
  };

  return (
    <div style={{ padding: '0.85rem 1rem 6rem', backgroundColor: '#f8fafc' }}>
      {/* 1. Header Card with Call / WhatsApp Order List CTAs */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.15rem',
        border: '1.5px solid #bbf7d0',
        boxShadow: '0 4px 14px rgba(22, 101, 52, 0.08)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#15803d',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTe ? 'ఆర్డర్లు & విచారణలు' : 'My Orders & Enquiries'}
            </h2>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800 }}>
              {isTe ? 'సాయి దీవెన ట్రేడర్స్ భైంసా' : 'Sai Deveena Traders • Bhainsa'}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
          {isTe
            ? 'మీరు చేసిన ఆర్డర్ల వివరాలు ఇక్కడ కనిపిస్తాయి. వాట్సాప్ లేదా కాల్ ద్వారా ఆర్డర్ లిస్ట్‌ను సులభంగా పంపవచ్చు.'
            : 'Track the status of your orders placed via WhatsApp or Phone with Sai Deveena Traders.'}
        </p>

        {/* 2 Action Buttons: Send WhatsApp Order / Call Order */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
          <button
            onClick={handleCustomWhatsAppOrder}
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 0.5rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
            }}
          >
            <MessageCircle size={16} />
            <span>{isTe ? 'వాట్సాప్ ఆర్డర్' : 'WhatsApp Order'}</span>
          </button>

          <a
            href="tel:9010454541"
            style={{
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '9999px',
              padding: '0.65rem 0.5rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              textDecoration: 'none'
            }}
          >
            <Phone size={15} style={{ color: '#ea580c' }} />
            <span>{isTe ? 'కాల్ ఆర్డర్ (9010454541)' : 'Call to Order'}</span>
          </a>
        </div>
      </div>

      {/* 2. Orders Content: Empty State when no orders, or List when orders exist */}
      {orders.length === 0 ? (
        /* Clean Empty State Without Fake Orders */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
        }}>
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
            <ShoppingBag size={30} />
          </div>

          <h3 style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.35rem'
          }}>
            {isTe ? 'ఇంకా ఎలాంటి ఆర్డర్లు లేవు' : 'No Orders Yet'}
          </h3>

          <p style={{
            fontSize: '0.82rem',
            color: '#64748b',
            lineHeight: 1.5,
            maxWidth: '300px',
            margin: '0 auto 1.5rem'
          }}>
            {isTe
              ? 'మీరు ఇంకా ఆర్డర్ చేయలేదు. వాట్సాప్ లేదా నేరుగా కాల్ చేసి విత్తనాలు, ఎరువులను ఆర్డర్ చేయండి.'
              : 'You have not placed any orders yet. Place an order directly via WhatsApp or Phone call!'}
          </p>

          <button
            onClick={onExplore}
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 1.5rem',
              fontSize: '0.86rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
            }}
          >
            <span>{isTe ? 'ఉత్పత్తులను బ్రౌజ్ చేయండి' : 'Browse Products'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        /* Real Orders List (When User Has Placed Orders) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.25rem'
          }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTe ? 'మీ ఆర్డర్ల చరిత్ర' : 'Order History'}
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
              {orders.length} {isTe ? 'ఆర్డర్లు' : 'Orders'}
            </span>
          </div>

          {orders.map((order) => (
            <div
              key={order.orderId}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Order Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '0.65rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>
                    #{order.orderId}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {order.date}
                  </div>
                </div>

                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <CheckCircle size={13} />
                  <span>{order.status}</span>
                </span>
              </div>

              {/* Items Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: '#334155'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Package size={14} style={{ color: '#15803d' }} />
                      <span style={{ fontWeight: 700 }}>{it.name[currentLang] || it.name.en}</span>
                      <span style={{ color: '#64748b' }}>x {it.qty}</span>
                    </span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{it.price * it.qty}
                    </span>
                  </div>
                ))}
              </div>

              {/* Location & Total */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                padding: '0.65rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#64748b' }}>
                  <MapPin size={14} style={{ color: '#ea580c', flexShrink: 0 }} />
                  <span>{order.deliveryLocation}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '0.35rem' }}>Total:</span>
                  <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#15803d' }}>
                    ₹{order.total}
                  </span>
                </div>
              </div>

              {/* Card Action */}
              <button
                onClick={() => handleSendOrderToWhatsApp(order)}
                style={{
                  width: '100%',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1.5px solid #86efac',
                  borderRadius: '9999px',
                  padding: '0.55rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={15} />
                <span>{isTe ? 'ఈ ఆర్డర్‌ను వాట్సాప్‌లో పంపండి' : 'Send this Order list to WhatsApp'}</span>
                <RotateCw size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
