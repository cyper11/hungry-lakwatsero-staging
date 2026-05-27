// Leaflet Map Logic

let map = null;
let markersLayer = null;
let routeLayers = [];

// Initialize Map
function initPreviewMap() {
  if (map) return;

  map = L.map('leaflet-map-element', {
    center: [14.2811, 120.9168], // Cavite
    zoom: 11
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  updateMapMarkers();
}

function updateMapMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  const createCustomIcon = (color = '#10b981') => {
    return L.divIcon({
      html: `<div class="marker-pulse" style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5)"></div>`,
      className: 'marker-dot',
      iconSize: [14, 14]
    });
  };

  state.restaurants.forEach(r => {
    if (r.status !== 'approved') return;

    const marker = L.marker([r.latitude, r.longitude], {
      icon: createCustomIcon('#10b981')
    });

    marker.bindPopup(`
      <div class="text-xs text-slate-100 p-1">
        <h4 class="font-bold text-brand-500">${r.name}</h4>
        <p class="text-[10px] text-slate-400 mt-0.5">${r.address}</p>
        <div class="flex gap-1.5 mt-2">
          <button onclick="viewRestaurantDetails(${r.id})" class="px-2 py-1 bg-brand-500 text-slate-950 font-bold rounded text-[9px]">View Profile</button>
          <button onclick="drawPreviewRoute([${r.latitude}, ${r.longitude}])" class="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded text-[9px]">Route</button>
        </div>
      </div>
    `);
    markersLayer.addLayer(marker);
  });
}

function clearRouteLayers() {
  routeLayers.forEach(layer => layer.remove());
  routeLayers = [];
}

function drawPreviewRoute(endLatLng) {
  if (!map) return;
  clearRouteLayers();

  const start = [14.4449, 120.9064]; // simulated GPS user location (Kawit Plaza)
  
  const userIcon = L.divIcon({
    html: `<div class="marker-pulse-user" style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5)"></div>`,
    className: 'marker-dot-user',
    iconSize: [14, 14]
  });
  
  const userMarker = L.marker(start, { icon: userIcon }).addTo(map)
    .bindPopup('<div class="text-[10px] text-slate-100 font-bold p-1">Your Location (Kawit Plaza)</div>')
    .openPopup();
  routeLayers.push(userMarker);

  // Glowing route visual helper
  const glowPolyline = L.polyline([start, endLatLng], {
    color: '#3b82f6',
    weight: 8,
    opacity: 0.25
  }).addTo(map);
  routeLayers.push(glowPolyline);

  const mainPolyline = L.polyline([start, endLatLng], {
    color: '#3b82f6',
    weight: 3,
    dashArray: '5, 5'
  }).addTo(map);
  routeLayers.push(mainPolyline);

  const bounds = L.latLngBounds([start, endLatLng]);
  map.fitBounds(bounds, { padding: [50, 50] });
  alert('Routing calculated from Kawit Plaza to restaurant marker!');
}
