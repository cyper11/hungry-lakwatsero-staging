import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get('/api/favorites');
        setFavorites(res.data);
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const removeFavorite = async (id) => {
    try {
      await axios.post('/api/favorites/toggle', { restaurantId: id });
      setFavorites(favorites.filter((fav) => fav.id !== id));
      toast.success('Removed from favorites.');
    } catch (err) {
      toast.error('Failed to remove favorite.');
    }
  };

  return (
    <div className="page-content min-h-screen bg-background text-primary font-body">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display text-emerald-600 dark:text-emerald-400 mb-2">Favorites</h1>
          <p className="text-muted">You have {favorites.length} saved {favorites.length === 1 ? 'place' : 'places'}.</p>
        </header>

        {favorites.length === 0 ? (
          <div className="bg-card border border-border-primary rounded-2xl p-12 text-center">
            <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary mb-2">No favorites yet</h2>
            <p className="text-muted mb-6">Start exploring and save your favorite restaurants!</p>
            <Link to="/map" className="btn-primary inline-flex">Explore Map</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {favorites.map((place) => (
              <article
                key={place.favorite_id}
                className="bg-card border border-border-primary rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-36 sm:h-48 overflow-hidden">
                  <img
                    src={place.primary_image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75'}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFavorite(place.id)}
                    className="absolute top-3 right-3 p-2 bg-background/70 backdrop-blur-sm rounded-full text-emerald-600 hover:text-red-500 transition-colors min-w-[36px] min-h-[36px]"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="w-5 h-5 fill-current text-emerald-500" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                    <span className="text-sm font-semibold text-primary">{Number(place.average_rating || 0).toFixed(1)}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <h3 className="text-base sm:text-xl font-display font-bold text-primary mb-2 line-clamp-2">{place.name}</h3>
                  <div className="flex items-start text-muted mt-auto">
                    <MapPin className="w-4 h-4 mr-1 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm line-clamp-2">{place.municipality_name || place.location}</span>
                  </div>
                  <Link
                    to={`/restaurants/${place.id}`}
                    className="mt-3 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View on map
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
