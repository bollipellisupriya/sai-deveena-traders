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
      icon: <Home size={21} />
    },
    {
      id: 'categories',
      label: isTe ? 'విభాగాలు' : 'Categories',
      icon: <LayoutGrid size={21} />
    },
    {
      id: 'orders',
      label: isTe ? 'ఆర్డర్లు' : 'Orders',
      icon: <ShoppingBag size={21} />
    },
    {
      id: 'profile',
      label: isTe ? 'ప్రొఫైల్' : 'Profile',
      icon: <User size={21} />
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 60,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: '0.4rem',
        paddingBottom: 'calc(0.55rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        boxSizing: 'border-box'
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
              gap: '0.15rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#15803d' : '#64748b',
              padding: '0.2rem 0.4rem',
              transition: 'all 0.15s ease',
              flex: 1,
              minHeight: '44px',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px 12px',
              borderRadius: '9999px',
              backgroundColor: isActive ? 'rgba(21, 128, 61, 0.12)' : 'transparent',
              transition: 'background-color 0.2s ease, transform 0.15s ease',
              transform: isActive ? 'scale(1.04)' : 'scale(1)'
            }}>
              {tab.icon}
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.15
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

