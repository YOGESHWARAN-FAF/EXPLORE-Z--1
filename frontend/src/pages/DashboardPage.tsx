import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, Clock, Wallet, Plus, ChevronDown, Sparkles, Navigation, Layers, ArrowRight, ArrowLeft,
  Map, Hotel, Newspaper, ExternalLink, MessageSquare, Send, ShieldCheck, AlertTriangle, Activity, Bot, X
} from 'lucide-react';
import { useTrip, TripPlan } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { fetchUserSearchedPlansFromFirebase } from '../services/firebase';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { TimelineView } from '../components/dashboard/TimelineView';
import { RouteDashboardCards } from '../components/dashboard/RouteDashboardCards';
import { DestinationExplorer } from '../components/dashboard/DestinationExplorer';
import { RouteWeatherPanel } from '../components/dashboard/RouteWeatherPanel';
import { SearchedPlansHistory } from '../components/dashboard/SearchedPlansHistory';
import { SaaSCard } from '../components/ui/SaaSCard';
import { SaaSButton } from '../components/ui/SaaSButton';
import api from '../services/api';
import toast from 'react-hot-toast';

interface NewsChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { activeTrip, savedTrips, setSavedTrips, searchHistory, setSearchHistory, setActiveTrip } = useTrip();

  // Initially DO NOT show full datas with map by default; user must click a searched plan box
  const [isFullView, setIsFullView] = useState<boolean>(location.state?.showFullView || false);
  const [selectedDay, setSelectedDay] = useState<string>('Day 1');

  useEffect(() => {
    // 1. Fetch via FastAPI endpoint (/planner/history)
    api.get('/planner/history')
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSearchHistory(res.data);
          setSavedTrips(res.data);
        }
      })
      .catch(err => console.log('Firebase history fetch err:', err));

    // 2. Direct client-side fetch from Firebase RTDB under user UID if logged in
    if (user?.uid) {
      fetchUserSearchedPlansFromFirebase(user.uid)
        .then(userPlans => {
          if (userPlans && userPlans.length > 0) {
            setSearchHistory(userPlans);
            setSavedTrips(userPlans);
          }
        })
        .catch(err => console.log('Firebase direct fetch err:', err));
    }
  }, [user?.uid, setSavedTrips, setSearchHistory]);

  const handleSelectTrip = (trip: TripPlan) => {
    setActiveTrip(trip);
    setIsFullView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // INITIAL STATE: Show Searched Plans Boxes History First (Don't show full datas until clicked)
  if (!isFullView || !activeTrip) {
    return (
      <div className="min-h-[85vh] py-4 sm:py-8 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 text-slate-900 bg-white animate-fadeIn">
        {/* Banner Section with Pure White BG */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xl text-slate-900">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFBA00] text-black text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Searched Plans Dashboard
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-outfit text-slate-900 tracking-tight">
              Your Saved AI Search History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Click any searched plan box below to expand full details with OpenStreetMap route & live POIs.
            </p>
          </div>

          <button
            onClick={() => navigate('/planner')}
            className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#FFBA00]/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Plan New AI Route</span>
          </button>
        </div>

        {/* Searched Plans History Boxes */}
        <SaaSCard className="p-4 sm:p-6 md:p-8 shadow-2xl bg-white border border-slate-200">
          <SearchedPlansHistory
            userUid={user?.uid}
            onSelectTrip={handleSelectTrip}
          />
        </SaaSCard>
      </div>
    );
  }

  // EXPANDED FULL VIEW: Shown only when user clicks a searched plan box
  const {
    origin, destination, travel_mode, duration, budget, total_distance_km,
    duration_hours, expected_arrival_time, safety_score, trip_summary, route_geometry, checkpoints,
    best_tourist_places, best_hotels, best_restaurants, tea_and_bakeries, hospitals, petrol_stations,
    ev_charging, smart_tea_stops, smart_lunch_stops, along_route_attractions, emergency_stops,
    destination_explorer_top3, travel_schedule, daily_itineraries
  } = activeTrip;

  const dayKeys = daily_itineraries && Object.keys(daily_itineraries).length > 0
    ? Object.keys(daily_itineraries)
    : ['Day 1'];

  const currentDaySchedule = daily_itineraries && daily_itineraries[selectedDay]
    ? daily_itineraries[selectedDay]
    : travel_schedule;

  const flatDestPlaces: any[] = [];
  if (destination_explorer_top3) {
    Object.values(destination_explorer_top3).forEach((plist) => {
      flatDestPlaces.push(...plist);
    });
  }

  const allMapPlaces = [
    ...flatDestPlaces,
    ...(best_tourist_places || []),
    ...(best_hotels || []),
    ...(best_restaurants || []),
    ...(tea_and_bakeries || []),
    ...(hospitals || []),
    ...(petrol_stations || []),
    ...(ev_charging || []),
    ...(smart_tea_stops || []),
    ...(smart_lunch_stops || []),
    ...(along_route_attractions || []),
    ...(emergency_stops || []),
  ];

  return (
    <div className="min-h-screen text-slate-900 pb-28 pt-4 sm:pt-6 px-3 sm:px-6 md:px-8 space-y-6 sm:space-y-8 bg-white relative animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Navigation Bar to return back to Searched Plans Boxes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsFullView(false)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-[#FFBA00] text-white hover:text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Searched Plans History</span>
            </button>
            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFBA00] text-black text-[9px] font-black uppercase tracking-wider inline-block">
                Expanded Full View
              </span>
              <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="truncate max-w-[140px] sm:max-w-none">{origin}</span>
                <ArrowRight className="w-4 h-4 text-[#FFBA00] shrink-0" />
                <span className="text-[#FFBA00] truncate max-w-[140px] sm:max-w-none">{destination}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => navigate('/planner')}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-[#FFBA00] text-slate-900 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FFBA00] stroke-[3]" />
            <span>Plan Another Trip</span>
          </button>
        </div>

        {/* 1. OpenStreetMap Animated Route Viewport */}
        <div id="centered-interactive-map" className="space-y-3 scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20 shrink-0">
                <Map className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-black font-outfit text-slate-900">AI Route Map Viewport</h2>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold">OpenStreetMap with Animated Route & POIs</span>
          </div>

          <div className="relative border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white">
            <InteractiveMap
              routeGeometry={route_geometry}
              checkpoints={checkpoints as any}
              places={allMapPlaces}
              travelMode={travel_mode}
            />
          </div>
        </div>

        {/* 2. Detailed Active Trip Breakdown Sections */}
        <div className="p-4 sm:p-6 rounded-3xl border border-slate-200 bg-slate-50/60 text-slate-900 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-[#FFBA00] text-black font-black text-[10px] uppercase">
                Active Plan Details
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-outfit text-slate-900">
                {origin} → {destination}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">ID: {activeTrip.trip_id}</span>
          </div>

          {/* AI Concierge Summary */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 space-y-1.5 shadow-md border-l-4 border-l-[#FFBA00]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFBA00] shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase text-slate-900 tracking-wider">AI Route Concierge Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{trip_summary}</p>
          </div>

          {/* Live Weather Telemetry */}
          <RouteWeatherPanel />

          {/* Day-Wise Timeline Schedule */}
          {currentDaySchedule && currentDaySchedule.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-900">
                  <Clock className="w-4 h-4 text-[#FFBA00]" /> Itinerary Schedule Timeline
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {dayKeys.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition min-h-[36px] active:scale-95 ${
                        selectedDay === day ? 'bg-[#FFBA00] text-black font-black shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <TimelineView
                schedule={currentDaySchedule}
                dayTitle={`${selectedDay} Route Timeline`}
                routeGeometry={route_geometry}
                checkpoints={checkpoints}
                totalRouteKm={total_distance_km}
              />
            </div>
          )}

          {/* Categorized Route POI Sections */}
          <div className="space-y-4 border-t border-slate-200 pt-4 sm:pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBA00] shrink-0" />
              <h3 className="text-sm sm:text-lg font-black font-outfit text-slate-900">Route POI Checkpoints</h3>
            </div>
            <RouteDashboardCards />
          </div>

          {/* Destination Intelligence */}
          <div className="space-y-4 border-t border-slate-200 pt-4 sm:pt-6">
            <DestinationExplorer />
          </div>

          {/* Destination News Card */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col gap-4">
            <div className="flex items-start sm:items-center gap-3 text-left">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20 shrink-0">
                <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-sm sm:text-lg font-outfit text-slate-900">
                  Live Destination News & AI Safety Intelligence
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  GNews live feed, LLM explanations, AI risk gauge for <span className="font-bold text-[#FFBA00]">{destination}</span>
                </p>
              </div>
            </div>

            <SaaSButton
              variant="gold"
              size="md"
              onClick={() => navigate(`/news?destination=${encodeURIComponent(destination)}`)}
              icon={<ArrowRight className="w-4 h-4 text-black" />}
            >
              View {destination} Live News →
            </SaaSButton>
          </div>
        </div>

        {/* Bottom Searched Plans History Navigation */}
        <SaaSCard className="p-4 sm:p-6 md:p-8 shadow-2xl">
          <SearchedPlansHistory
            userUid={user?.uid}
            onSelectTrip={handleSelectTrip}
          />
        </SaaSCard>

      </div>
    </div>
  );
};

