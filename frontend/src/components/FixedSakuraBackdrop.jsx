import React from 'react';
import SakuraPetals from './SakuraPetals';

/**
 * Global Viewport-Locked Sakura Chinoiserie Background
 * Remains 100% fixed, intact, undistorted, and coherent across all pages and during all scrolling.
 * Uses GPU-composited fixed positioning with 100lvh so mobile URL bar changes never cause jumps or stretching.
 */
export default function FixedSakuraBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-[100lvh] min-h-screen z-0 pointer-events-none overflow-hidden select-none bg-[#61524E]"
      style={{
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Seamless High-Definition Sakura Chinoiserie Wallpaper */}
      <img
        src="/images/sakura-backdrop.jpg"
        alt=""
        decoding="sync"
        draggable="false"
        className="w-full h-full object-cover object-center select-none"
      />

      {/* Balanced Velvet Glaze: keeps Sakura branches clearly visible while guaranteeing crisp contrast for white section titles */}
      <div className="absolute inset-0 bg-[#2C211F]/30" />

      {/* Weightless Floating Sakura Petals */}
      <SakuraPetals density="subtle" />
    </div>
  );
}
