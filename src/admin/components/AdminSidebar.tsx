import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  MessageSquare,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Store,
  ShieldCheck,
  X
} from 'lucide-react';
import type { AdminTab } from '../types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onExitToStore: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onExitToStore,
  onLogout
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { id: 'inventory', label: 'Inventory & Stock', icon: <Boxes size={18} />, badge: 'Live' },
    { id: 'enquiries', label: 'Customer Enquiries', icon: <MessageSquare size={18} />, badge: 'New' },
    { id: 'orders', label: 'Orders & Sales', icon: <ClipboardList size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: '1.25rem 1rem'
    }}>
      {/* Brand & Portal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.25rem',
        marginBottom: '1rem',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(21, 128, 61, 0.4)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 900, letterSpacing: '-0.01em', color: '#ffffff' }}>
              SDT Admin Portal
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              Sai Deveena Traders
            </div>
          </div>
        </div>

        {/* Close button for mobile */}
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0.5rem 0.75rem'
        }}>
          Management
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#15803d' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: isActive ? '#ffffff' : '#94a3b8' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#1e293b',
                  color: isActive ? '#ffffff' : '#38bdf8',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Exit to Storefront & Logout */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem'
      }}>
        <button
          onClick={onExitToStore}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid #334155',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Store size={16} />
          <span>Exit to Customer Store</span>
        </button>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1e293b',
            color: '#f87171',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        style={{
          width: '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          display: 'none',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)'
        }}
        className="admin-desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide Drawer */}
      {isOpenMobile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex'
        }}>
          <div
            onClick={onCloseMobile}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(3px)'
            }}
          />
          <div style={{
            position: 'relative',
            width: '280px',
            maxWidth: '85vw',
            height: '100%',
            zIndex: 10000,
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)'
          }}>
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .admin-desktop-sidebar {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
