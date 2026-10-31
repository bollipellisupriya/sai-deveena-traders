import React from 'react';
import { LayoutDashboard, Package, ClipboardList, MessageSquare, Menu } from 'lucide-react';
import type { AdminTab } from '../types';

interface AdminMobileBottomNavProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onOpenMoreMenu: () => void;
}

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMoreMenu
}) => {
  const isMoreTab = ['categories', 'inventory', 'banners', 'customers', 'settings'].includes(activeTab);

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Overview',
      icon: <LayoutDashboard size={20} />,
      onClick: () => onSelectTab('dashboard')
    },
    {
      id: 'products' as AdminTab,
      label: 'Products',
      icon: <Package size={20} />,
      onClick: () => onSelectTab('products')
    },
    {
      id: 'orders' as AdminTab,
      label: 'Orders',
      icon: <ClipboardList size={20} />,
      onClick: () => onSelectTab('orders')
    },
    {
      id: 'enquiries' as AdminTab,
      label: 'Enquiries',
      icon: <MessageSquare size={20} />,
      onClick: () => onSelectTab('enquiries'),
      badge: 'New'
    },
    {
      id: 'more' as const,
      label: 'More',
      icon: <Menu size={20} />,
      onClick: onOpenMoreMenu,
      isMore: true
    }
  ];

  return (
    <nav
      aria-label="Admin Mobile Navigation"
      className="admin-mobile-bottom-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08), 0 -1px 3px rgba(22, 163, 74, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: '0.4rem',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: '0.35rem',
        paddingRight: '0.35rem',
        boxSizing: 'border-box'
      }}
    >
      {navItems.map((item) => {
        const isActive = item.isMore ? isMoreTab : activeTab === item.id;

        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#15803d' : '#64748b',
              padding: '0.2rem 0.25rem',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              flex: 1,
              minHeight: '44px',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px 12px',
              borderRadius: '9999px',
              backgroundColor: isActive ? '#dcfce7' : 'transparent',
              color: isActive ? '#15803d' : '#64748b',
              boxShadow: isActive ? '0 2px 6px rgba(22, 163, 74, 0.2)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              position: 'relative'
            }}>
              {item.icon}
              {item.badge && !isActive && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#16a34a'
                }} />
              )}
            </div>

            <span style={{
              fontSize: '0.68rem',
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
              color: isActive ? '#15803d' : '#64748b',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap'
            }}>
              {item.label}
            </span>

            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: '1px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#16a34a'
              }} />
            )}
          </button>
        );
      })}

      <style>{`
        @media (min-width: 768px) {
          .admin-mobile-bottom-bar {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
