import React, { useState } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminMobileBottomNav } from './components/AdminMobileBottomNav';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { EnquiriesScreen } from './screens/EnquiriesScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import type { AdminTab } from './types';
import type { CatalogData } from '../types';

interface AdminLayoutProps {
  catalog: CatalogData | null;
  onExitToStore: () => void;
  onLogout: () => void;
  onRefreshCatalog?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  catalog,
  onExitToStore,
  onLogout,
  onRefreshCatalog
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen catalog={catalog} onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'products':
        return <ProductsScreen catalog={catalog} onRefreshCatalog={onRefreshCatalog} />;
      case 'categories':
        return <CategoriesScreen catalog={catalog} onRefreshCatalog={onRefreshCatalog} />;
      case 'inventory':
        return <InventoryScreen catalog={catalog} onRefreshCatalog={onRefreshCatalog} />;
      case 'enquiries':
        return <EnquiriesScreen />;
      case 'orders':
        return <OrdersScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'customers':
        return <CustomersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen catalog={catalog} onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="admin-layout-root">
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
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onExitToStore={onExitToStore}
        />

        {/* Phase 1 Backend Connection Notice Banner */}
        <BackendStatusBanner onLearnMore={() => setActiveTab('settings')} />

        {/* Screen View */}
        <main className="admin-main-container">
          {renderScreen()}
        </main>

        {/* Website-Style Mobile Bottom Navigation Bar (< 768px) */}
        <AdminMobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>
    </div>
  );
};
