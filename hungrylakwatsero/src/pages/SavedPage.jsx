import React, { useState } from 'react';
import { Bookmark, Calendar, Map, BookOpen, MapPin, Clock, ArrowRight, Share2 } from 'lucide-react';
// Mock removed
import axios from 'axios';
import { Link } from 'react-router-dom';

const SavedPage = () => {
  const [activeTab, setActiveTab] = useState('stories');
  const [stories, setStories] = useState([]);
  const [destinations, setDestinations] = useState([]);

  React.useEffect(() => {
    axios.get('/api/stories').then(res => setStories(res.data)).catch(() => setStories([]));
    axios.get('/api/favorites').then(res => {
      setDestinations(res.data.data || res.data || []);
    }).catch(() => setDestinations([]));
  }, []);

  const tabs = [
    { id: 'stories', label: 'Food Stories', icon: BookOpen },
    { id: 'destinations', label: 'Destinations', icon: Map },
  ];

  return (
    <div className="page-content min-h-screen bg-background font-body">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-8 h-8 text-gold-500" />
          <h1 className="text-3xl md:text-5xl font-display text-primary">Saved Content</h1>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar mb-8 border-b border-forest-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors border-b-2 font-medium text-sm md:text-base ${
                  isActive 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-sage-400 hover:text-primary hover:bg-forest-900/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-sage-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          
          {activeTab === 'stories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted">No saved stories.</div>
              ) : stories.slice(0, 4).map(story => (
                <div key={story.id} className="glass-dark rounded-xl flex flex-col sm:flex-row overflow-hidden group hover:border-emerald-500/30 transition-all border border-transparent">
                  <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                     <img src={story.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75'} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-display text-primary leading-tight group-hover:text-emerald-400 transition-colors">{story.title}</h3>
                         <button className="text-sage-400 hover:text-gold-500"><Bookmark className="w-5 h-5 fill-current" /></button>
                      </div>
                      <p className="text-sage-400 text-sm mb-4 line-clamp-2">{story.content}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-sage-500">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {story.readTime || '5 min read'}</span>
                       <span>{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted">No saved destinations.</div>
              ) : destinations.map(dest => (
                <div key={dest.id} className="glass-dark rounded-xl p-4 flex flex-col items-center text-center border border-forest-800 group hover:-translate-y-1 transition-transform">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors">
                    <img src={dest.primary_image || dest.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=75'} alt={dest.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="badge-sage mb-2">{dest.cuisine_type || 'Restaurant'}</span>
                  <h3 className="text-lg font-display text-primary mb-1">{dest.name}</h3>
                  <div className="flex items-center gap-1 text-sage-400 text-sm mb-4">
                    <MapPin className="w-3 h-3" /> {dest.municipality_name || dest.location}
                  </div>
                  <Link to={`/restaurant/${dest.id}`} className="w-full mt-auto text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 text-sm font-medium py-2 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 transition-colors">
                    Explore <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SavedPage;
