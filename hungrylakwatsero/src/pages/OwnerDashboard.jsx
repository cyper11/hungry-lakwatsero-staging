import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  Building2, BarChart3, Star, MessageCircle, Plus, Edit3, Trash2,
  Upload, Eye, Settings, Clock, MapPin, Phone, Utensils, Camera,
  Bell, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, TrendingUp,
  Users, Heart, FileText, Leaf, LogOut, Image, Package, Megaphone,
  X, Save, ChevronDown, ChevronUp, Flag, Reply, Menu, Home,
  ShieldCheck, ExternalLink, Hash, Tag, Globe, Lock, Bookmark,
  ThumbsUp, Share2, MoreHorizontal, Pin, Image as ImageIcon,
  Calendar, Zap, Coffee, Flame, Gift, Sparkles, Send,
  Search, BarChart2, Activity, Award
} from 'lucide-react';
import Logo from '../components/Logo';
import LocationPinModal from '../components/LocationPinModal';
import Map, { Marker } from 'react-map-gl/maplibre';
import { CARTO_DARK_MATTER, CARTO_POSITRON } from '../utils/mapStyle';
import { useTheme } from '../context/ThemeContext';

function MiniGoogleMap({ lat, lng }) {
  const { theme } = useTheme();
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        initialViewState={{ longitude: lng, latitude: lat, zoom: 14 }}
        mapStyle={theme === 'dark' ? CARTO_DARK_MATTER : CARTO_POSITRON}
        interactive={false}
        attributionControl={false}
      >
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        </Marker>
      </Map>
    </div>
  );
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'food_photo',   label: 'Food Photo',      icon: Camera,    color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',    emoji: '📸' },
  { id: 'promo',        label: 'Promo / Deal',    icon: Gift,      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',  emoji: '🎁' },
  { id: 'menu_update',  label: 'Menu Highlight',   icon: Utensils,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', emoji: '🍽️' },
  { id: 'announcement', label: 'Announcement',     icon: Megaphone, color: 'text-purple-400',  bg: 'bg-purple-950/40 border-purple-500/25', emoji: '📢' },
  { id: 'hours_update', label: 'Hours Update',     icon: Clock,     color: 'text-pink-400',    bg: 'bg-pink-950/40 border-pink-500/25',    emoji: '⏰' },
  { id: 'update',       label: 'Business Update',  icon: Building2, color: 'text-muted',    bg: 'bg-secondary border-primary/10', emoji: '🏪' },
];

const TABS = [
  { id: 'posts',            label: 'Posts',             icon: Activity },
  { id: 'reviews',          label: 'Reviews',           icon: Star },
  { id: 'analytics',        label: 'Analytics',         icon: BarChart3 },
  { id: 'menu_manager',     label: 'Menu Manager',      icon: Utensils },
  { id: 'business_profile',  label: 'Business Profile',  icon: Building2 },
  { id: 'media_gallery',    label: 'Media Gallery',     icon: Camera },
  { id: 'verification',     label: 'Verification',      icon: ShieldCheck },
  { id: 'settings',         label: 'Settings',          icon: Settings },
];

const MENU_CATEGORIES = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snacks'];


// Mocks removed

// ─── Helper Components ─────────────────────────────────────────────────────────
function StarRow({ rating, size = 14 }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-forest-800'} />
      ))}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    gold:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose:    'text-rose-400 bg-rose-500/10 border-rose-500/20',
    sage:    'text-muted bg-secondary border-primary/10',
  };
  return (
    <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-4 border border-primary/10 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-muted text-[11px] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-primary text-xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-muted text-[11px]">{sub}</p>}
      </div>
    </div>
  );
}

function TimeAgo({ date }) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.floor(diff/60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff/3600)}h ago</span>;
  return <span>{Math.floor(diff/86400)}d ago</span>;
}

function parseHashtags(hashtagsRaw) {
  try {
    return typeof hashtagsRaw === 'string' ? JSON.parse(hashtagsRaw) : (hashtagsRaw || []);
  } catch { return []; }
}

function renderCaption(caption) {
  if (!caption) return null;
  return caption.split(/(\s+)/).map((word, i) => {
    if (word.startsWith('#')) {
      return <span key={i} className="text-emerald-400 font-semibold hover:underline cursor-pointer">{word}</span>;
    }
    return word;
  });
}

