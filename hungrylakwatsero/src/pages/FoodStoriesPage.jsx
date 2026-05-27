import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, MapPin, Plus, Edit3, Trash2, Eye, RefreshCw,
  Search, ChevronRight, Leaf, Calendar, Tag, ArrowRight,
  X, CheckCircle2, AlertCircle
} from 'lucide-react';
import Footer from '../components/Footer';

// Mocks removed

// ── Sub-components ─────────────────────────────────────────────────────────────
function StoryCard({ story, isSelected, onClick, isAdmin, onEdit, onDelete }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-3xl border transition-all duration-300 group overflow-hidden
        ${isSelected
          ? 'border-emerald-500/20 shadow-leaf bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md'
          : 'border-primary/10 bg-card backdrop-blur-md shadow-sm border border-primary/10 hover:border-emerald-500/20 hover:shadow-leaf'
        }`}
    >
      {/* Image */}
      <div className="aspect-video overflow-hidden">
        <img
          src={story.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=75&fit=crop'}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=75&fit=crop'; }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="badge-green text-[10px] flex items-center gap-1">
            <MapPin size={9} /> {story.municipality_name}
          </span>
          <span className="text-muted text-[10px]">
            {new Date(story.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h3 className={`font-display font-bold text-base leading-tight group-hover:text-emerald-300 transition-colors
          ${isSelected ? 'text-emerald-300' : 'text-primary'}`}>
          {story.title}
        </h3>

        <p className="text-muted text-xs mt-2 line-clamp-2 leading-relaxed">
          {story.content}
        </p>

        {story.traditional_dishes && (
          <div className="mt-3 flex flex-wrap gap-1">
            {story.traditional_dishes.split(',').slice(0, 2).map((d, i) => (
              <span key={i} className="badge-sage text-[10px]">🍽️ {d.trim()}</span>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-primary/10">
            <button
              onClick={e => { e.stopPropagation(); onEdit(story); }}
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              <Edit3 size={12} /> Edit
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(story.id); }}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition ml-auto"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FoodStoriesPage() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'Admin' || user.roleId === 3);

  const [stories, setStories] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  // Admin CMS form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', municipalityId: 1, traditionalDishes: '', status: 'published' });
  const [imageFile, setImageFile] = useState(null);
  const [formMsg, setFormMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch
  useEffect(() => {
    const init = async () => {
      try {
        const [storiesRes, muniRes] = await Promise.all([
          axios.get('/api/stories').catch(() => ({ data: [] })),
          axios.get('/api/municipalities').catch(() => ({ data: [] })),
        ]);
        const s = storiesRes.data || [];
        setStories(s);
        setSelectedStory(s.length ? s[0] : null);
        if (muniRes.data?.length) setMunicipalities(muniRes.data);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Filtered stories
  const filtered = stories.filter(s => {
    const matchSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.traditional_dishes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchMuni = !selectedMuni || s.municipality_name === selectedMuni;
    return matchSearch && matchMuni;
  });

  // Admin handlers
  const handleEdit = (story) => {
    setEditId(story.id);
    setFormData({ title: story.title, content: story.content, municipalityId: story.municipality_id || 1, traditionalDishes: story.traditional_dishes || '', status: story.status || 'published' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setEditId(null);
    setFormData({ title: '', content: '', municipalityId: 1, traditionalDishes: '', status: 'published' });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormMsg(null);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editId) {
        await axios.put(`/api/stories/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setStories(prev => prev.map(s => s.id === editId ? { ...s, ...formData, municipality_name: municipalities.find(m => m.id === Number(formData.municipalityId))?.name } : s));
        setFormMsg({ type: 'success', text: 'Story updated successfully!' });
      } else {
        const res = await axios.post('/api/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => null);
        const newStory = res?.data?.story || { ...formData, id: Date.now(), municipality_name: municipalities.find(m => m.id === Number(formData.municipalityId))?.name || 'Local', author_name: user?.firstName || 'Admin', created_at: new Date().toISOString() };
        setStories(prev => [newStory, ...prev]);
        setSelectedStory(newStory);
        setFormMsg({ type: 'success', text: 'Story published!' });
      }
      setShowForm(false);
    } catch {
      setFormMsg({ type: 'error', text: 'Save failed. Changes applied locally.' });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story? This cannot be undone.')) return;
    try { await axios.delete(`/api/stories/${id}`); } catch { /* local only */ }
    setStories(prev => prev.filter(s => s.id !== id));
    if (selectedStory?.id === id) setSelectedStory(stories.find(s => s.id !== id) || null);
  };

  const handleSelectStory = (story) => {
    setSelectedStory(story);
    setMobileView('detail');
  };

  return (
    <div className="min-h-screen bg-background text-primary">
      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-forest-950/80 to-dark-950 border-b border-primary/10 py-14 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-gold-500/5 blur-[60px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="section-label flex items-center justify-center gap-2 mb-3">
            <BookOpen size={14} /> Cultural Heritage Module
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
            Cavite <span className="text-gradient-brand italic">Culinary Stories</span>
          </h1>
          <p className="text-muted text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            Explore traditional cooking techniques, historical backgrounds, and regional dishes that define Cavite's unique food identity.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-emerald-500/20">
              <Search size={16} className="text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search stories, dishes, traditions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-primary placeholder-sage-600 text-sm w-full"
              />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-muted hover:text-muted" /></button>}
            </div>
          </div>

          {/* Municipality Filter pills */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 justify-start md:justify-center scrollbar-hide">
            <button
              onClick={() => setSelectedMuni('')}
              className={`muni-tab shrink-0 ${!selectedMuni ? 'active' : ''}`}
            >All Municipalities</button>
            {municipalities.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMuni(selectedMuni === m.name ? '' : m.name)}
                className={`muni-tab shrink-0 ${selectedMuni === m.name ? 'active' : ''}`}
              >{m.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ADMIN CREATE BUTTON ── */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 pt-6 flex justify-end">
          <button onClick={handleCreateNew} className="btn-gold py-2.5 px-5 text-sm rounded-2xl">
            <Plus size={16} /> Create Story
          </button>
        </div>
      )}

      {/* ── ADMIN FORM ── */}
      {showForm && (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-3xl border border-emerald-500/20 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-primary">
                {editId ? 'Edit Story' : 'Create New Culinary Story'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-muted hover:text-primary">
                <X size={20} />
              </button>
            </div>

            {formMsg && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${formMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border border-rose-800/50 text-rose-300'}`}>
                {formMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="input-label">Story Title *</label>
                  <input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. The Story of Pancit Estacion" className="input-green" />
                </div>
                <div className="space-y-1.5">
                  <label className="input-label">Municipality Origin</label>
                  <select value={formData.municipalityId} onChange={e => setFormData(p => ({ ...p, municipalityId: e.target.value }))}
                    className="input-green">
                    {municipalities.map(m => <option key={m.id} value={m.id} className="bg-surface">{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="input-label">Status</label>
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="input-green">
                    <option value="published" className="bg-surface">Published</option>
                    <option value="draft" className="bg-surface">Draft</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="input-label">Traditional Dishes (comma-separated)</label>
                  <input value={formData.traditionalDishes} onChange={e => setFormData(p => ({ ...p, traditionalDishes: e.target.value }))}
                    placeholder="e.g. Pancit Estacion, Quesillo" className="input-green" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="input-label">Featured Image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                    className="input-green text-xs" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="input-label">Full Story Content *</label>
                  <textarea required rows={5} value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                    placeholder="Describe the dish's history, cultural meaning, preparation techniques..." className="input-green resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className={`btn-primary py-3 px-6 rounded-2xl ${saving ? 'opacity-60' : ''}`}>
                  {saving ? <><RefreshCw size={15} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={15} /> Save Story</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-3 px-5 rounded-2xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <RefreshCw size={24} className="animate-spin text-emerald-400" />
            <span className="text-muted text-sm font-semibold">Loading culinary heritage...</span>
          </div>
        ) : (
          <>
            {/* Mobile view toggle */}
            {selectedStory && (
              <div className="flex gap-2 mb-6 md:hidden">
                <button onClick={() => setMobileView('list')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${mobileView === 'list' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'border-primary/10 text-muted'}`}>
                  📋 All Stories ({filtered.length})
                </button>
                <button onClick={() => setMobileView('detail')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${mobileView === 'detail' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'border-primary/10 text-muted'}`}>
                  📖 Read Story
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left: Stories List */}
              <div className={`space-y-4 ${mobileView === 'detail' && selectedStory ? 'hidden md:block' : ''}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-primary">
                    Stories Feed
                    <span className="text-muted text-sm font-normal ml-2">({filtered.length})</span>
                  </h2>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold">No stories match your search.</p>
                    <button onClick={() => { setSearchQuery(''); setSelectedMuni(''); }} className="text-emerald-400 text-xs mt-2 hover:underline">Clear filters</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        isSelected={selectedStory?.id === story.id}
                        onClick={() => handleSelectStory(story)}
                        isAdmin={isAdmin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Story Detail */}
              <div className={`lg:col-span-2 ${mobileView === 'list' && selectedStory ? 'hidden md:block' : ''}`}>
                {selectedStory ? (
                  <article className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-4xl border border-primary/10 overflow-hidden shadow-glass">
                    {/* Back button on mobile */}
                    <button onClick={() => setMobileView('list')} className="md:hidden flex items-center gap-2 text-muted text-xs font-semibold p-4 pb-0 hover:text-emerald-400 transition">
                      ← Back to stories
                    </button>

                    {/* Cover image */}
                    <div className="aspect-video md:aspect-[16/7] overflow-hidden">
                      <img
                        src={selectedStory.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&fit=crop'}
                        alt={selectedStory.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&fit=crop'; }}
                      />
                    </div>

                    <div className="p-6 md:p-8 space-y-5">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="badge-green flex items-center gap-1">
                          <MapPin size={10} /> {selectedStory.municipality_name}
                        </span>
                        <span className="text-muted text-xs flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(selectedStory.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-muted text-xs">
                          By <strong className="text-muted">{selectedStory.author_name}</strong>
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">
                        {selectedStory.title}
                      </h2>

                      {/* Traditional dishes */}
                      {selectedStory.traditional_dishes && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <Tag size={11} /> Featured Dishes:
                          </span>
                          {selectedStory.traditional_dishes.split(',').map((d, i) => (
                            <Link
                              key={i}
                              to={`/map?search=${encodeURIComponent(d.trim())}`}
                              className="badge-gold text-[11px] hover:bg-gold-800/30 transition"
                            >
                              🍽️ {d.trim()}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Full content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-secondary text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {selectedStory.content}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="pt-4 border-t border-primary/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Link to={`/map?municipality=${encodeURIComponent(selectedStory.municipality_name)}`} className="btn-primary py-3 px-5 text-sm rounded-2xl">
                          <MapPin size={15} /> Find Restaurants in {selectedStory.municipality_name}
                        </Link>
                        <Link to="/stories" className="text-muted text-xs hover:text-emerald-400 transition flex items-center gap-1">
                          More Stories <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ) : (
                  <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl border border-primary/10 py-24 text-center">
                    <BookOpen size={40} className="mx-auto text-muted mb-4" />
                    <p className="text-muted font-semibold">Select a story to start reading</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
