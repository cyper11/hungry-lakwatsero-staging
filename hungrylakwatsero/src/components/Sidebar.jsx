import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Home, MapPin, BookOpen, Calendar, Info, LayoutDashboard,
  Rss, Compass, Heart, Star, Leaf, User, Bookmark, LogOut, Sun, Moon, X, ShieldCheck, Award, Sparkles
} from 'lucide-react';

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

function NavLink({ to, children, onClick, Icon }) {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const base = 'flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200';
  
  const active = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30';
  const inactive = 'text-secondary hover:text-primary hover:bg-secondary/50 border border-transparent';
    
  return (
    <Link to={to} onClick={onClick} className={`${base} ${isActive ? active : inactive}`}>
      {Icon && <Icon size={18} className={`mr-3 ${isActive ? 'text-emerald-500' : 'text-muted'}`} />}
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const isDark = theme === 'dark';

  const roleMeta = getRoleMeta(user);
  const RoleIcon = roleMeta.Icon;
  const initials = getInitials(user);
  const dashboardPath = getDashboardPath(user);

  // Determine classes for drawer vs persistent
  // On mobile (lg:hidden): always fixed drawer
  // On desktop: always hidden (use top navbar only)
  const desktopSidebarClasses = 'lg:hidden';
  const mobileDrawerClasses = isOpen ? 'translate-x-0' : '-translate-x-full';

  useEffect(() => {
    // Only lock body scroll if we are acting as a mobile drawer AND it's open
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      closeSidebar();
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* ── Drawer Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* ── Drawer / Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-80 max-w-[85vw] bg-card border-r border-border-primary flex flex-col 
        transform transition-transform duration-300 ease-in-out shadow-xl 
        ${mobileDrawerClasses} ${desktopSidebarClasses}`}>

        {/* User Top Section */}
        {user ? (
          <div className="flex items-start justify-between px-6 pt-8 pb-6 border-b border-border-primary">
            <Link to="/profile" onClick={closeSidebar} className="flex items-center gap-4 hover:opacity-80 transition cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-secondary border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-primary font-bold text-base leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-muted text-xs mt-0.5 mb-1.5 truncate">{user.email}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.cls}`}>
                  <RoleIcon size={10} /> {roleMeta.label}
                </span>
              </div>
            </Link>
            <button onClick={closeSidebar} className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-secondary transition lg:hidden">
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-border-primary">
            <span className="font-display font-black text-primary text-lg">Menu</span>
            <button onClick={closeSidebar} className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-secondary transition">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Unified Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          <div className="space-y-1 mb-6">
            <NavLink to="/" onClick={closeSidebar} Icon={Home}>Home</NavLink>
            <NavLink to="/map" onClick={closeSidebar} Icon={MapPin}>Map Explorer</NavLink>
            <NavLink to="/stories" onClick={closeSidebar} Icon={BookOpen}>Food Stories</NavLink>
            <NavLink to="/hidden-gems" onClick={closeSidebar} Icon={Sparkles}>Hidden Gems</NavLink>
            <NavLink to="/about" onClick={closeSidebar} Icon={Info}>About Cavite</NavLink>
            {user && (
              <NavLink to={dashboardPath} onClick={closeSidebar} Icon={LayoutDashboard}>
                My Dashboard
              </NavLink>
            )}
          </div>

          {user && (
            <>
              <div className="w-full h-px bg-border-primary mb-6" />
              <div className="space-y-1">
                <NavLink to="/tourist-dashboard" onClick={closeSidebar} Icon={Rss}>Feed</NavLink>
                <NavLink to="/discover" onClick={closeSidebar} Icon={Compass}>Discover</NavLink>
                <NavLink to="/favorites" onClick={closeSidebar} Icon={Heart}>Favorites</NavLink>
                <NavLink to="/reviews" onClick={closeSidebar} Icon={Star}>Reviews</NavLink>
                <NavLink to="/hidden-gems" onClick={closeSidebar} Icon={Leaf}>Hidden Gems</NavLink>
                <NavLink to="/profile" onClick={closeSidebar} Icon={User}>Profile</NavLink>
                <NavLink to="/saved" onClick={closeSidebar} Icon={Bookmark}>Saved</NavLink>
              </div>
            </>
          )}
        </nav>

        {/* Fixed Bottom Section */}
        <div className="p-6 border-t border-border-primary space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-bold text-secondary">Theme</span>
            <button onClick={toggleTheme} className="p-2 rounded-full text-muted hover:text-primary hover:bg-secondary transition" aria-label="Toggle theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500/30"
            >
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={closeSidebar} className="w-full text-center px-4 py-3.5 text-sm font-bold text-primary bg-secondary border border-border-primary hover:bg-secondary/80 rounded-xl transition-colors">Sign In</Link>
              <Link to="/register" onClick={closeSidebar} className="w-full text-center px-4 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-leaf transition-colors">Join Free</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
