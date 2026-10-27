import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Plus,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  User,
  MessageSquare
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { catalogService } from '../../services/catalogService';
import type { Order, OrderStatus, OrderSource, PaymentMethod, Product, CustomerProfile } from '../../types';
import type { AdminTab } from '../types';

const STATUS_OPTIONS: { id: string; label: string; color: string; bg: string }[] = [
  { id: 'all', label: 'All Orders', color: '#0f172a', bg: '#f1f5f9' },
  { id: 'pending', label: 'Pending', color: '#d97706', bg: '#fef3c7' },
  { id: 'confirmed', label: 'Confirmed', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'processing', label: 'Processing', color: '#4f46e5', bg: '#e0e7ff' },
  { id: 'ready_for_pickup', label: 'Ready for Pickup', color: '#059669', bg: '#d1fae5' },
  { id: 'shipped', label: 'Shipped', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'delivered', label: 'Delivered', color: '#15803d', bg: '#dcfce7' },
  { id: 'cancelled', label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' }
];

interface OrdersScreenProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ onNavigateTab }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);

  // Status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Manual Order Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [existingCustomers, setExistingCustomers] = useState<CustomerProfile[]>([]);
  const [submittingManualOrder, setSubmittingManualOrder] = useState<boolean>(false);

  // Manual Order Form
  const [customerType, setCustomerType] = useState<'registered' | 'guest'>('guest');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Bhainsa Town');
  const [orderSource, setOrderSource] = useState<OrderSource>('phone');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.fetchAdminOrders({
        status: statusFilter,
        search,
        page: 1,
        pageSize: 50
      });
      setOrders(res.orders);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Error loading admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Load catalog products and registered customers when opening the manual order modal
  const handleOpenManualModal = async () => {
    setIsManualModalOpen(true);
    setModalError(null);
    try {
      const [prodRes, custRes] = await Promise.all([
        catalogService.fetchAllAdminProducts(),
        customerService.fetchCustomersList({ pageSize: 100 })
      ]);
      if (prodRes.data) {
        setCatalogProducts(prodRes.data.filter(p => p.active !== false));
      }
      if (custRes.customers) {
        setExistingCustomers(custRes.customers.filter(c => c.status === 'active'));
      }
    } catch (e) {
      console.error('Error loading products for manual order modal:', e);
    }
  };

  const handleCloseManualModal = () => {
    setIsManualModalOpen(false);
    setSelectedItems([]);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setSelectedCustomerId('');
    setOrderNotes('');
    setModalError(null);
  };

  // Add item in manual order
  const handleAddItem = (productId: string) => {
    if (!productId) return;
    setSelectedItems(prev => {
      const exists = prev.find(i => i.productId === productId);
      if (exists) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setSelectedItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    }
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Submit manual offline order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    let finalName = guestName.trim();
    let finalPhone = guestPhone.trim();
    let finalEmail = guestEmail.trim() || null;
    let customerIdForOrder: string | null = null;

    if (customerType === 'registered') {
      const matched = existingCustomers.find(c => c.id === selectedCustomerId);
      if (!matched) {
        setModalError('Please select a registered customer.');
        return;
      }
      finalName = matched.fullName;
      finalPhone = matched.phone || '';
      finalEmail = matched.email;
      customerIdForOrder = matched.id;
    } else {
      if (!finalName) {
        setModalError('Please enter customer name.');
        return;
      }
    }

    if (!deliveryLocation.trim()) {
      setModalError('Please enter delivery location / village.');
      return;
    }

    if (selectedItems.length === 0) {
      setModalError('Please add at least one product to the order.');
      return;
    }

    setSubmittingManualOrder(true);
    const res = await orderService.createOrderSecure({
      customerName: finalName,
      customerPhone: finalPhone || null,
      customerEmail: finalEmail,
      deliveryLocation: deliveryLocation.trim(),
      paymentMethod,
      orderSource,
      items: selectedItems,
      notes: orderNotes.trim() || null,
      customerId: customerIdForOrder
    });
    setSubmittingManualOrder(false);

    if (res.error) {
      setModalError(res.error);
    } else {
      setNotification({
        message: `Order #${res.data?.orderNumber || 'created'} recorded successfully!`,
        type: 'success'
      });
      handleCloseManualModal();
      loadOrders();
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Change order status
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    const res = await orderService.updateOrderStatus(orderId, newStatus);
    setUpdatingOrderId(null);

    if (res.error) {
      setNotification({ message: `Failed to update status: ${res.error}`, type: 'error' });
    } else {
      setNotification({ message: `Order status updated to ${newStatus}.`, type: 'success' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setTimeout(() => setNotification(null), 3500);
  };

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

      {/* 1. Top Controls Bar */}
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
        {/* Left: Search input */}
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
          maxWidth: '400px'
        }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search order #, customer, phone, village..."
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

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <button
            onClick={loadOrders}
            title="Refresh orders"
            disabled={loading}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '0.55rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#334155',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenManualModal}
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.55rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Record Offline Order</span>
          </button>
        </div>
      </div>

      {/* 2. Status Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {STATUS_OPTIONS.map((st) => {
          const isActive = statusFilter === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              style={{
                backgroundColor: isActive ? '#0f172a' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: isActive ? '#0f172a' : '#e2e8f0',
                borderRadius: '9999px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {st.label}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', padding: '0 0.5rem' }}>
          Total: {totalCount} {totalCount === 1 ? 'order' : 'orders'}
        </div>
      </div>

      {/* 3. Live Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '3.5rem 1rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', color: '#15803d' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Connecting to Supabase live orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <ClipboardList size={36} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              No Orders Recorded Yet
            </div>
            <div style={{ fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto 1.35rem', lineHeight: 1.5 }}>
              {statusFilter !== 'all' || search
                ? 'No live orders match your selected filters.'
                : 'Confirmed sales and offline orders appear here. If you are looking for product enquiries submitted by customers via WhatsApp or Phone, please check Customer Enquiries.'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('enquiries')}
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.6rem 1.35rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
                  }}
                >
                  <MessageSquare size={15} />
                  <span>View Customer Enquiries</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenManualModal}
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '9999px',
                  padding: '0.6rem 1.35rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                + Record Offline Order
              </button>
            </div>
          </div>
        ) : (
          orders.map((ord) => {
            const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={ord.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                      #{ord.orderNumber}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {dateStr}
                    </span>
                    {/* Order Source Badge */}
                    <span style={{
                      backgroundColor: ord.orderSource === 'whatsapp' ? '#dcfce7' : ord.orderSource === 'phone' ? '#ffedd5' : ord.orderSource === 'in_store' ? '#f3e8ff' : '#e0f2fe',
                      color: ord.orderSource === 'whatsapp' ? '#15803d' : ord.orderSource === 'phone' ? '#c2410c' : ord.orderSource === 'in_store' ? '#7e22ce' : '#0369a1',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase'
                    }}>
                      {ord.orderSource.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
                    <select
                      value={ord.status}
                      disabled={updatingOrderId === ord.id}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      style={{
                        backgroundColor:
                          ord.status === 'delivered' ? '#dcfce7' : ord.status === 'cancelled' ? '#fee2e2' : ord.status === 'pending' ? '#fef3c7' : '#dbeafe',
                        color:
                          ord.status === 'delivered' ? '#15803d' : ord.status === 'cancelled' ? '#dc2626' : ord.status === 'pending' ? '#b45309' : '#1d4ed8',
                        border: '1px solid transparent',
                        borderRadius: '9999px',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details & Contact Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.84rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={15} style={{ color: '#64748b' }} />
                      <strong style={{ color: '#0f172a' }}>{ord.customerName}</strong>
                      {ord.customerId ? (
                        <span style={{ fontSize: '0.68rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                          Registered
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                          Guest / Offline
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                      <MapPin size={15} style={{ color: '#16a34a' }} />
                      <span>{ord.deliveryLocation}</span>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    {ord.customerPhone && (
                      <>
                        <a
                          href={`tel:${ord.customerPhone}`}
                          style={{
                            backgroundColor: '#fff7ed',
                            color: '#ea580c',
                            border: '1px solid #fed7aa',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={13} />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.customerName}, regarding your Sai Deveena Traders order #${ord.orderNumber}:`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            textDecoration: 'none'
                          }}
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(ord.items || []).map((it) => (
                      <div
                        key={it.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.82rem',
                          color: '#334155'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{it.productNameEn}</span>
                          {it.packSize && <span style={{ color: '#64748b', fontSize: '0.74rem' }}>({it.packSize})</span>}
                          <span style={{ color: '#64748b', fontSize: '0.76rem' }}>x {it.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>
                          ₹{it.totalPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bill Totals */}
                  <div style={{
                    borderTop: '1px dashed #cbd5e1',
                    marginTop: '0.65rem',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.86rem'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      Payment: <strong style={{ textTransform: 'uppercase', color: '#0f172a' }}>{ord.paymentMethod.replace(/_/g, ' ')}</strong>
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#15803d' }}>
                      Grand Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {ord.notes && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic' }}>
                    Note: {ord.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Record Manual Offline Order Modal */}
      {isManualModalOpen && (
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
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.15rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Record Phone / WhatsApp / In-Store Order
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                  Direct administrator manual order entry into Supabase
                </div>
              </div>
              <button
                onClick={handleCloseManualModal}
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

            {/* Modal Form */}
            <form onSubmit={handleCreateManualOrder} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {modalError && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>
                    {modalError}
                  </div>
                )}

                {/* Order Source & Customer Type Switch */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                      Order Source
                    </label>
                    <select
                      value={orderSource}
                      onChange={(e) => setOrderSource(e.target.value as OrderSource)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem'
                      }}
                    >
                      <option value="phone">Phone Call</option>
                      <option value="whatsapp">WhatsApp Order</option>
                      <option value="in_store">In-Store / Counter Sale</option>
                      <option value="web">Web Order</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                      Customer Type
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setCustomerType('guest')}
                        style={{
                          flex: 1,
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: customerType === 'guest' ? '#15803d' : '#cbd5e1',
                          backgroundColor: customerType === 'guest' ? '#dcfce7' : '#ffffff',
                          color: customerType === 'guest' ? '#15803d' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Guest / Walk-In
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerType('registered')}
                        style={{
                          flex: 1,
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: customerType === 'registered' ? '#15803d' : '#cbd5e1',
                          backgroundColor: customerType === 'registered' ? '#dcfce7' : '#ffffff',
                          color: customerType === 'registered' ? '#15803d' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Registered
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                {customerType === 'registered' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                      Select Registered Customer
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        const matched = existingCustomers.find(c => c.id === e.target.value);
                        if (matched && matched.villageOrCity) {
                          setDeliveryLocation(matched.villageOrCity);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem'
                      }}
                    >
                      <option value="">-- Choose active customer --</option>
                      {existingCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.phone || c.email || 'No phone'}) - {c.villageOrCity || 'Bhainsa'}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Reddy"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                        Customer Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9848012345"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Location & Payment Method */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                      Delivery Village / Town *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bhainsa Town / Kubeer"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem'
                      }}
                    >
                      <option value="cash_on_delivery">Cash on Delivery</option>
                      <option value="upi">UPI / Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="in_store">In-Store Cash Counter</option>
                    </select>
                  </div>
                </div>

                {/* Product Items Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                    Select Products from Store Catalog
                  </label>
                  <select
                    onChange={(e) => {
                      handleAddItem(e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <option value="" disabled>-- Click to add product to order --</option>
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.en} ({p.packSize || 'Pack'}) - ₹{p.price || 0}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Products List */}
                {selectedItems.length > 0 && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Order Items ({selectedItems.length})
                    </div>
                    {selectedItems.map((it) => {
                      const prod = catalogProducts.find(p => p.id === it.productId);
                      const unitPrice = prod?.price || 0;
                      const lineTotal = unitPrice * it.quantity;

                      return (
                        <div
                          key={it.productId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            backgroundColor: '#ffffff',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                              {prod?.name.en || it.productId}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              ₹{unitPrice} each
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={it.quantity}
                              onChange={(e) => handleUpdateItemQty(it.productId, parseInt(e.target.value) || 1)}
                              style={{
                                width: '54px',
                                padding: '0.25rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                textAlign: 'center',
                                fontSize: '0.82rem',
                                fontWeight: 800
                              }}
                            />
                            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#15803d', width: '70px', textAlign: 'right' }}>
                              ₹{lineTotal}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.productId)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{
                      borderTop: '1px dashed #cbd5e1',
                      paddingTop: '0.45rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 900,
                      color: '#0f172a',
                      fontSize: '0.9rem'
                    }}>
                      <span>Order Subtotal:</span>
                      <span style={{ color: '#15803d' }}>
                        ₹{selectedItems.reduce((sum, it) => {
                          const p = catalogProducts.find(x => x.id === it.productId);
                          return sum + (p?.price || 0) * it.quantity;
                        }, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                    Order Notes (Optional)
                  </label>
                  <textarea
                    placeholder="e.g. Deliver before 5 PM to farm"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.65rem'
              }}>
                <button
                  type="button"
                  onClick={handleCloseManualModal}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.55rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingManualOrder}
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: submittingManualOrder ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  {submittingManualOrder ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={15} />}
                  <span>Save Order to Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
