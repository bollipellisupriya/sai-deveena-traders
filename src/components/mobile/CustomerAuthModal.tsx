import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, User, MapPin, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, MessageCircle, ShieldCheck } from 'lucide-react';
import { customerAuthService, type CustomerUser } from '../../services/customerAuthService';
import type { Language, PendingCustomerAction } from '../../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: CustomerUser, pendingAction?: PendingCustomerAction) => void;
  currentLang: Language;
  pendingAction?: PendingCustomerAction | null;
  initialMode?: 'login' | 'register';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentLang,
  pendingAction
}) => {
  const isTe = currentLang === 'te';

  // Modal Step State: 'phone' -> 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Form State
  const [phone, setPhone] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [villageOrCity, setVillageOrCity] = useState<string>('Bhainsa');
  const [otpToken, setOtpToken] = useState<string>('');

  // Status & Feedback State
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 60-Second Resend Cooldown
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendCooldown]);

  // Reset modal state when closed or opened
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setOtpToken('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Request SMS OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMessage(
        isTe ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage(
        isTe ? 'దయచేసి మీ పేరును నమోదు చేయండి.' : 'Please enter your full name.'
      );
      return;
    }

    setLoading(true);
    const res = await customerAuthService.sendPhoneOtp(phone);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    setStep('otp');
    setResendCooldown(60);
    setSuccessMessage(
      isTe
        ? `${res.formattedPhone} కు 6 అంకెల OTP కోడ్ పంపబడింది.`
        : `6-digit OTP code sent to ${res.formattedPhone}.`
    );
  };

  // Step 2: Verify SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanToken = otpToken.replace(/\D/g, '');
    if (cleanToken.length !== 6) {
      setErrorMessage(
        isTe ? 'దయచేసి 6 అంకెల OTP కోడ్‌ను నమోదు చేయండి.' : 'Please enter the 6-digit OTP code.'
      );
      return;
    }

    setLoading(true);
    const res = await customerAuthService.verifyPhoneOtp(phone, cleanToken, {
      fullName,
      villageOrCity,
      preferredLanguage: currentLang
    });
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    if (res.user) {
      if (res.user.status && res.user.status !== 'active') {
        setErrorMessage(
          res.user.status === 'suspended'
            ? (isTe
                ? 'మీ ఖాతా తాత్కాలికంగా నిలిపివేయబడింది. దయచేసి 9010454541 సంప్రదించండి.'
                : 'Your account has been suspended by store administration. Please contact support at 9010454541.')
            : (isTe
                ? 'మీ ఖాతా యాక్టివ్‌గా లేదు. దయచేసి 9010454541 సంప్రదించండి.'
                : 'Your account is currently inactive. Please contact support at 9010454541.')
        );
        return;
      }

      setSuccessMessage(
        isTe
          ? 'ఫోన్ నంబర్ విజయవంతంగా ధృవీకరించబడింది! మీ చర్య కొనసాగుతోంది...'
          : 'Phone verified successfully! Resuming your action...'
      );

      // Brief delay for visual confirmation, then trigger callback to resume Call/WhatsApp action
      setTimeout(() => {
        onAuthSuccess(res.user!, pendingAction || undefined);
        onClose();
      }, 700);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await customerAuthService.sendPhoneOtp(phone);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    setResendCooldown(60);
    setSuccessMessage(
      isTe ? 'కొత్త OTP కోడ్ విజయవంతంగా పంపబడింది.' : 'New OTP code sent successfully.'
    );
  };

  const productName = pendingAction?.product
    ? (pendingAction.product.name[currentLang] || pendingAction.product.name.en)
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#ffffff',
          borderRadius: '22px',
          overflow: 'hidden',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'fadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 55%, #166534 100%)',
            padding: '1.25rem 1.25rem 1.15rem',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ade80'
              }}
            >
              {pendingAction?.type === 'whatsapp' ? (
                <MessageCircle size={22} />
              ) : pendingAction?.type === 'call' ? (
                <Phone size={20} />
              ) : (
                <ShieldCheck size={22} />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {pendingAction?.type === 'whatsapp'
                  ? (isTe ? 'వాట్సాప్ ఆర్డర్ ధృవీకరణ' : 'WhatsApp Order Verification')
                  : pendingAction?.type === 'call'
                  ? (isTe ? 'కాల్ ఆర్డర్ ధృవీకరణ' : 'Call Order Verification')
                  : (isTe ? 'కస్టమర్ లాగిన్ / రిజిస్ట్రేషన్' : 'Customer Sign In / Register')}
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#bbf7d0', fontWeight: 600 }}>
                {isTe ? 'సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ భైంసా' : 'Sai Deveena Traders & General Store • Bhainsa'}
              </div>
            </div>
          </div>

          {/* Pending Product Chip */}
          {productName && (
            <div
              style={{
                marginTop: '0.65rem',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '10px',
                padding: '0.45rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.76rem',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <span style={{ color: '#86efac', fontWeight: 800 }}>
                {pendingAction?.type === 'whatsapp' ? 'WhatsApp:' : 'Call:'}
              </span>
              <span style={{ color: '#ffffff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {productName}
              </span>
              {pendingAction?.product?.price && (
                <span style={{ marginLeft: 'auto', color: '#fef08a', fontWeight: 900 }}>
                  ₹{pendingAction.product.price}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {/* Subtitle / Instructions */}
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginTop: 0, marginBottom: '1rem' }}>
            {step === 'phone'
              ? (isTe
                  ? 'ఆర్డర్ లేదా విచారణ కోసం మీ మొబైల్ నంబరును SMS OTP ద్వారా సురక్షితంగా ధృవీకరించండి. పాస్‌వర్డ్ అవసరం లేదు.'
                  : 'Fast 1-step verification via SMS OTP to connect directly with Sai Deveena Traders & General Store. No passwords required.')
              : (isTe
                  ? 'మీ మొబైల్ నంబరుకు పంపిన 6 అంకెల OTP కోడ్‌ను నమోదు చేయండి.'
                  : 'Enter the 6-digit verification code sent to your phone number.')}
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '12px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                color: '#991b1b',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1rem',
                animation: 'shake 0.3s ease'
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0, color: '#dc2626' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '12px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                color: '#15803d',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}
            >
              <CheckCircle2 size={17} style={{ flexShrink: 0, color: '#16a34a' }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Phone & Name Form */}
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Mobile Number Input with +91 Country Code Badge */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
                  {isTe ? 'మొబైల్ నంబర్ *' : 'Mobile Number *'}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div
                    style={{
                      padding: '0.65rem 0.75rem',
                      backgroundColor: '#f1f5f9',
                      borderRight: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    placeholder="9010454541"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '0.65rem 0.75rem',
                      fontSize: '0.94rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '0.04em'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {isTe ? '10 అంకెల మొబైల్ నంబరును నమోదు చేయండి' : 'Enter 10-digit phone number for SMS OTP verification'}
                </div>
              </div>

              {/* Customer Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
                  {isTe ? 'మీ పూర్తి పేరు *' : 'Your Full Name *'}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '0 0.75rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <User size={16} style={{ color: '#94a3b8', marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    placeholder={isTe ? 'రైతు / కస్టమర్ పేరు' : 'Farmer / Customer Name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '0.65rem 0',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>

              {/* Village or Town */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
                  {isTe ? 'గ్రామం / పట్టణం' : 'Village / Town'}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '0 0.75rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <MapPin size={16} style={{ color: '#94a3b8', marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    placeholder="Bhainsa / Village Name"
                    value={villageOrCity}
                    onChange={(e) => setVillageOrCity(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '0.65rem 0',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#15803d',
                  backgroundImage: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.78rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(21, 128, 61, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{isTe ? 'కోడ్ పంపుతోంది...' : 'Sending Code...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isTe ? 'SMS OTP కోడ్ పంపండి' : 'Send SMS OTP Code'}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Entry Form */
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Display Phone with Edit Option */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.55rem 0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#1e293b' }}>
                  <Phone size={14} style={{ color: '#15803d' }} />
                  <span style={{ fontWeight: 800 }}>{customerAuthService.formatPhoneNumber(phone)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpToken('');
                    setErrorMessage(null);
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isTe ? 'మార్చండి' : 'Change Phone'}
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.45rem' }}>
                  {isTe ? '6 అంకెల OTP కోడ్‌ను నమోదు చేయండి' : 'Enter 6-Digit OTP Code'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  placeholder="••••••"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    border: '2px solid #15803d',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    textAlign: 'center',
                    letterSpacing: '0.45em',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              {/* Resend Cooldown Counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isTe ? 'కోడ్ రాలేదా?' : "Didn't receive the SMS?"}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 || loading ? '#94a3b8' : '#15803d',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: resendCooldown > 0 || loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resendCooldown > 0
                    ? `${isTe ? 'మళ్ళీ పంపండి' : 'Resend Code'} (${resendCooldown}s)`
                    : (isTe ? 'ఇప్పుడే మళ్ళీ పంపండి' : 'Resend Code Now')}
                </button>
              </div>

              {/* Verify & Resume Action Button */}
              <button
                type="submit"
                disabled={loading || otpToken.length !== 6}
                style={{
                  backgroundColor: otpToken.length === 6 ? '#15803d' : '#94a3b8',
                  backgroundImage: otpToken.length === 6 ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'none',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.82rem 1rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: loading || otpToken.length !== 6 ? 'not-allowed' : 'pointer',
                  boxShadow: otpToken.length === 6 ? '0 4px 14px rgba(21, 128, 61, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{isTe ? 'ధృవీకరిస్తోంది...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {pendingAction?.type === 'whatsapp'
                        ? (isTe ? 'ధృవీకరించి వాట్సాప్‌కు వెళ్లండి' : 'Verify & Open WhatsApp')
                        : pendingAction?.type === 'call'
                        ? (isTe ? 'ధృవీకరించి కాల్ చేయండి' : 'Verify & Dial Call')
                        : (isTe ? 'ధృవీకరించండి' : 'Verify & Continue')}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy & Trust Badge */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: '#64748b',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={14} style={{ color: '#15803d' }} />
            <span>
              {isTe
                ? 'మీ సమాచారం సురక్షితం. సాయి దీవెన ట్రేడర్స్ ప్రత్యక్ష సంప్రదింపులకు మాత్రమే ఉపయోగించబడుతుంది.'
                : 'Verified via Supabase Auth. Direct customer connection to Bhainsa store.'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CustomerAuthModal;
