import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { catalogService } from '../services/catalogService';
import type { CatalogData } from '../types';

interface AdminAppProps {
  catalog: CatalogData | null;
  onExitToStore: () => void;
  onRefreshCatalog?: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ catalog, onExitToStore, onRefreshCatalog }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(isSupabaseConfigured());

  // Check persistent session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCheckingSession(false);
      return;
    }

    const checkCurrentSession = async () => {
      try {
        const isAdmin = await catalogService.verifyAdminSession();
        if (isAdmin) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setIsAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkCurrentSession();

    // Listen for auth state changes (e.g. token refresh, sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const isAdmin = await catalogService.verifyAdminSession();
        setIsAuthenticated(isAdmin);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out:', e);
      }
    }
    setIsAuthenticated(false);
  };

  if (checkingSession) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.94rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Verifying Admin Session...
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Sai Deveena Traders &amp; General Store Portal
          </div>
        </div>
      </div>
    );
  }

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
          onLogout={handleLogout}
          onRefreshCatalog={onRefreshCatalog}
        />
      )}
    </>
  );
};

export default AdminApp;
