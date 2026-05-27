import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Settings, Activity, ScrollText, Bell, Shield, Palette,
  Camera, Edit3, Mail, Lock, Eye, EyeOff, Save, ChevronRight,
  Clock, Heart, Bookmark, MessageCircle, UserPlus, Search,
  Utensils, MapPin, Star, CheckCircle2, AlertCircle, 
  Smartphone, Monitor, Globe, Sun, Moon, ToggleLeft, ToggleRight,
  LogIn, LogOut, RefreshCw, ShieldAlert, Trash2, ArrowLeft
} from 'lucide-react';

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',       label: 'Profile',       Icon: User },
  { id: 'activity',      label: 'Activity',       Icon: Activity },
  { id: 'logs',          label: 'Logs',           Icon: ScrollText },
  { id: 'notifications', label: 'Notifications',  Icon: Bell },
  { id: 'privacy',       label: 'Privacy',        Icon: Eye },
  { id: 'security',      label: 'Security',       Icon: Shield },
  { id: 'appearance',    label: 'Appearance',     Icon: Palette },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ACTIVITY = [
  { id: 1, type: 'viewed',    icon: Utensils,      iconColor: 'text-emerald-400',  label: 'Viewed Señorita Lechon',              sub: 'Kawit, Cavite',       time: '10 min ago' },
  { id: 2, type: 'liked',     icon: Heart,         iconColor: 'text-pink-400',     label: 'Liked "Hidden Bulalo Spots"',          sub: 'Food Story',          time: '32 min ago' },
  { id: 3, type: 'commented', icon: MessageCircle, iconColor: 'text-sky-400',      label: 'Commented on Café de Cavite post',     sub: '"Looks amazing! 🙌"', time: '2h ago' },
  { id: 4, type: 'saved',     icon: Bookmark,      iconColor: 'text-amber-400',    label: 'Saved Bayside Grill',                  sub: 'Destinations',        time: '4h ago' },
  { id: 5, type: 'followed',  icon: UserPlus,      iconColor: 'text-violet-400',   label: 'Followed Sophia Mendoza',              sub: 'Food Storyteller',    time: '1d ago' },
  { id: 6, type: 'searched',  icon: Search,        iconColor: 'text-slate-400',    label: 'Searched "bulalo Tagaytay"',           sub: 'Search',              time: '1d ago' },
  { id: 7, type: 'viewed',    icon: MapPin,        iconColor: 'text-teal-400',     label: 'Viewed Tagaytay Restaurant Cluster',   sub: 'Map Explorer',        time: '2d ago' },
  { id: 8, type: 'liked',     icon: Star,          iconColor: 'text-yellow-400',   label: 'Rated "Café de Cavite" 5 stars',       sub: 'My Reviews',          time: '3d ago' },
];

