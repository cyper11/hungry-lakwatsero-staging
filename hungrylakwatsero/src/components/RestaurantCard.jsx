import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, ChevronRight, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Fallback placeholder ─────────────────────────────────────────────────────
const FOOD_PLACEHOLDER =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75&auto=format&fit=crop';

// ── Rating stars ─────────────────────────────────────────────────────────────
function RatingStars({ rating, size = 13 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size + 1}
          className={
            i < full
              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.6)]'
              : half && i === full
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-forest-700 fill-transparent'
          }
        />
      ))}
    </span>
  );
}

// ── Size config map ───────────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: {
    imageAspect: 'aspect-[16/9]',
    padding: 'p-3',
    nameSize: 'text-sm',
    descSize: 'text-[11px]',
    showDesc: false,
    badgePad: 'px-2 py-0.5 text-[10px]',
    starSize: 11,
    ratingTextSize: 'text-xs',
    addressSize: 'text-[10px]',
  },
  md: {
    imageAspect: 'aspect-[4/3]',
    padding: 'p-4',
    nameSize: 'text-base',
    descSize: 'text-xs',
    showDesc: true,
    badgePad: 'px-2.5 py-1 text-[11px]',
    starSize: 13,
    ratingTextSize: 'text-xs',
    addressSize: 'text-xs',
  },
  lg: {
    imageAspect: 'aspect-[16/10]',
    padding: 'p-5',
    nameSize: 'text-xl',
    descSize: 'text-sm',
    showDesc: true,
    badgePad: 'px-3 py-1 text-xs',
    starSize: 15,
    ratingTextSize: 'text-sm',
    addressSize: 'text-sm',
  },
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const isOpen = status?.toLowerCase() === 'open';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide ${
        isOpen ? 'text-emerald-400' : 'text-rose-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOpen
            ? 'bg-emerald-400 shadow-[0_0_4px_1px_rgba(52,211,153,0.7)]'
            : 'bg-rose-400 shadow-[0_0_4px_1px_rgba(251,113,133,0.7)]'
        }`}
      />
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
}

// ── Ripple component ──────────────────────────────────────────────────────────
function RippleEffect({ ripples }) {
  return (
    <>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="absolute rounded-full bg-rose-400/40 pointer-events-none"
          style={{ width: r.size, height: r.size, top: r.y, left: r.x }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ── Premium shimmer skeleton ──────────────────────────────────────────────────
function SkeletonCard({ cfg }) {
  return (
    <div className="rounded-3xl bg-card border border-primary/10 overflow-hidden w-full">
      <div className={`relative ${cfg.imageAspect} shimmer-premium`} />
      <div className={`${cfg.padding} flex flex-col gap-3`}>
        <div className="h-4 w-3/4 rounded-full shimmer-premium" />
        <div className="h-3 w-1/2 rounded-full shimmer-premium" />
        <div className="h-3 w-2/3 rounded-full shimmer-premium" />
        <div className="border-t border-primary/10 mt-1" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded-full shimmer-premium" />
          <div className="w-7 h-7 rounded-full shimmer-premium" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RestaurantCard({
  restaurant = {},
  onFavoriteToggle,
  isFavorited = false,
  size = 'md',
  onClick,
}) {
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const [ripples, setRipples] = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Show skeleton if restaurant has no meaningful data
  if (!restaurant || !restaurant.id) {
    return <SkeletonCard cfg={cfg} />;
  }

  const {
    id,
    name = 'Unnamed Restaurant',
    description,
    address,
    municipality_name,
    average_rating = 0,
    rating_count = 0,
    primary_image,
    cuisine_type,
    status,
  } = restaurant;

  const imgSrc = primary_image || FOOD_PLACEHOLDER;

  const handleFavorite = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Ripple origin relative to button
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y, size }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);

      if (typeof onFavoriteToggle === 'function') {
        onFavoriteToggle(restaurant.id);
      }
    },
    [onFavoriteToggle, restaurant.id]
  );

  const cardClasses = `group block rounded-3xl bg-card backdrop-blur-md shadow-sm
    border border-primary/10 overflow-hidden card-glow-hover
    hover:-translate-y-2 hover:border-emerald-500/25 hover:shadow-leaf-lg
    transition-all duration-300 ease-out focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-emerald-500/60 text-left w-full cursor-pointer`;

  const CardWrapper = onClick ? 'div' : Link;
  const wrapperProps = onClick
    ? {
        onClick: () => onClick(restaurant),
        className: cardClasses,
        'aria-label': `View details for ${name}`,
        role: 'button',
        tabIndex: 0,
      }
    : {
        to: `/restaurant/${id}`,
        className: cardClasses,
        'aria-label': `View details for ${name}`,
      };

  return (
    <CardWrapper {...wrapperProps}>
      {/* ── Image section ──────────────────────────────────────────────────── */}
      <div className={`img-zoom-wrapper relative ${cfg.imageAspect} overflow-hidden`}>
        {/* Shimmer placeholder while image loads */}
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer-premium z-10" />
        )}

        <img
          src={imgSrc}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-700
            group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            if (e.target.src !== FOOD_PLACEHOLDER) {
              e.target.src = FOOD_PLACEHOLDER;
            }
            setImgLoaded(true);
          }}
          loading="lazy"
        />

        {/* Cinematic gradient overlay */}
        <div className="overlay-cinematic absolute inset-0 pointer-events-none" />

        {/* Hover shimmer sweep */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100
            transition-opacity duration-500 overflow-hidden"
        >
          <div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full
              transition-transform duration-700 ease-in-out
              bg-gradient-to-r from-transparent via-white/8 to-transparent
              skew-x-12"
          />
        </div>

        {/* Top-left: municipality badge — glass-premium */}
        {municipality_name && (
          <div className="absolute top-3 left-3 z-20">
            <span
              className={`glass-premium inline-flex items-center gap-1 font-semibold
                tracking-wide rounded-full border border-white/20
                shadow-[0_2px_12px_rgba(0,0,0,0.3)] ${cfg.badgePad}`}
            >
              <MapPin size={9} className="inline shrink-0 text-emerald-300" />
              <span className="text-white/90">{municipality_name}</span>
            </span>
          </div>
        )}

        {/* Top-right: cuisine badge — glass-premium, offset for heart */}
        {cuisine_type && (
          <div className="absolute top-3 right-3 pr-10 z-20">
            <span
              className={`glass-premium inline-flex items-center gap-1 font-medium
                rounded-full border border-white/20
                shadow-[0_2px_12px_rgba(0,0,0,0.3)] ${cfg.badgePad}`}
            >
              <Utensils size={9} className="inline shrink-0 text-amber-300" />
              <span className="text-white/85">{cuisine_type}</span>
            </span>
          </div>
        )}

        {/* Favorite heart button with ripple + glow pulse */}
        <motion.button
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          whileTap={{ scale: 0.85 }}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center
            rounded-full backdrop-blur-md border transition-all duration-300
            min-w-[36px] min-h-[36px] z-30 overflow-hidden
            ${
              isFavorited
                ? 'bg-rose-500/90 border-rose-400/60 text-white hover:bg-rose-600 animate-glow-pulse'
                : 'bg-black/40 border-white/20 text-white/80 hover:bg-rose-500/80 hover:border-rose-400/60 hover:text-white'
            }`}
        >
          <RippleEffect ripples={ripples} />
          <Heart
            size={15}
            className={`relative z-10 transition-transform duration-200 ${
              isFavorited ? 'fill-white scale-110' : 'fill-transparent'
            }`}
          />
        </motion.button>

        {/* Bottom-left: status */}
        {status && (
          <div className="absolute bottom-2.5 left-3 z-20">
            <div className="glass-premium rounded-full px-2.5 py-1 border border-white/15">
              <StatusDot status={status} />
            </div>
          </div>
        )}
      </div>

      {/* ── Content section ────────────────────────────────────────────────── */}
      <div className={`${cfg.padding} flex flex-col gap-2`}>
        {/* Name */}
        <h3
          className={`font-display font-bold text-primary leading-snug line-clamp-2
            group-hover:text-emerald-300 transition-colors duration-300
            ${cfg.nameSize}`}
        >
          {name}
        </h3>

        {/* Rating row */}
        <div className="flex items-center gap-2 flex-wrap">
          <RatingStars rating={average_rating} size={cfg.starSize} />
          <span
            className={`font-bold text-amber-400 text-glow-gold ${cfg.ratingTextSize}`}
          >
            {average_rating.toFixed(1)}
          </span>
          <span className={`text-muted/70 ${cfg.ratingTextSize}`}>
            ({rating_count.toLocaleString()}{' '}
            {rating_count === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Address */}
        {address && (
          <p
            className={`flex items-start gap-1.5 text-muted/80 line-clamp-1 ${cfg.addressSize}`}
          >
            <MapPin
              size={cfg.starSize - 1}
              className="shrink-0 mt-0.5 text-muted/60 group-hover:text-emerald-400 transition-colors duration-300"
            />
            <span className="leading-snug">{address}</span>
          </p>
        )}

        {/* Description (md/lg only) */}
        {cfg.showDesc && description && (
          <p
            className={`text-muted/70 line-clamp-2 leading-relaxed tracking-wide ${cfg.descSize}`}
          >
            {description}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-primary/10 mt-1" />

        {/* View Details CTA */}
        <div className="flex items-center justify-between">
          <span
            className="text-emerald-400 text-xs font-semibold tracking-widest uppercase
              group-hover:text-emerald-300 transition-colors duration-200"
          >
            View Details
          </span>
          <span
            className="w-7 h-7 flex items-center justify-center rounded-full
              bg-emerald-600/20 border border-emerald-500/20
              text-emerald-400
              group-hover:bg-emerald-500 group-hover:text-white
              group-hover:border-emerald-400
              group-hover:shadow-[0_0_12px_rgba(52,211,153,0.5)]
              transition-all duration-300"
          >
            <ChevronRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </CardWrapper>
  );
}
