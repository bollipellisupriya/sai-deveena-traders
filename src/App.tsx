import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CategorySection } from './components/CategorySection';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AgriculturalBanner } from './components/AgriculturalBanner';
import type { CatalogData, Product, Language } from './types';
import { translations } from './translations';
import { AlertCircle, RefreshCw, Phone, MessageCircle } from 'lucide-react';
import { getPhoneDialUrl, getGeneralWhatsappUrl } from './utils/whatsapp';

export function App() {
  // Language State with localStorage persistence
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('sdt_language');
    return (saved === 'te' || saved === 'en') ? saved : 'en';
  });

  // Catalog Data State
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const t = translations[currentLang];

  // Save language and update document language attribute
  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('sdt_language', lang);
    document.documentElement.lang = lang;
    document.body.setAttribute('lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.body.setAttribute('lang', currentLang);
  }, [currentLang]);

  // Fetch catalog.json
  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Add timestamp to prevent stale browser caching
      const response = await fetch(`/catalog.json?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load catalog data (HTTP ${response.status})`);
      }
      const data: CatalogData = await response.json();

      // Basic validation
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.categories)) {
        throw new Error('Invalid catalogue format');
      }

      setCatalog(data);
    } catch (err: any) {
      console.error('Error fetching catalog.json:', err);
      setLoadError(err.message || 'Unknown network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Navigation scroll helper
  const handleNavigate = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    handleNavigate('catalogue');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('default');
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    if (!catalog) return [];

    // Rule: Hide inactive products
    let list = catalog.products.filter(p => p.active !== false);

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const nameEn = (p.name.en || '').toLowerCase();
        const nameTe = (p.name.te || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const descEn = (p.description.en || '').toLowerCase();
        const descTe = (p.description.te || '').toLowerCase();
        const pack = (p.packSize || '').toLowerCase();

        // Also check category name match
        const cat = catalog.categories.find(c => c.id === p.category);
        const catEn = cat ? (cat.name.en || '').toLowerCase() : '';
        const catTe = cat ? (cat.name.te || '').toLowerCase() : '';

        return (
          nameEn.includes(q) ||
          nameTe.includes(q) ||
          brand.includes(q) ||
          descEn.includes(q) ||
          descTe.includes(q) ||
          pack.includes(q) ||
          catEn.includes(q) ||
          catTe.includes(q)
        );
      });
    }

    // Sort Products
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      }
      if (sortBy === 'name-asc') {
        const nameA = (a.name[currentLang] || a.name.en || '').toLowerCase();
        const nameB = (b.name[currentLang] || b.name.en || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      // Default: Featured first, then name
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [catalog, selectedCategory, searchQuery, sortBy, currentLang]);

  const totalActiveProducts = useMemo(() => {
    if (!catalog) return 0;
    return catalog.products.filter(p => p.active !== false).length;
  }, [catalog]);

  const { url: phoneUrl, isConfigured: isPhoneReady } = getPhoneDialUrl();
  const { url: whatsappUrl, isConfigured: isWhatsappReady } = getGeneralWhatsappUrl(currentLang);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip to Content for Accessibility */}
      <a href="#main-content" className="skip-link">
        {currentLang === 'te' ? 'కంటెంట్‌కి వెళ్ళండి' : 'Skip to main content'}
      </a>

      {/* Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onNavigate={handleNavigate}
      />

      <main id="main-content" style={{ flexGrow: 1 }}>
        {/* Single Clean Agricultural Hero Banner */}
        <AgriculturalBanner
          currentLang={currentLang}
          onExploreClick={() => handleNavigate('catalogue')}
          onContactClick={() => handleNavigate('contact')}
        />

        {/* Loading State */}
        {isLoading && (
          <div style={{ padding: '5rem 1rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--primary-800)',
              fontSize: '1.1rem',
              fontWeight: 600
            }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <span>{currentLang === 'te' ? 'ఉత్పత్తుల వివరాలు లోడ్ అవుతున్నాయి...' : 'Loading agricultural catalogue...'}</span>
            </div>
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {/* Friendly Error State with Retry Button */}
        {loadError && !isLoading && (
          <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{
              maxWidth: '550px',
              margin: '0 auto',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <AlertCircle size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
                {t.errors.loadFailedTitle}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {t.errors.loadFailedDesc}
              </p>
              <button onClick={fetchCatalog} className="btn btn-primary">
                <RefreshCw size={16} />
                <span>{t.errors.retryBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* Catalogue Content (when loaded) */}
        {!isLoading && !loadError && catalog && (
          <>
            {/* Category Highlights */}
            <CategorySection
              categories={catalog.categories}
              products={catalog.products}
              currentLang={currentLang}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />

            {/* Product Catalogue Section */}
            <section id="catalogue" className="section" style={{ backgroundColor: '#ffffff', paddingTop: '1.75rem', paddingBottom: '2.5rem' }}>
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <h2 className="section-title">{t.catalogue.heading}</h2>
                  <p className="section-subtitle" style={{ margin: '0 auto' }}>
                    {t.catalogue.subheading}
                  </p>
                </div>

                {/* Search, Filter Pills & Sort Controls */}
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  categories={catalog.categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  currentLang={currentLang}
                  totalFiltered={filteredProducts.length}
                  totalProducts={totalActiveProducts}
                  onClearFilters={handleClearFilters}
                />

                {/* Product Grid or Empty State */}
                {filteredProducts.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'stretch'
                  }}>
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currentLang={currentLang}
                        onViewDetails={setSelectedProduct}
                        onContactClick={() => handleNavigate('contact')}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 1.5rem',
                    backgroundColor: 'var(--surface-muted)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border-light)',
                    maxWidth: '600px',
                    margin: '1rem auto'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-950)', marginBottom: '0.5rem' }}>
                      {t.catalogue.noResultsTitle}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      {t.catalogue.noResultsDesc}
                    </p>
                    <button onClick={handleClearFilters} className="btn btn-secondary">
                      {t.catalogue.resetSearch}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* About Section */}
        <AboutSection currentLang={currentLang} />

        {/* Contact Section */}
        <ContactSection currentLang={currentLang} />
      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        categories={catalog?.categories || []}
        onNavigate={handleNavigate}
        onSelectCategory={handleCategorySelect}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        categories={catalog?.categories || []}
        currentLang={currentLang}
        onClose={() => setSelectedProduct(null)}
        onContactClick={() => handleNavigate('contact')}
      />

      {/* Floating Bottom Contact Bar (Mobile-Friendly Farmer Quick Actions) */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.55rem',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        padding: '0.4rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(22, 101, 52, 0.15)',
        border: '1.5px solid rgba(254, 215, 170, 0.8)',
        maxWidth: 'calc(100% - 20px)',
        width: 'max-content'
      }} className="mobile-float-bar">
        {/* Mini Logo Emblem */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          flexShrink: 0
        }}>
          <img src="/logo-icon.png" alt="Sai Deveena Traders" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <a
          href={phoneUrl}
          className="btn btn-phone"
          style={{
            padding: '0.55rem 1.05rem',
            fontSize: '0.84rem',
            minHeight: '38px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800
          }}
          onClick={(e) => {
            if (!isPhoneReady) {
              e.preventDefault();
              handleNavigate('contact');
            }
          }}
        >
          <Phone size={15} />
          <span>{currentLang === 'te' ? 'కాల్' : 'Call'}</span>
        </a>

        <a
          href={whatsappUrl}
          target={isWhatsappReady ? "_blank" : undefined}
          rel={isWhatsappReady ? "noopener noreferrer" : undefined}
          className="btn btn-whatsapp"
          style={{
            padding: '0.55rem 1.15rem',
            fontSize: '0.84rem',
            minHeight: '38px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800
          }}
          onClick={(e) => {
            if (!isWhatsappReady) {
              e.preventDefault();
              handleNavigate('contact');
            }
          }}
        >
          <MessageCircle size={15} />
          <span>{currentLang === 'te' ? 'వాట్సాప్' : 'WhatsApp'}</span>
        </a>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .mobile-float-bar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
export default App;
