import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Headphones,
  ShieldCheck,
  Truck,
  Sprout,
  Star,
  CheckCircle2,
  MessageCircle,
  Navigation,
  CheckCircle,
  BadgeCheck
} from 'lucide-react';
import type { Language, StoredCustomerInfo } from '../../types';
import { shopConfig } from '../../config/shopConfig';
import { enquiryService } from '../../services/enquiryService';

interface MobileProfileScreenProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const MobileProfileScreen: React.FC<MobileProfileScreenProps> = ({
  currentLang,
  onLanguageChange
}) => {
  const isTe = currentLang === 'te';

  // Stored customer enquiry information (cached locally in browser)
  const [storedCustomer, setStoredCustomer] = useState<StoredCustomerInfo | null>(() => {
    return enquiryService.getStoredCustomerInfo();
  });

  const handleClearSavedInfo = () => {
    if (window.confirm(isTe ? 'సేవ్ చేసిన మీ వివరాలను తొలగించాలా?' : 'Clear your saved enquiry details?')) {
      localStorage.removeItem('sdt_customer_enquiry_info');
      setStoredCustomer(null);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-screen-container">

        {/* ============================================================ */}
        {/* 1. Prestigious Merchant Identity Showcase Header             */}
        {/* ============================================================ */}
        <div className="profile-hero-card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}>
            {/* Left: Emblem + Brand Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 280px', minWidth: 0 }}>
              {/* Brand Logo Emblem */}
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 0 2.5px #ea580c, 0 4px 14px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                flexShrink: 0
              }}>
                <img
                  src="/logo-icon.png?v=7"
                  alt="Sai Deveena Traders Emblem"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Brand Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: 'rgba(254, 240, 138, 0.18)',
                  color: '#fef08a',
                  borderRadius: '9999px',
                  padding: '1px 7px',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  marginBottom: '0.15rem',
                  letterSpacing: '0.02em'
                }}>
                  <BadgeCheck size={11} style={{ color: '#facc15' }} />
                  <span>{isTe ? 'ప్రభుత్వ ధృవీకృత డీలర్' : 'AUTHORIZED AGRI STORE'}</span>
                </div>

                <h1 style={{
                  fontSize: '1.18rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: '0 0 0.1rem 0',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {shopConfig.shopName[currentLang]}
                </h1>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.72rem',
                  color: '#bbf7d0',
                  fontWeight: 700,
                  flexWrap: 'wrap'
                }}>
                  <span>{isTe ? 'భైంసా, నిర్మల్' : 'Bhainsa, Nirmal'}</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#86efac' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#4ade80',
                      boxShadow: '0 0 6px #4ade80',
                      display: 'inline-block'
                    }} />
                    <span>{isTe ? '7 AM – 8 PM' : 'Open (7 AM – 8 PM)'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Compact Language Switcher */}
            <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(8px)',
                borderRadius: '9999px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: currentLang === 'en' ? '#ffffff' : 'transparent',
                    color: currentLang === 'en' ? '#15803d' : '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: currentLang === 'en' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('te')}
                  style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: currentLang === 'te' ? '#ffffff' : 'transparent',
                    color: currentLang === 'te' ? '#15803d' : '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: currentLang === 'te' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  తెలుగు
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. Farmer / Customer Enquiry Card (Only when saved)          */}
        {/* ============================================================ */}
        {storedCustomer && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.15rem 1.25rem',
            border: '1.5px solid #86efac',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
            marginBottom: '1rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)'
                }}>
                  {storedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {storedCustomer.name}
                    </h3>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <CheckCircle2 size={10} />
                      <span>{isTe ? 'రైతు ప్రొఫైల్' : 'Farmer Profile'}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                    📞 {storedCustomer.phone}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearSavedInfo}
                title={isTe ? 'సేవ్ చేసిన వివరాలను తొలగించండి' : 'Clear saved details'}
                style={{
                  backgroundColor: '#fee2e2',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  color: '#b91c1c',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isTe ? 'తొలగించు' : 'Clear'}
              </button>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              fontSize: '0.78rem',
              border: '1px solid #f1f5f9'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                  {isTe ? 'గ్రామం / పట్టణం' : 'Village / City'}
                </div>
                <div style={{ color: '#0f172a', fontWeight: 800 }}>
                  {storedCustomer.villageCity || (isTe ? 'భైంసా' : 'Bhainsa')}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                  {isTe ? 'ప్రాధాన్య సంప్రదింపు' : 'Contact Via'}
                </div>
                <div style={{ color: '#15803d', fontWeight: 800, textTransform: 'capitalize' }}>
                  {storedCustomer.preferredContact || 'WhatsApp'}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '0.72rem',
              color: '#64748b',
              marginTop: '0.6rem',
              textAlign: 'center'
            }}>
              {isTe
                ? 'ఆర్డర్ చేసేటప్పుడు మీ వివరాలు స్వయంచాలకంగా పూరించబడతాయి.'
                : 'Your info will autofill when placing WhatsApp or phone enquiries.'}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. Four Key Merchant Pillars Grid                            */}
        {/* ============================================================ */}
        <div className="profile-pillars-grid">
          {/* Pillar 1 */}
          <div className="profile-pillar-card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sprout size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                {isTe ? 'ధృవీకరించిన విత్తనాలు' : 'Certified Seeds'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {isTe ? 'అధిక దిగుబడి గ్యారెంటీ' : 'Govt verified stocks'}
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="profile-pillar-card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#ffedd5',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                {isTe ? 'పొలాల వద్దకే డెలివరీ' : 'Farm Delivery'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {isTe ? 'భైంసా పరిసర మండలాలు' : 'Bhainsa & nearby mandals'}
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="profile-pillar-card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                {isTe ? 'ఉచిత పంట సలహాలు' : 'Crop Advisory'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {isTe ? 'నిపుణుల రైతు మార్గదర్శనం' : 'Free agronomist support'}
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="profile-pillar-card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Star size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                {isTe ? 'సరసమైన ధరలు' : 'Best Rates'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {isTe ? 'హోల్‌సేల్ & రిటైల్ రేట్లు' : 'Wholesale & retail rates'}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Responsive Desktop Two-Column Hub                            */}
        {/* (Direct Contact Desk on Left | Store Location on Right)       */}
        {/* ============================================================ */}
        <div className="profile-desktop-grid">
          {/* Card A: Direct Contact & Order Desk */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.95rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} style={{ color: '#15803d' }} />
                <span>{isTe ? 'ప్రత్యక్ష సంప్రదింపు వేదిక' : 'Direct Contact & Order Desk'}</span>
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>
                {isTe ? 'తక్షణ ప్రతిస్పందన' : 'Instant Response'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, justifyContent: 'space-between' }}>
              {/* Channel 1: Product Orders & Sales (9010454541) */}
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '16px',
                border: '1.5px solid #86efac',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(21, 128, 61, 0.25)',
                    flexShrink: 0
                  }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {isTe ? 'ఉత్పత్తుల విక్రయాలు & ఆర్డర్లు' : 'Product Orders & Sales'}
                    </div>
                    <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.02em' }}>
                      9010454541
                    </div>
                  </div>
                </div>

                {/* Both Call and Chat side-by-side with full visibility */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <a
                    href="tel:9010454541"
                    style={{
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Phone size={15} />
                    <span>{isTe ? 'కాల్ చేయండి' : 'Call Store'}</span>
                  </a>

                  <a
                    href="https://wa.me/919010454541"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#25d366',
                      color: '#ffffff',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <MessageCircle size={15} />
                    <span>{isTe ? 'వాట్సాప్ చాట్' : 'WhatsApp Chat'}</span>
                  </a>
                </div>
              </div>

              {/* Channel 2: Customer Support Helpline (9014397044) */}
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '16px',
                border: '1.5px solid #bae6fd',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
                    flexShrink: 0
                  }}>
                    <Headphones size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {isTe ? 'రైతు సహాయ కేంద్రం' : 'Farmer Support Helpline'}
                    </div>
                    <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.02em' }}>
                      9014397044
                    </div>
                  </div>
                </div>

                {/* Both Call and Chat side-by-side with full visibility */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <a
                    href="tel:9014397044"
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Phone size={15} />
                    <span>{isTe ? 'హెల్ప్‌లైన్ కాల్' : 'Call Helpline'}</span>
                  </a>

                  <a
                    href="https://wa.me/919014397044"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#25d366',
                      color: '#ffffff',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <MessageCircle size={15} />
                    <span>{isTe ? 'సహాయం చాట్' : 'Helpline Chat'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Store Location & Timings Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.95rem' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: '#ea580c' }} />
                  <span>{isTe ? 'దుకాణం చిరునామా & వేళలు' : 'Store Location & Timings'}</span>
                </h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                  <span>{isTe ? 'ఇప్పుడు తెరిచి ఉంది' : 'Store Open Now'}</span>
                </span>
              </div>

              {/* Physical Location */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#fffaf5',
                padding: '0.9rem',
                borderRadius: '14px',
                border: '1px solid #ffedd5'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#ffedd5',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Navigation size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {isTe ? 'దుకాణం చిరునామా' : 'Store Address'}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, margin: '0.15rem 0 0.5rem' }}>
                    {shopConfig.address[currentLang]}
                  </div>
                  {shopConfig.googleMapsUrl && (
                    <a
                      href={shopConfig.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        padding: '0.4rem 0.95rem',
                        borderRadius: '9999px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <MapPin size={12} />
                      <span>{isTe ? 'గూగుల్ మ్యాప్స్‌లో తెరవండి' : 'Open in Google Maps'}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              {/* Timings */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#f8fafc',
                padding: '0.85rem 0.95rem',
                borderRadius: '14px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                    {isTe ? 'షాప్ పనిచేయు వేళలు' : 'Working Days & Hours'}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                    {shopConfig.openingHours[currentLang]}
                  </div>
                </div>
              </div>
            </div>

            {/* Farmer Logistics Note */}
            <div style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px dashed #86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem'
            }}>
              <Truck size={16} style={{ color: '#15803d', flexShrink: 0 }} />
              <span style={{ fontSize: '0.73rem', color: '#166534', fontWeight: 700, lineHeight: 1.35 }}>
                {isTe
                  ? 'రైతుల ట్రాక్టర్లు, ఆటోలు & వాహనాలకు సులభమైన లోడింగ్ & పార్కింగ్ సౌకర్యం కలదు.'
                  : 'Easy loading & spacious parking available for farmer tractors, autos & vehicles.'}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. Legal & Merchant Trust Seal Footer                        */}
        {/* ============================================================ */}
        <div style={{
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: '#15803d',
            fontSize: '0.74rem',
            fontWeight: 800,
            marginBottom: '0.25rem'
          }}>
            <CheckCircle size={14} />
            <span>{isTe ? 'ప్రభుత్వ ధృవీకృత వ్యవసాయ డీలర్' : 'Government Authorized Agricultural Distributor'}</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
            {isTe
              ? 'నిర్మల్ జిల్లా పరిధిలో 5,000+ రైతు సోదరుల నమ్మకమైన భాగస్వామి • విత్తనాలు & ఎరువుల లైసెన్స్ పొందిన దుకాణం'
              : 'Authorized Seeds & Fertilizers Trade License • Trusted by 5,000+ Farmers across Bhainsa & Nirmal District'}
          </p>
        </div>

      </div>
    </div>
  );
};
