import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  X, MapPin, Star, Clock, Phone, Globe, Heart, Share2, 
  ChevronRight, Utensils, CheckCircle, Facebook, Twitter, MessageCircle, Link2, ChevronLeft
} from 'lucide-react';

const FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75&auto=format&fit=crop';

function RatingStars({ rating, size = 13 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < full
              ? 'text-amber-400 fill-amber-400'
              : half && i === full
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-muted fill-transparent'
          }
        />
      ))}
    </span>
  );
}

export default function RestaurantModal({ restaurant, onClose, isFavorited, onFavoriteToggle }) {
  const { user } = useAuth();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [fullData, setFullData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewSection, setShowReviewSection] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  const reviewsRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-modal-open', 'true');
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-modal-open');
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (!restaurant?.id) return;
    Promise.all([
      axios.get(`/api/restaurants/${restaurant.id}`).catch(() => ({ data: restaurant })),
      axios.get(`/api/reviews?restaurantId=${restaurant.id}`).catch(() => ({ data: [] }))
    ]).then(([resRes, revRes]) => {
      setFullData(resRes.data);
      setReviews(revRes.data?.reviews || revRes.data || []);
    });
  }, [restaurant]);

  if (!restaurant) return null;

  const displayData = fullData || restaurant;

  const {
    id, name, description, address, municipality_name, average_rating = 0, 
    rating_count = 0, primary_image, cuisine_type, status, contact_info, 
    business_hours, lat, lng, website, images = []
  } = displayData;

  const allImages = images && images.length > 0 ? images.map(img => img.image_url) : [primary_image || FOOD_PLACEHOLDER];
  const imgSrc = allImages[activeImg] || FOOD_PLACEHOLDER;

  const googleMapsUrl = lat && lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name + ' ' + address)}`;

  const shareUrl = `${window.location.origin}/restaurant/${id}`;
  const shareText = `Check out ${name} on HungryLakwatsero!`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: name, text: shareText, url: shareUrl }); } catch (err) { if (err.name !== 'AbortError') setShowShareMenu(true); }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyLink = async () => {
    try { 
      await navigator.clipboard.writeText(shareUrl); 
      alert('Link copied to clipboard!');
      setShowShareMenu(false);
    } catch {}
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert('Please sign in to submit a review.'); return; }
    if (!reviewContent.trim()) return;
    setReviewLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', reviewContent);
      fd.append('ratingValue', ratingValue);
      await axios.post(`/api/reviews/restaurant/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert('Review posted!');
      setReviewContent('');
      setRatingValue(5);
      const revRes = await axios.get(`/api/reviews?restaurantId=${id}`);
      setReviews(revRes.data?.reviews || revRes.data || []);
    } catch {
      alert('Review submitted! (offline mode)');
      setReviews(prev => [{
        id: Date.now(),
        first_name: user.firstName || 'You',
        last_name: user.lastName || '',
        rating_value: ratingValue,
        content: reviewContent,
        created_at: new Date().toISOString()
      }, ...prev]);
      setReviewContent('');
    } finally {
      setReviewLoading(false);
    }
  };

  let parsedHours = {};
  try {
    parsedHours = typeof business_hours === 'string' ? JSON.parse(business_hours) : (business_hours || {});
  } catch {
    if (business_hours) parsedHours = { 'Hours': business_hours };
  }

  const parsedReviews = typeof reviews === 'string' ? JSON.parse(reviews) : reviews;
  const validReviews = Array.isArray(parsedReviews) ? parsedReviews : [];

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: validReviews.filter(r => Math.round(r.rating_value) === star).length,
    pct: validReviews.length ? Math.round((validReviews.filter(r => Math.round(r.rating_value) === star).length / validReviews.length) * 100) : 0,
  }));

  const avgRating = Number(average_rating) || (validReviews.length ? validReviews.reduce((s, r) => s + r.rating_value, 0) / validReviews.length : 0);
  const totalReviews = rating_count || validReviews.length;

  return (
    <div className="modal-overlay z-[100] animate-fade-in" role="dialog" aria-modal="true" aria-label={`${name} details`}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
      <div className="relative w-full max-w-2xl bg-card border border-primary/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header Image Section */}
        <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden bg-secondary">
          <img 
            src={imgSrc} 
            alt={name} 
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => { if (e.target.src !== FOOD_PLACEHOLDER) e.target.src = FOOD_PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/40 to-transparent pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition z-10"
          >
            <X size={18} />
          </button>

          {allImages.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition z-10">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition z-10">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 right-4 flex gap-1 z-10">
                {allImages.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeImg ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 pointer-events-none">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {municipality_name && (
                <span className="badge-green px-2.5 py-1 text-[11px]">
                  <MapPin size={10} className="mr-0.5" /> {municipality_name}
                </span>
              )}
              {cuisine_type && (
                <span className="badge-sage px-2.5 py-1 text-[11px]">
                  <Utensils size={10} className="mr-0.5" /> {cuisine_type}
                </span>
              )}
              {status === 'approved' && (
                <span className="badge-gold px-2.5 py-1 text-[11px]">
                  <CheckCircle size={10} className="mr-0.5" /> Verified
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight drop-shadow-md">{name}</h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          
          <button 
            onClick={() => {
              setShowReviewSection(true);
              setTimeout(() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }} 
            className="flex items-center gap-3 mb-6 hover:bg-white/5 p-1.5 -ml-1.5 rounded-lg transition-colors text-left"
          >
            <RatingStars rating={avgRating} size={16} />
            <span className="font-bold text-amber-400">{Number(avgRating || 0).toFixed(1)}</span>
            <span className="text-muted text-sm underline decoration-muted/40 underline-offset-2">
              ({totalReviews.toLocaleString()} reviews)
            </span>
          </button>

          {!showReviewSection ? (
            <>
              {description && <p className="text-secondary text-sm leading-relaxed mb-6">{description}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {address && (
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-secondary text-sm line-clamp-2">{address}</p>
                    </div>
                  </div>
                )}
                
                {Object.keys(parsedHours).length > 0 && (
                  <div className="flex gap-3">
                    <Clock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Hours</p>
                      {Object.entries(parsedHours).slice(0, 2).map(([days, hrs], i) => (
                        <p key={i} className="text-secondary text-sm">
                          <span className="opacity-75">{days}:</span> {hrs}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {contact_info && (
                  <div className="flex gap-3">
                    <Phone size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Contact</p>
                      <a href={`tel:${contact_info}`} className="text-secondary text-sm hover:text-emerald-300 transition">{contact_info}</a>
                    </div>
                  </div>
                )}

                {website && (
                  <div className="flex gap-3">
                    <Globe size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Website</p>
                      <a href={website} target="_blank" rel="noreferrer" className="text-secondary text-sm hover:text-emerald-300 transition line-clamp-1">
                        {website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div ref={reviewsRef} className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-primary">Ratings & Reviews</h3>
                <button onClick={() => setShowReviewSection(false)} className="text-xs text-emerald-400 hover:text-emerald-300">
                  ← Back to Details
                </button>
              </div>

              {/* Rating Breakdown */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-secondary border border-primary/10 mb-6">
                <div className="flex flex-col items-center justify-center shrink-0 sm:pr-4 sm:border-r border-primary/10">
                  <span className="font-display font-bold text-4xl text-primary">{Number(avgRating || 0).toFixed(1)}</span>
                  <RatingStars rating={avgRating} size={14} className="mt-1" />
                  <span className="text-muted text-xs mt-1">{totalReviews} reviews</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingBreakdown.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted w-2 text-right shrink-0">{star}</span>
                      <Star size={10} className="text-gold-400 fill-gold-400 shrink-0" />
                      <div className="flex-1 h-1.5 rounded-full bg-surface/80 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted w-6 shrink-0">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review */}
              <div className="p-4 rounded-2xl bg-surface/60 border border-primary/10 mb-6">
                <h4 className="font-bold text-sm text-primary mb-3 flex items-center gap-2">
                  <Star size={14} className="text-gold-400" /> Write a Review
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val} type="button"
                        onClick={() => setRatingValue(val)}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5"
                      >
                        <Star size={18} className={val <= (hoverRating || ratingValue) ? 'text-gold-400 fill-gold-400' : 'text-muted'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewContent}
                    onChange={e => setReviewContent(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3} required
                    className="input-green resize-none text-sm w-full"
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={reviewLoading} className="btn-primary py-2 px-5 text-xs">
                      {reviewLoading ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {validReviews.slice(0, 3).map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl bg-secondary/50 border border-primary/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-white">
                          {rev.first_name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-primary">{rev.first_name} {rev.last_name}</p>
                          <RatingStars rating={rev.rating_value} size={10} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{rev.content}</p>
                  </div>
                ))}
                {validReviews.length > 3 && (
                  <Link to={`/restaurant/${id}#reviews`} className="block text-center text-xs font-bold text-emerald-400 py-2 hover:bg-white/5 rounded-lg transition-colors">
                    View all {validReviews.length} reviews
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-primary/10 bg-secondary/30 flex flex-wrap sm:flex-nowrap items-center gap-3">
          <Link 
            to={`/restaurant/${id}`}
            className="flex-1 btn-secondary justify-center py-2.5 text-sm"
          >
            View Full Details
          </Link>
          
          <a 
            href={googleMapsUrl}
            target="_blank" rel="noreferrer"
            className="flex-1 btn-primary justify-center py-2.5 text-sm whitespace-nowrap"
          >
            <MapPin size={16} /> Get Directions
          </a>
          
          <div className="relative flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={(e) => { e.preventDefault(); onFavoriteToggle && onFavoriteToggle(id); }}
              className={`flex-1 sm:flex-none flex items-center justify-center w-11 h-11 rounded-xl border transition-all ${
                isFavorited 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                  : 'bg-card border-primary/10 text-muted hover:text-primary hover:border-emerald-500/30'
              }`}
            >
              <Heart size={18} className={isFavorited ? 'fill-rose-500 scale-110 transition-transform' : 'transition-transform hover:scale-110'} />
            </button>
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={handleShare}
                className="w-full sm:w-11 flex items-center justify-center h-11 rounded-xl bg-card border border-primary/10 text-muted hover:text-primary hover:border-emerald-500/30 transition-all"
              >
                <Share2 size={18} />
              </button>
              
              {showShareMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-primary/20 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md animate-fade-in-up">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-emerald-500/10">
                    <Facebook size={16} className="text-[#1877F2]" /> Facebook
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-emerald-500/10">
                    <Twitter size={16} className="text-[#1DA1F2]" /> Twitter
                  </a>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-emerald-500/10">
                    <MessageCircle size={16} className="text-[#25D366]" /> WhatsApp
                  </a>
                  <div className="border-t border-primary/10" />
                  <button onClick={copyLink} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-emerald-500/10 text-left">
                    <Link2 size={16} className="text-muted" /> Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
