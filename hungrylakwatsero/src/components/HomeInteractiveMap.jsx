import React, { useState, useMemo, useRef, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import { Search, MapPin, Navigation, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARTO_DARK_MATTER, CARTO_POSITRON } from '../utils/mapStyle';
import { useTheme } from '../context/ThemeContext';

const FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&auto=format&fit=crop';
const CAVITE_CENTER = { latitude: 14.2456, longitude: 120.8787 };
const FILTERS = ['All', 'Restaurants', 'Cafes', 'Heritage Food', 'Top Rated', 'Near Me'];

export default function HomeInteractiveMap({ restaurants = [] }) {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [popupInfo, setPopupInfo] = useState(null);
  
  const mapRef = useRef(null);

  const handleNearMe = useCallback(() => {
    setActiveFilter('Near Me');
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 14,
            duration: 2000
          });
        },
        (err) => {
          console.warn('Geolocation failed', err);
          alert('Unable to retrieve your location. Please check browser permissions.');
          setActiveFilter('All');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setActiveFilter('All');
    }
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const nameMatch = (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        (r.municipality_name || '').toLowerCase().includes(search.toLowerCase());
      
      let filterMatch = true;
      const type = (r.cuisine_type || '').toLowerCase();
      
      if (activeFilter === 'Restaurants') {
        filterMatch = !type.includes('cafe') && !type.includes('coffee');
      } else if (activeFilter === 'Cafes') {
        filterMatch = type.includes('cafe') || type.includes('coffee');
      } else if (activeFilter === 'Heritage Food') {
        filterMatch = type.includes('heritage') || type.includes('traditional');
      } else if (activeFilter === 'Top Rated') {
        filterMatch = (r.average_rating || 0) >= 4.7;
      }
      
      return nameMatch && filterMatch;
    });
  }, [restaurants, search, activeFilter]);

  return (
    <div className="w-full flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-primary/20 bg-card backdrop-blur-xl transition-all duration-300 relative group">
      
      {/* ─── Header Controls ─── */}
      <div className="p-4 md:p-6 bg-secondary/30 border-b border-primary/10 flex flex-col gap-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500 shrink-0">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-primary font-display font-bold text-lg leading-tight">Live Food Map</h3>
              <p className="text-muted text-xs">Discover {filteredRestaurants.length} places around Cavite</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search food places..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-full py-2.5 pl-10 pr-4 text-sm text-primary placeholder-muted focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => f === 'Near Me' ? handleNearMe() : setActiveFilter(f)}
              className={`snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border
                ${activeFilter === f 
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
                  : 'bg-background text-muted border-primary/10 hover:border-emerald-500/30 hover:text-emerald-400'
                }`}
            >
              {f === 'Near Me' && <Navigation size={12} />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Map Container ─── */}
      <div className="h-[350px] md:h-[450px] w-full relative z-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: CAVITE_CENTER.longitude,
            latitude: CAVITE_CENTER.latitude,
            zoom: 11
          }}
          mapStyle={theme === 'dark' ? CARTO_DARK_MATTER : CARTO_POSITRON}
          interactiveLayerIds={[]}
          cursor="grab"
          attributionControl={false}
        >
          {filteredRestaurants.map(r => {
            const lat = r.lat ?? r.latitude;
            const lng = r.lng ?? r.longitude;
            if (!lat || !lng) return null;
            return (
              <Marker
                key={r.id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(r);
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="cursor-pointer relative"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-900 shadow-[0_0_12px_rgba(16,185,129,0.6)] flex items-center justify-center">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-900"></div>
                </motion.div>
              </Marker>
            );
          })}

          <AnimatePresence>
            {popupInfo && (
              <Popup
                anchor="top"
                longitude={popupInfo.lng ?? popupInfo.longitude}
                latitude={popupInfo.lat ?? popupInfo.latitude}
                onClose={() => setPopupInfo(null)}
                closeOnClick={false}
                className="premium-map-popup"
                maxWidth="240px"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl overflow-hidden shadow-2xl p-0 font-body text-left"
                >
                  <div className="h-28 w-full relative">
                    <img 
                      src={popupInfo.primary_image || FOOD_PLACEHOLDER} 
                      className="w-full h-full object-cover"
                      alt={popupInfo.name}
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white font-bold border border-white/10">
                      ⭐ {popupInfo.average_rating ? Number(popupInfo.average_rating).toFixed(1) : 'New'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="m-0 text-sm font-bold text-white leading-tight">{popupInfo.name}</h4>
                    <p className="m-0 mt-1 mb-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <MapPin size={10} /> {popupInfo.municipality_name || 'Cavite'}
                    </p>
                    <p className="m-0 mb-3 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {popupInfo.description || 'Discover amazing flavors at this highly rated local restaurant.'}
                    </p>
                    <a 
                      href={`/restaurant/${popupInfo.id}`} 
                      className="block text-center bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-white transition-colors py-1.5 rounded-lg text-xs font-bold"
                    >
                      View Details
                    </a>
                  </div>
                </motion.div>
              </Popup>
            )}
          </AnimatePresence>
        </Map>
        
        <div className="absolute bottom-2 right-2 z-10 text-[9px] text-gray-500 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
          &copy; OpenStreetMap contributors &copy; CARTO
        </div>
        
        {/* Decorative inner shadow */}
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] pointer-events-none z-[50]"></div>
      </div>
    </div>
  );
}
