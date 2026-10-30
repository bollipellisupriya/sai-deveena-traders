import React from 'react';
import { Phone, MapPin, Sparkles } from 'lucide-react';
import type { Language, Category } from '../types';
import { translations } from '../translations';
import { shopConfig } from '../config/shopConfig';
import { getPhoneDialUrl } from '../utils/whatsapp';

interface FooterProps {
  currentLang: Language;
  categories: Category[];
  onNavigate: (sectionId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  categories,
  onNavigate,
  onSelectCategory
}) => {
  const t = translations[currentLang];
  const currentYear = new Date().getFullYear();
  const { url: phoneUrl } = getPhoneDialUrl();

  return (
    <footer style={{
      backgroundColor: '#052e16',
      color: '#cbd5e1',
      paddingTop: '4.5rem',
      paddingBottom: '3rem',
      borderTop: '3px solid #16a34a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Main Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: 'clamp(2rem, 4vw, 3rem)',
          marginBottom: '3rem'
        }}>
          {/* Column 1: Brand & Logo Emblem */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                border: '1.5px solid rgba(234, 88, 12, 0.4)',
                maxWidth: '100%'
              }}>
                <img
                  src="/logo.png?v=5"
                  alt="Sai Deveena Traders & General Store"
                  style={{
                    height: '68px',
                    width: 'auto',
                    maxWidth: 'min(280px, 100%)',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#94a3b8', marginBottom: '1.5rem' }}>
              {t.footer.aboutText}
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
              <MapPin size={17} style={{ color: '#fb923c', flexShrink: 0, marginTop: '3px' }} />
              <span>{shopConfig.address[currentLang]}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              {t.footer.quickLinks}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <button onClick={() => onNavigate('hero')} className="footer-link">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="footer-link">
                  {t.nav.categories}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogue')} className="footer-link">
                  {t.nav.products}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="footer-link">
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="footer-link">
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              {t.footer.categoriesTitle}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onNavigate('catalogue');
                    }}
                    className="footer-link"
                  >
                    {cat.name[currentLang] || cat.name.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Notice */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              {t.footer.contactInfo}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#fdba74', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {currentLang === 'te' ? 'ఆర్డర్లు & వాట్సాప్:' : 'Orders & WhatsApp:'}
                </div>
                <a href={phoneUrl} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#86efac', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Phone size={16} />
                  <span>{shopConfig.phoneNumber}</span>
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {currentLang === 'te' ? 'కస్టమర్ సపోర్ట్:' : 'Customer Support:'}
                </div>
                <a href={`tel:${shopConfig.supportPhoneNumber}`} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#93c5fd', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Phone size={16} />
                  <span>{shopConfig.supportPhoneNumber}</span>
                </a>
              </div>

              <div style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                lineHeight: 1.55,
                color: '#cbd5e1'
              }}>
                <strong style={{ color: '#fde68a' }}>{t.footer.disclaimerTitle}: </strong>
                {t.footer.disclaimerText}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.84rem',
          color: '#94a3b8'
        }}>
          <div>
            © {currentYear} <span style={{ color: 'white', fontWeight: 700 }}>Sai Deveena Traders &amp; General Store</span>. {t.footer.allRights}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86efac' }}>
            <Sparkles size={14} style={{ color: '#fb923c' }} />
            <span>{t.footer.designedFor}</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: all 0.15s ease;
        }
        .footer-link:hover {
          color: #fb923c;
          padding-left: 4px;
        }
      `}</style>
    </footer>
  );
};
