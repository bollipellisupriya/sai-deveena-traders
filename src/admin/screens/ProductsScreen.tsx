import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Plus, Package, Eye, X, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import type { CatalogData, Product, Category } from '../../types';

interface ProductsScreenProps {
  catalog: CatalogData | null;
  onRefreshCatalog?: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ onRefreshCatalog }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    id: '',
    category: '',
    subCategory: '',
    nameEn: '',
    nameTe: '',
    brand: '',
    packSize: '',
    price: '',
    originalPrice: '',
    descriptionEn: '',
    descriptionTe: '',
    image: '',
    active: true,
    featured: false,
    inStock: true,
    keyFeaturesText: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Load products and categories from Supabase
  const loadData = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);

    const [prodRes, catRes] = await Promise.all([
      catalogService.fetchAllAdminProducts(),
      catalogService.fetchAllAdminCategories()
    ]);

    if (prodRes.error) {
      console.warn('Could not load products from Supabase:', prodRes.error);
    } else if (prodRes.data) {
      setProducts(prodRes.data);
    }

    if (catRes.error) {
      console.warn('Could not load categories from Supabase:', catRes.error);
    } else if (catRes.data) {
      setCategories(catRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Form Modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      id: '',
      category: categories[0]?.id || '',
      subCategory: '',
      nameEn: '',
      nameTe: '',
      brand: '',
      packSize: '',
      price: '',
      originalPrice: '',
      descriptionEn: '',
      descriptionTe: '',
      image: '',
      active: true,
      featured: false,
      inStock: true,
      keyFeaturesText: ''
    });
    setSelectedImageFile(null);
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      id: prod.id,
      category: prod.category,
      subCategory: prod.subCategory || '',
      nameEn: prod.name.en,
      nameTe: prod.name.te,
      brand: prod.brand || '',
      packSize: prod.packSize || '',
      price: prod.price !== null ? String(prod.price) : '',
      originalPrice: prod.originalPrice !== null && prod.originalPrice !== undefined ? String(prod.originalPrice) : '',
      descriptionEn: prod.description.en,
      descriptionTe: prod.description.te,
      image: prod.image || '',
      active: prod.active !== false,
      featured: Boolean(prod.featured),
      inStock: prod.inStock !== false,
      keyFeaturesText: Array.isArray(prod.keyFeatures) ? prod.keyFeatures.join('\n') : ''
    });
    setSelectedImageFile(null);
    setIsFormModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage(null);

    // Validation
    if (!formData.nameEn.trim()) {
      setStatusMessage({ type: 'error', text: 'English product name is required.' });
      setActionLoading(false);
      return;
    }
    if (!formData.category) {
      setStatusMessage({ type: 'error', text: 'Please select a product category.' });
      setActionLoading(false);
      return;
    }

    let finalImageUrl = formData.image.trim();

    // Handle Image Upload if a file was selected
    if (selectedImageFile) {
      const uploadRes = await catalogService.uploadProductImage(selectedImageFile);
      if (uploadRes.error) {
        setStatusMessage({
          type: 'error',
          text: `Image upload note: ${uploadRes.error}. (You can still enter a direct image URL or ensure the 'product-images' bucket is created in Supabase Storage).`
        });
        setActionLoading(false);
        return;
      }
      if (uploadRes.data) {
        finalImageUrl = uploadRes.data;
      }
    }

    // Auto-generate slug ID if creating new and ID was left blank
    const targetId = editingProduct
      ? editingProduct.id
      : formData.id.trim() || formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const parsedPrice = formData.price.trim() !== '' ? Number(formData.price) : null;
    const parsedOriginalPrice = formData.originalPrice.trim() !== '' ? Number(formData.originalPrice) : null;

    const productPayload: Product = {
      id: targetId,
      category: formData.category,
      subCategory: formData.subCategory.trim() || undefined,
      name: {
        en: formData.nameEn.trim(),
        te: formData.nameTe.trim() || formData.nameEn.trim()
      },
      brand: formData.brand.trim() || undefined,
      packSize: formData.packSize.trim() || undefined,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      description: {
        en: formData.descriptionEn.trim(),
        te: formData.descriptionTe.trim() || formData.descriptionEn.trim()
      },
      image: finalImageUrl || undefined,
      active: formData.active,
      featured: formData.featured,
      inStock: formData.inStock,
      keyFeatures: formData.keyFeaturesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    let result;
    if (editingProduct) {
      result = await catalogService.updateProduct(editingProduct.id, productPayload);
    } else {
      result = await catalogService.createProduct(productPayload);
    }

    if (result.error) {
      setStatusMessage({ type: 'error', text: `Database error: ${result.error}` });
      setActionLoading(false);
      return;
    }

    setStatusMessage({
      type: 'success',
      text: editingProduct ? `Product "${productPayload.name.en}" updated successfully!` : `Product "${productPayload.name.en}" created successfully!`
    });
    setIsFormModalOpen(false);
    setActionLoading(false);
    loadData();
    onRefreshCatalog?.();
  };

  // Delete Product
  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name.en}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    const res = await catalogService.deleteProduct(prod.id);
    setActionLoading(false);

    if (res.error) {
      setStatusMessage({ type: 'error', text: `Failed to delete: ${res.error}` });
    } else {
      setStatusMessage({ type: 'success', text: `Deleted "${prod.name.en}" from database.` });
      loadData();
      onRefreshCatalog?.();
    }
  };

  // Filtered list
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
      {/* Status Notifications */}
      {statusMessage && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: statusMessage.type === 'success' ? '#15803d' : '#991b1b',
          border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fca5a5'}`
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Toolbar */}
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
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '400px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, Telugu, brand..."
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

        {/* Filter & Actions */}
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
            onClick={loadData}
            title="Refresh database records"
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '0.5rem',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreate}
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
            Database Catalog: {filteredProducts.length} Products
          </span>
          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>
            ● Connected to Supabase
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
            <div>Loading products from Supabase...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}>
              <Package size={26} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              No Products in Database Yet
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
              Your database-backed catalog is currently clean and empty. Click <strong>Add Product</strong> above to add your first live agricultural item.
            </p>
            <button
              onClick={handleOpenCreate}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Stock</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Visibility</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Title & Thumbnail */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {p.image ? (
                            <img src={p.image} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            <Package size={20} style={{ color: '#94a3b8' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>{p.name.en}</div>
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
                        {p.price !== null ? `₹${p.price}` : 'Contact'}
                      </span>
                      {p.originalPrice && (
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.35rem' }}>
                          ₹{p.originalPrice}
                        </span>
                      )}
                    </td>

                    {/* Stock Status */}
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

                    {/* Active Visibility */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        backgroundColor: p.active !== false ? '#e0f2fe' : '#f1f5f9',
                        color: p.active !== false ? '#0369a1' : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px'
                      }}>
                        {p.active !== false ? 'Public' : 'Draft'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => setSelectedProduct(p)}
                          title="View Details"
                          style={{
                            background: 'none',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          style={{
                            background: 'none',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            color: '#15803d',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          title="Delete Product"
                          disabled={actionLoading}
                          style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL */}
      {isFormModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Saves directly to Supabase products table
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Product Titles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Paddy Seeds MTU-1010"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Product Name (Telugu) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameTe}
                    onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })}
                    placeholder="e.g. వరి విత్తనాలు"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name.en} ({c.name.te})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Sub-Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Paddy, Fertilizer, Sprayers"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Price & MRP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="850 (Leave blank for contact)"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Original Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="950"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Brand & Pack Size */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. IFFCO, Kaveri Seeds"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Pack Size
                  </label>
                  <input
                    type="text"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    placeholder="e.g. 25 kg bag, 1L bottle"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  English Description
                </label>
                <textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="High yield certified seeds suitable for Telangana soil..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Telugu Description
                </label>
                <textarea
                  rows={2}
                  value={formData.descriptionTe}
                  onChange={(e) => setFormData({ ...formData, descriptionTe: e.target.value })}
                  placeholder="అధిక దిగుబడినిచ్చే నాణ్యమైన ధృవీకృత విత్తనాలు..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>

              {/* Image Input & File Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Product Image (URL or Upload File)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... or /images/products/sample.svg"
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div style={{
                  padding: '0.75rem',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <Upload size={18} style={{ color: '#15803d' }} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                    style={{ fontSize: '0.78rem', color: '#475569' }}
                  />
                </div>
              </div>

              {/* Key Features (One per line) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Key Features (One bullet point per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.keyFeaturesText}
                  onChange={(e) => setFormData({ ...formData, keyFeaturesText: e.target.value })}
                  placeholder="High germination rate (90%+)&#10;Resistant to leaf blight&#10;Ideal for black cotton soil"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>

              {/* Toggles: In Stock, Active, Featured */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                padding: '0.85rem',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <span>In Stock</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Public Active</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.5rem',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: actionLoading ? 0.75 : 1
                  }}
                >
                  {actionLoading && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT MODAL */}
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
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} style={{ color: '#15803d' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Product Details</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
              <div><strong>English:</strong> {selectedProduct.name.en}</div>
              <div><strong>Telugu:</strong> {selectedProduct.name.te}</div>
              <div><strong>Category:</strong> {selectedProduct.category}</div>
              <div><strong>Price:</strong> ₹{selectedProduct.price ?? 'Contact'}</div>
              <div><strong>Status:</strong> {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'} • {selectedProduct.active ? 'Public' : 'Hidden'}</div>
              <div><strong>Description:</strong> {selectedProduct.description.en}</div>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
