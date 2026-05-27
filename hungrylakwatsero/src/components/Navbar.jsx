import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Menu, X, LogOut, ChevronDown,
  Award, ShieldCheck, Star, Compass, Bell, Sun, Moon, User,
  Home, MapPin, BookOpen, Info, LayoutDashboard, Rss,
  Activity, ScrollText, Bookmark, Heart, Shield, Lock, Eye,
  ArrowLeft, ChevronRight, HelpCircle, Settings, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDashboardPath(user) {
  if (!user) return '/';
  if (user.roleId === 3 || user.role === 'Admin') return '/admin-dashboard';
  if (user.roleId === 2 || user.role === 'Food Business Owner') return '/owner-dashboard';
  return '/tourist-dashboard';
}

function getInitials(user) {
  if (!user) return 'U';
  const f = user.firstName?.[0] || '';
  const l = user.lastName?.[0] || '';
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
}

function getRoleMeta(user) {
  if (!user) return { label: 'Guest', cls: 'text-muted bg-secondary border-border', Icon: User };
  if (user.roleId === 3 || user.role === 'Admin')
    return { label: 'Admin', cls: 'text-blue-500 bg-blue-500/10 border-blue-500/20', Icon: ShieldCheck };
  if (user.roleId === 2 || user.role === 'Food Business Owner')
    return { label: 'Owner', cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20', Icon: Award };
  return { label: 'Tourist', cls: 'text-primary bg-secondary border-primary', Icon: Star };
}

// ─── NavLink (Desktop) ──────────────────────────────────────────────────────

function NavLink({ to, children, onClick, mobile, Icon }) {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const base = mobile
    ? 'flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200'
    : 'relative flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 nav-link-premium';

  const active = mobile
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
    : 'text-emerald-400 dark:text-emerald-300';

  const inactive = mobile
    ? 'text-secondary hover:text-primary hover:bg-secondary/50 border border-transparent'
    : 'text-muted hover:text-primary border border-transparent';

  return (
    <Link to={to} onClick={onClick} className={`${base} ${isActive ? active : inactive} group`}>
      {Icon && (
        <Icon
          size={18}
          className={`mr-3 ${isActive ? 'text-emerald-500' : 'text-muted group-hover:text-emerald-400 transition-colors duration-200'}`}
        />
      )}
      {children}
      {/* Glowing underline for desktop */}
      {!mobile && (
        <span
          className={`
            absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full
            bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500
            transition-all duration-300 ease-out
            ${isActive
              ? 'w-3/4 opacity-100 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]'
              : 'w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-80 group-hover:shadow-[0_0_6px_1px_rgba(52,211,153,0.4)]'
            }
          `}
        />
      )}
    </Link>
  );
}

// ─── Mobile Drawer Nav Item ─────────────────────────────────────────────────

const drawerLinkVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
};

