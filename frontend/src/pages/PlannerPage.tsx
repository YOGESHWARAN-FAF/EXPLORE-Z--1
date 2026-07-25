import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Clock, Wallet, Users, Trash2, Check, Sparkles, Plus,
  Heart, AlertTriangle, ShieldCheck, Navigation, Car, Bike, Bus,
  Activity, Footprints, Shield, Loader2, ArrowRight, ArrowLeft, RefreshCw, Mountain, ShieldAlert, Newspaper, Calendar, Map as MapIcon
} from 'lucide-react';
import { useTrip, MemberInput } from '../context/TripContext';
import api from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SaaSCard } from '../components/ui/SaaSCard';
import { SaaSButton } from '../components/ui/SaaSButton';
import { SearchInput } from '../components/ui/SearchInput';
import { ModalOverlay } from '../components/ui/ModalOverlay';

const TRAVEL_MODES = [
  { id: 'Car', name: 'Car', icon: Car, desc: 'Fast & comfortable for long highway journeys' },
  { id: 'Bike', name: 'Bike', icon: Bike, desc: 'Thrill & freedom for scenic highway rides' },
  { id: 'Bus', name: 'Bus', icon: Bus, desc: 'Economical group transit & relaxed travel' },
  { id: 'Cycling', name: 'Cycling', icon: Activity, desc: 'Active eco fitness tour across scenic trails' },
  { id: 'Walking', name: 'Walking', icon: Footprints, desc: 'Leisure walking & heritage village exploration' },
];

const DURATIONS = [
  { id: 'Same Day', label: 'Same Day', desc: '1 Day express route tour' },
  { id: '2 Days', label: '2 Days', desc: 'Overnight 2-day getaway' },
  { id: '3 Days', label: '3 Days', desc: 'Extended 3-day exploration' },
  { id: '5 Days', label: '5 Days', desc: '5-day grand vacation' },
  { id: '1 Week', label: '1 Week', desc: 'Full 7-day comprehensive tour' },
];

const BUDGET_PRESETS = [
  { value: 5000, label: '₹5,000', badge: 'Economy' },
  { value: 10000, label: '₹10,000', badge: 'Standard (Popular)' },
  { value: 25000, label: '₹25,000', badge: 'Luxury' },
];

