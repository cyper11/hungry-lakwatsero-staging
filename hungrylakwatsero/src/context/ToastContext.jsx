import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let _id = 0;
const uid = () => ++_id;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  }, []);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = uid();
    setToasts(prev => [...prev.slice(-3), { id, message, type, leaving: false }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info: (msg, dur) => show(msg, 'info', dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = {
  success: <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />,
  error:   <XCircle     size={17} className="text-rose-400 shrink-0" />,
  warning: <AlertTriangle size={17} className="text-amber-400 shrink-0" />,
  info:    <Info         size={17} className="text-sky-400 shrink-0" />,
};

const COLORS = {
  success: 'border-emerald-500/20 bg-emerald-500/10',
  error:   'border-rose-500/40 bg-rose-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
  info:    'border-sky-500/40 bg-sky-500/10',
};

function ToastItem({ toast: t, onDismiss }) {
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl
        text-primary text-sm font-semibold max-w-sm min-w-[260px]
        transition-all duration-300 ease-out
        ${COLORS[t.type]}
        ${t.leaving ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}
    >
      {ICONS[t.type]}
      <span className="flex-1 leading-snug">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-muted hover:text-primary transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
