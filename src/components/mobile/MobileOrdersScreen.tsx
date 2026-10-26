import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Phone,
  CheckCircle,
  Clock,
  RotateCw,
  MapPin,
  Package,
  ArrowRight,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { customerAuthService, type CustomerUser } from '../../services/customerAuthService';
import type { Language, Order } from '../../types';

interface MobileOrdersScreenProps {
  currentLang: Language;
  onExplore: () => void;
  onOpenAuthModal?: () => void;
}

export const MobileOrdersScreen: React.FC<MobileOrdersScreenProps> = ({
  currentLang,
  onExplore,
  onOpenAuthModal
}) => {
  const isTe = currentLang === 'te';
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load real orders from Supabase for the authenticated customer
  useEffect(() => {
    let mounted = true;

    async function loadCustomerOrders() {
      setLoading(true);
      setError(null);
      try {
        const user = await customerAuthService.getCurrentCustomer();
        if (!mounted) return;
        setCurrentUser(user);

        if (user) {
          const res = await orderService.fetchCustomerOrders();
          if (!mounted) return;
          if (res.error) {
            setError(res.error);
          } else {
            setOrders(res.orders);
          }
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Could not load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCustomerOrders();

    return () => {
      mounted = false;
    };
  }, []);

  // Send an order list to WhatsApp
  const handleSendOrderToWhatsApp = (order: Order) => {
    const itemsList = (order.items || [])
      .map(it => `- ${it.productNameEn} x ${it.quantity} (₹${it.totalPrice})`)
      .join('\n');

    const message = encodeURIComponent(
      `Hello Sai Deveena Traders,\nI want to check status for my order #${order.orderNumber}:\n\n${itemsList}\n\n*Total: ₹${order.totalAmount}*\n*Delivery Location: ${order.deliveryLocation}*\n*Current Status: ${order.status.replace(/_/g, ' ').toUpperCase()}*\n\nPlease confirm dispatch status.`
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
    <div style={{
      padding: '0.85rem 1rem calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#f8fafc',
      overflowX: 'hidden'
    }}>
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
              {isTe ? 'నా ఆర్డర్లు & విచారణలు' : 'My Orders & Enquiries'}
            </h2>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800 }}>
              {isTe ? 'సాయి దీవెన ట్రేడర్స్ భైంసా' : 'Sai Deveena Traders • Bhainsa'}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
          {isTe
            ? 'మీరు చేసిన ఆర్డర్ల వివరాలు ఇక్కడ కనిపిస్తాయి. వాట్సాప్ లేదా కాల్ ద్వారా ఆర్డర్ లిస్ట్‌ను సులభంగా పంపవచ్చు.'
            : 'Track the live status of your orders placed via Website, WhatsApp, or Phone with Sai Deveena Traders.'}
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

      {/* Error Alert if order loading had an issue */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: '#991b1b',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Unauthenticated State: Prompt to sign in */}
      {!currentUser && !loading && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <LogIn size={24} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            {isTe ? 'మీ ఆర్డర్లను చూడటానికి లాగిన్ అవ్వండి' : 'Sign In to View Your Orders'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.45 }}>
            {isTe
              ? 'మీ ఖాతాకు లాగిన్ చేసి గత ఆర్డర్లు మరియు ప్రస్తుత డెలివరీ స్థితిని ట్రాక్ చేయండి.'
              : 'Sign in to access your registered orders, tracking numbers, and live delivery updates.'}
          </p>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.65rem 1.5rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
              }}
            >
              <span>{isTe ? 'లాగిన్ / రిజిస్టర్' : 'Sign In / Register'}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}

      {/* 3. Orders Content: Loading, Empty State, or Real Orders List */}
      {loading ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: '#64748b',
          border: '1px solid #e2e8f0'
        }}>
          <RotateCw size={26} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.65rem', color: '#15803d' }} />
          <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>
            {isTe ? 'మీ ఆర్డర్లను లోడ్ చేస్తోంది...' : 'Loading your orders from Supabase...'}
          </div>
        </div>
      ) : currentUser && orders.length === 0 ? (
        /* Empty State */
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
            {isTe ? 'ఇంకా ఎలాంటి ఆర్డర్లు లేవు' : 'No Orders Placed Yet'}
          </h3>

          <p style={{
            fontSize: '0.82rem',
            color: '#64748b',
            lineHeight: 1.5,
            maxWidth: '300px',
            margin: '0 auto 1.5rem'
          }}>
            {isTe
              ? 'మీరు ఇంకా ఆర్డర్ చేయలేదు. షాపింగ్ కార్ట్ లేదా వాట్సాప్ ద్వారా విత్తనాలు, ఎరువులను ఆర్డర్ చేయండి.'
              : 'You have not placed any orders yet. Browse our catalog and place your first order!'}
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
      ) : currentUser && orders.length > 0 ? (
        /* Real Orders List (From Supabase) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.25rem'
          }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTe ? 'మీ ఆర్డర్ల చరిత్ర' : 'My Order History'}
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
              {orders.length} {isTe ? 'ఆర్డర్లు' : 'Orders'}
            </span>
          </div>

          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={order.id}
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
                      #{order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {dateStr}
                    </div>
                  </div>

                  <span style={{
                    backgroundColor:
                      order.status === 'delivered' ? '#dcfce7' : order.status === 'cancelled' ? '#fee2e2' : order.status === 'pending' ? '#fef3c7' : '#dbeafe',
                    color:
                      order.status === 'delivered' ? '#15803d' : order.status === 'cancelled' ? '#dc2626' : order.status === 'pending' ? '#b45309' : '#1d4ed8',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    textTransform: 'capitalize'
                  }}>
                    <CheckCircle size={13} />
                    <span>{order.status.replace(/_/g, ' ')}</span>
                  </span>
                </div>

                {/* Items Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {(order.items || []).map((it) => (
                    <div
                      key={it.id}
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
                        <span style={{ fontWeight: 700 }}>{it.productNameEn}</span>
                        {it.packSize && <span style={{ color: '#64748b', fontSize: '0.72rem' }}>({it.packSize})</span>}
                        <span style={{ color: '#64748b' }}>x {it.quantity}</span>
                      </span>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        ₹{it.totalPrice}
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
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Card Action: Check / Repeat on WhatsApp */}
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
                  <span>{isTe ? 'వాట్సాప్‌లో ఆర్డర్ స్థితిని విచారించండి' : 'Check Order Status on WhatsApp'}</span>
                  <RotateCw size={13} />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
