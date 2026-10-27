import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, XCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import type { CatalogData, Product } from '../../types';

interface InventoryScreenProps {
  catalog: CatalogData | null;
  onRefreshCatalog?: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onRefreshCatalog }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await catalogService.fetchAllAdminProducts();
    if (res.error) {
      console.warn('Could not load inventory products:', res.error);
    } else if (res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleStock = async (product: Product) => {
    const currentInStock = product.inStock !== false;
    const nextStatus = !currentInStock;

    setUpdatingId(product.id);
    setToastMessage(null);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: nextStatus } : p))
    );

    const res = await catalogService.updateStockStatus(product.id, nextStatus);

    if (res.error) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: currentInStock } : p))
      );
      setToastMessage({
        type: 'error',
        text: `Failed to update stock for "${product.name.en}": ${res.error}`
      });
    } else {
      setToastMessage({
        type: 'success',
        text: `"${product.name.en}" is now marked ${nextStatus ? 'Available' : 'Out of Stock'}.`
      });
      onRefreshCatalog?.();
      setTimeout(() => setToastMessage(null), 3500);
    }

    setUpdatingId(null);
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.en.toLowerCase().includes(search.toLowerCase()) ||
      p.name.te.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

    const inStock = p.inStock !== false;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'in_stock' && inStock) ||
      (statusFilter === 'out_of_stock' && !inStock);

    return matchesSearch && matchesStatus;
  });

  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          backgroundColor: toastMessage.type === 'success' ? '#14532d' : '#7f1d1d',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.65rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Items
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {products.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>
            In Stock
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d', marginTop: '0.2rem' }}>
            {inStockCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase' }}>
            Out of Stock
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b91c1c', marginTop: '0.2rem' }}>
            {outOfStockCount}
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {(['all', 'in_stock', 'out_of_stock'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  border: statusFilter === filterKey ? '1px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: statusFilter === filterKey ? '#f0fdf4' : '#ffffff',
                  color: statusFilter === filterKey ? '#15803d' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {filterKey === 'all' && 'All'}
                {filterKey === 'in_stock' && `In Stock (${inStockCount})`}
                {filterKey === 'out_of_stock' && `Out of Stock (${outOfStockCount})`}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={loadProducts}
          disabled={loading}
          title="Refresh inventory"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#475569',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sync Stock</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#15803d' }} />
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Loading inventory from Supabase...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a', marginBottom: '0.25rem' }}>
              No Products Found
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              {products.length === 0
                ? 'Your Supabase catalog is currently empty. Add products in the Products tab.'
                : 'No products match the selected search or filter.'}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Inventory Cards (Visible on < 768px) */}
            <div className="admin-mobile-cards" style={{ padding: '0.75rem' }}>
              {filtered.map((p) => {
                const inStock = p.inStock !== false;
                const isUpdating = updatingId === p.id;

                return (
                  <div
                    key={p.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                          {p.name.en}
                        </div>
                        {p.name.te && (
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            {p.name.te}
                          </div>
                        )}
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                          Category: <span style={{ fontWeight: 700, color: '#334155' }}>{p.category}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                          ₹{p.price}
                        </div>
                        <span style={{
                          backgroundColor: inStock ? '#dcfce7' : '#fee2e2',
                          color: inStock ? '#15803d' : '#b91c1c',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '4px'
                        }}>
                          {inStock ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleToggleStock(p)}
                        disabled={isUpdating}
                        style={{
                          width: '100%',
                          backgroundColor: inStock ? '#ffffff' : '#15803d',
                          color: inStock ? '#b91c1c' : '#ffffff',
                          border: inStock ? '1.5px solid #fca5a5' : 'none',
                          borderRadius: '10px',
                          padding: '0.55rem',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                          opacity: isUpdating ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem'
                        }}
                      >
                        {isUpdating ? 'Updating...' : inStock ? 'Mark Out of Stock' : 'Mark Available (In Stock)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Visible on >= 768px) */}
            <div className="admin-desktop-table" style={{ overflowX: 'auto' }}>
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
                    const isUpdating = updatingId === p.id;

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
                            onClick={() => handleToggleStock(p)}
                            disabled={isUpdating}
                            style={{
                              backgroundColor: inStock ? '#ffffff' : '#15803d',
                              color: inStock ? '#b91c1c' : '#ffffff',
                              border: inStock ? '1.5px solid #fca5a5' : 'none',
                              borderRadius: '8px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                              opacity: isUpdating ? 0.6 : 1
                            }}
                          >
                            {isUpdating ? 'Saving...' : inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
