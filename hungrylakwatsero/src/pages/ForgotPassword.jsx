import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { 
  Mail, KeyRound, Eye, EyeOff, Leaf, ArrowLeft, RefreshCw, 
  AlertCircle, CheckCircle2, ShieldCheck, Key
} from 'lucide-react';
import Logo from '../components/Logo';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenFromApi, setTokenFromApi] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(res.data.message);
      if (res.data.resetToken) setTokenFromApi(res.data.resetToken);
      setStep('reset');
      toast.success('Reset code sent successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Request failed. Check your email and try again.';
      if (err.code === 'ERR_NETWORK' || !err.response) {
        // Offline demo
        setTokenFromApi('DEMO_RESET_' + Math.random().toString(36).substring(2, 8).toUpperCase());
        setSuccess('Demo mode: Reset token generated. Enter it in the token field below.');
        setStep('reset');
        toast.info('Simulated reset request (offline mode).');
      } else {
        setError(msg);
        toast.error('Failed to request reset.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      toast.warning('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      toast.warning('Password too short.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token: resetToken || tokenFromApi, newPassword });
      setSuccess('Password reset successfully! You can now log in.');
      toast.success('Password changed! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Token may be expired.');
      toast.error('Password reset failed.');
      if (err.code === 'ERR_NETWORK') {
        setSuccess('Demo: Password reset simulated. Redirecting to login...');
        toast.success('Demo: Password reset simulated!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden transition-colors duration-300">
      {/* ─── LEFT PANEL: Hero Branding (Desktop Only) ─── */}
      <div className="hidden md:flex md:w-1/3 relative overflow-hidden flex-col justify-between p-10 border-r border-primary/10 bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center dark:opacity-30 transition-opacity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/90 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center transition">
            <Logo variant="monochrome-dark" height={36} />
          </Link>
        </div>

        <div className="relative z-10 space-y-5 my-auto max-w-sm">
          <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] py-1.5 px-3 rounded-full">Security Verification</span>
          <h1 className="font-display text-3xl lg:text-4xl font-black text-primary leading-tight">
            Recover Your Account Password
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            Enter your email address to request a single-use verification token, then create a secure, new password to access your platform account.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted font-medium">
          <p>© 2026 HungryLakwatsero</p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Recovery Card ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative z-10 bg-background">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-[420px] w-full space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="text-center md:text-left space-y-1.5">
            <Link to="/login" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition text-xs mb-3 font-semibold">
              <ArrowLeft size={14} /> Back to Login
            </Link>
            <h2 className="font-display text-2xl font-black text-primary">
              {step === 'email' ? 'Reset Password' : 'Enter Verification Token'}
            </h2>
            <p className="text-muted text-xs">
              {step === 'email'
                ? 'Request a security reset link to recover your credentials.'
                : 'Copy the token sent to your email to define a new password.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl border border-primary/10 p-6 sm:p-8 shadow-sm transition-all">
            {error && (
              <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Email Address</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email" 
                      required 
                      placeholder="your@email.com"
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 pl-12 transition-all outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3.5 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                >
                  {loading ? (
                    <><RefreshCw size={15} className="animate-spin" /> Sending link...</>
                  ) : (
                    <>Send Recovery Link <ArrowLeft className="rotate-180" size={14} /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {/* Reset token input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Verification Token</label>
                  <div className="relative group">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text" 
                      required 
                      placeholder="e.g. DEMO_RESET_ABC123"
                      value={resetToken || tokenFromApi}
                      onChange={e => setResetToken(e.target.value)}
                      className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 pl-12 font-mono tracking-widest transition-all outline-none"
                    />
                  </div>

                  {tokenFromApi && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mt-2 text-left">
                      <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-extrabold mb-1">Generated Token (Demo)</p>
                      <code className="text-emerald-500 font-mono font-bold text-sm tracking-wider">{tokenFromApi}</code>
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wide">New Password</label>
                  <div className="relative group">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showPwd ? 'text' : 'password'} 
                      required 
                      placeholder="At least 8 characters"
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 pl-12 pr-12 transition-all outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPwd(s => !s)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-emerald-500 transition-colors"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Confirm New Password</label>
                  <div className="relative group">
                    <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="password" 
                      required 
                      placeholder="Confirm new password"
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 pl-12 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3.5 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                  >
                    {loading ? (
                      <><RefreshCw size={15} className="animate-spin" /> Saving password...</>
                    ) : (
                      <>Update Password <CheckCircle2 size={14} /></>
                    )}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setStep('email'); setError(''); setSuccess(''); }}
                    className="w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 bg-secondary text-primary hover:bg-primary/10 transition-colors"
                  >
                    <ArrowLeft size={14} /> Request New Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
