import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Package, Eye, X } from 'lucide-react';
import type { CatalogData, Product } from '../../types';

interface ProductsScreenProps {
  catalog: CatalogData | null;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ catalog }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = catalog?.categories || [];
  const products = catalog?.products || [];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.name.en.toLowerCase().includes(search.toLowerCase()) ||
        p.name.te.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Toolbar: Search, Category Filter, and Add Product Action */}
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
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 250px',
          maxWidth: '400px'
        }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by English, Telugu, or Brand..."
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

        {/* Filter & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: '#64748b' }} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                color: '#334155',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 600
              }}
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en} ({c.name.te})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
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
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
            Showing {filteredProducts.length} of {products.length} Products
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Data source: public/catalog.json
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Pack Size</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  {/* Product Name & Thumb */}
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img
                          src={p.image || '/images/products/paddy-seeds-pouch.svg'}
                          alt=""
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                          {p.name.en}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {p.name.te} {p.brand ? `• ${p.brand}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px'
                    }}>
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a' }}>
                      ₹{p.price}
                    </span>
                    {p.originalPrice && (
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.35rem' }}>
                        ₹{p.originalPrice}
                      </span>
                    )}
                  </td>

                  {/* Pack Size */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                    {p.packSize || 'Standard'}
                  </td>

                  {/* In Stock Status */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      backgroundColor: p.inStock !== false ? '#dcfce7' : '#fee2e2',
                      color: p.inStock !== false ? '#15803d' : '#b91c1c',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: p.inStock !== false ? '#15803d' : '#b91c1c'
                      }} />
                      {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedProduct(p)}
                      title="Inspect Product"
                      style={{
                        background: 'none',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        color: '#334155',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Inspection Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} style={{ color: '#15803d' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Product Schema Preview
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>English Name:</div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{selectedProduct.name.en}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Telugu Name:</div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{selectedProduct.name.te}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Price:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803d' }}>₹{selectedProduct.price}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Category:</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>{selectedProduct.category}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Description:</div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{selectedProduct.description.en}</div>
              </div>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#92400e'
              }}>
                <strong>Phase 1 Notice:</strong> Direct edit operations will sync to Supabase once credentials are configured in Phase 2.
              </div>
            </div>

            <div style={{
              padding: '0.9rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'right'
            }}>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Notice Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Plus size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Create New Product
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The Product Creation Form will write directly into your Supabase PostgreSQL database table in <strong>Phase 2</strong>. In this Phase 1 foundation, the database connection is safely paused until credentials are provided.
            </p>

            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{
                width: '100%',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.65rem',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
