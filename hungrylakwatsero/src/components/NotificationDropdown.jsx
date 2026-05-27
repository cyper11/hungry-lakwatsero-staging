import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell, ThumbsUp, MessageCircle, UserPlus, Utensils,
  Flame, Tag, Calendar, Check, CheckCheck, X, ChevronRight
} from 'lucide-react';

// ─── Mock Notification Data ───────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS = [
  {
    id: 1, category: 'likes', read: false,
    icon: ThumbsUp, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10',
    title: 'Juan Garcia liked your post',
    body: '"Hidden gem bulalo spot in Tagaytay 🍜"',
    time: '2m ago',
  },
  {
    id: 2, category: 'comments', read: false,
    icon: MessageCircle, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/10',
    title: 'Maria Santos commented',
    body: '"This looks absolutely amazing! Adding to my list 🥹"',
    time: '8m ago',
  },
  {
    id: 3, category: 'followers', read: false,
    icon: UserPlus, iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10',
    title: 'Sophia Mendoza started following you',
    body: 'Food Storyteller · Cavite',
    time: '25m ago',
  },
  {
    id: 4, category: 'restaurants', read: false,
    icon: Utensils, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10',
    title: 'New restaurant near you!',
    body: 'Café de Cavite just opened in Kawit — rated 4.9 ⭐',
    time: '1h ago',
  },
  {
    id: 5, category: 'trending', read: true,
    icon: Flame, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10',
    title: '#CaviteFoodie is trending',
    body: '2.4k posts this week — join the conversation!',
    time: '3h ago',
  },
  {
    id: 6, category: 'promos', read: true,
    icon: Tag, iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10',
    title: 'Flash promo at Señorita Lechon',
    body: '20% off for dine-in until 8PM today only 🎉',
    time: '4h ago',
  },
  {
    id: 7, category: 'bookings', read: true,
    icon: Calendar, iconColor: 'text-teal-400', iconBg: 'bg-teal-500/10',
    title: 'Reservation reminder',
    body: 'Your table at Bayside Grill is in 2 hours',
    time: '5h ago',
  },
];

const CATEGORY_LABELS = {
  all: 'All',
  likes: 'Likes',
  comments: 'Comments',
  followers: 'Followers',
  restaurants: 'Recs',
  trending: 'Trending',
  promos: 'Promos',
  bookings: 'Bookings',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState('all');
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const filtered = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.88 }}
        aria-label="Notifications"
        className="relative p-2 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 hidden md:flex items-center justify-center"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 bell-dot"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-2rem)] z-[200] rounded-[20px] overflow-hidden"
            style={{
              background: 'rgba(8, 14, 10, 0.95)',
              backdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(52,211,153,0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.06), inset 0 1px 0 rgba(52,211,153,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h3 className="text-white font-black text-base leading-none">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-emerald-400/70 text-[11px] font-semibold mt-1">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-emerald-500/10"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </motion.button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-4 pb-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const catCount = key === 'all'
                    ? notifications.filter(n => !n.read).length
                    : notifications.filter(n => n.category === key && !n.read).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                        activeCategory === key
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-emerald-300 hover:border-emerald-500/20'
                      }`}
                    >
                      {label}
                      {catCount > 0 && (
                        <span className={`ml-1 inline-block min-w-[16px] h-[16px] rounded-full text-[9px] font-black px-1 ${
                          activeCategory === key ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {catCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-1" />

            {/* Notification List */}
            <div className="max-h-[340px] overflow-y-auto scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-center px-6">
                  <Bell size={28} className="text-emerald-500/20" />
                  <p className="text-slate-500 text-sm font-semibold">No notifications here</p>
                </div>
              ) : (
                <div className="py-1">
                  {filtered.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <motion.button
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        whileHover={{ backgroundColor: 'rgba(52,211,153,0.04)' }}
                        className={`w-full flex items-start gap-3.5 px-5 py-3.5 text-left transition-all duration-200 relative ${
                          !notif.read ? 'bg-emerald-500/[0.03]' : ''
                        }`}
                      >
                        {/* Unread indicator */}
                        {!notif.read && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        )}

                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon size={16} className={notif.iconColor} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-bold leading-snug ${notif.read ? 'text-slate-400' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-[11px] mt-0.5 leading-snug truncate ${notif.read ? 'text-slate-600' : 'text-slate-400'}`}>
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-emerald-500/50 font-semibold mt-1">{notif.time}</p>
                        </div>

                        {/* Read check */}
                        {notif.read && (
                          <Check size={12} className="text-emerald-500/30 shrink-0 mt-1" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-emerald-500/10 px-5 py-3.5">
              <Link
                to="/tourist-dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                View All Notifications
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
