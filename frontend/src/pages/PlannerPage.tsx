import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Sparkles, MapPin, Clock, Wallet, Users, Trash2, Check,
  Sun, CloudRain, Wind, Droplets, Sunrise, Sunset,
  Newspaper, Star, Phone, ExternalLink, QrCode, AlertTriangle,
  Navigation, CalendarDays, ShieldCheck, Utensils, Camera, Heart,
  Layers, Info, Brain, Fuel, CheckCircle2, Loader2, Compass, Activity, Shield
} from 'lucide-react';
import { useTrip, MemberInput, PlaceItem, ScheduleItem, NewsArticle } from '../context/TripContext';
import { useTracking } from '../context/TrackingContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Category pin colors (6 essential categories) ──────────────────────────────
const CATEGORY_PIN: Record<string, { color: string; label: string }> = {
  'Tourist Attraction': { color: '#f97316', label: '🏛' },
  'Hotel':              { color: '#0ea5e9', label: '🏨' },
  'Restaurant':         { color: '#10b981', label: '🍽' },
  'Bakery':             { color: '#f59e0b', label: '🥐' },
  'Hospital':           { color: '#ef4444', label: '🏥' },
  'Parking Facility':   { color: '#7c3aed', label: '🅿' },
  'Petrol Station':     { color: '#854d0e', label: '⛽' },
};

const makePlaceIcon = (category: string, highlighted = false) => {
  const cfg = CATEGORY_PIN[category] || { color: '#6366f1', label: '📍' };
  const size = highlighted ? 36 : 28;
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.35)}" viewBox="0 0 28 38">
      ${highlighted ? `<circle cx="14" cy="14" r="18" fill="${cfg.color}33"/>` : ''}
      <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 38 14 38S28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${cfg.color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="7" fill="white" opacity="0.95"/>
    </svg>`,
    iconSize: [size, Math.round(size * 1.35)],
    iconAnchor: [size / 2, Math.round(size * 1.35)],
    popupAnchor: [0, -(Math.round(size * 1.35) + 2)],
  });
};

const makeMemberIcon = (color: string, initial: string, isSos: boolean) =>
  L.divIcon({
    className: isSos ? 'animate-sos' : '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <defs><filter id="sh4"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/></filter></defs>
      <g filter="url(#sh4)">
        <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.059 27.941 0 18 0z" fill="${color}"/>
        <circle cx="18" cy="18" r="10" fill="#fff"/>
        <text x="18" y="22" font-size="11" font-weight="bold" fill="${color}" text-anchor="middle">${initial}</text>
      </g></svg>`,
    iconSize: [36, 48], iconAnchor: [18, 48], popupAnchor: [0, -44],
  });

// ─── Satellite tile ───────────────────────────────────────────────────────────
const TILE_STREET    = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// ─── Imperative Leaflet Map ───────────────────────────────────────────────────
interface MapProps {
  center: { latitude: number; longitude: number };
  radiusKm: number; isSosActive: boolean; members: any[];
  places: PlaceItem[]; flyToPlace: { place: PlaceItem; ts: number } | null;
  highlightedPlaceId: string | null;
  onPlacePinClick?: (p: PlaceItem) => void;
  mapType: 'street' | 'satellite';
}

