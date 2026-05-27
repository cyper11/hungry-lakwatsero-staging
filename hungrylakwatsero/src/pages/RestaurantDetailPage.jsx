import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Star, MapPin, Clock, Phone, Heart, Share2, Flag,
  ChevronLeft, ChevronRight, Camera, Utensils, MessageCircle,
  Send, ThumbsUp, ArrowLeft, Leaf, ExternalLink, ChevronDown,
  CheckCircle, Megaphone, Award
} from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';

// Mock removed

// ─── Star rating display ──────────────────────────────────────────────────────
function StarDisplay({ rating, size = 14, className = '' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < full
              ? 'text-gold-400 fill-gold-400'
              : half && i === full
              ? 'text-gold-400 fill-gold-400/40'
              : 'text-muted'
          }
        />
      ))}
    </span>
  );
}

// ─── Category emoji map ───────────────────────────────────────────────────────
const CATEGORY_EMOJI = {
  'Main Course': '🍽️',
  'Appetizer':   '🥗',
  'Dessert':     '🍮',
  'Beverage':    '☕',
  'Snacks':      '🍢',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [restaurant, setRestaurant]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isFavorite, setIsFavorite]   = useState(false);
  const [favLoading, setFavLoading]   = useState(false);
  const [shareToast, setShareToast]   = useState(false);

  // Gallery
  const [activeImg, setActiveImg]     = useState(0);

  // Menu
  const [menuTab, setMenuTab]         = useState('All');

  // Similar
  const [similarRestaurants, setSimilarRestaurants] = useState([]);

  // Reviews
  const [reviews, setReviews]         = useState([]);
  const [reviewPage, setReviewPage]   = useState(1);
  const REVIEWS_PER_PAGE = 5;

  // Review form
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Owner reply
  const [replyContent, setReplyContent] = useState({});

  // Feedback
  const [toast, setToast]   = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRestaurant = useCallback(async () => {
    try {
      const [resRes, revRes, allRes] = await Promise.all([
        axios.get(`/api/restaurants/${id}`),
        axios.get(`/api/reviews?restaurantId=${id}`),
        axios.get(`/api/restaurants`),
      ]);
      setRestaurant(resRes.data);
      setReviews(revRes.data?.reviews || revRes.data || []);
      setSimilarRestaurants(Array.isArray(allRes.data?.data) ? allRes.data.data : (Array.isArray(allRes.data) ? allRes.data : []));

      if (user) {
        try {
          const favsRes = await axios.get('/api/favorites');
          const list = favsRes.data;
          setIsFavorite(list.some(f => f.id === Number(id) || f.restaurantId === Number(id)));
        } catch { /* ignore */ }
      }
    } catch {
      setRestaurant(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { fetchRestaurant(); }, [fetchRestaurant]);

  // ── Favorite toggle ───────────────────────────────────────────────────────
  const handleFavoriteToggle = async () => {
    if (!user) { showToast('Sign in to save favorites.', 'error'); return; }
    setFavLoading(true);
    try {
      const res = await axios.post(`/api/favorites/toggle`, { restaurantId: Number(id) });
      setIsFavorite(res.data.isFavorite);
      showToast(res.data.isFavorite ? 'Added to favorites!' : 'Removed from favorites.');
    } catch {
      const next = !isFavorite;
      setIsFavorite(next);
      showToast(next ? 'Added to favorites!' : 'Removed from favorites.');
    } finally {
      setFavLoading(false);
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  // ── Submit review ─────────────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Sign in to write a review.', 'error'); return; }
    if (!reviewContent.trim()) { showToast('Review cannot be empty.', 'error'); return; }
    setReviewLoading(true);

    try {
      const fd = new FormData();
      fd.append('content', reviewContent);
      fd.append('ratingValue', ratingValue);
      if (reviewPhoto) fd.append('photo', reviewPhoto);
      await axios.post(`/api/reviews/restaurant/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Review posted! Thank you for your feedback.');
      setReviewContent(''); setReviewPhoto(null); setRatingValue(5);
      fetchRestaurant();
    } catch (err) {
      showToast('Review failed to post.', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Owner reply ───────────────────────────────────────────────────────────
  const handleOwnerReply = async (reviewId) => {
    const text = replyContent[reviewId]?.trim();
    if (!text) return;
    try {
      await axios.post(`/api/reviews/${reviewId}/reply`, { content: text });
      fetchRestaurant();
    } catch {
      showToast('Failed to post reply.', 'error');
      return;
    }
    setReplyContent(prev => ({ ...prev, [reviewId]: '' }));
    showToast('Response posted!');
  };

  // ── Report ────────────────────────────────────────────────────────────────
  const handleReport = async (type, entityId) => {
    const reason = window.prompt('Why are you reporting this content?');
    if (!reason || reason.trim().length < 5) return;
    try { await axios.post('/api/reports', { entityType: type, entityId, reason }); } catch { /* noop */ }
    showToast('Content reported. Our team will review it.');
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-emerald-500 animate-spin mb-4" />
        <p className="text-muted text-sm font-semibold">Loading culinary profile…</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <Utensils size={48} className="text-muted" />
        <h2 className="font-display text-2xl text-primary">Restaurant not found</h2>
        <Link to="/map" className="btn-secondary text-sm">← Back to Map</Link>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const images       = restaurant.images?.length ? restaurant.images : [];
  const primaryImage = images[activeImg]?.image_url
    || images.find(i => i.is_primary)?.image_url
    || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';

  let hoursObj = {};
  try {
    hoursObj = typeof restaurant.business_hours === 'string'
      ? JSON.parse(restaurant.business_hours)
      : (restaurant.business_hours || {});
  } catch { hoursObj = { Hours: restaurant.business_hours || 'See contact' }; }

  const menuCategories = ['All', 'Main Course', 'Appetizer', 'Dessert', 'Beverage', 'Snacks'];
  const filteredMenu = menuTab === 'All'
    ? (restaurant.menuItems || [])
    : (restaurant.menuItems || []).filter(i => i.category === menuTab);

  // Rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating_value) === star).length,
    pct: totalReviews ? Math.round((reviews.filter(r => Math.round(r.rating_value) === star).length / totalReviews) * 100) : 0,
  }));

  const avgRating = restaurant.average_rating
    ? Number(restaurant.average_rating)
    : (totalReviews ? reviews.reduce((s, r) => s + r.rating_value, 0) / totalReviews : 0);

  const isOwner = user && (user.id === restaurant.owner_id || user.roleId === 2 || user.role === 'Owner');
  const isAdmin = user && (user.roleId === 3 || user.role === 'Admin');
  const canReview = !isOwner && !isAdmin;

  const paginatedReviews = reviews.slice(0, reviewPage * REVIEWS_PER_PAGE);
  const hasMoreReviews   = reviews.length > reviewPage * REVIEWS_PER_PAGE;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`;

  return (
    <div className="min-h-screen bg-background text-primary pb-32 md:pb-10">

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toast.msg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-leaf-lg animate-fade-in-down flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-red-950/90 border border-red-700/50 text-red-300'
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
        }`}>
          {toast.type === 'error' ? '⚠️' : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Share toast ────────────────────────────────────────────────────── */}
      {shareToast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface/95 border border-primary/10 text-secondary shadow-lg animate-fade-in-down">
          🔗 Link copied to clipboard!
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HERO GALLERY                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(280px, 50vw, 520px)' }}>
        {/* Main image */}
        <img
          src={primaryImage}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-all duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'; }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-xl text-sm font-semibold text-secondary hover:text-white border border-primary/10 transition"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Gallery prev/next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-full border border-primary/10 text-secondary hover:text-emerald-400 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActiveImg(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-full border border-primary/10 text-secondary hover:text-emerald-400 transition"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Restaurant name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-5 pt-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-green">
              <MapPin size={11} />
              {restaurant.municipality_name}
            </span>
            {restaurant.cuisine_type && (
              <span className="badge-sage">
                <Utensils size={11} />
                {restaurant.cuisine_type}
              </span>
            )}
            {restaurant.status === 'approved' && (
              <span className="badge-gold">
                <CheckCircle size={11} />
                Verified
              </span>
            )}
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight drop-shadow-lg">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StarDisplay rating={avgRating} size={16} />
            <span className="text-gold-400 font-bold">{Number(avgRating || 0).toFixed(1)}</span>
            <span className="text-muted text-sm">({restaurant.rating_count || totalReviews} reviews)</span>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-4 flex gap-2">
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImg(idx)}
                className={`w-12 h-9 md:w-16 md:h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  idx === activeImg
                    ? 'border-emerald-500 shadow-leaf'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-forest-600'
                }`}
              >
                <img
                  src={img.image_url}
                  alt={img.caption || `Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=100&q=40'; }}
                />
              </button>
            ))}
            {images.length > 5 && (
              <div className="w-12 h-9 md:w-16 md:h-12 rounded-lg bg-card backdrop-blur-md shadow-sm border border-primary/10 border border-primary/10 flex items-center justify-center text-[10px] font-bold text-muted">
                +{images.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Photo count badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-card backdrop-blur-md shadow-sm border border-primary/10 border border-primary/10 rounded-full px-2.5 py-1 text-xs font-semibold text-muted">
          <Camera size={12} />
          {images.length} {images.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  ANNOUNCEMENTS BANNER                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {restaurant.announcements?.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-6 mt-5">
          {restaurant.announcements.map(ann => (
            <div key={ann.id} className="flex gap-3 p-4 rounded-2xl border border-gold-500/40 bg-gold-950/30 backdrop-blur-sm">
              <Megaphone size={18} className="text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gold-300 text-sm">{ann.title}</p>
                <p className="text-primary text-xs mt-0.5">{ann.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MAIN CONTENT                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* ── LEFT / MAIN COLUMN ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl p-5 md:p-7 border border-primary/10">
            <p className="text-secondary leading-relaxed text-sm md:text-base">{restaurant.description}</p>
            {restaurant.cuisine_type && (
              <div className="mt-5 flex flex-wrap gap-2">
                {restaurant.cuisine_type.split(',').map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-xs font-bold tracking-wide">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Heritage Story */}
          {restaurant.history_story && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-3xl p-5 md:p-7 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Leaf size={18} className="text-emerald-400" />
                <h2 className="font-display font-bold text-lg text-emerald-300">Our Culinary Heritage Story</h2>
              </div>
              <p className="text-secondary text-sm leading-relaxed italic">
                &ldquo;{restaurant.history_story}&rdquo;
              </p>
            </div>
          )}

          {/* ─ MENU ──────────────────────────────────────────────────────── */}
          <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 overflow-hidden">
            <div className="p-5 md:p-7 pb-0">
              <div className="flex items-center gap-2 mb-5">
                <Utensils size={18} className="text-emerald-400" />
                <h2 className="font-display font-bold text-xl text-primary">Menu</h2>
                <span className="badge-sage ml-auto">{(restaurant.menuItems || []).length} items</span>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
                {menuCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMenuTab(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition border whitespace-nowrap ${
                      menuTab === cat
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-leaf'
                        : 'bg-secondary text-muted border-primary/10 hover:bg-secondary hover:text-primary'
                    }`}
                  >
                    {CATEGORY_EMOJI[cat] || '🍴'} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu grid */}
            <div className="p-5 md:p-7 pt-0">
              {filteredMenu.length === 0 ? (
                <p className="text-center text-muted text-sm py-8 italic">No items in this category yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMenu.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-2xl bg-surface/60 border border-primary/10 hover:border-emerald-500/20 transition group"
                    >
                      {/* Image / emoji */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-secondary flex items-center justify-center shrink-0 border border-primary/10">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-2xl">{CATEGORY_EMOJI[item.category] || '🍴'}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-primary leading-tight">{item.name}</h3>
                          <span className="font-bold text-emerald-400 text-sm whitespace-nowrap shrink-0">
                            ₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                          {item.category}
                        </span>
                        {item.description && (
                          <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─ REVIEWS ───────────────────────────────────────────────────── */}
          <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 overflow-hidden">
            <div className="p-5 md:p-7 pb-0">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle size={18} className="text-emerald-400" />
                <h2 className="font-display font-bold text-xl text-primary">Reviews</h2>
              </div>

              {/* Rating summary */}
              <div className="flex flex-col sm:flex-row gap-6 p-5 rounded-2xl bg-secondary border border-primary/10 mb-6">
                {/* Big number */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="font-display font-bold text-5xl text-primary">{Number(avgRating || 0).toFixed(1)}</span>
                  <StarDisplay rating={avgRating} size={18} className="mt-1" />
                  <span className="text-muted text-xs mt-1">{restaurant.rating_count || totalReviews} reviews</span>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 space-y-1.5">
                  {ratingBreakdown.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-muted w-3 text-right shrink-0">{star}</span>
                      <Star size={11} className="text-gold-400 fill-gold-400 shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-surface/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted w-7 shrink-0">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write a review */}
            {canReview && (
              <div className="px-5 md:px-7 pb-0">
                <div className="p-5 rounded-2xl bg-surface/60 border border-primary/10 mb-6">
                  <h3 className="font-bold text-sm text-primary mb-4 flex items-center gap-2">
                    <Star size={14} className="text-gold-400" />
                    Write a Review
                  </h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Star selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted font-semibold">Your rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRatingValue(val)}
                            onMouseEnter={() => setHoverRating(val)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="star-btn p-0.5"
                          >
                            <Star
                              size={22}
                              className={val <= (hoverRating || ratingValue)
                                ? 'text-gold-400 fill-gold-400'
                                : 'text-muted'}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gold-400 font-bold">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || ratingValue]}
                      </span>
                    </div>

                    {/* Text area */}
                    <textarea
                      value={reviewContent}
                      onChange={e => setReviewContent(e.target.value)}
                      placeholder="Share your experience — food quality, service, ambiance, must-try dishes…"
                      rows={4}
                      required
                      className="input-green resize-none text-sm"
                    />

                    {/* Photo + submit */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-primary/10 text-xs font-semibold text-muted cursor-pointer hover:bg-secondary transition">
                        <Camera size={13} />
                        {reviewPhoto ? `✓ ${reviewPhoto.name.slice(0, 18)}…` : 'Add Photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => setReviewPhoto(e.target.files[0])} />
                      </label>
                      <span className="text-muted text-xs">Optional</span>
                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className="btn-primary ml-auto py-2 px-5 text-xs"
                      >
                        <Send size={13} />
                        {reviewLoading ? 'Posting…' : 'Post Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Review list */}
            <div className="px-5 md:px-7 pb-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-muted">
                  <MessageCircle size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                paginatedReviews.map(review => (
                  <div key={review.id} className="review-card">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-700 to-forest-800 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {review.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary">
                            {review.first_name} {review.last_name}
                            <span className="ml-1.5 text-xs text-muted font-normal">@{review.username}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarDisplay rating={review.rating_value} size={12} />
                            <span className="text-xs text-muted">
                              {new Date(review.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReport('review', review.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-950/30 transition"
                        title="Report Review"
                      >
                        <Flag size={13} />
                      </button>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-secondary leading-relaxed">{review.content}</p>

                    {/* Review image */}
                    {review.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-primary/10 max-h-48">
                        <img src={review.image_url} alt="Review photo" className="w-full object-cover" />
                      </div>
                    )}

                    {/* Owner replies */}
                    {review.comments?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {review.comments.map(comm => (
                          <div key={comm.id} className="flex gap-2 pl-3 border-l-2 border-emerald-500/20">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wide mb-1">
                                <Award size={10} /> Owner Response
                              </span>
                              <p className="text-xs text-primary">{comm.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Owner reply form */}
                    {(isOwner || isAdmin) && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyContent[review.id] || ''}
                          onChange={e => setReplyContent(prev => ({ ...prev, [review.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleOwnerReply(review.id)}
                          placeholder="Reply to this review…"
                          className="flex-1 bg-surface border border-primary/10 rounded-xl px-3 py-2 text-xs text-primary placeholder-sage-600 focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          onClick={() => handleOwnerReply(review.id)}
                          className="px-3 py-2 rounded-xl bg-emerald-800/60 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-700 transition text-xs font-bold"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Load more */}
              {hasMoreReviews && (
                <button
                  onClick={() => setReviewPage(p => p + 1)}
                  className="w-full py-3 rounded-2xl border border-primary/10 text-muted text-sm font-semibold hover:bg-secondary hover:text-primary hover:border-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <ChevronDown size={15} />
                  Load more reviews ({reviews.length - reviewPage * REVIEWS_PER_PAGE} remaining)
                </button>
              )}
            </div>
          </div>

        </div>{/* end left column */}

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Info card */}
          <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl p-5 border border-primary/10 space-y-4">
            <h3 className="font-display font-bold text-base text-primary border-b border-primary/10 pb-3">Information</h3>

            {/* Address */}
            <div className="flex gap-3 text-sm">
              <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-0.5">Address</p>
                <p className="text-secondary text-sm">{restaurant.address}</p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
                >
                  <ExternalLink size={11} />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Hours */}
            {Object.keys(hoursObj).length > 0 && (
              <div className="flex gap-3">
                <Clock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Hours</p>
                  {Object.entries(hoursObj).map(([days, hrs], i) => (
                    <div key={i} className="text-sm text-secondary">
                      <span className="text-muted">{days}:</span> {hrs}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {restaurant.contact_info && (
              <div className="flex gap-3">
                <Phone size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-0.5">Contact</p>
                  <a
                    href={`tel:${restaurant.contact_info}`}
                    className="text-secondary text-sm hover:text-emerald-300 transition"
                  >
                    {restaurant.contact_info}
                  </a>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-primary/10">
              <button
                onClick={handleFavoriteToggle}
                disabled={favLoading}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition border ${
                  isFavorite
                    ? 'bg-red-950/40 border-red-700/50 text-red-400 hover:bg-red-950/60'
                    : 'bg-card backdrop-blur-md shadow-sm border border-primary/10 border-primary/10 text-muted hover:text-primary hover:border-emerald-500/20'
                }`}
              >
                <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                {isFavorite ? 'Saved' : 'Save to Favorites'}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-card backdrop-blur-md shadow-sm border border-primary/10 border border-primary/10 text-muted hover:text-primary hover:border-emerald-500/20 transition"
              >
                <Share2 size={16} />
                Share
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary justify-center py-2.5 text-sm"
              >
                <MapPin size={15} />
                Get Directions
              </a>
            </div>
          </div>

          {/* Mini Map */}
          {restaurant.lat && restaurant.lng && (
            <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 overflow-hidden">
              <div className="p-4 pb-0">
                <h3 className="font-bold text-sm text-primary flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-emerald-400" />
                  Location
                </h3>
              </div>
              <div className="h-56">
                <MiniMap lat={restaurant.lat} lng={restaurant.lng} name={restaurant.name} />
              </div>
            </div>
          )}

        </div>

      </div>{/* end main grid */}

      {/* ══════════════════════════════════════════ */}
      {/*  SIMILAR RECOMMENDATIONS & NEARBY        */}
      {/* ══════════════════════════════════════════ */}
      <div className="mt-12 space-y-8">
        <div>
          <h3 className="font-display font-bold text-2xl text-primary mb-4 flex items-center gap-2">
            <Star size={24} className="text-gold-400" /> Similar Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarRestaurants
              .filter(r => r.id !== restaurant.id && (r.cuisine_type?.includes(restaurant.cuisine_type?.split(',')?.[0]) || r.municipality_name === restaurant.municipality_name))
              .slice(0, 3)
              .map(r => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))
            }
            {similarRestaurants.filter(r => r.id !== restaurant.id && (r.cuisine_type?.includes(restaurant.cuisine_type?.split(',')?.[0]) || r.municipality_name === restaurant.municipality_name)).length === 0 && (
              similarRestaurants.filter(r => r.id !== restaurant.id).slice(0,3).map(r => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-display font-bold text-2xl text-primary mb-4 flex items-center gap-2">
            <MapPin size={24} className="text-emerald-500" /> Nearby Attractions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-primary/10 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Camera size={20} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">Historical Sites</h4>
                <p className="text-xs text-muted">Within 5km radius</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-primary/10 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Leaf size={20} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">Nature Parks</h4>
                <p className="text-xs text-muted">Perfect for family</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-primary/10 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <MapPin size={20} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">Local Market</h4>
                <p className="text-xs text-muted">Buy fresh souvenirs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MOBILE STICKY BOTTOM BAR                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-20 inset-x-0 z-[100] md:hidden bg-card backdrop-blur-md shadow-sm border border-primary/10 border-t border-primary/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleFavoriteToggle}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition ${
            isFavorite ? 'text-red-400' : 'text-muted hover:text-primary'
          }`}
        >
          <Heart size={20} className={isFavorite ? 'fill-red-500 scale-110 transition-transform duration-300' : 'transition-transform duration-300'} />
          <span className="text-[10px] font-semibold">Save</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-muted hover:text-primary transition"
        >
          <Share2 size={20} />
          <span className="text-[10px] font-semibold">Share</span>
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1 justify-center py-3 text-sm"
        >
          <MapPin size={16} />
          Get Directions
        </a>
      </div>

    </div>
  );
}

// ─── Google Maps Embed ────────────────────────────────────
function MiniMap({ lat, lng, name }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface border border-primary/10 group">
      {/* Smooth Loading Animation */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-emerald-500 animate-pulse">Loading map...</p>
          </div>
        </div>
      )}

      {/* Custom Location Marker (Static center overlay since iframe panning doesn't sync with DOM) 
          We'll use a stylized iframe and a branded overlay badge instead to meet the "custom marker" feel 
          while keeping the interactive Google Map. */}
      
      <iframe
        title={`Google Map for ${name}`}
        className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ${loading ? 'opacity-0 scale-105' : 'opacity-90 hover:opacity-100 scale-100'}`}
        src={`https://maps.google.com/maps?q=${lat},${lng}&t=m&z=16&output=embed`}
        frameBorder="0"
        style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
        allowFullScreen=""
        aria-hidden="false"
        tabIndex="0"
        onLoad={() => setLoading(false)}
      ></iframe>

      {/* Decorative branding overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] group-hover:shadow-[inset_0_0_10px_rgba(16,185,129,0.2)] transition-shadow duration-300"></div>
      
      {/* Floating Branded Badge */}
      <div className="absolute bottom-3 left-3 pointer-events-none bg-card/90 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{name}</span>
      </div>
    </div>
  );
}
