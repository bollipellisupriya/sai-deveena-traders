import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  User,
  MapPin,
  Mail
} from 'lucide-react';
import type { Language, Product, PendingCustomerAction, CustomerEnquiry, PreferredContactMethod } from '../../types';
import { enquiryService, isValidIndianMobile, isValidEmail, cleanIndianPhoneNumber } from '../../services/enquiryService';

interface CustomerEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAction: PendingCustomerAction | null;
  currentLang: Language;
  onSuccess: (enquiry: CustomerEnquiry, action: 'call' | 'whatsapp', product?: Product, customText?: string) => void;
}

export const CustomerEnquiryModal: React.FC<CustomerEnquiryModalProps> = ({
  isOpen,
  onClose,
  pendingAction,
  currentLang,
  onSuccess
}) => {
  const isTe = currentLang === 'te';

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [villageCity, setVillageCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [preferredContact, setPreferredContact] = useState<PreferredContactMethod>('whatsapp');

  // UI & Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<CustomerEnquiry | null>(null);

  // Initialize or pre-fill from cached customer details
  useEffect(() => {
    if (!isOpen) {
      setSubmittedEnquiry(null);
      setSubmissionError(null);
      setErrors({});
      return;
    }

    // Preload previous customer information if available in this browser
    const stored = enquiryService.getStoredCustomerInfo();
    if (stored) {
      setFullName(stored.name || '');
      setPhone(stored.phone || '');
      setEmail(stored.email || '');
      setVillageCity(stored.villageCity || '');
      setAddress(stored.address || '');
    }

    // Default contact method to match the customer's intended action
    if (pendingAction?.type === 'call') {
      setPreferredContact('call');
    } else {
      setPreferredContact('whatsapp');
    }
  }, [isOpen, pendingAction]);

  if (!isOpen) return null;

  const product = pendingAction?.product;
  const productName = product ? (product.name[currentLang] || product.name.en) : null;

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = isTe ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.' : 'Please enter your full name (at least 2 characters).';
    }

    const cleanPhone = cleanIndianPhoneNumber(phone);
    if (!isValidIndianMobile(cleanPhone)) {
      newErrors.phone = isTe
        ? 'దయచేసి 10 అంకెల సరైన మొబైల్ నంబర్ నమోదు చేయండి (6, 7, 8, 9 తో ప్రారంభం కావాలి).'
        : 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (email && email.trim() && !isValidEmail(email)) {
      newErrors.email = isTe
        ? 'సరైన ఈమెయిల్ చిరునామా నమోదు చేయండి లేదా ఖాళీగా ఉంచండి.'
        : 'Please enter a valid email address, or leave it blank.';
    }

    if (!villageCity.trim() || villageCity.trim().length < 2) {
      newErrors.villageCity = isTe ? 'దయచేసి మీ గ్రామం లేదా నగరం పేరు నమోదు చేయండి.' : 'Please enter your village or city.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const result = await enquiryService.submitEnquiry({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      villageCity: villageCity.trim(),
      address: address.trim() || null,
      preferredContact,
      productId: product?.id || null,
      productName: productName || product?.name.en || 'General Enquiry'
    });

    setIsSubmitting(false);

    if (!result.success || !result.enquiry) {
      setSubmissionError(
        result.error ||
        (isTe
          ? 'విచారణను సమర్పించడంలో సమస్య ఎదురైంది. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా నేరుగా 9010454541 కు కాల్ చేయండి.'
          : 'Failed to record your enquiry. Please retry or contact the store directly at 9010454541.')
      );
      return;
    }

    setSubmittedEnquiry(result.enquiry);

    // Call success handler after saving
    onSuccess(
      result.enquiry,
      preferredContact,
      product,
      pendingAction?.customText
    );
  };

  return (
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
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(5, 46, 22, 0.35), 0 0 0 1.5px rgba(134, 239, 172, 0.4)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Lush Emerald Green Header Bar */}
        <div style={{
          padding: '1.2rem 1.35rem',
          borderBottom: '1px solid rgba(134, 239, 172, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #052e16 0%, #15803d 60%, #16a34a 100%)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(5, 46, 22, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              {pendingAction?.type === 'call' ? <Phone size={20} /> : <MessageCircle size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                {isTe ? 'ఉత్పత్తి విచారణ' : 'Customer Enquiry'}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#bbf7d0', fontWeight: 700, marginTop: '2px' }}>
                🌾 Sai Deveena Traders &amp; General Store • Bhainsa
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Enquiry Modal"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background-color 0.2s ease'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem' }}>
          {/* Product Snapshot Card if applicable */}
          {product && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '16px',
              padding: '0.75rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.15rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #dcfce7',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img
                  src={product.image || '/images/products/paddy-seeds-pouch.svg'}
                  alt={productName || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {productName}
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                  ₹{product.price}
                </div>
              </div>
            </div>
          )}

          {/* Success State View */}
          {submittedEnquiry ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.2)'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
                {isTe ? 'విచారణ విజయవంతంగా నమోదైంది!' : 'Enquiry Recorded Successfully!'}
              </h3>

              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {isTe
                  ? 'మీ వివరాలు భద్రపరచబడ్డాయి. మా దుకాణ సిబ్బంది త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు.'
                  : 'Your details have been securely saved with our store desk in Bhainsa. You can now chat or call directly.'}
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                {preferredContact === 'whatsapp' ? (
                  <button
                    onClick={() => {
                      onSuccess(submittedEnquiry, 'whatsapp', product, pendingAction?.customText);
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.28)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>{isTe ? 'వాట్సాప్‌లో కొనసాగండి' : 'Open WhatsApp Chat'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSuccess(submittedEnquiry, 'call', product, pendingAction?.customText);
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.28)'
                    }}
                  >
                    <Phone size={18} />
                    <span>{isTe ? 'దుకాణానికి కాల్ చేయండి (9010454541)' : 'Call Store Now (9010454541)'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    padding: '0.65rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {isTe ? 'ముగించు' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            // Enquiry Form
            <form onSubmit={handleSubmit}>
              {/* Failure Error Message */}
              {submissionError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  color: '#991b1b',
                  fontSize: '0.8rem'
                }}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{submissionError}</div>
                </div>
              )}

              {/* Full Name Field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: '0.4rem'
                }}>
                  <span>{isTe ? 'పూర్తి పేరు' : 'Full Name'} <span style={{ color: '#16a34a' }}>*</span></span>
                  <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 700, backgroundColor: '#dcfce7', padding: '0.12rem 0.5rem', borderRadius: '9999px', border: '1px solid #86efac' }}>
                    {isTe ? 'రైతు పేరు' : 'Farmer / Customer'}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isTe ? "ఉదా: రమేష్ కుమార్" : "e.g. Ramesh Kumar"}
                    disabled={isSubmitting}
                    className="green-field-input"
                    style={{
                      width: '100%',
                      padding: '0.72rem 0.95rem 0.72rem 2.5rem',
                      borderRadius: '14px',
                      border: errors.fullName ? '2px solid #ef4444' : '1.5px solid #86efac',
                      backgroundColor: errors.fullName ? '#fef2f2' : '#f0fdf4',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }} />
                </div>
                {errors.fullName && (
                  <div style={{ color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} />
                    <span>{errors.fullName}</span>
                  </div>
                )}
              </div>

              {/* Mobile Number Field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: '0.4rem'
                }}>
                  <span>{isTe ? 'మొబైల్ నంబర్' : 'Mobile Number'} <span style={{ color: '#16a34a' }}>*</span></span>
                  <span style={{ fontSize: '0.68rem', color: '#166534', backgroundColor: '#dcfce7', padding: '0.12rem 0.5rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #86efac' }}>
                    {isTe ? 'OTP అవసరం లేదు' : 'No OTP needed'}
                  </span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    left: '0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    color: '#166534',
                    backgroundColor: '#dcfce7',
                    padding: '0.22rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #86efac',
                    pointerEvents: 'none'
                  }}>
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9010454541"
                    disabled={isSubmitting}
                    className="green-field-input"
                    style={{
                      width: '100%',
                      padding: '0.72rem 0.95rem 0.72rem 3.5rem',
                      borderRadius: '14px',
                      border: errors.phone ? '2px solid #ef4444' : '1.5px solid #86efac',
                      backgroundColor: errors.phone ? '#fef2f2' : '#f0fdf4',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '0.04em',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {errors.phone && (
                  <div style={{ color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              {/* Village / City Field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: '0.4rem'
                }}>
                  <span>{isTe ? 'గ్రామం / పట్టణం' : 'Village / City'} <span style={{ color: '#16a34a' }}>*</span></span>
                  <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700, backgroundColor: '#dcfce7', padding: '0.12rem 0.5rem', borderRadius: '9999px', border: '1px solid #86efac' }}>
                    {isTe ? 'స్థలం' : 'Location'}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={villageCity}
                    onChange={(e) => setVillageCity(e.target.value)}
                    placeholder={isTe ? "ఉదా: భైంసా, నిర్మల్" : "e.g. Bhainsa, Nirmal"}
                    disabled={isSubmitting}
                    className="green-field-input"
                    style={{
                      width: '100%',
                      padding: '0.72rem 0.95rem 0.72rem 2.5rem',
                      borderRadius: '14px',
                      border: errors.villageCity ? '2px solid #ef4444' : '1.5px solid #86efac',
                      backgroundColor: errors.villageCity ? '#fef2f2' : '#f0fdf4',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <MapPin size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }} />
                </div>
                {errors.villageCity && (
                  <div style={{ color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} />
                    <span>{errors.villageCity}</span>
                  </div>
                )}
              </div>

              {/* Email Address (Optional) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: '0.4rem'
                }}>
                  <span>{isTe ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.12rem 0.5rem', borderRadius: '9999px' }}>
                    {isTe ? 'ఐచ్ఛికం' : 'Optional'}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    disabled={isSubmitting}
                    className="green-field-input"
                    style={{
                      width: '100%',
                      padding: '0.72rem 0.95rem 0.72rem 2.5rem',
                      borderRadius: '14px',
                      border: errors.email ? '2px solid #ef4444' : '1.5px solid #86efac',
                      backgroundColor: errors.email ? '#fef2f2' : '#f0fdf4',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }} />
                </div>
                {errors.email && (
                  <div style={{ color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Full Address (Optional) */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: '0.4rem'
                }}>
                  <span>{isTe ? 'డెలివరీ చిరునామా / ల్యాండ్‌మార్క్' : 'Delivery Address / Landmark'}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.12rem 0.5rem', borderRadius: '9999px' }}>
                    {isTe ? 'ఐచ్ఛికం' : 'Optional'}
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isTe ? "ఉదా: మార్కెట్ యార్డ్ దగ్గర, భైంసా" : "e.g. Near Market Yard, Bhainsa"}
                  disabled={isSubmitting}
                  className="green-field-textarea"
                  style={{
                    width: '100%',
                    padding: '0.72rem 0.95rem',
                    borderRadius: '14px',
                    border: '1.5px solid #86efac',
                    backgroundColor: '#f0fdf4',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Colorful Preferred Contact Method */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: '0.5rem'
                }}>
                  {isTe ? 'ఎలా సంప్రదించాలి?' : 'Preferred Contact Method'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* WhatsApp Option Button */}
                  <button
                    type="button"
                    onClick={() => setPreferredContact('whatsapp')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      padding: '0.72rem 0.85rem',
                      borderRadius: '14px',
                      border: preferredContact === 'whatsapp' ? '2px solid #16a34a' : '1.5px solid #86efac',
                      background: preferredContact === 'whatsapp'
                        ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                        : '#f0fdf4',
                      color: preferredContact === 'whatsapp' ? '#ffffff' : '#15803d',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: preferredContact === 'whatsapp' ? '0 4px 14px rgba(22, 163, 74, 0.35)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                  </button>

                  {/* Phone Call Option Button */}
                  <button
                    type="button"
                    onClick={() => setPreferredContact('call')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      padding: '0.72rem 0.85rem',
                      borderRadius: '14px',
                      border: preferredContact === 'call' ? '2px solid #0284c7' : '1.5px solid #bae6fd',
                      background: preferredContact === 'call'
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : '#f0f9ff',
                      color: preferredContact === 'call' ? '#ffffff' : '#0369a1',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: preferredContact === 'call' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Phone size={18} />
                    <span>Phone Call</span>
                  </button>
                </div>
              </div>

              {/* Privacy Notice Card */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem',
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '14px',
                padding: '0.75rem 0.85rem',
                marginBottom: '1.35rem',
                color: '#166534',
                fontSize: '0.74rem',
                lineHeight: 1.45
              }}>
                <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
                <span>
                  {isTe
                    ? 'మీ వివరాలు గోప్యంగా ఉంచబడతాయి. కేవలం సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ మీ విచారణకు ప్రతిస్పందించడానికి మాత్రమే వీటిని ఉపయోగిస్తుంది.'
                    : 'Your details are secure. Used only by Sai Deveena Traders & General Store to assist your product enquiry.'}
                </span>
              </div>

              {/* Lush Vibrant Emerald Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(134, 239, 172, 0.4)',
                  borderRadius: '9999px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.94rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(22, 163, 74, 0.4)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={19} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{isTe ? 'నమోదవుతోంది...' : 'Submitting Enquiry...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>
                      {preferredContact === 'whatsapp'
                        ? (isTe ? 'విచారణ పంపి WhatsApp తెరవండి' : 'Submit & Open WhatsApp')
                        : (isTe ? 'విచారణ సమర్పించి కాల్ చేయండి' : 'Submit & Call Store')}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
