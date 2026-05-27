import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import {
  Search, MapPin, X, Star, Navigation, 
  ChevronLeft, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MUNICIPALITIES = [
  'All', 'Tagaytay', 'Imus', 'Bacoor', 'Dasmariñas', 'Silang', 'Trece Martires',
  'General Trias', 'Kawit', 'Rosario', 'Naic', 'Tanza', 'Indang', 'Amadeo',
  'Alfonso', 'Noveleta', 'Carmona', 'GMA', 'Cavite City', 'Mendez', 'Maragondon',
  'Ternate', 'Magallanes',
];

const CUISINE_TYPES = [
  'Filipino', 'Seafood', 'Farm-to-Table', 'Café & Brunch', 'Grill & BBQ',
  'Caviteño', 'Fusion', 'Street Food', 'Fine Dining', 'Vegetarian',
];

const CAVITE_CENTER = { lat: 14.2456, lng: 120.8787 };
const FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75&auto=format&fit=crop';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MapExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [municipality, setMunicipality] = useState(searchParams.get('municipality') || 'All');
  const [selectedCuisines, setSelectedCuisines] = useState(() => {
    const c = searchParams.get('cuisine');
    return c ? c.split(',').filter(Boolean) : [];
  });
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating')) || 0);
  
  // ── Data state
  const [allRestaurants, setAllRestaurants] = useState([]);
  
  // ── Map State
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  
  // ── UI State
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [unclusteredPoints, setUnclusteredPoints] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: CAVITE_CENTER.lng,
    latitude: CAVITE_CENTER.lat,
    zoom: 11
  });

  // ── Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/restaurants', { timeout: 6000 });
        setAllRestaurants(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load restaurants", err);
      }
    };
    fetchData();
  }, []);

  // ── Filter Data
  const filteredRestaurants = useMemo(() => {
    let list = allRestaurants;
    
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(r => 
        r.name?.toLowerCase().includes(q) ||
        r.cuisine_type?.toLowerCase().includes(q) ||
        r.municipality_name?.toLowerCase().includes(q)
      );
    }
    if (municipality && municipality !== 'All') {
      list = list.filter(r => {
        const m1 = r.municipality_name?.toLowerCase() || '';
        const m2 = municipality.toLowerCase();
        return m1 === m2 || (m2 === 'gma' && (m1.includes('mariano alvarez') || m1 === 'gma'));
      });
    }
    if (selectedCuisines.length > 0) {
      list = list.filter(r => selectedCuisines.some(c => r.cuisine_type?.toLowerCase().includes(c.toLowerCase())));
    }
    if (minRating > 0) {
      list = list.filter(r => (r.average_rating || 0) >= minRating);
    }
    return list;
  }, [allRestaurants, debouncedSearch, municipality, selectedCuisines, minRating]);

  // ── GeoJSON Source
  const geojsonSource = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: filteredRestaurants.map(r => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [r.lng || r.longitude, r.lat || r.latitude]
        },
        properties: { ...r }
      }))
    };
  }, [filteredRestaurants]);

  // ── URL Sync
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (municipality !== 'All') params.municipality = municipality;
    if (selectedCuisines.length) params.cuisine = selectedCuisines.join(',');
    if (minRating) params.minRating = String(minRating);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, municipality, selectedCuisines, minRating, setSearchParams]);

  // ── Extract Unclustered Features for React Markers
  const updateUnclusteredFeatures = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (!map || !map.isStyleLoaded()) return;

    try {
      const features = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
      const uniqueMap = new Map();
      features.forEach(f => {
        if (f.properties && f.properties.id && !uniqueMap.has(f.properties.id)) {
          uniqueMap.set(f.properties.id, {
            ...f.properties,
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1]
          });
        }
      });
      setUnclusteredPoints(Array.from(uniqueMap.values()));
    } catch (e) {
      // ignore
    }
  }, []);

  // ── Map Click Handlers
  const handleMapClick = (event) => {
    const map = mapRef.current.getMap();
    if (!map) return;
    
    // Check for cluster click
    const clusters = map.queryRenderedFeatures(event.point, { layers: ['clusters'] });
    if (clusters.length > 0) {
      const clusterId = clusters[0].properties.cluster_id;
      const source = map.getSource('restaurants');
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: clusters[0].geometry.coordinates,
          zoom: zoom + 1,
          duration: 500
        });
      });
      return;
    }

    // Close preview if clicking on empty map
    const unclustered = map.queryRenderedFeatures(event.point, { layers: ['unclustered-point'] });
    if (unclustered.length === 0) {
      setSelectedRestaurant(null);
    }
  };

  const handleMarkerClick = (e, restaurant) => {
    e.originalEvent.stopPropagation();
    setSelectedRestaurant(restaurant);
    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [restaurant.lng, restaurant.lat],
        zoom: Math.max(mapRef.current.getZoom(), 14),
        offset: [0, 100], 
        duration: 800
      });
    }
  };

  // ── Geolocation
  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([longitude, latitude]);
        setGeoLoading(false);
        if (mapRef.current) {
          mapRef.current.easeTo({
            center: [longitude, latitude],
            zoom: 13,
            duration: 1500
          });
        }
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  const clearFilters = () => {
    setSearch('');
    setMunicipality('All');
    setSelectedCuisines([]);
    setMinRating(0);
  };

  const activeFilterCount = (search ? 1 : 0) + (municipality !== 'All' ? 1 : 0) + selectedCuisines.length + (minRating > 0 ? 1 : 0);

  // ── Render
  return (
    <div className="relative w-full h-dvh sm:h-screen overflow-hidden bg-[#060f09]">
      
      {/* ── Background Map ── */}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={e => setViewState(e.viewState)}
          onMoveEnd={updateUnclusteredFeatures}
          onIdle={updateUnclusteredFeatures}
          onClick={handleMapClick}
          mapStyle={MAP_STYLE}
          minZoom={9}
          maxZoom={18}
          attributionControl={false}
          interactiveLayerIds={['clusters', 'unclustered-point']}
          style={{ width: '100%', height: '100%' }}
        >
          <Source 
            id="restaurants" 
            type="geojson" 
            data={geojsonSource}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer 
              id="clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': '#10b981',
                'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 30],
                'circle-stroke-width': 3,
                'circle-stroke-color': 'rgba(16, 185, 129, 0.3)',
                'circle-opacity': 0.95
              }}
            />
            <Layer 
              id="cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': '{point_count_abbreviated}',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 14
              }}
              paint={{ 'text-color': '#ffffff' }}
            />
            <Layer 
              id="unclustered-point"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-radius': 15,
                'circle-color': 'transparent',
                'circle-stroke-width': 0
              }}
            />
          </Source>

          {unclusteredPoints.map(r => {
            const isSelected = selectedRestaurant?.id === r.id;
            const rating = r.average_rating || 5.0;
            return (
              <Marker
                key={r.id}
                longitude={r.lng}
                latitude={r.lat}
                anchor="bottom"
                onClick={(e) => handleMarkerClick(e, r)}
                style={{ zIndex: isSelected ? 100 : 10 }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  className={`relative flex items-center justify-center cursor-pointer shadow-lg transition-colors
                    ${isSelected ? 'bg-amber-400 text-[#060f09]' : 'bg-[#060f09] text-white hover:bg-emerald-600'}
                  `}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: `1.5px solid ${isSelected ? '#f59e0b' : 'rgba(52, 211, 153, 0.4)'}`,
                    boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.5)' : '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                >
                  <span className="text-[12px] font-bold flex items-center gap-1">
                    <Star size={10} className={isSelected ? 'fill-[#060f09]' : 'fill-emerald-400 text-emerald-400'} />
                    {Number(rating).toFixed(1)}
                  </span>
                  <div 
                    className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                    style={{ borderTopColor: isSelected ? '#fbbf24' : '#060f09' }}
                  />
                </motion.div>
              </Marker>
            );
          })}

          {userLocation && (
            <Marker longitude={userLocation[0]} latitude={userLocation[1]}>
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"></div>
                <div className="absolute w-14 h-14 bg-blue-500/30 rounded-full animate-ping pointer-events-none"></div>
              </div>
            </Marker>
          )}

        </Map>
      </div>

      {/* ── Overlay UI: Top Navigation / Search ── */}
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none p-4 md:p-6 flex justify-between items-start">
        
        {/* Floating Panel: Left */}
        <div className="pointer-events-auto flex flex-col gap-4 max-w-sm w-full">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-ultra border border-emerald-500/20 text-white w-max hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} className="text-emerald-400" />
            <span className="font-display font-bold text-sm tracking-wide">HungryLakwatsero</span>
          </Link>

          <div className="glass-ultra rounded-2xl border border-emerald-500/20 p-2 shadow-2xl flex items-center">
            <div className="px-3">
              <Search size={18} className="text-emerald-400" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Cavite eats..."
              className="bg-transparent border-none text-white focus:ring-0 w-full outline-none font-medium text-sm placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-2 text-gray-400 hover:text-white transition">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="hidden md:flex flex-col gap-3 glass-ultra rounded-2xl border border-emerald-500/20 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-emerald-400" /> Filters
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-[10px] text-gray-400 hover:text-rose-400 transition">
                  Clear All
                </button>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">Municipality</label>
              <select 
                value={municipality} 
                onChange={e => setMunicipality(e.target.value)}
                className="w-full bg-[#060f09]/60 border border-emerald-500/20 rounded-lg text-white text-xs p-2 outline-none focus:border-emerald-500/50"
              >
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">Cuisine</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin">
                {CUISINE_TYPES.map(c => {
                  const active = selectedCuisines.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCuisines(prev => active ? prev.filter(x => x !== c) : [...prev, c])}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border transition ${
                        active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="mt-2 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-300">
              <MapPin size={12} className="text-emerald-400" />
              Showing <strong className="text-white">{filteredRestaurants.length}</strong> places
            </div>
          </div>
          
          <button 
            onClick={() => setFilterPanelOpen(true)}
            className="md:hidden glass-ultra border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-white text-sm font-bold shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-emerald-400" /> 
              Filters
            </div>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-500 text-[#060f09] px-2 rounded-full text-xs">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="pointer-events-auto flex flex-col gap-3">
          <button 
            onClick={handleNearMe}
            className="w-12 h-12 glass-ultra border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-all shadow-2xl"
            title="Near Me"
          >
            {geoLoading ? <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <Navigation size={20} />}
          </button>
        </div>

      </div>

      {/* ── Overlay UI: Floating Restaurant Preview Card ── */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="glass-ultra rounded-3xl border border-emerald-500/30 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.15)] flex flex-col relative overflow-hidden group">
              
              <button 
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-[#060f09]/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 border border-white/20 transition"
              >
                <X size={14} />
              </button>

              <div className="h-40 w-full rounded-2xl overflow-hidden relative">
                <img 
                  src={selectedRestaurant.primary_image || selectedRestaurant.cover_image_url || FOOD_PLACEHOLDER} 
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060f09] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="bg-emerald-500/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} /> {selectedRestaurant.municipality_name || selectedRestaurant.municipality}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-display font-bold text-white leading-tight">{selectedRestaurant.name}</h3>
                  <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 shrink-0">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-amber-400 font-bold text-xs">{Number(selectedRestaurant.average_rating || 5).toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-xs mb-4 line-clamp-1">
                  {selectedRestaurant.cuisine_type || 'Local Restaurant'} • {selectedRestaurant.address}
                </p>

                <div className="flex gap-2">
                  <Link 
                    to={`/restaurant/${selectedRestaurant.id}`}
                    className="flex-1 btn-cinematic py-2.5 text-sm rounded-xl text-center"
                  >
                    View Details
                  </Link>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.lat || selectedRestaurant.latitude},${selectedRestaurant.lng || selectedRestaurant.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="btn-ghost-premium py-2.5 px-4 text-sm rounded-xl flex items-center justify-center"
                    title="Get Directions"
                  >
                    <Navigation size={16} />
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlay UI: Mobile Filter Drawer ── */}
      <AnimatePresence>
        {filterPanelOpen && (
          <div className="md:hidden fixed inset-0 z-[100] flex flex-col pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFilterPanelOpen(false)}
              className="absolute inset-0 bg-[#060f09]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative mt-auto h-[75vh] glass-ultra rounded-t-3xl border-t border-emerald-500/20 p-5 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-emerald-400" /> Filters
                </h2>
                <button onClick={() => setFilterPanelOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pb-8">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Municipality</label>
                  <select 
                    value={municipality} 
                    onChange={e => setMunicipality(e.target.value)}
                    className="w-full bg-[#060f09]/80 border border-emerald-500/20 rounded-xl text-white p-3 outline-none focus:border-emerald-500/50"
                  >
                    {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Cuisines</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_TYPES.map(c => {
                      const active = selectedCuisines.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedCuisines(prev => active ? prev.filter(x => x !== c) : [...prev, c])}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                            active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-gray-400 border-white/10'
                          }`}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Minimum Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setMinRating(n === minRating ? 0 : n)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
                          n <= minRating ? 'bg-amber-400/20 border-amber-400/40' : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Star size={16} className={n <= minRating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-auto flex gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="btn-secondary flex-1 py-3.5 rounded-xl">Clear</button>
                )}
                <button onClick={() => setFilterPanelOpen(false)} className="btn-cinematic flex-[2] py-3.5 rounded-xl">
                  Show {filteredRestaurants.length} Places
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
