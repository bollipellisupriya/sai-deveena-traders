import React from 'react';
import { ShoppingBag, MessageCircle, Phone, CheckCircle, Clock, RotateCw, MapPin, Package } from 'lucide-react';
import type { Language } from '../../types';

interface MobileOrdersScreenProps {
  currentLang: Language;
  onExplore: () => void;
}

interface CompletedOrder {
  orderId: string;
  date: string;
  status: 'Completed' | 'Processing';
  items: Array<{ name: { en: string; te: string }; qty: number; price: number }>;
  total: number;
  deliveryLocation: string;
}

export const MobileOrdersScreen: React.FC<MobileOrdersScreenProps> = ({ currentLang, onExplore }) => {
  const isTe = currentLang === 'te';

  // Sample Completed / Verified Orders
  const completedOrders: CompletedOrder[] = [
    {
      orderId: 'SDT-8924',
      date: '24 Oct 2026',
      status: 'Completed',
      deliveryLocation: isTe ? 'భైంసా వ్యవసాయ క్షేత్రం, నిర్మల్' : 'Bhainsa Farm Field, Nirmal',
      items: [
        { name: { en: 'Paddy Seeds (High Yield)', te: 'వరి విత్తనాలు (అధిక దిగుబడి)' }, qty: 2, price: 850 },
        { name: { en: 'DAP Fertilizer 50 Kg', te: 'డి.ఎ.పి ఎరువు 50 కేజీలు' }, qty: 1, price: 1350 }
      ],
      total: 3050
    },
    {
      orderId: 'SDT-8871',
      date: '21 Oct 2026',
      status: 'Completed',
      deliveryLocation: isTe ? 'మెట్ట పంటల క్షేత్రం, భైంసా' : 'Mettapalli Road, Bhainsa',
      items: [
        { name: { en: 'Cotton Seeds (Bt-II)', te: 'హైబ్రిడ్ పత్తి విత్తనాలు' }, qty: 3, price: 920 },
        { name: { en: 'Vegetable Seeds Combo Pack', te: 'కూరగాయల విత్తనాల కాంబో' }, qty: 2, price: 299 }
      ],
      total: 3358
    },
    {
      orderId: 'SDT-8790',
      date: '18 Oct 2026',
      status: 'Completed',
      deliveryLocation: isTe ? 'నిర్మల్ రోడ్ దుకాణం పికప్' : 'Shop Direct Pickup, Bhainsa',
      items: [
        { name: { en: 'Sunflower Oil 1 Ltr', te: 'సన్‌ఫ్లవర్ నూనె 1 లీటర్' }, qty: 4, price: 145 },
        { name: { en: 'Maize Seeds', te: 'మొక్కజొన్న విత్తనాలు' }, qty: 1, price: 780 }
      ],
      total: 1360
    }
  ];

  // Send an order list to WhatsApp
  const handleSendOrderToWhatsApp = (order: CompletedOrder) => {
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
              {isTe ? 'పూర్తయిన ఆర్డర్లు & విచారణలు' : 'Completed Orders & Dispatch'}
            </h2>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800 }}>
              {isTe ? 'సాయి దీవెన ట్రేడర్స్ భైంసా' : 'Sai Deveena Traders • Bhainsa'}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
          {isTe
            ? 'గతంలో పూర్తయిన ఆర్డర్లను తనిఖీ చేయండి లేదా ఒకే క్లిక్‌తో వాట్సాప్ లేదా కాల్ ద్వారా ఆర్డర్ లిస్ట్‌ను పంపండి.'
            : 'Review completed orders, re-order your agricultural supplies, or send your items list directly to WhatsApp.'}
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

      {/* 2. Completed Orders List */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.65rem',
          padding: '0 0.25rem'
        }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            {isTe ? 'పూర్తయిన డెలివరీలు' : 'Completed Orders History'}
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
            {completedOrders.length} {isTe ? 'ఆర్డర్లు' : 'Orders'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {completedOrders.map((order) => (
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

                {/* Completed Badge */}
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
                  <span>{isTe ? 'పూర్తయింది' : 'Completed'}</span>
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
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                    {order.deliveryLocation}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '0.35rem' }}>Total:</span>
                  <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#15803d' }}>
                    ₹{order.total}
                  </span>
                </div>
              </div>

              {/* Card Action: Send Order via WhatsApp */}
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
                <span>{isTe ? 'ఈ ఆర్డర్‌ను వాట్సాప్‌లో మళ్లీ పంపండి' : 'Send this Order list to WhatsApp'}</span>
                <RotateCw size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Browse Catalogue Button */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={onExplore}
          style={{
            backgroundColor: '#14532d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.75rem 1.75rem',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(20, 83, 45, 0.25)'
          }}
        >
          {isTe ? 'కొత్త ఉత్పత్తులను ఆర్డర్ చేయండి' : 'Browse Products to Order'}
        </button>
      </div>
    </div>
  );
};
