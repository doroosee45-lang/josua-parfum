import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, ShieldCheck, Share2, Lock, Banknote } from 'lucide-react';
import JoshuaLogo from './JoshuaLogo';
import { useBoutique } from '../context/BoutiqueContext';
import { sanitizePhoneForWhatsApp } from '../utils/whatsapp';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { settings, setShareModalPayload } = useBoutique();
  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);

  return (
    <footer className="relative z-10 bg-[#F7F1EB] text-[#1A1210] border-t border-[#E2D2C7]">
      {/* Opaque Luminous Silk Engagements Strip */}
      <div className="bg-[#FCF9F6] border-b border-[#E6D7CE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-7 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-[#DFCFC4] bg-white shadow-sm flex items-center justify-center text-[#7A4444] shrink-0">
              <Banknote className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
                Règlement en espèces
              </p>
              <p className="text-xs font-normal text-[#2F2421] mt-1 leading-relaxed">
                Payez en Dinars Tunisiens directement à la remise de votre flacon
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-[#DFCFC4] bg-white shadow-sm flex items-center justify-center text-[#7A4444] shrink-0">
              <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
                Commande directe WhatsApp
              </p>
              <p className="text-xs font-normal text-[#2F2421] mt-1 leading-relaxed">
                Conseil personnalisé & suivi rapide au {settings.whatsappNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-[#DFCFC4] bg-white shadow-sm flex items-center justify-center text-[#7A4444] shrink-0">
              <MapPin className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
                Jendouba & Régions Voisines
              </p>
              <p className="text-xs font-normal text-[#2F2421] mt-1 leading-relaxed">
                Bou Salem, Tabarka, Aïn Draham, Ghardimaou, Fernana, Oued Meliz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Warm Champagne & Ivory Editorial Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Column 1: Maison Identity */}
        <div className="flex flex-col items-start">
          <JoshuaLogo size="md" subtitle="HAUTE PARFUMERIE" tone="dark" />
          <p className="font-serif italic text-xl text-[#7A4444] font-medium mt-5">
            « {settings.slogan} »
          </p>
          <p className="text-xs font-normal text-[#2F2421] leading-[1.8] mt-3">
            Une sélection contemporaine de parfums pour Elle, pour Lui et Mixtes, livrée avec soin
            à Jendouba et dans les communes voisines.
          </p>
        </div>

        {/* Column 2: Collections & Maison */}
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.24em] text-[#7A4444] font-bold mb-5">
            Navigation & Univers
          </h4>
          <ul className="space-y-2.5 text-[12.5px] font-medium text-[#1A1210]">
            <li>
              <Link to="/catalogue" className="hover:text-[#7A4444] transition-colors">
                Toute la Collection
              </Link>
            </li>
            <li>
              <Link
                to="/catalogue?categorie=Femme"
                className="hover:text-[#7A4444] transition-colors"
              >
                01 — Pour Elle
              </Link>
            </li>
            <li>
              <Link
                to="/catalogue?categorie=Homme"
                className="hover:text-[#7A4444] transition-colors"
              >
                02 — Pour Lui
              </Link>
            </li>
            <li>
              <Link
                to="/catalogue?categorie=Mixte"
                className="hover:text-[#7A4444] transition-colors"
              >
                03 — Créations Mixtes
              </Link>
            </li>
            <li>
              <Link to="/maison" className="hover:text-[#7A4444] transition-colors">
                La Maison Joshua
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#7A4444] transition-colors">
                Contact & Conseil
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Delivery Zones */}
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.24em] text-[#7A4444] font-bold mb-5">
            Livraison Régionale
          </h4>
          <p className="text-xs font-normal text-[#2F2421] leading-relaxed mb-3.5">
            {settings.deliveryZoneSummary}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(settings.deliveryZones || []).slice(0, 7).map((z) => (
              <span
                key={z.id}
                className="text-[10.5px] px-2.5 py-1 rounded-full border border-[#D8C6BB] bg-white text-[#1A1210] font-medium"
              >
                {z.name} · {z.fee} DT
              </span>
            ))}
          </div>
          {settings.freeDeliveryEnabled && (
            <p className="text-[11.5px] text-[#285A39] mt-4 flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Livraison offerte dès {settings.freeDeliveryThreshold} DT d’achat
            </p>
          )}
        </div>

        {/* Column 4: Direct Contact & Share */}
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.24em] text-[#7A4444] font-bold mb-5">
            Contact & Partage
          </h4>
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-atelier-dark w-full !h-[42px] !px-4"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#FADCD6]" strokeWidth={1.7} />
            <span>{settings.whatsappNumber}</span>
          </a>

          <button
            type="button"
            onClick={() =>
              setShareModalPayload({
                url: window.location.origin,
                title: `${settings.boutiqueName} — ${settings.slogan}`,
              })
            }
            className="mt-2.5 w-full h-[42px] px-4 rounded-xl border border-[#D2BGB2] border-[#CFBCAE] bg-white text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold inline-flex items-center justify-center gap-2 hover:border-[#7A4444] hover:text-[#7A4444] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.7} />
            <span>WhatsApp · Facebook · TikTok</span>
          </button>

          <div className="mt-6 pt-4 border-t border-[#DFCFC4]">
            <Link
              to="/vendeur"
              className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-[#2F2421] hover:text-[#7A4444] font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={1.7} />
              <span>Espace Vendeur</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Opaque Copyright Strip */}
      <div className="bg-[#ECE1D6] border-t border-[#DCD0C4] py-4 px-4 sm:px-8 text-center text-[11px] font-medium text-[#2F2421] tracking-[0.1em]">
        © {CURRENT_YEAR} {settings.boutiqueName} — {settings.slogan} · Jendouba, Tunisie.
      </div>
    </footer>
  );
}
