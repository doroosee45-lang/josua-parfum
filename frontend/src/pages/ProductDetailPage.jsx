import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingBag,
  MessageCircle,
  Share2,
  ChevronLeft,
  Plus,
  Minus,
  Banknote,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useBoutique } from '../context/BoutiqueContext';
import { formatPriceDT } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';
import { EditorialHeader, Reveal, LuxuryImage } from '../components/Motion';

export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }) {
  const {
    publicProducts,
    addToCart,
    setDirectWaProduct,
    setShareModalPayload,
    settings,
  } = useBoutique();

  const product = publicProducts.find((p) => p.id === id);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen pt-36 px-4 text-center animate-page-enter">
        <div className="max-w-lg mx-auto surface-ivory-card p-12">
          <h1 className="font-serif text-4xl font-medium text-[#1A1210]">Création introuvable</h1>
          <p className="text-xs font-normal text-[#2F2421] mt-3">
            Ce flacon n’est plus disponible ou a été déplacé dans notre collection.
          </p>
          <Link to="/catalogue" className="mt-7 btn-atelier-dark">
            Retourner à la collection
          </Link>
        </div>
      </div>
    );
  }

  const photos = product.photos?.length > 0 ? product.photos : ['/images/p1.jpg'];
  const activePhoto = photos[selectedImageIdx] || photos[0];
  const isOut = !product.available || Number(product.stock) <= 0;
  const maxStock = Math.max(1, Number(product.stock) || 1);

  const related = publicProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-[84px] sm:pt-[96px] pb-24 animate-page-enter">
      {/* High-Contrast Breadcrumb Floating Over Fixed Sakura Backdrop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-5 flex items-center justify-between text-[10.5px] uppercase tracking-[0.2em] text-white">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E1614]/90 backdrop-blur-md border border-white/25 font-semibold hover:bg-white hover:text-[#1A1210] shadow-sm transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          Retour à la collection
        </Link>
        <span className="hidden sm:inline px-4 py-2 rounded-full bg-[#1E1614]/85 backdrop-blur-md border border-white/20 text-[#FADCD6] font-semibold">
          {product.category} · {product.name}
        </span>
      </div>

      {/* Main Product Opaque Ivory Showcase Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="surface-ivory-card p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Rounded Luminous Studio Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-2.5 rounded-[22px] bg-[#FAF6F2] border border-[#E6D7CE] shadow-sm">
              <div className="relative aspect-square rounded-[16px] overflow-hidden group">
                <LuxuryImage
                  key={activePhoto}
                  src={activePhoto}
                  alt={product.name}
                  rounded="rounded-[16px]"
                  className="w-full h-full"
                />
                {product.isNew && !isOut && (
                  <span className="absolute top-4 left-4 z-10 px-3.5 py-1 rounded-full bg-[#1E1614] text-[#FADCD6] shadow-md text-[9.5px] font-bold uppercase tracking-[0.2em]">
                    Nouveauté
                  </span>
                )}
              </div>
            </div>

            {photos.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {photos.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-20 shrink-0 rounded-2xl p-1 bg-white overflow-hidden border-2 transition-all duration-300 ${
                      idx === selectedImageIdx
                        ? 'border-[#7A4444] shadow-md'
                        : 'border-[#E6D7CE] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full rounded-xl object-cover photo-atelier-harmonized"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: High-Contrast Editorial Details & Order Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#F5ECE5] text-[#7A4444] border border-[#DFCFC4] text-[10px] uppercase tracking-[0.2em] font-bold">
                  {product.category}
                </span>
                {product.volume && (
                  <span className="px-3.5 py-1 rounded-full border border-[#D4C2B7] bg-white text-[#2F2421] text-[10px] uppercase tracking-[0.18em] font-semibold">
                    {product.volume}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setShareModalPayload({
                    url: window.location.href,
                    title: `${product.name} (${formatPriceDT(product.price)}) — ${settings.boutiqueName}`,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF6F2] border border-[#D4C2B7] text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[#1A1210] hover:text-[#7A4444] hover:border-[#7A4444] transition-all"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                Partager
              </button>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
                {product.subtitle || 'Eau de Parfum'}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#1A1210] mt-1.5 leading-[1.08]">
                {product.name}
              </h1>
            </div>

            {/* Price & Availability */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 border-b border-[#E6D7CE]">
              <div>
                <span className="font-serif text-4xl font-bold text-[#1A1210]">
                  {formatPriceDT(product.price)}
                </span>
                <span className="block text-xs font-normal text-[#3B2E2B] mt-1">
                  Tarif fixé par la Maison · Règlement en espèces à la livraison
                </span>
              </div>

              <div>
                {isOut ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F9EBEB] border border-[#DFB9B9] text-[#8E3B3B] text-[10.5px] uppercase tracking-[0.16em] font-bold">
                    Momentanément épuisé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF4EE] border border-[#BCDACA] text-[#265938] text-[10.5px] uppercase tracking-[0.16em] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.9} />
                    En stock ({product.stock})
                  </span>
                )}
              </div>
            </div>

            {/* Olfactory Notes */}
            {product.notes && (
              <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E2D2C7]">
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#7A4444] flex items-center gap-2 font-bold">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Architecture Olfactive
                </p>
                <p className="font-serif text-xl font-medium text-[#1A1210] mt-1.5">
                  {product.notes}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#2B201D] font-bold mb-2">
                L’Inspiration
              </h3>
              <p className="text-[14px] font-normal text-[#2F2421] leading-[1.85] whitespace-pre-line">
                {product.description || 'Une création raffinée signée JOSHUA PARFUM.'}
              </p>
            </div>

            {/* Quantity & CTAs */}
            {!isOut && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#2B201D] font-bold">
                    Quantité
                  </span>
                  <div className="inline-flex items-center rounded-xl border border-[#CFAFA3] bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 text-[#1A1210] hover:bg-[#F7F0EA] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-5 text-xs font-bold text-[#1A1210]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      disabled={quantity >= maxStock}
                      className="p-2.5 text-[#1A1210] hover:bg-[#F7F0EA] disabled:opacity-35 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => addToCart(product, quantity, true)}
                    className="btn-atelier-dark w-full"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
                    <span>Ajouter au panier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectWaProduct({ product, quantity })}
                    className="btn-atelier-outline-dark w-full"
                  >
                    <MessageCircle className="w-4 h-4 text-[#285A39]" strokeWidth={1.9} />
                    <span>Commande WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reassurance Card */}
            <div className="p-5 rounded-2xl bg-[#FAF6F2] border border-[#E2D2C7] space-y-3.5 text-xs font-normal text-[#2F2421]">
              <div className="flex items-start gap-3">
                <Banknote className="w-4 h-4 text-[#7A4444] shrink-0 mt-0.5" strokeWidth={1.8} />
                <div>
                  <strong className="text-[#1A1210] font-bold block text-[11px] uppercase tracking-[0.16em]">
                    Règlement en espèces à la réception
                  </strong>
                  <span className="mt-0.5 block leading-relaxed">
                    Aucun paiement anticipé requis. Vous réglez en Dinars Tunisiens à la livraison.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#E6D7CE]">
                <MapPin className="w-4 h-4 text-[#7A4444] shrink-0 mt-0.5" strokeWidth={1.8} />
                <div>
                  <strong className="text-[#1A1210] font-bold block text-[11px] uppercase tracking-[0.16em]">
                    Livraison Jendouba & régions voisines
                  </strong>
                  <span className="mt-0.5 block leading-relaxed">
                    Jendouba Centre, Bou Salem, Tabarka, Aïn Draham, Ghardimaou, Fernana et
                    alentours · {settings.whatsappNumber}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Fragrances */}
        {related.length > 0 && (
          <div className="mt-20 pt-6">
            <EditorialHeader
              eyebrow="Dans le même esprit"
              title="Autres créations"
              italicAccent={product.category}
              align="left"
              theme="sakura"
              className="mb-10"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              {related.map((item, idx) => (
                <Reveal key={item.id} delay={idx * 60}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
