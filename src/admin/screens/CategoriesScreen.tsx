import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, CheckCircle2, XCircle, Edit2, Trash2, X, AlertCircle, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import type { CatalogData, Category, Product } from '../../types';

interface CategoriesScreenProps {
  catalog?: CatalogData | null;
  onRefreshCatalog?: () => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onRefreshCatalog }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalStatus, setModalStatus] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    nameEn: '',
    nameTe: '',
    icon: '',
    image: '',
    descriptionEn: '',
    descriptionTe: '',
    displayOrder: 0,
    isActive: true
  });

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);

    const [catRes, prodRes] = await Promise.all([
      catalogService.fetchAllAdminCategories(),
      catalogService.fetchAllAdminProducts()
    ]);

    if (catRes.error) {
      console.warn('Could not load categories:', catRes.error);
    } else if (catRes.data) {
      setCategories(catRes.data);
    }

    if (prodRes.error) {
      console.warn('Could not load products:', prodRes.error);
    } else if (prodRes.data) {
      setProducts(prodRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setModalStatus(null);
    setFormData({
      id: '',
      nameEn: '',
      nameTe: '',
      icon: '',
      image: '',
      descriptionEn: '',
      descriptionTe: '',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setSelectedFile(null);
    setPreviewUrl(cat.image || null);
    setModalStatus(null);
    setFormData({
      id: cat.id,
      nameEn: cat.name.en,
      nameTe: cat.name.te,
      icon: cat.icon || '',
      image: cat.image || '',
      descriptionEn: cat.description?.en || '',
      descriptionTe: cat.description?.te || '',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setModalStatus({ type: 'error', text: 'Please select a valid JPG, PNG, or WebP image.' });
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setModalStatus({ type: 'error', text: 'Image file size must be less than 5 MB.' });
      return;
    }

    setSelectedFile(file);
    setModalStatus(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewUrl(formData.image || null);
    setModalStatus(null);
  };

  const handleManualUpload = async () => {
    if (!selectedFile) return;

    setUploadLoading(true);
    setModalStatus(null);

    const res = await catalogService.uploadCategoryImage(selectedFile);
    setUploadLoading(false);

    if (res.error) {
      setModalStatus({ type: 'error', text: res.error });
    } else if (res.data) {
      setFormData(prev => ({ ...prev, image: res.data! }));
      setPreviewUrl(res.data);
      setSelectedFile(null);
      setModalStatus({ type: 'success', text: 'Category image uploaded to Supabase Storage successfully!' });
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const currentActive = cat.isActive !== false;
    const nextStatus = !currentActive;

    // Optimistic UI update
    setCategories(prev =>
      prev.map(c => (c.id === cat.id ? { ...c, isActive: nextStatus } : c))
    );

    const res = await catalogService.updateCategoryStatus(cat.id, nextStatus);

    if (res.error) {
      // Revert optimistic update
      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, isActive: currentActive } : c))
      );
      setStatusMessage({ type: 'error', text: `Failed to update status: ${res.error}` });
    } else {
      setStatusMessage({
        type: 'success',
        text: `Category "${cat.name.en}" is now ${nextStatus ? 'Active' : 'Hidden from storefront'}.`
      });
      onRefreshCatalog?.();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn.trim()) {
      setModalStatus({ type: 'error', text: 'Category English name is required.' });
      return;
    }
    if (!formData.nameTe.trim()) {
      setModalStatus({ type: 'error', text: 'Category Telugu name is required.' });
      return;
    }
    if (!editingCategory && !formData.id.trim()) {
      setModalStatus({ type: 'error', text: 'Category slug ID is required.' });
      return;
    }

    setActionLoading(true);
    setModalStatus(null);

    let finalImageUrl = formData.image.trim();

    // Auto-upload selected file if user selected one without clicking Upload button first
    if (selectedFile) {
      setModalStatus({ type: 'warning', text: 'Uploading image to Supabase Storage...' });
      const uploadRes = await catalogService.uploadCategoryImage(selectedFile);
      if (uploadRes.error) {
        setModalStatus({
          type: 'error',
          text: `Image upload failed: ${uploadRes.error}`
        });
        setActionLoading(false);
        return;
      }
      if (uploadRes.data) {
        finalImageUrl = uploadRes.data;
        setPreviewUrl(uploadRes.data);
        setSelectedFile(null);
      }
    }

    const categoryPayload: Category = {
      id: editingCategory ? editingCategory.id : formData.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: {
        en: formData.nameEn.trim(),
        te: formData.nameTe.trim()
      },
      icon: formData.icon.trim() || undefined,
      image: finalImageUrl || undefined,
      description: {
        en: formData.descriptionEn.trim(),
        te: formData.descriptionTe.trim()
      },
      isActive: formData.isActive,
      displayOrder: Number(formData.displayOrder) || 0
    };

    if (editingCategory) {
      const res = await catalogService.updateCategory(
        editingCategory.id,
        categoryPayload,
        categoryPayload.displayOrder,
        categoryPayload.isActive
      );
      if (res.error) {
        setModalStatus({ type: 'error', text: `Failed to update category: ${res.error}` });
      } else {
        setStatusMessage({ type: 'success', text: `Category "${categoryPayload.name.en}" updated successfully!` });
        setIsModalOpen(false);
        loadData();
        onRefreshCatalog?.();
      }
    } else {
      const res = await catalogService.createCategory(
        categoryPayload,
        categoryPayload.displayOrder || 0,
        categoryPayload.isActive !== false
      );
      if (res.error) {
        setModalStatus({ type: 'error', text: `Failed to create category: ${res.error}` });
      } else {
        setStatusMessage({ type: 'success', text: `Category "${categoryPayload.name.en}" created successfully!` });
        setIsModalOpen(false);
        loadData();
        onRefreshCatalog?.();
      }
    }

    setActionLoading(false);
  };

  const handleDelete = async (cat: Category) => {
    const itemCount = products.filter((p) => p.category === cat.id).length;
    const confirmText = itemCount > 0
      ? `This category contains ${itemCount} products. Are you sure you want to delete "${cat.name.en}"?`
      : `Are you sure you want to delete the category "${cat.name.en}"?`;

    if (!window.confirm(confirmText)) return;

    setActionLoading(true);
    const res = await catalogService.deleteCategory(cat.id);
    if (res.error) {
      setStatusMessage({ type: 'error', text: `Failed to delete category: ${res.error}` });
    } else {
      setStatusMessage({ type: 'success', text: `Category "${cat.name.en}" deleted.` });
      loadData();
      onRefreshCatalog?.();
    }
    setActionLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Status Banner */}
      {statusMessage && (
        <div style={{
          backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.84rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

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
            Manage agricultural product departments synced live with Supabase
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh categories"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '0.55rem',
              color: '#475569',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '3rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#15803d' }} />
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Loading categories from Supabase...</div>
        </div>
      ) : categories.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '3.5rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            No Categories In Database
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
            The database currently has no category records. Click "New Category" above to add your first department.
          </p>
          <button
            onClick={handleOpenCreate}
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.6rem 1.2rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            + Create First Category
          </button>
        </div>
      ) : (
        /* Category Cards Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {categories.map((cat) => {
            const itemCount = products.filter((p) => p.category === cat.id).length;
            const isActive = cat.isActive !== false;

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
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  opacity: isActive ? 1 : 0.75
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
                        style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/categories/quick-seeds.svg';
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* Active Status Badge / Quick Toggle */}
                      <button
                        onClick={() => handleToggleActive(cat)}
                        title={isActive ? 'Click to deactivate category' : 'Click to activate category'}
                        style={{
                          backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                          color: isActive ? '#15803d' : '#b91c1c',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        <span>{isActive ? 'Active' : 'Hidden'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit category"
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.35rem',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        title="Delete category"
                        style={{
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.35rem',
                          cursor: 'pointer',
                          color: '#b91c1c'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
                    Slug: {cat.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              backgroundColor: '#ffffff',
              zIndex: 10
            }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h2>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Supabase Database & Image Storage Sync
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modalStatus && (
                <div style={{
                  backgroundColor: modalStatus.type === 'success' ? '#f0fdf4' : modalStatus.type === 'warning' ? '#fffbeb' : '#fef2f2',
                  border: `1px solid ${modalStatus.type === 'success' ? '#bbf7d0' : modalStatus.type === 'warning' ? '#fde68a' : '#fecaca'}`,
                  color: modalStatus.type === 'success' ? '#166534' : modalStatus.type === 'warning' ? '#92400e' : '#991b1b',
                  borderRadius: '10px',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {modalStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span style={{ flex: 1 }}>{modalStatus.text}</span>
                </div>
              )}

              {!editingCategory && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                    Category Slug ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. seeds, fertilizers, pesticides"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Unique database identifier (lowercase letters and hyphens)
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quality Seeds"
                    value={formData.nameEn}
                    onChange={(e) => {
                      const newName = e.target.value;
                      if (!editingCategory && (!formData.id || formData.id === formData.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))) {
                        const slug = newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                        setFormData({ ...formData, nameEn: newName, id: slug });
                      } else {
                        setFormData({ ...formData, nameEn: newName });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                    Name (Telugu) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. నాణ్యమైన విత్తనాలు"
                    value={formData.nameTe}
                    onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              {/* ============================================================ */}
              {/* IMAGE UPLOAD & PREVIEW SECTION */}
              {/* ============================================================ */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: '#f8fafc'
              }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Category Image (JPG, PNG, WebP up to 5 MB)
                </label>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Image Preview Thumbnail */}
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1.5px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {previewUrl || formData.image ? (
                      <img
                        src={previewUrl || formData.image}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/categories/quick-seeds.svg';
                        }}
                      />
                    ) : (
                      <ImageIcon size={28} style={{ color: '#94a3b8' }} />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Upload size={14} />
                        <span>Choose File</span>
                      </button>

                      {selectedFile && (
                        <button
                          type="button"
                          onClick={handleManualUpload}
                          disabled={uploadLoading}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#15803d',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: uploadLoading ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {uploadLoading ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <span>Upload to Storage</span>
                          )}
                        </button>
                      )}
                    </div>

                    {selectedFile && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: '#15803d',
                        fontWeight: 600,
                        marginBottom: '0.45rem',
                        backgroundColor: '#f0fdf4',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px'
                      }}>
                        <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={handleClearSelectedFile}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0 0.25rem'
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Direct Image URL fallback */}
                    <div>
                      <input
                        type="text"
                        placeholder="Or enter direct image URL / SVG path"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          if (!selectedFile) setPreviewUrl(e.target.value || null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.76rem',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Order Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.45rem' }}>
                    Visibility
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#15803d' }}
                    />
                    <span>Active on Storefront</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  placeholder="Certified hybrid and high-yielding seeds..."
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                  Description (Telugu)
                </label>
                <textarea
                  rows={2}
                  placeholder="సర్టిఫైడ్ హైబ్రిడ్ మరియు అధిక దిగుబడినిచ్చే విత్తనాలు..."
                  value={formData.descriptionTe}
                  onChange={(e) => setFormData({ ...formData, descriptionTe: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading || uploadLoading}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadLoading}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#15803d',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: actionLoading || uploadLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
