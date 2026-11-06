import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  ArrowRight,
  Banknote,
  MapPin,
  Phone,
} from 'lucide-react';
import { useBoutique } from '../context/BoutiqueContext';
import {
  buildOrderWhatsAppMessage,
  buildOrderWhatsAppUrl,
  formatPriceDT,
} from '../utils/whatsapp';

export default function OrderConfirmationPage() {
  const { ref } = useParams();
  const { orders, fetchOrderByReference, settings, showToast } = useBoutique();
  const [copied, setCopied] = useState(false);

  const cachedOrder = orders.find((o) => o.reference === ref) || null;
  const [serverOrder, setServerOrder] = useState(null);
  const [fetchedRef, setFetchedRef] = useState('');

  useEffect(() => {
    let mounted = true;
    if (cachedOrder) return;

    fetchOrderByReference(ref)
      .then((found) => {
        if (mounted) {
          setServerOrder(found);
          setFetchedRef(ref);
        }
      })
      .catch(() => {
        if (mounted) {
          setServerOrder(null);
          setFetchedRef(ref);
        }
      });
    return () => {
      mounted = false;
    };
  }, [ref, cachedOrder, fetchOrderByReference]);

  const order = cachedOrder || (fetchedRef === ref ? serverOrder : null);
  const loading = !cachedOrder && fetchedRef !== ref;

  if (loading) {
    return (
      <div className="min-h-screen pt-36 px-4 text-center">
        <div className="max-w-md mx-auto surface-ivory-card p-10">
          <p className="font-serif text-2xl font-medium text-[#1A1210]">
            Chargement de votre commande...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-36 px-4 text-center animate-page-enter">
        <div className="max-w-lg mx-auto surface-ivory-card p-12">
          <h1 className="font-serif text-4xl font-medium text-[#1A1210]">Commande introuvable</h1>
          <p className="text-xs font-normal text-[#2F2421] mt-3">
            Aucune commande ne correspond à la référence « {ref} ».
          </p>
          <Link to="/catalogue" className="mt-7 btn-atelier-dark">
            Retourner à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const waUrl = buildOrderWhatsAppUrl(order, settings.whatsappNumber, settings.boutiqueName);
  const waMessage = buildOrderWhatsAppMessage(order, settings.boutiqueName);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(waMessage);
      setCopied(true);
      showToast('Récapitulatif copié dans le presse-papiers.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Référence : ' + order.reference);
    }
  };

  return (
    <div className="min-h-screen pt-[94px] sm:pt-[108px] pb-24 animate-page-enter">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <div className="surface-ivory-card p-7 sm:p-11">
          <div className="flex flex-col items-center text-center pb-9 border-b border-[#EAE0D8]">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF4EE] border border-[#BCDACA] flex items-center justify-center text-[#285A39] mb-5">
              <CheckCircle2 className="w-7 h-7" strokeWidth={1.7} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#7A4444] font-bold">
              Confirmation de commande
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#1A1210] mt-1.5">
              Merci,{' '}
              <em className="italic font-normal text-[#7A4444]">{order.customer.fullName}</em>
            </h1>
            <p className="text-xs sm:text-[13.5px] font-normal text-[#2F2421] mt-3.5 max-w-lg leading-[1.8]">
              Votre commande a bien été enregistrée sur le serveur de{' '}
              <strong className="font-bold text-[#1A1210]">{settings.boutiqueName}</strong>. Pour
              accélérer la préparation et l’expédition vers {order.customer.cityName}, transmettez
              le récapitulatif ci-dessous sur notre WhatsApp.
            </p>

            <div className="mt-6 px-6 py-2.5 rounded-full bg-[#F7EFE9] border border-[#DECFC5] text-[#1A1210] text-[11px] uppercase tracking-[0.22em] font-semibold">
              Référence · <strong className="text-[#7A4444] font-bold">{order.reference}</strong>
            </div>
          </div>

          {/* Primary WhatsApp CTA */}
          <div className="py-6 border-b border-[#EAE0D8] flex flex-col sm:flex-row gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-atelier-dark flex-1"
            >
              <MessageCircle className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
              <span>Envoyer sur WhatsApp ({settings.whatsappNumber})</span>
            </a>

            <button type="button" onClick={handleCopySummary} className="btn-atelier-outline-dark">
              {copied ? <Check className="w-4 h-4 text-[#285A39]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié' : 'Copier le résumé'}</span>
            </button>
          </div>

          {/* Order Items & Totals */}
          <div className="py-6 border-b border-[#EAE0D8] space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
              Détail des créations
            </h2>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-[#F3ECE6] photo-atelier-harmonized"
                  />
                  <div>
                    <p className="font-serif text-xl font-medium text-[#1A1210]">{item.name}</p>
                    <p className="text-xs font-normal text-[#2F2421]">
                      Quantité : <strong className="font-semibold">{item.quantity}</strong> ×{' '}
                      {formatPriceDT(item.price)}
                    </p>
                  </div>
                </div>
                <span className="font-serif text-lg font-bold text-[#1A1210]">
                  {formatPriceDT(item.price * item.quantity)}
                </span>
              </div>
            ))}

            <div className="pt-4 border-t border-[#EAE0D8] space-y-1.5 text-xs">
              <div className="flex justify-between font-normal text-[#2F2421]">
                <span>Sous-total</span>
                <span className="font-semibold text-[#1A1210]">{formatPriceDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-normal text-[#2F2421]">
                <span>Livraison ({order.customer.cityName})</span>
                <span className="font-semibold text-[#1A1210]">
                  {order.deliveryFee === 0 ? 'Offerte' : formatPriceDT(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2.5 font-bold text-sm text-[#1A1210]">
                <span>Total à régler ({order.paymentMethod})</span>
                <span className="font-serif text-2xl">{formatPriceDT(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Coordinates & Next Steps */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-normal text-[#2F2421]">
            <div className="space-y-2.5">
              <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
                Lieu de livraison
              </h3>
              <p className="flex items-center gap-2 font-medium text-[#1A1210]">
                <Phone className="w-3.5 h-3.5 text-[#7A4444]" strokeWidth={1.8} />
                <span>{order.customer.phone}</span>
              </p>
              <p className="flex items-start gap-2 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#7A4444] shrink-0 mt-0.5" strokeWidth={1.8} />
                <span>
                  <strong className="font-semibold text-[#1A1210]">
                    {order.customer.cityName}
                  </strong>
                  {order.customer.neighborhood ? ` — ${order.customer.neighborhood}` : ''}
                  <br />
                  {order.customer.address}
                </span>
              </p>
              <p className="flex items-center gap-2 font-medium text-[#1A1210]">
                <Banknote className="w-3.5 h-3.5 text-[#285A39]" strokeWidth={1.8} />
                <span>{order.paymentMethod}</span>
              </p>
            </div>

            <div className="space-y-2 rounded-2xl bg-[#FAF5F0] p-5 border border-[#E2D2C7]">
              <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#1A1210] font-bold">
                Prochaines étapes
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-[#2F2421] leading-[1.75]">
                <li>Vérification de votre commande ({order.reference}).</li>
                <li>Confirmation téléphonique ou WhatsApp du créneau.</li>
                <li>Règlement de {formatPriceDT(order.total)} en espèces à la remise.</li>
              </ol>
            </div>
          </div>

          <div className="mt-9 pt-6 border-t border-[#EAE0D8] text-center">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#1A1210] hover:text-[#7A4444] font-bold transition-colors"
            >
              <span>Poursuivre ma visite</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
