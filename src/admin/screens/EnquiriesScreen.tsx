import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  UserCheck
} from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import type { CustomerEnquiry, EnquiryStatus } from '../../types';

export const EnquiriesScreen: React.FC = () => {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Enquiry for Details Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // Load enquiries from Supabase
  const loadEnquiries = async () => {
    setIsLoading(true);
    setError(null);
    const res = await enquiryService.fetchEnquiries({
      statusFilter,
      searchQuery
    });
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setEnquiries(res.enquiries);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  // Client-side quick search filtering
  const filteredEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;
    const term = searchQuery.toLowerCase().trim();
    return enquiries.filter((enq) => {
      return (
        enq.name.toLowerCase().includes(term) ||
        enq.phone.includes(term) ||
        enq.villageCity.toLowerCase().includes(term) ||
        (enq.productName && enq.productName.toLowerCase().includes(term)) ||
        (enq.email && enq.email.toLowerCase().includes(term))
      );
    });
  }, [enquiries, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter(e => e.status === 'new').length;
    const contactedCount = enquiries.filter(e => e.status === 'contacted').length;
    const convertedCount = enquiries.filter(e => e.status === 'order_confirmed').length;
    return { total, newCount, contactedCount, convertedCount };
  }, [enquiries]);

  // Quick Status Update
  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus, notesToSave?: string) => {
    setIsUpdatingStatus(true);
    setUpdateSuccessMsg(null);
    const res = await enquiryService.updateEnquiryStatus(enquiryId, newStatus, notesToSave);
    setIsUpdatingStatus(false);

    if (res.success) {
      setEnquiries(prev =>
        prev.map(e => (e.id === enquiryId ? { ...e, status: newStatus, notes: notesToSave ?? e.notes, updatedAt: new Date().toISOString() } : e))
      );
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(prev => (prev ? { ...prev, status: newStatus, notes: notesToSave ?? prev.notes } : null));
      }
      setUpdateSuccessMsg('Status updated successfully!');
      setTimeout(() => setUpdateSuccessMsg(null), 2500);
    } else {
      alert(res.error || 'Failed to update enquiry status');
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return (
          <span style={{
            backgroundColor: '#fef3c7',
            color: '#b45309',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid #fde68a',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Clock size={11} />
            <span>New</span>
          </span>
        );
      case 'contacted':
        return (
          <span style={{
            backgroundColor: '#ede9fe',
            color: '#6d28d9',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid #ddd6fe',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Phone size={11} />
            <span>Contacted</span>
          </span>
        );
      case 'interested':
        return (
          <span style={{
            backgroundColor: '#ffedd5',
            color: '#c2410c',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid #fed7aa',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <UserCheck size={11} />
            <span>Interested</span>
          </span>
        );
      case 'order_confirmed':
        return (
          <span style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid #bbf7d0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <CheckCircle size={11} />
            <span>Order Confirmed</span>
          </span>
        );
      case 'closed':
        return (
          <span style={{
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0'
          }}>
            Closed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 1. Header & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Customer Product Enquiries
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.2rem 0 0' }}>
            Direct customer enquiries via WhatsApp & Phone call. No customer password required.
          </p>
        </div>

        <button
          onClick={loadEnquiries}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.55rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <RefreshCw size={15} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Total Enquiries
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {metrics.total}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #fde68a',
          padding: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
            New (Pending Response)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309', marginTop: '0.2rem' }}>
            {metrics.newCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #ddd6fe',
          padding: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>
            Contacted & In Progress
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6d28d9', marginTop: '0.2rem' }}>
            {metrics.contactedCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #bbf7d0',
          padding: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
            Orders Confirmed
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', marginTop: '0.2rem' }}>
            {metrics.convertedCount}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          padding: '0.45rem 0.75rem',
          flex: '1 1 260px'
        }}>
          <Search size={16} style={{ color: '#94a3b8', marginRight: '0.5rem' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, village, product..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.84rem',
              width: '100%',
              color: '#0f172a'
            }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'new', label: 'New' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'interested', label: 'Interested' },
            { id: 'order_confirmed', label: 'Confirmed' },
            { id: 'closed', label: 'Closed' }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: isActive ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#f0fdf4' : '#ffffff',
                  color: isActive ? '#15803d' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Database Schema Notice if Table Not Found */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          color: '#991b1b',
          fontSize: '0.84rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, marginBottom: '0.2rem' }}>Database Notice:</div>
            <div>{error}</div>
            <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: '#7f1d1d' }}>
              Note: The database migration file <code>supabase/migrations/20261026_customer_enquiries.sql</code> is prepared.
              Apply it in the Supabase Dashboard SQL Editor when approved to activate live enquiry storage.
            </div>
          </div>
        </div>
      )}

      {/* 4. Enquiries Data Table / Cards */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {isLoading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#15803d', margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Loading customer enquiries...</div>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <MessageSquare size={36} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              No Customer Enquiries Found
            </div>
            <p style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0 auto' }}>
              {searchQuery
                ? `No enquiries match your search "${searchQuery}". Try clearing filters.`
                : 'Customer enquiries submitted from Call and WhatsApp buttons will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date & Ref</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer Details</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Village / Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Product Inquired</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact Via</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enq) => {
                  const dateStr = new Date(enq.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const refShort = `#ENQ-${enq.id.slice(0, 8).toUpperCase()}`;

                  return (
                    <tr
                      key={enq.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s ease',
                        fontSize: '0.84rem'
                      }}
                    >
                      {/* Date & Ref */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{refShort}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{dateStr}</div>
                      </td>

                      {/* Customer Details */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{enq.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '3px' }}>
                          <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.8rem' }}>+91 {enq.phone}</span>
                          <a
                            href={`https://wa.me/91${enq.phone}?text=Hello%20${encodeURIComponent(enq.name)},%20this%20is%20Sai%20Deveena%20Traders%20following%20up%20on%20your%20enquiry.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            style={{ color: '#15803d', display: 'flex', alignItems: 'center' }}
                          >
                            <MessageCircle size={14} />
                          </a>
                          <a
                            href={`tel:${enq.phone}`}
                            title="Call Customer"
                            style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}
                          >
                            <Phone size={14} />
                          </a>
                        </div>
                        {enq.email && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            {enq.email}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: '#334155' }}>
                          <MapPin size={13} style={{ color: '#ea580c' }} />
                          <span>{enq.villageCity}</span>
                        </div>
                        {enq.address && (
                          <div style={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            marginTop: '2px',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {enq.address}
                          </div>
                        )}
                      </td>

                      {/* Product */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#0f172a' }}>
                          <Package size={14} style={{ color: '#15803d' }} />
                          <span>{enq.productName || 'General Store Inquiry'}</span>
                        </div>
                      </td>

                      {/* Contact Via */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: enq.preferredContact === 'whatsapp' ? '#15803d' : '#2563eb'
                        }}>
                          {enq.preferredContact === 'whatsapp' ? <MessageCircle size={13} /> : <Phone size={13} />}
                          <span style={{ textTransform: 'capitalize' }}>{enq.preferredContact}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {renderStatusBadge(enq.status)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setAdminNotes(enq.notes || '');
                          }}
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: '#334155',
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Details & Status Update Modal */}
      {selectedEnquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(5px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.15rem 1.25rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Enquiry Details
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Ref: #ENQ-{selectedEnquiry.id.slice(0, 8).toUpperCase()} • {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.25rem' }}>
              {updateSuccessMsg && (
                <div style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#15803d',
                  marginBottom: '1rem'
                }}>
                  {updateSuccessMsg}
                </div>
              )}

              {/* Customer Box */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.95rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  Customer Information
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                  {selectedEnquiry.name}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#15803d', fontWeight: 800, marginTop: '2px' }}>
                  Phone: +91 {selectedEnquiry.phone}
                </div>
                {selectedEnquiry.email && (
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                    Email: {selectedEnquiry.email}
                  </div>
                )}
                <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 700, marginTop: '4px' }}>
                  Location: {selectedEnquiry.villageCity}
                </div>
                {selectedEnquiry.address && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                    Full Address: {selectedEnquiry.address}
                  </div>
                )}

                {/* Direct Action Buttons for Admin */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                  <a
                    href={`https://wa.me/91${selectedEnquiry.phone}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20this%20is%20Sai%20Deveena%20Traders%20in%20Bhainsa%20responding%20to%20your%20enquiry%20regarding%20${encodeURIComponent(selectedEnquiry.productName || 'our products')}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none'
                    }}
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Customer</span>
                  </a>

                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    style={{
                      flex: 1,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={15} />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>

              {/* Product Box */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '0.95rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Product Inquired
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                  {selectedEnquiry.productName || 'General Store Enquiry'}
                </div>
                {selectedEnquiry.productId && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Product Code: {selectedEnquiry.productId}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, marginTop: '4px' }}>
                  Customer Preferred Contact: <span style={{ textTransform: 'uppercase' }}>{selectedEnquiry.preferredContact}</span>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  Update Enquiry Status:
                </label>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value as EnquiryStatus, adminNotes)}
                  disabled={isUpdatingStatus}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="new">New (Pending Contact)</option>
                  <option value="contacted">Contacted (In Discussion)</option>
                  <option value="interested">Interested (Pending Delivery/Payment)</option>
                  <option value="order_confirmed">Order Confirmed</option>
                  <option value="closed">Closed / Cancelled</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  Internal Admin Follow-up Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Quoted ₹3,200 for 2 bags; customer will visit shop on Friday morning."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedEnquiry.id, selectedEnquiry.status, adminNotes)}
                  disabled={isUpdatingStatus}
                  style={{
                    marginTop: '0.45rem',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isUpdatingStatus ? 'Saving Notes...' : 'Save Admin Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
