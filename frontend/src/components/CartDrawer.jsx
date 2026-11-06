import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Banknote,
  MessageCircle,
} from 'lucide-react';
import { useBoutique } from '../context/BoutiqueContext';
import { formatPriceDT } from '../utils/whatsapp';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    isCartOpen,
    setIsCartOpen,
    detailedCartItems,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    settings,
  } = useBoutique();

  if (!isCartOpen) return null;

  const freeThreshold = Number(settings.freeDeliveryThreshold) || 0;
  const remainingForFree =
    settings.freeDeliveryEnabled && freeThreshold > 0
      ? Math.max(0, freeThreshold - cartSubtotal)
      : null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div
        className="fixed inset-0 bg-[#1A1210]/55 backdrop-blur-sm animate-backdrop"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Opaque Ivory Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white text-[#1A1210] h-full flex flex-col rounded-l-3xl shadow-2xl border-l border-[#E2D2C7] overflow-hidden animate-drawer-right">
        {/* Header */}
        <div className="px-6 py-5 bg-[#F7F1EB] text-[#1A1210] flex items-center justify-between border-b border-[#E6D7CE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white border border-[#DCCAC0] flex items-center justify-center text-[#7A4444]">
              <ShoppingBag className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <h2 className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#1A1210]">
              Votre Sélection ({detailedCartItems.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full text-[#2B201D] hover:bg-white transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {remainingForFree !== null && detailedCartItems.length > 0 && (
          <div className="px-6 py-3 bg-[#FAF5F0] border-b border-[#EAE0D8] text-xs font-normal text-[#2F2421]">
            {remainingForFree === 0 ? (
              <p className="font-semibold text-[#285A39]">
                ✦ Vous bénéficiez de la livraison offerte à Jendouba et communes voisines.
              </p>
            ) : (
              <p>
                Ajoutez{' '}
                <strong className="font-bold text-[#7A4444]">
                  {formatPriceDT(remainingForFree)}
                </strong>{' '}
                pour bénéficier de la livraison offerte.
              </p>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {detailedCartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F1EB] border border-[#E2D2C7] flex items-center justify-center text-[#7A4444] mb-5">
                <ShoppingBag className="w-6 h-6" strokeWidth={1.6} />
              </div>
              <p className="font-serif text-3xl text-[#1A1210] font-medium">Votre panier est vide</p>
              <p className="text-xs font-normal text-[#3B2E2B] mt-2.5 max-w-xs leading-[1.8]">
                Découvrez nos sillages pour Elle, pour Lui et Mixtes, livrés avec règlement en
                espèces à la réception.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/catalogue');
                }}
                className="mt-7 btn-atelier-dark"
              >
                Explorer la collection
              </button>
            </div>
          ) : (
            detailedCartItems.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-3.5 rounded-2xl bg-[#FCFAF8] border border-[#E6D7CE] shadow-sm"
              >
                <Link
                  to={`/parfum/${item.productId}`}
                  onClick={() => setIsCartOpen(false)}
                  className="w-20 h-20 shrink-0 rounded-xl bg-[#F3ECE6] overflow-hidden border border-[#E6D7CE]"
                >
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-full object-cover photo-atelier-harmonized"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/parfum/${item.productId}`}
                        onClick={() => setIsCartOpen(false)}
                        className="font-serif text-xl font-medium text-[#1A1210] hover:text-[#7A4444] leading-tight transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[#5C4B47] hover:text-[#7A4444] p-1 transition-colors"
                        title="Retirer"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </button>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A4444] font-semibold mt-0.5">
                      {item.category} {item.volume ? `· ${item.volume}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center rounded-lg border border-[#D4C2B7] bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 text-[#1A1210] hover:bg-[#F5EDE7] transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#1A1210]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1.5 text-[#1A1210] hover:bg-[#F5EDE7] disabled:opacity-35 transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-xl font-semibold text-[#1A1210]">
                      {formatPriceDT(item.lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout CTA */}
        {detailedCartItems.length > 0 && (
          <div className="p-6 bg-[#F7F1EB] border-t border-[#E6D7CE] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-normal text-[#3B2E2B]">
                <span>Livraison (Jendouba & communes)</span>
                <span>Selon commune choisie</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#1A1210]">
                  Sous-total
                </span>
                <span className="font-serif text-2xl font-semibold text-[#1A1210]">
                  {formatPriceDT(cartSubtotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[11.5px] font-medium text-[#2F2421] bg-white rounded-xl px-3.5 py-2.5 border border-[#DECFC5]">
              <Banknote className="w-4 h-4 text-[#285A39] shrink-0" strokeWidth={1.8} />
              <span>Règlement en espèces à la livraison · Suivi direct WhatsApp</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/commande');
              }}
              className="btn-atelier-dark w-full"
            >
              <MessageCircle className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
              <span>Finaliser la commande</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.7} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
