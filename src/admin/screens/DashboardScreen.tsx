import React from 'react';
import {
  Package,
  FolderTree,
  Boxes,
  ClipboardList,
  AlertCircle,
  Database,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { CatalogData } from '../../types';
import type { AdminTab } from '../types';

interface DashboardScreenProps {
  catalog: CatalogData | null;
  onNavigateTab: (tab: AdminTab) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ catalog, onNavigateTab }) => {
  const totalProducts = catalog?.products.length || 0;
  const totalCategories = catalog?.categories.length || 0;
  const inStockProducts = catalog?.products.filter(p => p.inStock !== false).length || 0;
  const outOfStockProducts = totalProducts - inStockProducts;

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts,
      sub: `${totalCategories} Categories`,
      icon: <Package size={22} style={{ color: '#0284c7' }} />,
      bg: '#e0f2fe',
      tab: 'products' as AdminTab
    },
    {
      title: 'Active Categories',
      value: totalCategories,
      sub: 'Seeds, Fertilizers, Agro',
      icon: <FolderTree size={22} style={{ color: '#16a34a' }} />,
      bg: '#dcfce7',
      tab: 'categories' as AdminTab
    },
    {
      title: 'In Stock Items',
      value: inStockProducts,
      sub: `${Math.round((inStockProducts / (totalProducts || 1)) * 100)}% Available`,
      icon: <Boxes size={22} style={{ color: '#059669' }} />,
      bg: '#d1fae5',
      tab: 'inventory' as AdminTab
    },
    {
      title: 'Low / Out of Stock',
      value: outOfStockProducts,
      sub: 'Requires Stock Attention',
      icon: <AlertCircle size={22} style={{ color: '#ea580c' }} />,
      bg: '#ffedd5',
      tab: 'inventory' as AdminTab
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {metrics.map((m, i) => (
          <div
            key={i}
            onClick={() => onNavigateTab(m.tab)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                {m.title}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '0.45rem' }}>
                {m.sub}
              </div>
            </div>

            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: m.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {m.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Phase 2 Backend Readiness Status Panel */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Backend Integration Pipeline
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Phase 1 UI complete. Ready for Supabase database connection in Phase 2.
              </span>
            </div>
          </div>

          <span style={{
            backgroundColor: '#fef3c7',
            color: '#b45309',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px'
          }}>
            Pending Setup
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Phase 1 UI Foundation</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Admin routes, responsive dashboard shell & data views ready.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Supabase Project Creation</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Awaiting your Supabase project URL and anon public key.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Database Migration</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Import catalog.json products into PostgreSQL with RLS.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Hub & Recent Products Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Quick Action Shortcuts */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
            Quick Operations
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={() => onNavigateTab('inventory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Boxes size={18} style={{ color: '#15803d' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Manage Stock Availability</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Toggle in-stock/out-of-stock for products</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#94a3b8' }} />
            </button>

            <button
              onClick={() => onNavigateTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={18} style={{ color: '#0284c7' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Browse Catalog Products</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Review prices and Telugu descriptions</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#94a3b8' }} />
            </button>

            <button
              onClick={() => onNavigateTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ClipboardList size={18} style={{ color: '#ea580c' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Customer Inquiries & Orders</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Track orders placed by WhatsApp or phone</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#94a3b8' }} />
            </button>
          </div>
        </div>

        {/* Live Catalog Sample */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Sample Catalog Items
            </h2>
            <button
              onClick={() => onNavigateTab('products')}
              style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
            >
              View All ({totalProducts}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {catalog?.products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={p.image || '/images/products/paddy-seeds-pouch.svg'}
                      alt=""
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {p.name.en}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {p.category} {p.packSize ? `• ${p.packSize}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a' }}>
                    ₹{p.price}
                  </div>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px'
                  }}>
                    In Stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
