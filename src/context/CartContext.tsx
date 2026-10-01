import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderItem } from '../types/pharmacy';
import { db, COLLECTIONS } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  prescriptionUrl: string | null;
  setPrescriptionUrl: (url: string | null) => void;
  totalItems: number;
  subtotal: number;
  savings: number;
  hasRxItems: boolean;
  isRxSatisfied: boolean;
  checkout: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
  }) => Promise<Order>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kashyap_pharmacy_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPrescriptionUrl(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.product.discountPrice ?? item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);

  const regularTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const savings = Math.max(0, regularTotal - subtotal);

  const hasRxItems = cart.some((item) => item.product.isRxRequired);
  const isRxSatisfied = !hasRxItems || (hasRxItems && Boolean(prescriptionUrl));

  const checkout = async (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
  }): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Your cart is empty');
    }
    if (hasRxItems && !prescriptionUrl) {
      throw new Error('Prescription upload required for Rx medicines in cart');
    }

    const orderId = `KP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = userProfile?.uid || 'guest-patient';

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.discountPrice ?? item.product.price,
      quantity: item.quantity,
      isRxRequired: item.product.isRxRequired,
      imageUrl: item.product.imageUrl
    }));

    const newOrder: Order = {
      orderId,
      userId,
      customerName: details.customerName,
      customerEmail: details.customerEmail,
      customerPhone: details.customerPhone,
      shippingAddress: details.shippingAddress,
      items: orderItems,
      totalAmount: Number(subtotal.toFixed(2)),
      status: 'Pending',
      prescriptionUrl: prescriptionUrl || undefined,
      isRxVerified: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTIONS.ORDERS, orderId), newOrder);
    } catch (err) {
      console.warn('Firestore order write error (persisting locally):', err);
      // Keep in local storage as a resilient fallback
      try {
        const localOrders = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
        localOrders.unshift(newOrder);
        localStorage.setItem('kashyap_local_orders', JSON.stringify(localOrders));
      } catch (storageErr) {
        console.error(storageErr);
      }
    }

    clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        prescriptionUrl,
        setPrescriptionUrl,
        totalItems,
        subtotal,
        savings,
        hasRxItems,
        isRxSatisfied,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
