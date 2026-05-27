import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView as useInViewObserver } from 'react-intersection-observer';
import Typewriter from 'typewriter-effect';
import {
  Search, MapPin, Star, BookOpen, Utensils, Users,
  ArrowRight, ChevronRight, Heart, TrendingUp, Leaf,
  Map, Compass, Award, Camera, Sparkles, Building2,
  ChevronDown, Play, Flame
} from 'lucide-react';
import { FiInstagram, FiTrendingUp } from 'react-icons/fi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import MapEmbed from '../components/MapEmbed';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantModal from '../components/RestaurantModal';
import Footer from '../components/Footer';
import CustomDropdown from '../components/CustomDropdown';
import HomeInteractiveMap from '../components/HomeInteractiveMap';

const MUNICIPALITIES = [
  'All Municipalities', 'Tagaytay City', 'Kawit', 'Imus City', 'Bacoor City',
  'Silang', 'Dasmariñas City', 'General Trias', 'Cavite City',
  'Carmona', 'Indang', 'Mendez', 'Amadeo', 'Alfonso', 'Tanza',
  'Rosario', 'Noveleta', 'Naic', 'Ternate', 'Maragondon',
  'Magallanes', 'General Emilio Aguinaldo', 'Trece Martires'
];

const DISHES = [
  { name: 'Pancit Estacion', origin: 'Cavite City', desc: 'Rice noodles in a thick, tangy mung bean sauce — a proud Caviteño tradition passed down for generations.', emoji: '🍜', color: 'emerald', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80' },
  { name: 'Kalamay Indang', origin: 'Indang', desc: 'Sticky sweet rice delicacy cooked in coconut milk inside a bamboo tube. A treasured festival staple.', emoji: '🍡', color: 'amber', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
  { name: 'Tagaytay Bulalo', origin: 'Tagaytay City', desc: 'Hearty beef shank soup simmered for hours — best enjoyed on Tagaytay\'s cool mountain breeze.', emoji: '🍲', color: 'emerald', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },
  { name: 'Imus Longganisa', origin: 'Imus City', desc: 'Garlicky, sour pork sausage with a distinct Caviteño profile. A breakfast staple of local heritage.', emoji: '🌭', color: 'amber', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80' },
  { name: 'Quesillo', origin: 'Kawit', desc: 'Soft, milky cheese curds in brine — a colonial-era delicacy with Spanish and Filipino roots.', emoji: '🧀', color: 'emerald', img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
  { name: 'Puto Biñan', origin: 'Imus City', desc: 'Soft white rice cakes unique to Cavite, served at every fiesta and family gathering.', emoji: '🍰', color: 'amber', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80' },
];

// Removed mock data

const SHOWCASE_CARDS = [
  {
    id: 1,
    name: 'Balay Dako',
    location: 'Tagaytay City',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    top: '5%',
    left: '10%',
    delay: 0.2
  },
  {
    id: 2,
    name: 'Calle Real',
    location: 'Tanza',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',
    top: '38%',
    left: '55%',
    delay: 0.4
  },
  {
    id: 3,
    name: 'Cafe Antix',
    location: 'Cavite City',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    top: '72%',
    left: '15%',
    delay: 0.6
  }
];

// Animated Section Wrapper
function RevealSection({ children, className = '', delay = 0 }) {
  const { ref, inView } = useInViewObserver({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated stat counter card
function StatCard({ num, suffix = '', label, desc, icon: Icon, color = 'emerald', delay = 0 }) {
  const { ref, inView } = useInViewObserver({ threshold: 0.5, triggerOnce: true });
  const numParsed = parseInt(num.replace(/\D/g, ''), 10);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="glass-premium rounded-3xl p-6 border border-emerald-500/10 flex items-center gap-4 card-glow-hover"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        color === 'gold' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
      }`}>
        <Icon size={22} className={color === 'gold' ? 'text-amber-400' : 'text-emerald-400'} />
      </div>
      <div>
        <h4 className="font-display font-bold text-2xl text-white leading-none">
          {inView ? (
            <CountUp end={numParsed} suffix={suffix} duration={2} delay={delay} />
          ) : '0'}
        </h4>
        <p className="text-emerald-300 font-bold text-sm leading-tight mt-0.5">{label}</p>
        <p className="text-gray-500 text-[11px] mt-0.5">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [restaurants, setRestaurants] = useState([]);
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRest, rStories] = await Promise.all([
          axios.get('/api/restaurants').catch(() => ({ data: [] })),
          axios.get('/api/stories').catch(() => ({ data: [] })),
        ]);
        setRestaurants(rRest.data || []);
        setStories((rStories.data || []).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/map?search=${encodeURIComponent(searchQuery)}&municipality=${encodeURIComponent(selectedMuni)}`);
  };

  const toggleFav = (id) => setFavorites(f => ({ ...f, [id]: !f[id] }));
  const featured = restaurants.filter(r => r.status === 'approved' || !r.status).slice(0, 6);

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">

      {/* ══════════════════════════════════════════
          CINEMATIC HERO SECTION
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-dvh sm:min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Parallax Background Image */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: heroImgY }}
        >
          <img
            src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1920&q=85&fit=crop"
            alt="Cavite Food"
            className="w-full h-[115%] object-cover object-center"
          />
        </motion.div>

        {/* Cinematic dark overlays */}
        <div className="absolute inset-0 z-[1] overlay-hero" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#060f09]/80 via-[#060f09]/60 to-[#060f09]" />
        
        {/* Ambient Glow Orbs & Organic Elements */}
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
          <div className="hero-orb-green w-[600px] h-[600px] top-[-10%] left-[-15%] animate-orb opacity-60" />
          <div className="hero-orb-gold w-[400px] h-[400px] bottom-[10%] right-[5%] animate-orb opacity-50" style={{ animationDelay: '3s' }} />
          <div className="hero-orb-orange w-[500px] h-[500px] top-[20%] right-[10%] animate-orb opacity-30" style={{ animationDelay: '5s' }} />
          
          {/* Floating Leaves */}
          <div className="leaf-particle" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className="leaf-particle" style={{ top: '60%', left: '30%', animationDelay: '2s' }} />
          <div className="leaf-particle" style={{ top: '40%', right: '20%', animationDelay: '4s' }} />
          <div className="leaf-particle" style={{ top: '80%', right: '40%', animationDelay: '1s' }} />
          <div className="leaf-particle" style={{ top: '10%', right: '30%', animationDelay: '3s' }} />
        </div>

        {/* Hero Content (Two-Column Layout) */}
        <div className="relative z-[10] w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center mt-8 lg:-mt-16">
          
          {/* Left Column: Text & Search */}
          <div className="flex flex-col items-start text-left w-full">

            {/* Eyebrow label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                <Sparkles size={14} /> Cavite's #1 Food Discovery Platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold text-white leading-[1.05] tracking-tight"
            >
              Discover Cavite.<br />
              <span className="italic">
                <span className="text-gradient-cinematic">
                  <Typewriter
                    options={{
                      strings: ['Taste the Wonders.', 'Find Hidden Gems.', 'Explore Local Eats.', 'Experience Culture.'],
                      autoStart: true,
                      loop: true,
                      delay: 50,
                      deleteSpeed: 30,
                    }}
                  />
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base sm:text-lg text-gray-300 max-w-lg leading-relaxed font-medium"
            >
              Explore the best local restaurants, must-try dishes,
              cultural food stories, and hidden gems across
              the Province of Cavite.
            </motion.p>

            {/* Premium Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSearch}
              className="mt-10 w-full max-w-2xl relative z-20"
            >
              <motion.div
                animate={searchFocused ? {
                  boxShadow: '0 0 0 2px rgba(52,211,153,0.5), 0 24px 60px rgba(0,0,0,0.6)'
                } : {
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
                }}
                transition={{ duration: 0.3 }}
                className="glass-ultra rounded-2xl md:rounded-full flex flex-col md:flex-row items-center p-2 gap-2"
              >
                <div className="w-full flex items-center px-4 py-3">
                  <Search className="text-emerald-400 shrink-0" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search restaurants, dishes, flavors..."
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium text-base ml-3 outline-none"
                  />
                </div>

                <div className="hidden md:block w-px h-8 bg-emerald-500/20" />

                <div className="w-full md:w-auto flex items-center px-3 sm:px-4 py-3 min-w-0 sm:min-w-[220px]">
                  <MapPin className="text-emerald-400 shrink-0 mr-2" size={20} />
                  <CustomDropdown
                    options={MUNICIPALITIES}
                    value={selectedMuni}
                    onChange={setSelectedMuni}
                    placeholder="All Municipalities"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-cinematic w-full md:w-auto py-3.5 px-8 rounded-xl md:rounded-full text-sm"
                >
                  <Search size={16} className="mr-2" /> Search
                </motion.button>
              </motion.div>
            </motion.form>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-4 relative z-20"
            >
              <Link to="/map">
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                  className="btn-ghost-premium flex items-center gap-2">
                  <Map size={17} /> Explore Food Map
                </motion.div>
              </Link>
              <Link to="/stories">
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-gray-300 border border-emerald-500/10 hover:border-emerald-500/40 hover:text-white transition-all duration-300 bg-white/5 backdrop-blur-md">
                  <BookOpen size={17} className="text-emerald-400" /> Read Food Stories
                </motion.div>
              </Link>
            </motion.div>

            {/* Animated Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-12"
            >
              <StatCard num="23" suffix="+" label="Towns" desc="All of Cavite" icon={Building2} delay={0.1} />
              <StatCard num="140" suffix="+" label="Eats" desc="Local spots" icon={Utensils} color="gold" delay={0.2} />
              <StatCard num="300" suffix="+" label="Reviews" desc="By food lovers" icon={Star} delay={0.3} />
              <StatCard num="50" suffix="+" label="Stories" desc="Food heritage" icon={BookOpen} color="gold" delay={0.4} />
            </motion.div>
          </div>

          {/* Right Column: Interactive Food Showcase */}
          <div className="relative hidden xl:block w-full h-[600px]">
            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
              <path 
                d="M 120 120 C 200 200, 250 150, 320 280" 
                fill="none" 
                stroke="rgba(52, 211, 153, 0.3)" 
                strokeWidth="2" 
                className="showcase-connection-line" 
                style={{ animationDelay: '1s' }}
              />
              <path 
                d="M 320 280 C 350 380, 250 450, 180 480" 
                fill="none" 
                stroke="rgba(245, 158, 11, 0.3)" 
                strokeWidth="2" 
                className="showcase-connection-line" 
                style={{ animationDelay: '1.5s' }}
              />
            </svg>

            {/* Floating Showcase Cards */}
            {SHOWCASE_CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                className="showcase-card flex items-center p-3 gap-4 cursor-pointer group"
                style={{ top: card.top, left: card.left }}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1 + card.delay, 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 15 
                }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="pr-4">
                  <h4 className="text-white font-bold text-sm mb-0.5">{card.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                      <Star size={10} className="mr-0.5 fill-amber-400" /> {card.rating}
                    </span>
                    <span className="text-gray-400 text-[10px] flex items-center">
                      <MapPin size={10} className="mr-0.5 text-emerald-400" /> {card.location}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        >
          <span className="text-emerald-400/80 text-[10px] uppercase tracking-widest font-bold">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={18} className="text-emerald-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          LIVE FOOD MAP SECTION
      ══════════════════════════════════════════ */}
      <section className="py-6 px-4 max-w-7xl mx-auto z-10 relative">
        <RevealSection>
          <HomeInteractiveMap restaurants={restaurants} />
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED RESTAURANTS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-6 bg-amber-400" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Star size={13} /> Editor's Picks
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                Top Rated<br />
                <span className="text-gradient-brand italic">Restaurants</span>
              </h2>
              <p className="text-gray-500 mt-3 max-w-md text-sm leading-relaxed">
                Handpicked heritage restaurants verified by HungryLakwatsero for authentic Caviteño cuisine.
              </p>
            </div>
            <Link to="/map">
              <motion.div
                whileHover={{ x: 4 }}
                className="mt-4 md:mt-0 text-emerald-400 font-bold flex items-center gap-2 hover:text-emerald-300 transition-colors text-sm"
              >
                View All <ChevronRight size={18} />
              </motion.div>
            </Link>
          </div>
        </RevealSection>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-72 sm:h-80 rounded-3xl shimmer-premium border border-emerald-500/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featured.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <RestaurantCard
                  restaurant={r}
                  isFavorited={!!favorites[r.id]}
                  onFavoriteToggle={() => toggleFav(r.id)}
                  onClick={setSelectedRestaurant}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          TRENDING DISHES — Cinematic Grid
      ══════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060f09] via-[#080e0a] to-[#060f09]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
        <div className="hero-orb-green w-[500px] h-[500px] top-[-20%] right-[-10%] opacity-20 animate-orb" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <RevealSection className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-[1px] w-6 bg-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Gastronomic Heritage</span>
              <div className="h-[1px] w-6 bg-amber-400" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-1">
              Trending Cavite{' '}
              <span className="text-gradient-brand italic">Dishes</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
              Flavors passed down through generations. These dishes form the cultural identity of Caviteño cuisine.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {DISHES.map((dish, i) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl overflow-hidden border border-white/5 card-glow-hover cursor-pointer"
              >
                {/* Image with overlay */}
                <div className="aspect-[4/3] overflow-hidden img-zoom-wrapper">
                  <img src={dish.img} alt={dish.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 overlay-cinematic" />
                </div>

                {/* Content overlaid on image */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                  <span className="text-3xl drop-shadow-lg mb-2">{dish.emoji}</span>
                  <h3 className="font-display font-bold text-base sm:text-xl text-white leading-tight group-hover:text-emerald-300 transition-colors">
                    {dish.name}
                  </h3>
                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    📍 {dish.origin}
                  </span>
                  <p className="text-gray-400 text-[11px] sm:text-xs mt-2 leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {dish.desc}
                  </p>
                  <Link
                    to={`/map?search=${encodeURIComponent(dish.name)}`}
                    className="mt-3 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/cta w-fit"
                    onClick={e => e.stopPropagation()}
                  >
                    Find Locations
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={14} />
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOD STORIES — Cinematic Layout
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-6 bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={13} /> Explore Culture
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                Discover{' '}
                <span className="text-gradient-brand italic">Food Stories</span>
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl text-sm leading-relaxed">
                Learn about the rich history and cultural heritage behind Cavite's most famous delicacies.
              </p>
            </div>
            <Link to="/stories">
              <motion.div
                whileHover={{ x: 4 }}
                className="mt-4 md:mt-0 text-emerald-400 font-bold flex items-center gap-2 hover:text-emerald-300 transition-colors text-sm"
              >
                Read All <ChevronRight size={18} />
              </motion.div>
            </Link>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => navigate('/stories')}
            >
              {/* Image */}
              <div className="w-full h-52 rounded-2xl overflow-hidden mb-5 border border-white/5 img-zoom-wrapper relative">
                {story.image_url ? (
                  <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-900/20 text-emerald-500">
                    <BookOpen size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold text-emerald-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-emerald-500/20">
                    📍 {story.municipality_name}
                  </span>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-300 transition-colors duration-300 line-clamp-2 leading-tight">
                {story.title}
              </h3>
              <p className="text-gray-500 text-sm mt-2 line-clamp-3 leading-relaxed">{story.content}</p>
              <motion.div
                className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold"
                whileHover={{ x: 4 }}
              >
                Read Story <ArrowRight size={13} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="px-4 pb-20 max-w-7xl mx-auto w-full">
        <RevealSection>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl overflow-hidden border border-emerald-500/20 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* BG */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#052e16] via-[#0a1f14] to-[#052e16] animate-gradient-shift" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
            <div className="hero-orb-gold w-96 h-96 top-[-30%] right-0 opacity-30 animate-orb" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Compass size={28} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Start Your Journey</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                Cavite is calling.<br />
                <span className="text-emerald-400">Are you hungry?</span>
              </h3>
              <p className="text-gray-400 mt-2 text-sm">Eat. Explore. Experience the real Cavite.</p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link to="/map">
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-cinematic text-center w-full sm:w-auto"
                >
                  <Map size={17} /> Explore the Map
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-ghost-premium text-center w-full sm:w-auto"
                >
                  Join for Free
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </RevealSection>
      </section>

      <Footer />

      <AnimatePresence>
        {selectedRestaurant && (
          <RestaurantModal
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
