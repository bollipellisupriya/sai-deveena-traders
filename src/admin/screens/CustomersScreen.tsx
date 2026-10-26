import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import type { CustomerProfile } from '../../types';

export const CustomersScreen: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalCount, setTotalCount] = useState<number>(0);

  // Customer Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [customerDetail, setCustomerDetail] = useState<{ profile: CustomerProfile | null; orders: any[] } | null>(null);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.fetchCustomersList({
        search,
        status: statusFilter,
        page: 1,
        pageSize: 50
      });
      setCustomers(res.customers);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Load customer detail
  const handleOpenDetail = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDetailLoading(true);
    try {
      const data = await customerService.fetchCustomerDetail(customerId);
      setCustomerDetail(data);
    } catch (err) {
      console.error('Error loading customer detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
    setCustomerDetail(null);
  };

  // Change account status
  const handleStatusChange = async (customerId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
    setUpdatingId(customerId);
    const res = await customerService.updateCustomerStatus(customerId, newStatus);
    setUpdatingId(null);

    if (res.error) {
      setNotification({ message: `Failed to update status: ${res.error}`, type: 'error' });
    } else {
      setNotification({ message: `Customer status updated to ${newStatus}.`, type: 'success' });
      // Update local state
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: newStatus } : c));
      if (customerDetail && customerDetail.profile?.id === customerId) {
        setCustomerDetail({
          ...customerDetail,
          profile: { ...customerDetail.profile, status: newStatus }
        });
      }
    }

    setTimeout(() => setNotification(null), 3500);
  };

  // Quick stats
  const activeCount = customers.filter(c => c.status === 'active').length;
  const suspendedCount = customers.filter(c => c.status === 'suspended').length;
  const totalOrdersCount = customers.reduce((sum, c) => sum + (c.orderCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          backgroundColor: notification.type === 'success' ? '#15803d' : '#dc2626',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. Header & Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Total Customers</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600, marginTop: '0.25rem' }}>
            Excludes store admins
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Active Accounts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d', marginTop: '0.25rem' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Eligible to place orders
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Suspended Accounts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#dc2626', marginTop: '0.25rem' }}>
            {suspendedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Blocked from ordering
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Registered Orders</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284c7', marginTop: '0.25rem' }}>
            {totalOrdersCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Lifetime customer orders
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '0.45rem 0.85rem',
          flex: 1,
          minWidth: '240px',
          maxWidth: '420px'
        }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone, village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.84rem',
              color: '#0f172a'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'active', 'suspended', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                backgroundColor: statusFilter === st ? '#15803d' : '#f1f5f9',
                color: statusFilter === st ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {st}
            </button>
          ))}

          <button
            onClick={loadCustomers}
            title="Refresh list"
            disabled={loading}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3. Customers Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {loading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', color: '#15803d' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Loading customer records...</div>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <Users size={36} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              No Customers Found
            </div>
            <div style={{ fontSize: '0.82rem', maxWidth: '380px', margin: '0 auto' }}>
              {search || statusFilter !== 'all'
                ? 'No customer records match your active search and filter criteria.'
                : 'Registered customers will appear here once they create accounts in the store.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 800 }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Contact Info</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Location</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Account Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Orders</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Total Spend</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Joined</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const initials = c.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'C';

                  const joinedDate = new Date(c.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: c.status === 'suspended' ? '#fee2e2' : '#dcfce7',
                            color: c.status === 'suspended' ? '#dc2626' : '#15803d',
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.fullName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: {c.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {c.phone ? (
                            <a
                              href={`tel:${c.phone}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}
                            >
                              <Phone size={13} style={{ color: '#ea580c' }} />
                              <span>{c.phone}</span>
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>No phone</span>
                          )}
                          {c.email && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.76rem' }}>
                              <Mail size={12} />
                              <span>{c.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
                          <MapPin size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                          <span>{c.villageOrCity || 'Not specified'}</span>
                        </div>
                      </td>

                      {/* Status & Toggle */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <select
                          value={c.status}
                          disabled={updatingId === c.id}
                          onChange={(e) => handleStatusChange(c.id, e.target.value as any)}
                          style={{
                            backgroundColor:
                              c.status === 'active' ? '#dcfce7' : c.status === 'suspended' ? '#fee2e2' : '#f1f5f9',
                            color:
                              c.status === 'active' ? '#15803d' : c.status === 'suspended' ? '#dc2626' : '#475569',
                            border: '1px solid transparent',
                            borderRadius: '9999px',
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      {/* Orders Count */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.78rem'
                        }}>
                          {c.orderCount || 0}
                        </span>
                      </td>

                      {/* Total Spend */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                        ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.76rem' }}>
                        {joinedDate}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenDetail(c.id)}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} />
                          <span>Orders</span>
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

      {/* 4. Customer Detail & Order History Modal */}
      {selectedCustomerId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Customer Profile & Purchase History
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                  Live Supabase records and order receipts
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {detailLoading || !customerDetail ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', color: '#15803d' }} />
                  <div>Loading customer history...</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Profile Card */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.15rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                          {customerDetail.profile?.fullName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Account ID: {customerDetail.profile?.id}
                        </div>
                      </div>

                      <span style={{
                        backgroundColor: customerDetail.profile?.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: customerDetail.profile?.status === 'active' ? '#15803d' : '#dc2626',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase'
                      }}>
                        {customerDetail.profile?.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '1rem',
                      fontSize: '0.82rem'
                    }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Phone: </span>
                        <strong style={{ color: '#0f172a' }}>{customerDetail.profile?.phone || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Email: </span>
                        <strong style={{ color: '#0f172a' }}>{customerDetail.profile?.email || 'None'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Village / Town: </span>
                        <strong style={{ color: '#0f172a' }}>{customerDetail.profile?.villageOrCity || 'Not specified'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Language: </span>
                        <strong style={{ color: '#0f172a' }}>{customerDetail.profile?.preferredLanguage === 'te' ? 'Telugu' : 'English'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Order History Header */}
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a' }}>
                      Order History ({customerDetail.orders.length})
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      Lifetime purchases excluding cancelled orders: ₹{(customerDetail.profile?.totalSpent || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Orders List */}
                  {customerDetail.orders.length === 0 ? (
                    <div style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px dashed #cbd5e1',
                      color: '#64748b',
                      fontSize: '0.84rem'
                    }}>
                      This customer has not placed any orders yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {customerDetail.orders.map((ord: any) => (
                        <div
                          key={ord.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '1rem',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                            <div>
                              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.9rem' }}>
                                #{ord.order_number}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '0.65rem' }}>
                                {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <span style={{
                              backgroundColor: ord.status === 'delivered' ? '#dcfce7' : ord.status === 'cancelled' ? '#fee2e2' : '#dbeafe',
                              color: ord.status === 'delivered' ? '#15803d' : ord.status === 'cancelled' ? '#dc2626' : '#1d4ed8',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              textTransform: 'capitalize'
                            }}>
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Line items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.65rem' }}>
                            {(ord.order_items || []).map((it: any) => (
                              <div
                                key={it.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.8rem',
                                  color: '#334155'
                                }}
                              >
                                <span>{it.product_name_en} x {it.quantity} {it.pack_size ? `(${it.pack_size})` : ''}</span>
                                <span style={{ fontWeight: 700 }}>₹{Number(it.total_price) || 0}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px dashed #e2e8f0',
                            paddingTop: '0.5rem',
                            fontSize: '0.84rem'
                          }}>
                            <span style={{ color: '#64748b' }}>Delivery to: {ord.delivery_location}</span>
                            <span style={{ fontWeight: 900, color: '#15803d', fontSize: '0.94rem' }}>
                              Total: ₹{Number(ord.total_amount) || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseDetail}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
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
