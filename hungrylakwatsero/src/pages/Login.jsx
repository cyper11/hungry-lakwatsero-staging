import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail, KeyRound, Eye, EyeOff, RefreshCw,
  AlertCircle, LogIn, Copy, Check, Shield, User, Building2, HelpCircle
} from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaNum1, setCaptchaNum1] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaNum2, setCaptchaNum2] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaInput('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (Number(captchaInput) !== captchaNum1 + captchaNum2) {
      setError('Incorrect security answer. Please try again.');
      toast.error('Security verification failed.');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password, rememberMe });
      toast.success(`Welcome back, ${user?.firstName || 'User'}! 👋`);
      // Redirect by role
      if (user?.roleId === 3 || user?.role === 'Admin') navigate('/admin-dashboard');
      else if (user?.roleId === 2 || user?.role === 'Food Business Owner') navigate('/owner-dashboard');
      else navigate('/tourist-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials and try again.');
      toast.error('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail, demoPwd) => {
    setEmail(demoEmail);
    setPassword(demoPwd);
    setCaptchaInput(String(captchaNum1 + captchaNum2));
    toast.info('Credentials filled! Click Sign In to continue.');
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Copied credentials to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const demoAccounts = [
    import.meta.env.VITE_DEMO_TOURIST_EMAIL && { label: 'Tourist', email: import.meta.env.VITE_DEMO_TOURIST_EMAIL, pwd: import.meta.env.VITE_DEMO_PASSWORD || '', icon: User, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    import.meta.env.VITE_DEMO_OWNER_EMAIL && { label: 'Food Owner', email: import.meta.env.VITE_DEMO_OWNER_EMAIL, pwd: import.meta.env.VITE_DEMO_PASSWORD || '', icon: Building2, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    import.meta.env.VITE_DEMO_ADMIN_EMAIL && { label: 'Admin', email: import.meta.env.VITE_DEMO_ADMIN_EMAIL, pwd: import.meta.env.VITE_DEMO_PASSWORD || '', icon: Shield, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden font-sans transition-colors duration-300">
      {/* ─── LEFT PANEL: Hero Branding (Desktop Only) ─── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16 border-r border-primary/10">
        {/* Background Overlay / Aesthetic image */}
        <div 
          className="absolute inset-0 bg-cover bg-center dark:opacity-40 transition-opacity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent pointer-events-none" />
        
        {/* Logo */}
        <div className="relative z-10 bg-card/80 backdrop-blur-md self-start p-3 rounded-2xl shadow-sm border border-primary/10">
          <Link to="/" className="flex items-center transition">
            <img src="/favicon.png" alt="Logo" className="h-10 w-auto" />
            <span className="ml-3 font-display font-black text-primary text-xl">Hungry<span className="text-emerald-500">Lakwatsero</span></span>
          </Link>
        </div>

        {/* Tagline / Marketing Copy */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="space-y-3">
            <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-[10px] py-1.5 px-3 rounded-full border border-emerald-500/20">Cavite Culinary Tourism</span>
            <h1 className="font-display text-4xl lg:text-6xl font-black text-primary leading-[1.1]">
              Taste the<br/>Heritage of<br/><span className="text-emerald-500">Cavite</span>
            </h1>
          </div>
          <p className="text-secondary font-medium text-base leading-relaxed max-w-md bg-card/60 p-4 rounded-xl backdrop-blur-sm border border-primary/10">
            Join thousands of food travelers exploring authentic recipes, heritage dining spots, and hidden culinary gems in Cavite province.
          </p>
          {/* Micro interaction lists */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
            <div>
              <p className="text-primary font-bold text-sm">300+ Eateries</p>
              <p className="text-muted text-xs mt-0.5">Verified culinary spots</p>
            </div>
            <div>
              <p className="text-primary font-bold text-sm">Cavite Only</p>
              <p className="text-muted text-xs mt-0.5">Strictly localized mapping</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted font-medium">
          <p>© 2026 HungryLakwatsero Platform</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-500 transition">Terms</a>
            <a href="#" className="hover:text-emerald-500 transition">Privacy</a>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Authentication Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-background">
        <div className="max-w-[420px] w-full space-y-8 animate-fade-in-up">
          {/* Logo / Header for mobile / tablet */}
          <div className="text-center md:text-left space-y-2">
            <Link to="/" className="inline-flex md:hidden items-center transition mb-3 bg-card p-2 rounded-xl shadow-sm border border-primary/10">
              <img src="/favicon.png" alt="Logo" className="h-8 w-auto" />
            </Link>
            <h2 className="font-display text-3xl font-black text-primary tracking-tight">Welcome back</h2>
            <p className="text-muted text-sm">Sign in to manage your food profile and reviews.</p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl p-6 sm:p-8 border border-primary/10 shadow-sm transition-all duration-300">
            {error && (
              <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email / Username */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Email or Username</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 pl-12 transition-all"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Password</label>
                  <Link to="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400 font-bold transition">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 pl-12 pr-12 transition-all"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(s => !s)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between py-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(r => !r)}
                  className="flex items-center gap-3 group text-left focus:outline-none"
                >
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                      ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-primary/20 bg-background group-hover:border-emerald-500/20'}`}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                  <span className="text-sm text-secondary font-medium">
                    Keep me signed in
                  </span>
                </button>
              </div>

              {/* Redesigned Security CAPTCHA Card */}
              <div className="bg-secondary border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-500 block">Security Check</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold text-base font-mono select-none tracking-wider">
                      {captchaNum1} + {captchaNum2} = ?
                    </span>
                    <button 
                      type="button" 
                      onClick={refreshCaptcha} 
                      className="text-muted hover:text-emerald-500 p-1 rounded transition-colors"
                      title="Refresh Question"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  required
                  placeholder="Answer"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  className="w-24 bg-background border border-primary/20 text-primary text-center font-mono font-bold text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 p-2.5 transition-all outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {loading ? (
                  <><RefreshCw size={16} className="animate-spin" /> Signing in...</>
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>
            </form>

            {/* Demo Accounts Section — only shown when env vars are configured */}
            {demoAccounts.length > 0 && (
            <div className="mt-8 pt-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-muted">Quick Access Roles</span>
                <span className="text-[10px] text-muted flex items-center gap-1"><HelpCircle size={10} /> Click to autofill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {demoAccounts.map((demo, idx) => {
                  const DemoIcon = demo.icon;
                  return (
                    <div 
                      key={demo.label}
                      className="bg-background border border-primary/10 rounded-2xl p-3 flex flex-col justify-between hover:border-emerald-500/20 hover:shadow-sm transition-all group relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleDemoClick(demo.email, demo.pwd)}
                        className="text-left w-full h-full focus:outline-none"
                      >
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2.5 ${demo.color} transition-colors`}>
                          <DemoIcon size={14} />
                        </div>
                        <p className="text-xs font-bold text-primary group-hover:text-emerald-500 transition-colors leading-tight mb-1">{demo.label}</p>
                      </button>
                      
                      {/* Copy Helper Overlay */}
                      <button
                        type="button"
                        onClick={() => handleCopy(demo.email, idx)}
                        className="absolute top-2.5 right-2.5 p-1 text-muted hover:text-emerald-500 transition opacity-0 group-hover:opacity-100"
                        title="Copy Email"
                      >
                        {copiedIndex === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* Link to Register */}
            <div className="text-center mt-8 pt-6 border-t border-primary/10">
              <p className="text-muted text-sm font-medium">
                New to HungryLakwatsero?{' '}
                <Link to="/register" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
                  Create account →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
