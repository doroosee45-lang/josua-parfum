import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Banknote, Share2, Sparkles } from 'lucide-react';
import EditorialHero from '../components/EditorialHero';
import ProductCard from '../components/ProductCard';
import { Reveal, LuxuryImage, EditorialHeader } from '../components/Motion';
import { useBoutique } from '../context/BoutiqueContext';
import { sanitizePhoneForWhatsApp } from '../utils/whatsapp';

const HERO_SLIDES = [
  {
    id: 'home-1',
    image: '/images/hero-1.jpg',
    eyebrow: '01 · MAISON DE HAUTE PARFUMERIE',
    headline: 'Votre parfum,',
    italic: 'votre élégance.',
    subtext:
      'L’élégance se révèle dans chaque sillage. Des créations choisies pour Elle, pour Lui et Mixtes, livrées entre vos mains à Jendouba et dans les communes voisines.',
    ctaLabel: 'Découvrir la collection',
    ctaLink: '/catalogue',
  },
  {
    id: 'home-2',
    image: '/images/hero-2.jpg',
    eyebrow: '02 · SILLAGES BOISÉS & AMBRÉS',
    headline: 'La noblesse des bois,',
    italic: 'l’éclat de l’ambre.',
    subtext:
      'Commandez en toute simplicité depuis votre navigateur ou sur WhatsApp, et réglez exclusivement en espèces à la réception de votre flacon.',
    ctaLabel: 'Explorer Pour Lui',
    ctaLink: '/catalogue?categorie=Homme',
  },
  {
    id: 'home-3',
    image: '/images/hero-3.jpg',
    eyebrow: '03 · CRÉATIONS LUMINEUSES',
    headline: 'La caresse d’une fleur',
    italic: 'à fleur de peau.',
    subtext:
      'Une sélection contemporaine aux notes de rose poudrée, de jasmin blanc et de musc soyeux, pensée pour sublimer chaque instant.',
    ctaLabel: 'Explorer Pour Elle',
    ctaLink: '/catalogue?categorie=Femme',
  },
];

const UNIVERSES = [
  {
    num: '01 — POUR ELLE',
    title: 'Sillages Féminins',
    desc: 'Notes florales, poudrées, solaires & veloutées',
    image: '/images/editorial-femme.jpg',
    to: '/catalogue?categorie=Femme',
  },
  {
    num: '02 — POUR LUI',
    title: 'Caractères Masculins',
    desc: 'Accords boisés, ambrés, fumés & épicés',
    image: '/images/editorial-homme.jpg',
    to: '/catalogue?categorie=Homme',
  },
  {
    num: '03 — COLLECTION PRIVÉE',
    title: 'Créations Mixtes',
    desc: 'Équilibres rares d’oud blanc, bergamote & musc',
    image: '/images/editorial-mixte.jpg',
    to: '/catalogue?categorie=Mixte',
  },
];

