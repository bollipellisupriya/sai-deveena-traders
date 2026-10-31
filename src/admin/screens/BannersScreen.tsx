import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Eye,
  Smartphone,
  Monitor
} from 'lucide-react';
import { bannerService } from '../../services/bannerService';
import type { Banner, BannerInput } from '../../types';

export const BannersScreen: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [uploadingDesktop, setUploadingDesktop] = useState<boolean>(false);
  const [uploadingMobile, setUploadingMobile] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalStatus, setModalStatus] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'scheduled' | 'expired'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  // Preview Mode in Modal: 'desktop' vs 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form State
  const [formData, setFormData] = useState<BannerInput>({
    titleEn: '',
    titleTe: '',
    subtitleEn: '',
    subtitleTe: '',
    imageDesktop: '',
    imageMobile: '',
    buttonTextEn: 'Shop Now',
    buttonTextTe: 'ఇప్పుడు చూడండి',
    buttonLink: '#categories',
    isActive: true,
    sortOrder: 0,
    startAt: null,
    endAt: null
  });

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    const res = await bannerService.fetchAllAdminBanners();
    if (res.error) {
      console.warn('Could not load banners:', res.error);
      setStatusMessage({ type: 'error', text: `Failed to load banners: ${res.error}` });
    } else if (res.data) {
      setBanners(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingBanner(null);
    setModalStatus(null);
    setPreviewDevice('desktop');
    setFormData({
      titleEn: '',
      titleTe: '',
      subtitleEn: '',
      subtitleTe: '',
      imageDesktop: '',
      imageMobile: '',
      buttonTextEn: 'Shop Now',
      buttonTextTe: 'ఇప్పుడు చూడండి',
      buttonLink: '#categories',
      isActive: true,
      sortOrder: banners.length > 0 ? Math.max(...banners.map(b => b.sortOrder)) + 1 : 0,
      startAt: null,
      endAt: null
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setModalStatus(null);
    setPreviewDevice('desktop');
    setFormData({
      titleEn: b.title.en,
      titleTe: b.title.te,
      subtitleEn: b.subtitle.en,
      subtitleTe: b.subtitle.te,
      imageDesktop: b.imageDesktop,
      imageMobile: b.imageMobile || '',
      buttonTextEn: b.buttonText.en,
      buttonTextTe: b.buttonText.te,
      buttonLink: b.buttonLink,
      isActive: b.isActive,
      sortOrder: b.sortOrder,
      startAt: b.startAt ? b.startAt.slice(0, 16) : null,
      endAt: b.endAt ? b.endAt.slice(0, 16) : null
    });
    setIsModalOpen(true);
  };

  // Upload Desktop Image
  const handleDesktopFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDesktop(true);
    setModalStatus({ type: 'warning', text: 'Uploading desktop image to Supabase Storage...' });

    const res = await bannerService.uploadBannerImage(file, 'desktop');
    setUploadingDesktop(false);

    if (res.error) {
      setModalStatus({ type: 'error', text: res.error });
    } else if (res.data) {
      setFormData(prev => ({ ...prev, imageDesktop: res.data! }));
      setModalStatus({ type: 'success', text: 'Desktop banner uploaded successfully!' });
    }
  };

  // Upload Mobile Image
  const handleMobileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMobile(true);
    setModalStatus({ type: 'warning', text: 'Uploading mobile image to Supabase Storage...' });

    const res = await bannerService.uploadBannerImage(file, 'mobile');
    setUploadingMobile(false);

    if (res.error) {
      setModalStatus({ type: 'error', text: res.error });
    } else if (res.data) {
      setFormData(prev => ({ ...prev, imageMobile: res.data! }));
      setModalStatus({ type: 'success', text: 'Mobile banner uploaded successfully!' });
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (banner: Banner) => {
    const nextStatus = !banner.isActive;

    // Optimistic UI update
    setBanners(prev => prev.map(b => (b.id === banner.id ? { ...b, isActive: nextStatus } : b)));

    const res = await bannerService.toggleBannerStatus(banner.id, nextStatus);
    if (!res.success) {
      // Revert optimistic update
      setBanners(prev => prev.map(b => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b)));
      setStatusMessage({ type: 'error', text: `Failed to update status: ${res.error}` });
    } else {
      setStatusMessage({
        type: 'success',
        text: `Banner "${banner.title.en || 'Banner'}" is now ${nextStatus ? 'Active' : 'Inactive'}.`
      });
    }
  };

  // Save Banner (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageDesktop.trim()) {
      setModalStatus({ type: 'error', text: 'Desktop banner image is required.' });
      return;
    }

    setActionLoading(true);
    setModalStatus(null);

    const payload: BannerInput = {
      ...formData,
      imageDesktop: formData.imageDesktop.trim(),
      imageMobile: formData.imageMobile?.trim() || null,
      buttonLink: formData.buttonLink?.trim() || '#categories',
      startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
      endAt: formData.endAt ? new Date(formData.endAt).toISOString() : null
    };

    if (editingBanner) {
      const res = await bannerService.updateBanner(editingBanner.id, payload);
      setActionLoading(false);

      if (res.error) {
        setModalStatus({ type: 'error', text: res.error });
      } else if (res.data) {
        setBanners(prev => prev.map(b => (b.id === editingBanner.id ? res.data! : b)));
        setIsModalOpen(false);
        setStatusMessage({ type: 'success', text: 'Banner updated successfully!' });
      }
    } else {
      const res = await bannerService.createBanner(payload);
      setActionLoading(false);

      if (res.error) {
        setModalStatus({ type: 'error', text: res.error });
      } else if (res.data) {
        setBanners(prev => [res.data!, ...prev].sort((a, b) => a.sortOrder - b.sortOrder));
        setIsModalOpen(false);
        setStatusMessage({ type: 'success', text: 'New banner published successfully!' });
      }
    }
  };

  // Delete Banner Confirmed
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setActionLoading(true);
    const res = await bannerService.deleteBanner(deleteTarget.id);
    setActionLoading(false);

    if (!res.success) {
      setStatusMessage({ type: 'error', text: `Failed to delete banner: ${res.error}` });
    } else {
      setBanners(prev => prev.filter(b => b.id !== deleteTarget.id));
      setStatusMessage({ type: 'success', text: `Banner "${deleteTarget.title.en || 'Banner'}" deleted successfully.` });
    }
    setDeleteTarget(null);
  };

  // Move Order Up or Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const tempOrder = newBanners[index].sortOrder;
    newBanners[index].sortOrder = newBanners[targetIndex].sortOrder;
    newBanners[targetIndex].sortOrder = tempOrder;

    // Swap in array
    const tempItem = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = tempItem;

    setBanners(newBanners);

    await bannerService.updateBannerSortOrders([
      { id: newBanners[index].id, sortOrder: newBanners[index].sortOrder },
      { id: newBanners[targetIndex].id, sortOrder: newBanners[targetIndex].sortOrder }
    ]);
  };

  // Helper to determine banner scheduling status
  const getScheduleStatus = (b: Banner) => {
    const now = new Date();
    if (!b.isActive) {
      return { label: 'Inactive / Hidden', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
    }
    if (b.startAt && new Date(b.startAt) > now) {
      return {
        label: `Scheduled (${new Date(b.startAt).toLocaleDateString()})`,
        color: '#0284c7',
        bg: '#e0f2fe',
        border: '#7dd3fc'
      };
    }
    if (b.endAt && new Date(b.endAt) < now) {
      return {
        label: `Expired (${new Date(b.endAt).toLocaleDateString()})`,
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fca5a5'
      };
    }
    return { label: 'Live Now', color: '#16a34a', bg: '#dcfce7', border: '#86efac' };
  };

  // Filtered banners
  const filteredBanners = banners.filter(b => {
    // 1. Search Query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        b.title.en.toLowerCase().includes(q) ||
        b.title.te.toLowerCase().includes(q) ||
        b.subtitle.en.toLowerCase().includes(q) ||
        b.subtitle.te.toLowerCase().includes(q) ||
        b.buttonLink.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Status Filter
    const now = new Date();
    if (statusFilter === 'active') return b.isActive;
    if (statusFilter === 'inactive') return !b.isActive;
    if (statusFilter === 'scheduled') return b.isActive && b.startAt && new Date(b.startAt) > now;
    if (statusFilter === 'expired') return b.endAt && new Date(b.endAt) < now;

    return true;
  });

  // Calculate Metrics
  const now = new Date();
  const totalBanners = banners.length;
  const liveBanners = banners.filter(
    b => b.isActive && (!b.startAt || new Date(b.startAt) <= now) && (!b.endAt || new Date(b.endAt) >= now)
  ).length;
  const scheduledBanners = banners.filter(b => b.isActive && b.startAt && new Date(b.startAt) > now).length;
  const inactiveBanners = banners.filter(b => !b.isActive).length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #86efac'
              }}
            >
              <ImageIcon size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Banner & Hero Management
              </h1>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                Control live promotional slides, scheduling, bilingual text and destination links.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadBanners}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            <Plus size={18} />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Toast / Alert */}
      {statusMessage && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1.5px solid ${statusMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', fontWeight: 600 }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Metric KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Banners
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalBanners}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.2rem',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 8px rgba(22,163,74,0.06)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
            Live in Storefront
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d', marginTop: '0.25rem' }}>
            {liveBanners}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.2rem',
            border: '1px solid #bae6fd',
            boxShadow: '0 2px 8px rgba(2,132,199,0.06)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
            Future Scheduled
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0369a1', marginTop: '0.25rem' }}>
            {scheduledBanners}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Inactive / Drafts
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#475569', marginTop: '0.25rem' }}>
            {inactiveBanners}
          </div>
        </div>
      </div>

      {/* 4. Controls, Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '0.85rem 1.15rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        {/* Status Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', 'active', 'inactive', 'scheduled', 'expired'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '8px',
                border: statusFilter === tab ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === tab ? '#f0fdf4' : '#ffffff',
                color: statusFilter === tab ? '#15803d' : '#64748b',
                fontSize: '0.82rem',
                fontWeight: statusFilter === tab ? 700 : 500,
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {tab === 'all' ? 'All Banners' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ minWidth: '240px', flex: '1 0 200px', maxWidth: '380px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, subtitle, or link..."
            style={{
              width: '100%',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* 5. Banner Listing Table */}
      {loading ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}
        >
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#16a34a' }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading dynamic banners...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            border: '1px dashed #cbd5e1'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <ImageIcon size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.35rem' }}>
            No banners found
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'No banners match your active filters or search terms.'
              : 'You have not added any promotional banners yet. Published banners will appear dynamically in the customer storefront hero section.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569', width: '70px' }}>
                    Order
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569', width: '160px' }}>
                    Preview
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    Banner Details
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    Action & CTA
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    Schedule
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner, index) => {
                  const schedule = getScheduleStatus(banner);
                  return (
                    <tr
                      key={banner.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Sort Order & Reorder Controls */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1e293b', minWidth: '18px' }}>
                            {banner.sortOrder}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(index, 'up')}
                              disabled={index === 0}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: '1px',
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                opacity: index === 0 ? 0.3 : 0.8
                              }}
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(index, 'down')}
                              disabled={index === filteredBanners.length - 1}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: '1px',
                                cursor: index === filteredBanners.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: index === filteredBanners.length - 1 ? 0.3 : 0.8
                              }}
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Image Thumbnail */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div
                          style={{
                            width: '130px',
                            height: '65px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            position: 'relative'
                          }}
                        >
                          <img
                            src={banner.imageDesktop}
                            alt={banner.title.en || 'Banner'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                              (e.target as HTMLImageElement).src = '/images/banner-1.jpg';
                            }}
                          />
                          {banner.imageMobile && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '3px',
                                right: '3px',
                                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                color: '#ffffff',
                                fontSize: '0.62rem',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}
                              title="Has Mobile-specific banner image"
                            >
                              +Mobile
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & Subtitle */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                          {banner.title.en || 'Untitled Banner'}
                        </div>
                        {banner.title.te && (
                          <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                            {banner.title.te}
                          </div>
                        )}
                        {banner.subtitle.en && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            {banner.subtitle.en}
                          </div>
                        )}
                      </td>

                      {/* CTA & Destination Link */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#0f172a'
                          }}
                        >
                          <span>{banner.buttonText.en || 'Shop Now'}</span>
                          <span style={{ color: '#94a3b8' }}>&rarr;</span>
                          <span style={{ color: '#0284c7', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {banner.buttonLink}
                          </span>
                        </div>
                      </td>

                      {/* Schedule Badges */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backgroundColor: schedule.bg,
                            color: schedule.color,
                            border: `1px solid ${schedule.border}`
                          }}
                        >
                          {schedule.label}
                        </span>
                        {(banner.startAt || banner.endAt) && (
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                            {banner.startAt ? `From: ${new Date(banner.startAt).toLocaleDateString()}` : ''}
                            {banner.endAt ? ` - To: ${new Date(banner.endAt).toLocaleDateString()}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Active Status Switch */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(banner)}
                          style={{
                            position: 'relative',
                            width: '42px',
                            height: '24px',
                            borderRadius: '9999px',
                            backgroundColor: banner.isActive ? '#16a34a' : '#cbd5e1',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            padding: 0
                          }}
                          title={banner.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: banner.isActive ? '20px' : '2px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              transition: 'left 0.2s ease'
                            }}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(banner)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#0284c7',
                              cursor: 'pointer'
                            }}
                            title="Edit Banner"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(banner)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid #fee2e2',
                              backgroundColor: '#ffffff',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                            title="Delete Banner"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT BANNER MODAL
      ========================================================================= */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: '#ffffff',
                zIndex: 10
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingBanner ? 'Edit Banner Slide' : 'Create New Promotional Banner'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                  Upload desktop & mobile banners, set bilingual messages and configure scheduling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {modalStatus && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor:
                      modalStatus.type === 'success' ? '#f0fdf4' : modalStatus.type === 'warning' ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${
                      modalStatus.type === 'success' ? '#86efac' : modalStatus.type === 'warning' ? '#fde68a' : '#fca5a5'
                    }`,
                    color:
                      modalStatus.type === 'success' ? '#15803d' : modalStatus.type === 'warning' ? '#b45309' : '#b91c1c',
                    fontSize: '0.84rem',
                    fontWeight: 600
                  }}
                >
                  {modalStatus.text}
                </div>
              )}

              {/* SECTION A: DESKTOP IMAGE UPLOAD & URL */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.15rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    1. Desktop Banner Image <span style={{ color: '#dc2626' }}>*</span> (16:9 or 21:9 ratio)
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>JPG, PNG, WebP &bull; Max 5 MB</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  <input
                    type="text"
                    value={formData.imageDesktop}
                    onChange={e => setFormData(prev => ({ ...prev, imageDesktop: e.target.value }))}
                    placeholder="Enter image URL or upload below..."
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                  <input
                    type="file"
                    ref={desktopFileInputRef}
                    onChange={handleDesktopFileChange}
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => desktopFileInputRef.current?.click()}
                    disabled={uploadingDesktop}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #16a34a',
                      color: '#15803d',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: uploadingDesktop ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Upload size={15} />
                    <span>{uploadingDesktop ? 'Uploading...' : 'Upload to Supabase'}</span>
                  </button>
                </div>

                {formData.imageDesktop && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '140px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#0f172a',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    <img
                      src={formData.imageDesktop}
                      alt="Desktop Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '4px'
                      }}
                    >
                      Desktop Preview
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION B: MOBILE IMAGE UPLOAD (OPTIONAL) */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.15rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    2. Mobile Banner Image <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>(Optional - optimized for phones)</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>JPG, PNG, WebP</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  <input
                    type="text"
                    value={formData.imageMobile || ''}
                    onChange={e => setFormData(prev => ({ ...prev, imageMobile: e.target.value }))}
                    placeholder="Enter mobile image URL or upload file..."
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                  <input
                    type="file"
                    ref={mobileFileInputRef}
                    onChange={handleMobileFileChange}
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => mobileFileInputRef.current?.click()}
                    disabled={uploadingMobile}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: uploadingMobile ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Upload size={15} />
                    <span>{uploadingMobile ? 'Uploading...' : 'Upload Mobile Image'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION C: BILINGUAL TITLES & SUBTITLES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Title (English) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={e => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="e.g. Premium Seeds & Crop Care"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Title (Telugu - తెలుగు)
                  </label>
                  <input
                    type="text"
                    value={formData.titleTe}
                    onChange={e => setFormData(prev => ({ ...prev, titleTe: e.target.value }))}
                    placeholder="ఉదా: నాణ్యమైన విత్తనాలు & ఎరువులు"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Subtitle (English)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitleEn}
                    onChange={e => setFormData(prev => ({ ...prev, subtitleEn: e.target.value }))}
                    placeholder="e.g. Certified High-Yield Seeds for Farmers"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Subtitle (Telugu - తెలుగు)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitleTe}
                    onChange={e => setFormData(prev => ({ ...prev, subtitleTe: e.target.value }))}
                    placeholder="ఉదా: రైతులకు నమ్మకమైన ఆధునిక ఉత్పత్తులు"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* SECTION D: CTA BUTTON TEXT & DESTINATION LINK */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Button Text (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonTextEn}
                    onChange={e => setFormData(prev => ({ ...prev, buttonTextEn: e.target.value }))}
                    placeholder="Shop Now"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Button Text (TE)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonTextTe}
                    onChange={e => setFormData(prev => ({ ...prev, buttonTextTe: e.target.value }))}
                    placeholder="ఇప్పుడు చూడండి"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Destination Link (URL / Category)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink || ''}
                    onChange={e => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                    placeholder="#categories or seeds or https://..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* Quick destination suggestion chips */}
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                    {['#categories', 'seeds', 'fertilizers', 'crop-protection', 'tools', 'groceries'].map(link => (
                      <button
                        key={link}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, buttonLink: link }))}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION E: SCHEDULING & SORT ORDER */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Schedule Start Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startAt || ''}
                    onChange={e => setFormData(prev => ({ ...prev, startAt: e.target.value || null }))}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Schedule End Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endAt || ''}
                    onChange={e => setFormData(prev => ({ ...prev, endAt: e.target.value || null }))}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActiveCheckbox" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                    Active & Published
                  </label>
                </div>
              </div>

              {/* SECTION F: LIVE PREVIEW CONTAINER */}
              {formData.imageDesktop && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                      <Eye size={16} />
                      <span>Live Customer View Preview</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: previewDevice === 'desktop' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          backgroundColor: previewDevice === 'desktop' ? '#f0fdf4' : '#ffffff',
                          color: previewDevice === 'desktop' ? '#15803d' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Monitor size={12} />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: previewDevice === 'mobile' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          backgroundColor: previewDevice === 'mobile' ? '#f0fdf4' : '#ffffff',
                          color: previewDevice === 'mobile' ? '#15803d' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Smartphone size={12} />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Hero Banner Card */}
                  <div
                    style={{
                      position: 'relative',
                      width: previewDevice === 'mobile' ? '360px' : '100%',
                      height: previewDevice === 'mobile' ? '180px' : '200px',
                      margin: '0 auto',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1.5px solid #cbd5e1',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}
                  >
                    <img
                      src={previewDevice === 'mobile' && formData.imageMobile ? formData.imageMobile : formData.imageDesktop}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.92) 75%, rgba(255,255,255,0.98) 100%)'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: '1.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        maxWidth: previewDevice === 'mobile' ? '55%' : '45%',
                        textAlign: 'left'
                      }}
                    >
                      <div
                        style={{
                          fontSize: previewDevice === 'mobile' ? '0.58rem' : '0.7rem',
                          fontWeight: 800,
                          color: '#15803d',
                          backgroundColor: '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          display: 'inline-block',
                          marginBottom: '4px'
                        }}
                      >
                        {formData.subtitleEn || 'Special Offer'}
                      </div>
                      <h4
                        style={{
                          fontSize: previewDevice === 'mobile' ? '0.92rem' : '1.25rem',
                          fontWeight: 900,
                          color: '#0f172a',
                          margin: 0,
                          lineHeight: 1.2
                        }}
                      >
                        {formData.titleEn || 'Banner Title'}
                      </h4>
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          display: 'inline-block'
                        }}
                      >
                        {formData.buttonTextEn || 'Shop Now'} &rarr;
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{editingBanner ? 'Save Changes' : 'Publish Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
      ========================================================================= */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Delete Banner?
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.5rem', lineHeight: 1.4 }}>
              Are you sure you want to permanently delete banner{' '}
              <strong style={{ color: '#0f172a' }}>"{deleteTarget.title.en || 'this banner'}"</strong>?
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1.2rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '0.65rem 1.2rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Deleting...' : 'Delete Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersScreen;
