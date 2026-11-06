import React, { useState } from 'react';
import { MessageCircle, MapPin, Banknote, Share2, Send, Phone } from 'lucide-react';
import EditorialHero from '../components/EditorialHero';
import { useBoutique } from '../context/BoutiqueContext';
import { formatPriceDT, sanitizePhoneForWhatsApp } from '../utils/whatsapp';

const CONTACT_HERO_SLIDES = [
  {
    id: 'contact-1',
    image: '/images/hero-3.jpg',
    eyebrow: '01 · LIGNE PRIVÉE & CONSEIL',
    headline: 'À votre écoute,',
    italic: 'à chaque instant.',
    subtext:
      'Besoin d’un conseil olfactif, d’une recommandation cadeau ou d’une commande directe ? Échangez avec notre équipe sur WhatsApp et recevez votre flacon à Jendouba et ses environs.',
    ctaLabel: 'Nous écrire ci-dessous',
    ctaScrollId: 'contact-direct',
  },
  {
    id: 'contact-2',
    image: '/images/savoir-faire.jpg',
    eyebrow: '02 · LIVRAISON JENDOUBA & ALENTOURS',
    headline: 'Proximité, rapidité',
    italic: '& règlement en espèces.',
    subtext:
      'Jendouba Centre, Bou Salem, Tabarka, Aïn Draham, Ghardimaou, Fernana et Oued Meliz — commandez sereinement et payez à la réception.',
    ctaLabel: 'Voir les zones & tarifs',
    ctaScrollId: 'contact-direct',
  },
];

export default function ContactPage() {
  const { settings, setShareModalPayload } = useBoutique();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    const text = [
      `Bonjour *${settings.boutiqueName}* ✨`,
      name ? `Nom : ${name}` : '',
      phone ? `Téléphone : ${phone}` : '',
      ``,
      message || 'Je souhaite obtenir un conseil sur vos parfums et vos modalités de livraison.',
    ]
      .filter(Boolean)
      .join('\n');

    window.open(
      `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="min-h-screen animate-page-enter">
      {/* Unified Full-Scale Editorial Hero */}
      <EditorialHero
        slides={CONTACT_HERO_SLIDES}
        crestSubtitle="JENDOUBA · TUNISIE"
        size="page"
      />

      <div id="contact-direct" className="scroll-mt-[82px]" />

      {/* Contact & Delivery Opaque Ivory Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left: Direct Channels & Delivery Zones */}
        <div className="lg:col-span-6 space-y-8">
          <div className="surface-ivory-card p-7 sm:p-9 space-y-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#7A4444] font-bold">
              Ligne Privée
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A1210]">
              Commander ou nous joindre
            </h2>

            <div className="space-y-3.5 text-sm text-[#1A1210]">
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#F4FAF6] border border-[#C6DFCF] hover:border-[#285A39] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-[#C6DFCF] flex items-center justify-center text-[#285A39] shrink-0">
                  <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#285A39] font-bold block">
                    WhatsApp Officiel
                  </span>
                  <strong className="font-serif text-xl text-[#1A1210] font-semibold">
                    {settings.whatsappNumber}
                  </strong>
                </div>
              </a>

              <a
                href={`tel:${settings.whatsappNumber.replace(/\s+/g, '')}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5F0] border border-[#E2D2C7] hover:border-[#7A4444] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E2D2C7] flex items-center justify-center text-[#7A4444] shrink-0">
                  <Phone className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A4444] font-bold block">
                    Appel Direct
                  </span>
                  <strong className="font-serif text-xl text-[#1A1210] font-semibold">
                    {settings.whatsappNumber}
                  </strong>
                </div>
              </a>
            </div>

            <button
              type="button"
              onClick={() =>
                setShareModalPayload({
                  url: window.location.origin,
                  title: `${settings.boutiqueName} — ${settings.slogan}`,
                })
              }
              className="btn-atelier-dark w-full"
            >
              <Share2 className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
              <span>Partager sur WhatsApp, Facebook & TikTok</span>
            </button>
          </div>

          {/* Delivery Zones Table */}
          <div className="surface-ivory-card p-7 sm:p-9">
            <div className="flex items-center gap-2 text-[#7A4444] mb-2">
              <MapPin className="w-4 h-4" strokeWidth={1.8} />
              <span className="text-[11px] uppercase tracking-[0.22em] font-bold">
                Zones & Frais de Livraison
              </span>
            </div>
            <h3 className="font-serif text-3xl font-medium text-[#1A1210] mb-5">
              Jendouba & communes voisines
            </h3>

            <div className="divide-y divide-[#EAE0D8] text-xs sm:text-[13.5px]">
              {(settings.deliveryZones || []).map((z) => (
                <div key={z.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#1A1210]">{z.name}</span>
                    <span className="block text-[11.5px] font-normal text-[#3B2E2B]">
                      {z.delay}
                    </span>
                  </div>
                  <span className="font-serif text-lg font-bold text-[#7A4444]">
                    {formatPriceDT(z.fee)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-[#F7F1EB] border border-[#E2D2C7] text-xs font-medium text-[#1A1210] flex items-center gap-2.5">
              <Banknote className="w-4 h-4 text-[#285A39] shrink-0" strokeWidth={1.8} />
              <span>
                Règlement en espèces à la livraison pour l’ensemble des communes desservies.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Direct WhatsApp Message Composer */}
        <div className="lg:col-span-6">
          <form onSubmit={handleSendWhatsApp} className="surface-ivory-card p-7 sm:p-11 space-y-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#7A4444] font-bold">
              Écrivez-nous
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A1210]">
              Conseil personnalisé
            </h2>
            <p className="text-[13px] font-normal text-[#2F2421] leading-[1.8]">
              À la recherche d’un sillage particulier ou d’une idée cadeau ? Rédigez votre message
              ci-dessous pour l’adresser directement à notre équipe sur WhatsApp.
            </p>

            <div>
              <label className="label-atelier">Nom complet *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="input-atelier"
              />
            </div>

            <div>
              <label className="label-atelier">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +216 56 45 49 46"
                className="input-atelier"
              />
            </div>

            <div>
              <label className="label-atelier">Votre message *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Indiquez le parfum recherché, votre commune ou votre demande..."
                className="input-atelier"
              />
            </div>

            <button type="submit" className="btn-atelier-dark w-full">
              <Send className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
              <span>Transmettre sur WhatsApp</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
