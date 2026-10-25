import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CatalogData, Product, Language } from './types';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav, type TabType } from './components/mobile/MobileBottomNav';
import { MobileHomeScreen } from './components/mobile/MobileHomeScreen';
import { MobileCategoryScreen } from './components/mobile/MobileCategoryScreen';
import { MobileProductDetailScreen } from './components/mobile/MobileProductDetailScreen';
import { MobileCartDrawer, type CartItem } from './components/mobile/MobileCartDrawer';
import { MobileOrdersScreen } from './components/mobile/MobileOrdersScreen';
import { MobileProfileScreen } from './components/mobile/MobileProfileScreen';
import { MobileMenuDrawer } from './components/mobile/MobileMenuDrawer';
import { RefreshCw, AlertCircle, Check } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('seeds');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Cart State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

      // Pre-populate 3 items in cart to match reference image badge count (3 items: Paddy, DAP, Sunflower Oil)
      const initCart: CartItem[] = [];
      const paddy = data.products.find(p => p.id === 'paddy-seed-hy');
      const dap = data.products.find(p => p.id === 'dap-fert-50kg');
      const oil = data.products.find(p => p.id === 'sunflower-oil-1l');

      if (paddy) initCart.push({ product: paddy, quantity: 1 });
      if (dap) initCart.push({ product: dap, quantity: 1 });
      if (oil) initCart.push({ product: oil, quantity: 1 });

      setCartItems(initCart);
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

  // Show quick toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Add to Cart handler
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(currentLang === 'te' ? 'కార్ట్‌కి జోడించబడింది!' : 'Added to cart!');
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  // Remove from Cart
  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
  };

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

  // Switch category and jump to categories view
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedProduct(null);
    setActiveTab('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Tab Switch
  const handleTabChange = (tab: TabType) => {
    if (tab === 'cart') {
      setIsCartOpen(true);
      return;
    }
    setActiveTab(tab);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Total items in cart
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.quantity, 0);
  }, [cartItems]);

  // Determine current header title
  const currentHeaderTitle = useMemo(() => {
    if (selectedProduct) {
      return selectedProduct.name[currentLang] || selectedProduct.name.en;
    }
    if (activeTab === 'categories') {
      const cat = catalog?.categories.find(c => c.id === selectedCategory);
      return cat ? (cat.name[currentLang] || cat.name.en) : (currentLang === 'te' ? 'విత్తనాలు' : 'Seeds');
    }
    if (activeTab === 'orders') {
      return currentLang === 'te' ? 'ఆర్డర్లు' : 'Orders';
    }
    if (activeTab === 'profile') {
      return currentLang === 'te' ? 'ప్రొఫైల్' : 'Store Profile';
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
      {/* Container (phone width on desktop, 100% on mobile) */}
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
                } else {
                  setActiveTab('home');
                }
              }}
              cartCount={totalCartCount}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenMenu={() => setIsDrawerOpen(true)}
              onSearchClick={() => {
                setActiveTab('categories');
                setSelectedProduct(null);
              }}
              currentLang={currentLang}
            />

            {/* Screen Content */}
            <main style={{ flex: 1 }}>
              {selectedProduct ? (
                // Screen 3: Product Detail View
                <MobileProductDetailScreen
                  product={selectedProduct}
                  allProducts={catalog.products}
                  currentLang={currentLang}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              ) : activeTab === 'categories' ? (
                // Screen 2: Categories View
                <MobileCategoryScreen
                  categories={catalog.categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  products={catalog.products}
                  currentLang={currentLang}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onAddToCart={handleAddToCart}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              ) : activeTab === 'orders' ? (
                // Orders View
                <MobileOrdersScreen
                  currentLang={currentLang}
                  onExplore={() => {
                    setActiveTab('categories');
                    setSelectedProduct(null);
                  }}
                />
              ) : activeTab === 'profile' ? (
                // Profile View
                <MobileProfileScreen
                  currentLang={currentLang}
                  onLanguageChange={handleLanguageChange}
                />
              ) : (
                // Screen 1: Home View
                <MobileHomeScreen
                  products={catalog.products}
                  categories={catalog.categories}
                  currentLang={currentLang}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectCategory={handleCategorySelect}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onAddToCart={handleAddToCart}
                  onViewAllProducts={() => {
                    setActiveTab('categories');
                    setSelectedProduct(null);
                  }}
                  onViewAllCategories={() => {
                    setActiveTab('categories');
                    setSelectedProduct(null);
                  }}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              )}
            </main>

            {/* Fixed 5-Tab Bottom App Navigation Bar */}
            <MobileBottomNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              cartCount={totalCartCount}
              currentLang={currentLang}
            />

            {/* Slide-Up Cart Drawer */}
            <MobileCartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              currentLang={currentLang}
            />

            {/* Side Menu Drawer */}
            <MobileMenuDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setSelectedProduct(null);
              }}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
            />
          </>
        )}

        {/* Quick Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '4.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 120,
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '0.55rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.84rem',
            fontWeight: 800,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <Check size={16} strokeWidth={3} />
            <span>{toastMessage}</span>
          </div>
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
