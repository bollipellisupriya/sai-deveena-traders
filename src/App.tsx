import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CatalogData, Product, Language, PendingCustomerAction, CustomerEnquiry } from './types';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav, type TabType } from './components/mobile/MobileBottomNav';
import { MobileHomeScreen } from './components/mobile/MobileHomeScreen';
import { MobileCategoryScreen } from './components/mobile/MobileCategoryScreen';
import { MobileProductDetailScreen } from './components/mobile/MobileProductDetailScreen';
import { MobileOrdersScreen } from './components/mobile/MobileOrdersScreen';
import { MobileProfileScreen } from './components/mobile/MobileProfileScreen';
import { MobileMenuDrawer } from './components/mobile/MobileMenuDrawer';
import { CustomerEnquiryModal } from './components/mobile/CustomerEnquiryModal';
import { MobileCartDrawer } from './components/mobile/MobileCartDrawer';
import { CartProvider, useCart } from './context/CartContext';
import { RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import AdminApp from './admin/AdminApp';
import { catalogService } from './services/catalogService';
import { shopConfig } from './config/shopConfig';

interface StoreAppInnerProps {
  catalog: CatalogData;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAdmin: () => void;
  wishlist: Set<string>;
  onToggleWishlist: (productId: string) => void;
  handleCustomerAction: (action: 'call' | 'whatsapp', product?: Product, customText?: string) => void;
}

function StoreAppInner({
  catalog,
  currentLang,
  onLanguageChange,
  onOpenAdmin,
  wishlist,
  onToggleWishlist,
  handleCustomerAction
}: StoreAppInnerProps) {
  const { totalItemCount, subtotal, openCart, isCartOpen } = useCart();

  // App Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Drawer State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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
      const cat = catalog.categories.find(c => c.id === selectedCategory);
      return cat ? (cat.name[currentLang] || cat.name.en) : (currentLang === 'te' ? 'విభాగాలు' : 'Categories');
    }
    if (activeTab === 'orders') {
      return currentLang === 'te' ? 'మీ ఆర్డర్లు' : 'Your Orders';
    }
    if (activeTab === 'profile') {
      return currentLang === 'te' ? 'దుకాణం ప్రొఫైల్' : 'Store Profile';
    }
    return '';
  }, [selectedProduct, activeTab, selectedCategory, catalog, currentLang]);

  return (
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
        currentLang={currentLang}
        onLanguageChange={onLanguageChange}
        onCallStore={() => handleCustomerAction('call')}
        onOpenCart={openCart}
        cartCount={totalItemCount}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
            onToggleWishlist={onToggleWishlist}
            onCustomerAction={handleCustomerAction}
          />
        ) : activeTab === 'categories' ? (
          // Screen 2: Categories View
          <MobileCategoryScreen
            categories={catalog.categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            products={catalog.products}
            currentLang={currentLang}
            onSelectProduct={(p) => setSelectedProduct(p)}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
            onCustomerAction={handleCustomerAction}
          />
        ) : activeTab === 'orders' ? (
          // Orders View
          <MobileOrdersScreen
            currentLang={currentLang}
            onExplore={() => {
              setActiveTab('categories');
              setSelectedCategory(null);
              setSelectedProduct(null);
            }}
          />
        ) : activeTab === 'profile' ? (
          // Profile View
          <MobileProfileScreen
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
          />
        ) : (
          // Screen 1: Home View
          <MobileHomeScreen
            products={catalog.products}
            categories={catalog.categories}
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
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
            onToggleWishlist={onToggleWishlist}
            onCustomerAction={handleCustomerAction}
          />
        )}
      </main>

      {/* Floating Bottom Cart Bar (Visible on mobile/tablet when cart has items) */}
      {totalItemCount > 0 && !isCartOpen && !selectedProduct && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(62px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 1.5rem)',
          maxWidth: '460px',
          zIndex: 55,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <button
            type="button"
            onClick={openCart}
            style={{
              width: '100%',
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(21, 128, 61, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.22)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontWeight: 900,
                fontSize: '0.82rem'
              }}>
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </div>
              <span style={{ fontSize: '0.94rem', fontWeight: 900 }}>
                ₹{subtotal}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem', fontWeight: 800 }}>
              <span>{currentLang === 'te' ? 'కార్ట్ చూడండి' : 'View Cart & Checkout'}</span>
              <ShoppingBag size={18} />
            </div>
          </button>
        </div>
      )}

      {/* Fixed 4-Tab Bottom App Navigation Bar */}
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
        onLanguageChange={onLanguageChange}
        onOpenAdmin={onOpenAdmin}
      />

      {/* Guest Checkout & Cart Drawer */}
      <MobileCartDrawer currentLang={currentLang} />
    </>
  );
}

