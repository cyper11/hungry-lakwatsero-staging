import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Heart, Star, MapPin, Compass, BookOpen, ChevronRight, Plus, Trash2, Bell, Map, 
  MessageCircle, Leaf, RefreshCw, Home, X, Search, ThumbsUp, Bookmark, 
  ExternalLink, Share2, CheckCircle2, AlertCircle, User, Award, Globe, Flame, 
  Coffee, Clock, Send, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import { MOCK_TOURIST_POSTS, MOCK_RESTAURANTS, MOCK_FOOD_SPOTS } from '../data/mockTouristPosts';

const USE_MOCKS = import.meta.env.DEV;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < full
              ? 'text-emerald-400 fill-emerald-400'
              : 'text-emerald-950 fill-transparent border-emerald-900'
          }
        />
      ))}
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AuthorRoleBadge({ role }) {
  const styles = {
    'Verified Business': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    'Food Storyteller':  'bg-amber-500/10 border-amber-500/30 text-amber-400',
    'Admin':             'bg-sky-500/10 border-sky-500/30 text-sky-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5
        rounded-md border leading-none uppercase tracking-wide
        ${styles[role] || 'bg-emerald-950/20 border-emerald-500/10 text-emerald-500/70'}`}
    >
      {role === 'Verified Business' && <CheckCircle2 size={9} />}
      {role === 'Admin' && <Globe size={9} />}
      {role}
    </span>
  );
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function FeedSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gradient-to-b from-[#0a120e] to-[#08100c] border border-emerald-500/10 rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 bg-emerald-500/5 rounded" />
              <div className="h-2.5 w-16 bg-emerald-500/5 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-3/4 bg-emerald-500/5 rounded" />
            <div className="h-3 w-full bg-emerald-500/5 rounded" />
          </div>
          <div className="aspect-[16/9] w-full rounded-2xl bg-emerald-500/5" />
          <div className="flex justify-between pt-2">
            <div className="h-8 w-20 bg-emerald-500/5 rounded-xl" />
            <div className="h-8 w-20 bg-emerald-500/5 rounded-xl" />
            <div className="h-8 w-20 bg-emerald-500/5 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-gradient-to-b from-[#0a120e] to-[#08100c] border border-emerald-500/10 rounded-[28px] p-5 space-y-4">
        <div className="h-4 w-32 bg-emerald-500/5 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-emerald-500/5 rounded" />
              <div className="h-2.5 w-16 bg-emerald-500/5 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-b from-[#0a120e] to-[#08100c] border border-emerald-500/10 rounded-[28px] p-5 space-y-4">
        <div className="h-4 w-28 bg-emerald-500/5 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3.5 w-full bg-emerald-500/5 rounded" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TouristDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sharedPostId = searchParams.get('post');

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [feedPosts, setFeedPosts] = useState([]);
  const [featuredRests, setFeaturedRests] = useState([]);
  const [popularFoodSpots, setPopularFoodSpots] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Interactions
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [followedAuthors, setFollowedAuthors] = useState(new Set(['Sophia Mendoza'])); // Followed by default for demo
  const [expandedCommentsPostIds, setExpandedCommentsPostIds] = useState(new Set());
  const [newCommentTexts, setNewCommentTexts] = useState({});

  // ── Greeting text ──
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.firstName || 'Explorer';

  // ── Fetch Data & Merge with Mock Fallbacks ──
  useEffect(() => {
    let active = true;
    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch Posts from API
        let apiPosts = [];
        try {
          const res = await axios.get('/api/posts');
          apiPosts = Array.isArray(res.data) 
            ? res.data 
            : (res.data && Array.isArray(res.data.posts)) 
              ? res.data.posts 
              : [];
        } catch (e) {
          console.warn("API posts fetch skipped/failed, using mock fallback.");
        }
        
        // Merge API posts with MOCK tourist posts (dev only, prevent duplicates by ID)
        const mergedPosts = [...apiPosts];
        if (USE_MOCKS) {
          MOCK_TOURIST_POSTS.forEach(mockPost => {
            if (!mergedPosts.some(p => p.id === mockPost.id || p.caption === mockPost.content)) {
              mergedPosts.push(mockPost);
            }
          });
        }

        // Map API posts structure to UI format if needed
        const formattedPosts = mergedPosts.map(post => ({
          id: post.id,
          author: post.author || (post.first_name ? `${post.first_name} ${post.last_name}` : 'Business Owner'),
          authorAvatar: post.authorAvatar || (post.first_name ? `${post.first_name[0]}${post.last_name[0]}` : 'BO'),
          authorRole: post.authorRole || (post.restaurant_name ? 'Verified Business' : 'Tourist'),
          municipality: post.municipality || post.municipality_name || 'Cavite',
          created_at: post.created_at || new Date().toISOString(),
          category: post.category || (post.post_type === 'promo' ? 'Promos' : 'Restaurants'),
          title: post.title || (post.caption ? post.caption.slice(0, 40) + '...' : ''),
          content: post.content || post.caption || '',
          image: post.image || post.image_url || null,
          likes: post.likes || post.likes_count || 0,
          commentsCount: post.commentsCount || (post.comments ? post.comments.length : 0),
          comments: post.comments || [],
          restaurantId: post.restaurantId || post.restaurant_id || null,
          isFollowed: post.isFollowed !== undefined ? post.isFollowed : false,
          hashtags: Array.isArray(post.hashtags) 
            ? post.hashtags 
            : typeof post.hashtags === 'string'
              ? JSON.parse(post.hashtags)
              : []
        }));

        // 2. Fetch Restaurants
        let apiRests = [];
        try {
          const res = await axios.get('/api/restaurants?limit=3&sortBy=rating');
          apiRests = Array.isArray(res.data) ? res.data : [];
        } catch (e) {
          console.warn("API restaurants fetch failed.");
        }
        const mergedRests = apiRests.length > 0 ? apiRests.slice(0, 3) : (USE_MOCKS ? MOCK_RESTAURANTS : []);

        // 3. Fetch Popular spots (use high rated restaurants or mock spots)
        let apiSpots = [];
        try {
          const res = await axios.get('/api/restaurants?limit=6&sortBy=rating');
          apiSpots = Array.isArray(res.data) ? res.data : [];
        } catch (e) {
          console.warn("API spots fetch failed.");
        }
        const formattedSpots = apiSpots.length > 3
          ? apiSpots.slice(3, 6).map(r => ({
              id: r.id,
              name: r.name,
              municipality: r.municipality || 'Cavite',
              rating: r.rating || 4.5,
              image_url: r.image_url || r.featured_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
              description: r.description || 'Famous culinary destination in Cavite.'
            }))
          : (USE_MOCKS ? MOCK_FOOD_SPOTS : []);

        if (active) {
          setFeedPosts(formattedPosts);
          setFeaturedRests(mergedRests);
          setPopularFoodSpots(formattedSpots);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadDashboardData();
    return () => { active = false; };
  }, []);

  // ── Highlight shared post on mount ──
  useEffect(() => {
    if (sharedPostId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`post-${sharedPostId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-emerald-500/50', 'ring-offset-4', 'ring-offset-black');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-emerald-500/50', 'ring-offset-4', 'ring-offset-black');
          }, 3500);
        }
      }, 600);
    }
  }, [sharedPostId, loading]);

  // ── Dynamic Hashtags Extraction ──
  const trendingHashtags = useMemo(() => {
    const counts = {};
    feedPosts.forEach(post => {
      let tags = post.hashtags || [];
      const captionText = post.content || '';
      const foundTags = captionText.match(/#\w+/g) || [];
      const allTags = [...new Set([...tags, ...foundTags].map(t => t.toLowerCase()))];
      
      allTags.forEach(tag => {
        if (tag && tag.startsWith('#')) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        views: `${count * 3.4 + 1.2}k views`,
        trend: count > 1 ? `+${count * 15}% growth` : 'Trending'
      }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
      return [
        { name: '#TagaytayBulalo', views: '15.2k views', trend: '+20% growth' },
        { name: '#CaviteFoodie', views: '12.8k views', trend: '+15% growth' },
        { name: '#HiddenGemsCavite', views: '9.4k views', trend: '+35% growth' },
        { name: '#LibericaCoffee', views: '7.1k views', trend: 'Trending' },
        { name: '#HeritageEats', views: '4.5k views', trend: 'Trending' }
      ];
    }
    return sorted.slice(0, 5);
  }, [feedPosts]);

  // ── Filtering Logic ──
  const filteredPosts = useMemo(() => {
    return feedPosts.filter(post => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.municipality.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (activeCategory === 'All') return true;
      if (activeCategory === 'Following') {
        return post.isFollowed || followedAuthors.has(post.author);
      }
      
      const postCat = (post.category || '').toLowerCase();
      if (activeCategory === 'Restaurants') {
        return postCat === 'restaurants' || post.restaurantId !== null;
      }
      if (activeCategory === 'Destinations') {
        return postCat === 'destinations';
      }
      if (activeCategory === 'Promos') {
        return postCat === 'promos';
      }
      return false;
    });
  }, [feedPosts, searchQuery, activeCategory, followedAuthors]);

  // ── Handlers ──

  const handleLike = useCallback((postId) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    // Toggle on server if it's a real post ID
    if (typeof postId === 'number') {
      axios.post(`/api/posts/${postId}/like`).catch(err => {
        console.warn('Like toggle failed:', err.message);
      });
    }
  }, []);

  const handleSave = useCallback((postId) => {
    setSavedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        toast.success('Removed from session.');
      } else {
        next.add(postId);
        toast.success('Post highlighted for this session.');
      }
      return next;
    });
  }, [toast]);

  const handleFollowToggle = useCallback((author) => {
    setFollowedAuthors(prev => {
      const next = new Set(prev);
      if (next.has(author)) {
        next.delete(author);
        toast.success(`Unfollowed ${author}`);
      } else {
        next.add(author);
        toast.success(`Following ${author}`);
      }
      return next;
    });
  }, [toast]);

  const handleShare = useCallback(async (post) => {
    const shareUrl = `${window.location.origin}/tourist-dashboard?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Post link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  }, [toast]);

  const toggleComments = useCallback((postId) => {
    setExpandedCommentsPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  const handleAddComment = (e, postId) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId]?.trim();
    if (!commentText) return;

    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Date.now(),
          author: `${user?.firstName || 'You'} ${user?.lastName || ''}`,
          avatar: (user?.firstName?.[0] || 'Y') + (user?.lastName?.[0] || 'U'),
          content: commentText
        };
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));

    setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));
    toast.success('Comment posted!');
  };

  return (
    <div className="w-full min-h-screen bg-[#030704] font-body text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300 pb-16">
      {/* Background glow meshes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-700/5 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8">
          
          {/* ═══════════════════════════════════════════════════════
              LEFT/CENTER: FEED SECTION
          ════════════════════════════════════════════════════════ */}
          <div className="w-full max-w-3xl mx-auto space-y-6">
            
            {/* Greeting glass banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0a120e] to-[#08100c] backdrop-blur-xl border border-emerald-500/10 rounded-[28px] p-6 shadow-lg shadow-black/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl" />
              <h1 className="font-display font-black text-white text-2xl md:text-3xl tracking-tight leading-none">
                {greeting}, <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.2)]">{firstName}</span>!
              </h1>
              <p className="text-emerald-500/70 text-xs md:text-sm font-semibold tracking-wide uppercase mt-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                Let's explore Cavite's finest foodie secrets today
              </p>
            </div>

            {/* Mobile/Tablet Horizontal Chips for Trending (Phase 3) */}
            <div className="lg:hidden space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Flame size={12} className="fill-emerald-400" />
                Trending Around Cavite
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
                {trendingHashtags.map((tag, idx) => (
                  <button
                    key={tag.name}
                    onClick={() => setSearchQuery(tag.name)}
                    className="snap-start shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold
                               bg-emerald-950/30 border border-emerald-500/10 hover:border-emerald-400/40
                               text-emerald-300 transition-all"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search + Category Tabs */}
            <div className="bg-gradient-to-b from-[#0a120e] to-[#08100c] backdrop-blur-xl border border-emerald-500/10 rounded-[24px] p-4 space-y-4 sticky top-16 md:top-20 z-20 shadow-lg shadow-black/20">
              {/* Search input */}
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                <input
                  type="text"
                  placeholder="Search foodie stories, locations, dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#040806] border border-emerald-500/10 rounded-2xl pl-10 pr-10 py-3 
                             text-sm text-slate-100 placeholder:text-emerald-900 focus:outline-none 
                             focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/60 hover:text-emerald-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {[
                  { id: 'All', label: 'All Posts' },
                  { id: 'Following', label: 'Following' },
                  { id: 'Restaurants', label: 'Restaurants' },
                  { id: 'Destinations', label: 'Destinations' },
                  { id: 'Promos', label: 'Promos' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-300
                      ${activeCategory === cat.id
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : 'bg-[#040806] text-slate-400 border-emerald-500/5 hover:text-emerald-300 hover:border-emerald-500/20 hover:bg-emerald-500/5'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile/Tablet Horizontal Carousel for Featured Restaurants (Phase 3) */}
            {activeCategory === 'All' && !loading && (
              <div className="lg:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Coffee size={14} />
                    Featured Restaurants
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {featuredRests.map(rest => (
                    <div 
                      key={rest.id} 
                      className="snap-start shrink-0 w-64 bg-gradient-to-b from-[#0a120e] to-[#08100c] backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-3.5 flex gap-3 shadow-md"
                    >
                      <img
                        src={rest.image_url}
                        alt={rest.name}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-white text-xs font-bold truncate leading-tight">{rest.name}</p>
                          <p className="text-emerald-500/70 text-[10px] truncate leading-none mt-0.5">{rest.municipality}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
                            <Star size={10} className="fill-emerald-400" />
                            {rest.rating}
                          </div>
                          <Link
                            to={`/restaurant/${rest.id}`}
                            className="text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center"
                          >
                            View <ChevronRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feed List */}
            {loading ? (
              <FeedSkeleton />
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map(post => {
                  const liked = likedPostIds.has(post.id);
                  const isSaved = savedPostIds.has(post.id);
                  const isFollowed = followedAuthors.has(post.author) || post.isFollowed;
                  const isExpanded = expandedCommentsPostIds.has(post.id);
                  const commentText = newCommentTexts[post.id] || '';

                  return (
                    <article
                      key={post.id}
                      id={`post-${post.id}`}
                      className="bg-gradient-to-b from-[#0a120e] to-[#08100c] backdrop-blur-xl 
                                 border border-emerald-500/10 rounded-[28px] overflow-hidden 
                                 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-emerald-900/10
                                 hover:border-emerald-500/20 hover:-translate-y-0.5
                                 transition-all duration-300 relative group/card"
                    >
                      {/* Author Header */}
                      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm shrink-0">
                          {post.authorAvatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm leading-none truncate">
                              {post.author}
                            </span>
                            <AuthorRoleBadge role={post.authorRole} />
                          </div>
                          <p className="flex items-center gap-1 text-emerald-500/60 text-[10px] mt-1 leading-none">
                            <MapPin size={9} className="shrink-0" />
                            {post.municipality}
                            <span className="text-emerald-900">·</span>
                            <Clock size={9} className="shrink-0" />
                            {timeAgo(post.created_at)}
                          </p>
                        </div>

                        {/* Follow Toggle */}
                        {post.authorRole !== 'Verified Business' && (
                          <button
                            onClick={() => handleFollowToggle(post.author)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border
                              ${isFollowed
                                ? 'bg-transparent border-emerald-500/20 text-emerald-500/60 hover:border-red-500/20 hover:text-red-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}
                          >
                            {isFollowed ? 'Following' : '+ Follow'}
                          </button>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="px-5 pb-3 space-y-2">
                        {post.title && (
                          <h3 className="font-display font-bold text-white text-base md:text-lg leading-snug">
                            {post.title}
                          </h3>
                        )}
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.hashtags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => setSearchQuery(tag)}
                                className="text-xs font-bold text-emerald-400 hover:underline"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Full-bleed Photo */}
                      {post.image && (
                        <div className="relative mx-5 mb-0 rounded-2xl overflow-hidden aspect-[16/9] bg-emerald-950/20 shadow-inner">
                          <img
                            src={post.image}
                            alt={post.title || "Travel photo"}
                            className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-black/60 backdrop-blur-md border border-white/10 text-emerald-300 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                              <MapPin size={10} />
                              {post.municipality}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reaction metrics */}
                      <div className="flex items-center justify-between px-5 py-2.5 text-[11px] text-emerald-500/60 border-b border-emerald-500/5">
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp size={12} className="text-emerald-400 fill-emerald-400/30" />
                          {post.likes + (liked ? 1 : 0)} likes
                        </span>
                        <button onClick={() => toggleComments(post.id)} className="hover:text-emerald-400 transition-colors">
                          {post.commentsCount} comments
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-stretch px-3 py-1.5 bg-[#050b07]/40">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                            ${liked ? 'text-emerald-400 bg-emerald-500/5 scale-105' : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/5'}`}
                        >
                          <ThumbsUp size={15} className={liked ? 'fill-emerald-400' : ''} />
                          Like
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all duration-200"
                        >
                          <MessageCircle size={15} />
                          Comment
                        </button>
                        <button
                          onClick={() => handleSave(post.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                            ${isSaved ? 'text-amber-400 bg-amber-500/5 scale-105' : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/5'}`}
                        >
                          <Bookmark size={15} className={isSaved ? 'fill-amber-400' : ''} />
                          Save
                        </button>
                        <button
                          onClick={() => handleShare(post)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all duration-200"
                        >
                          <Share2 size={15} />
                          Share
                        </button>
                      </div>

                      {/* Comments Dropdown Drawer (Facebook style) */}
                      {isExpanded && (
                        <div className="bg-[#060e0a] border-t border-emerald-500/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                          {/* Add a comment */}
                          <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0">
                              {(user?.firstName?.[0] || 'Y') + (user?.lastName?.[0] || 'U')}
                            </div>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className="w-full bg-[#030704] border border-emerald-500/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-emerald-900 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all"
                              />
                              <button
                                type="submit"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500/40 hover:text-emerald-400 transition-colors p-1"
                              >
                                <Send size={13} />
                              </button>
                            </div>
                          </form>

                          {/* List of comments */}
                          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide pr-1">
                            {post.comments && post.comments.length > 0 ? (
                              post.comments.map(c => (
                                <div key={c.id} className="flex gap-2.5 items-start text-xs">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center font-bold text-[10px] text-emerald-400 shrink-0">
                                    {c.avatar || c.author[0]}
                                  </div>
                                  <div className="flex-1 bg-[#030704] border border-emerald-500/5 rounded-2xl px-3 py-2">
                                    <p className="font-extrabold text-white text-[11px] leading-tight mb-0.5">{c.author}</p>
                                    <p className="text-slate-300 leading-relaxed text-[11px]">{c.content}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-[11px] text-emerald-800/60 py-3">No comments yet. Be the first to start the conversation!</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* View restaurant CTA footer link */}
                      {post.restaurantId && (
                        <div className="px-5 py-3.5 bg-emerald-500/5 border-t border-emerald-500/5 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-500/40">Post linked to verified venue</span>
                          <Link
                            to={`/restaurant/${post.restaurantId}`}
                            className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors group"
                          >
                            Explore Restaurant
                            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Compass}
                title="No posts found"
                description="Try searching for another dish, area, or clear your filters to explore more."
              />
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
              RIGHT SIDEBAR: DESKTOP WIDGET PANEL (visible on lg+)
          ════════════════════════════════════════════════════════ */}
          <aside className="hidden lg:flex flex-col space-y-6 shrink-0 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide pb-6">
            
            {/* WIDGET 1: Featured Restaurants */}
            <div className="bg-gradient-to-b from-[#0a120e] to-[#08100c] backdrop-blur-xl border border-emerald-500/10 rounded-[28px] p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-emerald-400/80 tracking-wider uppercase">Featured Restaurants</span>
                <Link to="/map" className="text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors">Map <ChevronRight size={10} className="inline-block" /></Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="shimmer h-12 rounded-xl" />
                  <div className="shimmer h-12 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-3.5">
                  {featuredRests.map(rest => (
                    <div key={rest.id} className="flex gap-3 group">
                      <img
                        src={rest.image_url}
                        alt={rest.name}
                        className="w-12 h-12 object-cover rounded-xl shrink-0 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-white text-xs font-bold truncate leading-tight group-hover:text-emerald-300 transition-colors">{rest.name}</p>
                          <p className="text-emerald-500/60 text-[10px] mt-0.5 truncate leading-none">{rest.category || 'Local Dining'} · {rest.municipality}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <StarRating rating={rest.rating} size={10} />
                          <Link
                            to={`/restaurant/${rest.id}`}
                            className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 flex items-center"
                          >
                            Explore <ChevronRight size={9} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WIDGET 2: Trending Hashtags */}
            <div className="bg-gradient-to-b from-[#0a120e] to-[#08100c] backdrop-blur-xl border border-emerald-500/10 rounded-[28px] p-5 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={14} className="text-amber-400" />
                <h3 className="font-display font-extrabold text-white text-sm">Trending in Cavite</h3>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-emerald-950/20 rounded w-full" />
                  <div className="h-4 bg-emerald-950/20 rounded w-5/6" />
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {trendingHashtags.map((tag, idx) => (
                    <li key={tag.name} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-emerald-950/40 border border-emerald-500/10 text-[10px] font-black text-emerald-400 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => setSearchQuery(tag.name)}
                          className="text-white text-xs font-bold truncate block hover:text-emerald-400 text-left w-full"
                        >
                          {tag.name}
                        </button>
                        <p className="text-emerald-500/40 text-[9px] flex items-center gap-1.5 mt-0.5">
                          {tag.views}
                          <span className="text-emerald-950">·</span>
                          <span className="text-emerald-400 font-medium">{tag.trend}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* WIDGET 3: Popular Food Spots */}
            <div className="bg-gradient-to-b from-[#0a120e] to-[#08100c] backdrop-blur-xl border border-emerald-500/10 rounded-[28px] p-5 shadow-lg shadow-black/20">
              <span className="text-[11px] font-bold text-emerald-400/80 tracking-wider uppercase block mb-4">Popular Food Spots</span>
              
              {loading ? (
                <div className="shimmer h-36 rounded-2xl" />
              ) : (
                <div className="space-y-4">
                  {popularFoodSpots.map(spot => (
                    <div key={spot.id} className="relative rounded-2xl overflow-hidden aspect-[16/9] group bg-emerald-950/20 border border-emerald-500/10">
                      <img
                        src={spot.image_url}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex flex-col justify-end">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-white truncate w-3/4">{spot.name}</h4>
                          <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold shrink-0">
                            <Star size={9} className="fill-emerald-400" />
                            {spot.rating}
                          </span>
                        </div>
                        <p className="text-emerald-500/60 text-[9px] mt-0.5 truncate">{spot.description}</p>
                      </div>
                      <Link 
                        to={spot.id ? `/restaurant/${spot.id}` : "/map"}
                        className="absolute inset-0 z-10"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
