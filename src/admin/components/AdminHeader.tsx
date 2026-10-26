import React from 'react';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import type { AdminTab } from '../types';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onOpenMobileMenu: () => void;
  onExitToStore: () => void;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Overview', subtitle: 'Live metrics, catalog health, and system alerts' },
  products: { title: 'Product Catalog Management', subtitle: 'View, filter, and prepare products for database sync' },
  categories: { title: 'Category Organization', subtitle: 'Manage agricultural departments & customer grouping' },
  inventory: { title: 'Inventory & Stock Control', subtitle: 'Stock availability, out-of-stock toggles & price tracking' },
  enquiries: { title: 'Customer Product Enquiries', subtitle: 'Review and respond to customer Call & WhatsApp enquiries' },
  orders: { title: 'Live Orders Management', subtitle: 'Track customer orders, update statuses & record offline sales' },
  customers: { title: 'Customer Accounts & History', subtitle: 'Manage registered farmers, account statuses & purchase histories' },
  settings: { title: 'Store & Backend Settings', subtitle: 'Shop configuration, contact details & Supabase readiness' }
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onExitToStore
}) => {
  const current = TAB_TITLES[activeTab];

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.9rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Left: Mobile hamburger & Screen Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open Admin Menu"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem',
            color: '#0f172a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          className="admin-mobile-menu-btn"
        >
          <Menu size={22} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#0f172a',
              margin: 0,
              lineHeight: 1.2
            }}>
              {current.title}
            </h1>
            <span style={{
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Admin Portal
            </span>
          </div>
          <p style={{
            fontSize: '0.78rem',
            color: '#64748b',
            margin: '0.15rem 0 0',
            display: 'none'
          }} className="admin-header-subtitle">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Storefront Link & Admin Profile Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onExitToStore}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.45rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Storefront</span>
          <ExternalLink size={14} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={14} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>Admin User</span>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-mobile-menu-btn {
            display: none !important;
          }
          .admin-header-subtitle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
