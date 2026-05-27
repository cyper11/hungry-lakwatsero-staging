import React from 'react';
import eatyLogoNew from '../assets/hungry-lakwatsero-logo-new.png';

export default function Logo({ className = '', height = 40 }) {
  // Respecting the STRICT logo usage rules:
  // - ONLY render the exact imported new image.
  // - No SVGs, no custom text replacements, no styling overrides to the artwork.
  // - Maintain exact aspect ratio, no stretching or cropping.
  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ height: `${height}px` }}
    >
      <img
        src={eatyLogoNew}
        alt="HungryLakwatsero"
        className="h-full w-auto object-contain rounded-xl"
        style={{ 
          height: '100%',
          maxWidth: '100%'
        }}
        loading="eager"
      />
    </div>
  );
}
