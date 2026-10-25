import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import type { CatalogData } from '../../types';

interface CategoriesScreenProps {
  catalog: CatalogData | null;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ catalog }) => {
  const categories = catalog?.categories || [];
  const products = catalog?.products || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header bar */}
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
        <div>
          <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0f172a' }}>
            Store Categories ({categories.length})
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Organize inventory by agricultural departments
          </div>
        </div>

        <button
          onClick={() => alert('Category creation will be enabled in Phase 2 with Supabase.')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#15803d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.55rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {categories.map((cat) => {
          const itemCount = products.filter((p) => p.category === cat.id).length;
          return (
            <div
              key={cat.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={cat.image || '/images/categories/quick-seeds.svg'}
                      alt={cat.name.en}
                      style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                    />
                  </div>

                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.15rem' }}>
                  {cat.name.en}
                </h3>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d', marginBottom: '0.5rem' }}>
                  {cat.name.te}
                </div>

                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 1rem' }}>
                  {cat.description?.en || 'Agricultural category for Sai Deveena Traders'}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>
                  {itemCount} {itemCount === 1 ? 'Product' : 'Products'}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  ID: {cat.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
