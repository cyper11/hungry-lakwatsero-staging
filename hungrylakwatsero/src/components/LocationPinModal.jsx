import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import { MapPin, X, Check, Navigation, AlertCircle } from 'lucide-react';
import { CARTO_DARK_MATTER, CARTO_POSITRON } from '../utils/mapStyle';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const CAVITE_BOUNDS = {
  sw: { lat: 13.9, lng: 120.58 },
  ne: { lat: 14.65, lng: 121.35 },
};
const CAVITE_CENTER = { lat: 14.2456, lng: 120.8787 };

const MUNICIPALITY_REGIONS = [
  { name: 'Tagaytay City',     bounds: { n: 14.14, s: 14.09, e: 120.99, w: 120.93 } },
  { name: 'Kawit',             bounds: { n: 14.46, s: 14.42, e: 120.91, w: 120.88 } },
  { name: 'Imus City',         bounds: { n: 14.44, s: 14.40, e: 120.96, w: 120.91 } },
  { name: 'Bacoor City',       bounds: { n: 14.49, s: 14.43, e: 120.99, w: 120.93 } },
  { name: 'Dasmariñas City',   bounds: { n: 14.36, s: 14.30, e: 120.97, w: 120.91 } },
  { name: 'Silang',            bounds: { n: 14.26, s: 14.20, e: 121.01, w: 120.95 } },
  { name: 'General Trias',     bounds: { n: 14.40, s: 14.36, e: 120.91, w: 120.85 } },
  { name: 'Cavite City',       bounds: { n: 14.50, s: 14.46, e: 120.92, w: 120.88 } },
  { name: 'Indang',            bounds: { n: 14.22, s: 14.17, e: 120.90, w: 120.84 } },
  { name: 'Alfonso',           bounds: { n: 14.16, s: 14.11, e: 120.88, w: 120.83 } },
  { name: 'Amadeo',            bounds: { n: 14.19, s: 14.14, e: 120.95, w: 120.90 } },
  { name: 'Trece Martires',    bounds: { n: 14.30, s: 14.26, e: 120.88, w: 120.84 } },
  { name: 'Naic',              bounds: { n: 14.33, s: 14.29, e: 120.79, w: 120.74 } },
  { name: 'Carmona',           bounds: { n: 14.33, s: 14.29, e: 121.06, w: 121.02 } },
  { name: 'Rosario',           bounds: { n: 14.43, s: 14.39, e: 120.86, w: 120.82 } },
  { name: 'Noveleta',          bounds: { n: 14.44, s: 14.41, e: 120.90, w: 120.87 } },
];

function detectMunicipality(lat, lng) {
  for (const m of MUNICIPALITY_REGIONS) {
    if (lat >= m.bounds.s && lat <= m.bounds.n && lng >= m.bounds.w && lng <= m.bounds.e) {
      return m.name;
    }
  }
  if (lat >= CAVITE_BOUNDS.sw.lat && lat <= CAVITE_BOUNDS.ne.lat &&
      lng >= CAVITE_BOUNDS.sw.lng && lng <= CAVITE_BOUNDS.ne.lng) {
    return 'Cavite Province';
  }
  return null;
}

export default function LocationPinModal({ isOpen, onClose, onConfirm, restaurantCoords }) {
  const { theme } = useTheme();
  const [pinned, setPinned] = useState(null);
  const [label, setLabel] = useState('');
  const [outsideWarning, setOutsideWarning] = useState(false);
  const mapRef = useRef(null);

  const handleMapClick = (e) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    const muni = detectMunicipality(lat, lng);
    
    if (!muni) {
      setOutsideWarning(true);
      setTimeout(() => setOutsideWarning(false), 3000);
      return;
    }
    
    handlePin({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)), municipality: muni });
  };

  const handlePin = ({ lat, lng, municipality }) => {
    setOutsideWarning(false);
    setPinned({ lat, lng, municipality });
    setLabel(municipality);
    
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
    }
  };

  const handleMarkerDragEnd = (e) => {
    const newLat = e.lngLat.lat;
    const newLng = e.lngLat.lng;
    const newMuni = detectMunicipality(newLat, newLng);
    if (newMuni) {
      setPinned({ lat: parseFloat(newLat.toFixed(6)), lng: parseFloat(newLng.toFixed(6)), municipality: newMuni });
      setLabel(newMuni);
    } else {
      setOutsideWarning(true);
      setTimeout(() => setOutsideWarning(false), 3000);
    }
  };

  const handleUseRestaurant = () => {
    if (!restaurantCoords?.lat) return;
    const { lat, lng } = restaurantCoords;
    const municipality = detectMunicipality(lat, lng) || 'Cavite Province';
    handlePin({ lat, lng, municipality });
  };

  const handleConfirm = () => {
    if (!pinned) return;
    onConfirm({ ...pinned, label: label || pinned.municipality });
    onClose();
  };

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setPinned(null);
      setLabel('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 bg-background/85 backdrop-blur-md">
      <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MapPin size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-primary text-base">Pin Location</h3>
              <p className="text-muted text-xs">Click anywhere in Cavite to drop your pin</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary p-1.5 rounded-xl hover:bg-secondary transition">
            <X size={18} />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: 340 }}>
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: CAVITE_CENTER.lng,
              latitude: CAVITE_CENTER.lat,
              zoom: 11
            }}
            mapStyle={theme === 'dark' ? CARTO_DARK_MATTER : CARTO_POSITRON}
            attributionControl={false}
            onClick={handleMapClick}
            maxBounds={[
              [CAVITE_BOUNDS.sw.lng - 0.5, CAVITE_BOUNDS.sw.lat - 0.5], 
              [CAVITE_BOUNDS.ne.lng + 0.5, CAVITE_BOUNDS.ne.lat + 0.5]
            ]}
          >
            {pinned && (
              <Marker
                longitude={pinned.lng}
                latitude={pinned.lat}
                draggable
                onDragEnd={handleMarkerDragEnd}
                anchor="bottom"
              >
                <motion.div 
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="cursor-move relative flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div className="w-1.5 h-3 bg-slate-900 rounded-b-md -mt-1"></div>
                </motion.div>
              </Marker>
            )}
          </Map>

          {/* Cavite boundary overlay hint */}
          <div className="absolute top-3 left-3 z-[1000] bg-background/80 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-primary/10">
            <span className="text-muted text-[11px] font-semibold flex items-center gap-1">
              <MapPin size={10} className="text-emerald-400" /> Cavite Province Only
            </span>
          </div>

          {/* Outside warning */}
          {outsideWarning && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-rose-500/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-500/40">
              <span className="text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} /> Please pin within Cavite Province
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-primary/10 space-y-3">
          {pinned ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
              <MapPin size={15} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-emerald-300 text-xs font-bold">{pinned.municipality}</p>
                <p className="text-muted text-[11px]">{pinned.lat}, {pinned.lng}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted text-xs text-center py-1">No location pinned yet — click the map above</p>
          )}

          <div className="space-y-1.5">
            <label className="input-label">Location Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Our Main Branch, Event Venue..."
              className="input-green text-sm"
            />
          </div>

          <div className="flex gap-2">
            {restaurantCoords?.lat && (
              <button onClick={handleUseRestaurant} className="btn-secondary text-xs py-2 px-4">
                <Navigation size={13} /> Use Restaurant Location
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!pinned}
              className={`btn-primary text-xs py-2 px-5 flex-1 ${!pinned ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Check size={13} /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