const MEDICAL_CONDITIONS = [
  { id: 'None', label: 'None', desc: 'No active medical conditions' },
  { id: 'Heart Disease', label: 'Heart Disease', desc: 'Avoid high altitude & long steep climbs' },
  { id: 'Asthma', label: 'Asthma', desc: 'Avoid dusty/industrial routes' },
  { id: 'Diabetes', label: 'Diabetes', desc: 'Low-sugar food recommendations' },
  { id: 'High BP', label: 'High BP', desc: 'Frequent rest breaks' },
  { id: 'Wheelchair', label: 'Wheelchair / Mobility', desc: 'Paved ramp accessibility' },
  { id: 'Pregnancy', label: 'Pregnancy', desc: 'Avoid rough unpaved roads' },
  { id: 'Arthritis', label: 'Arthritis', desc: 'Short walk segments only' },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveTrip, setSavedTrips } = useTrip();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [origin, setOrigin] = useState<string>('Chennai');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [showOriginDrop, setShowOriginDrop] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    toast.loading('Fetching high-precision device GPS coordinates...', { id: 'gps-locating' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let resolvedLocation = '';

        try {
          // 1. Try Nominatim Reverse Geocoding with English locale
          const nomRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            { timeout: 7000, headers: { 'Accept-Language': 'en' } }
          );

          const addr = nomRes.data?.address || {};
          const locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.residential || addr.road || '';
          const city = (addr.city || addr.town || addr.municipality || addr.county || addr.district || '').replace(/\s+District$/i, '');
          const state = addr.state || '';

          const parts = [locality, city, state].filter(Boolean);
          const unique = Array.from(new Set(parts));

          if (unique.length > 0) {
            resolvedLocation = unique.join(', ');
          } else if (nomRes.data?.display_name) {
            const rawParts = nomRes.data.display_name.split(',').map((s: string) => s.trim());
            resolvedLocation = rawParts.slice(0, 3).filter((p: string) => !/^\d{5,6}$/.test(p)).join(', ');
          }
        } catch (err) {
          console.warn('Nominatim reverse geocode attempt 1 failed:', err);
        }

        if (!resolvedLocation) {
          try {
            // 2. Fallback: BigDataCloud free client reverse geocoding API
            const bdcRes = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
              { timeout: 7000 }
            );
            const locality = bdcRes.data?.locality || bdcRes.data?.city || '';
            const state = bdcRes.data?.principalSubdivision || '';
            const country = bdcRes.data?.countryName || '';
            const parts = [locality, state, country].filter(Boolean);
            if (parts.length > 0) {
              resolvedLocation = parts.join(', ');
            }
          } catch (err) {
            console.warn('BigDataCloud reverse geocode attempt 2 failed:', err);
          }
        }

        if (!resolvedLocation) {
          resolvedLocation = `GPS (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
        }

        setOrigin(resolvedLocation);
        toast.success(`Live GPS Location Set: ${resolvedLocation}`, { id: 'gps-locating' });
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error('GPS permission denied or position unavailable.', { id: 'gps-locating' });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const [destination, setDestination] = useState<string>('Salem');
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showDestDrop, setShowDestDrop] = useState<boolean>(false);

  useEffect(() => {
    if (location.state?.origin) setOrigin(location.state.origin);
    if (location.state?.destination) setDestination(location.state.destination);
  }, [location.state]);

  const [travelMode, setTravelMode] = useState<string>('Car');
  const [duration, setDuration] = useState<string>('3 Days');
  const [budget, setBudget] = useState<number>(10000);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('');
  const [numMembers, setNumMembers] = useState<number>(2);
  const [members, setMembers] = useState<MemberInput[]>([
    { name: 'Traveler 1', age: 32, gender: 'Male', medical_issues: ['None'] },
    { name: 'Traveler 2 (Senior)', age: 64, gender: 'Female', medical_issues: ['Heart Disease'] },
  ]);

  const loadingLogs = [
    'Initializing AI Route Concierge...',
    `Geocoding origin (${origin}) & destination (${destination})...`,
    'Calculating optimal OSRM highway geometry & distance...',
    'Checking Firebase common POI cache for cross-user data...',
    'Fetching Open-Meteo weather forecasts along route...',
    'Sampling checkpoint places (attractions, hotels, medical)...',
    'Synthesizing Groq LLM personalized itinerary...',
    'Finalizing trip plan & saved state...'
  ];
  const [currentLogIndex, setCurrentLogIndex] = useState<number>(0);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setCurrentLogIndex((prev) => (prev < loadingLogs.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [isGenerating, loadingLogs.length]);

  useEffect(() => {
    if (!origin || origin.trim().length < 2) { setOriginSuggestions([]); return; }
    const timer = setTimeout(() => {
      api.get(`/location/autocomplete?query=${encodeURIComponent(origin)}`)
        .then((res) => {
          const raw = res.data?.suggestions || [];
          const seen = new Set();
          const deduped = raw.filter((item: any) => {
            const label = (item.name || item.display_name?.split(',')[0] || '').trim().toLowerCase();
            if (!label || seen.has(label)) return false;
            seen.add(label);
            return true;
          });
          setOriginSuggestions(deduped);
        })
        .catch(() => setOriginSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [origin]);

  useEffect(() => {
    if (!destination || destination.trim().length < 2) { setDestSuggestions([]); return; }
    const timer = setTimeout(() => {
      api.get(`/location/autocomplete?query=${encodeURIComponent(destination)}`)
        .then((res) => {
          const raw = res.data?.suggestions || [];
          const seen = new Set();
          const deduped = raw.filter((item: any) => {
            const label = (item.name || item.display_name?.split(',')[0] || '').trim().toLowerCase();
            if (!label || seen.has(label)) return false;
            seen.add(label);
            return true;
          });
          setDestSuggestions(deduped);
        })
        .catch(() => setDestSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const updateMember = (index: number, field: keyof MemberInput, value: any) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleMedicalCondition = (memberIndex: number, conditionId: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      const currentIssues = [...updated[memberIndex].medical_issues];
      if (conditionId === 'None') {
        updated[memberIndex].medical_issues = ['None'];
      } else {
        const filtered = currentIssues.filter((c) => c !== 'None');
        if (filtered.includes(conditionId)) {
          const next = filtered.filter((c) => c !== conditionId);
          updated[memberIndex].medical_issues = next.length === 0 ? ['None'] : next;
        } else {
          updated[memberIndex].medical_issues = [...filtered, conditionId];
        }
      }
      return updated;
    });
  };

  const handleGenerateTrip = async () => {
    if (!origin.trim() || !destination.trim()) {
      toast.error('Please specify both Starting Location and Destination!');
      return;
    }
    setIsGenerating(true);
    setCurrentLogIndex(0);

    const payload = {
      origin: origin.trim(),
      destination: destination.trim(),
      travel_mode: travelMode,
      duration: duration,
      budget: customBudgetInput ? parseInt(customBudgetInput, 10) : budget,
      members: members
    };

    try {
      const response = await api.post('/planner/generate', payload);
      const newTripData = response.data;

      if (!newTripData || !newTripData.trip_id) {
        throw new Error('Invalid trip plan payload returned from backend');
      }

      setActiveTrip(newTripData);
      setSavedTrips((prev) => [newTripData, ...prev.filter(t => t.trip_id !== newTripData.trip_id)]);

      toast.success(`Smart Route Plan Generated for ${destination}!`);
      setIsGenerating(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Trip plan generation error:', err);
      toast.error(err.response?.data?.detail || 'Failed to generate route plan. Using fallback dataset.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8 space-y-8 text-slate-900 bg-white min-h-screen">
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFBA00] text-black text-xs font-black shadow-sm">
            <Sparkles className="w-4 h-4 text-black" />
            <span>Step-by-Step AI Route Concierge</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-outfit text-slate-900 tracking-tight">
            Plan Your Driving Route & Checkpoint Stops
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Generate an animated OpenStreetMap driving route with POI checkpoints every 5–10 km, multi-day stay options, and health safety rules.
          </p>
        </div>

        {/* Wizard Steps Bar */}
        <SaaSCard className="p-4 md:p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all duration-300 ${
                  currentStep === step
                    ? 'bg-[#FFBA00] text-black shadow-lg shadow-[#FFBA00]/30 scale-110'
                    : currentStep > step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </button>
            ))}
          </div>
        </SaaSCard>

        <SaaSCard className="p-6 md:p-10 space-y-8 bg-white border border-slate-200 shadow-xl">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#FFBA00] uppercase tracking-wider">Step 1 of 6</div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900">Where are you starting your journey from?</h2>
                <p className="text-xs text-slate-500">Search starting city or address. Autocomplete powered by OpenStreetMap Nominatim.</p>
              </div>
              <div className="relative max-w-xl space-y-3">
                <SearchInput
                  icon={<MapPin className="w-5 h-5 text-[#FFBA00]" />}
                  value={origin}
                  onChange={(e) => { setOrigin(e.target.value); setShowOriginDrop(true); }}
                  onFocus={() => setShowOriginDrop(true)}
                  placeholder="e.g. Chennai, Bangalore, Mumbai"
                />
                <div className="flex items-center justify-start pt-1">
                  <SaaSButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFetchLiveLocation}
                    disabled={isLocating}
                    loading={isLocating}
                    icon={<Navigation className="w-4 h-4 text-[#FFBA00] fill-[#FFBA00]" />}
                  >
                    Use Current Live Location (Real Device GPS + Pincode)
                  </SaaSButton>
                </div>
                {showOriginDrop && originSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-left">
                    {Array.from(new Map(originSuggestions.map(item => [(item.name || item.display_name.split(',')[0]).trim().toLowerCase(), item])).values()).map((item, i) => (
                      <div key={i} onClick={() => { setOrigin(item.name || item.display_name.split(',')[0]); setShowOriginDrop(false); }} className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0">
                        <MapPin className="w-4 h-4 text-[#FFBA00] shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.name || item.display_name.split(',')[0]}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{item.display_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Chennai', 'Bangalore', 'Coimbatore', 'Mumbai', 'Hyderabad', 'Delhi'].map((city) => (
                  <button key={city} onClick={() => setOrigin(city)} className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-[#FFBA00] transition">
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#FFBA00] uppercase tracking-wider">Step 2 of 6</div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900">Where is your final destination?</h2>
                <p className="text-xs text-slate-500">Specify hill station, beach town, heritage city, or landmark.</p>
              </div>
              <div className="relative max-w-xl space-y-3">
                <SearchInput
                  icon={<MapPin className="w-5 h-5 text-[#FFBA00]" />}
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setShowDestDrop(true); }}
                  onFocus={() => setShowDestDrop(true)}
                  placeholder="e.g. Salem, Vagamon, Ooty, Munnar, Goa"
                />
                {showDestDrop && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-left">
                    {Array.from(new Map(destSuggestions.map(item => [(item.name || item.display_name.split(',')[0]).trim().toLowerCase(), item])).values()).map((item, i) => (
                      <div key={i} onClick={() => { setDestination(item.name || item.display_name.split(',')[0]); setShowDestDrop(false); }} className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0">
                        <MapPin className="w-4 h-4 text-[#FFBA00] shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.name || item.display_name.split(',')[0]}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{item.display_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Salem', 'Vagamon', 'Yercaud', 'Ooty', 'Munnar', 'Goa', 'Mysore'].map((dest) => (
                  <button key={dest} onClick={() => setDestination(dest)} className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-[#FFBA00] transition">
                    {dest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#FFBA00] uppercase tracking-wider">Step 3 of 6</div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900">Select Your Travel Vehicle / Mode</h2>
                <p className="text-xs text-slate-500">Speed, break intervals & route feasibility adapt based on vehicle choice.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRAVEL_MODES.map((mode) => {
                  const isSelected = travelMode === mode.id;
                  const IconComp = mode.icon;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => setTravelMode(mode.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                        isSelected
                          ? 'bg-[#FFBA00]/10 border-[#FFBA00] ring-2 ring-[#FFBA00]/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <IconComp className="w-6 h-6 text-[#FFBA00]" />
                        {isSelected && <Check className="w-5 h-5 text-[#FFBA00] stroke-[3]" />}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{mode.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{mode.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#FFBA00] uppercase tracking-wider">Step 4 of 6</div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900">How long will your trip last?</h2>
                <p className="text-xs text-slate-500">Multi-day itineraries generate daily morning, lunch, tea, & hotel schedules.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DURATIONS.map((dur) => {
                  const isSelected = duration === dur.id;
                  return (
                    <div
                      key={dur.id}
                      onClick={() => setDuration(dur.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                        isSelected
                          ? 'bg-[#FFBA00]/10 border-[#FFBA00] ring-2 ring-[#FFBA00]/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Clock className={`w-6 h-6 ${isSelected ? 'text-[#FFBA00]' : 'text-slate-400'}`} />
                        {isSelected && <Check className="w-5 h-5 text-[#FFBA00] stroke-[3]" />}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{dur.label}</h3>
                      <p className="text-xs text-slate-500 font-medium">{dur.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#FFBA00] uppercase tracking-wider">Step 5 of 6</div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900">What is your total estimated budget?</h2>
                <p className="text-xs text-slate-500">AI balances fuel, stay, food, & emergency reserve accordingly.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BUDGET_PRESETS.map((preset) => {
                  const isSelected = budget === preset.value;
                  return (
                    <div
                      key={preset.value}
                      onClick={() => { setBudget(preset.value); setCustomBudgetInput(''); }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                        isSelected
                          ? 'bg-[#FFBA00]/10 border-[#FFBA00] ring-2 ring-[#FFBA00]/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#FFBA00] uppercase tracking-wider">{preset.badge}</span>
                      <h3 className="font-black text-slate-900 text-2xl font-outfit">{preset.label}</h3>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#FFBA00] uppercase tracking-wider">Step 6 of 6</div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900">Group Members & Medical Health Rules</h2>
                <p className="text-xs text-slate-500">Configure age & medical health issues for customized safety rules.</p>
              </div>
              <div className="space-y-4">
                {members.map((member, mIdx) => (
                  <div key={mIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#FFBA00]" /> Traveler {mIdx + 1} Profile
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateMember(mIdx, 'name', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Age</label>
                        <input
                          type="number"
                          value={member.age === 0 || member.age === null || member.age === undefined ? '' : member.age}
                          onChange={(e) => { const val = e.target.value; updateMember(mIdx, 'age', val === '' ? '' : parseInt(val, 10)); }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Gender</label>
                        <select
                          value={member.gender}
                          onChange={(e) => updateMember(mIdx, 'gender', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/40"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> Select Medical Issues / Health Conditions:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MEDICAL_CONDITIONS.map((cond) => {
                          const isSelected = member.medical_issues.includes(cond.id);
                          return (
                            <button
                              key={cond.id}
                              type="button"
                              onClick={() => toggleMedicalCondition(mIdx, cond.id)}
                              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition flex items-center justify-between ${
                                isSelected
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span>{cond.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {currentStep > 1 ? (
              <SaaSButton variant="outline" onClick={() => setCurrentStep(currentStep - 1)} icon={<ArrowLeft className="w-4 h-4" />}>Back</SaaSButton>
            ) : <div />}
            {currentStep < 6 ? (
              <SaaSButton variant="gold" onClick={() => setCurrentStep(currentStep + 1)} icon={<ArrowRight className="w-4 h-4" />}>Next Step</SaaSButton>
            ) : (
              <SaaSButton variant="gold" size="lg" onClick={handleGenerateTrip} loading={isGenerating} icon={<Sparkles className="w-5 h-5" />}>Generate Trip Plan</SaaSButton>
            )}
          </div>
        </SaaSCard>
      </div>

      <ModalOverlay isOpen={isGenerating} maxWidth="lg">
        <div className="space-y-6 text-center bg-white p-6 rounded-3xl">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFBA00]/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FFBA00] border-r-amber-400 border-b-transparent border-l-transparent animate-spin" />
            <Sparkles className="w-8 h-8 text-[#FFBA00] animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <span className="px-4 py-1.5 rounded-full bg-[#FFBA00] text-black text-xs font-black uppercase tracking-wider">AI Route Concierge Engine</span>
            <h3 className="text-xl md:text-2xl font-black font-outfit text-slate-900">Generating Travel Plan...</h3>
            <p className="text-xs text-slate-500 font-medium">Analyzing route from <span className="font-bold text-slate-900">{origin}</span> to <span className="font-bold text-[#FFBA00]">{destination}</span></p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-left">
            {loadingLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                {idx < currentLogIndex ? <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" /> : idx === currentLogIndex ? <Loader2 className="w-4 h-4 text-[#FFBA00] animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
                <span className={idx <= currentLogIndex ? 'text-slate-900 font-bold' : 'text-slate-400'}>{log}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-[#FFBA00] transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((currentLogIndex + 1) / loadingLogs.length) * 100))}%` }} />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
              <span>Route Analysis</span>
              <span className="text-[#FFBA00]">{Math.min(100, Math.round(((currentLogIndex + 1) / loadingLogs.length) * 100))}%</span>
            </div>
          </div>
        </div>
      </ModalOverlay>
    </div>
  );
};
