import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, ArrowUpRight } from 'lucide-react';
import { formatPriceDT } from '../utils/whatsapp';
import { useBoutique } from '../context/BoutiqueContext';
import { LuxuryImage } from './Motion';

export default function ProductCard({ product }) {
  const { addToCart, setDirectWaProduct } = useBoutique();

  const mainPhoto = product.photos?.[0] || '/images/p1.jpg';
  const hoverPhoto = product.photos?.[1] || mainPhoto;
  const isOut = !product.available || Number(product.stock) <= 0;
  const isLowStock = !isOut && Number(product.stock) <= 3;

  return (
    <article className="group flex flex-col rounded-[22px] bg-[#FCFAF8] border border-[#EDE0D8] p-3 shadow-[0_18px_44px_-16px_rgba(20,14,13,0.34)] hover:border-[#DFB9B2] hover:shadow-[0_26px_56px_-14px_rgba(20,14,13,0.44)] hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
      {/* Harmonized Rounded Studio Frame */}
      <Link
        to={`/parfum/${product.id}`}
        className="relative aspect-[4/4.2] w-full rounded-[16px] overflow-hidden block bg-[#F3ECE6]"
      >
        <LuxuryImage
          src={mainPhoto}
          hoverSrc={hoverPhoto}
          alt={product.name}
          rounded="rounded-[16px]"
          className="w-full h-full"
        />

        {/* Crisp High-Contrast Pill Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none z-10">
          <div className="flex flex-col gap-1.5">
            <span className="px-3 py-1 rounded-full bg-[#FCFAF8]/95 backdrop-blur-md text-[#1E1614] border border-[#E8DAD2] shadow-sm text-[9.5px] uppercase tracking-[0.2em] font-semibold">
              {product.category}
            </span>
            {product.isNew && !isOut && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#241B19] text-[#F5DCD7] text-[8.5px] font-semibold uppercase tracking-[0.2em] w-fit shadow-sm">
                Nouveau
              </span>
            )}
          </div>

          {isOut ? (
            <span className="px-3 py-1 rounded-full bg-[#4A2E2D] text-[#FCECE9] text-[9px] uppercase tracking-[0.18em] font-medium shadow-sm">
              Épuisé
            </span>
          ) : isLowStock ? (
            <span className="px-3 py-1 rounded-full bg-[#FCFAF8]/95 text-[#7D4B4B] border border-[#DFB9B2] text-[9px] uppercase tracking-[0.15em] font-semibold shadow-sm">
              Stock limité ({product.stock})
            </span>
          ) : null}
        </div>

        {/* Floating Discover Pill on Hover */}
        <div className="absolute right-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hidden sm:flex pointer-events-none z-10">
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#FCFAF8]/95 backdrop-blur-md text-[#1E1614] shadow-md text-[9.5px] uppercase tracking-[0.18em] font-semibold">
            Découvrir
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7D4B4B]" />
          </span>
        </div>
      </Link>

      {/* High-Contrast, Crisp Typography & Controls */}
      <div className="px-2.5 pt-4 pb-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#7D4B4B] font-semibold truncate">
              {product.subtitle || 'Eau de Parfum'}
            </span>
            {product.volume && (
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#F2E9E2] text-[#4A3B38] text-[9.5px] font-medium tracking-wider uppercase">
                {product.volume}
              </span>
            )}
          </div>

          <Link to={`/parfum/${product.id}`} className="block mt-2">
            <h3 className="font-serif text-[23px] sm:text-[24px] font-medium text-[#1E1614] group-hover:text-[#7D4B4B] leading-snug transition-colors duration-300">
              {product.name}
            </h3>
          </Link>

          {product.notes && (
            <p className="text-[12px] font-normal text-[#524340] mt-1.5 line-clamp-1 leading-relaxed">
              {product.notes}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#EAE0D8]">
          {/* Price & Availability */}
          <div className="flex items-center justify-between mb-3.5">
            <span className="font-serif text-[25px] font-semibold tracking-tight text-[#1E1614]">
              {formatPriceDT(product.price)}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] uppercase tracking-[0.14em] font-semibold ${
                isOut
                  ? 'bg-[#F9EBEB] text-[#8E4646]'
                  : 'bg-[#EBF4EE] text-[#2D6340]'
              }`}
            >
              {isOut ? 'Indisponible' : `En stock · ${product.stock}`}
            </span>
          </div>

          {/* Harmonized Rounded Action Duo */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              disabled={isOut}
              onClick={() => addToCart(product, 1, true)}
              className={`h-[42px] px-4 rounded-xl text-[10px] uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                isOut
                  ? 'bg-[#EDE6E0] text-[#968681] cursor-not-allowed'
                  : 'bg-[#241B19] text-[#FCFAF8] hover:bg-[#7D4B4B] hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" strokeWidth={1.7} />
              <span>Ajouter</span>
            </button>

            <button
              type="button"
              disabled={isOut}
              onClick={() => setDirectWaProduct({ product, quantity: 1 })}
              title="Commande directe par WhatsApp (Règlement en espèces)"
              className={`h-[42px] px-3.5 rounded-xl border flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 ${
                isOut
                  ? 'border-[#E6DDD6] text-[#B5A6A1] cursor-not-allowed'
                  : 'border-[#DCCBC0] text-[#241B19] bg-[#F6EFE9] hover:bg-[#ECCBC5]/60 hover:border-[#B88B84]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-[#2D6340]" strokeWidth={1.8} />
              <span className="hidden xl:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
