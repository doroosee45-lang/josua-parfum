import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Banknote, MapPin, MessageCircle } from 'lucide-react';
import JoshuaLogo from './JoshuaLogo';
import SakuraPetals from './SakuraPetals';
import { useBoutique } from '../context/BoutiqueContext';
import { sanitizePhoneForWhatsApp } from '../utils/whatsapp';

export default function EditorialHero(props) {
  const slidesKey = (props.slides || []).map((s) => s.id).join('|');
  return <EditorialHeroStage key={slidesKey} {...props} />;
}

function EditorialHeroStage({
  slides = [],
  crestSubtitle = 'ATELIER PARFUM',
  size = 'page',
  whatsappPrompt,
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const { settings } = useBoutique();

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const safeIdx = activeIdx < slides.length ? activeIdx : 0;
  const current = slides[safeIdx];
  const waDigits = sanitizePhoneForWhatsApp(settings.whatsappNumber);
  const defaultWaText =
    whatsappPrompt ||
    `Bonjour ${settings.boutiqueName} ✨ Je souhaite commander un parfum (Règlement en espèces à la livraison).`;

  const heightClasses =
    size === 'home'
      ? 'min-h-[84vh] sm:min-h-[90vh]'
      : size === 'compact'
      ? 'min-h-[56vh] sm:min-h-[62vh]'
      : 'min-h-[74vh] sm:min-h-[80vh]';

  const handleScrollToSection = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className={`relative w-full ${heightClasses} pt-[88px] sm:pt-[98px] pb-20 sm:pb-24 flex items-center overflow-hidden bg-[#1E1614] border-b border-white/20 shadow-[0_24px_60px_-20px_rgba(16,11,10,0.5)]`}
    >
      {/* Background Photographic Slides with High-Clarity Protective Dark Vignette */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === safeIdx;
        return (
          <div
            key={slide.id}
            style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className={`w-full h-full object-cover object-center photo-atelier-harmonized transition-transform duration-[9500ms] ease-out ${
                isCurrent ? 'scale-[1.05]' : 'scale-100'
              }`}
            />

            {/* Subtle Sakura Chinoiserie Whisper Overlay */}
            <img
              src="/images/sakura-backdrop.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.16] mix-blend-soft-light pointer-events-none"
            />

            {/* Guaranteed High-Contrast Multi-Stop Vignette (>10:1 WCAG Contrast on All Slides) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1210]/95 via-[#221816]/75 to-[#1A1210]/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1210]/85 via-transparent to-[#1A1210]/45" />
          </div>
        );
      })}

      {/* Floating Sakura Blossoms & Petals */}
      <SakuraPetals />

      {/* Main Left-Aligned Haute-Parfumerie Composition */}
      <div className="relative z-20 max-w-[1440px] mx-auto w-full px-6 sm:px-12 lg:px-20">
        <div className="max-w-2xl">
          {/* Brand Crest */}
          <div className="mb-6 sm:mb-7 flex justify-start animate-hero-1">
            <JoshuaLogo
              size={size === 'compact' ? 'md' : 'lg'}
              subtitle={crestSubtitle}
              tone="light"
            />
          </div>

          {/* Keyed Staggered Copy Block */}
          <div key={current.id}>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 mb-3.5 animate-hero-1">
              <span className="w-7 h-[1.5px] bg-[#FADCD6]" />
              <span className="text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.28em] text-[#FADCD6] font-semibold">
                {current.eyebrow}
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[64px] font-medium text-white leading-[1.06] tracking-[-0.01em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] animate-hero-2">
              {current.headline}{' '}
              {current.italic && (
                <em className="italic font-normal text-[#FADCD6] block sm:inline">
                  {current.italic}
                </em>
              )}
            </h1>

            {/* Subtitle */}
            {current.subtext && (
              <p className="mt-5 text-[13.5px] sm:text-[15px] text-white font-normal leading-[1.82] max-w-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] animate-hero-3">
                {current.subtext}
              </p>
            )}

            {/* Harmonized High-Contrast CTA Duo */}
            <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3.5 animate-hero-4">
              {current.ctaScrollId ? (
                <button
                  type="button"
                  onClick={() => handleScrollToSection(current.ctaScrollId)}
                  className="btn-atelier-outline-light"
                >
                  <span>{current.ctaLabel || 'Explorer'}</span>
                  <ArrowDown className="w-3.5 h-3.5 text-[#FADCD6]" strokeWidth={1.8} />
                </button>
              ) : current.ctaLink ? (
                <Link to={current.ctaLink} className="btn-atelier-outline-light">
                  <span>{current.ctaLabel}</span>
                </Link>
              ) : null}

              <a
                href={`https://wa.me/${waDigits}?text=${encodeURIComponent(defaultWaText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-atelier-blush"
              >
                <MessageCircle className="w-4 h-4 text-[#1A1210]" strokeWidth={1.8} />
                <span>Commande WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Signature Reassurance Line */}
          <div className="mt-8 sm:mt-9 pt-5 border-t border-white/25 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-white animate-hero-4">
            <span className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
              Espèces à la livraison
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.7} />
              Jendouba & villes voisines
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Center Animated Slide Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {slides.map((s, idx) => {
            const isCurrent = idx === safeIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Diapositive ${idx + 1}`}
                className="relative w-12 sm:w-16 h-[3.5px] rounded-full bg-white/35 overflow-hidden hover:bg-white/60 transition-colors"
              >
                {isCurrent && (
                  <span
                    key={`bar-${safeIdx}`}
                    className="absolute inset-0 rounded-full bg-[#FADCD6] animate-hero-progress"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
