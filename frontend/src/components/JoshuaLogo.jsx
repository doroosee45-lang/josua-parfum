import React from 'react';

/**
 * Joshua Parfum Emblem & Script Logo — High-Contrast Light & Dark Tones
 */
export default function JoshuaLogo({ size = 'sm', subtitle = 'PARFUMERIE', tone = 'dark' }) {
  const isLarge = size === 'lg';
  const isMedium = size === 'md';
  const isLightOnDark = tone === 'light';

  const strokePrimary = isLightOnDark ? '#FADCD6' : '#7A4444';
  const strokeSecondary = isLightOnDark ? '#E8CDC6' : '#9B7066';

  return (
    <div className="inline-flex flex-col items-center select-none group">
      <svg
        viewBox="0 0 64 64"
        className={`${
          isLarge ? 'w-14 h-14 mb-1' : isMedium ? 'w-11 h-11 mb-0.5' : 'w-8 h-8 mb-0.5'
        } transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="32"
          cy="24"
          r="14"
          fill={isLightOnDark ? '#FADCD6' : '#DFB9B3'}
          fillOpacity={isLightOnDark ? '0.2' : '0.28'}
        />
        <g
          stroke={strokePrimary}
          strokeWidth="1.3"
          fill={isLightOnDark ? '#FFFFFF' : '#FFFDFB'}
          fillOpacity="0.95"
        >
          <ellipse cx="32" cy="12" rx="3.2" ry="5.5" />
          <ellipse cx="32" cy="12" rx="3.2" ry="5.5" transform="rotate(72 32 17)" />
          <ellipse cx="32" cy="12" rx="3.2" ry="5.5" transform="rotate(144 32 17)" />
          <ellipse cx="32" cy="12" rx="3.2" ry="5.5" transform="rotate(216 32 17)" />
          <ellipse cx="32" cy="12" rx="3.2" ry="5.5" transform="rotate(288 32 17)" />
        </g>
        <circle cx="32" cy="17" r="2" fill={strokeSecondary} />
        <path
          d="M21 22C16 20 14 15 17 13C20 15 22 18 23 22"
          stroke={strokeSecondary}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M43 22C48 20 50 15 47 13C44 15 42 18 41 22"
          stroke={strokeSecondary}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect x="28" y="24" width="8" height="4" rx="1" stroke={strokeSecondary} strokeWidth="1.3" />
        <path
          d="M26 28H38L44 35V51C44 53.2 42.2 55 40 55H24C21.8 55 20 53.2 20 51V35L26 28Z"
          stroke={strokePrimary}
          strokeWidth="1.45"
          fill={strokePrimary}
          fillOpacity="0.14"
        />
        <path
          d="M26 28L24 55M38 28L40 55M20 36H44"
          stroke={strokeSecondary}
          strokeOpacity="0.7"
          strokeWidth="1"
        />
      </svg>

      {/* Flowing Romantic Script Title */}
      <span
        className={`font-script leading-none tracking-wide transition-colors duration-300 ${
          isLightOnDark ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]' : 'text-[#1A1210]'
        } ${
          isLarge
            ? 'text-4xl sm:text-5xl'
            : isMedium
            ? 'text-3xl'
            : 'text-[23px] sm:text-[26px]'
        }`}
      >
        Joshua Parfum
      </span>

      {/* Flanking Hairlines + High-Legibility Micro-Caps */}
      <div className="flex items-center gap-2 mt-1">
        <span
          className={`h-[1px] ${
            isLightOnDark ? 'bg-[#FADCD6]/85' : 'bg-[#7A4444]/65'
          } ${isLarge ? 'w-7 sm:w-9' : 'w-4'}`}
        />
        <span
          className={`uppercase font-sans font-semibold ${
            isLightOnDark ? 'text-[#FADCD6]' : 'text-[#7A4444]'
          } ${
            isLarge
              ? 'text-[10px] sm:text-[11px] tracking-[0.3em]'
              : 'text-[8.5px] sm:text-[9px] tracking-[0.24em]'
          }`}
        >
          {subtitle}
        </span>
        <span
          className={`h-[1px] ${
            isLightOnDark ? 'bg-[#FADCD6]/85' : 'bg-[#7A4444]/65'
          } ${isLarge ? 'w-7 sm:w-9' : 'w-4'}`}
        />
      </div>
    </div>
  );
}
