import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Banknote,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useBoutique } from '../context/BoutiqueContext';
import {
  buildOrderWhatsAppUrl,
  buildQuickProductWhatsAppUrl,
  formatPriceDT,
  getSocialShareLinks,
  sanitizePhoneForWhatsApp,
} from '../utils/whatsapp';

export function SearchModal() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isSearchOpen, setIsSearchOpen, publicProducts } = useBoutique();

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();
  const results = q
    ? publicProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.notes || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    : publicProducts.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div
        className="fixed inset-0 bg-[#1A1210]/55 backdrop-blur-md animate-backdrop"
        onClick={() => setIsSearchOpen(false)}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white border border-[#E2D2C7] text-[#1A1210] shadow-2xl overflow-hidden animate-modal-up">
        <div className="p-5 bg-[#FAF6F2] border-b border-[#E6D7CE] flex items-center gap-3.5">
          <Search className="w-5 h-5 text-[#7A4444] shrink-0" strokeWidth={1.8} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un parfum, une note (oud, rose, jasmin), pour elle, pour lui..."
            className="w-full bg-transparent text-sm text-[#1A1210] placeholder:text-[#6E5D58] focus:outline-none font-normal"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-2 rounded-full text-[#2B201D] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#7A4444] font-bold mb-4">
            {q ? `Créations trouvées (${results.length})` : 'Signatures de la Maison'}
          </p>

          {results.length === 0 ? (
            <p className="text-xs font-normal text-[#3B2E2B] py-8 text-center">
              Aucune création ne correspond à « {query} ».
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {results.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setQuery('');
                    navigate(`/parfum/${prod.id}`);
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FCFAF8] border border-[#E6D7CE] hover:border-[#7A4444] hover:shadow-md text-left transition-all duration-300"
                >
                  <img
                    src={prod.photos?.[0] || '/images/p1.jpg'}
                    alt={prod.name}
                    className="w-[60px] h-[60px] rounded-xl object-cover shrink-0 bg-[#F3ECE6] photo-atelier-harmonized"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9.5px] uppercase tracking-[0.2em] text-[#7A4444] font-semibold">
                      {prod.category}
                    </span>
                    <p className="font-serif text-lg font-medium text-[#1A1210] truncate">
                      {prod.name}
                    </p>
                    <p className="text-xs text-[#2F2421] font-semibold">
                      {formatPriceDT(prod.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShareModal() {
  const [copied, setCopied] = useState(false);
  const { shareModalPayload, setShareModalPayload, showToast } = useBoutique();

  if (!shareModalPayload) return null;

  const links = getSocialShareLinks(shareModalPayload.url, shareModalPayload.title);

  const handleCopy = async (textToCopy, toastText = 'Lien copié avec succès.') => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast(toastText);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Copiez le lien affiché ci-dessous.');
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#1A1210]/55 backdrop-blur-sm animate-backdrop"
        onClick={() => setShareModalPayload(null)}
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-[#E2D2C7] text-[#1A1210] p-7 sm:p-8 shadow-2xl animate-modal-up">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#7A4444] font-bold">
              Partager l’adresse
            </p>
            <h3 className="font-serif text-3xl font-medium text-[#1A1210] mt-1">Joshua Parfum</h3>
          </div>
          <button
            type="button"
            onClick={() => setShareModalPayload(null)}
            className="p-2 rounded-full text-[#2B201D] hover:bg-[#F5EDE7] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        <p className="text-xs font-normal text-[#2F2421] leading-[1.75] mb-6">
          Invitez vos proches à découvrir la collection sur <strong>WhatsApp</strong>,{' '}
          <strong>Facebook</strong> ou <strong>TikTok</strong> :
        </p>

        <div className="space-y-2.5">
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-[#F5FAF7] border border-[#C6DFCF] text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center justify-between hover:border-[#285A39] transition-all"
          >
            <span className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-[#285A39]" strokeWidth={1.8} />
              Partager sur WhatsApp
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5C4B47]" />
          </a>

          <a
            href={links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-[#FCFAF8] border border-[#DECFC5] text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center justify-between hover:border-[#7A4444] transition-all"
          >
            <span className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-[#7A4444]" strokeWidth={1.8} />
              Partager sur Facebook
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5C4B47]" />
          </a>

          <button
            type="button"
            onClick={() =>
              handleCopy(
                links.tiktokText,
                'Présentation & lien copiés pour TikTok (Bio ou Story).'
              )
            }
            className="w-full py-3.5 px-4 rounded-xl bg-[#FCFAF8] border border-[#DECFC5] text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center justify-between hover:border-[#7A4444] transition-all"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#7A4444]" strokeWidth={1.8} />
              Copier pour TikTok (Bio · Story)
            </span>
            <Copy className="w-3.5 h-3.5 text-[#5C4B47]" />
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-[#EAE0D8]">
          <label className="block text-[10px] uppercase tracking-[0.22em] text-[#7A4444] font-bold mb-2">
            Lien public de la boutique
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={links.rawUrl}
              className="flex-1 rounded-xl bg-[#FAF6F2] border border-[#D4C2B7] px-3.5 py-2.5 text-xs font-medium text-[#1A1210] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleCopy(links.rawUrl)}
              className="px-4 py-2.5 rounded-xl bg-[#1E1614] text-white text-[10px] uppercase tracking-[0.18em] font-semibold flex items-center gap-1.5 hover:bg-[#7A4444] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DirectWhatsAppModal() {
  const navigate = useNavigate();
  const { directWaProduct, setDirectWaProduct, settings, computeDeliveryFee, createOrder } =
    useBoutique();

  const zones = settings.deliveryZones || [];
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState(zones[0]?.id || 'jendouba-centre');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(directWaProduct?.quantity || 1);
  const [error, setError] = useState('');

  if (!directWaProduct?.product) return null;

  const { product } = directWaProduct;
  const maxQty = Math.max(1, Number(product.stock) || 1);
  const activeQty = Math.min(maxQty, Math.max(1, quantity));
  const subtotal = (Number(product.price) || 0) * activeQty;
  const deliveryFee = computeDeliveryFee(cityId, subtotal);
  const total = subtotal + deliveryFee;
  const selectedZone = zones.find((z) => z.id === cityId) || { name: 'Jendouba' };

  const handleExpressOrder = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Veuillez indiquer votre nom, téléphone et adresse de livraison.');
      return;
    }
    setError('');

    try {
      const created = await createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          cityId,
          cityName: selectedZone.name,
          neighborhood: '',
          address: address.trim(),
          instructions: 'Commande directe express via WhatsApp',
        },
        items: [
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            volume: product.volume,
            price: Number(product.price) || 0,
            quantity: activeQty,
            photo: product.photos?.[0] || '/images/p1.jpg',
          },
        ],
        paymentMethod: 'Espèces à la livraison',
        channel: 'Commande directe WhatsApp',
      });

      const waUrl = buildOrderWhatsAppUrl(created, settings.whatsappNumber, settings.boutiqueName);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setDirectWaProduct(null);
      navigate(`/confirmation/${created.reference}`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la commande.');
    }
  };

  const quickChatUrl = buildQuickProductWhatsAppUrl(product, activeQty, settings.whatsappNumber);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#1A1210]/55 backdrop-blur-sm animate-backdrop"
        onClick={() => setDirectWaProduct(null)}
      />
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white text-[#1A1210] border border-[#E2D2C7] shadow-2xl overflow-hidden my-8 animate-modal-up">
        <div className="px-6 py-4 bg-[#F7F1EB] text-[#1A1210] border-b border-[#E6D7CE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-4 h-4 text-[#285A39]" strokeWidth={1.9} />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
              Commande Directe WhatsApp
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDirectWaProduct(null)}
            className="p-1.5 rounded-full text-[#2B201D] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleExpressOrder} className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#FCFAF8] border border-[#E6D7CE]">
            <img
              src={product.photos?.[0] || '/images/p1.jpg'}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0 photo-atelier-harmonized"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A4444] font-semibold">
                {product.category} · {product.volume}
              </span>
              <h4 className="font-serif text-xl font-medium text-[#1A1210] truncate">
                {product.name}
              </h4>
              <p className="text-xs font-semibold text-[#2F2421]">
                {formatPriceDT(product.price)} / flacon
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#2F2421]">
                Qté
              </label>
              <select
                value={activeQty}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-lg border border-[#CFAFA3] bg-white px-2.5 py-1.5 text-xs font-bold text-[#1A1210] focus:outline-none"
              >
                {Array.from({ length: Math.min(10, maxQty) }, (_, idx) => idx + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FDF4F3] border border-[#D9B1AD] text-xs font-medium text-[#7A4444]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="label-atelier">Nom complet *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom et prénom"
                className="input-atelier !py-2.5"
              />
            </div>

            <div>
              <label className="label-atelier">Téléphone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 56 123 456"
                className="input-atelier !py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="label-atelier">Commune *</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="input-atelier !py-2.5"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.fee} DT)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-atelier">Adresse / Quartier *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rue, quartier ou repère"
                className="input-atelier !py-2.5"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F1EB] border border-[#E6D7CE] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#2F2421] font-normal">
              <span>Sous-total flacon</span>
              <span className="font-semibold">{formatPriceDT(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#2F2421] font-normal">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7A4444]" strokeWidth={1.8} />
                Livraison ({selectedZone.name})
              </span>
              <span className="font-semibold">
                {deliveryFee === 0 ? 'Offerte' : formatPriceDT(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2.5 border-t border-[#DECFC5] font-semibold text-[#1A1210]">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em]">
                <Banknote className="w-4 h-4 text-[#285A39]" strokeWidth={1.8} />
                Espèces à la réception
              </span>
              <span className="font-serif text-2xl font-bold">{formatPriceDT(total)}</span>
            </div>
          </div>

          <button type="submit" className="btn-atelier-dark w-full">
            <MessageCircle className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
            <span>Valider & envoyer sur WhatsApp</span>
          </button>

          <div className="text-center pt-0.5">
            <a
              href={quickChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] font-medium text-[#2F2421] underline hover:text-[#7A4444] transition-colors"
            >
              Ou échanger directement sur WhatsApp ({settings.whatsappNumber})
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ToastBanner() {
  const { toast } = useBoutique();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-full bg-white border border-[#D4C2B7] text-[#1A1210] shadow-[0_18px_40px_-12px_rgba(20,14,13,0.35)] flex items-center gap-3 text-xs font-semibold tracking-wide animate-modal-up max-w-[92vw]">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
          toast.type === 'error' ? 'bg-[#9E3E3E]' : 'bg-[#285A39]'
        }`}
      />
      <span>{toast.message}</span>
    </div>
  );
}

export function FloatingWhatsAppButton() {
  const { settings } = useBoutique();
  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);
  const message = encodeURIComponent(
    `Bonjour ${settings.boutiqueName} ✨ Je souhaite être conseillé ou passer une commande.`
  );

  return (
    <a
      href={`https://wa.me/${waDigits}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Direct"
      title={`Commande directe WhatsApp : ${settings.whatsappNumber}`}
      className="fixed bottom-5 right-5 z-40 group flex items-center gap-2.5 rounded-full bg-white hover:bg-[#1E1614] text-[#1A1210] hover:text-white border border-[#D4C2B7] hover:border-[#1E1614] px-5 py-3 shadow-[0_14px_34px_-10px_rgba(20,14,13,0.32)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
    >
      <MessageCircle
        className="w-4 h-4 text-[#285A39] group-hover:text-[#FADCD6] group-hover:scale-110 transition-all duration-300"
        strokeWidth={1.9}
      />
      <span className="hidden sm:inline text-[10.5px] uppercase tracking-[0.2em] font-bold">
        WhatsApp Direct
      </span>
    </a>
  );
}
