import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { Language, PaymentMethod, GuestCheckoutData } from '../../types';
import { useCart } from '../../context/CartContext';
import { shopConfig } from '../../config/shopConfig';

interface MobileCartDrawerProps {
  currentLang: Language;
}

export const MobileCartDrawer: React.FC<MobileCartDrawerProps> = ({ currentLang }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliverySettings,
    deliveryFee,
    grandTotal,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    isCartOpen,
    closeCart,
    checkoutStep,
    setCheckoutStep,
    lastPlacedOrder,
    placeGuestOrder,
    isSubmittingOrder
  } = useCart();

  const isTe = currentLang === 'te';

  // Checkout Form State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [villageTown, setVillageTown] = useState<string>('');
  const [pincode, setPincode] = useState<string>('504103'); // Default Bhainsa PIN
  const [landmark, setLandmark] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [formError, setFormError] = useState<string | null>(null);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState<boolean>(false);

  if (!isCartOpen) return null;

  // Validate and submit guest order
  const handleProceedToPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setFormError(isTe ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError(isTe ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanAddress = deliveryAddress.trim();
    if (!cleanAddress) {
      setFormError(isTe ? 'దయచేసి మీ ఇంటి నంబర్ & వీధి చిరునామా నమోదు చేయండి.' : 'Please enter complete delivery street address.');
      return;
    }

    const cleanVillage = villageTown.trim();
    if (!cleanVillage) {
      setFormError(isTe ? 'దయచేసి మీ గ్రామం / పట్టణం పేరు నమోదు చేయండి.' : 'Please enter your village or town.');
      return;
    }

    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setFormError(isTe ? 'దయచేసి సరైన 6 అంకెల పిన్ కోడ్ నమోదు చేయండి.' : 'Please enter a valid 6-digit PIN code.');
      return;
    }

    const guestData: GuestCheckoutData = {
      fullName: cleanName,
      phone: cleanPhone,
      deliveryAddress: cleanAddress,
      villageTown: cleanVillage,
      pincode: cleanPin,
      landmark: landmark.trim() || undefined,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      paymentMethod
    };

    const res = await placeGuestOrder(guestData);
    if (!res.success) {
      setFormError(res.error || (isTe ? 'ఆర్డర్ సమర్పించడంలో లోపం సంభవించింది.' : 'Failed to place order.'));
    }
  };

  // WhatsApp formatted confirmation payload
  const handleOpenWhatsAppConfirmation = () => {
    if (!lastPlacedOrder) return;

    setHasOpenedWhatsApp(true);

    const targetWhatsApp = (deliverySettings.businessWhatsappNumber || shopConfig.whatsappNumber || '919010454541').replace(/\D/g, '');

    const itemsSummary = (lastPlacedOrder.items || []).map((it, i) => {
      const name = isTe && it.productNameTe ? `${it.productNameEn} (${it.productNameTe})` : it.productNameEn;
      return `${i + 1}. ${name} x ${it.quantity} = ₹${it.totalPrice}`;
    }).join('\n');

    const deliveryDisplay = lastPlacedOrder.deliveryCharge === 0 ? 'FREE' : `₹${lastPlacedOrder.deliveryCharge}`;

    const text = encodeURIComponent(
      `*SAI DEVEENA TRADERS & GENERAL STORE*\n` +
      `*ORDER CONFIRMATION REQUEST*\n\n` +
      `*Order Number:* #${lastPlacedOrder.orderNumber}\n` +
      `*Customer Name:* ${lastPlacedOrder.customerName}\n` +
      `*Mobile:* ${lastPlacedOrder.customerPhone || 'N/A'}\n` +
      `*Delivery Address:* ${lastPlacedOrder.deliveryLocation}\n` +
      (lastPlacedOrder.landmark ? `*Landmark:* ${lastPlacedOrder.landmark}\n` : '') +
      `*Payment Method:* ${lastPlacedOrder.paymentMethod.replace(/_/g, ' ').toUpperCase()}\n\n` +
      `*Items Ordered:*\n${itemsSummary}\n\n` +
      `----------------------------\n` +
      `*Subtotal:* ₹${lastPlacedOrder.subtotal}\n` +
      `*Delivery Charge:* ${deliveryDisplay}\n` +
      `*Grand Total:* ₹${lastPlacedOrder.totalAmount}\n` +
      `----------------------------\n\n` +
      `Please confirm my order and share dispatch details. Thank you!`
    );

    window.open(`https://wa.me/${targetWhatsApp}?text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        maxHeight: '92vh',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* =========================================================
            HEADER: Changes dynamically according to checkoutStep
           ========================================================= */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {checkoutStep === 'checkout' && (
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                aria-label="Back to Cart"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#334155'
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} style={{ color: '#15803d' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  {checkoutStep === 'cart' && (isTe ? `షాపింగ్ కార్ట్ (${items.length})` : `Shopping Cart (${items.length})`)}
                  {checkoutStep === 'checkout' && (isTe ? 'డెలివరీ చిరునామా & చెక్అవుట్' : 'Delivery & Guest Checkout')}
                  {checkoutStep === 'success' && (isTe ? 'ఆర్డర్ విజయవంతమైంది!' : 'Order Placed Successfully!')}
                </h3>
                {checkoutStep === 'checkout' && (
                  <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} />
                    <span>{isTe ? 'లాగిన్ లేదా OTP అవసరం లేదు' : 'No account or OTP required'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {checkoutStep === 'cart' && items.length > 0 && (
              <button
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isTe ? 'ఖాళీ చేయండి' : 'Clear All'}
              </button>
            )}
            <button
              onClick={closeCart}
              aria-label="Close"
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
                color: '#334155'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =========================================================
            CONTENT AREA: Cart | Checkout | Success
           ========================================================= */}
        <div style={{
          padding: '1rem 1.25rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* STEP 1: CART ITEMS VIEW */}
          {checkoutStep === 'cart' && (
            <>
              {items.length === 0 ? (
                <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: '#94a3b8'
                  }}>
                    <ShoppingBag size={34} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    {isTe ? 'మీ కార్ట్ ఖాళీగా ఉంది' : 'Your Cart is Empty'}
                  </h4>
                  <p style={{ fontSize: '0.84rem', marginBottom: '1.5rem', maxWidth: '320px', margin: '0 auto 1.5rem', lineHeight: 1.4 }}>
                    {isTe ? 'విత్తనాలు, ఎరువులు మరియు వ్యవసాయ ఉత్పత్తులను ఎంచుకుని కార్ట్‌కి జోడించండి.' : 'Add agricultural products, seeds, or fertilizers from the catalog to place an order.'}
                  </p>
                  <button
                    onClick={closeCart}
                    style={{
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0.65rem 1.75rem',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
                    }}
                  >
                    {isTe ? 'ఉత్పత్తులను బ్రౌజ్ చేయండి' : 'Browse Products'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Dynamic Free Delivery Notification Bar */}
                  <div style={{
                    backgroundColor: subtotal >= freeDeliveryThreshold ? '#dcfce7' : '#fff7ed',
                    border: '1px solid',
                    borderColor: subtotal >= freeDeliveryThreshold ? '#86efac' : '#fed7aa',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: subtotal >= freeDeliveryThreshold ? '#15803d' : '#c2410c'
                  }}>
                    <Truck size={18} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      {subtotal >= freeDeliveryThreshold ? (
                        <span>
                          {isTe ? `🎉 మీరు ఉచిత డెలివరీ అర్హత పొందారు! (₹${freeDeliveryThreshold}+ ఆర్డర్)` : `🎉 You unlocked FREE Farm Delivery! (₹${freeDeliveryThreshold}+ order)`}
                        </span>
                      ) : (
                        <span>
                          {isTe
                            ? `ఉచిత డెలివరీ కోసం మరో ₹${amountNeededForFreeDelivery} విలువైన ఉత్పత్తులను జోడించండి! (కనీసం ₹${freeDeliveryThreshold})`
                            : `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery! (Threshold: ₹${freeDeliveryThreshold})`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cart Items List */}
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.75rem',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img
                          src={item.product.image || '/images/products/paddy-seeds-pouch.svg'}
                          alt={item.product.name.en}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Title & Price */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.25
                        }}>
                          {item.product.name[currentLang] || item.product.name.en}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                          ₹{item.product.price} each
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#15803d', marginTop: '0.15rem' }}>
                          ₹{(item.product.price || 0) * item.quantity}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '9999px',
                        padding: '0.15rem'
                      }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: 'none',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ width: '28px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 900 }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: 'none',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Remove item"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          padding: '0.35rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 2: GUEST CHECKOUT FORM */}
          {checkoutStep === 'checkout' && (
            <form id="guest-checkout-form" onSubmit={handleProceedToPlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {formError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  {isTe ? 'పూర్తి పేరు *' : 'Customer Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isTe ? 'ఉదా. రమేష్ పటేల్' : 'e.g. Ramesh Patel'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  {isTe ? 'మొబైల్ నంబర్ (10 అంకెలు) *' : 'Mobile Number (10 digits) *'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '0.85rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#64748b'
                  }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9010454541"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Complete Delivery Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  {isTe ? 'ఇంటి నంబర్ / వీధి చిరునామా *' : 'Complete Delivery Address (House / Street) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isTe ? 'ఇంటి నం. 4-12, ప్రధాన వీధి, రైతు కాలనీ' : 'House # 4-12, Main Road, Farmer Colony'}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Village / Town and PIN Code 2-col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                    {isTe ? 'గ్రామం / పట్టణం *' : 'Village / Town *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isTe ? 'భైంసా' : 'Bhainsa'}
                    value={villageTown}
                    onChange={(e) => setVillageTown(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                    {isTe ? 'పిన్ కోడ్ (6 అంకెలు) *' : 'PIN Code (6 digits) *'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="504103"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Landmark (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>
                  {isTe ? 'గుర్తు / ల్యాండ్‌మార్క్ (ఐచ్ఛికం)' : 'Landmark (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isTe ? 'ఉదా. నీటి ట్యాంక్ సమీపంలో, మార్కెట్ యార్డ్ ఎదురుగా' : 'e.g. Near Water Tank / Opposite Market Yard'}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Delivery Instructions (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>
                  {isTe ? 'డెలివరీ సూచనలు (ఐచ్ఛికం)' : 'Delivery Instructions (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isTe ? 'ఉదా. రాకముందు కాల్ చేయండి' : 'e.g. Call before arrival / Deliver in morning'}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                  {isTe ? 'చెల్లింపు పద్ధతి' : 'Payment Method'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid',
                      borderColor: paymentMethod === 'cash_on_delivery' ? '#15803d' : '#e2e8f0',
                      backgroundColor: paymentMethod === 'cash_on_delivery' ? '#f0fdf4' : '#ffffff',
                      color: paymentMethod === 'cash_on_delivery' ? '#15803d' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    {paymentMethod === 'cash_on_delivery' && <Check size={14} />}
                    <span>{isTe ? 'క్యాష్ ఆన్ డెలివరీ' : 'Cash on Delivery'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid',
                      borderColor: paymentMethod === 'upi' ? '#15803d' : '#e2e8f0',
                      backgroundColor: paymentMethod === 'upi' ? '#f0fdf4' : '#ffffff',
                      color: paymentMethod === 'upi' ? '#15803d' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    {paymentMethod === 'upi' && <Check size={14} />}
                    <span>{isTe ? 'UPI / గూగుల్ పే' : 'UPI on Delivery'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS VIEW */}
          {checkoutStep === 'success' && lastPlacedOrder && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {isTe ? 'మీ ఆర్డర్ విజయవంతంగా నమోదైంది!' : 'Order Placed Securely!'}
                </h4>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  letterSpacing: '0.02em',
                  border: '1px solid #cbd5e1',
                  marginTop: '0.25rem'
                }}>
                  #{lastPlacedOrder.orderNumber}
                </div>
              </div>

              {/* Order Summary Box */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '0.85rem 1rem',
                textAlign: 'left',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>{isTe ? 'కస్టమర్ పేరు' : 'Customer'}:</span>
                  <strong style={{ color: '#0f172a' }}>{lastPlacedOrder.customerName} ({lastPlacedOrder.customerPhone})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>{isTe ? 'డెలివరీ చిరునామా' : 'Delivery'}:</span>
                  <span style={{ color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>{lastPlacedOrder.deliveryLocation}</span>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '0.35rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>{isTe ? 'ఉత్పత్తుల మొత్తం' : 'Items Subtotal'}:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{lastPlacedOrder.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>{isTe ? 'డెలివరీ ఛార్జీ' : 'Delivery'}:</span>
                  <span style={{ fontWeight: 800, color: lastPlacedOrder.deliveryCharge === 0 ? '#15803d' : '#0f172a' }}>
                    {lastPlacedOrder.deliveryCharge === 0 ? (isTe ? 'ఉచితం' : 'FREE') : `₹${lastPlacedOrder.deliveryCharge}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.96rem', fontWeight: 900, color: '#15803d', borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem' }}>
                  <span>{isTe ? 'మొత్తం చెల్లించవలసినది' : 'Grand Total'}:</span>
                  <span>₹{lastPlacedOrder.totalAmount}</span>
                </div>
              </div>

              {/* PRIMARY ACTION: WhatsApp Confirmation Action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleOpenWhatsAppConfirmation}
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.85rem 1.25rem',
                    fontSize: '0.94rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  <MessageCircle size={20} />
                  <span>{isTe ? 'వాట్సాప్‌లో ఆర్డర్ నిర్ధారించండి' : 'Confirm Order on WhatsApp'}</span>
                </button>

                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0', lineHeight: 1.35 }}>
                  {isTe
                    ? 'గమనిక: వాట్సాప్ తెరవడం వల్ల ఆర్డర్ వెంటనే ఖరారు కాదు. మా దుకాణ బృందం వివరాలను ధృవీకరించి డిస్పాచ్ చేస్తుంది.'
                    : 'Opening WhatsApp sends your order summary to our shop for confirmation. An order is confirmed once reviewed by our store.'}
                </p>

                {hasOpenedWhatsApp && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '0.45rem',
                    fontSize: '0.74rem',
                    color: '#15803d',
                    fontWeight: 700
                  }}>
                    ✓ WhatsApp opened with your order summary!
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeCart}
                  style={{
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    padding: '0.65rem',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                >
                  {isTe ? 'మరిన్ని ఉత్పత్తులను బ్రౌజ్ చేయండి' : 'Continue Shopping'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            DRAWER FOOTER & BILL BREAKDOWN (Shown in Cart & Checkout)
           ========================================================= */}
        {checkoutStep !== 'success' && items.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem calc(1rem + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff'
          }}>
            {/* Bill Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.84rem', color: '#64748b' }}>
              <span>{isTe ? 'ఉత్పత్తుల మొత్తం' : 'Items Total'}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.84rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{isTe ? 'డెలివరీ ఛార్జీ' : 'Delivery Fee'}</span>
                {subtotal < freeDeliveryThreshold && subtotal > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Free over ₹{freeDeliveryThreshold})
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 800, color: deliveryFee === 0 ? '#15803d' : '#0f172a' }}>
                {deliveryFee === 0 ? (isTe ? 'ఉచితం' : 'FREE') : `₹${deliveryFee}`}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              fontSize: '1.08rem',
              fontWeight: 900,
              color: '#0f172a',
              borderTop: '1px dashed #e2e8f0',
              paddingTop: '0.5rem'
            }}>
              <span>{isTe ? 'మొత్తం చెల్లించవలసినది' : 'Grand Total'}</span>
              <span style={{ color: '#15803d' }}>₹{grandTotal}</span>
            </div>

            {/* ACTION BUTTON: Switch to Checkout OR Submit Order */}
            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('checkout')}
                style={{
                  width: '100%',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.85rem',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(21, 128, 61, 0.35)',
                  marginBottom: '0.5rem'
                }}
              >
                <span>{isTe ? `చెక్అవుట్‌కు వెళ్లండి (₹${grandTotal})` : `Proceed to Checkout (₹${grandTotal})`}</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                form="guest-checkout-form"
                disabled={isSubmittingOrder}
                style={{
                  width: '100%',
                  backgroundColor: isSubmittingOrder ? '#94a3b8' : '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.85rem',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: isSubmittingOrder ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmittingOrder ? 'none' : '0 4px 14px rgba(21, 128, 61, 0.35)',
                  marginBottom: '0.5rem'
                }}
              >
                {isSubmittingOrder ? (
                  <span>{isTe ? 'ఆర్డర్ సమర్పిస్తోంది...' : 'Placing Order Securely...'}</span>
                ) : (
                  <span>{isTe ? `ఆర్డర్ చేయండి (₹${grandTotal})` : `Place Order (₹${grandTotal})`}</span>
                )}
              </button>
            )}

            {/* Secondary Direct Call Button */}
            <a
              href={`tel:${shopConfig.phoneNumber.replace(/[^\d+]/g, '')}`}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '9999px',
                padding: '0.55rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                textDecoration: 'none',
                boxSizing: 'border-box'
              }}
            >
              <Phone size={14} style={{ color: '#ea580c' }} />
              <span>{isTe ? 'సహాయం కోసం కాల్ చేయండి (9010454541)' : 'Need Assistance? Call 9010454541'}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
export default MobileCartDrawer;
