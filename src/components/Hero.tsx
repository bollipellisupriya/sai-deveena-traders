import React, { useState, useEffect, useRef } from 'react';
import { Sprout, ArrowRight, Sparkles, ShieldCheck, Leaf, ShoppingBag } from 'lucide-react';
import type { Language } from '../types';

export interface HeroProps {
  currentLang?: Language;
  onExploreClick?: () => void;
  onContactClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang = 'en',
  onExploreClick,
  onContactClick,
  className = '',
  style = {}
}) => {
  const isTe = currentLang === 'te';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

  // Check prefers-reduced-motion to avoid unwanted motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener?.('change', handleMotionChange);
    return () => mediaQuery.removeEventListener?.('change', handleMotionChange);
  }, []);

  // Control video play/pause based on prefers-reduced-motion
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Browser autoplay restrictions may wait for user interaction; safe to catch
      });
    }
  }, [prefersReducedMotion]);

  // Navigate to product catalogue route
  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    // Router fallback: scroll to catalogue section or trigger hash route
    const catalogueEl = document.getElementById('catalogue') || document.getElementById('categories');
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#categories';
    }
  };

  return (
    <section
      id="hero"
      className={`organic-hero-root ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#052e16',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px -10px rgba(5, 46, 22, 0.45), 0 0 0 1px rgba(74, 222, 128, 0.15)',
        color: '#ffffff',
        isolation: 'isolate',
        ...style
      }}
    >
      {/* 1. LAYER 0: Rich Static Fallback Poster & Deep Forest-Green Tone Backdrop */}
      <div
        className="hero-fallback-backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(135deg, #052e16 0%, #0f3d20 50%, #14532d 100%)',
          backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(74, 222, 128, 0.18) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(22, 163, 74, 0.25) 0%, transparent 60%), url("/images/banner.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          opacity: 1
        }}
      />

      {/* 2. LAYER 1: 3D Organic Background Video */}
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/banner.jpg"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setVideoError(true)}
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: isVideoLoaded && !videoError ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out'
          }}
        >
          <source src="/videos/organic-vegetables-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* 3. LAYER 2: Cinematic Deep Forest-Green Dark Gradient Overlay for Maximum Legibility & 3D Depth */}
      <div
        className="hero-cinematic-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(5, 46, 22, 0.82) 0%, rgba(5, 46, 22, 0.65) 45%, rgba(5, 46, 22, 0.90) 100%)'
        }}
      />
      <div
        className="hero-vignette-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, rgba(5, 46, 22, 0.2) 0%, rgba(5, 46, 22, 0.8) 100%)'
        }}
      />

      {/* 4. LAYER 3: Interactive Foreground Content */}
      <div
        className="hero-content-wrapper"
        style={{
          position: 'relative',
          zIndex: 3,
          padding: '1.25rem 1.1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '210px'
        }}
      >
        {/* Brand & Organic Trust Badge */}
        <div
          className="hero-pill-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.28rem 0.75rem',
            backgroundColor: 'rgba(5, 46, 22, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            borderRadius: '9999px',
            color: '#dcfce7',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            marginBottom: '0.65rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            alignSelf: 'flex-start'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#4ade80',
              boxShadow: '0 0 8px #4ade80',
              display: 'inline-block'
            }}
          />
          <Leaf size={12} style={{ color: '#4ade80' }} />
          <span>{isTe ? '100% సహజసిద్ధ తాజా ఉత్పత్తులు' : '100% Farm Fresh & Organic'}</span>
        </div>

        {/* Main Heading: Crisp White with Fresh-Green Highlight */}
        <h1
          className="hero-heading"
          style={{
            fontSize: 'clamp(1.22rem, 3.8vw, 1.85rem)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
          }}
        >
          {isTe ? (
            <>
              ప్రకృతి నుండి మీ ఇంటికి <span style={{ color: '#4ade80', textShadow: '0 0 16px rgba(74, 222, 128, 0.5)' }}>స్వచ్ఛమైన తాజాదనం</span>
            </>
          ) : (
            <>
              Freshness from <span style={{ color: '#4ade80', textShadow: '0 0 16px rgba(74, 222, 128, 0.5)' }}>Nature</span> to Your Table
            </>
          )}
        </h1>

        {/* Hero Description */}
        <p
          className="hero-description"
          style={{
            fontSize: 'clamp(0.78rem, 1.8vw, 0.9rem)',
            color: '#f0fdf4',
            lineHeight: 1.45,
            fontWeight: 500,
            marginBottom: '0.95rem',
            maxWidth: '520px',
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.65)'
          }}
        >
          {isTe
            ? 'తాజా కూరగాయలతో ప్రతిరోజూ ఆరోగ్యకరమైన మరియు స్వచ్ఛమైన ఆహారాన్ని పొందండి.'
            : 'Discover fresh vegetables and bring the goodness of nature into your everyday meals.'}
        </p>

        {/* Hero Actions Row */}
        <div
          className="hero-actions-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem'
          }}
        >
          {/* Main Action Button: Explore Fresh Vegetables */}
          <button
            onClick={handleExplore}
            className="hero-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#16a34a',
              backgroundImage: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
              color: '#ffffff',
              border: '1px solid rgba(134, 239, 172, 0.45)',
              borderRadius: '9999px',
              padding: '0.72rem 1.45rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px -4px rgba(22, 163, 74, 0.55), 0 0 16px rgba(74, 222, 128, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              zIndex: 4
            }}
          >
            <Sprout size={18} />
            <span>{isTe ? 'తాజా కూరగాయలను చూడండి' : 'Explore Fresh Vegetables'}</span>
            <ArrowRight size={16} />
          </button>

          {/* Secondary Quick Contact Button if provided */}
          {onContactClick && (
            <button
              onClick={onContactClick}
              className="hero-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '9999px',
                padding: '0.72rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                zIndex: 4
              }}
            >
              <Sparkles size={16} style={{ color: '#4ade80' }} />
              <span>{isTe ? 'సంప్రదించండి' : 'Quick Contact'}</span>
            </button>
          )}
        </div>

        {/* 3D Depth Micro Features */}
        <div
          className="hero-features-chips"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#dcfce7', fontWeight: 600 }}>
            <ShieldCheck size={14} style={{ color: '#4ade80' }} />
            <span>{isTe ? 'ధృవీకరించబడిన నాణ్యత' : 'Direct Farm Harvest'}</span>
          </div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#dcfce7', fontWeight: 600 }}>
            <ShoppingBag size={14} style={{ color: '#4ade80' }} />
            <span>{isTe ? 'సులభమైన ఆర్డర్' : 'Same-Day Dispatch'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .organic-hero-root {
          transform: translateZ(0);
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 28px -4px rgba(22, 163, 74, 0.7), 0 0 24px rgba(74, 222, 128, 0.5) !important;
          background-image: linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #15803d 100%) !important;
        }
        .hero-btn-primary:active {
          transform: translateY(0) scale(0.99);
        }
        .hero-btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(74, 222, 128, 0.5) !important;
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .organic-hero-root video {
            display: none !important;
          }
          .hero-btn-primary, .hero-btn-secondary {
            transition: none !important;
            transform: none !important;
          }
        }
        @media (min-width: 640px) {
          .hero-content-wrapper {
            padding: 2.75rem 2rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
