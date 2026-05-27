import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  User, Mail, KeyRound, ArrowRight, ArrowLeft, ShieldCheck,
  RefreshCw, Eye, EyeOff, Leaf, Building2, Phone, Calendar,
  MapPin, Upload, FileText, Image, CheckCircle2, Clock,
  ChevronRight, AlertCircle, Utensils, HelpCircle
} from 'lucide-react';
import Logo from '../components/Logo';

const MUNICIPALITIES = [
  'Cavite City', 'Kawit', 'Noveleta', 'Rosario', 'Tanza', 'Naic',
  'Ternate', 'Maragondon', 'Alfonso', 'Magallanes', 'Indang', 'Mendez',
  'Tagaytay City', 'Amadeo', 'Silang', 'Carmona', 'General Trias',
  'Dasmariñas City', 'Bacoor City', 'Imus City', 'GMA', 'Trece Martires City',
];

const CUISINE_TYPES = [
  'Filipino', 'Seafood', 'Bulalo/Beef Soup', 'Pork BBQ & Grill',
  'Farm-to-Table', 'Coffee Shop / Café', 'Heritage Filipino',
  'Desserts & Kakanin', 'Noodles', 'Fast Casual', 'Asian Fusion', 'International',
];

const SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V', 'Esq.'];

function StepBar({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between gap-1 mb-8 select-none">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center font-bold text-xs transition-all duration-300
              ${i < currentStep ? 'bg-emerald-500 border-emerald-500 text-white' : 
                i === currentStep ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm' : 
                'bg-secondary border-primary/20 text-muted'}`}
            >
              {i < currentStep ? <CheckCircle2 size={13} className="text-white" /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold hidden lg:inline-block
              ${i === currentStep ? 'text-primary' : 'text-muted'}`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-grow h-0.5 min-w-[12px] rounded-full transition-colors duration-300
              ${i < currentStep ? 'bg-emerald-500' : 'bg-primary/10'}`} 
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormInput({ label, icon, type = 'text', required, error, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold text-secondary uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative group">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors">{icon}</span>}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={`w-full bg-background border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-primary/20 focus:ring-emerald-500/20 focus:border-emerald-500'} text-primary text-sm rounded-xl focus:ring-2 block p-3.5 ${icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''} transition-all outline-none`}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function FileUpload({ label, accept, required, hint, onChange, value }) {
  const [fileName, setFileName] = useState('');
  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFileName(f.name); onChange && onChange(f); }
  };
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-secondary uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <label className="flex flex-col sm:flex-row items-center gap-3 cursor-pointer bg-secondary hover:bg-background border border-dashed border-primary/30 hover:border-emerald-500 rounded-2xl px-4 py-3 transition-all duration-200 group">
        <span className="w-9 h-9 rounded-xl bg-background border border-primary/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500/10 shrink-0">
          <Upload size={16} />
        </span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-primary text-xs font-bold truncate">{fileName || 'Choose file to upload'}</p>
          {hint && <p className="text-muted text-[10px] mt-0.5">{hint}</p>}
        </div>
        <input type="file" accept={accept} onChange={handleChange} className="hidden" />
      </label>
    </div>
  );
}