const MOCK_LOGS = [
  { id: 1, action: 'login',           Icon: LogIn,        color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Login',            detail: 'Chrome on Windows — 192.168.1.1', time: 'Today, 11:34 AM' },
  { id: 2, action: 'profile_update',  Icon: Edit3,        color: 'text-sky-400',     bg: 'bg-sky-500/10',     label: 'Profile Updated',  detail: 'Changed display name',            time: 'Yesterday, 2:15 PM' },
  { id: 3, action: 'saved',           Icon: Bookmark,     color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Post Saved',       detail: '"Tagaytay Bulalo Spots"',          time: 'Yesterday, 12:00 PM' },
  { id: 4, action: 'password_change', Icon: Lock,         color: 'text-violet-400',  bg: 'bg-violet-500/10',  label: 'Password Changed', detail: 'Password updated successfully',    time: '3 days ago, 9:45 AM' },
  { id: 5, action: 'logout',          Icon: LogOut,       color: 'text-slate-400',   bg: 'bg-slate-500/10',   label: 'Logout',           detail: 'Session ended',                   time: '3 days ago, 8:00 PM' },
  { id: 6, action: 'review',          Icon: Star,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  label: 'Review Submitted', detail: 'Café de Cavite — 5 stars',         time: '4 days ago, 3:30 PM' },
  { id: 7, action: 'follow',          Icon: UserPlus,     color: 'text-pink-400',    bg: 'bg-pink-500/10',    label: 'Followed Creator', detail: 'Sophia Mendoza',                  time: '5 days ago, 6:20 PM' },
  { id: 8, action: 'login',           Icon: LogIn,        color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Login',            detail: 'Mobile Safari on iPhone',         time: '6 days ago, 10:02 AM' },
  { id: 9, action: 'settings',        Icon: Settings,     color: 'text-teal-400',    bg: 'bg-teal-500/10',    label: 'Settings Changed', detail: 'Theme set to Dark',               time: '7 days ago, 4:50 PM' },
];

const MOCK_SESSIONS = [
  { id: 1, icon: Monitor,    device: 'Chrome · Windows 11',  location: 'Cavite City, PH', time: 'Active now',       current: true },
  { id: 2, icon: Smartphone, device: 'Safari · iPhone 14',   location: 'Tagaytay, PH',    time: '2 hours ago',      current: false },
  { id: 3, icon: Globe,      device: 'Firefox · macOS',      location: 'Makati City, PH', time: '3 days ago',       current: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-black/30 border border-emerald-500/10 rounded-[24px] p-6 space-y-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-base">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-400/80 uppercase tracking-wider">
        {Icon && <Icon size={11} />}{label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, type = 'text', placeholder, readOnly }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className="w-full bg-[#040806] border border-emerald-500/10 rounded-xl px-4 py-3 text-sm text-slate-100
                 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 focus:ring-1 
                 focus:ring-emerald-500/20 transition-all read-only:opacity-50 read-only:cursor-not-allowed"
    />
  );
}

function Toggle({ label, description, value, onChange, accent = 'emerald' }) {
  const colors = {
    emerald: { on: 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.4)]', off: 'bg-slate-700' },
    red:     { on: 'bg-red-500',                                             off: 'bg-slate-700' },
    amber:   { on: 'bg-amber-500',                                           off: 'bg-slate-700' },
  };
  const c = colors[accent] || colors.emerald;
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-bold text-white leading-snug">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${value ? c.on : c.off}`}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg ${value ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

function SaveButton({ onClick, loading }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_16px_rgba(52,211,153,0.3)]"
    >
      <Save size={14} />{loading ? 'Saving...' : 'Save Changes'}
    </motion.button>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function ProfileTab({ user }) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName]   = useState(user?.lastName || '');
  const [email, setEmail]         = useState(user?.email || '');
  const [showPw, setShowPw]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <SectionCard title="Profile Picture">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 font-black text-3xl shrink-0"
            style={{ boxShadow: '0 0 0 2px rgba(52,211,153,0.3), 0 0 20px rgba(52,211,153,0.1)' }}
          >
            {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
          </div>
          <div className="space-y-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
            >
              <Camera size={13} /> Upload New Photo
            </motion.button>
            <p className="text-xs text-slate-600">JPG, PNG, or WebP · max 2MB</p>
          </div>
        </div>
      </SectionCard>

      {/* Personal Info */}
      <SectionCard
        title="Personal Information"
        action={<SaveButton onClick={handleSave} />}
      >
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"
          >
            <CheckCircle2 size={13} /> Changes saved successfully
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="First Name" icon={User}>
            <TextInput value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
          </FieldRow>
          <FieldRow label="Last Name" icon={User}>
            <TextInput value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
          </FieldRow>
        </div>
        <FieldRow label="Email Address" icon={Mail}>
          <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </FieldRow>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password">
        <FieldRow label="Current Password" icon={Lock}>
          <div className="relative">
            <TextInput type={showPw ? 'text' : 'password'} placeholder="Enter current password" />
            <button
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </FieldRow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="New Password" icon={Lock}>
            <TextInput type={showPw ? 'text' : 'password'} placeholder="New password" />
          </FieldRow>
          <FieldRow label="Confirm New Password" icon={Lock}>
            <TextInput type={showPw ? 'text' : 'password'} placeholder="Confirm new password" />
          </FieldRow>
        </div>
        <div className="pt-1">
          <SaveButton onClick={() => {}} />
        </div>
      </SectionCard>
    </div>
  );
}

function ActivityTab() {
  return (
    <SectionCard title="Recent Activity">
      <div className="space-y-1">
        {MOCK_ACTIVITY.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-emerald-500/5 transition-all group cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-xl bg-black/30 border border-emerald-500/10 flex items-center justify-center shrink-0`}>
              <item.icon size={15} className={item.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-snug truncate">{item.label}</p>
              <p className="text-xs text-slate-500 truncate">{item.sub}</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 shrink-0">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}

function LogsTab() {
  return (
    <SectionCard title="Activity Logs">
      <p className="text-xs text-slate-600 -mt-2">Timestamped audit trail of all account actions</p>
      <div className="space-y-1">
        {MOCK_LOGS.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-white/[0.02] transition-all"
          >
            <div className={`w-8 h-8 rounded-xl ${log.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <log.Icon size={13} className={log.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white leading-none">{log.label}</p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{log.detail}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600 shrink-0 mt-0.5">
              <Clock size={9} />{log.time}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    likes:       true,
    comments:    true,
    followers:   true,
    restaurants: true,
    trending:    false,
    promos:      true,
    bookings:    true,
    email:       false,
    push:        true,
  });

  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      <SectionCard title="In-App Notifications">
        <div className="space-y-4 divide-y divide-emerald-500/5">
          {[
            { key: 'likes',       label: 'New Likes',                    desc: 'When someone likes your posts or comments' },
            { key: 'comments',    label: 'New Comments',                  desc: 'When someone replies to your activity' },
            { key: 'followers',   label: 'New Followers',                 desc: 'When someone follows your profile' },
            { key: 'restaurants', label: 'Restaurant Recommendations',    desc: 'Personalized spots based on your taste' },
            { key: 'trending',    label: 'Trending Food Alerts',          desc: 'When a hashtag you follow is trending' },
            { key: 'promos',      label: 'Promo Notifications',           desc: 'Limited-time deals from restaurants' },
            { key: 'bookings',    label: 'Booking / Reservation Updates', desc: 'Status updates for your reservations' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="pt-3 first:pt-0">
              <Toggle label={label} description={desc} value={prefs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Delivery Channels">
        <div className="space-y-4">
          <Toggle label="Email Notifications" description="Receive a daily digest via email" value={prefs.email} onChange={() => toggle('email')} />
          <Toggle label="Push Notifications" description="Browser push notifications" value={prefs.push} onChange={() => toggle('push')} />
        </div>
      </SectionCard>
    </div>
  );
}

function PrivacyTab() {
  const [prefs, setPrefs] = useState({
    profilePublic:  true,
    showActivity:   true,
    showReviews:    true,
    allowFollow:    true,
    dataAnalytics:  false,
    adPersonal:     false,
  });
  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      <SectionCard title="Profile Visibility">
        <div className="space-y-4 divide-y divide-emerald-500/5">
          {[
            { key: 'profilePublic', label: 'Public Profile',    desc: 'Anyone can see your profile and posts' },
            { key: 'showActivity',  label: 'Show Activity',     desc: 'Show your recent activity to others' },
            { key: 'showReviews',   label: 'Public Reviews',    desc: 'Display your reviews publicly' },
            { key: 'allowFollow',   label: 'Allow Follows',     desc: 'Let other users follow you' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="pt-3 first:pt-0">
              <Toggle label={label} description={desc} value={prefs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Data & Personalization">
        <div className="space-y-4 divide-y divide-emerald-500/5">
          {[
            { key: 'dataAnalytics', label: 'Usage Analytics',         desc: 'Help us improve HungryLakwatsero', accent: 'amber' },
            { key: 'adPersonal',    label: 'Personalized Content',    desc: 'Tailored recommendations based on behavior', accent: 'amber' },
          ].map(({ key, label, desc, accent }) => (
            <div key={key} className="pt-3 first:pt-0">
              <Toggle label={label} description={desc} value={prefs[key]} onChange={() => toggle(key)} accent={accent} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Delete Account</p>
              <p className="text-xs text-slate-500 mt-0.5">Permanently remove all your data. This cannot be undone.</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all">
              Delete
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Active Sessions">
        <p className="text-xs text-slate-600 -mt-2">Devices currently logged in to your account</p>
        <div className="space-y-3">
          {MOCK_SESSIONS.map(session => (
            <div key={session.id} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/20 border border-emerald-500/8 hover:border-emerald-500/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <session.icon size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white leading-none truncate">{session.device}</p>
                  {session.current && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{session.location} · {session.time}</p>
              </div>
              {!session.current && (
                <button className="text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-bold text-red-400 py-2.5 rounded-xl border border-red-500/15 hover:bg-red-500/10 transition-all">
          <LogOut size={13} /> Sign Out All Other Sessions
        </button>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication">
        <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
          <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">2FA is not enabled</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Add an extra layer of security. We'll send a code to your phone whenever you sign in.
            </p>
            <button className="mt-3 flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition-all">
              Enable 2FA <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const isDark = theme === 'dark';

  return (
    <div className="space-y-5">
      <SectionCard title="Theme Preference">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'dark',  Icon: Moon, label: 'Dark Mode',  desc: 'Premium dark emerald theme' },
            { id: 'light', Icon: Sun,  label: 'Light Mode', desc: 'Clean light theme' },
          ].map(opt => (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { if (theme !== opt.id) toggleTheme(); }}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
                theme === opt.id
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-emerald-500/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === opt.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'
              }`}>
                <opt.Icon size={20} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${theme === opt.id ? 'text-emerald-400' : 'text-slate-400'}`}>{opt.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{opt.desc}</p>
              </div>
              {theme === opt.id && (
                <CheckCircle2 size={14} className="text-emerald-400" />
              )}
            </motion.button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Language">
        <FieldRow label="Display Language" icon={Globe}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full bg-[#040806] border border-emerald-500/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/40 transition-all appearance-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="fil">Filipino (Tagalog)</option>
            <option value="ceb">Cebuano</option>
          </select>
        </FieldRow>
        <SaveButton onClick={() => {}} />
      </SectionCard>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const setTab = (id) => {
    setSearchParams(id === 'profile' ? {} : { tab: id });
  };

  const currentTabConfig = TABS.find(t => t.id === activeTab) || TABS[0];

  const renderPanel = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileTab user={user} />;
      case 'activity':      return <ActivityTab />;
      case 'logs':          return <LogsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'privacy':       return <PrivacyTab />;
      case 'security':      return <SecurityTab />;
      case 'appearance':    return <AppearanceTab />;
      default:              return <ProfileTab user={user} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#030704] font-body text-slate-100 antialiased pb-20">
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/4 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-emerald-700/4 blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-4 lg:pt-8 relative z-10">
        
        {/* Mobile Sticky Header */}
        <div className="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-4 mb-6 bg-[#030704]/80 backdrop-blur-xl border-b border-emerald-500/10 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg leading-tight truncate">{currentTabConfig.label}</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Account Settings</p>
          </div>
        </div>

        {/* Desktop Page Header */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
            <Link to="/tourist-dashboard" className="hover:text-emerald-400 transition-colors font-semibold">Feed</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400 font-semibold">Account Settings</span>
            {activeTab !== 'profile' && (
              <>
                <ChevronRight size={12} />
                <span className="text-emerald-400 font-semibold">{currentTabConfig.label}</span>
              </>
            )}
          </div>
          <h1 className="font-display font-black text-white text-3xl md:text-4xl leading-none">
            Account <span className="text-emerald-400">Settings</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">Manage your profile, preferences, and security</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">

            {/* Desktop sidebar */}
            <div className="hidden lg:block bg-black/30 border border-emerald-500/10 rounded-[24px] p-3 backdrop-blur-xl">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.Icon size={15} className={activeTab === tab.id ? 'text-emerald-400' : 'text-slate-600'} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content Panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
