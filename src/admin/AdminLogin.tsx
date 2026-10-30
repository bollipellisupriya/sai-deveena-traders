import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Store, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase, getSupabaseConfigStatus } from '../lib/supabase';
import { catalogService } from '../services/catalogService';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onExitToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExitToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const configStatus = getSupabaseConfigStatus();
  const isConfigured = configStatus.isConfigured;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!configStatus.isConfigured) {
      setErrorMessage(configStatus.message);
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid login credentials.');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMessage('Authentication succeeded but user record was not returned.');
        setLoading(false);
        return;
      }

      // 2. Enforce Administrator Role Check in public.admin_users
      const isAdmin = await catalogService.verifyAdminSession();

      if (!isAdmin) {
        // Sign out unauthorized user immediately
        await supabase.auth.signOut();
        setErrorMessage('Access Denied: This account is authenticated but is not an active administrator in public.admin_users.');
        setLoading(false);
        return;
      }

      // 3. Admin verified successfully!
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '24px',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Emblem & Portal Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(21, 128, 61, 0.4)'
          }}>
            <ShieldCheck size={34} />
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.02em'
          }}>
            Sai Deveena Traders &amp; General Store
          </h1>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(21, 128, 61, 0.2)',
            color: '#4ade80',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Secure Admin Portal
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#450a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: '#fecaca',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            <AlertTriangle size={17} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Environment configuration helper if anon key is not set yet */}
        {!isConfigured && (
          <div style={{
            backgroundColor: '#451a03',
            border: '1px solid #78350f',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.78rem',
            color: '#fef3c7',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            <AlertTriangle size={17} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Database Setup Note:</strong> Set <code>VITE_SUPABASE_ANON_KEY</code> in your environment to authenticate live. You can still enter in <em>Preview Mode</em> below.
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#cbd5e1',
              marginBottom: '0.45rem'
            }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saideevena.com"
                required={isConfigured}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#cbd5e1',
              marginBottom: '0.45rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required={isConfigured}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(21, 128, 61, 0.4)',
              transition: 'background-color 0.15s ease',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Verifying Administrator...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Exit to Customer Storefront Link */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #334155', textAlign: 'center' }}>
          <button
            onClick={onExitToStore}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Store size={15} />
            <span>Return to Customer Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
