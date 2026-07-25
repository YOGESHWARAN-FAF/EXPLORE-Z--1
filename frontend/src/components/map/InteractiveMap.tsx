import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceItem, RouteCheckpoint, useTrip } from '../../context/TripContext';
import { MapPin, Navigation, Car, Coffee, Hotel, Utensils, Shield, Zap, Sparkles } from 'lucide-react';

const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {
  "Tourist Attraction": { color: "#FFBA00", label: "Attraction" },
  "Scenic Viewpoint & Waterfall": { color: "#38bdf8", label: "Viewpoint" },
  "Temple & Heritage": { color: "#c084fc", label: "Heritage" },
  "Hotel": { color: "#38bdf8", label: "Hotel" },
  "Lodge & Resort": { color: "#0284c7", label: "Resort" },
  "Restaurant": { color: "#4ade80", label: "Restaurant" },
  "Tea & Coffee Shop": { color: "#FFBA00", label: "Tea Stop" },
  "Bakery": { color: "#fb923c", label: "Bakery" },
  "Hospital": { color: "#f87171", label: "Hospital" },
  "Medical Shop": { color: "#ef4444", label: "Medical" },
  "Fuel Station": { color: "#eab308", label: "Fuel" },
  "EV Charging": { color: "#22c55e", label: "EV Charger" },
};

interface MapProps {
  height?: string;
  routeGeometry?: [number, number][];
  checkpoints?: RouteCheckpoint[];
  places?: PlaceItem[];
  travelMode?: string;
  isAnimated?: boolean;
}

