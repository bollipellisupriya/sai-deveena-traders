import React, { useState, useEffect } from 'react';
import {
  Package,
  FolderTree,
  Boxes,
  AlertCircle,
  Database,
  ArrowRight,
  CheckCircle2,
  Users,
  ClipboardList,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { orderService, type OrderStatistics } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { CatalogData, Product, Category } from '../../types';
import type { AdminTab } from '../types';

interface DashboardScreenProps {
  catalog: CatalogData | null;
  onNavigateTab: (tab: AdminTab) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ catalog, onNavigateTab }) => {
  const [products, setProducts] = useState<Product[]>(catalog?.products || []);
  const [categories, setCategories] = useState<Category[]>(catalog?.categories || []);
  const [orderStats, setOrderStats] = useState<OrderStatistics>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [activeCustomers, setActiveCustomers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      setLoading(true);
      Promise.all([
        catalogService.fetchAllAdminProducts(),
        catalogService.fetchAllAdminCategories(),
        orderService.fetchOrderStatistics(),
        customerService.fetchActiveCustomersCount()
      ]).then(([prodRes, catRes, statsRes, custCount]) => {
        if (prodRes.data) setProducts(prodRes.data);
        if (catRes.data) setCategories(catRes.data);
        if (statsRes) setOrderStats(statsRes);
        setActiveCustomers(custCount);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const inStockProducts = products.filter(p => p.inStock !== false).length;
  const outOfStockProducts = totalProducts - inStockProducts;

  const metrics = [
    {
      title: 'Verified Sales Revenue',
      value: `₹${orderStats.totalRevenue.toLocaleString('en-IN')}`,
      sub: `${orderStats.totalOrders} total orders (excl. cancelled)`,
      icon: <TrendingUp size={22} style={{ color: '#15803d' }} />,
      bg: '#dcfce7',
      tab: 'orders' as AdminTab
    },
    {
      title: 'Pending Orders',
      value: orderStats.pendingOrders,
      sub: orderStats.pendingOrders > 0 ? 'Requires fulfillment action' : 'All orders processed',
      icon: <ClipboardList size={22} style={{ color: '#d97706' }} />,
      bg: '#fef3c7',
      tab: 'orders' as AdminTab
    },
    {
      title: 'Registered Customers',
      value: activeCustomers,
      sub: 'Active farmer accounts (excl. admins)',
      icon: <Users size={22} style={{ color: '#7c3aed' }} />,
      bg: '#ede9fe',
      tab: 'customers' as AdminTab
    },
    {
      title: 'Store Products',
      value: totalProducts,
      sub: `${totalCategories} Categories organized`,
      icon: <Package size={22} style={{ color: '#0284c7' }} />,
      bg: '#e0f2fe',
      tab: 'products' as AdminTab
    },
    {
      title: 'In Stock Items',
      value: inStockProducts,
      sub: totalProducts > 0 ? `${Math.round((inStockProducts / totalProducts) * 100)}% Available` : '0% Available',
      icon: <Boxes size={22} style={{ color: '#059669' }} />,
      bg: '#d1fae5',
      tab: 'inventory' as AdminTab
    },
    {
      title: 'Customer Enquiries',
      value: 'Enquiries',
      sub: 'Manage Call & WhatsApp customer requests',
      icon: <MessageSquare size={22} style={{ color: '#059669' }} />,
      bg: '#dcfce7',
      tab: 'enquiries' as AdminTab
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
                {loading ? '...' : m.value}
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

      {/* 2. Backend Live Status Panel */}
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
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Supabase Live Catalog Connection
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Client connected to PostgreSQL tables (admin_users, categories, products)
              </span>
            </div>
          </div>

          <span style={{
            backgroundColor: isSupabaseConfigured() ? '#dcfce7' : '#fef3c7',
            color: isSupabaseConfigured() ? '#15803d' : '#b45309',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px'
          }}>
            {isSupabaseConfigured() ? 'Connected' : 'Setup Required'}
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
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Database RLS Policies</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Protected against unauthenticated modifications. Public reads active items only.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Admin Auth Validation</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Verified against public.admin_users for active administrator status.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Dynamic Storefront</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Customer site reflects newly added and edited database records.</div>
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
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Manage Products</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Add, edit, price, and upload images</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#94a3b8' }} />
            </button>

            <button
              onClick={() => onNavigateTab('categories')}
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
                <FolderTree size={18} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Manage Categories</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Create, reorganize and customize departments</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#94a3b8' }} />
            </button>

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
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Fast Stock Toggle</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>One-click available / out-of-stock switcher</div>
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
              Live Supabase Products
            </h2>
            <button
              onClick={() => onNavigateTab('products')}
              style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
            >
              View All ({totalProducts}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {products.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <Package size={28} style={{ color: '#cbd5e1', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Catalog is currently empty</div>
                <div style={{ fontSize: '0.74rem' }}>Add your first product in the Products tab.</div>
              </div>
            ) : (
              products.slice(0, 4).map((p) => (
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/products/paddy-seeds-pouch.svg';
                        }}
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
                      backgroundColor: p.inStock !== false ? '#dcfce7' : '#fee2e2',
                      color: p.inStock !== false ? '#15803d' : '#b91c1c',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px'
                    }}>
                      {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
