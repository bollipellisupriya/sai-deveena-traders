import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, ExternalLink, Sparkles, Headphones } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../translations';
import { shopConfig } from '../config/shopConfig';
import { getPhoneDialUrl, getGeneralWhatsappUrl, getSupportPhoneDialUrl, getSupportWhatsappUrl } from '../utils/whatsapp';

interface ContactSectionProps {
  currentLang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const { url: phoneUrl } = getPhoneDialUrl();
  const { url: whatsappUrl } = getGeneralWhatsappUrl(currentLang);
  const { url: supportPhoneUrl } = getSupportPhoneDialUrl();
  const { url: supportWhatsappUrl } = getSupportWhatsappUrl(currentLang);
  const isMapReady = Boolean(shopConfig.googleMapsUrl && shopConfig.googleMapsUrl.trim().length > 0);
  const isTe = currentLang === 'te';

  return (
    <section id="contact" className="section section-muted" style={{ paddingTop: '2rem', paddingBottom: '2.5rem' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#ea580c',
            fontWeight: 800,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.35rem'
          }}>
            <Sparkles size={16} />
            <span>{isTe ? 'సంప్రదింపు వివరాలు & స్థానం' : 'Direct Enquiries & Location'}</span>
          </div>
          <h2 className="section-title">{t.contact.heading}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {t.contact.subheading}
          </p>
        </div>

        {/* 4 Cards Grid: Orders (9010454541), Support (9014397044), Address, Hours */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
          gap: '1.25rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Card 1: Product Orders & WhatsApp (9010454541) */}
          <div className="card" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.15)'
            }}>
              <MessageCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-950)', marginBottom: '0.35rem' }}>
              {isTe ? 'ఉత్పత్తుల ఆర్డర్లు & విచారణ' : 'Product Orders & Enquiries'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {isTe
                ? 'విత్తనాలు, ఎరువులు మరియు ధరల వివరాల కోసం సంప్రదించండి.'
                : 'Direct enquiries for seed stock, fertilizer rates, and orders.'}
            </p>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
                9010454541
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.84rem' }}
                >
                  <MessageCircle size={16} />
                  <span>{isTe ? 'వాట్సాప్' : 'WhatsApp'}</span>
                </a>

                <a
                  href={phoneUrl}
                  className="btn btn-phone"
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.84rem' }}
                >
                  <Phone size={15} />
                  <span>{isTe ? 'కాల్' : 'Call'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Customer Support Helpline (9014397044) */}
          <div className="card" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.15)'
            }}>
              <Headphones size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-950)', marginBottom: '0.35rem' }}>
              {isTe ? 'కస్టమర్ సపోర్ట్ & సహాయం' : 'Customer Support Helpline'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {isTe
                ? 'ఏదైనా సహాయం లేదా పంట సంరక్షణ సలహాల కోసం సంప్రదించండి.'
                : 'Dedicated customer support, farmer guidance, and shop assistance.'}
            </p>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
                9014397044
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <a
                  href={supportWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.84rem' }}
                >
                  <MessageCircle size={16} />
                  <span>{isTe ? 'వాట్సాప్' : 'WhatsApp'}</span>
                </a>

                <a
                  href={supportPhoneUrl}
                  className="btn btn-phone"
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.84rem' }}
                >
                  <Phone size={15} />
                  <span>{isTe ? 'కాల్' : 'Call'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Address & Maps */}
          <div className="card" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffedd5',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.15)'
            }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-950)', marginBottom: '0.35rem' }}>
              {t.contact.addressCard.title}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              {t.contact.addressCard.desc}
            </p>
            <div style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--primary-950)',
              marginBottom: '1.25rem',
              lineHeight: 1.5
            }}>
              {shopConfig.address[currentLang]}
            </div>

            <div style={{ marginTop: 'auto' }}>
              {isMapReady && (
                <a
                  href={shopConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-orange"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '0.65rem 0.75rem' }}
                >
                  <ExternalLink size={15} />
                  <span>{t.contact.addressCard.action}</span>
                </a>
              )}
            </div>
          </div>

          {/* Card 4: Hours */}
          <div className="card" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.15)'
            }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-950)', marginBottom: '0.35rem' }}>
              {t.contact.hoursCard.title}
            </h3>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--primary-900)',
              marginBottom: '0.75rem',
              lineHeight: 1.55
            }}>
              {shopConfig.openingHours[currentLang]}
            </div>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginTop: 'auto'
            }}>
              {t.contact.hoursCard.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