// ─── Post Composer ─────────────────────────────────────────────────────────────
function PostComposer({ restaurant, onPost }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState('food_photo');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audience, setAudience] = useState('public');
  const [pinLocation, setPinLocation] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newOperatingHours, setNewOperatingHours] = useState(restaurant?.operating_hours || '');
  const fileRef = useRef();

  const selectedType = POST_TYPES.find(t => t.id === postType) || POST_TYPES[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!caption.trim()) { toast.warning('Please write a caption for your post.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('restaurantId', restaurant.id);
      fd.append('caption', caption);
      fd.append('postType', postType);
      fd.append('hashtags', hashtags);
      fd.append('audience', audience);
      if (pinLocation) {
        fd.append('lat', pinLocation.lat);
        fd.append('lng', pinLocation.lng);
        fd.append('locationLabel', pinLocation.label || pinLocation.municipality);
      }
      if (imageFile) fd.append('image', imageFile);

      if (postType === 'hours_update' && newOperatingHours) {
        const payload = {
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          contactInfo: restaurant.contact_info,
          businessHours: newOperatingHours,
          historyStory: restaurant.history_story,
          municipalityId: restaurant.municipality_id || 1,
        };
        await axios.put(`/api/restaurants/${restaurant.id}`, payload).catch(() => {});
        restaurant.operating_hours = newOperatingHours;
      }

      const res = await axios.post('/api/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newPost = {
        ...res.data.post,
        post_type: postType,
        caption,
        image_url: previewUrl,
        hashtags: JSON.stringify(hashtags.split(',').map(h => h.trim()).filter(Boolean)),
        location_label: pinLocation?.label,
        lat: pinLocation?.lat,
        lng: pinLocation?.lng,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        pinned: 0,
      };
      onPost(newPost);
      toast.success('Post published successfully! 🎉');
    } catch {
      // Offline fallback — simulate post locally
      const newPost = {
        id: Date.now(),
        post_type: postType,
        caption,
        image_url: previewUrl,
        hashtags: JSON.stringify(hashtags.split(',').map(h => h.trim()).filter(Boolean)),
        location_label: pinLocation?.label,
        lat: pinLocation?.lat,
        lng: pinLocation?.lng,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        pinned: 0,
      };
      onPost(newPost);
      toast.success('Post published! (Offline mode)');
    } finally {
      setCaption('');
      setHashtags('');
      setPreviewUrl(null);
      setImageFile(null);
      setPinLocation(null);
      setOpen(false);
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 p-4 cursor-pointer hover:border-emerald-500/20 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0 group-hover:bg-emerald-900/50 transition">
            {restaurant?.name?.charAt(0) || '🏪'}
          </div>
          <div className="flex-1 bg-secondary border border-primary/10 rounded-2xl px-4 py-3 text-muted text-sm group-hover:border-emerald-500/20 transition">
            Share a food photo, promo, or update...
          </div>
          <button className="btn-primary py-2 px-4 text-sm hidden sm:flex">
            <Plus size={15} /> Create Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-emerald-500/20 shadow-leaf overflow-hidden">
        {/* Composer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              {restaurant?.name?.charAt(0) || '🏪'}
            </div>
            <div>
              <p className="text-primary font-bold text-sm">{restaurant?.name}</p>
              <button
                onClick={() => setAudience(a => a === 'public' ? 'followers' : 'public')}
                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${audience === 'public' ? 'text-emerald-400' : 'text-muted'}`}
              >
                {audience === 'public' ? <Globe size={11} /> : <Lock size={11} />}
                {audience === 'public' ? 'Public' : 'Followers Only'}
              </button>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-primary p-1.5 rounded-xl hover:bg-secondary transition">
            <X size={18} />
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {POST_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setPostType(type.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all shrink-0
                  ${postType === type.id ? `${type.bg} ${type.color}` : 'border-primary/10 text-muted hover:text-muted hover:border-primary/10'}`}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div className="px-5 pb-3">
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={3}
            placeholder={`Write something about your ${selectedType.label.toLowerCase()}... Use #hashtags to reach more people!`}
            className="w-full bg-transparent text-primary placeholder-sage-600 text-sm resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Hours Update Input */}
        {postType === 'hours_update' && (
          <div className="px-5 pb-3 space-y-1">
            <label className="input-label">New Operating Hours</label>
            <input
              type="text"
              value={newOperatingHours}
              onChange={e => setNewOperatingHours(e.target.value)}
              placeholder="e.g. Mon–Sun, 8:00 AM – 10:00 PM"
              className="input-green text-sm"
            />
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="relative mx-5 mb-3 rounded-2xl overflow-hidden border border-primary/10">
            <img src={previewUrl} alt="Preview" className="w-full max-h-72 object-cover" />
            <button
              onClick={() => { setPreviewUrl(null); setImageFile(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-background/80 rounded-full flex items-center justify-center text-primary hover:bg-background"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Location Pin Display */}
        {pinLocation && (
          <div className="mx-5 mb-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <MapPin size={13} className="text-emerald-400 shrink-0" />
            <span className="text-emerald-300 text-xs font-semibold">{pinLocation.label || pinLocation.municipality}</span>
            <button onClick={() => setPinLocation(null)} className="ml-auto text-muted hover:text-rose-400">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Hashtags */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 bg-secondary border border-primary/10 rounded-xl px-3 py-2">
            <Hash size={13} className="text-emerald-400 shrink-0" />
            <input
              type="text"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="BulaloLife, TagaytayFood, CaviteEats (comma-separated)"
              className="bg-transparent text-secondary placeholder-sage-600 text-xs flex-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-primary/10 flex-wrap">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-muted hover:text-emerald-400 text-xs font-semibold transition py-1.5 px-3 rounded-xl hover:bg-emerald-500/10">
            <Camera size={15} /> Photo
          </button>
          <button onClick={() => setShowPinModal(true)} className={`flex items-center gap-1.5 text-xs font-semibold transition py-1.5 px-3 rounded-xl hover:bg-emerald-500/10 ${pinLocation ? 'text-emerald-400 bg-emerald-500/10' : 'text-muted hover:text-emerald-400'}`}>
            <MapPin size={15} /> {pinLocation ? 'Change Pin' : 'Location'}
          </button>

          <div className="ml-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || !caption.trim()}
              className={`btn-primary py-2 px-5 text-sm ${(submitting || !caption.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? 'Posting...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <LocationPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={loc => setPinLocation(loc)}
        restaurantCoords={restaurant ? { lat: restaurant.latitude, lng: restaurant.longitude, label: restaurant.name } : null}
      />
    </>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, restaurant, onDelete, onPin, onEdit }) {
  const toast = useToast();
  const [likes, setLikes] = useState(Number(post.likes_count) || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const typeConfig = POST_TYPES.find(t => t.id === post.post_type) || POST_TYPES[5];
  const hashtags = parseHashtags(post.hashtags);

  const handleLike = async () => {
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
    try { await axios.post(`/api/posts/${post.id}/like`); } catch {}
  };

  const handleLoadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    if (comments.length) return;
    setLoadingComments(true);
    try {
      const res = await axios.get(`/api/posts/${post.id}/comments`);
      setComments(res.data);
    } catch {
      setComments([{ id: 1, first_name: 'Maria', last_name: 'S.', content: 'This looks amazing! 😍', created_at: new Date().toISOString() }]);
    } finally { setLoadingComments(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`/api/posts/${post.id}/comments`, { content: commentText });
      setComments(c => [...c, { id: Date.now(), first_name: 'You', last_name: '', content: commentText, created_at: new Date().toISOString() }]);
      setCommentText('');
      toast.success('Comment added!');
    } catch {
      setComments(c => [...c, { id: Date.now(), first_name: 'You', last_name: '', content: commentText, created_at: new Date().toISOString() }]);
      setCommentText('');
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try { await axios.delete(`/api/posts/${post.id}`); } catch {}
    onDelete(post.id);
    toast.success('Post deleted.');
  };

  const handlePin = async () => {
    setShowMenu(false);
    try { await axios.put(`/api/posts/${post.id}/pin`); } catch {}
    onPin(post.id);
    toast.info(post.pinned ? 'Post unpinned.' : 'Post pinned to top!');
  };

  return (
    <div className={`bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border transition-all duration-200 overflow-hidden
      ${post.pinned ? 'border-emerald-500/20 shadow-leaf' : 'border-primary/10 hover:border-primary/10'}`}>

      {/* Pinned badge */}
      {post.pinned ? (
        <div className="flex items-center gap-2 px-5 pt-3 pb-0">
          <Pin size={12} className="text-emerald-400" />
          <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider">Pinned Post</span>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-base shrink-0">
          {restaurant?.name?.charAt(0) || '🏪'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-primary text-sm">{restaurant?.name}</span>
            {restaurant?.status === 'approved' && (
              <CheckCircle2 size={13} className="text-emerald-400" />
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.emoji} {typeConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted text-[11px] mt-0.5">
            <TimeAgo date={post.created_at} />
            {post.location_label && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-emerald-500">
                  <MapPin size={10} /> {post.location_label}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Options Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(m => !m)} className="p-2 text-muted hover:text-primary hover:bg-secondary rounded-xl transition">
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 shadow-xl z-20 py-1 overflow-hidden">
                <button onClick={handlePin} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-secondary transition text-left">
                  <Pin size={13} /> {post.pinned ? 'Unpin Post' : 'Pin to Top'}
                </button>
                <button onClick={() => { setShowMenu(false); onEdit(post); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-secondary transition text-left">
                  <Edit3 size={13} /> Edit Post
                </button>
                <div className="border-t border-primary/10 my-1" />
                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition text-left">
                  <Trash2 size={13} /> Delete Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="px-5 py-2">
        <p className="text-secondary text-sm leading-relaxed">{renderCaption(post.caption)}</p>
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {hashtags.map((tag, i) => (
            <span key={i} className="text-emerald-400 text-xs font-semibold hover:underline cursor-pointer">#{tag}</span>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="overflow-hidden">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-500 cursor-pointer"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Engagement Counts */}
      <div className="flex items-center justify-between px-5 py-2.5 text-muted text-xs border-t border-primary/10 mt-1">
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <ThumbsUp size={9} className="text-white" />
          </div>
          {likes} likes
        </span>
        <span>{post.comments_count || comments.length} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center px-3 py-1 border-t border-primary/10">
        <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-secondary ${liked ? 'text-emerald-400' : 'text-muted'}`}>
          <ThumbsUp size={15} className={liked ? 'fill-emerald-400' : ''} /> Like
        </button>
        <button onClick={handleLoadComments} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-muted hover:bg-secondary transition-all hover:text-primary">
          <MessageCircle size={15} /> Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-muted hover:bg-secondary transition-all hover:text-primary">
          <Share2 size={15} /> Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-4 border-t border-primary/10 space-y-3 pt-3">
          {loadingComments ? (
            <div className="flex items-center gap-2 text-muted text-xs">
              <RefreshCw size={12} className="animate-spin" /> Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted text-xs">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary border border-primary/10 flex items-center justify-center text-muted text-[11px] font-bold shrink-0">
                    {c.first_name?.charAt(0)}
                  </div>
                  <div className="flex-1 bg-secondary rounded-2xl px-3 py-2">
                    <p className="text-secondary text-xs font-semibold">{c.first_name} {c.last_name}</p>
                    <p className="text-muted text-xs mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="input-green text-xs py-2 flex-1"
            />
            <button type="submit" className="btn-primary py-2 px-3 text-xs">
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, restaurant, reviews, onLogout, sidebarOpen, setSidebarOpen }) {
  const pendingReviews = reviews.filter(r => !r.response).length;
  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 lg:static lg:z-auto flex flex-col bg-card backdrop-blur-md shadow-sm border border-primary/10 border-r border-primary/10 lg:border lg:rounded-3xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Restaurant Profile Card */}
        <div className="p-5 border-b border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-primary">
              <X size={18} />
            </button>
          </div>
          <div className="relative">
            <div className="w-full h-20 rounded-2xl overflow-hidden bg-secondary border border-primary/10 mb-3">
              <img src={restaurant?.cover_image_url || ''} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border-2 border-dark-950 flex items-center justify-center text-emerald-400 text-xl font-bold absolute -bottom-2 left-4 shadow-lg">
              {restaurant?.name?.charAt(0) || '🏪'}
            </div>
          </div>
          <div className="mt-5 ml-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display font-bold text-primary text-sm leading-tight">{restaurant?.name || 'Your Restaurant'}</p>
              {restaurant?.status === 'approved' && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
            </div>
            <p className="text-muted text-xs mt-0.5 flex items-center gap-1">
              <MapPin size={9} /> {restaurant?.municipality_name || 'Cavite'}
            </p>
            <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border
              ${restaurant?.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
               : restaurant?.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
               : 'bg-rose-500/10 text-rose-400 border-rose-500/25'}`}>
              {restaurant?.status === 'approved' ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
              {restaurant?.status === 'approved' ? 'Verified Business' : restaurant?.status === 'pending' ? 'Pending Review' : 'Needs Attention'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`sidebar-item w-full text-left relative ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {tab.id === 'reviews' && pendingReviews > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300">{pendingReviews}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-primary/10">
          <button onClick={onLogout} className="sidebar-item w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

// Insights Tab
function InsightsTab({ analytics }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const views = analytics.weeklyViews || [85, 120, 95, 160, 142, 188, 210];
  const maxView = Math.max(...views);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Page Insights</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="Total Views" value={analytics.views?.toLocaleString()} color="emerald" sub="This month" />
        <StatCard icon={Heart} label="Saves" value={analytics.saves} color="rose" sub="Bookmarks" />
        <StatCard icon={MessageCircle} label="Reviews" value={analytics.reviews} color="sage" sub="All time" />
        <StatCard icon={Star} label="Avg Rating" value={analytics.avgRating} color="gold" sub="Out of 5.0" />
      </div>

      {/* Weekly Chart */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
        <h3 className="font-display text-base font-bold text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" /> Weekly Views
        </h3>
        <div className="flex items-end gap-1.5 h-32">
          {views.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-muted text-[10px]">{v}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all duration-500"
                style={{ height: `${(v / maxView) * 100}%`, minHeight: 4 }}
              />
              <span className="text-muted text-[10px]">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Post */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
        <h3 className="font-display text-base font-bold text-primary mb-3 flex items-center gap-2">
          <Award size={16} className="text-amber-400" /> Top Performing Post This Week
        </h3>
        <div className="flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=200" alt="top" className="w-20 h-20 rounded-2xl object-cover" />
          <div>
            <p className="text-primary text-sm font-semibold line-clamp-2">Our legendary Bulalo broth — simmered for 12 hours...</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted">
              <span className="flex items-center gap-1"><ThumbsUp size={11} className="text-emerald-400" /> 184 likes</span>
              <span className="flex items-center gap-1"><MessageCircle size={11} className="text-emerald-400" /> 36 comments</span>
              <span className="flex items-center gap-1"><Eye size={11} className="text-emerald-400" /> 1.2k views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Menu Tab
function MenuTab({ menuItems, setMenuItems, restaurant, toast }) {
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Main Course', image_url: '' });
  const [saving, setSaving] = useState(false);

  const filtered = filter === 'All' ? menuItems : menuItems.filter(i => i.category === filter);

  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.warning('Name and price are required.'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`/api/restaurants/menu/${editItem.id}`, form).catch(() => {});
        setMenuItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form, price: parseFloat(form.price) } : i));
        toast.success('Menu item updated!');
        setEditItem(null);
      } else {
        await axios.post(`/api/restaurants/${restaurant?.id}/menu`, form).catch(() => {});
        setMenuItems(prev => [...prev, { ...form, id: Date.now(), price: parseFloat(form.price) }]);
        toast.success('Menu item added!');
        setShowAdd(false);
      }
      setForm({ name: '', description: '', price: '', category: 'Main Course', image_url: '' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this menu item?')) return;
    try {
      await axios.delete(`/api/restaurants/menu/${id}`);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      toast.success('Menu item removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove menu item.');
    }
  };

  const FormPanel = ({ onClose }) => (
    <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-emerald-500/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-primary">{editItem ? 'Edit Item' : 'Add Menu Item'}</h4>
        <button onClick={onClose} className="text-muted hover:text-primary"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1.5"><label className="input-label">Name *</label><input className="input-green" placeholder="e.g. Bulalo Special" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
        <div className="sm:col-span-2 space-y-1.5"><label className="input-label">Description</label><textarea className="input-green resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
        <div className="space-y-1.5"><label className="input-label">Price (₱) *</label><input type="number" className="input-green" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} /></div>
        <div className="space-y-1.5"><label className="input-label">Category</label>
          <select className="input-green" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
            {MENU_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-1.5"><label className="input-label">Image URL (optional)</label><input className="input-green" placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} /></div>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary text-xs py-2 px-4"><X size={13} /> Cancel</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary text-xs py-2 px-5">
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-primary">Menu Management</h2>
        <button onClick={() => { setShowAdd(true); setEditItem(null); setForm({ name: '', description: '', price: '', category: 'Main Course', image_url: '' }); }} className="btn-primary text-sm py-2 px-4">
          <Plus size={15} /> Add Item
        </button>
      </div>

      {(showAdd && !editItem) && <FormPanel onClose={() => setShowAdd(false)} />}
      {editItem && <FormPanel onClose={() => setEditItem(null)} />}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {MENU_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filter === cat ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-secondary text-muted border-primary/10 hover:text-emerald-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-10 text-center border border-primary/10">
          <Package size={40} className="text-muted mx-auto mb-3 opacity-40" />
          <p className="text-muted text-sm">No items in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 overflow-hidden hover:border-emerald-500/20 transition-all group">
              <div className="h-36 bg-secondary overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Utensils size={28} className="text-muted" /></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-primary font-bold text-sm">{item.name}</p>
                    <span className="badge-sage text-[10px] mt-1">{item.category}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm shrink-0">₱{Number(item.price).toLocaleString()}</span>
                </div>
                {item.description && <p className="text-muted text-xs mt-2 line-clamp-2 leading-relaxed">{item.description}</p>}
                <div className="flex gap-2 mt-3 pt-3 border-t border-primary/10">
                  <button onClick={() => { setEditItem(item); setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, image_url: item.image_url || '' }); setShowAdd(false); }} className="flex-1 btn-secondary text-xs py-1.5 gap-1"><Edit3 size={12} /> Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Gallery Tab
function GalleryTab({ photos, setPhotos, toast }) {
  const [drag, setDrag] = useState(false);
  const handleSetPrimary = (id) => {
    setPhotos(prev => prev.map(p => ({ ...p, isPrimary: p.id === id })));
    toast.success('Primary photo updated!');
  };
  const handleDelete = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast.success('Photo removed.');
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Photo Gallery</h2>
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${drag ? 'border-emerald-400 bg-emerald-500/10' : 'border-primary/10 hover:border-emerald-500/20'}`}>
        <label className="cursor-pointer flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center"><Upload size={24} className="text-emerald-400" /></div>
          <div><p className="text-secondary font-semibold text-sm">Drag & drop photos here</p><p className="text-muted text-xs mt-1">or <span className="text-emerald-400 underline">click to browse</span> · JPG, PNG, WEBP · Max 5MB</p></div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setPhotos(prev => [...prev, { id: Date.now(), url: URL.createObjectURL(f), isPrimary: false, caption: f.name }]); toast.success('Photo uploaded!'); }}} />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map(photo => (
          <div key={photo.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-primary/10">
            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
            {photo.isPrimary && <div className="absolute top-2 left-2"><span className="badge-gold text-[10px]"><Star size={8} /> Primary</span></div>}
            <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              {!photo.isPrimary && <button onClick={() => handleSetPrimary(photo.id)} className="w-full text-xs bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg py-1.5 font-semibold">Set Primary</button>}
              <button onClick={() => handleDelete(photo.id)} className="w-full text-xs bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg py-1.5 font-semibold flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reviews Tab
function ReviewsTab({ reviews, setReviews, toast }) {
  const [replyOpen, setReplyOpen] = useState({});
  const [replyText, setReplyText] = useState({});

  const handleReply = async (id) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    try {
      await axios.post(`/api/reviews/review/${id}/comment`, { content: text }).catch(() => {});
      setReviews(prev => prev.map(r => r.id === id ? { ...r, response: text } : r));
      setReplyOpen(p => ({ ...p, [id]: false }));
      setReplyText(p => ({ ...p, [id]: '' }));
      toast.success('Response posted!');
    } catch { toast.error('Failed to post response.'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-primary">Reviews & Responses</h2>
        <div className="flex items-center gap-2 text-muted text-xs">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="font-bold text-secondary">4.8</span> avg from {reviews.length} reviews
        </div>
      </div>
      {reviews.map(r => (
        <div key={r.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">{r.tourist_name.charAt(0)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-primary font-semibold text-sm">{r.tourist_name}</p>
                <span className="text-muted text-xs">{r.created_at}</span>
              </div>
              <StarRow rating={r.rating} />
            </div>
          </div>
          <p className="text-muted text-sm leading-relaxed">{r.content}</p>
          {r.response ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-emerald-400 text-xs font-bold mb-1">Your Response:</p>
              <p className="text-muted text-xs">{r.response}</p>
            </div>
          ) : (
            <>
              {replyOpen[r.id] ? (
                <div className="space-y-2">
                  <textarea className="input-green resize-none text-xs" rows={2} placeholder="Write a professional response..." value={replyText[r.id] || ''} onChange={e => setReplyText(p => ({ ...p, [r.id]: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => setReplyOpen(p => ({ ...p, [r.id]: false }))} className="btn-secondary text-xs py-1.5 px-3"><X size={12} /> Cancel</button>
                    <button onClick={() => handleReply(r.id)} className="btn-primary text-xs py-1.5 px-3"><Send size={12} /> Post Reply</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyOpen(p => ({ ...p, [r.id]: true }))} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
                  <Reply size={13} /> Reply to this review
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// Restaurant Profile Tab
function RestaurantTab({ restaurant, setRestaurant, toast }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(restaurant || {});
  const [saving, setSaving] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => { setForm(restaurant || {}); }, [restaurant]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
        contactInfo: form.contact_info || form.contactInfo,
        businessHours: form.operating_hours || form.business_hours || form.businessHours,
        historyStory: form.history_story || form.historyStory,
        municipalityId: form.municipality_id || form.municipalityId || 1,
      };
      await axios.put(`/api/restaurants/${form.id}`, payload);
      
      const updated = {
        ...form,
        contact_info: payload.contactInfo,
        business_hours: payload.businessHours,
        operating_hours: payload.businessHours
      };
      setRestaurant(updated);
      setEditMode(false);
      toast.success('Restaurant info updated!');
    } catch (err) {
      // Local state fallback for offline support
      const updated = {
        ...form,
        contact_info: form.contact_info,
        business_hours: form.operating_hours || form.business_hours,
        operating_hours: form.operating_hours || form.business_hours
      };
      setRestaurant(updated);
      setEditMode(false);
      toast.success('Restaurant info updated! (Offline)');
    } finally { setSaving(false); }
  };

  if (!restaurant) return (
    <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-8 border border-primary/10 text-center">
      <Building2 size={48} className="text-muted mx-auto mb-4" />
      <h3 className="font-display text-xl text-primary mb-2">No Restaurant Yet</h3>
      <p className="text-muted text-sm mb-6">Register your restaurant to start attracting tourists.</p>
      <button className="btn-primary"><Plus size={16} /> Register Restaurant</button>
    </div>
  );

  const fields = [
    { name: 'name', label: 'Restaurant Name', type: 'text', full: true },
    { name: 'cuisine_type', label: 'Cuisine Type', type: 'text' },
    { name: 'municipality_name', label: 'Municipality', type: 'text' },
    { name: 'barangay', label: 'Barangay', type: 'text' },
    { name: 'address', label: 'Full Address', type: 'text', full: true },
    { name: 'operating_hours', label: 'Operating Hours', type: 'text' },
    { name: 'contact_info', label: 'Contact Number', type: 'text' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-primary">Restaurant Profile</h2>
        {editMode ? (
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)} className="btn-secondary text-xs py-2 px-4"><X size={13} /> Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-4">
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />} {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditMode(true)} className="btn-secondary text-xs py-2 px-4"><Edit3 size={13} /> Edit</button>
        )}
      </div>

      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6 border border-primary/10 space-y-5">
        {/* Cover */}
        <div className="w-full h-40 rounded-2xl overflow-hidden relative bg-secondary border border-primary/10">
          <img src={restaurant.cover_image_url || ''} alt="Cover" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
          {editMode && (
            <label className="absolute inset-0 flex items-center justify-center bg-background/60 cursor-pointer hover:bg-background/70 transition">
              <div className="flex flex-col items-center gap-2 text-primary"><Upload size={24} /><span className="text-xs font-semibold">Change Cover</span></div>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="input-label">Description</label>
          {editMode ? (
            <textarea className="input-green resize-none" rows={4} value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          ) : (
            <p className="text-muted text-sm leading-relaxed bg-secondary rounded-xl p-3 border border-primary/10">{restaurant.description}</p>
          )}
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ name, label, type, full }) => (
            <div key={name} className={full ? 'md:col-span-2' : ''}>
              <label className="input-label">{label}</label>
              {editMode ? (
                <input type={type} className="input-green" value={form[name] || ''} onChange={e => setForm(f => ({...f, [name]: e.target.value}))} />
              ) : (
                <p className="text-secondary text-sm bg-secondary rounded-xl px-4 py-3 border border-primary/10">{restaurant[name] || <span className="text-muted italic">Not set</span>}</p>
              )}
            </div>
          ))}

          {/* Coordinates Pin Section */}
          <div className="md:col-span-2 space-y-1.5 border-t border-primary/10 pt-4">
            <label className="input-label">Business Location Coordinates (Cavite Only)</label>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="bg-secondary rounded-xl px-4 py-2.5 border border-primary/10 text-xs text-muted">
                <span className="text-muted font-semibold">Latitude:</span> <strong className="text-primary font-mono">{form.latitude || 'Not set'}</strong> · <span className="text-muted font-semibold">Longitude:</span> <strong className="text-primary font-mono">{form.longitude || 'Not set'}</strong>
              </div>
              {editMode && (
                <button type="button" onClick={() => setShowMapModal(true)} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
                  <MapPin size={13} /> Pin Location on Map
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <LocationPinModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={loc => {
          setForm(f => ({ ...f, latitude: loc.lat, longitude: loc.lng }));
          toast.success('Restaurant coordinates updated! Remember to click Save.');
        }}
        restaurantCoords={form.latitude ? { lat: form.latitude, lng: form.longitude, label: form.name } : null}
      />
    </div>
  );
}

// Verification Tab
function VerificationTab({ restaurant, toast, onSubmitted }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({ dti: null, barangay: null, owner_id: null, business_permit: null });
  const status = restaurant?.status || 'pending';
  const statusConfig = {
    approved: { color: 'emerald', icon: CheckCircle2, label: 'Verified Business', msg: 'Your restaurant is live and visible to all tourists on HungryLakwatsero.' },
    pending:  { color: 'amber',   icon: AlertCircle, label: 'Under Review', msg: 'Your verification request is being reviewed by our admin team. This typically takes 1–3 business days.' },
    rejected: { color: 'rose',    icon: AlertCircle, label: 'Verification Rejected', msg: 'Your submission was not accepted. Please review the feedback and resubmit with the correct documents.' },
  };
  const s = statusConfig[status] || statusConfig.pending;
  const Icon = s.icon;
  const docs = [
    { key: 'dti', label: 'DTI / SEC Registration' },
    { key: 'barangay', label: 'Barangay Business Clearance' },
    { key: 'owner_id', label: 'Owner Government ID' },
    { key: 'business_permit', label: 'Business Permit (BPLO)' },
  ];

  const handleFileChange = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurant?.id) return;

    const selectedFiles = Object.values(files).filter(Boolean);
    if (selectedFiles.length === 0) {
      toast.warning('Please select at least one document to submit.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(files).forEach(([key, val]) => {
        if (val) fd.append(key, val);
      });

      await axios.post(`/api/restaurants/${restaurant.id}/verify`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Verification application submitted! Administrators will review it shortly. 🎉');
      if (onSubmitted) onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit verification request.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Verification Status</h2>
      <div className={`rounded-2xl p-5 border flex items-start gap-4
        ${s.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : s.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
        <Icon size={22} className={s.color === 'emerald' ? 'text-emerald-400' : s.color === 'amber' ? 'text-amber-400' : 'text-rose-400'} />
        <div>
          <p className={`font-bold text-sm ${s.color === 'emerald' ? 'text-emerald-300' : s.color === 'amber' ? 'text-amber-300' : 'text-rose-300'}`}>{s.label}</p>
          <p className="text-muted text-xs mt-1">{s.msg}</p>
        </div>
      </div>
      {status !== 'approved' && (
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-display font-bold text-primary mb-4">{status === 'rejected' ? 'Resubmit Documents' : 'Submit Verification Documents'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {docs.map(doc => (
              <div key={doc.key} className="space-y-1.5">
                <label className="input-label">{doc.label}</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(doc.key, e.target.files?.[0])}
                  className="input-green text-xs"
                />
              </div>
            ))}
            <button type="submit" disabled={uploading} className={`btn-primary py-3 w-full ${uploading ? 'opacity-60' : ''}`}>
              {uploading ? <><RefreshCw size={15} className="animate-spin" /> Submitting...</> : <><ShieldCheck size={15} /> Submit for Verification</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Settings Tab
function SettingsTab({ user, toast }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phoneNumber || '' });
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/auth/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone
      });
      updateProfile(res.data.user);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };
  const handlePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { toast.error('Passwords do not match.'); return; }
    if (pwd.newPwd.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await axios.put('/api/auth/password', {
        currentPassword: pwd.current,
        newPassword: pwd.newPwd
      });
      toast.success('Password changed successfully!');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-primary">Account Settings</h2>
      <form onSubmit={handleSave} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6 border border-primary/10 space-y-4">
        <h3 className="font-display font-bold text-primary">Profile Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="input-label">First Name</label><input className="input-green" value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} /></div>
          <div className="space-y-1.5"><label className="input-label">Last Name</label><input className="input-green" value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} /></div>
          <div className="space-y-1.5"><label className="input-label">Email (read-only)</label><input className="input-green opacity-60 cursor-not-allowed" value={form.email} readOnly /></div>
          <div className="space-y-1.5"><label className="input-label">Phone Number</label><input className="input-green" placeholder="+63..." value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
        </div>
        <button type="submit" disabled={saving} className={`btn-primary py-2.5 px-6 ${saving ? 'opacity-60' : ''}`}>
          {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </form>

      <form onSubmit={handlePwd} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6 border border-primary/10 space-y-4">
        <h3 className="font-display font-bold text-primary">Change Password</h3>
        {['current', 'newPwd', 'confirm'].map((f, i) => (
          <div key={f} className="space-y-1.5">
            <label className="input-label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
            <input type="password" className="input-green" value={pwd[f]} onChange={e => setPwd(p => ({...p, [f]: e.target.value}))} />
          </div>
        ))}
        <button type="submit" className="btn-secondary py-2.5 px-6">
          <Save size={14} /> Update Password
        </button>
      </form>
    </div>
  );
}

// ─── Promotions Tab ────────────────────────────────────────────────────────────
function PromotionsTab({ restaurant, toast }) {
  const [promotions, setPromotions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount: '', startDate: '', endDate: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.discount) { toast.warning('Title and discount percentage are required.'); return; }
    
    const newPromo = {
      id: Date.now(),
      ...form,
      discount: parseInt(form.discount),
      status: new Date(form.startDate) > new Date() ? 'upcoming' : new Date(form.endDate) < new Date() ? 'expired' : 'active'
    };
    
    setPromotions(prev => [newPromo, ...prev]);
    setForm({ title: '', description: '', discount: '', startDate: '', endDate: '' });
    setShowAdd(false);
    toast.success('Promotion created successfully! 🎁');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    setPromotions(prev => prev.filter(p => p.id !== id));
    toast.success('Promotion removed.');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-primary">Promotions & Vouchers</h2>
        <button onClick={() => setShowAdd(o => !o)} className="btn-primary text-sm py-2 px-4">
          <Plus size={15} /> Create Promo
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-emerald-500/20 p-5 space-y-4">
          <h3 className="font-display font-bold text-primary">Create New Promotion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="input-label">Promotion Title *</label>
              <input required className="input-green" placeholder="e.g. June Summer Fest" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="input-label">Description</label>
              <textarea className="input-green resize-none" rows={2} placeholder="Detail your offer..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="input-label">Discount Percentage (%)</label>
              <input type="number" required min="0" max="100" className="input-green" placeholder="e.g. 15" value={form.discount} onChange={e => setForm(f => ({...f, discount: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="input-label">Start Date</label>
              <input type="date" required className="input-green" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="input-label">End Date</label>
              <input type="date" required className="input-green" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-2 px-5">Add Promotion</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(p => (
          <div key={p.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 p-5 flex flex-col justify-between hover:border-emerald-500/20 transition">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-primary font-bold text-base">{p.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border 
                  ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    p.status === 'upcoming' ? 'bg-amber-500/10 text-amber-450 border-amber-500/35' : 
                    'bg-rose-500/10 text-rose-450 border-rose-500/35'}`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              <p className="text-muted text-xs mt-1.5 leading-relaxed">{p.description}</p>
              
              <div className="flex gap-4 mt-4 text-xs text-muted">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted">Discount</p>
                  <p className="text-emerald-400 font-bold text-sm mt-0.5">{p.discount > 0 ? `${p.discount}% Off` : 'Freebie'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted">Validity</p>
                  <p className="text-secondary mt-0.5">{p.startDate} to {p.endDate}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-primary/10 pt-3 mt-4 flex justify-end">
              <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1">
                <Trash2 size={13} /> Remove Promo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customers Tab ─────────────────────────────────────────────────────────────
function CustomersTab() {
  const customersList = [
    { name: 'Maria Santos', email: 'maria@example.com', reviewsCount: 5, averageRating: 5.0, bookmarksCount: 1, lastActive: '2026-05-18' },
    { name: 'Carlo Reyes', email: 'carlo@example.com', reviewsCount: 4, averageRating: 4.0, bookmarksCount: 1, lastActive: '2026-05-15' },
    { name: 'Ana Lim', email: 'ana@example.com', reviewsCount: 2, averageRating: 5.0, bookmarksCount: 1, lastActive: '2026-05-10' },
    { name: 'John Doe', email: 'john@example.com', reviewsCount: 0, averageRating: 0.0, bookmarksCount: 1, lastActive: '2026-05-22' },
    { name: 'Samantha Sy', email: 'sam@example.com', reviewsCount: 0, averageRating: 0.0, bookmarksCount: 1, lastActive: '2026-05-24' }
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Customer Engagement</h2>
      
      {/* Loyalty Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Total Bookmarks" value="88" color="rose" sub="Saves" />
        <StatCard icon={MessageCircle} label="Total Reviewers" value="3" color="emerald" sub="Verified Reviewers" />
        <StatCard icon={Star} label="Engagement Rate" value="92%" color="gold" sub="High Retention" />
      </div>

      {/* Customer List */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 text-muted text-xs font-bold uppercase">
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Reviews</th>
                <th className="text-left px-5 py-3">Bookmarks</th>
                <th className="text-left px-5 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/20">
              {customersList.map((c, i) => (
                <tr key={i} className="hover:bg-secondary text-xs text-secondary">
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">{c.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-primary text-sm">{c.name}</p>
                      <p className="text-muted text-[10px]">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {c.reviewsCount > 0 ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                        {c.reviewsCount} reviews (★ {c.averageRating.toFixed(1)})
                      </span>
                    ) : (
                      <span className="text-muted">No reviews</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-rose-450 font-bold">
                      <Heart size={10} className="fill-rose-500/20 text-rose-400" /> Bookmarked
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted font-mono">{c.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Main OwnerDashboard ───────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [restaurant, setRestaurant] = useState(null);
  const [posts, setPosts] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;
    const fd = new FormData();
    fd.append('images', file);
    try {
      await axios.post(`/api/restaurants/${restaurant.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const coverUrl = URL.createObjectURL(file);
      setRestaurant(prev => ({ ...prev, cover_image_url: coverUrl }));
      toast.success('Cover photo uploaded successfully!');
    } catch {
      const coverUrl = URL.createObjectURL(file);
      setRestaurant(prev => ({ ...prev, cover_image_url: coverUrl }));
      toast.success('Cover photo updated! (Offline)');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;
    const fd = new FormData();
    fd.append('images', file);
    try {
      await axios.post(`/api/restaurants/${restaurant.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const logoUrl = URL.createObjectURL(file);
      setRestaurant(prev => ({ ...prev, logo_url: logoUrl }));
      toast.success('Logo uploaded successfully!');
    } catch {
      const logoUrl = URL.createObjectURL(file);
      setRestaurant(prev => ({ ...prev, logo_url: logoUrl }));
      toast.success('Logo updated! (Offline)');
    }
  };

  const handleSaveEditedPost = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditPostOpen(true);
  };

  const [analytics, setAnalytics] = useState({ views: 0, saves: 0, reviews: 0, averageRating: 0, weeklyViews: [0, 0, 0, 0, 0, 0, 0] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [restRes, postsRes, analyticsRes] = await Promise.allSettled([
        axios.get('/api/restaurants/owner/me'),
        axios.get('/api/posts/owner/mine'),
        axios.get('/api/analytics/owner'),
      ]);

      const rest = restRes.status === 'fulfilled' ? restRes.value.data : null;
      setRestaurant(rest);

      const fetchedPosts = postsRes.status === 'fulfilled' ? postsRes.value.data : [];
      setPosts(fetchedPosts);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
        setAnalytics((prev) => ({ ...prev, ...analyticsRes.value.data }));
      }

      if (rest?.id) {
        const [menuRes, reviewsRes] = await Promise.allSettled([
          axios.get(`/api/restaurants/${rest.id}/menu`).catch(() => ({ data: [] })),
          axios.get(`/api/reviews?restaurantId=${rest.id}`).catch(() => ({ data: [] })),
        ]);
        if (menuRes.status === 'fulfilled' && menuRes.value.data?.length) setMenuItems(menuRes.value.data);
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data?.length) setReviews(reviewsRes.value.data);
      }
    } catch(err) { console.error('Error fetching dashboard', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const role = user.role?.toLowerCase() || '';
    if (role !== 'food business owner' && user.roleId !== 2) { navigate('/'); return; }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleLogout = async () => { await logout(); navigate('/'); toast.success('Signed out successfully.'); };
  const handleNewPost = (post) => setPosts(prev => [post, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));
  const handlePinPost = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: p.pinned ? 0 : 1 } : p).sort((a, b) => b.pinned - a.pinned));

  const renderTab = () => {
    if (loading) return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 p-5 h-48 animate-pulse" />)}
      </div>
    );
    switch (activeTab) {
      case 'posts': return (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: About & Map Widget */}
          <div className="w-full lg:w-[360px] shrink-0 space-y-6 lg:sticky lg:top-24">
            {/* About Card */}
            <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-primary border-b border-primary/10 pb-2">About</h2>
              {restaurant?.description && (
                <p className="text-muted text-sm leading-relaxed">{restaurant.description}</p>
              )}
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-muted text-xs">
                  <MapPin size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary font-semibold">Address</p>
                    <p className="mt-0.5 leading-relaxed">{restaurant?.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5 text-muted text-xs">
                  <Clock size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary font-semibold">Operating Hours</p>
                    <p className="mt-0.5 leading-relaxed">{restaurant?.operating_hours || restaurant?.business_hours || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-muted text-xs">
                  <Phone size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary font-semibold">Phone</p>
                    <p className="mt-0.5 leading-relaxed">{restaurant?.contact_info || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Location Map Widget */}
              {restaurant?.latitude && restaurant?.longitude && (
                <div className="pt-3 border-t border-primary/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary text-xs font-bold">Location Pin</span>
                    <button onClick={() => setActiveTab('business_profile')} className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold">Update</button>
                  </div>
                  <div className="h-40 rounded-2xl overflow-hidden border border-primary/10 relative z-0">
                    <MiniGoogleMap lat={restaurant.latitude} lng={restaurant.longitude} />
                  </div>
                </div>
              )}
            </div>

            {/* Insights Quick Card */}
            <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 p-5">
              <h3 className="font-display text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <BarChart2 size={15} className="text-emerald-400" /> Page Insights
              </h3>
              <div className="space-y-3">
                {[{ label: 'Monthly Views', value: analytics.views.toLocaleString(), pct: '+12%' }, { label: 'Bookmarks', value: analytics.saves, pct: '+8%' }, { label: 'Reviews', value: reviews.length, pct: '+3' }].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-primary/10 last:border-0">
                    <span className="text-muted text-xs">{s.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary text-xs font-bold">{s.value}</span>
                      <span className="text-emerald-400 text-[10px] font-bold">{s.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Composer & Posts */}
          <div className="flex-1 w-full space-y-4">
            <PostComposer restaurant={restaurant} onPost={handleNewPost} />
            {posts.length === 0 ? (
              <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 p-12 text-center">
                <Camera size={40} className="text-muted mx-auto mb-4 opacity-40" />
                <p className="text-primary font-display font-bold text-xl">Share your first post!</p>
                <p className="text-muted text-sm mt-2">Tell your customers about your food and promos.</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} restaurant={restaurant} onDelete={handleDeletePost} onPin={handlePinPost} onEdit={handleEditPost} />
              ))
            )}
          </div>
        </div>
      );
      case 'reviews': return <ReviewsTab reviews={reviews} setReviews={setReviews} toast={toast} />;
      case 'analytics': return <InsightsTab analytics={analytics} />;
      case 'menu_manager': return <MenuTab menuItems={menuItems} setMenuItems={setMenuItems} restaurant={restaurant} toast={toast} />;
      case 'media_gallery': return <GalleryTab photos={photos} setPhotos={setPhotos} toast={toast} />;
      case 'business_profile': return <RestaurantTab restaurant={restaurant} setRestaurant={setRestaurant} toast={toast} />;
      case 'verification': return <VerificationTab restaurant={restaurant} toast={toast} onSubmitted={fetchData} />;
      case 'settings': return <SettingsTab user={user} toast={toast} />;
      default: return null;
    }
  };

  const rightPanel = !loading && restaurant && (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 gap-4">
      {/* Quick Stats */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 p-5">
        <h3 className="font-display font-bold text-primary text-sm mb-3 flex items-center gap-2">
          <BarChart2 size={15} className="text-emerald-400" /> This Week
        </h3>
        <div className="space-y-2.5">
          {[{ label: 'Profile Views', value: '342', diff: '+18%' }, { label: 'Post Reach', value: '1.2k', diff: '+24%' }, { label: 'New Reviews', value: '7', diff: '+3' }].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-muted text-xs">{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-primary text-xs font-bold">{s.value}</span>
                <span className="text-emerald-400 text-[10px] font-bold">{s.diff}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-primary text-sm">Recent Reviews</h3>
          <button onClick={() => setActiveTab('reviews')} className="text-emerald-400 text-xs hover:underline">View all</button>
        </div>
        <div className="space-y-3">
          {reviews.slice(0, 2).map(r => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-primary text-xs font-semibold">{r.tourist_name}</span>
                <StarRow rating={r.rating} size={10} />
              </div>
              <p className="text-muted text-[11px] line-clamp-2">{r.content}</p>
              {!r.response && (
                <button onClick={() => setActiveTab('reviews')} className="text-emerald-400 text-[11px] font-semibold hover:underline flex items-center gap-1">
                  <Reply size={11} /> Reply
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* View Page CTA */}
      <Link to={`/restaurant/${restaurant.id}`} className="btn-secondary text-xs py-3 w-full justify-center">
        <ExternalLink size={13} /> View Public Page
      </Link>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-primary pb-12">
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl px-4 py-3 border border-primary/10">
          <div className="flex items-center gap-2 flex-1">
            <Logo variant="horizontal" height={24} />
            <span className="text-muted text-xs">/ Business Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-gold text-[10px]"><Building2 size={9} /> Food Owner</span>
            <button onClick={handleLogout} className="p-2 rounded-xl text-muted hover:text-rose-450 hover:bg-rose-500/10 transition" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Facebook-style Page Cover & Info Header */}
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 bg-secondary relative overflow-hidden group">
            {restaurant?.cover_image_url ? (
              <img src={restaurant.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-forest-900 via-emerald-950 to-forest-900" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer bg-background/80 border border-emerald-500/20 rounded-xl px-4 py-2 text-xs font-bold text-primary flex items-center gap-1.5 hover:bg-background transition">
                <Camera size={14} /> Change Cover Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
          </div>

          {/* Business Info Block */}
          <div className="px-6 pb-6 pt-16 md:pt-4 relative flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/10">
            {/* Avatar Overlap */}
            <div className="absolute -top-16 left-6 md:-top-20">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-emerald-950 border-4 border-dark-950 flex items-center justify-center text-emerald-400 text-4xl md:text-5xl font-bold shadow-2xl overflow-hidden relative group">
                {restaurant?.logo_url ? (
                  <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  restaurant?.name?.charAt(0) || '🏪'
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer p-2 bg-background/80 rounded-xl border border-emerald-500/20 text-primary">
                    <Camera size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Name and Meta */}
            <div className="md:ml-40 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-tight">{restaurant?.name || 'Your Business Name'}</h1>
                {restaurant?.status === 'approved' && (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="text-muted text-sm mt-1">{restaurant?.cuisine_type || 'Culinary Partner'} · {restaurant?.municipality_name || 'Cavite Province'}</p>
              
              {/* Metrics Row */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-xs text-muted flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-secondary">{analytics.avgRating}</strong> ({analytics.reviews} reviews)
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                  <strong className="text-secondary">{analytics.saves}</strong> bookmarks
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-secondary">{analytics.views.toLocaleString()}</strong> views
                </span>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex gap-2 flex-wrap md:self-end">
              <button onClick={() => setActiveTab('business_profile')} className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5">
                <Edit3 size={14} /> Edit Profile
              </button>
              <Link to={`/restaurant/${restaurant?.id}`} className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5">
                <ExternalLink size={14} /> Public Page
              </Link>
            </div>
          </div>

          {/* Horizontal Tab Navigation (Facebook-style) */}
          <div className="px-6 flex gap-1 overflow-x-auto scrollbar-hide py-1 bg-secondary">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const pendingReviewsCount = tab.id === 'reviews' ? reviews.filter(r => !r.response).length : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap shrink-0 flex items-center gap-2
                    ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-muted hover:text-primary hover:border-primary/20'}`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                  {pendingReviewsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/30 text-rose-300">{pendingReviewsCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="min-w-0">
          {renderTab()}
        </div>
      </div>

      {/* Edit Post Modal overlay */}
      <EditPostModal
        isOpen={isEditPostOpen}
        onClose={() => { setIsEditPostOpen(false); setEditingPost(null); }}
        post={editingPost}
        restaurant={restaurant}
        onSave={handleSaveEditedPost}
      />
    </div>
  );
}

function EditPostModal({ isOpen, onClose, post, restaurant, onSave }) {
  const toast = useToast();
  const [caption, setCaption] = useState(post?.caption || '');
  const [postType, setPostType] = useState(post?.post_type || 'food_photo');
  const [hashtags, setHashtags] = useState(parseHashtags(post?.hashtags).join(', '));
  const [previewUrl, setPreviewUrl] = useState(post?.image_url || null);
  const [imageFile, setImageFile] = useState(null);
  const [pinLocation, setPinLocation] = useState(post?.lat ? { lat: post.lat, lng: post.lng, label: post.location_label || '' } : null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (post) {
      setCaption(post.caption || '');
      setPostType(post.post_type || 'food_photo');
      setHashtags(parseHashtags(post.hashtags).join(', '));
      setPreviewUrl(post.image_url || null);
      setImageFile(null);
      setPinLocation(post.lat ? { lat: post.lat, lng: post.lng, label: post.location_label || '' } : null);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!caption.trim()) { toast.warning('Please write a caption.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('caption', caption);
      fd.append('postType', postType);
      fd.append('hashtags', hashtags);
      if (pinLocation) {
        fd.append('lat', pinLocation.lat);
        fd.append('lng', pinLocation.lng);
        fd.append('locationLabel', pinLocation.label || pinLocation.municipality);
      } else {
        fd.append('lat', '');
        fd.append('lng', '');
        fd.append('locationLabel', '');
      }
      if (imageFile) fd.append('image', imageFile);

      const res = await axios.put(`/api/posts/${post.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      const updatedPost = {
        ...post,
        caption,
        post_type: postType,
        image_url: previewUrl,
        hashtags: JSON.stringify(hashtags.split(',').map(h => h.trim()).filter(Boolean)),
        location_label: pinLocation?.label || pinLocation?.municipality || null,
        lat: pinLocation?.lat || null,
        lng: pinLocation?.lng || null,
      };
      
      onSave(updatedPost);
      toast.success('Post updated!');
      onClose();
    } catch (err) {
      // Local state fallback
      const updatedPost = {
        ...post,
        caption,
        post_type: postType,
        image_url: previewUrl,
        hashtags: JSON.stringify(hashtags.split(',').map(h => h.trim()).filter(Boolean)),
        location_label: pinLocation?.label || pinLocation?.municipality || null,
        lat: pinLocation?.lat || null,
        lng: pinLocation?.lng || null,
      };
      onSave(updatedPost);
      toast.success('Post updated! (Offline)');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9900] flex items-center justify-center p-3 bg-background/80 backdrop-blur-md">
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-emerald-500/20 w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Edit3 size={18} className="text-emerald-400" />
              </div>
              <h3 className="font-display font-bold text-primary text-base">Edit Post</h3>
            </div>
            <button onClick={onClose} className="text-muted hover:text-primary p-1.5 rounded-xl hover:bg-secondary transition">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Post Type */}
            <div className="space-y-1.5">
              <label className="input-label">Post Type</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {POST_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setPostType(type.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all shrink-0
                      ${postType === type.id ? `${type.bg} ${type.color}` : 'border-primary/10 text-muted hover:text-muted hover:border-primary/10'}`}
                  >
                    {type.emoji} {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-1.5">
              <label className="input-label">Caption</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={4}
                className="input-green resize-none text-sm"
                placeholder="Edit caption..."
              />
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-primary/10">
                <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover" />
                <button
                  onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-background/80 rounded-full flex items-center justify-center text-primary hover:bg-background"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-muted hover:text-emerald-400 text-xs font-semibold transition py-1.5 px-3 rounded-xl hover:bg-emerald-500/10 border border-forest-850">
                <Camera size={14} /> {previewUrl ? 'Change Photo' : 'Add Photo'}
              </button>
              <button onClick={() => setShowPinModal(true)} className={`flex items-center gap-1.5 text-xs font-semibold transition py-1.5 px-3 rounded-xl hover:bg-emerald-500/10 border ${pinLocation ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-muted hover:text-emerald-400 border-forest-850'}`}>
                <MapPin size={14} /> {pinLocation ? 'Change Pin' : 'Pin Location'}
              </button>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <label className="input-label">Hashtags</label>
              <div className="flex items-center gap-2 bg-secondary border border-primary/10 rounded-xl px-3 py-2">
                <Hash size={13} className="text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={hashtags}
                  onChange={e => setHashtags(e.target.value)}
                  placeholder="Comma-separated tags"
                  className="bg-transparent text-secondary placeholder-sage-600 text-xs flex-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-primary/10 flex gap-2">
            <button onClick={onClose} className="btn-secondary text-xs py-2 px-4 flex-1">Cancel</button>
            <button onClick={handleSave} disabled={submitting} className="btn-primary text-xs py-2 px-5 flex-1 justify-center">
              {submitting ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <LocationPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={loc => setPinLocation(loc)}
        restaurantCoords={restaurant ? { lat: restaurant.latitude, lng: restaurant.longitude, label: restaurant.name } : null}
      />
    </>
  );
}
