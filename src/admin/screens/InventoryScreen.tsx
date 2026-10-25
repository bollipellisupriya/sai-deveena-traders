import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { CatalogData } from '../../types';

interface InventoryScreenProps {
  catalog: CatalogData | null;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ catalog }) => {
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const products = catalog?.products || [];

  const filtered = products.filter(
    (p) =>
      p.name.en.toLowerCase().includes(search.toLowerCase()) ||
      p.name.te.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStock = (productName: string) => {
    setToastMessage(`Phase 1 Preview: Live stock toggle for "${productName}" will write to Supabase in Phase 2.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '400px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items for quick stock control..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
          💡 Instant Stock Toggling enabled for admin management
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Current Price</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Availability</th>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Quick Toggle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const inStock = p.inStock !== false;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>{p.name.en}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.name.te}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                      {p.category}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                      ₹{p.price}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        backgroundColor: inStock ? '#dcfce7' : '#fee2e2',
                        color: inStock ? '#15803d' : '#b91c1c',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        {inStock ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {inStock ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStock(p.name.en)}
                        style={{
                          backgroundColor: inStock ? '#ffffff' : '#15803d',
                          color: inStock ? '#b91c1c' : '#ffffff',
                          border: inStock ? '1.5px solid #fca5a5' : 'none',
                          borderRadius: '8px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
