import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Map, BookOpen, Calendar, Camera, Bookmark, Heart, Compass, Star, ArrowRight, Utensils, Users, TrendingUp } from 'lucide-react';
import Footer from '../components/Footer';

// ─── Intersection-triggered reveal wrapper ─────────────────────────────────────
function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0,
      scale: direction === 'zoom' ? 0.9 : 1,
    },
    visible: {
      opacity: 1, y: 0, x: 0, scale: 1,
      transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Map, title: 'Explore the Map', desc: 'Discover must-visit spots across Cavite - from food trips to tourist destinations.' },
  { icon: BookOpen, title: 'Read Food Stories', desc: 'Get to know the stories behind Cavite\'s best dishes and local favorites.' },
  { icon: Camera, title: 'Share a Spot', desc: 'Know a hidden gem? Share it with the community and help others explore.' },
  { icon: Bookmark, title: 'Save Your Finds', desc: 'Bookmark your favorite places and access them anytime, anywhere.' },
  { icon: Heart, title: 'Support Local', desc: 'Support local businesses and be part of a growing community.' },
];

const TIMELINE = [
  { year: '1896', title: 'Revolution & Heritage Cuisine', desc: 'During the Philippine Revolution, Cavite soldiers\' survival food — dried fish, salted meats, foraged greens — shaped a tradition of bold, resourceful cooking.' },
  { year: '1920s', title: 'Colonial Flavors Emerge', desc: 'Spanish colonial influences gave birth to quesillo, chorizo, and other cured delicacies that define Caviteño cuisine to this day.' },
  { year: '1960s', title: 'Rise of Tagaytay Bulalo', desc: 'The cool Tagaytay highlands became a retreat for Manila\'s elite, sparking the rise of the bulalo tradition that now draws millions annually.' },
  { year: '1990s', title: 'Longganisa Goes Mainstream', desc: 'Imus longganisa — tangy, garlicky, iconic — breaks into national consciousness as Cavite\'s most beloved breakfast staple.' },
  { year: '2024', title: 'HungryLakwatsero Launches', desc: 'We launch the province\'s first dedicated food and travel discovery platform, connecting travelers with authentic Caviteño cuisine.' },
];

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
  'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
];