export const InteractiveMap: React.FC<MapProps> = ({
  height = "550px",
  routeGeometry = [],
  checkpoints = [],
  places = [],
  travelMode = "Car",
  isAnimated = true,
}) => {
  const { selectedMapPlace } = useTrip();
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const destinationCircleRef = useRef<L.Circle | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const activePlaceMarkerRef = useRef<L.Marker | null>(null);
  const placeMarkersRef = useRef<L.Marker[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const [mapType, setMapType] = useState<"street" | "satellite">("street");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!divRef.current) return;

    const initialCenter: [number, number] = routeGeometry.length > 0 ? [routeGeometry[0][0], routeGeometry[0][1]] : [13.0827, 80.2707];
    const map = L.map(divRef.current, {
      center: initialCenter,
      zoom: 9,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Tile Layer Switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });

    const tileUrl = mapType === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attr = mapType === "satellite" ? "Tiles &copy; Esri" : "&copy; OpenStreetMap";

    L.tileLayer(tileUrl, { attribution: attr, maxZoom: 19 }).addTo(map);
  }, [mapType]);

  // Render Gold Polyline & Fit Bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || routeGeometry.length < 2) return;

    if (polylineRef.current) polylineRef.current.remove();

    const polyline = L.polyline(routeGeometry, {
      color: "#FFBA00",
      weight: 5,
      opacity: 0.95,
      dashArray: "10, 10",
      lineCap: "round",
    }).addTo(map);

    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  }, [routeGeometry]);

  // Render Checkpoint & POI Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    placeMarkersRef.current.forEach((m) => m.remove());
    placeMarkersRef.current = [];

    // Render Start and End Markers
    checkpoints.forEach((chk, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === checkpoints.length - 1;
      if (!isStart && !isEnd) return;
      if (chk.latitude == null || chk.longitude == null || !isFinite(chk.latitude) || !isFinite(chk.longitude)) return;

      const pinColor = isStart ? "#10b981" : "#ef4444";
      const pinLabel = isStart ? "START" : "END";

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: ${pinColor};
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>${pinLabel}</span>
        </div>`,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const marker = L.marker([chk.latitude, chk.longitude], { icon })
        .bindPopup(`<div style="font-family:system-ui;padding:6px;background:#000;color:#fff;border-radius:12px;">
          <div style="font-weight:900;color:${pinColor};font-size:12px;">${chk.name}</div>
          <div style="font-size:11px;color:#a1a1aa;margin-top:2px;">Route Milestone: <strong>${chk.km_mark} KM</strong></div>
        </div>`)
        .addTo(map);

      placeMarkersRef.current.push(marker);
    });

    // Render Scraped / Generated POI Markers
    places.forEach((place) => {
      if (place.latitude == null || place.longitude == null || !isFinite(place.latitude) || !isFinite(place.longitude)) return;
      const cfg = CATEGORY_COLORS[place.category] || { color: "#FFBA00", label: "POI" };

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: #000000;
          border: 2px solid ${cfg.color};
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.color};
          font-weight: 900;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        ">
          ★
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const popupHtml = `
        <div style="font-family:system-ui;padding:8px;min-width:190px;background:#000000;color:#ffffff;border-radius:14px;border:1px solid #27272a;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;">
            <span style="font-size:10px;font-weight:900;background:${cfg.color};color:#000;padding:2px 6px;border-radius:6px;">${place.category}</span>
            <span style="font-size:11px;font-weight:900;color:#FFBA00;">★ ${place.rating}</span>
          </div>
          <div style="font-weight:900;color:#ffffff;font-size:13px;margin-bottom:4px;">${place.name}</div>
          <div style="font-size:11px;color:#a1a1aa;margin-bottom:4px;">${place.address || ''}</div>
          ${place.phone ? `<div style="font-size:10px;color:#4ade80;font-weight:700;">📞 ${place.phone}</div>` : ""}
          ${place.opening_hours ? `<div style="font-size:10px;color:#FFBA00;font-weight:700;">🕒 ${place.opening_hours}</div>` : ""}
        </div>
      `;

      const marker = L.marker([place.latitude, place.longitude], { icon })
        .bindPopup(popupHtml)
        .addTo(map);

      placeMarkersRef.current.push(marker);
    });
  }, [checkpoints, places]);

  // Animated Vehicle Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || routeGeometry.length < 2 || !isAnimated) return;

    if (vehicleMarkerRef.current) vehicleMarkerRef.current.remove();

    const vehicleIcon = L.divIcon({
      className: "",
      html: `<div style="
        background: #000000;
        color: #FFBA00;
        border: 2px solid #FFBA00;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 4px 14px rgba(255, 186, 0, 0.45);
      ">
        ▶
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const vehicleMarker = L.marker(routeGeometry[0], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarkerRef.current = vehicleMarker;

    let ptIdx = 0;
    let progress = 0;

    const animateVehicle = () => {
      if (!isPlaying) return;

      progress += 0.015;
      if (progress >= 1.0) {
        progress = 0;
        ptIdx = (ptIdx + 1) % (routeGeometry.length - 1);
      }

      const p1 = routeGeometry[ptIdx];
      const p2 = routeGeometry[ptIdx + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * progress;
      const lng = p1[1] + (p2[1] - p1[1]) * progress;

      vehicleMarker.setLatLng([lat, lng]);

      animFrameRef.current = requestAnimationFrame(animateVehicle);
    };

    animFrameRef.current = requestAnimationFrame(animateVehicle);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [routeGeometry, travelMode, isAnimated, isPlaying]);

  // Camera Fly-To & Highlight on Selected Place
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedMapPlace) return;

    const { latitude, longitude, name, category, rating, address, phone } = selectedMapPlace;

    // Guard: skip if coordinates are invalid/undefined
    if (latitude == null || longitude == null || !isFinite(latitude) || !isFinite(longitude)) {
      console.warn('InteractiveMap: Skipping flyTo — invalid coordinates', { latitude, longitude, name });
      return;
    }

    map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });

    if (activePlaceMarkerRef.current) activePlaceMarkerRef.current.remove();

    const cfg = CATEGORY_COLORS[category] || { color: "#FFBA00", label: "POI" };

    const activeIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;background:${cfg.color};border-radius:50%;opacity:0.5;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="background:#000000;color:${cfg.color};border:3px solid ${cfg.color};border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;box-shadow:0 6px 16px rgba(255,186,0,0.4);z-index:10;">
          ★
        </div>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });

    const activeMarker = L.marker([latitude, longitude], { icon: activeIcon, zIndexOffset: 2000 })
      .bindPopup(`
        <div style="font-family:system-ui;padding:8px;min-width:210px;background:#000000;color:#ffffff;border-radius:14px;border:1px solid #FFBA00;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">
            <span style="font-size:10px;font-weight:900;background:${cfg.color};color:#000;padding:2px 8px;border-radius:10px;">${category}</span>
            <span style="font-size:11px;font-weight:900;color:#FFBA00;">★ ${rating}</span>
          </div>
          <div style="font-weight:900;color:#ffffff;font-size:14px;margin-bottom:4px;">${name}</div>
          <div style="font-size:11px;color:#a1a1aa;margin-bottom:4px;">${address || ''}</div>
          ${phone ? `<div style="font-size:10px;color:#4ade80;font-weight:700;">📞 ${phone}</div>` : ""}
        </div>
      `)
      .addTo(map);

    activePlaceMarkerRef.current = activeMarker;
    activeMarker.openPopup();
  }, [selectedMapPlace]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
      <div ref={divRef} className="w-full h-[380px] md:h-[540px]" />

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-black/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
        <button
          onClick={() => setMapType(mapType === "street" ? "satellite" : "street")}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-bold hover:border-[#FFBA00] transition cursor-pointer"
        >
          {mapType === "street" ? "Satellite Map" : "Street Map"}
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3.5 py-1.5 rounded-xl bg-[#FFBA00] text-black text-xs font-black hover:bg-[#FF9F00] transition cursor-pointer"
        >
          {isPlaying ? "Pause Route Motion" : "Play Route Motion"}
        </button>
      </div>
    </div>
  );
};
