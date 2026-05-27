import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, Calendar, Landmark, Leaf, Coffee, Grid, 
  Plus, Minus, Crosshair, Navigation, MapPin, Heart, 
  CalendarDays, ChevronRight, Bookmark, Clock, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

function loadGoogleMaps(callback) {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  const existingScript = document.getElementById('googleMaps');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?v=weekly';
    script.id = 'googleMaps';
    script.async = true;
    script.defer = true;
    script.onload = () => { if (callback) callback(); };
    document.body.appendChild(script);
  } else {
    existingScript.addEventListener('load', callback);
  }
}

// Custom Premium Marker using SVG
const createPremiumMarkerUrl = (imageSrc) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="20" fill="#0a1a12" stroke="#10b981" stroke-width="2"/>
    <clipPath id="circleView">
      <circle cx="24" cy="24" r="18" />
    </clipPath>
    <image width="48" height="48" href="${imageSrc}" clip-path="url(#circleView)" preserveAspectRatio="xMidYMid slice" />
    <circle cx="24" cy="46" r="2" fill="#34d399" />
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const mapMarkers = [
  { id: 1, name: 'Tagaytay', lat: 14.1153, lng: 120.9621, img: 'https://images.unsplash.com/photo-1596404179374-2c70a3c7dd50?w=100&q=80', desc: 'Cool breeze & famous Bulalo.' },
  { id: 2, name: 'Silang', lat: 14.2310, lng: 120.9762, img: 'https://images.unsplash.com/photo-1505233159624-9b2447952eb0?w=100&q=80', desc: 'Farm-to-table dining & cafes.' },
  { id: 3, name: 'Kawit', lat: 14.4422, lng: 120.8980, img: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&q=80', desc: 'Aguinaldo Shrine & seafood.' },
  { id: 4, name: 'Alfonso', lat: 14.1403, lng: 120.8567, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&q=80', desc: 'Hidden organic farms.' },
  { id: 5, name: 'Ternate', lat: 14.2858, lng: 120.7222, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80', desc: 'Beaches and nature trails.' },
  { id: 6, name: 'Naic', lat: 14.3167, lng: 120.7625, img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=100&q=80', desc: 'Heritage churches.' },
  { id: 7, name: 'Tanza', lat: 14.3947, lng: 120.8497, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&q=80', desc: 'Historical spots & local eats.' },
];

export default function DashboardHero() {
  const [activeCategory, setActiveCategory] = useState('Food Spots');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 27, h: 14, m: 36, s: 8 });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    loadGoogleMaps(() => setMapsLoaded(true));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Init Map
  useEffect(() => {
    if (mapsLoaded && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 14.2456, lng: 120.8787 },
        zoom: 11,
        styles: darkMapStyle,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        backgroundColor: '#030a06',
        disableDefaultUI: true
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Add Markers
      mapMarkers.forEach(m => {
        const marker = new window.google.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map: mapInstance.current,
          icon: {
            url: createPremiumMarkerUrl(m.img),
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 48)
          }
        });

        marker.addListener("click", () => {
          const content = `
            <div style="width: 200px; background: #0a1a12; padding: 12px; font-family: sans-serif; color: white;">
              <h4 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">${m.name}</h4>
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 12px 0;">${m.desc}</p>
              <button style="width: 100%; background: #10b981; color: white; border: none; padding: 6px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                Explore Area
              </button>
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);
      });
    }
  }, [mapsLoaded]);

  const handleZoomIn = () => mapInstance.current?.setZoom(mapInstance.current.getZoom() + 1);
  const handleZoomOut = () => mapInstance.current?.setZoom(mapInstance.current.getZoom() - 1);
  const handleMyLocation = () => {
    if (mapInstance.current) {
      mapInstance.current.panTo({ lat: 14.2456, lng: 120.8787 });
      mapInstance.current.setZoom(11);
    }
  };

  const categories = [
    { name: 'Food Spots', icon: Utensils },
    { name: 'Events', icon: Calendar },
    { name: 'Heritage', icon: Landmark },
    { name: 'Nature', icon: Leaf },
    { name: 'Cafes', icon: Coffee },
    { name: 'View All', icon: Grid },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[750px]">
        
        {/* ─── LEFT SIDEBAR (2 cols) ─── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="text-emerald-400 font-bold text-xs tracking-widest uppercase mb-4 pl-2">Explore Cavite</h3>
            <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 min-w-[140px] lg:min-w-0 shrink-0
                      ${isActive 
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white' 
                        : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-gray-300 hover:text-white'
                      }`}
                  >
                    <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                    <span className="text-sm font-bold">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── CENTER MAP (7 cols) ─── */}
        <div className="lg:col-span-7 h-[500px] lg:h-full relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] bg-[#030a06]">
          {/* Subtle grid background to look like a radar/dashboard */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] z-0 pointer-events-none mix-blend-screen"></div>
          
          <div ref={mapRef} className="w-full h-full z-10" />

          {/* Map Controls */}
          <div className="absolute left-4 bottom-4 z-[1000] flex flex-col gap-2">
            <div className="bg-[#0a1a12]/80 backdrop-blur-md border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)] flex flex-col">
              <button onClick={handleZoomIn} className="p-2.5 text-white hover:bg-emerald-500/20 transition-colors border-b border-emerald-500/20"><Plus size={18} /></button>
              <button onClick={handleZoomOut} className="p-2.5 text-white hover:bg-emerald-500/20 transition-colors"><Minus size={18} /></button>
            </div>
            <button onClick={handleMyLocation} className="bg-[#0a1a12]/80 backdrop-blur-md border border-emerald-500/30 rounded-xl p-2.5 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2">
              <Crosshair size={18} /> <span className="text-xs font-bold hidden md:inline">My Location</span>
            </button>
          </div>

          {/* Glowing Map Overlay for Cavite Region Effect (mock effect) */}
          <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_80px_#030a06]"></div>

          {/* Floating Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-[#0a1a12]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 hidden md:block">
            <h4 className="text-xs font-bold text-gray-400 mb-3 tracking-wider uppercase">Map Legend</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div><span className="text-xs text-white">Food Spots</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></div><span className="text-xs text-white">Events</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></div><span className="text-xs text-white">Heritage</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div><span className="text-xs text-white">Nature</span></div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR (3 cols) ─── */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          
          {/* Featured Event Card */}
          <div className="bg-[#0a1a12]/60 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
            
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Featured Event</span>
            <h3 className="text-xl font-display font-bold text-white mb-2">Pahimis Festival 2026</h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <CalendarDays size={14} className="text-emerald-500" /> May 15 – 17, 2026
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <MapPin size={14} className="text-emerald-500" /> Amadeo, Cavite
            </div>
            
            <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-white/10">
              <img src="https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=400&q=80" alt="Festival" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            
            <div className="flex gap-2 mb-4">
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-2 rounded-xl transition-colors">Join Event</button>
              <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2 rounded-xl transition-colors">Get Directions</button>
              <button className="w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-500 rounded-xl transition-colors"><Bookmark size={14} /></button>
            </div>
            
            {/* Countdown */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              {Object.entries(timeLeft).map(([label, val]) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold text-emerald-400 font-display">{String(val).padStart(2, '0')}</div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-500">{label === 'd' ? 'Days' : label === 'h' ? 'Hrs' : label === 'm' ? 'Mins' : 'Secs'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0a1a12]/60 backdrop-blur-md border border-white/10 rounded-3xl p-5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Quick Actions</span>
            <div className="flex flex-col gap-3">
              {[
                { icon: Navigation, title: 'Near Me', desc: 'Find food & events nearby', color: 'bg-emerald-500', iconColor: 'text-white' },
                { icon: MapPin, title: 'Get Directions', desc: 'Plan your next adventure', color: 'bg-amber-500', iconColor: 'text-white' },
                { icon: Heart, title: 'Saved Places', desc: 'View your favorites', color: 'bg-rose-500', iconColor: 'text-white' },
                { icon: Calendar, title: 'Join an Event', desc: "See what's happening", color: 'bg-purple-500', iconColor: 'text-white' },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-2xl transition-colors text-left w-full">
                  <div className={`w-10 h-10 rounded-full ${action.color} shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon size={18} className={action.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{action.title}</h4>
                    <p className="text-[10px] text-gray-400">{action.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <div className="bg-[#0a1a12]/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-4 lg:mb-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Trending Now</span>
            <div className="flex flex-col gap-4">
              {[
                { title: 'Best Bulalo Spots in Cavite', places: '8 places', img: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?w=100&q=80' },
                { title: 'Hidden Cafes You Should Try', places: '10 places', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&q=80' },
                { title: 'Heritage Churches in Cavite', places: '12 places', img: 'https://images.unsplash.com/photo-1548625361-ec8537ed19eb?w=100&q=80' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.places}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .gm-style .gm-style-iw-c {
          background: #0a1a12 !important;
          border-radius: 12px !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          padding: 0 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .gm-style .gm-style-iw-tc::after {
          background: #0a1a12 !important;
          border-right: 1px solid rgba(16, 185, 129, 0.2);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
  );
}
