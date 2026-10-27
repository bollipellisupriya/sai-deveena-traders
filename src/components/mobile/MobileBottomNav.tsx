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
      className="mobile-bottom-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 -4px 25px rgba(0, 0, 0, 0.08), 0 -1px 3px rgba(22, 163, 74, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: '0.45rem',
        paddingBottom: 'calc(0.55rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: '0.65rem',
        paddingRight: '0.65rem',
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
              gap: '0.2rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#15803d' : '#64748b',
              padding: '0.2rem 0.5rem',
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
              padding: '4px 14px',
              borderRadius: '9999px',
              backgroundColor: isActive ? '#dcfce7' : 'transparent',
              color: isActive ? '#15803d' : '#64748b',
              boxShadow: isActive ? '0 2px 8px rgba(22, 163, 74, 0.2)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isActive ? 'scale(1.08)' : 'scale(1)'
            }}>
              {tab.icon}
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
              color: isActive ? '#15803d' : '#64748b',
              transition: 'color 0.2s ease'
            }}>
              {tab.label}
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
    </nav>
  );
};

