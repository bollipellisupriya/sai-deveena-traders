import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import type { Language } from '../../types';

export type TabType = 'home' | 'categories' | 'orders' | 'profile';

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentLang: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentLang
}) => {
  const isTe = currentLang === 'te';

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'home',
      label: isTe ? 'హోమ్' : 'Home',
      icon: <Home size={22} />
    },
    {
      id: 'categories',
      label: isTe ? 'విభాగాలు' : 'Categories',
      icon: <LayoutGrid size={22} />
    },
    {
      id: 'orders',
      label: isTe ? 'ఆర్డర్లు' : 'Orders',
      icon: <ShoppingBag size={22} />
    },
    {
      id: 'profile',
      label: isTe ? 'ప్రొఫైల్' : 'Profile',
      icon: <User size={22} />
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0.45rem 0.5rem 0.65rem',
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#15803d' : '#94a3b8',
              padding: '0.25rem 0.75rem',
              transition: 'color 0.2s ease, transform 0.15s ease',
              flex: 1
            }}
          >
            <div style={{
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {tab.icon}
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.01em'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
