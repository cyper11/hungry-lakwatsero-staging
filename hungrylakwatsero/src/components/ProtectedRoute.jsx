import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, RefreshCw } from 'lucide-react';

function getUserRole(user) {
  if (!user) return null;
  if (user.roleId === 3 || user.role === 'Admin') return 'Admin';
  if (user.roleId === 2 || user.role === 'Food Business Owner') return 'Food Business Owner';
  return 'Tourist';
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
          <Leaf size={28} className="text-emerald-400 animate-leaf-sway" />
        </div>
        <RefreshCw size={20} className="text-emerald-400 animate-spin" />
        <p className="text-muted text-sm font-semibold">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = getUserRole(user);
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" state={{ unauthorized: true, from: location.pathname }} replace />;
    }
  }

  return children;
}
