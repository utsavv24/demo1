/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { 
  testConnection, 
  seedInitialProductsIfNeeded, 
  INITIAL_PRODUCTS, 
  db, 
  COLLECTIONS 
} from './lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { Product, ProductCategory } from './types/pharmacy';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { OrdersView } from './components/OrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

function PharmacyAppContent() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'admin'>('home');

  // Load products from Firestore and seed if empty
  const loadProducts = async () => {
    try {
      const items = await seedInitialProductsIfNeeded();
      if (items && items.length > 0) {
        setProducts(items);
      }
    } catch (err) {
      console.warn('Error loading products from Firestore:', err);
    }
  };

  useEffect(() => {
    // 1. Test connection to Firestore on app startup
    testConnection();

    // 2. Fetch and seed catalog
    loadProducts();

    // 3. Attach snapshot listener to keep products live
    try {
      const unsubscribe = onSnapshot(
        collection(db, COLLECTIONS.PRODUCTS),
        (snapshot) => {
          if (!snapshot.empty) {
            const updated = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(updated);
          }
        },
        (error) => {
          console.warn('Products live snapshot warning (using initial catalog):', error.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Snapshot listener skipped:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Main Navbar */}
      <Navbar
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            onBackToHome={() => setCurrentView('home')}
            onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBackToHome={() => setCurrentView('home')}
            onRefreshProducts={loadProducts}
            products={products}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
        setCurrentView={setCurrentView}
      />

      {/* Global Interactive Modals & Slide-overs */}
      <CartDrawer
        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
        onViewOrders={() => setCurrentView('orders')}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />

      <AuthModal />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PharmacyAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