export function App() {
  // Admin Route detection (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin') || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Language State with localStorage persistence
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('sdt_language');
    return (saved === 'te' || saved === 'en') ? saved : 'en';
  });

  // Catalog Data State
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Customer Enquiry Modal State
  const [enquiryModalState, setEnquiryModalState] = useState<{
    isOpen: boolean;
    pendingAction: PendingCustomerAction | null;
  }>({
    isOpen: false,
    pendingAction: null
  });

  // Intercept Call / WhatsApp action
  const handleCustomerAction = useCallback((action: 'call' | 'whatsapp', product?: Product, customText?: string) => {
    setEnquiryModalState({
      isOpen: true,
      pendingAction: {
        type: action,
        product,
        customText
      }
    });
  }, []);

  const handleEnquirySuccess = useCallback((
    enquiry: CustomerEnquiry,
    action: 'call' | 'whatsapp',
    product?: Product,
    customText?: string
  ) => {
    if (action === 'call') {
      window.location.href = `tel:${shopConfig.phoneNumber.replace(/[^\d+]/g, '')}`;
      return;
    }

    if (action === 'whatsapp') {
      const refId = enquiry.id ? `#ENQ-${enquiry.id.slice(0, 8).toUpperCase()}` : 'Enquiry';
      const teluguPart = product?.name?.te ? ` (${product.name.te})` : '';
      const englishPart = product?.name?.en || 'Store Item';
      const productSnippet = product
        ? `\n- Product: ${englishPart}${teluguPart}\n- Price: ₹${product.price}`
        : '';
      const customPart = customText ? `\n- Details: ${customText}` : '';

      const text = encodeURIComponent(
        `Hello Sai Deveena Traders & General Store,\nI submitted an enquiry (${refId}):${productSnippet}${customPart}\n- Name: ${enquiry.name}\n- Phone: ${enquiry.phone}\n- Village: ${enquiry.villageCity}\n\nPlease confirm product availability and delivery.`
      );
      const cleanWaNum = shopConfig.whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanWaNum}?text=${text}`, '_blank');
    }
  }, []);

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

  // Fetch live catalog from Supabase
  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const liveCatalog = await catalogService.fetchPublicCatalog();
      setCatalog(liveCatalog);
    } catch (err: any) {
      console.error('Error fetching live catalog from Supabase:', err);
      setLoadError(err.message || 'Failed to load catalogue from database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

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

  // Render Admin Portal if path or hash is admin
  if (isAdminRoute) {
    return (
      <AdminApp
        catalog={catalog}
        onExitToStore={() => {
          setIsAdminRoute(false);
          window.history.pushState(null, '', '/');
          fetchCatalog();
        }}
        onRefreshCatalog={fetchCatalog}
      />
    );
  }

  return (
    <CartProvider>
      <div className="mobile-app-root" style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: currentLang === 'te' ? 'var(--font-telugu)' : 'var(--font-sans)'
      }}>
        <div className="app-responsive-shell" style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflowX: 'clip'
        }}>
          {/* Loading State */}
          {isLoading && (
            <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
              <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#15803d', margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#14532d' }}>
                {currentLang === 'te' ? 'సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ లోడ్ అవుతోంది...' : 'Loading Sai Deveena Traders & General Store...'}
              </div>
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
            <StoreAppInner
              catalog={catalog}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
              onOpenAdmin={() => {
                setIsAdminRoute(true);
                window.history.pushState(null, '', '/admin');
              }}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              handleCustomerAction={handleCustomerAction}
            />
          )}

          {/* Customer Product & Store Enquiry Modal */}
          <CustomerEnquiryModal
            isOpen={enquiryModalState.isOpen}
            onClose={() => setEnquiryModalState({ isOpen: false, pendingAction: null })}
            pendingAction={enquiryModalState.pendingAction}
            currentLang={currentLang}
            onSuccess={handleEnquirySuccess}
          />
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </CartProvider>
  );
}

export default App;
