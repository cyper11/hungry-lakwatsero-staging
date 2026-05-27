import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  Shield, Users, Building2, Star, AlertTriangle, CheckCircle2,
  XCircle, Eye, Ban, RefreshCw, Search, Filter, Plus, Edit3,
  Trash2, FileText, BarChart3, TrendingUp, Bell, Leaf, LogOut,
  Settings, Download, ChevronRight, ChevronLeft, MessageCircle,
  BookOpen, MapPin, Activity, Save,
} from 'lucide-react';
import Logo from '../components/Logo';

// Mocks removed

const MUNICIPALITIES = ['All', 'Bacoor', 'Cavite City', 'Dasmariñas', 'Imus', 'Kawit', 'Naic', 'Noveleta', 'Rosario', 'Tagaytay', 'Trece Martires'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const RoleBadge = ({ role }) => {
  const map = { admin: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20', owner: 'bg-gold-500/20 text-gold-300 border border-gold-500/30', tourist: 'bg-sage-500/20 text-muted border border-sage-500/30' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[role] || map.tourist}`}>{role}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    active: 'bg-emerald-500/20 text-emerald-300',
    suspended: 'bg-gold-500/20 text-gold-300',
    banned: 'bg-rose-500/20 text-rose-300',
    pending: 'bg-gold-500/20 text-gold-300',
    resolved: 'bg-emerald-500/20 text-emerald-300',
    dismissed: 'bg-sage-500/20 text-muted',
    published: 'bg-emerald-500/20 text-emerald-300',
    draft: 'bg-sage-500/20 text-muted',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-sage-500/20 text-muted'}`}>{status}</span>;
};

const ActionBadge = ({ action }) => {
  const actionStr = action || '';
  const color = actionStr.includes('BAN') || actionStr.includes('DELETE') ? 'text-rose-400' : actionStr.includes('APPROVE') || actionStr.includes('PUBLISH') || actionStr.includes('FEATURE') ? 'text-emerald-400' : 'text-gold-400';
  return <span className={`text-xs font-mono font-semibold ${color}`}>{actionStr}</span>;
};

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ConfirmModal = ({ action, onConfirm, onCancel }) => {
  if (!action) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6 md:p-8 max-w-md w-full border border-rose-500/30 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <h3 className="text-lg font-bold text-primary font-playfair">Confirm Action</h3>
        </div>
        <p className="text-muted mb-6 leading-relaxed">{action.description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">{action.label || 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'approvals', label: 'Restaurant Approvals', icon: CheckCircle2 },
  { id: 'moderation', label: 'Restaurant Moderation', icon: Building2 },
  { id: 'reviews', label: 'Reviews Moderation', icon: Star },
  { id: 'municipalities', label: 'Municipality Management', icon: MapPin },
  { id: 'content', label: 'Content Moderation', icon: MessageCircle },
  { id: 'stories', label: 'Food Stories CMS', icon: BookOpen },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'auditlogs', label: 'Audit Logs', icon: FileText },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, pendingApprovals, reportsToResolve, sidebarOpen, setSidebarOpen, onLogout }) => (
  <>
    {/* Mobile overlay */}
    {sidebarOpen && (
      <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
    )}
    <aside className={`fixed top-0 left-0 h-[100dvh] z-40 w-64 flex flex-col bg-card backdrop-blur-md shadow-sm border border-primary/10 border-r border-primary/10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto lg:h-auto lg:dashboard-sidebar`}>
      {/* Brand */}
      <div className="p-5 border-b border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <Logo variant="horizontal" height={24} />
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Shield className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'approvals' ? pendingApprovals : id === 'content' ? reportsToResolve : 0;
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'text-muted hover:bg-secondary hover:text-primary'}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-muted'}`} />
              <span className="flex-1 truncate">{label}</span>
              {badge > 0 && (
                <span className={`ml-auto px-1.5 py-0.5 rounded-full text-xs font-bold ${id === 'content' ? 'bg-rose-500/30 text-rose-300' : 'bg-gold-500/30 text-gold-300'}`}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary/10">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-all">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  </>
);

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
const DashboardTab = ({ stats, auditLogs, setActiveTab }) => {
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'emerald', sub: '+48 this month' },
    { label: 'Restaurants', value: stats.totalRestaurants.toLocaleString(), icon: Building2, color: 'sage', sub: '+12 this month' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: AlertTriangle, color: 'gold', sub: 'Needs review', highlight: true },
    { label: 'Total Reviews', value: stats.totalReviews.toLocaleString(), icon: Star, color: 'emerald', sub: '+124 this week' },
    { label: 'Content Reports', value: stats.reportsToResolve, icon: AlertTriangle, color: 'rose', sub: 'Unresolved', highlight: stats.reportsToResolve > 0 },
    { label: 'Food Stories', value: stats.totalStories, icon: BookOpen, color: 'gold', sub: '3 drafts' },
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400', val: 'text-emerald-300' },
    sage: { bg: 'bg-sage-500/10 border-sage-500/20', icon: 'text-muted', val: 'text-muted' },
    gold: { bg: 'bg-gold-500/10 border-gold-500/20', icon: 'text-gold-400', val: 'text-gold-300' },
    rose: { bg: 'bg-rose-500/10 border-rose-500/20', icon: 'text-rose-400', val: 'text-rose-300' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary">Admin Dashboard 🛡️</h1>
          <p className="text-muted text-sm mt-1">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Alert Banners */}
      {stats.pendingApprovals > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-gold-500/10 border border-gold-500/30">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <span className="text-gold-200 font-medium text-sm">{stats.pendingApprovals} restaurants are pending approval and need your review.</span>
          </div>
          <button onClick={() => setActiveTab('approvals')} className="flex items-center gap-1 text-gold-300 hover:text-gold-100 text-sm font-semibold whitespace-nowrap transition-colors">
            Review Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {stats.reportsToResolve > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span className="text-rose-200 font-medium text-sm">{stats.reportsToResolve} content reports require your attention.</span>
          </div>
          <button onClick={() => setActiveTab('content')} className="flex items-center gap-1 text-rose-300 hover:text-rose-100 text-sm font-semibold whitespace-nowrap transition-colors">
            Moderate Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => {
          const c = colorMap[color] || colorMap.emerald;
          return (
            <div key={label} className={`bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-4 md:p-5 border ${c.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-5 h-5 ${c.icon}`} />
              </div>
              <div className={`text-2xl md:text-3xl font-bold font-playfair ${c.val}`}>{value}</div>
              <div className="text-primary text-sm font-medium mt-0.5">{label}</div>
              <div className="text-muted text-xs mt-1">{sub}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="font-playfair font-bold text-primary text-lg">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-primary/10 last:border-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <ActionBadge action={log.action} />
                  <p className="text-muted text-xs mt-0.5 truncate">{log.entityType} · {log.entityId}</p>
                </div>
                <span className="text-muted text-xs whitespace-nowrap flex-shrink-0">{(log.timestamp || '').split(' ')[1] || log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-gold-400" />
            <h2 className="font-playfair font-bold text-primary text-lg">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Approve Restaurants', tab: 'approvals', icon: CheckCircle2, color: 'emerald' },
              { label: 'Manage Users', tab: 'users', icon: Users, color: 'sage' },
              { label: 'Moderate Content', tab: 'content', icon: MessageCircle, color: 'rose' },
              { label: 'Manage Stories', tab: 'stories', icon: BookOpen, color: 'gold' },
            ].map(({ label, tab, icon: Icon, color }) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] ${color === 'rose' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20' : color === 'gold' ? 'bg-gold-500/10 border border-gold-500/20 text-gold-300 hover:bg-gold-500/20' : color === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20' : 'bg-sage-500/10 border border-sage-500/20 text-muted hover:bg-sage-500/20'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── User Management Tab ──────────────────────────────────────────────────────
const UsersTab = ({ users, setUsers, setConfirmAction }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = users.filter((u) => {
    const nameStr = u.name || '';
    const emailStr = u.email || '';
    const searchStr = search || '';
    const matchSearch = nameStr.toLowerCase().includes(searchStr.toLowerCase()) || emailStr.toLowerCase().includes(searchStr.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toast = useToast();

  const handleAction = (userId, action) => {
    const labels = { suspend: 'Suspend User', activate: 'Activate User', ban: 'Ban User' };
    const descs = {
      suspend: 'This will temporarily suspend the user, preventing them from logging in.',
      activate: 'This will reactivate the user\'s account.',
      ban: 'This will permanently ban the user from the platform. This action is severe.',
    };
    setConfirmAction({
      description: descs[action],
      label: labels[action],
      onConfirm: async () => {
        const isActive = action === 'activate';
        try {
          await axios.put(`/api/admin/users/${userId}/status`, { isActive });
          setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: isActive ? 'active' : action === 'suspend' ? 'suspended' : 'banned' } : u));
          toast.success(`User status updated successfully!`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update user status.');
        }
      },
    });
  };

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-playfair font-bold text-primary">User Management</h2>
        <div className="flex gap-2 text-xs flex-wrap">
          {['all', 'tourist', 'owner', 'admin'].map((r) => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }} className={`px-3 py-1.5 rounded-full font-semibold capitalize transition-colors ${roleFilter === r ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/20' : 'bg-secondary text-muted hover:text-primary'}`}>
              {r === 'all' ? 'All' : r} {r !== 'all' && roleCounts[r] ? `(${roleCounts[r]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="input-green w-full pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-green text-sm px-4 py-2.5 pr-8 min-w-[140px]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-primary/10">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/50">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-300 text-xs font-bold flex-shrink-0">{u.avatar}</div>
                      <div>
                        <div className="text-primary text-sm font-medium">{u.name}</div>
                        <div className="text-muted text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(u.joined)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {u.status === 'active' && u.role !== 'admin' && (
                        <button onClick={() => handleAction(u.id, 'suspend')} className="p-1.5 rounded-lg text-muted hover:text-gold-300 hover:bg-gold-500/10 transition-colors" title="Suspend"><Ban className="w-3.5 h-3.5" /></button>
                      )}
                      {u.status === 'suspended' && (
                        <button onClick={() => handleAction(u.id, 'activate')} className="p-1.5 rounded-lg text-muted hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors" title="Activate"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                      )}
                      {u.status !== 'banned' && u.role !== 'admin' && (
                        <button onClick={() => handleAction(u.id, 'ban')} className="p-1.5 rounded-lg text-muted hover:text-rose-300 hover:bg-rose-500/10 transition-colors" title="Ban"><XCircle className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted text-sm">No users match your filters.</td></tr>
              )}
            </tbody>
          </table>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10">
            <span className="text-muted text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-muted hover:text-primary disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-muted hover:text-primary disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Restaurant Approvals Tab ─────────────────────────────────────────────────
const ApprovalsTab = ({ restaurants, setRestaurants, setConfirmAction }) => {
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const toast = useToast();

  const handleApprove = (id) => {
    setConfirmAction({
      description: 'This will approve the restaurant listing and make it visible to the public.',
      label: 'Approve Restaurant',
      onConfirm: async () => {
        try {
          await axios.put(`/api/admin/verification-requests/${id}`, { status: 'approved', remarks: 'Approved by Administrator' });
          setRestaurants((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
          toast.success('Restaurant listing approved and verified!');
        } catch (err) {
          toast.error('Failed to approve restaurant listing.');
        }
      },
    });
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/admin/verification-requests/${id}`, { status: 'rejected', remarks: rejectReason });
      setRestaurants((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected', remarks: rejectReason } : r));
      setRejectId(null);
      setRejectReason('');
      toast.success('Restaurant listing verification rejected.');
    } catch (err) {
      toast.error('Failed to reject verification request.');
    }
  };

  const pending = restaurants.filter((r) => r.status === 'pending');
  const processed = restaurants.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-bold text-primary">Restaurant Approvals</h2>
        {pending.length > 0 && <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold">{pending.length} Pending</span>}
      </div>

      {pending.length === 0 && (
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-8 border border-emerald-500/20 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-300 font-semibold">All caught up!</p>
          <p className="text-muted text-sm mt-1">No restaurants pending approval.</p>
        </div>
      )}

      <div className="space-y-4">
        {pending.map((r) => (
          <div key={r.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-gold-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-primary font-bold text-lg font-playfair">{r.name}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-muted text-sm mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{r.municipality} · {r.cuisine}</p>
              </div>
              <span className="text-muted text-xs">Submitted: {formatDate(r.submitted)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-secondary">
              <div>
                <p className="text-muted text-xs mb-0.5">Owner</p>
                <p className="text-primary text-sm font-medium">{r.owner}</p>
                <p className="text-muted text-xs">{r.ownerEmail}</p>
              </div>
              <div>
                <p className="text-muted text-xs mb-1">Documents</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(r.docs).map(([key, val]) => (
                    <button key={key} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      <FileText className="w-3 h-3" /> {key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {rejectId === r.id ? (
              <div className="space-y-3">
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Provide a rejection reason for the owner..." className="input-green w-full text-sm px-4 py-3 min-h-[80px] resize-y" />
                <div className="flex gap-2">
                  <button onClick={() => handleReject(r.id)} disabled={!rejectReason.trim()} className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">Send Rejection</button>
                  <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleApprove(r.id)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => setRejectId(r.id)} className="flex items-center gap-2 bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {processed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Processed</h3>
          <div className="space-y-2">
            {processed.map((r) => (
              <div key={r.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-xl p-3 border border-primary/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-primary text-sm font-medium">{r.name}</span>
                  <span className="text-muted text-xs ml-2">· {r.municipality}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Restaurant Moderation Tab ────────────────────────────────────────────────
const RestaurantModerationTab = ({ restaurants, setRestaurants, setConfirmAction }) => {
  const [search, setSearch] = useState('');
  const [municipality, setMunicipality] = useState('All');

  const filtered = restaurants.filter((r) => {
    const nameStr = r.name || '';
    const searchStr = search || '';
    const matchSearch = nameStr.toLowerCase().includes(searchStr.toLowerCase());
    const matchMun = municipality === 'All' || r.municipality === municipality;
    return matchSearch && matchMun;
  });

  const toast = useToast();

  const handleFeature = async (id) => {
    const target = restaurants.find(r => r.id === id);
    if (!target) return;
    const nextFeatured = !target.featured;
    try {
      await axios.put(`/api/admin/restaurants/${target.restaurantId}/feature`, { isFeatured: nextFeatured });
      setRestaurants((prev) => prev.map((r) => r.id === id ? { ...r, featured: nextFeatured } : r));
      toast.success(nextFeatured ? 'Restaurant featured successfully!' : 'Restaurant unfeatured.');
    } catch (err) {
      toast.error('Failed to update featured status.');
    }
  };

  const handleRemove = (id, name) => {
    const target = restaurants.find(r => r.id === id);
    if (!target) return;
    setConfirmAction({
      description: `This will permanently remove "${name}" from the platform. This cannot be undone.`,
      label: 'Remove Restaurant',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/restaurants/${target.restaurantId}`);
          setRestaurants((prev) => prev.filter((r) => r.id !== id));
          toast.success('Restaurant listing removed successfully.');
        } catch (err) {
          toast.error('Failed to remove restaurant listing.');
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-playfair font-bold text-primary">Restaurant Moderation</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants..." className="input-green w-full pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <select value={municipality} onChange={(e) => setMunicipality(e.target.value)} className="input-green text-sm px-4 py-2.5 pr-8 min-w-[160px]">
          {MUNICIPALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-primary/10">
                {['Restaurant', 'Municipality', 'Rating', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-primary text-sm font-medium">{r.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">{r.municipality}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gold-400 text-sm font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {r.rating}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleFeature(r.id)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${r.featured ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30 hover:bg-gold-500/10' : 'bg-secondary text-muted hover:bg-gold-500/10 hover:text-gold-300'}`}>
                      {r.featured ? '⭐ Featured' : 'Not Featured'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/restaurants/${r.id}`} className="p-1.5 rounded-lg text-muted hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                      <Link to={`/restaurants/${r.id}/edit`} className="p-1.5 rounded-lg text-muted hover:text-gold-300 hover:bg-gold-500/10 transition-colors"><Edit3 className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => handleRemove(r.id, r.name)} className="p-1.5 rounded-lg text-muted hover:text-rose-300 hover:bg-rose-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted text-sm">No restaurants found.</td></tr>
              )}
            </tbody>
          </table>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

// ─── Content Moderation Tab ───────────────────────────────────────────────────
const ContentModerationTab = ({ reports, setReports, setConfirmAction }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = reports.filter((r) => statusFilter === 'all' || r.status === statusFilter);
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  const toast = useToast();

  const handleDismiss = async (id) => {
    try {
      await axios.put(`/api/admin/reports/${id}/resolve`, { action: 'dismiss', resolutionNotes: 'Dismissed by Admin' });
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'dismissed' } : r));
      toast.success('Report dismissed.');
    } catch (err) {
      toast.error('Failed to dismiss report.');
    }
  };

  const handleDelete = (id, type) => {
    setConfirmAction({
      description: `This will permanently delete the reported ${type} content. This cannot be undone.`,
      label: `Delete ${type}`,
      onConfirm: async () => {
        try {
          await axios.put(`/api/admin/reports/${id}/resolve`, { action: 'delete', resolutionNotes: 'Content deleted by admin.' });
          setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'resolved' } : r));
          toast.success('Content deleted and report resolved.');
        } catch (err) {
          toast.error('Failed to delete content.');
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-playfair font-bold text-primary">Content Moderation</h2>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">{pendingCount} Pending</span>}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'resolved', 'dismissed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${statusFilter === s ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/20' : 'bg-secondary text-muted hover:text-primary'}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((report) => (
          <div key={report.id} className={`bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border space-y-4 ${report.status === 'pending' ? 'border-rose-500/30' : 'border-primary/10'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${report.entityType === 'Review' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gold-500/20 text-gold-300'}`}>{report.entityType}</span>
                <div>
                  <p className="text-primary font-medium text-sm">{report.reason}</p>
                  <p className="text-muted text-xs mt-0.5">Reported by <span className="text-muted">{report.reporter}</span> · {report.entityId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-muted text-xs">{formatDate(report.date)}</span>
                <StatusBadge status={report.status} />
              </div>
            </div>

            {report.status === 'pending' && (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleDismiss(report.id)} className="btn-secondary text-xs px-3 py-2">Dismiss</button>
                <button onClick={() => handleDelete(report.id, report.entityType)} className="flex items-center gap-1.5 bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 font-semibold px-3 py-2 rounded-xl text-xs transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete Content
                </button>
                <button className="flex items-center gap-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-300 hover:bg-gold-500/20 font-semibold px-3 py-2 rounded-xl text-xs transition-colors">
                  <AlertTriangle className="w-3 h-3" /> Warn User
                </button>
                <button className="flex items-center gap-1.5 bg-rose-900/30 border border-rose-500/20 text-rose-400 hover:bg-rose-900/50 font-semibold px-3 py-2 rounded-xl text-xs transition-colors">
                  <Ban className="w-3 h-3" /> Ban User
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-8 border border-primary/10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-300 font-semibold">No reports found</p>
            <p className="text-muted text-sm mt-1">No content reports match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Food Stories CMS Tab ─────────────────────────────────────────────────────
const StoriesCMSTab = ({ stories, setStories, setConfirmAction }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', municipality: 'Cavite City', content: '', traditional_dishes: '', image_url: '' });

  const handlePublish = (id) => {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === 'published' ? 'draft' : 'published' } : s));
  };

  const handleDelete = (id, title) => {
    setConfirmAction({
      description: `This will permanently delete the story "${title}". This cannot be undone.`,
      label: 'Delete Story',
      onConfirm: () => setStories((prev) => prev.filter((s) => s.id !== id)),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setStories((prev) => prev.map((s) => s.id === editId ? { ...s, ...form } : s));
      setEditId(null);
    } else {
      setStories((prev) => [...prev, { id: Date.now(), ...form, author: 'Admin', status: 'draft', date: new Date().toISOString().split('T')[0] }]);
    }
    setForm({ title: '', municipality: 'Cavite City', content: '', traditional_dishes: '', image_url: '' });
    setShowForm(false);
  };

  const startEdit = (s) => {
    setForm({ title: s.title, municipality: s.municipality, content: s.content || '', traditional_dishes: s.traditional_dishes || '', image_url: s.image_url || '' });
    setEditId(s.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-bold text-primary">Food Stories CMS</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', municipality: 'Cavite City', content: '', traditional_dishes: '', image_url: '' }); }} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Create Story
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-emerald-500/20 space-y-4">
          <h3 className="font-playfair font-bold text-primary">{editId ? 'Edit Story' : 'New Food Story'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-muted text-xs mb-1 block">Title *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Story title..." className="input-green w-full text-sm px-4 py-2.5" />
              </div>
              <div>
                <label className="text-muted text-xs mb-1 block">Municipality</label>
                <select value={form.municipality} onChange={(e) => setForm((f) => ({ ...f, municipality: e.target.value }))} className="input-green w-full text-sm px-4 py-2.5">
                  {MUNICIPALITIES.filter((m) => m !== 'All').map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-muted text-xs mb-1 block">Content *</label>
              <textarea required value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Write the story content..." className="input-green w-full text-sm px-4 py-3 min-h-[120px] resize-y" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-muted text-xs mb-1 block">Traditional Dishes (comma-separated)</label>
                <input value={form.traditional_dishes} onChange={(e) => setForm((f) => ({ ...f, traditional_dishes: e.target.value }))} placeholder="Pancit Pusit, Lechon..." className="input-green w-full text-sm px-4 py-2.5" />
              </div>
              <div>
                <label className="text-muted text-xs mb-1 block">Cover Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="input-green w-full text-sm px-4 py-2.5" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm px-4 py-2">{editId ? 'Save Changes' : 'Create Draft'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stories List */}
      <div className="space-y-3">
        {stories.map((s) => (
          <div key={s.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-4 border border-primary/10 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-primary font-semibold text-sm truncate">{s.title}</h3>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-muted text-xs mt-0.5">{s.municipality} · by {s.author} · {formatDate(s.date)}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button className="p-1.5 rounded-lg text-muted hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
              <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg text-muted hover:text-gold-300 hover:bg-gold-500/10 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handlePublish(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${s.status === 'published' ? 'bg-sage-500/10 text-muted hover:bg-sage-500/20' : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'}`}>
                {s.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => handleDelete(s.id, s.title)} className="p-1.5 rounded-lg text-muted hover:text-rose-300 hover:bg-rose-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Analytics Tab ────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const topMunicipalities = [
    { name: 'Bacoor', count: 58, pct: 100 },
    { name: 'Dasmariñas', count: 45, pct: 77 },
    { name: 'Imus', count: 42, pct: 72 },
    { name: 'Tagaytay', count: 38, pct: 65 },
    { name: 'Cavite City', count: 31, pct: 53 },
    { name: 'Kawit', count: 24, pct: 41 },
  ];

  const topRated = [
    { name: 'Casa Caviteña', municipality: 'Cavite City', rating: 4.9, reviews: 214 },
    { name: 'Pancit Pusit Palace', municipality: 'Bacoor', rating: 4.8, reviews: 187 },
    { name: 'Bulalo House', municipality: 'Tagaytay', rating: 4.7, reviews: 156 },
    { name: 'Tinola Dalampasigan', municipality: 'Imus', rating: 4.6, reviews: 143 },
  ];

  const dailySignups = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 9 },
    { day: 'Thu', count: 24 },
    { day: 'Fri', count: 31 },
    { day: 'Sat', count: 28 },
    { day: 'Sun', count: 15 },
  ];

  const maxSignup = Math.max(...dailySignups.map((d) => d.count));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-playfair font-bold text-primary">Analytics</h2>

      {/* Growth Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Users (Month)', value: '+48', color: 'emerald', icon: Users },
          { label: 'New Restaurants', value: '+12', color: 'sage', icon: Building2 },
          { label: 'Reviews Written', value: '+124', color: 'gold', icon: Star },
          { label: 'Story Views', value: '2.4k', color: 'emerald', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-xl p-4 border ${color === 'emerald' ? 'border-emerald-500/20' : color === 'gold' ? 'border-gold-500/20' : 'border-sage-500/20'}`}>
            <Icon className={`w-4 h-4 mb-2 ${color === 'emerald' ? 'text-emerald-400' : color === 'gold' ? 'text-gold-400' : 'text-muted'}`} />
            <div className={`text-2xl font-bold font-playfair ${color === 'emerald' ? 'text-emerald-300' : color === 'gold' ? 'text-gold-300' : 'text-muted'}`}>{value}</div>
            <div className="text-muted text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Municipality Bar Chart + Top Rated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
          <h3 className="font-playfair font-bold text-primary mb-4">Top Municipalities by Restaurants</h3>
          <div className="space-y-3">
            {topMunicipalities.map(({ name, count, pct }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted font-medium">{name}</span>
                  <span className="text-emerald-300 font-bold">{count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
          <h3 className="font-playfair font-bold text-primary mb-4">Top Rated Restaurants</h3>
          <div className="space-y-3">
            {topRated.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-gold-500/30 text-gold-300' : 'bg-secondary text-muted'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm font-medium truncate">{r.name}</p>
                  <p className="text-muted text-xs">{r.municipality} · {r.reviews} reviews</p>
                </div>
                <div className="flex items-center gap-1 text-gold-400 text-sm font-bold flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" /> {r.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Signups Chart */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10">
        <h3 className="font-playfair font-bold text-primary mb-4">New Signups — This Week</h3>
        <div className="flex items-end justify-between gap-2 h-28">
          {dailySignups.map(({ day, count }) => (
            <div key={day} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-emerald-300 text-xs font-bold">{count}</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500" style={{ height: `${(count / maxSignup) * 80}px` }} />
              <span className="text-muted text-xs">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Audit Logs Tab ───────────────────────────────────────────────────────────
const AuditLogsTab = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const actionTypes = ['all', ...Array.from(new Set(logs.map((l) => l.action)))];

  const filtered = logs.filter((l) => {
    const userStr = l.user || '';
    const actionStr = l.action || '';
    const searchStr = search || '';
    const matchSearch = userStr.toLowerCase().includes(searchStr.toLowerCase()) || actionStr.toLowerCase().includes(searchStr.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-playfair font-bold text-primary">Audit Logs</h2>
        <button onClick={() => alert('Export functionality would generate a CSV file.')} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by user or action..." className="input-green w-full pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="input-green text-sm px-4 py-2.5 pr-8 min-w-[180px]">
          {actionTypes.map((a) => <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>)}
        </select>
      </div>

      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-primary/10">
                {['User', 'Action', 'Entity', 'Entity ID', 'IP', 'Timestamp'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/50">
              {paginated.map((log) => (
                <tr key={log.id} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-3 text-muted text-xs">{log.user}</td>
                  <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                  <td className="px-4 py-3 text-muted text-xs">{log.entityType}</td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">{log.entityId}</td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">{log.ip}</td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted text-sm">No logs match your filters.</td></tr>
              )}
            </tbody>
          </table>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10">
            <span className="text-muted text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-muted hover:text-primary disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-muted hover:text-primary disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── System Settings Tab ──────────────────────────────────────────────────────
const SystemSettingsTab = () => {
  const [settings, setSettings] = useState({
    siteName: 'HungryLakwatsero',
    contactEmail: 'admin@hungrylakwatsero.ph',
    maintenanceMode: false,
    featuredMunicipality: 'Cavite City',
    maxReviewLength: 1000,
    allowGuestReviews: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-playfair font-bold text-primary">System Settings</h2>

      {saved && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Site Config */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10 space-y-4">
        <h3 className="font-playfair font-bold text-primary text-lg flex items-center gap-2"><Settings className="w-4 h-4 text-emerald-400" /> Site Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-muted text-xs mb-1 block">Site Name</label>
            <input value={settings.siteName} onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))} className="input-green w-full text-sm px-4 py-2.5" />
          </div>
          <div>
            <label className="text-muted text-xs mb-1 block">Contact Email</label>
            <input type="email" value={settings.contactEmail} onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))} className="input-green w-full text-sm px-4 py-2.5" />
          </div>
          <div>
            <label className="text-muted text-xs mb-1 block">Max Review Length (chars)</label>
            <input type="number" value={settings.maxReviewLength} onChange={(e) => setSettings((s) => ({ ...s, maxReviewLength: +e.target.value }))} className="input-green w-full text-sm px-4 py-2.5" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <div>
            <p className="text-primary font-semibold text-sm">Maintenance Mode</p>
            <p className="text-muted text-xs mt-0.5">Temporarily disables public access to the platform.</p>
          </div>
          <button onClick={() => setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-secondary'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-primary/10">
          <div>
            <p className="text-primary font-semibold text-sm">Allow Guest Reviews</p>
            <p className="text-muted text-xs mt-0.5">Let non-registered users submit reviews.</p>
          </div>
          <button onClick={() => setSettings((s) => ({ ...s, allowGuestReviews: !s.allowGuestReviews }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.allowGuestReviews ? 'bg-emerald-500' : 'bg-secondary'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.allowGuestReviews ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Homepage Content */}
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10 space-y-4">
        <h3 className="font-playfair font-bold text-primary text-lg flex items-center gap-2"><MapPin className="w-4 h-4 text-gold-400" /> Homepage Content</h3>
        <div>
          <label className="text-muted text-xs mb-1 block">Featured Municipality on Homepage</label>
          <select value={settings.featuredMunicipality} onChange={(e) => setSettings((s) => ({ ...s, featuredMunicipality: e.target.value }))} className="input-green text-sm px-4 py-2.5 min-w-[200px]">
            {MUNICIPALITIES.filter((m) => m !== 'All').map((m) => <option key={m}>{m}</option>)}
          </select>
          <p className="text-muted text-xs mt-1.5">This municipality will be prominently showcased on the homepage hero section.</p>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary px-6 py-3 font-semibold">Save All Settings</button>
    </div>
  );
};

// ─── Reviews Moderation Tab ───────────────────────────────────────────────────
const ReviewsModerationTab = ({ setConfirmAction }) => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.warn('Failed to fetch reviews from API, using fallback data.', err);
      // Fallback mockup
      setReviews([
        { id: 1, restaurant_name: 'Tagaytay Bulalo House', username: 'tourist1', first_name: 'Maria', last_name: 'Santos', content: 'Best Bulalo ever! Rich bone marrow and tender beef.', rating_value: 5, created_at: '2026-05-18T10:00:00.000Z' },
        { id: 2, restaurant_name: 'Tagaytay Bulalo House', username: 'tourist2', first_name: 'Carlo', last_name: 'Reyes', content: 'Very generous portions. The soup was a bit salty though.', rating_value: 4, created_at: '2026-05-15T12:00:00.000Z' },
        { id: 3, restaurant_name: 'Casa Caviteña', username: 'tourist3', first_name: 'Ana', last_name: 'Lim', content: 'Substandard food. Cold and overpriced. Bad service.', rating_value: 1, created_at: '2026-05-10T14:30:00.000Z' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = (id) => {
    setConfirmAction({
      description: 'This will permanently delete this review from the system. It cannot be recovered.',
      label: 'Delete Review',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/reviews/${id}`);
          setReviews(prev => prev.filter(r => r.id !== id));
          toast.success('Review deleted successfully.');
        } catch (err) {
          toast.error('Failed to delete review.');
        }
      }
    });
  };

  const filtered = reviews.filter(r => {
    const contentText = r.content || '';
    const restaurantNameText = r.restaurant_name || '';
    const userFullNameText = `${r.first_name || ''} ${r.last_name || ''}`;
    const usernameText = r.username || '';
    const matchSearch = contentText.toLowerCase().includes(search.toLowerCase()) || 
                        restaurantNameText.toLowerCase().includes(search.toLowerCase()) || 
                        userFullNameText.toLowerCase().includes(search.toLowerCase()) ||
                        usernameText.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === 'all' || r.rating_value === Number(ratingFilter);
    return matchSearch && matchRating;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-playfair font-bold text-primary">Reviews Moderation</h2>
        <button onClick={fetchReviews} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by review text, restaurant, or user name..." 
            className="input-green w-full pl-9 pr-4 py-2.5 text-sm" 
          />
        </div>
        <select 
          value={ratingFilter} 
          onChange={(e) => setRatingFilter(e.target.value)} 
          className="input-green text-sm px-4 py-2.5 pr-8 min-w-[140px]"
        >
          <option value="all">All Ratings</option>
          <option value="5">★ 5 Stars</option>
          <option value="4">★ 4 Stars</option>
          <option value="3">★ 3 Stars</option>
          <option value="2">★ 2 Stars</option>
          <option value="1">★ 1 Star</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-10 text-center border border-primary/10">
            <p className="text-muted text-sm">No reviews found matching the filters.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-5 border border-primary/10 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-emerald-500/20 transition-all duration-200">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-primary font-bold text-sm">{r.restaurant_name}</span>
                  <span className="text-muted text-xs">• reviewed by {r.first_name ? `${r.first_name} ${r.last_name}` : r.username} ({r.email})</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} size={12} className={star <= r.rating_value ? 'text-amber-400 fill-amber-400' : 'text-forest-800'} />
                  ))}
                  <span className="text-muted text-xs ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-muted text-sm leading-relaxed">{r.content}</p>
                {r.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-primary/10 max-w-[120px]">
                    <img src={r.image_url} alt="Review attachment" className="w-full h-auto object-cover max-h-24" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleDelete(r.id)} 
                className="bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 md:self-center transition-colors shrink-0"
              >
                <Trash2 size={13} /> Delete Review
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Municipality Management Tab ──────────────────────────────────────────────
const MunicipalityTab = ({ setConfirmAction }) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchMunicipalities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/municipalities');
      setMunicipalities(res.data);
    } catch (err) {
      console.warn('Failed to fetch municipalities from API. Using local mock state.', err);
      setMunicipalities([
        { id: 1, name: 'Bacoor', description: 'Gateway to Cavite, known for historical heritage and commercial growth.', latitude: 14.4612, longitude: 120.9621, restaurant_count: 5 },
        { id: 2, name: 'Tagaytay', description: 'Famous highland destination with refreshing cool climate and Taal volcano views.', latitude: 14.1153, longitude: 120.9621, restaurant_count: 8 },
        { id: 3, name: 'Cavite City', description: 'Historic peninsula, home of the legendary Pancit Pusit.', latitude: 14.4789, longitude: 120.8989, restaurant_count: 4 }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMunicipalities();
  }, [fetchMunicipalities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.latitude === '' || form.longitude === '') {
      toast.warning('Name and coordinates are required.');
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`/api/admin/municipalities/${editItem.id}`, form);
        toast.success('Municipality updated!');
      } else {
        await axios.post('/api/admin/municipalities', form);
        toast.success('Municipality created!');
      }
      setForm({ name: '', description: '', latitude: '', longitude: '' });
      setShowAdd(false);
      setEditItem(null);
      fetchMunicipalities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save municipality.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m) => {
    setEditItem(m);
    setForm({ name: m.name, description: m.description || '', latitude: m.latitude, longitude: m.longitude });
    setShowAdd(true);
  };

  const handleDelete = (id, name) => {
    setConfirmAction({
      description: `This will permanently delete "${name}" from the system. This action is irreversible.`,
      label: 'Delete Municipality',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/municipalities/${id}`);
          toast.success('Municipality deleted!');
          fetchMunicipalities();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete municipality.');
        }
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-playfair font-bold text-primary">Municipality Management</h2>
        <button 
          onClick={() => { setShowAdd(o => !o); setEditItem(null); setForm({ name: '', description: '', latitude: '', longitude: '' }); }} 
          className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
        >
          <Plus size={15} /> {showAdd ? 'Close Panel' : 'Add Municipality'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-emerald-500/20 p-5 space-y-4">
          <h3 className="font-playfair font-bold text-primary">{editItem ? 'Edit Municipality' : 'Add New Municipality'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-muted text-xs mb-1 block">Municipality Name *</label>
              <input required className="input-green" placeholder="e.g. Dasmariñas" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="text-muted text-xs mb-1 block">Description</label>
              <input className="input-green" placeholder="Brief tagline or description..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="text-muted text-xs mb-1 block">Center Latitude *</label>
              <input type="number" step="any" required className="input-green" placeholder="e.g. 14.3294" value={form.latitude} onChange={e => setForm(f => ({...f, latitude: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="text-muted text-xs mb-1 block">Center Longitude *</label>
              <input type="number" step="any" required className="input-green" placeholder="e.g. 120.9367" value={form.longitude} onChange={e => setForm(f => ({...f, longitude: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5">
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Municipality'}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setEditItem(null); }} className="btn-secondary text-xs py-2 px-4">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-primary/10 text-muted text-xs font-bold uppercase">
                <th className="text-left px-5 py-3">Municipality</th>
                <th className="text-left px-5 py-3">Description</th>
                <th className="text-left px-5 py-3">Center Coordinates</th>
                <th className="text-left px-5 py-3">Establishments</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/25">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted">Loading municipalities...</td></tr>
              ) : municipalities.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted">No municipalities registered.</td></tr>
              ) : (
                municipalities.map(m => (
                  <tr key={m.id} className="hover:bg-secondary text-xs text-secondary transition-colors">
                    <td className="px-5 py-3.5 font-bold text-primary text-sm">{m.name}</td>
                    <td className="px-5 py-3.5 text-muted max-w-[200px] truncate" title={m.description}>{m.description || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-muted">
                      {Number(m.latitude).toFixed(4)}, {Number(m.longitude).toFixed(4)}
                    </td>
                    <td className="px-5 py-3.5 text-emerald-400 font-bold">{m.restaurant_count || m.establishments_count || 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg text-muted hover:text-gold-300 hover:bg-gold-500/10 transition-colors" title="Edit"><Edit3 size={13} /></button>
                        <button onClick={() => handleDelete(m.id, m.name)} className="p-1.5 rounded-lg text-muted hover:text-rose-450 hover:bg-rose-500/10 transition-colors" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminDashboard Component ────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({totalUsers: 0, totalRestaurants: 0, pendingApprovals: 0, totalReviews: 0, reportsToResolve: 0, totalStories: 0});
  const [users, setUsers] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [approvedRestaurants, setApprovedRestaurants] = useState([]);
  const [reports, setReports] = useState([]);
  const [stories, setStories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch admin console data from backend APIs (falls back to mock data if offline)
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, approvalsRes, reportsRes, auditRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/verification-requests'),
        axios.get('/api/admin/reports'),
        axios.get('/api/admin/audit-logs'),
      ]);

      if (usersRes.data) {
        setUsers(usersRes.data.map(u => ({
          id: u.id,
          name: u.first_name ? `${u.first_name} ${u.last_name}` : u.username,
          email: u.email,
          role: u.role_id === 3 ? 'admin' : u.role_id === 2 ? 'owner' : 'tourist',
          status: u.is_active === 0 || u.is_active === false ? 'suspended' : 'active',
          joined: new Date(u.created_at || Date.now()).toISOString().split('T')[0],
          avatar: u.username?.slice(0, 2).toUpperCase() || 'US'
        })));
      }

      if (approvalsRes.data) {
        const mapped = approvalsRes.data.map(r => ({
          id: r.id,
          restaurantId: r.restaurant_id,
          name: r.restaurant_name || r.name,
          owner: r.owner_username || r.owner_name || 'Merchant Partner',
          ownerEmail: r.owner_email || 'partner@hungrylakwatsero.ph',
          municipality: r.municipality_name || 'Cavite',
          cuisine: r.cuisine_type || 'Filipino',
          submitted: new Date(r.created_at || Date.now()).toISOString().split('T')[0],
          status: r.status,
          featured: r.is_featured === 1 || r.is_featured === true || r.featured || false,
          docs: { dti: 'dti_permit.pdf', brgy: 'business_permit.pdf', id: 'owner_id.pdf' }
        }));
        setPendingRestaurants(mapped.filter(r => r.status === 'pending'));
        setApprovedRestaurants(mapped.filter(r => r.status === 'approved' || r.status === 'active'));
      }

      if (reportsRes.data) {
        setReports(reportsRes.data.map(rep => ({
          id: rep.id,
          entityType: rep.entity_type,
          reason: rep.reason,
          reporter: rep.reporter_name || 'User Reporter',
          date: new Date(rep.created_at || Date.now()).toISOString().split('T')[0],
          status: rep.status,
          entityId: rep.entity_id
        })));
      }

      if (auditRes.data) {
        setAuditLogs(auditRes.data.map(log => ({
          id: log.id,
          user: log.email || log.username || 'System',
          action: log.action_type || log.action,
          entityType: log.entity_type || 'System',
          entityId: log.entity_id || '0',
          ip: log.ip_address || '127.0.0.1',
          timestamp: new Date(log.created_at || Date.now()).toLocaleString('en-PH')
        })));
      }
    } catch (err) {
      console.error('Failed to query administrative APIs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirect non-admins (supports case-insensitive 'Admin' role value)
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const roleStr = user.role?.toLowerCase() || '';
    if (roleStr !== 'admin' && user.roleId !== 3) {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user, navigate, fetchAdminData]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleConfirm = () => {
    if (confirmAction?.onConfirm) confirmAction.onConfirm();
    setConfirmAction(null);
  };

  const liveStats = {
    ...stats,
    pendingApprovals: pendingRestaurants.filter((r) => r.status === 'pending').length,
    reportsToResolve: reports.filter((r) => r.status === 'pending').length,
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab stats={liveStats} auditLogs={auditLogs} setActiveTab={setActiveTab} />;
      case 'users': return <UsersTab users={users} setUsers={setUsers} setConfirmAction={setConfirmAction} />;
      case 'approvals': return <ApprovalsTab restaurants={pendingRestaurants} setRestaurants={setPendingRestaurants} setConfirmAction={setConfirmAction} />;
      case 'moderation': return <RestaurantModerationTab restaurants={approvedRestaurants} setRestaurants={setApprovedRestaurants} setConfirmAction={setConfirmAction} />;
      case 'reviews': return <ReviewsModerationTab setConfirmAction={setConfirmAction} />;
      case 'municipalities': return <MunicipalityTab setConfirmAction={setConfirmAction} />;
      case 'content': return <ContentModerationTab reports={reports} setReports={setReports} setConfirmAction={setConfirmAction} />;
      case 'stories': return <StoriesCMSTab stories={stories} setStories={setStories} setConfirmAction={setConfirmAction} />;
      case 'analytics': return <AnalyticsTab />;
      case 'auditlogs': return <AuditLogsTab logs={auditLogs} />;
      case 'settings': return <SystemSettingsTab />;
      default: return null;
    }
  };

  return (
    <div className="dashboard-layout bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovals={liveStats.pendingApprovals}
        reportsToResolve={liveStats.reportsToResolve}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="dashboard-main flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 bg-background/90 backdrop-blur-md border-b border-primary/10">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-muted hover:text-primary hover:bg-secondary transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-primary font-semibold text-sm capitalize">{TABS.find((t) => t.id === activeTab)?.label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-300 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-right">
                <p className="text-primary text-xs font-semibold leading-tight">{user?.name || 'Admin'}</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-gold-400" />
                  <span className="text-gold-400 text-[10px] font-semibold uppercase tracking-wider">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 mobile-content-pad">
          <div className="max-w-6xl mx-auto">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        action={confirmAction}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default AdminDashboard;

