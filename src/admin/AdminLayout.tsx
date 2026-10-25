import React, { useState } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import type { AdminTab } from './types';
import type { CatalogData } from '../types';

interface AdminLayoutProps {
  catalog: CatalogData | null;
  onExitToStore: () => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  catalog,
  onExitToStore,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen catalog={catalog} onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'products':
        return <ProductsScreen catalog={catalog} />;
      case 'categories':
        return <CategoriesScreen catalog={catalog} />;
      case 'inventory':
        return <InventoryScreen catalog={catalog} />;
      case 'orders':
        return <OrdersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen catalog={catalog} onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onExitToStore={onExitToStore}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onExitToStore={onExitToStore}
        />

        {/* Phase 1 Backend Connection Notice Banner */}
        <BackendStatusBanner onLearnMore={() => setActiveTab('settings')} />

        {/* Screen View */}
        <main style={{ flex: 1, padding: '1.5rem' }}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};
