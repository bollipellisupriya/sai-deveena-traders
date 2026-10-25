import React, { useState } from 'react';
import { MessageCircle, Eye, Tag, Package, Sparkles, Phone } from 'lucide-react';
import type { Product, Language } from '../types';
import { translations } from '../translations';
import { formatPrice, getProductWhatsappUrl, getPhoneDialUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  currentLang: Language;
  onViewDetails: (product: Product) => void;
  onContactClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentLang,
  onViewDetails,
  onContactClick
}) => {
  const [imgError, setImgError] = useState(false);
  const t = translations[currentLang];
  const { url: whatsappUrl, isConfigured: isWhatsappReady } = getProductWhatsappUrl(product, currentLang);
  const { url: phoneUrl, isConfigured: isPhoneReady } = getPhoneDialUrl();

  const productName = product.name[currentLang] || product.name.en;
  const productDesc = product.description[currentLang] || product.description.en;
  const isPriceAvailable = product.price !== null && product.price !== undefined;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
        border: '1.5px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Featured Badge */}
      {product.featured && (
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          zIndex: 3,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <span className="badge badge-gold shimmer-badge" style={{ fontSize: '0.76rem', fontWeight: 800 }}>
            <Sparkles size={13} style={{ color: '#d97706' }} />
            {t.catalogue.featuredBadge}
          </span>
        </div>
      )}

      {/* Product Image Area with Fallback */}
      <div
        onClick={() => onViewDetails(product)}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '62%',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #fff7ed 100%)',
          cursor: 'pointer',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={productName}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(22, 101, 52, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 800 }}>
              Sai Deveena Traders
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Brand & Pack Size Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {product.brand && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#ea580c',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Tag size={12} />
              {product.brand}
            </span>
          )}

          {product.packSize && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              backgroundColor: 'var(--surface-muted)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-xs)'
            }}>
              <Package size={12} />
              {product.packSize}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onViewDetails(product)}
          style={{
            fontSize: '1.12rem',
            fontWeight: 800,
            color: 'var(--primary-950)',
            marginBottom: '0.45rem',
            lineHeight: 1.35,
            cursor: 'pointer'
          }}
        >
          {productName}
        </h3>

        {/* Short Description */}
        <p style={{
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {productDesc}
        </p>

        {/* Price Tag */}
        <div style={{ marginBottom: '1rem', marginTop: 'auto' }}>
          {isPriceAvailable ? (
            <div>
              <div style={{
                fontSize: '1.38rem',
                fontWeight: 900,
                color: '#14532d',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                {formatPrice(product.price, currentLang)}
              </div>
              <div style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '0.1rem'
              }}>
                {currentLang === 'te' ? '* అంచనా ధర (దుకాణం వద్ద నిర్ధారించండి)' : '* Indicative price (Confirm with shop)'}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'inline-block',
              padding: '0.35rem 0.65rem',
              backgroundColor: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              fontSize: '0.82rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-sm)'
            }}>
              {t.catalogue.contactForPrice}
            </div>
          )}
        </div>

        {/* Action Buttons: WhatsApp (9010454541), Call (9010454541) and View Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
          {/* Top Row: WhatsApp & Call */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.45rem'
          }}>
            <a
              href={whatsappUrl}
              target={isWhatsappReady ? "_blank" : undefined}
              rel={isWhatsappReady ? "noopener noreferrer" : undefined}
              className="btn btn-whatsapp"
              style={{
                padding: '0.55rem 0.5rem',
                fontSize: '0.82rem',
                minHeight: '38px',
                gap: '0.35rem'
              }}
              onClick={(e) => {
                if (!isWhatsappReady) {
                  e.preventDefault();
                  onContactClick();
                }
              }}
              title="WhatsApp: 9010454541"
            >
              <MessageCircle size={15} />
              <span>{currentLang === 'te' ? 'వాట్సాప్' : 'WhatsApp'}</span>
            </a>

            <a
              href={phoneUrl}
              className="btn btn-phone"
              style={{
                padding: '0.55rem 0.5rem',
                fontSize: '0.82rem',
                minHeight: '38px',
                gap: '0.35rem'
              }}
              onClick={(e) => {
                if (!isPhoneReady) {
                  e.preventDefault();
                  onContactClick();
                }
              }}
              title="Call: 9010454541"
            >
              <Phone size={14} />
              <span>{currentLang === 'te' ? 'కాల్' : 'Call'}</span>
            </a>
          </div>

          {/* Bottom Row: View Details */}
          <button
            onClick={() => onViewDetails(product)}
            className="btn btn-outline"
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              minHeight: '34px',
              backgroundColor: '#f8fafc',
              color: 'var(--text-secondary)'
            }}
          >
            <Eye size={14} />
            <span>{t.catalogue.viewDetails}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
