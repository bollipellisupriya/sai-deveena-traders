import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Product, CartItem, StoreSettings, Order, GuestCheckoutData } from '../types';
import { orderService } from '../services/orderService';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  deliverySettings: StoreSettings;
  deliveryFee: number;
  grandTotal: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  abandonCheckout: () => void;
  checkoutStep: 'cart' | 'checkout' | 'success';
  setCheckoutStep: (step: 'cart' | 'checkout' | 'success') => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  refreshDeliverySettings: () => Promise<void>;
  placeGuestOrder: (guestData: GuestCheckoutData) => Promise<{ success: boolean; orderNumber?: string; error?: string }>;
  isSubmittingOrder: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 'default',
  freeDeliveryThreshold: 199,
  deliveryFee: 50,
  deliveryEnabled: true,
  businessWhatsappNumber: '919010454541'
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'sdt_cart_items_v2';
const GUEST_ORDERS_KEY = 'sdt_guest_orders_v2';
const ACTIVE_CHECKOUT_ATTEMPT_KEY = 'sdt_active_checkout_attempt';

interface ActiveCheckoutAttempt {
  idempotencyKey: string;
  retrySecret: string;
  cartSignature: string;
}

const clearActiveCheckoutAttempt = () => {
  try {
    sessionStorage.removeItem(ACTIVE_CHECKOUT_ATTEMPT_KEY);
  } catch (e) {
    // Ignore storage errors in non-browser or sandboxed environments
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved cart from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not load cart from storage', e);
    }
    return [];
  });

  const [deliverySettings, setDeliverySettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to storage', e);
    }
  }, [items]);

  // Fetch delivery settings on mount
  const refreshDeliverySettings = useCallback(async () => {
    try {
      const settings = await orderService.fetchDeliverySettings();
      setDeliverySettings(settings);
    } catch (e) {
      console.warn('Could not load delivery settings, using defaults', e);
      setDeliverySettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    refreshDeliverySettings();
  }, [refreshDeliverySettings]);

  // Total count of distinct items or sum of quantities
  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Subtotal calculated strictly from items & valid product prices
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  }, [items]);

  // Business Rules for Delivery Fee:
  // - Subtotal >= freeDeliveryThreshold (default ₹199) => FREE delivery (₹0)
  // - Subtotal < freeDeliveryThreshold => deliveryFee (default ₹50)
  // - Empty cart => ₹0
  // - deliveryEnabled === false => ₹0
  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (!deliverySettings.deliveryEnabled) return 0;
    if (subtotal >= deliverySettings.freeDeliveryThreshold) return 0;
    return deliverySettings.deliveryFee;
  }, [subtotal, deliverySettings]);

  const grandTotal = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  const freeDeliveryThreshold = deliverySettings.freeDeliveryThreshold;
  const amountNeededForFreeDelivery = useMemo(() => {
    if (subtotal >= freeDeliveryThreshold || subtotal === 0) return 0;
    return Math.max(0, freeDeliveryThreshold - subtotal);
  }, [subtotal, freeDeliveryThreshold]);

  // Cart operations (any cart alteration resets active checkout attempt)
  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (quantity <= 0) return;
    clearActiveCheckoutAttempt();
    setItems(prev => {
      const idx = prev.findIndex(it => it.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + quantity
        };
        return next;
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    clearActiveCheckoutAttempt();
    setItems(prev => {
      if (quantity <= 0) {
        return prev.filter(it => it.product.id !== productId);
      }
      return prev.map(it => it.product.id === productId ? { ...it, quantity } : it);
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    clearActiveCheckoutAttempt();
    setItems(prev => prev.filter(it => it.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    clearActiveCheckoutAttempt();
    setItems([]);
  }, []);

  const abandonCheckout = useCallback(() => {
    clearActiveCheckoutAttempt();
    setCheckoutStep('cart');
  }, []);

  const handleSetCheckoutStep = useCallback((step: 'cart' | 'checkout' | 'success') => {
    if (step === 'cart') {
      clearActiveCheckoutAttempt();
    }
    setCheckoutStep(step);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    setCheckoutStep('cart');
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Place Guest Order securely with server-side validation & idempotency
  const placeGuestOrder = useCallback(async (guestData: GuestCheckoutData): Promise<{
    success: boolean;
    orderNumber?: string;
    error?: string;
  }> => {
    if (items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items before checking out.' };
    }

    if (!deliverySettings.deliveryEnabled) {
      return {
        success: false,
        error: 'Online delivery is currently disabled. Please contact the store directly via WhatsApp or phone.'
      };
    }

    setIsSubmittingOrder(true);
    try {
      // 1. Compute cart signature to identify this specific order payload
      const cartSignature = items
        .map(it => `${it.product.id}:${it.quantity}`)
        .sort()
        .join('|');

      // 2. Retrieve or generate the exact same idempotency key and retry secret for this checkout attempt
      let idempotencyKey = '';
      let retrySecret = '';

      try {
        const storedJson = sessionStorage.getItem(ACTIVE_CHECKOUT_ATTEMPT_KEY);
        if (storedJson) {
          const stored: ActiveCheckoutAttempt = JSON.parse(storedJson);
          if (
            stored &&
            stored.cartSignature === cartSignature &&
            stored.idempotencyKey &&
            stored.retrySecret
          ) {
            idempotencyKey = stored.idempotencyKey;
            retrySecret = stored.retrySecret;
          }
        }
      } catch (e) {
        console.warn('Could not read checkout attempt from sessionStorage', e);
      }

      // Generate only once per distinct checkout attempt and persist across retries/reloads
      if (!idempotencyKey || !retrySecret) {
        idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
          ? `guest_${crypto.randomUUID()}`
          : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}`;

        retrySecret = typeof crypto !== 'undefined' && crypto.randomUUID
          ? `sec_${crypto.randomUUID()}`
          : `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

        try {
          sessionStorage.setItem(
            ACTIVE_CHECKOUT_ATTEMPT_KEY,
            JSON.stringify({ idempotencyKey, retrySecret, cartSignature })
          );
        } catch (e) {
          console.warn('Could not persist checkout attempt to sessionStorage', e);
        }
      }

      const orderPayloadItems = items.map(it => ({
        productId: it.product.id,
        quantity: it.quantity
      }));

      const res = await orderService.createGuestOrderSecure(guestData, orderPayloadItems, idempotencyKey, retrySecret);

      if (res.error || !res.data) {
        setIsSubmittingOrder(false);
        return { success: false, error: res.error || 'Failed to place order.' };
      }

      const confirmedData = res.data;

      // Construct localized Order object for immediate UI presentation
      const placedOrder: Order = {
        id: confirmedData.orderId,
        orderNumber: confirmedData.orderNumber,
        customerId: null,
        customerName: guestData.fullName.trim(),
        customerPhone: guestData.phone.trim(),
        customerEmail: guestData.email?.trim() || null,
        deliveryLocation: `${guestData.deliveryAddress.trim()}, ${guestData.villageTown.trim()} - ${guestData.pincode.trim()}`,
        villageTown: guestData.villageTown.trim(),
        pincode: guestData.pincode.trim(),
        landmark: guestData.landmark?.trim() || null,
        deliveryInstructions: guestData.deliveryInstructions?.trim() || null,
        idempotencyKey,
        guestAccessToken: confirmedData.guestAccessToken || null,
        orderSource: 'web',
        status: 'pending',
        paymentMethod: guestData.paymentMethod || 'cash_on_delivery',
        paymentStatus: 'pending',
        subtotal: confirmedData.subtotal,
        deliveryCharge: confirmedData.deliveryCharge,
        discount: 0,
        totalAmount: confirmedData.totalAmount,
        notes: guestData.deliveryInstructions || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: items.map(it => ({
          id: `item_${it.product.id}`,
          orderId: confirmedData.orderId,
          productId: it.product.id,
          productNameEn: it.product.name.en,
          productNameTe: it.product.name.te || null,
          brand: it.product.brand || null,
          packSize: it.product.packSize || null,
          quantity: it.quantity,
          unitPrice: it.product.price || 0,
          totalPrice: (it.product.price || 0) * it.quantity,
          createdAt: new Date().toISOString()
        }))
      };

      // Save order in localStorage so the guest customer can track it under the Orders tab
      try {
        const stored = localStorage.getItem(GUEST_ORDERS_KEY);
        const prevOrders = stored ? JSON.parse(stored) : [];
        localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify([placedOrder, ...prevOrders]));
      } catch (e) {
        console.warn('Could not store guest order in localStorage', e);
      }

      // Order successfully confirmed: clear active checkout attempt credentials
      clearActiveCheckoutAttempt();

      setLastPlacedOrder(placedOrder);
      clearCart();
      setCheckoutStep('success');
      setIsSubmittingOrder(false);

      return { success: true, orderNumber: confirmedData.orderNumber };
    } catch (err: any) {
      setIsSubmittingOrder(false);
      return { success: false, error: err.message || 'An unexpected error occurred while placing the order.' };
    }
  }, [items, deliverySettings, clearCart]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemCount,
    subtotal,
    deliverySettings,
    deliveryFee,
    grandTotal,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    isCartOpen,
    openCart,
    closeCart,
    abandonCheckout,
    checkoutStep,
    setCheckoutStep: handleSetCheckoutStep,
    lastPlacedOrder,
    setLastPlacedOrder,
    refreshDeliverySettings,
    placeGuestOrder,
    isSubmittingOrder
  }), [
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    abandonCheckout,
    totalItemCount,
    subtotal,
    deliverySettings,
    deliveryFee,
    grandTotal,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    isCartOpen,
    openCart,
    closeCart,
    checkoutStep,
    handleSetCheckoutStep,
    lastPlacedOrder,
    refreshDeliverySettings,
    placeGuestOrder,
    isSubmittingOrder
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
