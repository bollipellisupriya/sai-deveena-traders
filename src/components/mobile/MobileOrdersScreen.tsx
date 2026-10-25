import React from 'react';
import { ShoppingBag, MessageCircle, Phone, Clock, CheckCircle } from 'lucide-react';
import type { Language } from '../../types';

interface MobileOrdersScreenProps {
  currentLang: Language;
  onExplore: () => void;
}

export const MobileOrdersScreen: React.FC<MobileOrdersScreenProps> = ({ currentLang, onExplore }) => {
  const isTe = currentLang === 'te';

  return (
    <div style={{ padding: '1rem', paddingBottom: '6rem', backgroundColor: '#f8fafc' }}>
      {/* Header card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTe ? 'మీ ఆర్డర్లు & విచారణలు' : 'Your Orders & Enquiries'}
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {isTe ? 'సాయి దీవెన ట్రేడర్స్ భైంసా' : 'Sai Deveena Traders Bhainsa'}
            </span>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          {isTe
            ? 'మీరు వాట్సాప్ లేదా ఫోన్ ద్వారా పెట్టిన ఆర్డర్ల వివరాలు మరియు స్థితిని ఇక్కడ ట్రాక్ చేయవచ్చు.'
            : 'Track the status of your product orders and enquiries placed via WhatsApp or Phone.'}
        </p>
      </div>

      {/* Quick Order Status Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.15rem',
        border: '1px solid #e2e8f0',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#15803d',
            backgroundColor: '#dcfce7',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <CheckCircle size={12} />
            {isTe ? 'సక్రియం' : 'Active Shop Helpline'}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> 7:00 AM - 9:00 PM
          </span>
        </div>

        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          {isTe ? 'ఆర్డర్ స్థితిని విచారించండి' : 'Check Order or Stock Status'}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.45 }}>
          {isTe
            ? 'మా నిర్వాహకులతో నేరుగా మాట్లాడి విత్తనాలు, ఎరువుల నిల్వ మరియు డెలివరీ స్థితి తెలుసుకోండి.'
            : 'Directly connect with shop staff to confirm stock, booking, and local field delivery.'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <a
            href="https://wa.me/919010454541?text=Hello%20Sai%20Deveena%20Traders,%20I%20want%20to%20check%20my%20order%20status."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '0.6rem 0.5rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              textDecoration: 'none'
            }}
          >
            <MessageCircle size={15} />
            <span>WhatsApp (9010454541)</span>
          </a>

          <a
            href="tel:9010454541"
            style={{
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '9999px',
              padding: '0.6rem 0.5rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              textDecoration: 'none'
            }}
          >
            <Phone size={14} />
            <span>Call (9010454541)</span>
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={onExplore}
          style={{
            backgroundColor: '#14532d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.75rem 1.75rem',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {isTe ? 'మరిన్ని ఉత్పత్తులను బ్రౌజ్ చేయండి' : 'Browse Products Catalogue'}
        </button>
      </div>
    </div>
  );
};
