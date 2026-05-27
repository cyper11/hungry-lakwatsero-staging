import React, { useRef, useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import { Compass, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARTO_DARK_MATTER, CARTO_POSITRON } from '../utils/mapStyle';
import { useTheme } from '../context/ThemeContext';

const CAVITE_CENTER = { lat: 14.2811, lng: 120.9168 };

const MapContainer = ({ 
  restaurants = [], 
  selectedRestaurant = null, 
  onSelectRestaurant = null, 
  filterMunicipality = '', 
  filterCuisine = '' 
}) => {
  const { theme } = useTheme();
  const mapRef = useRef(null);
  
  const [userLocation, setUserLocation] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      if (filterMunicipality && r.municipality_name !== filterMunicipality) return false;
      if (filterCuisine && (!r.menuItems || !r.menuItems.some(i => i.category.toLowerCase().includes(filterCuisine.toLowerCase())))) {
        return false;
      }
      return true;
    });
  }, [restaurants, filterMunicipality, filterCuisine]);

  const locateUser = useCallback(() => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          mapRef.current.flyTo({
            center: [loc.lng, loc.lat],
            zoom: 13,
            duration: 2000
          });
        },
        (err) => {
          console.warn('Geolocation failed, falling back to simulated', err);
          const simulatedLocation = { lat: 14.4449, lng: 120.9064 };
          setUserLocation(simulatedLocation);
          mapRef.current.flyTo({
            center: [simulatedLocation.lng, simulatedLocation.lat],
            zoom: 13,
            duration: 2000
          });
        }
      );
    }
  }, []);

  // When selectedRestaurant changes via external prop, open popup and pan
  React.useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      setPopupInfo(selectedRestaurant);
      const lat = selectedRestaurant.latitude || selectedRestaurant.lat;
      const lng = selectedRestaurant.longitude || selectedRestaurant.lng;
      if (lat && lng) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
      }
    }
  }, [selectedRestaurant]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-2xl border border-primary/20 bg-background">
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
        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"></div>
              <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping pointer-events-none"></div>
            </div>
          </Marker>
        )}

        {/* Restaurant Markers */}
        {filteredRestaurants.map(r => {
          const lat = r.latitude || r.lat;
          const lng = r.longitude || r.lng;
          if (!lat || !lng) return null;
          
          const isSelected = popupInfo?.id === r.id;
          const markerColor = isSelected ? 'bg-amber-400' : 'bg-emerald-500';
          const shadowColor = isSelected ? 'rgba(251,191,36,0.6)' : 'rgba(16,185,129,0.6)';

          return (
            <Marker
              key={r.id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(r);
                if (onSelectRestaurant) onSelectRestaurant(r);
              }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="cursor-pointer relative z-0 flex flex-col items-center"
              >
                <div className={`w-6 h-6 rounded-full ${markerColor} border-2 border-slate-900 flex items-center justify-center`} style={{ boxShadow: `0 0 10px ${shadowColor}` }}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <div className="w-1 h-2 bg-slate-900 rounded-b-md -mt-0.5"></div>
              </motion.div>
            </Marker>
          );
        })}

        {/* Popup */}
        <AnimatePresence>
          {popupInfo && (
            <Popup
              anchor="bottom"
              longitude={popupInfo.longitude || popupInfo.lng}
              latitude={popupInfo.latitude || popupInfo.lat}
              offset={[0, -32]}
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
              className="premium-map-popup"
              maxWidth="240px"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl p-3 font-body text-left w-[220px]"
              >
                <h4 className="m-0 text-[15px] font-bold text-emerald-400 leading-tight mb-1">{popupInfo.name}</h4>
                <p className="m-0 text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2">{popupInfo.address}</p>
                <div className="text-[11px] mb-3 flex items-center gap-1">
                  <span className="text-amber-400">★</span> 
                  <span className="text-white font-bold">{popupInfo.average_rating ? Number(popupInfo.average_rating).toFixed(1) : 'New'}</span>
                  <span className="text-slate-400">({popupInfo.rating_count || 0} reviews)</span>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`/restaurant/${popupInfo.id}`}
                    className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white transition-colors py-1.5 rounded text-[11px] font-bold"
                  >
                    View Details
                  </a>
                </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>
      
      {/* Floating Map Controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={locateUser}
          className="p-3 bg-slate-900/90 hover:bg-emerald-600 text-slate-100 hover:text-white rounded-lg shadow-glass border border-slate-800 flex items-center justify-center transition duration-150"
          title="Detect Current Location"
        >
          <Navigation size={18} className="animate-pulse-subtle" />
        </button>
      </div>

      {/* Cavite Region Coverage Badge */}
      <div className="absolute top-4 left-4 z-[1000] px-3 py-1.5 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 shadow-glass flex items-center gap-1.5">
        <Compass size={12} className="text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Cavite Coverage Only</span>
      </div>
    </div>
  );
};

export default MapContainer;
