import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf, MapPin, Phone, Mail, Instagram, Facebook, Twitter,
  ExternalLink, ArrowRight, Send, Heart, Compass, Sparkles
} from 'lucide-react';
import { FiYoutube } from 'react-icons/fi';
import { RiTiktokLine } from 'react-icons/ri';
import Logo from './Logo';
import toast from 'react-hot-toast';

// ── Social Link ──────────────────────────────────────────────────────────────
function SocialLink({ href, icon: Icon, label, color }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ y: -4, scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="relative w-10 h-10 flex items-center justify-center rounded-2xl
                 border border-white/10 text-gray-500
                 hover:text-white hover:border-emerald-500/40
                 transition-colors duration-300 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-300 rounded-2xl" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ boxShadow: '0 0 16px rgba(16,185,129,0.3) inset' }} />
      <Icon size={17} className="relative z-10" />
    </motion.a>
  );
}

// ── Footer Nav Link ────────────────────────────────────────────────────────────
function FooterLink({ to, children, external }) {
  const baseClass = 'group flex items-center gap-1 text-gray-500 hover:text-emerald-400 transition-colors duration-300 text-sm leading-relaxed';

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {children}
        <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
      </a>
    );
  }
  return (
    <Link to={to} className={baseClass}>
      <motion.span whileHover={{ x: 3 }} className="inline-block">{children}</motion.span>
    </Link>
  );
}

// ── Main Footer ────────────────────────────────────────────────────────────────
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    setEmail('');
    toast.success('🎉 You\'re on the list! Welcome to Hungry Lakwatsero.', {
      style: {
        background: '#0a1f14',
        color: '#a7f3d0',
        border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: '16px',
      },
      iconTheme: { primary: '#10b981', secondary: '#0a1f14' },
      duration: 4000,
    });
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060f09] via-[#04090605] to-[#030705]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />

      {/* Ambient orbs */}
      <div className="hero-orb-green w-[500px] h-[500px] top-[-30%] left-[-15%] opacity-15 animate-orb pointer-events-none" />
      <div className="hero-orb-gold w-[400px] h-[400px] bottom-[10%] right-[-10%] opacity-10 animate-orb pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Gradient top divider */}
      <div className="divider-gradient w-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* ── Top Newsletter Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass-premium rounded-3xl p-8 md:p-10 mb-14 border border-emerald-500/10 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative"
        >
          <div className="hero-orb-green w-72 h-72 top-[-50%] right-[10%] opacity-20 animate-orb pointer-events-none" />

          <div className="flex-1 min-w-0 text-center md:text-left relative z-10">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Stay in the loop</span>
            </div>
            <h3 className="font-display font-bold text-2xl text-white leading-tight">
              Get the latest food discoveries
            </h3>
            <p className="text-gray-500 text-sm mt-1">New restaurants, events, and hidden gems — right in your inbox.</p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3 min-w-[300px] relative z-10">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={subscribed}
              className="input-premium flex-1 min-w-0"
            />
            <motion.button
              type="submit"
              disabled={subscribed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-cinematic px-5 py-3 text-sm whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {subscribed ? '✓ Joined!' : <><Send size={15} /> Subscribe</>}
            </motion.button>
          </form>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Column 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center mb-4 group" aria-label="HungryLakwatsero home">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <Logo variant="horizontal" height={32} />
                <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/5 rounded-lg transition-all duration-300 blur-sm" />
              </motion.div>
            </Link>

            <p className="text-emerald-400 text-sm font-semibold italic mb-3">
              Discover Cavite's culinary soul
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs">
              Your guide to authentic flavors, hidden food gems, and the rich
              gastronomic heritage of the Province of Cavite, Philippines.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <SocialLink href="https://instagram.com/hungrylakwatsero" icon={Instagram} label="Instagram" />
              <SocialLink href="https://facebook.com/hungrylakwatsero" icon={Facebook} label="Facebook" />
              <SocialLink href="https://twitter.com/hungrylakwatsero" icon={Twitter} label="Twitter" />
              <SocialLink href="https://tiktok.com/@hungrylakwatsero" icon={RiTiktokLine} label="TikTok" />
            </div>
          </div>

          {/* ── Column 2: Explore ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2">
              <Compass size={14} className="text-emerald-400" /> Explore
            </h3>
            <nav aria-label="Footer explore links">
              <ul className="space-y-3">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/map', label: 'Map Explorer' },
                  { to: '/stories', label: 'Food Stories' },
                  { to: '/events', label: 'Events' },
                  { to: '/about', label: 'About Cavite' },
                ].map(link => (
                  <li key={link.to}><FooterLink to={link.to}>{link.label}</FooterLink></li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Column 3: About Cavite ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" /> Cavite
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              A historic province south of Metro Manila, rich in revolutionary heritage,
              colonial-era cuisine, and vibrant local food culture.
            </p>
            <ul className="space-y-2 mb-4">
              {['23 Municipalities & Cities', 'Heritage & Culture', 'Coastal & Highland Flavors'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <FooterLink to="https://www.caviteprovince.gov.ph" external>
              caviteprovince.gov.ph
            </FooterLink>
          </div>

          {/* ── Column 4: Contact ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2">
              <Mail size={14} className="text-emerald-400" /> Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-emerald-400" />
                </div>
                <span className="text-gray-600 text-sm leading-relaxed">
                  Province of Cavite,<br />Philippines
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-emerald-400" />
                </div>
                <a href="mailto:info@hungrylakwatsero.ph" className="text-gray-600 hover:text-emerald-400 transition-colors text-sm">
                  info@hungrylakwatsero.ph
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-emerald-400" />
                </div>
                <a href="tel:+6346xxxxxxx" className="text-gray-600 hover:text-emerald-400 transition-colors text-sm">
                  +63 46 xxx xxxx
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          <div className="divider-gradient absolute top-0 left-0 right-0" />
          <p className="text-gray-700 text-xs text-center sm:text-left">
            © {currentYear} HungryLakwatsero. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs text-center sm:text-right flex items-center gap-1.5">
            Made with{' '}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-label="green heart"
            >
              <Heart size={12} className="text-emerald-500 fill-emerald-500" />
            </motion.span>
            in Cavite
          </p>
        </div>
      </div>
    </footer>
  );
}
