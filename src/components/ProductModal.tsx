import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Phone, Tag, Package, AlertCircle, Sparkles } from 'lucide-react';
import type { Product, Language, Category } from '../types';
import { translations } from '../translations';
import { formatPrice, getProductWhatsappUrl, getPhoneDialUrl } from '../utils/whatsapp';
import { shopConfig } from '../config/shopConfig';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  currentLang: Language;
  onClose: () => void;
  onContactClick: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  currentLang,
  onClose,
  onContactClick
}) => {
  const [imgError, setImgError] = useState(false);
  const t = translations[currentLang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const { url: whatsappUrl, isConfigured: isWhatsappReady } = getProductWhatsappUrl(product, currentLang);
  const { url: phoneUrl, isConfigured: isPhoneReady } = getPhoneDialUrl();

  const primaryName = product.name[currentLang] || product.name.en;
  const secondaryName = currentLang === 'te' ? product.name.en : product.name.te;
  const description = product.description[currentLang] || product.description.en;
  const isPriceAvailable = product.price !== null && product.price !== undefined;

  const categoryObj = categories.find(c => c.id === product.category);
  const categoryName = categoryObj ? (categoryObj.name[currentLang] || categoryObj.name.en) : product.category;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          border: '1.5px solid rgba(254, 215, 170, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          aria-label={t.modal.close}
        >
          <X size={20} />
        </button>

        {/* Modal Top Image Header */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '250px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #fff7ed 100%)',
          overflow: 'hidden',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={primaryName}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 8px 24px rgba(22, 101, 52, 0.18)',
                padding: '4px',
                marginBottom: '0.75rem',
                overflow: 'hidden'
              }}>
                <img
                  src="/logo.png"
                  alt="Sai Deveena Traders"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: '#14532d'
              }}>
                {shopConfig.shopName[currentLang]}
              </div>
              <div style={{
                fontSize: '0.78rem',
                color: '#ea580c',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                QUALITY SEEDS • PREMIUM FERTILIZERS • BETTER YIELDS
              </div>
            </div>
          )}

          {product.featured && (
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
              <span className="badge badge-gold shimmer-badge" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                <Sparkles size={14} style={{ color: '#d97706' }} />
                {t.catalogue.featuredBadge}
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Metadata badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span className="badge badge-green" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
              {categoryName}
            </span>
            {product.brand && (
              <span className="badge badge-orange" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                <Tag size={12} />
                {product.brand}
              </span>
            )}
            {product.packSize && (
              <span className="badge badge-gray" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                <Package size={12} />
                {product.packSize}
              </span>
            )}
          </div>

          {/* Titles */}
          <h2
            id="modal-product-title"
            style={{
              fontSize: '1.55rem',
              fontWeight: 900,
              color: 'var(--primary-950)',
              marginBottom: '0.25rem',
              lineHeight: 1.3
            }}
          >
            {primaryName}
          </h2>

          {secondaryName && secondaryName !== primaryName && (
            <div style={{
              fontSize: '0.98rem',
              color: '#64748b',
              marginBottom: '1.25rem',
              fontStyle: 'italic',
              fontWeight: 500
            }}>
              {secondaryName}
            </div>
          )}

          {/* Price Box with Brand Accent */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #fff7ed 100%)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid #fed7aa',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>
              {t.modal.price}
            </div>
            {isPriceAvailable ? (
              <div>
                <div style={{
                  fontSize: '1.9rem',
                  fontWeight: 900,
                  color: '#14532d',
                  lineHeight: 1.2
                }}>
                  {formatPrice(product.price, currentLang)}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 700, marginTop: '0.25rem' }}>
                  {t.modal.indicativePriceNote}
                </div>
              </div>
            ) : (
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#c2410c',
                marginTop: '0.25rem'
              }}>
                {t.catalogue.contactForPrice}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.02rem',
              fontWeight: 800,
              color: 'var(--primary-950)',
              marginBottom: '0.5rem'
            }}>
              {t.modal.description}
            </h3>
            <p style={{
              fontSize: '0.94rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65
            }}>
              {description}
            </p>
          </div>

          {/* Disclaimer Callout Box */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '1rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            fontSize: '0.84rem',
            color: '#78350f'
          }}>
            <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontWeight: 800 }}>{t.modal.disclaimerTitle} </span>
              {t.modal.disclaimerBody}
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.85rem'
          }}>
            <a
              href={whatsappUrl}
              target={isWhatsappReady ? "_blank" : undefined}
              rel={isWhatsappReady ? "noopener noreferrer" : undefined}
              className="btn btn-whatsapp"
              style={{ padding: '0.95rem 1.25rem', fontSize: '0.95rem' }}
              onClick={(e) => {
                if (!isWhatsappReady) {
                  e.preventDefault();
                  onContactClick();
                  onClose();
                }
              }}
            >
              <MessageCircle size={19} />
              <span>{t.modal.enquireNow}</span>
            </a>

            <a
              href={phoneUrl}
              className="btn btn-phone"
              style={{ padding: '0.95rem 1.25rem', fontSize: '0.95rem' }}
              onClick={(e) => {
                if (!isPhoneReady) {
                  e.preventDefault();
                  onContactClick();
                  onClose();
                }
              }}
            >
              <Phone size={19} />
              <span>{t.modal.callForDetails}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
