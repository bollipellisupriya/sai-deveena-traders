import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import type { CatalogData } from '../types';

interface AdminAppProps {
  catalog: CatalogData | null;
  onExitToStore: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ catalog, onExitToStore }) => {
  // Authentication state for Phase 1 preview
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <>
      {!isAuthenticated ? (
        <AdminLogin
          onLoginSuccess={() => setIsAuthenticated(true)}
          onExitToStore={onExitToStore}
        />
      ) : (
        <AdminLayout
          catalog={catalog}
          onExitToStore={onExitToStore}
          onLogout={() => setIsAuthenticated(false)}
        />
      )}
    </>
  );
};

export default AdminApp;
