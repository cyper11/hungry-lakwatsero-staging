import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function EmptyState({ title, description, icon: Icon, cta, ctaLink }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 space-y-4 my-4 animate-scale-in">
      <div className="relative">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full bg-[#82c341]/10 animate-pulse opacity-75" />
        
        {/* Brand Icon Badge */}
        <div className="relative w-16 h-16 rounded-full bg-secondary border border-primary/10 flex items-center justify-center text-[#82c341]">
          {Icon ? <Icon size={22} className="text-[#82c341]" /> : <Logo variant="icon" height={32} />}
        </div>
      </div>
      
      <div className="space-y-1.5 max-w-xs">
        <h3 className="font-display font-bold text-primary text-sm">{title}</h3>
        <p className="text-muted text-xs leading-relaxed">{description}</p>
      </div>

      {cta && ctaLink && (
        <Link to={ctaLink} className="btn-primary text-xs py-2 px-4 mt-2">
          {cta}
        </Link>
      )}
    </div>
  );
}
