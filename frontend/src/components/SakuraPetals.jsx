import React from 'react';

const FLOATING_ITEMS = [
  { id: 1, type: 'flower', top: '14%', left: '18%', size: 22, delay: '0s', duration: '9s', opacity: 0.68 },
  { id: 2, type: 'flower', top: '28%', left: '78%', size: 25, delay: '1.6s', duration: '10.5s', opacity: 0.62 },
  { id: 3, type: 'petal', top: '22%', left: '56%', size: 15, delay: '0.7s', duration: '8s', opacity: 0.78, rotate: 35 },
  { id: 4, type: 'petal', top: '66%', left: '24%', size: 14, delay: '2.2s', duration: '9.5s', opacity: 0.72, rotate: -25 },
  { id: 5, type: 'petal', top: '74%', left: '46%', size: 13, delay: '1.2s', duration: '7.8s', opacity: 0.68, rotate: 75 },
  { id: 6, type: 'flower', top: '18%', left: '88%', size: 20, delay: '2.8s', duration: '11s', opacity: 0.48 },
  { id: 7, type: 'petal', top: '80%', left: '74%', size: 14, delay: '0.4s', duration: '8.6s', opacity: 0.7, rotate: 45 },
  { id: 8, type: 'petal', top: '52%', left: '91%', size: 16, delay: '2.0s', duration: '9.8s', opacity: 0.62, rotate: -40 },
  { id: 9, type: 'petal', top: '44%', left: '8%', size: 13, delay: '3.1s', duration: '8.8s', opacity: 0.55, rotate: 22 },
];

export default function SakuraPetals({ density = 'normal' }) {
  const items = density === 'subtle' ? FLOATING_ITEMS.slice(0, 5) : FLOATING_ITEMS;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10" aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-petal-float"
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            opacity: item.opacity,
          }}
        >
          {item.type === 'flower' ? (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Authentic notched 5-petal sakura blossom matching reference */}
              <g fill="#E7D6D1" fillOpacity="0.94">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    d="M18 17C14.8 13.5 13.6 7.8 16.3 4.8C17.1 4 17.6 5.4 18 5.8C18.4 5.4 18.9 4 19.7 4.8C22.4 7.8 21.2 13.5 18 17Z"
                    transform={`rotate(${deg} 18 18)`}
                  />
                ))}
              </g>
              <circle cx="18" cy="18" r="2.4" fill="#BA8D88" />
              {/* Tiny golden-amber stamen dots */}
              {[36, 108, 180, 252, 324].map((deg) => (
                <circle
                  key={deg}
                  cx="18"
                  cy="13.8"
                  r="0.65"
                  fill="#C4A478"
                  transform={`rotate(${deg} 18 18)`}
                />
              ))}
            </svg>
          ) : (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="none"
              style={{ transform: `rotate(${item.rotate || 0}deg)` }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C16.5 6.5 18 13.5 12 21C6 13.5 7.5 6.5 12 2Z"
                fill="#F7E6E1"
                fillOpacity="0.92"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