export default function AboutCavitePage() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  return (
    <div className="min-h-screen bg-background text-primary font-sans overflow-x-hidden selection:bg-emerald-500/30">

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Parallax BG */}
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY, opacity: heroOpacity }}>
          <img
            src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1920&q=85&fit=crop"
            alt="Cavite Heritage"
            className="w-full h-[120%] object-cover object-center"
          />
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 z-[1] overlay-hero" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#060f09]/40 via-transparent to-[#060f09]" />

        {/* Orbs */}
        <div className="hero-orb-green w-[600px] h-[600px] top-[-20%] left-[-15%] z-[2] animate-orb opacity-40" />
        <div className="hero-orb-gold w-[400px] h-[400px] bottom-[5%] right-[-10%] z-[2] animate-orb opacity-30" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: Text */}
            <div className="flex-1 max-w-xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-8 bg-emerald-400" />
                <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase">About Cavite</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-8 text-white">
                Discover Cavite.<br />
                <span className="text-gradient-cinematic italic">A Province Full<br />of Flavor.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
                className="text-gray-300 text-lg leading-relaxed mb-6 font-medium">
                Cavite is more than just a province near Manila — it's a destination rich in history,
                vibrant in culture, and overflowing with flavors waiting to be discovered.
              </motion.p>

              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.7 }}
                className="text-gray-400 text-base leading-relaxed font-medium">
                From heritage landmarks and local traditions to hidden food spots and heartfelt stories,
                we're here to help you explore the real Cavite like a true lakwatsero.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-8 flex gap-4 flex-wrap">
                <Link to="/map">
                  <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-cinematic">
                    <Compass size={17} /> Start Exploring
                  </motion.div>
                </Link>
                <Link to="/stories">
                  <motion.div whileHover={{ y: -4 }} className="btn-ghost-premium">
                    <BookOpen size={17} /> Food Stories
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Right: Cinematic Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="flex-1 w-full relative group max-w-xl"
            >
              {/* Glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/25 to-amber-500/15 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-700" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] md:h-[440px]">
                <img
                  src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&q=85&fit=crop"
                  alt="Cavite Heritage"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060f09]/70 via-transparent to-transparent" />

                {/* Floating stat card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-5 left-5 glass-premium rounded-2xl p-4 border border-emerald-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Utensils size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">140+</p>
                      <p className="text-emerald-400/70 text-xs font-semibold">Food Destinations</p>
                    </div>
                  </div>
                </motion.div>

                {/* Top badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="absolute top-5 right-5 glass-premium rounded-xl px-3 py-2 border border-amber-500/20 flex items-center gap-1.5"
                >
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-white text-xs font-bold">Cavite's #1 Food Guide</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOD HERITAGE TIMELINE ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-[1px] w-8 bg-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Through the Ages</span>
            <div className="h-[1px] w-8 bg-amber-400" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Cavite's <span className="text-gradient-brand italic">Food History</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            From revolution-era survival food to modern culinary landmarks — the story of Caviteño cuisine spans centuries.
          </p>
        </Reveal>

        <div className="relative">
          {/* Center timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />

          <div className="space-y-12 md:space-y-0">
            {TIMELINE.map((item, i) => (
              <Reveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="glass-premium rounded-2xl p-6 border border-emerald-500/10 card-glow-hover inline-block w-full md:max-w-sm"
                    >
                      <span className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2 block">{item.year}</span>
                      <h3 className="font-display font-bold text-lg text-white mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 items-center justify-center shrink-0 mx-auto relative z-10"
                    style={{ boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  {/* Empty half */}
                  <div className="flex-1" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY AUTO-SCROLL STRIP ── */}
      <section className="py-12 overflow-hidden">
        <Reveal className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-white">
            A Taste of <span className="text-gradient-brand italic">Cavite</span>
          </h2>
        </Reveal>

        {/* Marquee gallery */}
        <div className="relative">
          <div className="flex gap-4 animate-marquee" style={{ width: 'max-content' }}>
            {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.3 }}
                className="w-56 h-40 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 cursor-pointer img-zoom-wrapper"
              >
                <img src={src} alt={`Cavite food ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>

          {/* Edge fade masks */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#060f09] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#060f09] to-transparent pointer-events-none z-10" />
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-[1px] w-6 bg-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Platform Features</span>
            <div className="h-[1px] w-6 bg-emerald-400" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            What You Can <span className="text-gradient-brand italic">Do Here</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="group glass-premium border border-white/5 hover:border-emerald-500/25 rounded-2xl p-8 relative overflow-hidden flex flex-col items-center text-center card-glow-hover"
                >
                  {/* BG glow on hover */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-all duration-500" />

                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-all duration-300 relative z-10"
                  >
                    <Icon size={26} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feat.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm relative z-10">{feat.desc}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── BRAND MANIFESTO ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center">
        <Reveal>
          <motion.blockquote
            whileInView={{ scale: [0.97, 1] }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-4xl font-bold text-white leading-relaxed relative"
          >
            <span className="text-emerald-300 text-6xl absolute -top-4 -left-2 opacity-30 leading-none">"</span>
            Every dish in Cavite has a story —<br />
            a story of <span className="text-gradient-brand italic">struggle, love, and identity.</span><br />
            We're here to tell it.
            <span className="text-emerald-300 text-6xl absolute -bottom-8 -right-2 opacity-30 leading-none">"</span>
          </motion.blockquote>
          <p className="text-gray-600 mt-8 text-sm font-semibold tracking-wider uppercase">— The HungryLakwatsero Team</p>
        </Reveal>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section className="px-4 pb-20 max-w-7xl mx-auto">
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative rounded-3xl overflow-hidden border border-emerald-500/20 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#052e16] via-[#0a1f14] to-[#052e16] animate-gradient-shift" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            <div className="hero-orb-green w-64 h-64 top-[-30%] left-[10%] opacity-30 animate-orb" />
            <div className="hero-orb-gold w-72 h-72 bottom-[-30%] right-[5%] opacity-20 animate-orb" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <Compass size={28} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Cavite is Calling</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Ready to explore Cavite's<br />
                <span className="text-emerald-400">culinary wonders?</span>
              </h3>
              <p className="text-gray-400 text-sm">Eat. Explore. Experience.</p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link to="/map">
                <motion.div whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-cinematic text-center w-full sm:w-auto">
                  <Map size={17} /> Explore the Map
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} className="btn-ghost-premium text-center w-full sm:w-auto">
                  Join for Free
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