function Captcha({ value, onChange }) {
  const [n1, setN1] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [n2, setN2] = useState(() => Math.floor(Math.random() * 9) + 1);
  const refresh = () => {
    setN1(Math.floor(Math.random() * 9) + 1);
    setN2(Math.floor(Math.random() * 9) + 1);
    onChange({ input: '', answer: 0 });
  };
  useEffect(() => { onChange({ input: value?.input || '', answer: n1 + n2 }); }, [n1, n2]);
  return (
    <div className="bg-secondary border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-500 block">Security Check</span>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-sm font-mono select-none">
            {n1} + {n2} = ?
          </span>
          <button 
            type="button" 
            onClick={refresh} 
            className="text-muted hover:text-emerald-500 p-1 rounded transition-colors"
            title="Refresh Question"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
      <input
        type="number"
        required
        placeholder="Answer"
        value={value?.input || ''}
        onChange={e => onChange({ input: e.target.value, answer: n1 + n2 })}
        className="w-24 bg-background border border-primary/20 text-primary text-center font-mono font-bold text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 p-2.5 transition-all outline-none"
      />
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [roleId, setRoleId] = useState(null);

  const [personal, setPersonal] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '',
    email: '', password: '', confirmPassword: '', phoneNumber: '',
  });

  const [business, setBusiness] = useState({
    restaurantName: '', restaurantAddress: '', barangay: '',
    municipalityId: '', businessRegDate: '', description: '',
    cuisineType: '', operatingHours: '', contactNumber: '',
  });

  const [files, setFiles] = useState({
    profilePhoto: null, dtiDoc: null, brgyDoc: null, ownerId: null, businessPermit: null, restaurantPhotos: [],
  });

  const [captcha, setCaptcha] = useState({ input: '', answer: 0 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  const isOwner = roleId === 2;
  const TOURIST_STEPS = ['Role Selection', 'Create Account', 'Verification Code'];
  const OWNER_STEPS   = ['Role Selection', 'Creator Info', 'Business Details', 'Submit Documents'];

  const steps = isOwner ? OWNER_STEPS : TOURIST_STEPS;

  const setP = (k, v) => setPersonal(prev => ({ ...prev, [k]: v }));
  const setB = (k, v) => setBusiness(prev => ({ ...prev, [k]: v }));

  const validatePersonal = () => {
    const e = {};
    if (!personal.firstName.trim()) e.firstName = 'First name is required';
    if (!personal.lastName.trim()) e.lastName = 'Last name is required';
    if (!personal.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address';
    if (personal.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(personal.password)) e.password = 'Password needs an uppercase letter';
    if (!/[0-9]/.test(personal.password)) e.password = 'Password needs a number';
    if (personal.password !== personal.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateBusiness = () => {
    const e = {};
    if (!business.restaurantName.trim()) e.restaurantName = 'Restaurant name is required';
    if (!business.restaurantAddress.trim()) e.restaurantAddress = 'Address is required';
    if (!business.municipalityId) e.municipalityId = 'Municipality is required';
    if (!business.cuisineType) e.cuisineType = 'Cuisine type is required';
    if (!business.contactNumber.trim()) e.contactNumber = 'Contact number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 0) {
      if (!roleId) { setErrorMsg('Please select your role to continue.'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!validatePersonal()) {
        toast.warning('Please resolve personal info form validation warnings.');
        return;
      }
      if (isOwner) setStep(2);
      else handleSubmit();
    } else if (step === 2 && isOwner) {
      if (!validateBusiness()) {
        toast.warning('Please fill in required business listing details.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (Number(captcha.input) !== captcha.answer) {
      setErrorMsg('Incorrect security check. Please try again.');
      toast.error('Security verification check failed.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      Object.entries({ ...personal, roleId }).forEach(([k, v]) => formData.append(k, v));
      if (isOwner) {
        Object.entries(business).forEach(([k, v]) => formData.append(k, v));
        if (files.dtiDoc) formData.append('dtiDoc', files.dtiDoc);
        if (files.brgyDoc) formData.append('brgyDoc', files.brgyDoc);
        if (files.ownerId) formData.append('ownerIdDoc', files.ownerId);
        if (files.businessPermit) formData.append('businessPermit', files.businessPermit);
      }
      if (files.profilePhoto) formData.append('profilePhoto', files.profilePhoto);
      formData.append('captchaInput', captcha.input);
      formData.append('captchaAnswer', String(captcha.answer));

      const res = await axios.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessData(res.data);
      toast.success('Registration request submitted! 🚀');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. The server may be unavailable. Please try again later.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden transition-colors">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="max-w-md w-full bg-card rounded-3xl p-8 border border-primary/20 shadow-lg text-center relative z-10 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary">Verification Pending</h2>
          <p className="text-secondary text-sm mt-3 leading-relaxed">{successData.message}</p>

          {isOwner && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left">
              <p className="text-amber-600 text-xs font-bold flex items-center gap-2">
                <Clock size={14} /> Pending Administration Verification
              </p>
              <p className="text-muted text-xs mt-2 leading-relaxed">
                Our operations team will review your business credentials (DTI, Permit). Once verified, you will receive an approval email within 24–48 hours.
              </p>
            </div>
          )}

          {successData.verificationToken && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-left">
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-extrabold mb-1 block">Verification Token (Demo)</p>
              <div className="flex items-center justify-between">
                <code className="text-emerald-600 font-mono font-bold text-sm tracking-widest">{successData.verificationToken}</code>
              </div>
            </div>
          )}

          <button onClick={() => navigate('/login')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-6 py-3.5 rounded-2xl text-sm font-extrabold flex justify-center items-center gap-2 transition-colors">
            Proceed to Login <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-y-auto md:overflow-hidden transition-colors duration-300">
      {/* ─── LEFT PANEL: Hero Branding (Desktop Only) ─── */}
      <div className="hidden md:flex md:w-1/3 relative overflow-hidden flex-col justify-between p-10 border-r border-primary/10 bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center dark:opacity-30 transition-opacity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/90 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center transition">
            <img src="/favicon.png" alt="Logo" className="h-10 w-auto" />
            <span className="ml-3 font-display font-black text-primary text-xl">Hungry<span className="text-emerald-500">Lakwatsero</span></span>
          </Link>
        </div>

        <div className="relative z-10 space-y-5 my-auto max-w-sm">
          <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] py-1.5 px-3 rounded-full">Join The Community</span>
          <h1 className="font-display text-3xl lg:text-4xl font-black text-primary leading-tight">
            Promote & Discover Cavite Cuisine
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            Register as an Explorer to write reviews and bookmark listings, or register as a Business Partner to showcase your local restaurant menus and announcements.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted font-medium">
          <p>© 2026 HungryLakwatsero</p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Multi-step Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative z-10 bg-background">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-xl w-full space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="text-center md:text-left space-y-1.5">
            <Link to="/" className="inline-flex md:hidden items-center transition mb-3 bg-card p-2 rounded-xl shadow-sm border border-primary/10">
              <img src="/favicon.png" alt="Logo" className="h-8 w-auto" />
            </Link>
            <h2 className="font-display text-2xl font-black text-primary">Create Account</h2>
            <p className="text-muted text-xs">Fill out the steps below to join the Cavite culinary registry.</p>
          </div>

          <div className="bg-card rounded-3xl border border-primary/10 p-6 sm:p-8 shadow-sm">
            {/* Step Progress Bar */}
            {roleId && <StepBar steps={steps} currentStep={step} />}

            {errorMsg && (
              <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── STEP 0: Role Selection ── */}
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-center text-primary text-sm font-bold">Select your platform profile role:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tourist Card */}
                  <button
                    type="button"
                    onClick={() => setRoleId(1)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus:outline-none flex flex-col justify-between min-h-[160px] bg-background
                      ${roleId === 1 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-primary/10 hover:border-emerald-500/20'}`}
                  >
                    <div>
                      <span className="text-3xl block mb-3">👤</span>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Explorer</p>
                      <h4 className="font-display font-bold text-primary text-base mt-0.5">I am a Tourist</h4>
                      <p className="text-muted text-[11px] mt-2 leading-relaxed">Browse, bookmark listings, write reviews, and share culinary discoveries.</p>
                    </div>
                    {roleId === 1 && <CheckCircle2 size={16} className="text-emerald-500 self-end mt-2" />}
                  </button>

                  {/* Food Owner Card */}
                  <button
                    type="button"
                    onClick={() => setRoleId(2)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus:outline-none flex flex-col justify-between min-h-[160px] bg-background
                      ${roleId === 2 ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-primary/10 hover:border-amber-500/50'}`}
                  >
                    <div>
                      <span className="text-3xl block mb-3">🏪</span>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">Merchant Partner</p>
                      <h4 className="font-display font-bold text-primary text-base mt-0.5">I am a Food Owner</h4>
                      <p className="text-muted text-[11px] mt-2 leading-relaxed">Manage your restaurant storefront, customize menus, post promos, and track views.</p>
                    </div>
                    {roleId === 2 && <CheckCircle2 size={16} className="text-amber-500 self-end mt-2" />}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-primary text-base">Account Registration Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput label="First Name" required placeholder="Juan" value={personal.firstName}
                    onChange={e => setP('firstName', e.target.value)} error={errors.firstName} icon={<User size={15} />} />
                  <FormInput label="Middle Name" placeholder="Santos" value={personal.middleName}
                    onChange={e => setP('middleName', e.target.value)} />
                  <FormInput label="Last Name" required placeholder="Dela Cruz" value={personal.lastName}
                    onChange={e => setP('lastName', e.target.value)} error={errors.lastName} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Suffix</label>
                    <select value={personal.suffix} onChange={e => setP('suffix', e.target.value)} className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 transition-all outline-none appearance-none">
                      <option value="">None</option>
                      {SUFFIXES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <FormInput label="Phone Number" placeholder="+63 9XX XXX XXXX" value={personal.phoneNumber}
                    onChange={e => setP('phoneNumber', e.target.value)} icon={<Phone size={15} />} />
                </div>

                <FormInput label="Email Address" required type="email" placeholder="your@email.com"
                  value={personal.email} onChange={e => setP('email', e.target.value)}
                  error={errors.email} icon={<Mail size={15} />} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput label="Password" required type="password" placeholder="Min. 8 characters"
                    value={personal.password} onChange={e => setP('password', e.target.value)}
                    error={errors.password} icon={<KeyRound size={15} />} />
                  <FormInput label="Confirm Password" required type="password" placeholder="Repeat password"
                    value={personal.confirmPassword} onChange={e => setP('confirmPassword', e.target.value)}
                    error={errors.confirmPassword} icon={<ShieldCheck size={15} />} />
                </div>

                {/* Password strength checklist */}
                <div className="bg-secondary rounded-xl p-3 border border-primary/20 space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted block mb-1">Security Standards</span>
                  {[
                    ['Password exceeds 8 characters', personal.password.length >= 8],
                    ['Contains uppercase letter', /[A-Z]/.test(personal.password)],
                    ['Contains numerical character', /[0-9]/.test(personal.password)],
                  ].map(([req, met]) => (
                    <div key={req} className="flex items-center gap-2 text-xs">
                      <span className={met ? 'text-emerald-500 font-bold' : 'text-muted'}>{met ? '✓' : '○'}</span>
                      <span className={met ? 'text-emerald-600' : 'text-secondary'}>{req}</span>
                    </div>
                  ))}
                </div>

                <FileUpload
                  label="Profile Picture"
                  hint="Square photo formats preferred, max 5MB"
                  accept="image/*"
                  onChange={f => setFiles(v => ({ ...v, profilePhoto: f }))}
                />

                {!isOwner && <Captcha value={captcha} onChange={setCaptcha} />}
              </div>
            )}

            {/* ── STEP 2: Business details (Owners) ── */}
            {step === 2 && isOwner && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-primary text-base flex items-center gap-2">
                  <Utensils size={18} className="text-amber-500" /> Restaurant Profile Listings
                </h3>

                <FormInput label="Establishment Name" required placeholder="e.g. Pancit Pusit Palace"
                  value={business.restaurantName} onChange={e => setB('restaurantName', e.target.value)}
                  error={errors.restaurantName} icon={<Utensils size={15} />} />

                <FormInput label="Full Business Address" required placeholder="Block, Street, Barangay"
                  value={business.restaurantAddress} onChange={e => setB('restaurantAddress', e.target.value)}
                  error={errors.restaurantAddress} icon={<MapPin size={15} />} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput label="Barangay / District" placeholder="e.g. Tolentino East" value={business.barangay}
                    onChange={e => setB('barangay', e.target.value)} />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Municipality / City <span className="text-red-500">*</span></label>
                    <select value={business.municipalityId} onChange={e => setB('municipalityId', e.target.value)}
                      className={`w-full bg-background border ${errors.municipalityId ? 'border-red-500' : 'border-primary/20'} text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 transition-all outline-none appearance-none`}>
                      <option value="">Choose Cavite town</option>
                      {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {errors.municipalityId && <p className="text-red-500 text-xs mt-1">{errors.municipalityId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Cuisine Category <span className="text-red-500">*</span></label>
                    <select value={business.cuisineType} onChange={e => setB('cuisineType', e.target.value)}
                      className={`w-full bg-background border ${errors.cuisineType ? 'border-red-500' : 'border-primary/20'} text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 transition-all outline-none appearance-none`}>
                      <option value="">Select main specialty</option>
                      {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.cuisineType && <p className="text-red-500 text-xs mt-1">{errors.cuisineType}</p>}
                  </div>
                  <FormInput label="Launch Date" type="date" value={business.businessRegDate}
                    onChange={e => setB('businessRegDate', e.target.value)} icon={<Calendar size={15} />} />
                </div>

                <FormInput label="Store Hotline" required placeholder="+63 46 XXX XXXX"
                  value={business.contactNumber} onChange={e => setB('contactNumber', e.target.value)}
                  error={errors.contactNumber} icon={<Phone size={15} />} />

                <FormInput label="Operating Hours Summary" placeholder="e.g. Daily: 8:00 AM - 10:00 PM"
                  value={business.operatingHours} onChange={e => setB('operatingHours', e.target.value)}
                  icon={<Clock size={15} />} />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wide">Business Story / Background</label>
                  <textarea
                    rows={3}
                    placeholder="Introduce your signature flavors, heritage story, or unique recipes..."
                    value={business.description}
                    onChange={e => setB('description', e.target.value)}
                    className="w-full bg-background border border-primary/20 text-primary text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 transition-all outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3: Documents Upload (Owners) ── */}
            {step === 3 && isOwner && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-display font-bold text-primary text-base flex items-center gap-2">
                    <FileText size={18} className="text-amber-500" /> Submit Credentials
                  </h3>
                  <p className="text-muted text-[11px] mt-0.5">Documents will be reviewed by admin moderators to approve verification status.</p>
                </div>

                <FileUpload label="DTI or SEC Certificate" required hint="PDF, JPG, PNG formats up to 10MB"
                  accept=".pdf,.jpg,.jpeg,.png" onChange={f => setFiles(v => ({ ...v, dtiDoc: f }))} />

                <FileUpload label="Barangay Business Clearance" required hint="Clearance matching your Cavite address"
                  accept=".pdf,.jpg,.jpeg,.png" onChange={f => setFiles(v => ({ ...v, brgyDoc: f }))} />

                <FileUpload label="Owner Government ID" required hint="UMID, Driver's License, Passport, PhilSys ID"
                  accept=".pdf,.jpg,.jpeg,.png" onChange={f => setFiles(v => ({ ...v, ownerId: f }))} />

                <FileUpload label="BPLO Business Permit (optional)" hint="Valid Mayor's Business Permit"
                  accept=".pdf,.jpg,.jpeg,.png" onChange={f => setFiles(v => ({ ...v, businessPermit: f }))} />

                <Captcha value={captcha} onChange={setCaptcha} />
              </div>
            )}

            {/* Navigation buttons */}
            <div className={`mt-8 flex items-center ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="bg-secondary text-primary hover:bg-primary/10 py-2.5 px-5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <button
                type="button"
                onClick={step === (steps.length - 1) ? handleSubmit : nextStep}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-colors shadow-sm"
              >
                {loading ? (
                  <><RefreshCw size={14} className="animate-spin" /> Processing...</>
                ) : step === 0 ? (
                  <>{roleId ? 'Continue' : 'Choose Role'} <ChevronRight size={14} /></>
                ) : step < steps.length - 1 ? (
                  <>Next Step <ChevronRight size={14} /></>
                ) : (
                  <>Finish Registration <CheckCircle2 size={14} /></>
                )}
              </button>
            </div>

            {/* Switch to login link */}
            <div className="text-center mt-6 pt-5 border-t border-primary/10">
              <p className="text-muted text-xs">
                Already registered?{' '}
                <Link to="/login" className="text-emerald-500 font-extrabold hover:text-emerald-400 transition-colors">
                  Sign In →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
