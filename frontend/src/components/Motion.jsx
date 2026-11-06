import React, { useEffect, useRef, useState } from 'react';

/**
 * Guaranteed-Visible Scroll Motion Wrapper
 * Never sets opacity: 0 on text or cards, ensuring 100% immediate legibility on all screens,
 * viewports, category switches, and embedded previews while adding a gentle upward glide.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
}) {
  const ref = useRef(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setSettled(true);
      return;
    }

    const fallbackTimer = setTimeout(() => setSettled(true), 350);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSettled(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.01, rootMargin: '120px 0px 120px 0px' }
    );

    observer.observe(node);
    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${Math.min(delay, 220)}ms`,
        transitionDuration: '600ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`opacity-100 transition-transform ${
        settled ? 'translate-y-0' : 'translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Harmonized Luxury Image Component — Always Immediately Visible with Rounded Corners
 */
export function LuxuryImage({
  src,
  hoverSrc,
  alt = '',
  className = '',
  imgClassName = '',
  rounded = 'rounded-[15px]',
  zoomOnHover = true,
  toneOverlay = true,
}) {
  const hasDistinctHover = Boolean(hoverSrc && hoverSrc !== src);

  return (
    <div className={`relative overflow-hidden bg-[#F3ECE6] ${rounded} ${className}`}>
      <img
        src={src}
        alt={alt}
        decoding="async"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className={`w-full h-full object-cover object-center opacity-100 photo-atelier-harmonized transition-all duration-700 ${
          hasDistinctHover
            ? 'group-hover:opacity-0 group-hover:scale-[1.04]'
            : zoomOnHover
            ? 'group-hover:scale-[1.045]'
            : ''
        } ${imgClassName}`}
      />

      {hasDistinctHover && (
        <img
          src={hoverSrc}
          alt={alt ? `${alt} — vue secondaire` : ''}
          decoding="async"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="absolute inset-0 w-full h-full object-cover object-center photo-atelier-harmonized opacity-0 scale-[1.015] group-hover:opacity-100 group-hover:scale-[1.045] transition-all duration-700"
        />
      )}

      {toneOverlay && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#2B211E]/[0.06] bg-gradient-to-t from-[#2B211E]/[0.05] via-transparent to-white/[0.06] ${rounded}`}
        />
      )}
    </div>
  );
}

/**
 * High-Contrast Editorial Section Header
 * Supports theme='sakura' (crisp white + rosewood pill over the fixed Sakura Chinoiserie backdrop)
 * and theme='light' (deep espresso & rosewood inside opaque ivory cards).
 */
export function EditorialHeader({
  eyebrow,
  title,
  italicAccent,
  description,
  align = 'center',
  theme = 'sakura',
  className = '',
}) {
  const isCentered = align === 'center';
  const isOnSakura = theme === 'sakura' || theme === 'dark';

  return (
    <div
      className={`${
        isCentered ? 'text-center max-w-2xl mx-auto' : 'text-left max-w-xl'
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2.5 mb-3.5 ${
            isOnSakura
              ? 'px-4 py-1.5 rounded-full bg-[#1F1715]/80 backdrop-blur-md border border-white/20 shadow-sm'
              : ''
          } ${isCentered ? 'justify-center' : 'justify-start'}`}
        >
          <span
            className={`w-5 h-[1.5px] ${
              isOnSakura ? 'bg-[#FADCD6]' : 'bg-[#7A4444]'
            }`}
          />
          <span
            className={`text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold ${
              isOnSakura ? 'text-[#FADCD6]' : 'text-[#7A4444]'
            }`}
          >
            {eyebrow}
          </span>
          {isCentered && (
            <span
              className={`w-5 h-[1.5px] ${
                isOnSakura ? 'bg-[#FADCD6]' : 'bg-[#7A4444]'
              }`}
            />
          )}
        </div>
      )}

      <h2
        className={`font-serif text-3xl sm:text-5xl lg:text-[52px] font-medium leading-[1.08] tracking-[-0.01em] ${
          isOnSakura
            ? 'text-white drop-shadow-[0_3px_18px_rgba(16,11,10,0.75)]'
            : 'text-[#1A1210]'
        }`}
      >
        {title}{' '}
        {italicAccent && (
          <em
            className={`italic font-normal ${
              isOnSakura ? 'text-[#FADCD6]' : 'text-[#7A4444]'
            }`}
          >
            {italicAccent}
          </em>
        )}
      </h2>

      {description && (
        <p
          className={`mt-4 text-[13px] sm:text-[14.5px] font-normal leading-[1.8] ${
            isOnSakura
              ? 'text-white drop-shadow-[0_2px_12px_rgba(16,11,10,0.8)]'
              : 'text-[#3B2E2B]'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
