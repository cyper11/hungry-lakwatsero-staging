import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Filter, ChevronRight, Compass, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75';

const mapRestaurantToCard = (r) => {
  const tags = r.cuisine_tags ? r.cuisine_tags.split(',').map(t => t.trim()) : [];
  return {
    id: r.id,
    title: r.name,
    badge: tags[0] || r.cuisine_type || 'Local',
    rating: Number(r.average_rating) || 0,
    reviews: Number(r.rating_count) || 0,
    location: r.municipality_name || '',
    description: r.description || '',
    image: r.primary_image || FALLBACK_IMAGE
  };
};

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const filters = ['All', 'Top Rated', 'Popular', 'Hidden Gems', 'Seafood', 'Cafes', 'Heritage', 'Desserts'];

  useEffect(() => {
    let cancelled = false;
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setFetchError('');
        const res = await axios.get('/api/restaurants');
        if (!cancelled) {
          setRestaurants((res.data || []).map(mapRestaurantToCard));
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err.response?.data?.message || err.message || 'Failed to load restaurants.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRestaurants();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = restaurants;
    if (activeFilter !== 'All') {
      list = list.filter((p) =>
        p.badge.toLowerCase().includes(activeFilter.toLowerCase().replace(' ', '')) ||
        activeFilter === 'Top Rated' && p.rating >= 4.8 ||
        activeFilter === 'Popular' && p.reviews > 500
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, activeFilter, restaurants]);

  return (
    <div className="page-content min-h-screen bg-background text-primary font-body">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <Compass className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 shrink-0" />
            Discover Cavite
          </h1>
          <p className="text-muted text-base md:text-lg mb-8">Unearth the culinary treasures and hidden gems of the province.</p>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="search"
              placeholder="Search for restaurants, dishes, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-green w-full py-3 pl-12 pr-14 rounded-full shadow-md"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button type="button" className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-full transition-colors" aria-label="Filters">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="scroll-x mb-8">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shrink-0 ${
                activeFilter === filter
                  ? 'bg-emerald-600 text-white shadow-leaf'
                  : 'bg-card border border-border-primary text-muted hover:border-emerald-500/50 hover:text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mb-6 flex justify-between items-end gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-primary">Top Picks for You</h2>
            <p className="text-muted text-sm mt-1">Based on your culinary preferences</p>
          </div>
          <Link to="/map" className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline flex items-center gap-1 shrink-0">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <p className="text-muted text-sm">Discovering the best spots in Cavite...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <p className="text-primary font-medium mb-1">Unable to load restaurants</p>
            <p className="text-muted text-sm mb-4">{fetchError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-emerald-500 text-sm font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Compass className="w-12 h-12 mx-auto mb-4 opacity-30" />
            {restaurants.length === 0 ? (
              <p>No restaurants available yet. Check back soon for new culinary discoveries in Cavite.</p>
            ) : (
              <p>No places match your search. Try a different filter or keyword.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((place) => (
              <article
                key={place.id}
                className="rounded-3xl border border-border-primary overflow-hidden bg-card group hover:border-emerald-500/40 transition-all duration-300 hover:shadow-leaf hover:-translate-y-0.5"
              >
                <div className="relative h-36 sm:h-48 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge-green text-[10px] sm:text-xs">{place.badge}</span>
                  </div>
                </div>

                <div className="p-3 sm:p-5">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-sm sm:text-lg font-bold text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">{place.title}</h3>
                    <div className="flex items-center gap-0.5 bg-secondary px-1.5 py-0.5 rounded-md border border-border-primary shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] sm:text-xs font-bold text-primary">{place.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted text-[10px] sm:text-xs mb-2">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="line-clamp-1">{place.location}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted line-clamp-2 sm:line-clamp-3 mb-3 hidden sm:block">{place.description}</p>

                  <Link
                    to={`/map?search=${encodeURIComponent(place.title)}`}
                    className="block w-full py-2 sm:py-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-xs sm:text-sm text-center hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
