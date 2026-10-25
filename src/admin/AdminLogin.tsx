import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Store, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onExitToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExitToStore }) => {
  const [email, setEmail] = useState('admin@saideevena.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enters UI foundation preview mode (real Supabase auth in Phase 2)
    onLoginSuccess();
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
            Sai Deveena Traders
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

        {/* Phase 1 Foundation Notice */}
        <div style={{
          backgroundColor: '#451a03',
          border: '1px solid #78350f',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.78rem',
          color: '#fef3c7',
          lineHeight: 1.5,
          display: 'flex',
          gap: '0.65rem'
        }}>
          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#fbbf24' }}>Phase 1 UI Foundation:</strong>
            <div style={{ marginTop: '0.2rem', color: '#fed7aa' }}>
              Database & live Supabase authentication will be connected in Phase 2. You can click below to explore the complete admin layout.
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#cbd5e1',
              marginBottom: '0.45rem'
            }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                required
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(21, 128, 61, 0.4)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>Enter Admin Dashboard (Preview)</span>
            <ArrowRight size={16} />
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