export default function HomePage() {
  const { publicProducts, settings, setShareModalPayload } = useBoutique();

  const featuredProducts = publicProducts.filter((p) => p.featured).slice(0, 4);
  const showcaseList =
    featuredProducts.length >= 4 ? featuredProducts : publicProducts.slice(0, 4);
  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);

  return (
    <div className="w-full animate-page-enter">
      {/* 1. MASTER HERO */}
      <EditorialHero
        slides={HERO_SLIDES}
        crestSubtitle="ATELIER PARFUM"
        size="home"
      />

      {/* 2. LA SÉLECTION SIGNATURE — Opaque Ivory Cards Floating on Fixed Sakura Backdrop */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 lg:px-14">
        <div className="max-w-7xl mx-auto">
          <EditorialHeader
            eyebrow="Créations & Nouveautés"
            title="La Sélection"
            italicAccent="Signature."
            description="Chaque flacon est proposé en Dinars Tunisiens (DT), disponible en ajout direct au panier ou en commande express sur WhatsApp avec règlement en espèces à la livraison."
            align="center"
            theme="sakura"
            className="mb-14"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {showcaseList.map((product, idx) => (
              <Reveal key={product.id} delay={idx * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link to="/catalogue" className="btn-atelier-blush">
              <span>Découvrir les {publicProducts.length} créations</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MANIFESTE DE LA MAISON — High-Contrast Velvet Veil Over Fixed Sakura Wallpaper */}
      <section className="surface-sakura-veil py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="w-7 h-[1.5px] bg-[#FADCD6]" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#FADCD6] font-semibold">
              {settings.boutiqueName} · L’ESPRIT DE LA MAISON
            </span>
            <span className="w-7 h-[1.5px] bg-[#FADCD6]" />
          </div>

          <h2 className="font-serif text-5xl sm:text-7xl lg:text-[72px] font-medium text-white leading-[1.05] tracking-[-0.01em] drop-shadow-[0_4px_20px_rgba(16,11,10,0.45)]">
            L’art du sillage
            <em className="block italic font-normal text-[#FADCD6] mt-1">autrement.</em>
          </h2>

          <p className="mt-6 text-[13.5px] sm:text-[15px] text-white font-normal leading-[1.82] max-w-lg mx-auto">
            Des matières nobles, des accords ciselés et des flacons aux lignes pures qui racontent
            une certaine idée de l’élégance contemporaine.
          </p>

          <div className="mt-8">
            <Link to="/maison" className="btn-atelier-outline-light">
              <span>Découvrir la Maison</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TROIS EXPRESSIONS — Rounded Editorial Triptych on Fixed Sakura Backdrop */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 lg:px-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <EditorialHeader
              eyebrow="Trois expressions · Une même vision"
              title="Une allure"
              italicAccent="singulière."
              align="left"
              theme="sakura"
            />
            <div>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#1E1614]/90 backdrop-blur-md border border-white/25 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white hover:text-[#1A1210] font-semibold shadow-md transition-all"
              >
                <span>Explorer toute la collection</span>
                <ArrowRight className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {UNIVERSES.map((item, idx) => (
              <Reveal key={item.num} delay={idx * 70}>
                <Link
                  to={item.to}
                  className="group block rounded-[22px] bg-white p-3 border border-[#E6D7CE] shadow-[0_20px_48px_-16px_rgba(20,14,13,0.38)] hover:border-[#7A4444] hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  <div className="relative aspect-[4/4.8] rounded-[16px] overflow-hidden">
                    <LuxuryImage
                      src={item.image}
                      alt={item.title}
                      rounded="rounded-[16px]"
                      toneOverlay={false}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 rounded-[16px] bg-gradient-to-t from-[#16100E]/95 via-[#16100E]/45 to-transparent" />
                    <div className="absolute inset-x-6 bottom-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-white text-[#1A1210] text-[9.5px] uppercase tracking-[0.2em] font-bold shadow-sm">
                        {item.num}
                      </span>
                      <h3 className="font-serif text-3xl font-medium text-white mt-3 group-hover:text-[#FADCD6] transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-xs font-normal text-white mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LE GOÛT DU DÉTAIL — Opaque Ivory Showcase Card Floating on Fixed Sakura Backdrop */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-8 lg:px-14">
        <div className="max-w-7xl mx-auto surface-ivory-card p-7 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 relative">
            <div className="p-2.5 rounded-[22px] bg-[#FAF6F2] border border-[#E6D7CE] shadow-sm">
              <div className="aspect-[4/3] rounded-[16px] overflow-hidden">
                <LuxuryImage
                  src="/images/savoir-faire.jpg"
                  alt="Savoir-faire Joshua Parfum"
                  rounded="rounded-[16px]"
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="hidden sm:block absolute -bottom-5 -right-4 rounded-2xl bg-white border border-[#DECFC5] p-5 max-w-xs shadow-xl">
              <p className="font-serif italic text-xl font-medium text-[#7A4444]">
                « {settings.slogan} »
              </p>
              <p className="text-[11px] font-medium tracking-wide text-[#2F2421] mt-1">
                Service privé WhatsApp · {settings.whatsappNumber}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-7">
            <EditorialHeader
              eyebrow="Simplicité & Confiance"
              title="La beauté d’un service"
              italicAccent="sur mesure."
              description={`Chez ${settings.boutiqueName}, commandez directement depuis votre smartphone sans créer de compte ni saisir de carte bancaire. Votre parfum est préparé avec soin et livré à Jendouba et dans les villes voisines.`}
              align="left"
              theme="light"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#FAF6F2] border border-[#E6D7CE]">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#DECFC5] flex items-center justify-center text-[#7A4444] mb-3">
                  <Banknote className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <h4 className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1A1210]">
                  Règlement à la livraison
                </h4>
                <p className="text-xs font-normal text-[#2F2421] mt-1.5 leading-[1.75]">
                  Réglez le montant exact en espèces en Dinars Tunisiens lors de la remise en main
                  propre.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF6F2] border border-[#E6D7CE]">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#DECFC5] flex items-center justify-center text-[#7A4444] mb-3">
                  <Sparkles className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <h4 className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1A1210]">
                  Partage en un geste
                </h4>
                <p className="text-xs font-normal text-[#2F2421] mt-1.5 leading-[1.75]">
                  Faites découvrir l’adresse de la boutique sur WhatsApp, Facebook et TikTok.
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap gap-3.5">
              <a
                href={`https://wa.me/${waDigits}?text=${encodeURIComponent(
                  `Bonjour ${settings.boutiqueName} ✨ J’aimerais être conseillé pour choisir un parfum.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-atelier-dark"
              >
                <MessageCircle className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
                <span>Commander sur WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() =>
                  setShareModalPayload({
                    url: window.location.origin,
                    title: `${settings.boutiqueName} — ${settings.slogan}`,
                  })
                }
                className="btn-atelier-outline-dark"
              >
                <Share2 className="w-4 h-4 text-[#7A4444]" strokeWidth={1.7} />
                <span>Partager l’adresse</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
