import React from 'react';
import { Compass, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="hero-orb-green w-96 h-96 top-1/4 left-1/4 opacity-20 animate-orb" />
            <div className="hero-orb-gold w-72 h-72 bottom-1/4 right-1/4 opacity-15 animate-orb" style={{ animationDelay: '3s' }} />
          </div>
          <div className="max-w-md w-full text-center relative z-10">
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-pulse" />
              <div className="absolute inset-3 rounded-full bg-rose-500/5 border border-rose-500/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Compass size={52} className="text-rose-500/60" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-3">System Error</p>
            <h1 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
              Oops! Something<br />
              <span className="text-rose-400 italic">went wrong</span>
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              We encountered an unexpected error while rendering this page.
              Don't worry, you can easily recover from this.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-cinematic inline-flex items-center gap-2 mb-4"
              style={{ backgroundColor: 'rgba(225, 29, 72, 0.2)', borderColor: 'rgba(225, 29, 72, 0.4)', color: '#f43f5e' }}
            >
              <RefreshCw size={16} /> Reload Application
            </button>
            <div className="mt-2">
              <a href="/" className="text-gray-600 hover:text-emerald-400 text-sm font-semibold transition-colors">
                Or return to home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