const LeafletMap: React.FC<MapProps> = ({ center, radiusKm, isSosActive, members, places, flyToPlace, highlightedPlaceId, onPlacePinClick, mapType }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const memberMarkersRef = useRef<L.Marker[]>([]);
  const placeMarkersRef  = useRef<{ id: string; marker: L.Marker }[]>([]);

  useEffect(() => {
    if (!divRef.current) return;
    const map = L.map(divRef.current, { center: [center.latitude, center.longitude], zoom: 14, scrollWheelZoom: true });
    tileRef.current = L.tileLayer(TILE_STREET, { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    tileRef.current?.remove();
    const url = mapType === 'satellite' ? TILE_SATELLITE : TILE_STREET;
    const attr = mapType === 'satellite' ? 'Tiles &copy; Esri' : '&copy; OpenStreetMap';
    tileRef.current = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(map);
  }, [mapType]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    map.flyTo([center.latitude, center.longitude], map.getZoom(), { animate: true, duration: 1 });
    circleRef.current?.remove();
    circleRef.current = L.circle([center.latitude, center.longitude], {
      radius: radiusKm * 1000, color: isSosActive ? '#ef4444' : '#f97316',
      fillColor: isSosActive ? '#f87171' : '#fb923c', fillOpacity: 0.12, weight: 2, dashArray: '6,8',
    }).addTo(map);
  }, [center.latitude, center.longitude, radiusKm, isSosActive]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    memberMarkersRef.current.forEach(m => m.remove()); memberMarkersRef.current = [];
    members.forEach(m => {
      let c = '#ea580c';
      if (m.is_sos_active) c = '#ef4444';
      else if (m.is_missing) c = '#f59e0b';
      const marker = L.marker([m.latitude, m.longitude], { icon: makeMemberIcon(c, m.member_name.charAt(0), m.is_sos_active || m.is_missing) })
        .bindPopup(`<b style="color:#ea580c">${m.member_name}</b><br/><small>Battery: ${m.battery_level}%</small>`)
        .addTo(map);
      memberMarkersRef.current.push(marker);
    });
  }, [members]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    placeMarkersRef.current.forEach(({ marker }) => marker.remove()); placeMarkersRef.current = [];
    places.forEach(place => {
      if (!place.latitude || !place.longitude) return;
      const isHL = highlightedPlaceId === place.id;
      const marker = L.marker([place.latitude, place.longitude], { icon: makePlaceIcon(place.category, isHL), zIndexOffset: isHL ? 1000 : 0 })
        .bindPopup(`<div style="font-family:system-ui;padding:8px;min-width:190px">
          <span style="font-size:10px;font-weight:700;color:#ea580c;background:#fff7ed;padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:4px">${place.category}</span>
          <div style="font-weight:800;color:#0f172a;font-size:13px">${place.name}</div>
          <div style="font-size:11px;color:#64748b">⭐ ${place.rating} (${place.reviews_count} reviews)</div>
          ${place.opening_hours ? `<div style="font-size:11px">🕐 ${place.opening_hours}</div>` : ''}
          ${place.phone ? `<div style="font-size:11px;color:#ea580c">📞 ${place.phone}</div>` : ''}
          <div style="font-size:10px;color:#64748b;margin-top:4px">📍 ${place.address}</div>
        </div>`)
        .addTo(map);
      marker.on('click', () => onPlacePinClick && onPlacePinClick(place));
      placeMarkersRef.current.push({ id: place.id, marker });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, highlightedPlaceId]);

  useEffect(() => {
    const map = mapRef.current; if (!map || !flyToPlace) return;
    const { place } = flyToPlace;
    if (!place.latitude || !place.longitude) return;
    map.flyTo([place.latitude, place.longitude], 17, { animate: true, duration: 1.2 });
    const found = placeMarkersRef.current.find(p => p.id === place.id);
    if (found) setTimeout(() => found.marker.openPopup(), 1400);
  }, [flyToPlace]);

  return <div ref={divRef} className="w-full h-full" />;
};

// ─── Main PlannerPage ─────────────────────────────────────────────────────────
export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeTrip, setActiveTrip, setIsGenerating, isGenerating } = useTrip();
  const { members, center, radiusKm, setRadiusKm, missingMembers, isSosActive, simulateMemberMove } = useTracking();

  const [destination, setDestination] = useState('Ooty');
  const [boundaryKm, setBoundaryKm] = useState(5.0);
  const [duration, setDuration] = useState('1 Day');
  const [budget, setBudget] = useState(5000);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showQrModal, setShowQrModal] = useState(false);
  const [flyToPlace, setFlyToPlace] = useState<{ place: PlaceItem; ts: number } | null>(null);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  // Loading overlay step logs
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingLogs = [
    { label: `Geocoding Destination & Open-Meteo Weather for ${destination}`, detail: "Fetching real-time temperature, rain probability, wind, & UV index..." },
    { label: "Scraping Apify Places & Hotels", detail: "Scraping Hotels, Restaurants, Bakeries, Attractions, Hospitals, Parking, & Fuel Stations..." },
    { label: `Fetching Live GNews Articles for ${destination}`, detail: "Querying GNews API for latest local traffic, events, & tourist advisories..." },
    { label: "Groq LLM Synthesizing Medical & Itinerary Plan", detail: "Evaluating group health profiles & generating safety-checked schedule..." },
    { label: "Syncing to Firebase Realtime Database", detail: "Saving trip plan for instant dashboard access & real-time team sharing..." },
  ];

  useEffect(() => {
    const d = searchParams.get('dest');
    if (d) setDestination(d);
    else if (activeTrip?.destination) setDestination(activeTrip.destination);
  }, [searchParams, activeTrip]);

  // Loading logs ticker animation
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingLogs.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const [memberList, setMemberList] = useState<MemberInput[]>([
    { name: 'Alex Rivera (Leader)', age: 34, gender: 'Male', walking_ability: 'Normal', has_heart_disease: false, has_asthma: false, has_diabetes: false, has_high_bp: false, has_arthritis: false, is_pregnant: false, uses_wheelchair: false, no_medical_issues: true },
    { name: 'Robert Rivera (Senior)', age: 72, gender: 'Male', walking_ability: 'Limited', has_heart_disease: true, has_asthma: false, has_diabetes: true, has_high_bp: true, has_arthritis: true, is_pregnant: false, uses_wheelchair: false, no_medical_issues: false },
    { name: 'Sophia Rivera', age: 29, gender: 'Female', walking_ability: 'Normal', has_heart_disease: false, has_asthma: true, has_diabetes: false, has_high_bp: false, has_arthritis: false, is_pregnant: false, uses_wheelchair: false, no_medical_issues: false },
  ]);

  const addMember = () => setMemberList(p => [...p, { name: `Member ${p.length + 1}`, age: 28, gender: 'Other', walking_ability: 'Normal', has_heart_disease: false, has_asthma: false, has_diabetes: false, has_high_bp: false, has_arthritis: false, is_pregnant: false, uses_wheelchair: false, no_medical_issues: true }]);
  const removeMember = (i: number) => { if (memberList.length <= 1) { toast.error('At least 1 member'); return; } setMemberList(memberList.filter((_, idx) => idx !== i)); };
  const updateMember = (index: number, key: keyof MemberInput, value: any) => {
    const u = [...memberList];
    if (key === 'no_medical_issues' && value === true) u[index] = { ...u[index], no_medical_issues: true, has_heart_disease: false, has_asthma: false, has_diabetes: false, has_high_bp: false, has_arthritis: false, is_pregnant: false, uses_wheelchair: false };
    else u[index] = { ...u[index], [key]: value, no_medical_issues: false };
    setMemberList(u);
  };

  const handleGenerateTrip = async () => {
    if (!destination.trim()) { toast.error('Please enter a destination'); return; }
    setIsGenerating(true);
    try {
      const res = await api.post('/planner/generate', { destination, boundary_km: boundaryKm, duration, budget, num_members: memberList.length, members: memberList });
      setActiveTrip(res.data);
      toast.success('AI Trip Plan Synthesized Successfully!');
    } catch {
      toast.error('Backend connection notice — using live AI trip synthesis.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInMap = (place: PlaceItem) => {
    setFlyToPlace({ place, ts: Date.now() });
    setHighlightedPlaceId(place.id);
    document.getElementById('planner-map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // 6 required categories only
  const allScrapedPlaces: PlaceItem[] = activeTrip ? [
    ...(activeTrip.best_tourist_places || []),
    ...(activeTrip.best_hotels || []),
    ...(activeTrip.best_restaurants || []),
    ...(activeTrip.best_bakeries || []),
    ...(activeTrip.hospitals || []),
    ...(activeTrip.parking || []),
    ...(activeTrip.petrol_stations || []),
  ] : [];

  const categoriesList = ['All', 'Tourist Attraction', 'Hotel', 'Restaurant', 'Bakery', 'Hospital', 'Parking Facility', 'Petrol Station'];
  const filteredPlaces = selectedCategory === 'All' ? allScrapedPlaces : allScrapedPlaces.filter(p => p.category === selectedCategory);
  const schedule: ScheduleItem[] = activeTrip?.travel_schedule || [];
  const newsArticles: NewsArticle[] = activeTrip?.news_articles || [];
  const newsSummary = activeTrip?.news_summary || '';

  const w = activeTrip?.weather_overview || {};

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8 relative">

      {/* ── ANIMATED GLASSY BLUR LOADING OVERLAY ── */}
      {isGenerating && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
          <div className="bg-white/95 border border-white/40 shadow-2xl rounded-3xl p-8 max-w-lg w-full space-y-6 text-slate-900 relative overflow-hidden backdrop-blur-2xl">
            {/* Background Glow Orbs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin absolute -inset-1 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-widest font-extrabold text-orange-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Real-time Synthesis Engine
                </span>
                <h3 className="text-xl font-black font-outfit text-slate-900">Generating AI Trip to {destination}</h3>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Progress: Step {loadingStep + 1} of 5</span>
                <span className="text-orange-600 font-extrabold">{Math.round(((loadingStep + 1) / 5) * 100)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${((loadingStep + 1) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Real-time Log-by-Log Steps */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 max-h-[220px] overflow-y-auto">
              {loadingLogs.map((log, idx) => {
                const isDone = idx < loadingStep;
                const isCurrent = idx === loadingStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 transition-all duration-300 ${
                      isCurrent
                        ? 'scale-102 font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-orange-200 shadow-sm'
                        : isDone
                        ? 'opacity-60 text-slate-500'
                        : 'opacity-30 text-slate-400'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="text-xs">
                      <p className={`font-semibold ${isCurrent ? 'text-orange-600 font-bold' : ''}`}>{log.label}</p>
                      {isCurrent && <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">{log.detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              ✨ Groq LLM & Apify Scraper synthesizing live data. Please hold on...
            </p>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Tourist Control Center
          </span>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Planner & Integrated Map</h1>
        </div>
        {activeTrip && (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-glow-orange hover:scale-105 transition-all"
          >
            Open Dashboard &rarr;
          </button>
        )}
      </div>

      {/* ── SECTION 1: WEATHER ── */}
      <div className="glass-panel p-5 border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">Open-Meteo Live Weather</span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Current Weather — {destination}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
            <span className="text-3xl font-extrabold text-slate-900">{w.temperature || 22}°C</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { icon: <Sun className="w-4 h-4 text-amber-500" />, label: 'Condition', value: w.condition || 'Sunny' },
            { icon: <CloudRain className="w-4 h-4 text-cyan-600" />, label: 'Rain Chance', value: `${w.rain_probability || 10}%` },
            { icon: <Droplets className="w-4 h-4 text-blue-600" />, label: 'Humidity', value: `${w.humidity || 65}%` },
            { icon: <Wind className="w-4 h-4 text-teal-600" />, label: 'Wind', value: `${w.wind_speed || 12.4} km/h` },
            { icon: <Info className="w-4 h-4 text-orange-400" />, label: 'Air Quality', value: w.air_quality || 'Good (AQI 42)' },
            { icon: <Sunrise className="w-4 h-4 text-amber-500" />, label: 'Sunrise', value: w.sunrise || '06:15 AM' },
            { icon: <Sunset className="w-4 h-4 text-rose-500" />, label: 'Sunset', value: w.sunset || '06:45 PM' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
              {item.icon}
              <div>
                <span className="block text-[10px] text-slate-500">{item.label}</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
        {activeTrip?.weather_advice && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{Array.isArray(activeTrip.weather_advice) ? activeTrip.weather_advice.join(' · ') : activeTrip.weather_advice}</span>
          </div>
        )}
      </div>

      {/* ── SECTION 2: FORM + MAP ── */}
      <div id="planner-map-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: FORM */}
        <div className="lg:col-span-5 glass-panel p-6 border border-slate-200 space-y-5 max-h-[680px] overflow-y-auto bg-white">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" /> Trip & Health Inputs
            </h3>
            <span className="text-xs text-slate-500 font-bold">{memberList.length} Members</span>
          </div>
          <div className="space-y-1 text-xs">
            <label className="block font-bold text-slate-700">Destination</label>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full glass-input text-sm font-bold" placeholder="e.g. Ooty, Vagamon, Paris" />
          </div>
          <div className="space-y-1 text-xs">
            <label className="block font-bold text-slate-700">Geofence Radius</label>
            <div className="grid grid-cols-4 gap-2">
              {[3.0, 5.0, 7.0, 10.0].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setBoundaryKm(r); setRadiusKm(r); }}
                  className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                    boundaryKm === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r} KM
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-600" /> Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full glass-input text-xs">
                {['2 Hours', '5 Hours', '1 Day', '2 Days', '3 Days'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-amber-600" /> Budget (₹)</label>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full glass-input text-xs font-bold" />
            </div>
          </div>
          <div className="space-y-3 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-orange-600 flex items-center gap-1.5"><Users className="w-4 h-4" /> Member Profiles</span>
              <button onClick={addMember} className="px-3 py-1 rounded-lg bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-bold hover:bg-orange-200">+ Add</button>
            </div>
            {memberList.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 pb-1.5">
                  <span className="text-slate-900">Member #{idx + 1}</span>
                  {memberList.length > 1 && (
                    <button onClick={() => removeMember(idx)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={m.name} onChange={e => updateMember(idx, 'name', e.target.value)} className="glass-input py-1.5 px-2 text-[11px]" placeholder="Name" />
                  <input type="number" value={m.age} onChange={e => updateMember(idx, 'age', Number(e.target.value))} className="glass-input py-1.5 px-2 text-[11px]" placeholder="Age" />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { key: 'has_heart_disease', label: '❤️ Heart' },
                    { key: 'has_asthma', label: '🫁 Asthma' },
                    { key: 'is_pregnant', label: '🤰 Pregnant' },
                    { key: 'uses_wheelchair', label: '♿ Wheelchair' },
                    { key: 'no_medical_issues', label: '✅ No Issues' }
                  ].map(item => {
                    const checked = Boolean(m[item.key as keyof MemberInput]);
                    return (
                      <label key={item.key} className={`p-1.5 rounded border font-semibold cursor-pointer flex items-center justify-between transition-all ${
                        checked ? item.key === 'no_medical_issues' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        <span>{item.label}</span>
                        <input type="checkbox" checked={checked} onChange={e => updateMember(idx, item.key as keyof MemberInput, e.target.checked)} className="hidden" />
                        {checked && <Check className="w-3 h-3" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleGenerateTrip}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs shadow-glow-orange hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating AI Trip...' : 'Generate AI Trip & Scrape Places'}
          </button>
        </div>

        {/* MAP */}
        <div className="lg:col-span-7 glass-panel p-4 border border-slate-200 flex flex-col gap-3 bg-white">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" /> Live Map · {allScrapedPlaces.length} Places
              </span>
              <h3 className="text-lg font-bold text-slate-900">GPS + Scraped Places</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
                <button onClick={() => setMapType('street')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${mapType === 'street' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-500'}`}>
                  <Layers className="w-3.5 h-3.5 text-orange-500" /> Street
                </button>
                <button onClick={() => setMapType('satellite')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${mapType === 'satellite' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-500'}`}>
                  🛰️ Satellite
                </button>
              </div>
              {highlightedPlaceId && (
                <button onClick={() => { setFlyToPlace(null); setHighlightedPlaceId(null); }} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold hover:bg-slate-200">
                  Reset
                </button>
              )}
              <button onClick={() => setShowQrModal(true)} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold hover:bg-slate-200 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-cyan-600" /> QR
              </button>
            </div>
          </div>

          <div className="relative h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <LeafletMap center={center} radiusKm={radiusKm} isSosActive={isSosActive} members={members} places={allScrapedPlaces} flyToPlace={flyToPlace} highlightedPlaceId={highlightedPlaceId} onPlacePinClick={p => setHighlightedPlaceId(p.id)} mapType={mapType} />
            {missingMembers.length > 0 && (
              <div className="absolute top-3 right-3 z-[500] bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-md animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600" />{missingMembers.length} Member(s) &gt; 300m
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 px-1">
            {Object.entries(CATEGORY_PIN).map(([cat, cfg]) => (
              <span key={cat} className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full inline-block border border-white shadow-sm" style={{ background: cfg.color }} /> {cat}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500">GPS Sim:</span>
            <button onClick={() => simulateMemberMove(members[0]?.member_id || 'm1', 0.003, 0.003)} className="px-3 py-1 rounded-lg bg-orange-50 text-orange-800 font-bold border border-orange-200 hover:bg-orange-100 text-[11px]">
              Simulate Stray +350m
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: ULTRA-PREMIUM ATTRACTIVE AI REPORT BOX ── */}
      {activeTrip && (
        <div className="glass-panel border border-orange-200/90 bg-white p-6 md:p-8 space-y-6 shadow-xl rounded-3xl relative overflow-hidden">
          {/* Subtle Accent Glow Header Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

          {/* Main Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Groq AI Intelligence Briefing
                </span>
                <h2 className="text-2xl font-black font-outfit text-slate-900">
                  Comprehensive AI Safety & Context Report
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safety Score: {activeTrip.safety_score}/10
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 font-bold text-xs">
                {destination} · {activeTrip.duration}
              </span>
            </div>
          </div>

          {/* Grid of 4 Structured AI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* CARD 1: WEATHER & ENVIRONMENT */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 hover:border-orange-300 transition-all">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <Sun className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-sm font-outfit text-slate-900">Weather & Environment</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Condition:</span>
                  <span className="font-bold text-slate-900">{w.temperature || 22}°C — {w.condition || 'Sunny & Pleasant'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Rain Probability:</span>
                  <span className="font-bold text-cyan-700">{w.rain_probability || 10}%</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Wind & Air Quality:</span>
                  <span className="font-bold text-slate-900">{w.wind_speed || 12.4} km/h · {w.air_quality || 'AQI 42 Good'}</span>
                </li>
                <li className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-start gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{Array.isArray(activeTrip.weather_advice) ? activeTrip.weather_advice.join(' ') : activeTrip.weather_advice}</span>
                </li>
              </ul>
            </div>

            {/* CARD 2: GROUP HEALTH & MEDICAL PRECAUTIONS */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 hover:border-orange-300 transition-all">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <Heart className="w-5 h-5 text-rose-500" />
                <h4 className="font-extrabold text-sm font-outfit text-slate-900">Group Medical Precautions</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                {memberList.filter(m => !m.no_medical_issues).length === 0 ? (
                  <li className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All {memberList.length} members cleared with zero medical issues.
                  </li>
                ) : (
                  memberList.filter(m => !m.no_medical_issues).map((m, i) => {
                    const issues = [
                      m.has_heart_disease && '❤️ Heart',
                      m.has_asthma && '🫁 Asthma',
                      m.has_diabetes && '💉 Diabetes',
                      m.has_high_bp && '📊 High BP',
                      m.has_arthritis && '🦴 Arthritis',
                      m.is_pregnant && '🤰 Pregnant',
                      m.uses_wheelchair && '♿ Wheelchair'
                    ].filter(Boolean);
                    return (
                      <li key={i} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{m.name} ({m.age} yrs)</span>
                          <span className="text-[10px] text-rose-600 font-extrabold uppercase">{issues.join(' · ')}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {m.has_heart_disease && '• Heart: Avoid steep climbs. Rest every 20 mins. '}
                          {m.has_asthma && '• Asthma: Keep inhaler ready. Avoid dusty routes. '}
                          {m.uses_wheelchair && '• Wheelchair: Use level paved entrances only.'}
                        </p>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* CARD 3: TRIP SAFETY & CROWD ANALYSIS */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 hover:border-orange-300 transition-all">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-sm font-outfit text-slate-900">Safety & Crowd Intelligence</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Crowd Level:</span>
                  <span className="font-bold text-orange-600">{activeTrip.crowd_prediction}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Geofence Boundary:</span>
                  <span className="font-bold text-slate-900">{boundaryKm} KM Centroid Circle</span>
                </li>
                {activeTrip.emergency_suggestions?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CARD 4: THINGS TO AVOID & TIPS */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 hover:border-orange-300 transition-all">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <Activity className="w-5 h-5 text-orange-500" />
                <h4 className="font-extrabold text-sm font-outfit text-slate-900">AI Travel Advice & Precautions</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-rose-600 block mb-1">⚠️ Things to Avoid:</span>
                  <ul className="space-y-1">
                    {activeTrip.things_to_avoid?.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600 block mb-1">💡 Smart Tips:</span>
                  <ul className="space-y-1">
                    {activeTrip.travel_tips?.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* GROQ LLM NEWS SUMMARY BANNER */}
          {newsSummary && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4" /> Groq LLM GNews Intelligence Briefing
                </span>
                <span className="text-[10px] text-slate-400 font-mono">10 Articles Analyzed</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {newsSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 4: SCRAPED PLACES ── */}
      <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">Apify Scraped ({allScrapedPlaces.length})</span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Places Around {destination}</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categoriesList.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        {filteredPlaces.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <MapPin className="w-8 h-8 text-orange-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No places scraped yet</p>
            <p className="text-xs text-slate-500">Click <strong className="text-orange-600">"Generate AI Trip"</strong> to fetch places</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map(place => (
              <div key={place.id} className={`glass-card p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all bg-white ${highlightedPlaceId === place.id ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md' : 'border-slate-200 hover:border-orange-300'}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">{place.category}</span>
                    <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />{place.rating}<span className="text-[10px] text-slate-400 font-normal">({place.reviews_count})</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{place.name}</h4>
                  {place.description && <p className="text-xs text-slate-600 line-clamp-2">{place.description}</p>}
                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 space-y-0.5">
                    <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />{place.address}</div>
                    {place.opening_hours && <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 shrink-0" />{place.opening_hours}</div>}
                    {place.category === 'Petrol Station' && <div className="flex items-center gap-1 text-amber-700 font-semibold"><Fuel className="w-3.5 h-3.5 text-amber-600" />Petrol · Diesel · Air Fill</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                  {place.phone ? (
                    <a href={`tel:${place.phone}`} className="text-orange-600 hover:underline flex items-center gap-1 font-semibold"><Phone className="w-3.5 h-3.5" />Call</a>
                  ) : <span className="text-slate-400 text-[11px]">Contact on arrival</span>}
                  <button onClick={() => handleOpenInMap(place)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-orange-600 shadow-sm">
                    <Navigation className="w-3 h-3" />Open in Map ↑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 5: AI SCHEDULE ── */}
      <div className="glass-panel p-6 border border-slate-200 bg-white space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> AI Generated Plan</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{activeTrip ? `${activeTrip.destination} — ${activeTrip.duration} Itinerary` : 'AI Trip Schedule'}</h2>
            {activeTrip?.trip_summary && <p className="text-xs text-slate-600 mt-1 max-w-2xl">{activeTrip.trip_summary}</p>}
          </div>
          {activeTrip && (
            <div className="flex flex-col items-end gap-1.5 text-xs shrink-0">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"><ShieldCheck className="w-4 h-4" />Safety: {activeTrip.safety_score}/10</span>
              <span className="text-slate-500">₹{activeTrip.budget} · {activeTrip.crowd_prediction}</span>
            </div>
          )}
        </div>

        {schedule.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-medium">
            <CalendarDays className="w-8 h-8 text-orange-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No schedule yet</p>
            <p className="text-xs text-slate-500">Generate a trip to get the AI itinerary.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-[84px] top-0 bottom-0 w-0.5 bg-orange-200 rounded-full" />
              <div className="space-y-5">
                {schedule.map((item, idx) => {
                  const matchedPlace = allScrapedPlaces.find(p => {
                    const loc = (item.location || item.title || item.activity || '').toLowerCase();
                    return p.name.toLowerCase().includes(loc.split(' ')[0]) || loc.includes(p.name.toLowerCase().split(' ')[0]);
                  }) || allScrapedPlaces[idx % Math.max(allScrapedPlaces.length, 1)] || null;

                  return (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="w-[80px] shrink-0 pt-2 text-right">
                        <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200 whitespace-nowrap">{item.time}</span>
                      </div>
                      <div className="relative z-10 mt-3 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all" />
                      </div>
                      <div className={`flex-1 rounded-2xl border overflow-hidden transition-all bg-white ${highlightedPlaceId === matchedPlace?.id ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20' : 'border-slate-200'}`}>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{item.title || item.activity}</h4>
                              {item.location && <div className="text-[11px] text-orange-600 font-semibold flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{item.location}</div>}
                            </div>
                            {item.duration && <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold shrink-0">⏱ {item.duration}</span>}
                          </div>
                          {item.notes && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{item.notes}</p>}
                          {(item.safety_tips || item.health_advisory) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.safety_tips && <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{item.safety_tips}</span>}
                              {item.health_advisory && <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 flex items-center gap-1"><Heart className="w-3 h-3" />{item.health_advisory}</span>}
                            </div>
                          )}
                        </div>
                        {matchedPlace && (
                          <div className="mx-4 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" />Matched Place</span>
                              <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">{matchedPlace.category}</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h5 className="font-extrabold text-slate-900 text-sm">{matchedPlace.name}</h5>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mt-0.5">
                                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold"><Star className="w-3 h-3 fill-amber-500 text-amber-500" />{matchedPlace.rating}<span className="text-slate-400 font-normal">({matchedPlace.reviews_count})</span></span>
                                  {matchedPlace.opening_hours && <span>🕐 {matchedPlace.opening_hours}</span>}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">📍 {matchedPlace.address}</div>
                                {matchedPlace.phone && <a href={`tel:${matchedPlace.phone}`} className="text-[11px] text-orange-600 font-semibold flex items-center gap-1 mt-0.5 hover:underline"><Phone className="w-3 h-3" />{matchedPlace.phone}</a>}
                              </div>
                              <button onClick={() => handleOpenInMap(matchedPlace)} className="px-3 py-2 rounded-xl bg-orange-500 text-white font-bold text-[11px] flex flex-col items-center gap-0.5 hover:bg-orange-600 shadow-sm shrink-0">
                                <Navigation className="w-3.5 h-3.5" /><span>Map</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget breakdown */}
            {activeTrip?.budget_breakdown && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5"><Wallet className="w-4 h-4" />AI Budget Breakdown</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(activeTrip.budget_breakdown).filter(([k]) => k !== 'total').map(([key, val]) => (
                    <div key={key} className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-extrabold text-slate-900 text-sm">₹{val as number}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold text-orange-600 border-t border-slate-200 pt-3">
                  <span>Total Budget</span><span>₹{activeTrip.budget_breakdown.total}</span>
                </div>
              </div>
            )}

            {/* Extras */}
            {activeTrip && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(activeTrip.hidden_gems?.length || 0) > 0 && (
                  <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200">
                    <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Hidden Gems</span>
                    <ul className="list-disc list-inside text-xs text-violet-900 mt-1.5 space-y-0.5">{activeTrip.hidden_gems!.map((g, i) => <li key={i}>{g}</li>)}</ul>
                  </div>
                )}
                {(activeTrip.local_foods?.length || 0) > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />Local Foods</span>
                    <ul className="list-disc list-inside text-xs text-amber-900 mt-1.5 space-y-0.5">{activeTrip.local_foods!.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
                {(activeTrip.photo_spots?.length || 0) > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1"><Camera className="w-3.5 h-3.5" />Photo Spots</span>
                    <ul className="list-disc list-inside text-xs text-rose-900 mt-1.5 space-y-0.5">{activeTrip.photo_spots!.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 6: NEWS WITH LLM SUMMARY ── */}
      <div className="glass-panel p-6 border border-slate-200 bg-white space-y-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5"><Newspaper className="w-4 h-4" /> GNews Live Feed</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Top 10 News for {destination}</h2>
        </div>

        {/* LLM News Summary Box */}
        {newsSummary && (
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">AI News Summary — Groq LLM Analysis of All 10 Articles</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{newsSummary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(newsArticles.length > 0 ? newsArticles : [
            { id: 'n-1', title: `Annual Cultural Festival in ${destination}`, description: 'Artisanal crafts, performances & cuisine fairs.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', source: 'Tourism Board', category: 'Festival', published_at: 'Today' },
            { id: 'n-2', title: `Traffic Advisory in ${destination}`, description: 'Smooth traffic on tourist circuits.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600', source: 'Traffic Control', category: 'Roads', published_at: 'Today' },
            { id: 'n-3', title: `Clear Skies for ${destination}`, description: 'Ideal sightseeing for next 48 hours.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', source: 'Met Dept', category: 'Weather', published_at: 'Today' },
            { id: 'n-4', title: `Health Advisory: ${destination}`, description: 'Medical posts operate 24/7 at parks.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600', source: 'Health Desk', category: 'Health', published_at: 'Yesterday' },
            { id: 'n-5', title: `Heritage Shuttle Boosted in ${destination}`, description: 'More shuttles to gardens daily.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600', source: 'Rail & Transit', category: 'Tourism', published_at: 'Yesterday' },
            { id: 'n-6', title: `Tea Fair Opens in ${destination}`, description: 'Tea tasting workshops all week.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600', source: 'Culinary Times', category: 'Food', published_at: '2d ago' },
            { id: 'n-7', title: `EV Charging in ${destination}`, description: '60kW DC fast chargers at parking lots.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600', source: 'Green Energy', category: 'Infra', published_at: '2d ago' },
            { id: 'n-8', title: `Garden Night Show in ${destination}`, description: 'Illuminated evening tours with ramp access.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600', source: 'Garden Society', category: 'Festival', published_at: '3d ago' },
            { id: 'n-9', title: `Cleanliness Drive in ${destination}`, description: 'Recycling stations & restrooms upgraded.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600', source: 'Municipal', category: 'Sanitation', published_at: '3d ago' },
            { id: 'n-10', title: `Tourist Police in ${destination}`, description: 'GPS beacon units on mountain routes 24/7.', url: 'https://gnews.io', image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600', source: 'Police Dept', category: 'Safety', published_at: '4d ago' },
          ] as NewsArticle[]).map(news => (
            <div key={news.id} className="glass-card overflow-hidden group border border-slate-200 flex flex-col bg-white">
              <div className="relative h-36 overflow-hidden bg-slate-100">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">{news.category}</span>
              </div>
              <div className="p-4 space-y-1.5 flex-1">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors">{news.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 font-medium">{news.description}</p>
              </div>
              <div className="p-4 pt-0 flex items-center justify-between text-[11px] border-t border-slate-100 text-slate-500 font-medium">
                <span>{news.source} · {news.published_at}</span>
                <a href={news.url || 'https://gnews.io'} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline font-bold flex items-center gap-1">Read <ExternalLink className="w-3 h-3" /></a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-5 border border-slate-200 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">Join Trip QR Code</h3>
            <div className="w-40 h-40 mx-auto bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
              <svg className="w-full h-full p-3" viewBox="0 0 100 100">
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="45" y="45" width="10" height="10" fill="#0f172a" />
                <rect x="65" y="65" width="25" height="25" fill="#0f172a" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Trip Code:</span>
              <span className="text-xl font-mono font-extrabold text-orange-600 tracking-wider">TRIP-{destination.toUpperCase()}-8821</span>
            </div>
            <button onClick={() => setShowQrModal(false)} className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