function MobileNavLink({ to, children, Icon, index, onClick }) {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <motion.div
      custom={index}
      variants={drawerLinkVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Link
        to={to}
        onClick={onClick}
        className={`
          flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold
          transition-all duration-200 border
          ${isActive
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_16px_rgba(52,211,153,0.15)]'
            : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
          }
        `}
      >
        {Icon && (
          <span
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              ${isActive
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-slate-400'
              }
            `}
          >
            <Icon size={18} />
          </span>
        )}
        {children}
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
        )}
      </Link>
    </motion.div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDrawerView, setMobileDrawerView] = useState('main'); // 'main' | 'account'
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, isOpen: sidebarOpen, closeSidebar } = useSidebar();
  const isDark = theme === 'dark';

  const isHomePage = location.pathname === '/';

  // ── Scroll detection ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile drawer on route change ──
  useEffect(() => {
    setMobileOpen(false);
    setTimeout(() => setMobileDrawerView('main'), 300); // reset after animation
  }, [location.pathname]);

  // ── Close Sidebar drawer when Navbar drawer opens (prevent double-drawer) ──
  useEffect(() => {
    if (mobileOpen && sidebarOpen) {
      closeSidebar();
    }
  }, [mobileOpen, sidebarOpen, closeSidebar]);

  // ── Lock body scroll when drawer open ──
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── Close mobile drawer on Escape ──
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setTimeout(() => setMobileDrawerView('main'), 300);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    setTimeout(() => setMobileDrawerView('main'), 300);
    await logout();
    navigate('/');
  };

  const roleMeta = getRoleMeta(user);
  const RoleIcon = roleMeta.Icon;
  const initials = getInitials(user);
  const dashboardPath = getDashboardPath(user);

  // ── Navbar glass style logic ──
  // On homepage: transparent at top, glass when scrolled
  // On other pages: always glass
  const isGlass = !isHomePage || scrolled;

  const navbarClass = isGlass
    ? 'navbar-scrolled'       // glassy / scrolled style (defined in CSS)
    : 'navbar-transparent';   // fully transparent at top of homepage

  // ── Nav links data ──
  const navLinks = [
    { to: '/',        label: 'Home',         Icon: Home },
    { to: '/map',     label: 'Map Explorer', Icon: MapPin },
    { to: '/stories', label: 'Food Stories', Icon: BookOpen },
    { to: '/about',   label: 'About Cavite', Icon: Info },
    ...(user ? [{ to: dashboardPath, label: 'Feed', Icon: Rss }] : []),
  ];

  return (
    <>
      {/* ── Inline Styles (scoped to this component) ── */}
      <style>{`
        /* Base nav */
        .navbar-premium {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: background 0.4s ease, backdrop-filter 0.4s ease,
                      border-color 0.4s ease, box-shadow 0.4s ease;
        }

        /* Transparent (homepage top) */
        .navbar-transparent {
          background: transparent;
          border-bottom: 1px solid transparent;
          box-shadow: none;
          backdrop-filter: none;
        }

        /* Scrolled / glass */
        .navbar-scrolled {
          background: rgba(10, 15, 10, 0.72);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(52, 211, 153, 0.12);
          box-shadow:
            0 1px 0 0 rgba(52, 211, 153, 0.06),
            0 8px 32px -8px rgba(0, 0, 0, 0.5);
        }

        /* Light mode glass */
        :root:not(.dark) .navbar-scrolled {
          background: rgba(255, 255, 255, 0.82);
          border-bottom: 1px solid rgba(52, 211, 153, 0.15);
          box-shadow:
            0 1px 0 0 rgba(52, 211, 153, 0.08),
            0 8px 32px -8px rgba(0, 0, 0, 0.12);
        }

        /* ── Logo glow on hover ── */
        .logo-premium {
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .logo-premium:hover {
          filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.55))
                  drop-shadow(0 0 20px rgba(52, 211, 153, 0.25));
          transform: scale(1.04);
        }

        /* ── Pulsing notification dot ── */
        @keyframes pulse-glow-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); opacity: 1; }
          50%       { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); opacity: 0.7; }
        }
        .bell-dot {
          animation: pulse-glow-red 1.8s ease-in-out infinite;
        }

        /* ── Avatar emerald ring ── */
        @keyframes emerald-ring-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.6), 0 0 12px rgba(52, 211, 153, 0.3); }
          50%       { box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.9), 0 0 20px rgba(52, 211, 153, 0.5); }
        }
        .avatar-ring {
          animation: emerald-ring-pulse 2.5s ease-in-out infinite;
        }

        /* ── Premium CTA buttons ── */
        .btn-ghost-premium {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 1.35rem;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 9999px;
          border: 1.5px solid rgba(52, 211, 153, 0.3);
          color: rgb(110 231 183);
          background: rgba(52, 211, 153, 0.04);
          backdrop-filter: blur(8px);
          transition: all 0.25s ease;
          letter-spacing: 0.01em;
        }
        .btn-ghost-premium:hover {
          background: rgba(52, 211, 153, 0.12);
          border-color: rgba(52, 211, 153, 0.6);
          box-shadow: 0 0 16px rgba(52, 211, 153, 0.2);
          color: rgb(167 243 208);
        }

        .btn-cinematic {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 1.35rem;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 9999px;
          border: 1.5px solid rgba(52, 211, 153, 0.7);
          color: #fff;
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          box-shadow: 0 0 20px rgba(52, 211, 153, 0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }
        .btn-cinematic::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .btn-cinematic:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(52, 211, 153, 0.55), 0 4px 12px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-cinematic:hover::before { opacity: 1; }
        .btn-cinematic:active { transform: translateY(0); }

        /* ── Mobile drawer overlay ── */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ── Mobile drawer panel ── */
        .mobile-drawer-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(88vw, 380px);
          z-index: 101;
          background: rgba(8, 14, 10, 0.92);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border-left: 1px solid rgba(52, 211, 153, 0.15);
          box-shadow: -20px 0 80px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        /* Emerald glow accent bar at top of drawer */
        .mobile-drawer-panel::before {
          content: '';
          display: block;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.6), rgba(52, 211, 153, 0.2), transparent);
          flex-shrink: 0;
        }

        /* ── Hamburger button premium ── */
        .hamburger-premium {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(52, 211, 153, 0.3);
          background: rgba(8, 28, 21, 0.6);
          color: #34d399;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .hamburger-premium:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(52, 211, 153, 0.6);
          box-shadow: 0 0 16px rgba(52, 211, 153, 0.25), 0 8px 24px rgba(0,0,0,0.3);
          color: #a7f3d0;
          transform: translateY(-1px);
        }
      `}</style>

      {/* ── Main Nav Bar ── */}
      <nav className={`navbar-premium ${navbarClass}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            <Link to="/" className="flex items-center shrink-0 logo-premium">
              <img src="/favicon.png" alt="Logo" className="h-8 md:h-10 w-auto" />
              <span className="ml-2.5 font-display font-black text-primary text-sm sm:text-base md:text-lg leading-none mt-1 block">
                Hungry<span className="text-emerald-400">Lakwatsero</span>
                <span className="hidden sm:block text-[8px] tracking-widest uppercase text-muted mt-0.5">Eat. Explore. Experience.</span>
              </span>
            </Link>
          </motion.div>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} Icon={Icon}>{label}</NavLink>
            ))}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted hover:text-primary hover:bg-secondary transition-all duration-200"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              whileTap={{ scale: 0.85 }}
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </motion.button>

            {user ? (
              <>
                {/* Notification Bell Dropdown */}
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <ProfileDropdown />
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/login" className="btn-ghost-premium">
                  Sign In
                </Link>
                <Link to="/register" className="btn-cinematic">
                  Join Free
                </Link>
              </div>
            )}

            {/* ── Hamburger (mobile/tablet) — opens local drawer ── */}
            <motion.button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center hamburger-premium"
              aria-label="Open menu"
              whileTap={{ scale: 0.88 }}
            >
              <Menu size={22} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="mobile-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              className="mobile-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4">
                {mobileDrawerView === 'main' ? (
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 logo-premium"
                    aria-label="HungryLakwatsero home"
                  >
                    <img src="/favicon.png" alt="Logo" className="h-8 w-auto" />
                    <span className="font-display font-black text-white text-base leading-none">
                      Hungry<span className="text-emerald-400">Lakwatsero</span>
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setMobileDrawerView('main')}
                    className="flex items-center gap-2 text-white font-bold text-sm hover:text-emerald-400 transition-colors"
                    aria-label="Back to main menu"
                  >
                    <ArrowLeft size={18} /> Account Menu
                  </button>
                )}
                <motion.button
                  onClick={() => {
                    setMobileOpen(false);
                    setTimeout(() => setMobileDrawerView('main'), 300);
                  }}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
                  whileTap={{ scale: 0.85, rotate: 90 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Subtle divider */}
              <div className="mx-5 mb-4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shrink-0" />

              <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                <AnimatePresence mode="wait">
                  {mobileDrawerView === 'main' ? (
                    <motion.div
                      key="main-nav"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full"
                    >
                      {/* Nav Links */}
                      <nav className="px-4 space-y-1">
                        {navLinks.map(({ to, label, Icon }, i) => (
                          <MobileNavLink
                            key={to}
                            to={to}
                            Icon={Icon}
                            index={i}
                            onClick={() => setMobileOpen(false)}
                          >
                            {label}
                          </MobileNavLink>
                        ))}
                      </nav>

                      <div className="flex-1" />

                      {/* Bottom section */}
                      <div className="px-4 pb-6 pt-6 space-y-3">
                        {user ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: navLinks.length * 0.07 + 0.1, duration: 0.35 }}
                          >
                            <button
                              onClick={() => setMobileDrawerView('account')}
                              className="w-full text-left"
                              aria-label="My account"
                            >
                              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 mb-3 hover:bg-emerald-500/15 transition-all group">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-300 font-bold text-sm avatar-ring shrink-0">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{user.firstName || user.username}</p>
                                    <p className="text-slate-400 text-xs truncate">{user.email}</p>
                                  </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                              </div>
                            </button>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/15 font-bold text-sm transition-all"
                            >
                              <LogOut size={16} /> Sign Out
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: navLinks.length * 0.07 + 0.1, duration: 0.35 }}
                          >
                            <Link
                              to="/login"
                              onClick={() => setMobileOpen(false)}
                              className="btn-ghost-premium w-full justify-center py-3"
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              onClick={() => setMobileOpen(false)}
                              className="btn-cinematic w-full justify-center py-3"
                            >
                              Join Free
                            </Link>
                          </motion.div>
                        )}

                        <motion.div
                          className="flex items-center justify-between px-2 pt-2 border-t border-white/5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: navLinks.length * 0.07 + 0.25 }}
                        >
                          <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Appearance</span>
                          <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                          >
                            <motion.div
                              animate={{ rotate: isDark ? 180 : 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              style={{ display: 'flex' }}
                            >
                              {isDark ? <Sun size={14} /> : <Moon size={14} />}
                            </motion.div>
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="account-nav"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-6 space-y-6"
                    >
                      {/* Account Section */}
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 tracking-widest uppercase mb-2 px-2">Account</p>
                        <div className="space-y-1">
                          {[
                            { to: '/account-settings?tab=profile', label: 'My Profile', Icon: User },
                            { to: '/account-settings?tab=profile', label: 'Account Settings', Icon: Settings },
                            { to: '/account-settings?tab=activity', label: 'Recent Activity', Icon: Activity },
                            { to: '/account-settings?tab=logs', label: 'Activity Logs', Icon: ScrollText },
                          ].map(item => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <item.Icon size={16} className="text-slate-500" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Saved Content Section */}
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 tracking-widest uppercase mb-2 px-2">Saved Content</p>
                        <div className="space-y-1">
                          {[
                            { to: '/saved?tab=stories', label: 'Saved Food Stories', Icon: Bookmark },
                            { to: '/saved?tab=restaurants', label: 'Favorites', Icon: Heart },
                            { to: '/profile?tab=reviews', label: 'My Reviews', Icon: Star },
                          ].map(item => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <item.Icon size={16} className="text-slate-500" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Preferences Section */}
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 tracking-widest uppercase mb-2 px-2">Preferences</p>
                        <div className="space-y-1">
                          {[
                            { to: '/account-settings?tab=notifications', label: 'Notification Preferences', Icon: Bell },
                            { to: '/account-settings?tab=appearance', label: 'Theme & Language', Icon: Palette },
                            { to: '/help', label: 'Help & Support', Icon: HelpCircle },
                          ].map(item => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <item.Icon size={16} className="text-slate-500" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Security Section */}
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 tracking-widest uppercase mb-2 px-2">Security</p>
                        <div className="space-y-1">
                          {[
                            { to: '/account-settings?tab=profile', label: 'Change Password', Icon: Lock },
                            { to: '/account-settings?tab=security', label: 'Login Sessions', Icon: Shield },
                            { to: '/account-settings?tab=privacy', label: 'Privacy Settings', Icon: Eye },
                          ].map(item => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <item.Icon size={16} className="text-slate-500" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Action Section */}
                      <div className="pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/15 font-bold text-sm transition-all"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
