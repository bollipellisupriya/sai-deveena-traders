import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface StoredOrder {
  orderId: string;
  date: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  customerPhone?: string;
  deliveryLocation?: string;
}

export const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sdt_user_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Default template inquiries for admin layout review
    setOrders([
      {
        orderId: 'SDT-7821',
        date: '24 Oct 2026, 10:30 AM',
        status: 'Pending WhatsApp Confirmation',
        totalAmount: 1850,
        customerPhone: '+91 98480 12345',
        deliveryLocation: 'Bhainsa Town / Near Market Yard',
        items: [
          { name: 'Paddy Seeds MTU-1010 (5kg)', quantity: 2, price: 900 },
          { name: 'Bio-NPK Liquid Fertilizer (1L)', quantity: 1, price: 950 }
        ]
      },
      {
        orderId: 'SDT-7819',
        date: '23 Oct 2026, 04:15 PM',
        status: 'Dispatched to Farm',
        totalAmount: 2400,
        customerPhone: '+91 94401 67890',
        deliveryLocation: 'Kubeer Village',
        items: [
          { name: 'DAP Fertilizer 50kg Bag', quantity: 1, price: 1450 },
          { name: 'Crop Protection Spray 500ml', quantity: 1, price: 950 }
        ]
      }
    ]);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div>
          <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0f172a' }}>
            Customer Orders & Inquiries ({filteredOrders.length})
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Inquiries and orders received via WhatsApp or Phone call
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', 'pending', 'dispatched'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                backgroundColor: filter === st ? '#15803d' : '#f1f5f9',
                color: filter === st ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredOrders.map((ord) => (
          <div
            key={ord.orderId}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a' }}>
                  {ord.orderId}
                </span>
                <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '0.65rem' }}>
                  {ord.date}
                </span>
              </div>

              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px'
              }}>
                {ord.status}
              </span>
            </div>

            {/* Order Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {ord.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#334155', fontWeight: 600 }}>
                    {it.name} (x{it.quantity})
                  </span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>
                    ₹{it.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Total & Customer Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
              flexWrap: 'wrap',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
                <MapPin size={14} style={{ color: '#ea580c' }} />
                <span>{ord.deliveryLocation || 'Bhainsa'}</span>
                <span style={{ fontWeight: 900, color: '#0f172a', marginLeft: '0.5rem' }}>
                  Total: ₹{ord.totalAmount}
                </span>
              </div>

              {ord.customerPhone && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={`tel:${ord.customerPhone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={13} />
                    <span>Call Farmer</span>
                  </a>
                  <a
                    href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
