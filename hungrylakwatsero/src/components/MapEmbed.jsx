import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import { MapPin, Navigation, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARTO_DARK_MATTER, CARTO_POSITRON } from '../utils/mapStyle';
import { useTheme } from '../context/ThemeContext';

const MUNICIPALITIES = [
  'All', 'Tagaytay', 'Imus', 'Bacoor', 'Dasmariñas', 'Silang', 'Trece Martires',
  'General Trias', 'Kawit', 'Rosario', 'Naic', 'Tanza', 'Indang', 'Amadeo',
  'Alfonso', 'Noveleta', 'Carmona', 'GMA', 'Cavite City', 'Mendez', 'Maragondon',
  'Ternate', 'Magallanes',
];

const FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=60&auto=format&fit=crop';
const CAVITE_CENTER = { lat: 14.2456, lng: 120.8787 };

// Mocks removed

export default function MapEmbed({
  height = '520px',
  showFilters = true,
  initialMunicipality = '',
  restaurants: propsRestaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  userLocation: propsUserLocation,
}) {
  const { theme } = useTheme();
  const [internalRestaurants, setInternalRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState(initialMunicipality || 'All');
  
  const mapRef = useRef(null);
  const filterScrollRef = useRef(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [userLocationState, setUserLocationState] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const isControlled = Array.isArray(propsRestaurants);
  const restaurants = isControlled ? propsRestaurants : internalRestaurants;

  useEffect(() => {
    if (isControlled) {
      setLoading(false);
      return;
    }
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/restaurants', { timeout: 6000 });
        setInternalRestaurants(Array.isArray(data?.data) ? data.data : data);
      } catch {
        setInternalRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [isControlled]);

  const filtered = useMemo(() => {
    return isControlled
      ? restaurants
      : selectedMunicipality === 'All'
      ? restaurants
      : restaurants.filter((r) => {
          const m1 = r.municipality_name?.toLowerCase() || '';
          const m2 = selectedMunicipality.toLowerCase();
          return m1 === m2 || 
            (m2 === 'gma' && (m1 === 'general mariano alvarez' || m1 === 'gen. mariano alvarez')) ||
            (m1 === 'gma' && (m2 === 'general mariano alvarez' || m2 === 'gen. mariano alvarez'));
        });
  }, [restaurants, isControlled, selectedMunicipality]);

  // Sync user location prop
  useEffect(() => {
    if (propsUserLocation && mapRef.current) {
      const loc = { lat: propsUserLocation[0], lng: propsUserLocation[1] };
      setUserLocationState(loc);
      mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 14, duration: 1500 });
    }
  }, [propsUserLocation]);

  // Handle selected restaurant flyTo
  useEffect(() => {
    if (!selectedRestaurantId || !mapRef.current) return;
    const found = restaurants.find(r => r.id === selectedRestaurantId);
    if (found) {
      setPopupInfo(found);
      const lat = found.lat ?? found.latitude;
      const lng = found.lng ?? found.longitude;
      if (lat && lng) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
      }
    }
  }, [selectedRestaurantId, restaurants]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGeoLoading(false);
        setUserLocationState(loc);
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 14, duration: 1500 });
        }
      },
      () => {
        setGeoError('Unable to retrieve your location.');
        setGeoLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return (
    <div className="relative flex flex-col w-full h-full rounded-2xl overflow-hidden border border-primary/10">
      {/* ── Municipality filter pills ── */}
      {showFilters && !isControlled && (
        <div className="bg-surface/90 backdrop-blur-md border-b border-primary/10 px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Filter size={13} className="text-muted shrink-0" />
            <span className="text-muted text-xs font-medium tracking-wide uppercase">
              Filter by Municipality
            </span>
            {selectedMunicipality !== 'All' && (
              <button
                onClick={() => setSelectedMunicipality('All')}
                className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>
          <div
            ref={filterScrollRef}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {MUNICIPALITIES.map((muni) => (
              <button
                key={muni}
                onClick={() => setSelectedMunicipality(muni)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap min-h-[32px] ${
                  selectedMunicipality === muni
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-900/40'
                    : 'bg-secondary text-muted border-primary/10 hover:bg-secondary hover:text-primary'
                }`}
              >
                {muni}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Map wrapper ── */}
      <div className="relative w-full flex-1" style={{ height }}>
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-forest-700 border-t-emerald-500 animate-spin" />
              <p className="text-muted text-sm">Loading map data…</p>
            </div>
          </div>
        )}

        <Map
          ref={mapRef}
          initialViewState={{
            longitude: CAVITE_CENTER.lng,
            latitude: CAVITE_CENTER.lat,
            zoom: 11
          }}
          mapStyle={theme === 'dark' ? CARTO_DARK_MATTER : CARTO_POSITRON}
          attributionControl={false}
        >
          {userLocationState && (
            <Marker longitude={userLocationState.lng} latitude={userLocationState.lat} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"></div>
                <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping pointer-events-none"></div>
              </div>
            </Marker>
          )}

          {filtered.map(r => {
            const lat = r.lat ?? r.latitude;
            const lng = r.lng ?? r.longitude;
            if (!lat || !lng) return null;

            const isSelected = popupInfo?.id === r.id || selectedRestaurantId === r.id;
            const ratingVal = r.average_rating || r.rating || 5.0;
            const bg = isSelected ? '#fbbf24' : '#10b981';
            const color = isSelected ? '#1e293b' : '#ffffff';

            return (
              <Marker
                key={r.id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(r);
                  if (onSelectRestaurant) onSelectRestaurant(r.id);
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer relative flex items-center justify-center shadow-lg"
                  style={{
                    background: bg,
                    color: color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #0f172a',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: isSelected ? '0 0 12px rgba(251,191,36,0.6)' : '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  ★ {Number(ratingVal).toFixed(1)}
                </motion.div>
                <div 
                  className="mx-auto w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                  style={{ borderTopColor: bg, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}
                />
              </Marker>
            );
          })}

          <AnimatePresence>
            {popupInfo && (
              <Popup
                anchor="bottom"
                longitude={popupInfo.lng ?? popupInfo.longitude}
                latitude={popupInfo.lat ?? popupInfo.latitude}
                offset={[0, -28]}
                onClose={() => setPopupInfo(null)}
                closeOnClick={false}
                className="premium-map-popup"
                maxWidth="220px"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/20 rounded-xl overflow-hidden shadow-2xl p-2.5 font-body text-left w-[220px]"
                >
                  <div className="h-20 w-full relative mb-2">
                    <img 
                      src={popupInfo.primary_image || popupInfo.cover_image_url || FOOD_PLACEHOLDER} 
                      className="w-full h-full object-cover rounded-lg"
                      alt={popupInfo.name}
                    />
                  </div>
                  <div className="flex gap-1.5 mb-1 flex-wrap">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full">{popupInfo.municipality_name || popupInfo.municipality || 'Cavite'}</span>
                    {popupInfo.cuisine_type && <span className="bg-slate-500/20 text-slate-300 text-[9px] px-2 py-0.5 rounded-full">{popupInfo.cuisine_type}</span>}
                  </div>
                  <h4 className="m-0 text-[14px] font-bold text-white leading-tight truncate mb-1">{popupInfo.name}</h4>
                  <p className="m-0 text-[10px] text-slate-400 truncate mb-2">{popupInfo.address}</p>
                  
                  <div className="flex gap-2 mt-1">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${popupInfo.lat ?? popupInfo.latitude},${popupInfo.lng ?? popupInfo.longitude}`} 
                      target="_blank" rel="noreferrer"
                      className="flex-1 text-center bg-slate-800 border border-emerald-500/30 hover:bg-slate-700 text-emerald-400 transition-colors py-1.5 rounded-lg text-[11px] font-bold"
                    >
                      Directions
                    </a>
                    <a 
                      href={`/restaurant/${popupInfo.id}`}
                      className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white transition-colors py-1.5 rounded-lg text-[11px] font-bold"
                    >
                      Details
                    </a>
                  </div>
                </motion.div>
              </Popup>
            )}
          </AnimatePresence>
        </Map>

        {/* ── Map controls overlay ──────────────────────────────────────────── */}
        <div className="absolute bottom-4 right-4 z-[999] flex flex-col gap-2">
          {/* Geolocation button */}
          <button
            onClick={handleGeolocate}
            disabled={geoLoading}
            title="Go to my location"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-900/90 backdrop-blur-sm border border-primary/10 text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            {geoLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation size={18} />
            )}
          </button>
        </div>

        {/* Geo error toast */}
        {geoError && (
          <div className="absolute bottom-4 left-4 z-[999] bg-red-900/90 text-red-200 text-xs px-3 py-2 rounded-lg border border-red-700/50 backdrop-blur-sm flex items-center gap-2 max-w-[220px]">
            <X size={12} className="shrink-0" />
            {geoError}
            <button onClick={() => setGeoError('')} className="ml-auto hover:text-white">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Result count badge */}
        <div className="absolute top-3 left-3 z-[999]">
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-sm border border-primary/10 rounded-full px-3 py-1.5 shadow">
            <MapPin size={12} className="text-emerald-400" />
            <span className="text-white text-xs font-semibold">
              {filtered.length}{' '}
              <span className="text-slate-400 font-normal">
                {filtered.length === 1 ? 'place' : 'places'}
                {selectedMunicipality !== 'All' ? ` in ${selectedMunicipality}` : ' in Cavite'}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .premium-map-popup .maplibregl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .premium-map-popup .maplibregl-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
