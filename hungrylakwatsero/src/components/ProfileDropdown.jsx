import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  User, Settings, Activity, ScrollText, Bookmark,
  Heart, Star, Bell, HelpCircle, LogOut,
  ChevronRight, ShieldCheck, Award, Zap, X
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(user) {
  if (!user) return 'U';
  const f = user.firstName?.[0] || '';
  const l = user.lastName?.[0] || '';
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
}

function getRoleMeta(user) {
  if (!user) return { label: 'Guest', cls: 'text-slate-400 bg-slate-500/10 border-slate-500/20', Icon: User };
  if (user.roleId === 3 || user.role === 'Admin')
    return { label: 'Admin', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30', Icon: ShieldCheck };
  if (user.roleId === 2 || user.role === 'Food Business Owner')
    return { label: 'Owner', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30', Icon: Award };
  return { label: 'Tourist', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Icon: Zap };
}

function getDashboardPath(user) {
  if (!user) return '/';
  if (user.roleId === 3 || user.role === 'Admin') return '/admin-dashboard';
  if (user.roleId === 2 || user.role === 'Food Business Owner') return '/owner-dashboard';
  return '/tourist-dashboard';
}

// ─── Menu Sections ────────────────────────────────────────────────────────────

const getMenuItems = (dashboardPath) => [
  {
    section: 'Account',
    items: [
      { icon: User,       label: 'My Profile',      to: '/profile',                        color: 'text-emerald-400' },
      { icon: Settings,   label: 'Account Settings', to: '/account-settings',               color: 'text-slate-400' },
      { icon: Activity,   label: 'Recent Activity',  to: '/account-settings?tab=activity', color: 'text-sky-400' },
      { icon: ScrollText, label: 'Activity Logs',    to: '/account-settings?tab=logs',     color: 'text-violet-400' },
    ],
  },
  {
    section: 'Saved Content',
    items: [
      { icon: Bookmark, label: 'Saved Food Stories', to: '/saved',     color: 'text-amber-400' },
      { icon: Heart,    label: 'Favorites',           to: '/favorites', color: 'text-pink-400' },
      { icon: Star,     label: 'My Reviews',          to: '/reviews',   color: 'text-yellow-400' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { icon: Bell,       label: 'Notification Preferences', to: '/account-settings?tab=notifications', color: 'text-orange-400' },
      { icon: HelpCircle, label: 'Help & Support',           to: '/account-settings?tab=support',      color: 'text-teal-400' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileDropdown({ initials: _initials }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initials = getInitials(user);
  const roleMeta = getRoleMeta(user);
  const RoleIcon = roleMeta.Icon;
  const dashboardPath = getDashboardPath(user);
  const menuSections = getMenuItems(dashboardPath);

  // Close on outside click / Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onPointer(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative hidden lg:block" ref={ref}>
      {/* Trigger */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-emerald-500/8 transition-all duration-200 border border-transparent hover:border-emerald-500/20"
      >
        <div
          className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0"
          style={{ boxShadow: open ? '0 0 0 2px rgba(52,211,153,0.8), 0 0 16px rgba(52,211,153,0.4)' : '0 0 0 2px rgba(52,211,153,0.4), 0 0 8px rgba(52,211,153,0.15)' }}
        >
          {initials}
        </div>
        <div className="text-left hidden xl:block">
          <p className="text-white text-sm font-bold leading-tight">{user.firstName || user.username}</p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${roleMeta.cls}`}>
            <RoleIcon size={9} /> {roleMeta.label}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden xl:block"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-500">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-full mt-3 w-[300px] z-[200] rounded-[20px] overflow-hidden"
            style={{
              background: 'rgba(8, 14, 10, 0.97)',
              backdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(52,211,153,0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(52,211,153,0.06), inset 0 1px 0 rgba(52,211,153,0.08)',
            }}
          >
            {/* User Header */}
            <div className="px-5 pt-5 pb-4 border-b border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 flex items-center justify-center text-emerald-300 font-black text-lg shrink-0"
                  style={{ boxShadow: '0 0 0 2px rgba(52,211,153,0.4), 0 0 16px rgba(52,211,153,0.2)' }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-slate-500 text-[11px] truncate mt-0.5">{user.email}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${roleMeta.cls}`}>
                    <RoleIcon size={9} /> {roleMeta.label}
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all shrink-0 self-start"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="py-2 max-h-[420px] overflow-y-auto scrollbar-hide">
              {menuSections.map((section, si) => (
                <div key={section.section}>
                  {si > 0 && <div className="mx-4 my-1.5 h-px bg-emerald-500/8" />}
                  <p className="px-5 pt-2.5 pb-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {section.section}
                  </p>
                  {section.items.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-emerald-500/5 transition-all duration-150 group"
                    >
                      <item.icon size={14} className={`${item.color} shrink-0`} />
                      <span className="flex-1 leading-none">{item.label}</span>
                      <ChevronRight size={11} className="text-slate-700 group-hover:text-emerald-500/60 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-red-500/10 px-4 py-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group border border-transparent hover:border-red-500/20"
              >
                <LogOut size={14} className="shrink-0" />
                <span className="flex-1 text-left">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
