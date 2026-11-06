import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, HeartHandshake, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import EditorialHero from '../components/EditorialHero';
import { EditorialHeader, LuxuryImage, Reveal } from '../components/Motion';
import { useBoutique } from '../context/BoutiqueContext';
import { sanitizePhoneForWhatsApp } from '../utils/whatsapp';

const MAISON_HERO_SLIDES = [
  {
    id: 'maison-1',
    image: '/images/savoir-faire.jpg',
    eyebrow: '01 · L’ÂME DE JOSHUA PARFUM',
    headline: 'Une Maison dédiée',
    italic: 'à l’élégance du sillage.',
    subtext:
      'Née de la passion des belles matières olfactives, JOSHUA PARFUM sélectionne des fragrances de caractère pour Elle, pour Lui et Mixtes, accessibles en toute confiance à Jendouba et ses environs.',
    ctaLabel: 'Découvrir notre histoire',
    ctaScrollId: 'maison-histoire',
  },
  {
    id: 'maison-2',
    image: '/images/floral-mural.jpg',
    eyebrow: '02 · EXIGENCE & HARMONIE',
    headline: 'Chaque flacon raconte',
    italic: 'une émotion singulière.',
    subtext:
      'De la fraîcheur zestée des matins méditerranéens à la chaleur enveloppante de l’oud et de l’ambre, nos créations signent votre présence avec justesse.',
    ctaLabel: 'Explorer la Collection',
    ctaLink: '/catalogue',
  },
];

const PILLARS = [
  {
    num: '01',
    title: 'Sélection Rigoureuse',
    desc: 'Des accords équilibrés à haute tenue — floraux poudrés, boisés nobles, orientaux ambrés et muscs contemporains.',
    icon: Sparkles,
  },
  {
    num: '02',
    title: 'Confiance & Espèces à la Livraison',
    desc: 'Aucune carte bancaire requise en ligne : vous vérifiez et réglez votre commande en espèces en Dinars Tunisiens à la réception.',
    icon: Banknote,
  },
  {
    num: '03',
    title: 'Proximité à Jendouba',
    desc: 'Une attention directe par WhatsApp et une livraison soignée à Jendouba Centre, Bou Salem, Tabarka, Aïn Draham, Ghardimaou et Fernana.',
    icon: HeartHandshake,
  },
];

export default function MaisonPage() {
  const { settings } = useBoutique();
  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);

  return (
    <div className="min-h-screen animate-page-enter">
      {/* Unified Full-Scale Editorial Hero */}
      <EditorialHero
        slides={MAISON_HERO_SLIDES}
        crestSubtitle="LA MAISON"
        size="page"
      />

      <div id="maison-histoire" className="scroll-mt-[82px]" />

      {/* Section 1: Story & Savoir-Faire Opaque Ivory Card */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 lg:px-14">
        <div className="max-w-7xl mx-auto surface-ivory-card p-7 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <div className="p-2.5 rounded-[22px] bg-[#FAF6F2] border border-[#E6D7CE] shadow-sm">
              <div className="aspect-[4/4.6] rounded-[16px] overflow-hidden">
                <LuxuryImage
                  src="/images/editorial-femme.jpg"
                  alt="Maison Joshua Parfum"
                  rounded="rounded-[16px]"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <EditorialHeader
              eyebrow="Notre Philosophie"
              title="Votre parfum,"
              italicAccent="votre signature."
              description="Un parfum ne se contente pas d’accompagner une tenue : il précède les mots et prolonge le souvenir. Chez JOSHUA PARFUM, nous avons imaginé un écrin digital clair, moderne et chaleureux où choisir son sillage redevient un plaisir simple."
              align="left"
              theme="light"
            />

            <div className="space-y-4 text-[13.5px] sm:text-[14.5px] font-normal text-[#2F2421] leading-[1.85]">
              <p>
                Que vous recherchiez la délicatesse d’un bouquet de rose et de jasmin blanc, la
                profondeur boisée d’un sillage masculin ou la modernité d’un élixir mixte, chaque
                référence de notre collection est présentée avec ses notes olfactives, sa
                contenance et son tarif transparent fixé par la Maison.
              </p>
              <p>
                Ancrée à <strong className="font-semibold text-[#1A1210]">Jendouba</strong>, notre
                équipe vous conseille personnellement sur WhatsApp afin de vous guider vers la
                fragrance la plus fidèle à votre personnalité ou pour préparer un coffret à offrir.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3.5">
              <Link to="/catalogue" className="btn-atelier-dark">
                <span>Explorer les créations</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.7} />
              </Link>

              <a
                href={`https://wa.me/${waDigits}?text=${encodeURIComponent(
                  `Bonjour ${settings.boutiqueName} ✨ J’aimerais recevoir un conseil olfactif personnalisé.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-atelier-outline-dark"
              >
                <MessageCircle className="w-4 h-4 text-[#285A39]" strokeWidth={1.8} />
                <span>Conseil sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Three Pillars Floating Over Fixed Sakura Backdrop */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-8 lg:px-14">
        <div className="max-w-7xl mx-auto">
          <EditorialHeader
            eyebrow="Les Engagements Joshua Parfum"
            title="Trois piliers"
            italicAccent="d’excellence."
            align="center"
            theme="sakura"
            className="mb-14"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Reveal
                  key={pillar.num}
                  delay={idx * 70}
                  className="surface-ivory-card p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#F7EFE9] border border-[#DFCFC4] flex items-center justify-center text-[#7A4444]">
                        <Icon className="w-5 h-5" strokeWidth={1.7} />
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#7A4444]">
                        {pillar.num}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-[#1A1210]">
                      {pillar.title}
                    </h3>
                    <p className="text-[13px] sm:text-[13.5px] font-normal text-[#2F2421] mt-3 leading-[1.8]">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EAE0D8] flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-[#7A4444] font-bold">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.8} />
                    <span>Jendouba & Régions voisines</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
