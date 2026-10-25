import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CatalogData, Product, Language } from './types';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav, type TabType } from './components/mobile/MobileBottomNav';
import { MobileHomeScreen } from './components/mobile/MobileHomeScreen';
import { MobileCategoryScreen } from './components/mobile/MobileCategoryScreen';
import { MobileProductDetailScreen } from './components/mobile/MobileProductDetailScreen';
import { MobileOrdersScreen } from './components/mobile/MobileOrdersScreen';
import { MobileProfileScreen } from './components/mobile/MobileProfileScreen';
import { MobileMenuDrawer } from './components/mobile/MobileMenuDrawer';
import { RefreshCw, AlertCircle } from 'lucide-react';

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

  // App Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // selectedCategory is null when viewing all categories, or string when drilled down into a specific category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Drawer State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Update language and body attribute
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
      const response = await fetch(`/catalog.json?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load catalog (HTTP ${response.status})`);
      }
      const data: CatalogData = await response.json();
      setCatalog(data);
    } catch (err: any) {
      console.error('Error fetching catalog:', err);
      setLoadError(err.message || 'Unknown network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Toggle Wishlist Heart
  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Switch to specific category from Home or Categories
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedProduct(null);
    setActiveTab('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Bottom Nav Tab Switch
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedProduct(null);
    // When clicking Categories tab, reset to show ALL categories first!
    if (tab === 'categories') {
      setSelectedCategory(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current header title
  const currentHeaderTitle = useMemo(() => {
    if (selectedProduct) {
      return selectedProduct.name[currentLang] || selectedProduct.name.en;
    }
    if (activeTab === 'categories') {
      if (!selectedCategory) {
        return currentLang === 'te' ? 'అన్ని విభాగాలు' : 'All Categories';
      }
      const cat = catalog?.categories.find(c => c.id === selectedCategory);
      return cat ? (cat.name[currentLang] || cat.name.en) : (currentLang === 'te' ? 'విభాగాలు' : 'Categories');
    }
    if (activeTab === 'orders') {
      return currentLang === 'te' ? 'పూర్తయిన ఆర్డర్లు' : 'Completed Orders';
    }
    if (activeTab === 'profile') {
      return currentLang === 'te' ? 'దుకాణం ప్రొఫైల్' : 'Store Profile';
    }
    return '';
  }, [selectedProduct, activeTab, selectedCategory, catalog, currentLang]);

  return (
    <div className="mobile-app-root" style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: currentLang === 'te' ? 'var(--font-telugu)' : 'var(--font-sans)'
    }}>
      {/* App Shell Container */}
      <div className="mobile-app-shell" style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 45px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        {/* Loading State */}
        {isLoading && (
          <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#15803d', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#14532d' }}>
              {currentLang === 'te' ? 'సాయి దీవెన ట్రేడర్స్ లోడ్ అవుతోంది...' : 'Loading Sai Deveena Traders...'}
            </div>
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <AlertCircle size={36} style={{ color: '#dc2626', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
              {currentLang === 'te' ? 'లోడింగ్ విఫలమైంది' : 'Failed to load catalogue'}
            </h3>
            <button
              onClick={fetchCatalog}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.65rem 1.5rem',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* App Loaded Content */}
        {!isLoading && !loadError && catalog && (
          <>
            {/* Top Header */}
            <MobileHeader
              title={currentHeaderTitle}
              showBack={Boolean(selectedProduct || activeTab !== 'home')}
              onBack={() => {
                if (selectedProduct) {
                  setSelectedProduct(null);
                } else if (activeTab === 'categories' && selectedCategory) {
                  setSelectedCategory(null);
                } else {
                  setActiveTab('home');
                }
              }}
              onOpenMenu={() => setIsDrawerOpen(true)}
              onSearchClick={() => {
                setActiveTab('categories');
                setSelectedCategory(null);
                setSelectedProduct(null);
              }}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
            />

            {/* Screen Content Area */}
            <main style={{ flex: 1 }}>
              {selectedProduct ? (
                // Screen 3: Product Detail View
                <MobileProductDetailScreen
                  product={selectedProduct}
                  allProducts={catalog.products}
                  currentLang={currentLang}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              ) : activeTab === 'categories' ? (
                // Screen 2: Categories View (Shows ALL categories first, or drilled-down products)
                <MobileCategoryScreen
                  categories={catalog.categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                  products={catalog.products}
                  currentLang={currentLang}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              ) : activeTab === 'orders' ? (
                // Orders View (Completed Orders & WhatsApp/Call list)
                <MobileOrdersScreen
                  currentLang={currentLang}
                  onExplore={() => {
                    setActiveTab('categories');
                    setSelectedCategory(null);
                    setSelectedProduct(null);
                  }}
                />
              ) : activeTab === 'profile' ? (
                // Profile View (High-end Store Profile & Contact Hub)
                <MobileProfileScreen
                  currentLang={currentLang}
                  onLanguageChange={handleLanguageChange}
                />
              ) : (
                // Screen 1: Home View (With English/Telugu at top, 2 banners, quick categories, best sellers)
                <MobileHomeScreen
                  products={catalog.products}
                  categories={catalog.categories}
                  currentLang={currentLang}
                  onLanguageChange={handleLanguageChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectCategory={handleCategorySelect}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onViewAllProducts={() => {
                    setActiveTab('categories');
                    setSelectedCategory(null);
                    setSelectedProduct(null);
                  }}
                  onViewAllCategories={() => {
                    setActiveTab('categories');
                    setSelectedCategory(null);
                    setSelectedProduct(null);
                  }}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              )}
            </main>

            {/* Fixed 4-Tab Bottom App Navigation Bar (Home, Categories, Orders, Profile) */}
            <MobileBottomNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              currentLang={currentLang}
            />

            {/* Side Menu Drawer */}
            <MobileMenuDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'categories') setSelectedCategory(null);
                setSelectedProduct(null);
              }}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
