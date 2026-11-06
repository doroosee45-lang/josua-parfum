import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Share2, Menu, X, MessageCircle } from 'lucide-react';
import JoshuaLogo from './JoshuaLogo';
import { useBoutique } from '../context/BoutiqueContext';
import { sanitizePhoneForWhatsApp } from '../utils/whatsapp';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    setShareModalPayload,
    isAdminAuthenticated,
    settings,
  } = useBoutique();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentSearch = new URLSearchParams(location.search);
  const activeCat = currentSearch.get('categorie');

  const navLinks = [
    {
      label: 'ACCUEIL',
      num: '01',
      to: '/',
      isActive: location.pathname === '/',
    },
    {
      label: 'COLLECTION',
      num: '02',
      to: '/catalogue',
      isActive: location.pathname === '/catalogue' && !activeCat,
    },
    {
      label: 'FEMME',
      num: '03',
      to: '/catalogue?categorie=Femme',
      isActive: location.pathname === '/catalogue' && activeCat === 'Femme',
    },
    {
      label: 'HOMME',
      num: '04',
      to: '/catalogue?categorie=Homme',
      isActive: location.pathname === '/catalogue' && activeCat === 'Homme',
    },
    {
      label: 'MIXTE',
      num: '05',
      to: '/catalogue?categorie=Mixte',
      isActive: location.pathname === '/catalogue' && activeCat === 'Mixte',
    },
    {
      label: 'MAISON',
      num: '06',
      to: '/maison',
      isActive: location.pathname === '/maison',
    },
    {
      label: 'CONTACT',
      num: '07',
      to: '/contact',
      isActive: location.pathname === '/contact',
    },
  ];

  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);

  const iconBtnClass =
    'p-2 rounded-full text-white hover:text-[#FADCD6] hover:bg-white/15 transition-all duration-300';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? 'bg-[#1E1614]/95 backdrop-blur-xl border-b border-[#F2D5CF]/25 shadow-[0_12px_36px_-14px_rgba(12,8,7,0.55)]'
            : 'bg-[#201715]/85 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-[74px] sm:h-[82px] flex items-center justify-between">
          {/* Left: Mobile Trigger + Brand Emblem */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden -ml-2 ${iconBtnClass}`}
              aria-label="Ouvrir la navigation"
            >
              <Menu className="w-5 h-5" strokeWidth={1.8} />
            </button>
            <Link to="/" className="flex items-center">
              <JoshuaLogo size="sm" subtitle="ATELIER" tone="light" />
            </Link>
          </div>

          {/* Center: High-Contrast Spaced Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`group relative py-2 text-[10.5px] xl:text-[11px] uppercase tracking-[0.22em] font-semibold transition-colors duration-300 ${
                  item.isActive
                    ? 'text-[#FADCD6]'
                    : 'text-white hover:text-[#FADCD6]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-[#FADCD6] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
                    item.isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right: Search, Share, Bag, Espace Vendeur */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={iconBtnClass}
              title="Rechercher un parfum"
              aria-label="Rechercher un parfum"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={() =>
                setShareModalPayload({
                  url: window.location.origin,
                  title: `${settings.boutiqueName} — ${settings.slogan}`,
                })
              }
              className={iconBtnClass}
              title="Partager la boutique"
              aria-label="Partager la boutique"
            >
              <Share2 className="w-[18px] h-[18px]" strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`relative ${iconBtnClass}`}
              title="Mon panier"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.7} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F3D1CA] text-[#1A1210] text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/vendeur')}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-full text-white hover:text-[#FADCD6] hover:bg-white/15 transition-all duration-300"
              title="Espace Vendeur"
              aria-label="Espace Vendeur"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.7} />
              {isAdminAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-[#6BC284] absolute top-1.5 right-1.5" />
              )}
              <span className="hidden xl:inline text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FADCD6]">
                Atelier
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Opaque Pure Ivory Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1A1210]/65 backdrop-blur-sm animate-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[85vw] max-w-sm bg-white border-r border-[#E6D7CE] h-full flex flex-col justify-between p-7 z-10 overflow-y-auto rounded-r-3xl shadow-2xl animate-drawer-left">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#EAE0D8]">
                <JoshuaLogo size="sm" subtitle="ATELIER" tone="dark" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full text-[#2B201D] hover:bg-[#F5EDE7] transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-6 space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-baseline justify-between py-3 px-3 rounded-xl border-b border-[#F2EAE3] transition-colors ${
                      item.isActive
                        ? 'text-[#7A4444] bg-[#F7EFE9] font-semibold'
                        : 'text-[#1A1210] hover:text-[#7A4444] font-medium'
                    }`}
                  >
                    <span className="font-serif text-2xl tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-[10.5px] tracking-[0.22em] font-semibold text-[#6E5A55]">
                      {item.num}
                    </span>
                  </Link>
                ))}

                <Link
                  to="/commande"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-baseline justify-between py-3 px-3 border-b border-[#F2EAE3] text-[#1A1210] hover:text-[#7A4444] font-medium"
                >
                  <span className="font-serif text-2xl tracking-wide">
                    PANIER ({cartCount})
                  </span>
                  <span className="text-[10.5px] tracking-[0.22em] font-semibold text-[#6E5A55]">
                    08
                  </span>
                </Link>

                <Link
                  to="/vendeur"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-baseline justify-between py-3 px-3 border-b border-[#F2EAE3] text-[#7A4444] hover:text-[#1A1210] font-semibold"
                >
                  <span className="font-serif text-2xl tracking-wide">
                    ESPACE VENDEUR
                  </span>
                  <span className="text-[10.5px] tracking-[0.22em] font-semibold text-[#7A4444]">
                    ADMIN
                  </span>
                </Link>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#7A4444]">
                Livraison Jendouba · Règlement en espèces
              </p>
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-atelier-dark w-full"
              >
                <MessageCircle className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
                <span>WhatsApp {settings.whatsappNumber}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
