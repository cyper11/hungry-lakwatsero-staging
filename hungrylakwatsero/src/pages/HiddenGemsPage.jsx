import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Star, ChevronRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HiddenGemsPage = () => {
  const [showSurprise, setShowSurprise] = useState(false);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [surpriseGem, setSurpriseGem] = useState(null);

  useEffect(() => {
    const fetchGems = async () => {
      try {
        const res = await axios.get('/api/restaurants');
        // Simple logic for hidden gems: highly rated but maybe less reviews
        const sorted = res.data.sort((a, b) => b.average_rating - a.average_rating);
        const top = sorted.slice(0, 4);
        setHiddenGems(top);
        if (sorted.length > 4) {
          setSurpriseGem(sorted[4]);
        }
      } catch (err) {
        console.error('Failed to fetch hidden gems', err);
      }
    };
    fetchGems();
  }, []);

  return (
    <div className="page-content min-h-screen bg-background font-body">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-display text-primary mb-2">Hidden Gems</h1>
            <p className="text-muted">Discover Cavite's best-kept culinary secrets</p>
          </div>
          <button 
            onClick={() => setShowSurprise(true)}
            disabled={!surpriseGem}
            className="mt-4 md:mt-0 btn-gold flex items-center space-x-2 px-6 py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>Surprise Me</span>
          </button>
        </div>

        {showSurprise && surpriseGem && (
          <div className="mb-12 animate-fade-in">
            <div className="glass-dark rounded-2xl overflow-hidden border border-gold-500/30 relative shadow-lg shadow-gold-900/10">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <span className="badge-gold flex items-center gap-1">
                   <Sparkles className="w-3 h-3" /> AI Suggestion
                 </span>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 h-64 md:h-auto relative">
                  <img 
                    src={surpriseGem.primary_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt={surpriseGem.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-dark-950 to-transparent"></div>
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-display text-gold-500 mb-2">{surpriseGem.name}</h2>
                  <div className="flex items-center text-sage-400 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{surpriseGem.municipality_name || surpriseGem.address}</span>
                  </div>
                  <p className="text-primary mb-6 leading-relaxed line-clamp-3">
                    {surpriseGem.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(surpriseGem.cuisine_type || 'Local').split(',').map(tag => (
                      <span key={tag} className="badge-sage">{tag.trim()}</span>
                    ))}
                  </div>
                  <Link to={`/restaurants/${surpriseGem.id}`} className="btn-primary w-full sm:w-auto py-3 px-6 flex justify-center items-center gap-2 rounded-lg">
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {hiddenGems.map(gem => (
            <div key={gem.id} className="glass-dark rounded-xl overflow-hidden group hover:border-emerald-500/50 transition-colors border border-transparent flex flex-col">
              <div className="relative h-48 overflow-hidden shrink-0">
                <img 
                  src={gem.primary_image || "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                  alt={gem.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 glass-dark px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                  <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                  <span className="text-xs text-primary font-bold">{Number(gem.average_rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-display text-primary line-clamp-1">{gem.name}</h3>
                </div>
                <div className="flex items-center text-sage-400 mb-3">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  <span className="text-xs line-clamp-1">{gem.municipality_name || gem.address}</span>
                </div>
                <p className="text-sage-400 text-sm mb-4 line-clamp-2">
                  {gem.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                  {(gem.cuisine_type || 'Local').split(',').map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-forest-800/50 text-emerald-400 border border-emerald-900">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <Link to={`/restaurants/${gem.id}`} className="w-full btn-secondary py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" /> Discover
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HiddenGemsPage;
