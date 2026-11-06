import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BoutiqueProvider } from './context/BoutiqueContext';
import FixedSakuraBackdrop from './components/FixedSakuraBackdrop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import {
  SearchModal,
  ShareModal,
  DirectWhatsAppModal,
  ToastBanner,
  FloatingWhatsAppButton,
} from './components/Modals';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import MaisonPage from './pages/MaisonPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <BoutiqueProvider>
        <ScrollToTop />
        <div className="relative min-h-screen flex flex-col text-[#2B211E]">
          {/* Viewport-locked Sakura Chinoiserie Background — stays 100% fixed & intact on all pages & scroll */}
          <FixedSakuraBackdrop />

          <Navbar />

          <main className="relative z-10 flex-1 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/maison" element={<MaisonPage />} />
              <Route path="/parfum/:id" element={<ProductDetailPage />} />
              <Route path="/commande" element={<CheckoutPage />} />
              <Route path="/confirmation/:ref" element={<OrderConfirmationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/vendeur" element={<AdminPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Luxury Drawers & Modals */}
          <CartDrawer />
          <SearchModal />
          <ShareModal />
          <DirectWhatsAppModal />
          <FloatingWhatsAppButton />
          <ToastBanner />
        </div>
      </BoutiqueProvider>
    </BrowserRouter>
  );
}
