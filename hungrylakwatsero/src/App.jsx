import React, { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Lenis from 'lenis';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import { Home, Map, BookOpen, User, Compass } from 'lucide-react';

// ─── Lazy Page Imports ────────────────────────────────────────────────────────

const LandingPage          = lazy(() => import('./pages/LandingPage'));
const MapExplorerPage      = lazy(() => import('./pages/MapExplorerPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const FoodStoriesPage      = lazy(() => import('./pages/FoodStoriesPage'));
const Login                = lazy(() => import('./pages/Login'));
const Register             = lazy(() => import('./pages/Register'));
const ForgotPassword       = lazy(() => import('./pages/ForgotPassword'));
const TouristDashboard     = lazy(() => import('./pages/TouristDashboard'));
const OwnerDashboard       = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard       = lazy(() => import('./pages/AdminDashboard'));
const AboutCavitePage      = lazy(() => import('./pages/AboutCavitePage'));

// ─── New Features Pages ────────────────────────────────────────────────────────
const DiscoverPage         = lazy(() => import('./pages/DiscoverPage'));
const FavoritesPage        = lazy(() => import('./pages/FavoritesPage'));
const ReviewsPage          = lazy(() => import('./pages/ReviewsPage'));
const HiddenGemsPage       = lazy(() => import('./pages/HiddenGemsPage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));
const SavedPage            = lazy(() => import('./pages/SavedPage'));
const AccountSettingsPage  = lazy(() => import('./pages/AccountSettingsPage'));

// ─── Lenis Smooth Scroll ──────────────────────────────────────────────────────

function LenisSetup() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

function LenisScrollProvider() {
  const location = useLocation();
  const noSmooth = ['/map', '/admin-dashboard', '/owner-dashboard', '/tourist-dashboard'];
  const isSmooth = !noSmooth.some(p => location.pathname.startsWith(p));
  
  return isSmooth ? <LenisSetup /> : null;
}

// ─── Premium Page Loader ───────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#060f09] flex flex-col items-center justify-center z-[9999]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-orb-green w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 animate-orb" />
      </div>

      {/* Logo animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-16 h-16 mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
          {/* Inner glow */}
          <motion.div
            animate={{ scale: [0.85, 1, 0.85], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-3 rounded-full bg-emerald-500/15"
          />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-emerald-400/70 text-xs font-bold tracking-widest uppercase"
        >
          HungryLakwatsero
        </motion.p>
        <p className="text-gray-700 text-[10px] tracking-wider mt-1">Eat. Explore. Experience.</p>
      </motion.div>
    </div>
  );
}

// ─── 404 Not Found Page ───────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#060f09] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-orb-green w-96 h-96 top-1/4 left-1/4 opacity-20 animate-orb" />
        <div className="hero-orb-gold w-72 h-72 bottom-1/4 right-1/4 opacity-15 animate-orb" style={{ animationDelay: '3s' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full text-center relative z-10"
      >
        <div className="relative w-28 h-28 mx-auto mb-8">
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-emerald-500/10"
          />
          <div className="absolute inset-3 rounded-full bg-emerald-500/5 border border-emerald-500/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass size={52} className="text-emerald-500/60" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">404 — Page Not Found</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Lost on the<br />
          <span className="text-gradient-brand italic">Culinary Map</span>
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          This culinary destination doesn't exist yet — or it may have moved.
          Let's get you back to exploring the flavors of Cavite.
        </p>
        <Link to="/">
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-cinematic inline-flex mb-4"
          >
            <Home size={16} /> Back to Home
          </motion.div>
        </Link>
        <div className="mt-2">
          <Link to="/map" className="text-gray-600 hover:text-emerald-400 text-sm font-semibold transition-colors">
            Or explore the map
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────

function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-background font-body antialiased text-primary relative overflow-x-hidden">
      <LenisScrollProvider />
      <ScrollToTop />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0 w-full">
        <Navbar />
        <main className="flex-1 w-full min-w-0 pb-safe md:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full min-w-0"
            >
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  {/* ── Public Discovery ── */}
                  <Route path="/"               element={<LandingPage />} />
                  <Route path="/map"            element={<MapExplorerPage />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                  <Route path="/stories"        element={<FoodStoriesPage />} />
                  <Route path="/about"          element={<AboutCavitePage />} />

                  {/* ── Auth ── */}
                  <Route path="/login"           element={<Login />} />
                  <Route path="/register"        element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* ── Protected Dashboards & Sidebar Pages ── */}
                  <Route path="/tourist-dashboard" element={<ProtectedRoute allowedRoles={['Tourist']}><TouristDashboard /></ProtectedRoute>} />
                  <Route path="/owner-dashboard" element={<ProtectedRoute allowedRoles={['Food Business Owner']}><OwnerDashboard /></ProtectedRoute>} />
                  <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />

                  <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                  <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
                  <Route path="/hidden-gems" element={<ProtectedRoute><HiddenGemsPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
                  <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

                  {/* ── 404 Catch-all ── */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <SidebarProvider>
                {/* Premium react-hot-toast global configuration */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3500,
                    style: {
                      background: 'rgba(10, 31, 20, 0.95)',
                      color: '#a7f3d0',
                      border: '1px solid rgba(52, 211, 153, 0.2)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.05)',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: "'Outfit', 'Nunito', sans-serif",
                    },
                    success: {
                      iconTheme: { primary: '#10b981', secondary: '#0a1f14' },
                      style: {
                        background: 'rgba(5, 46, 22, 0.95)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                      },
                    },
                    error: {
                      iconTheme: { primary: '#f87171', secondary: '#1f0505' },
                      style: {
                        background: 'rgba(31, 5, 5, 0.95)',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                        color: '#fca5a5',
                      },
                    },
                  }}
                />
                <AppLayout />
              </SidebarProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
