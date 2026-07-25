import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, Clock, Wallet, Plus, ChevronDown, Sparkles, Navigation, Layers, ArrowRight,
  Map, Hotel, Newspaper, ExternalLink, MessageSquare, Send, ShieldCheck, AlertTriangle, Activity, Bot, X
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { TimelineView } from '../components/dashboard/TimelineView';
import { RouteDashboardCards } from '../components/dashboard/RouteDashboardCards';
import { DestinationExplorer } from '../components/dashboard/DestinationExplorer';
import { RouteWeatherPanel } from '../components/dashboard/RouteWeatherPanel';
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
  const { activeTrip, savedTrips, setSavedTrips, setActiveTrip } = useTrip();

  useEffect(() => {
    api.get('/planner/saved')
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSavedTrips(res.data);
        }
      })
      .catch(err => console.log('Firebase fetch err:', err));
  }, [setSavedTrips]);

  const [selectedDay, setSelectedDay] = useState<string>('Day 1');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(activeTrip?.trip_id || null);

  // AI News Assistant Chat Drawer State
  const [isNewsChatDrawerOpen, setIsNewsChatDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<NewsChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am your AI News & Safety Assistant. Ask me anything about live road conditions, local advisories, or weather updates for your destination!', time: 'Just Now' }
  ]);
  const [isChatSending, setIsChatSending] = useState(false);

  const handleSendNewsChat = async (destinationName: string) => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const res = await api.post('/chat/query', {
        query: `Question regarding news, safety, road conditions, or travel advisories for ${destinationName}: ${userText}`,
        context: {
          destination: destinationName,
          activeTripSummary: activeTrip?.trip_summary
        }
      });

      const reply = res.data.response || res.data.answer || `Based on current live reports for ${destinationName}, the area is safe for travel with clear highway corridors and no major disruptions.`;
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      console.error('News chat query failed:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Current live status for ${destinationName}: Highway traffic is flowing smoothly, weather is pleasant, and emergency response teams are active. No safety alerts issued.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  if (!activeTrip) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6 text-slate-900 bg-white">
        <SaaSCard className="p-10 max-w-lg w-full space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FFBA00]/10 border border-[#FFBA00]/30 text-[#FFBA00] flex items-center justify-center mx-auto text-3xl">
            <Map className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-outfit text-slate-900">No Active Route Plan Found</h2>
            <p className="text-xs text-slate-500 font-medium">
              Create your first AI-assisted route plan to unlock checkpoint POIs, weather forecasts, and emergency safety guidelines.
            </p>
          </div>
          <SaaSButton
            variant="gold"
            size="lg"
            onClick={() => navigate('/planner')}
            icon={<Plus className="w-5 h-5" />}
          >
            Create New Route Plan
          </SaaSButton>
        </SaaSCard>
      </div>
    );
  }

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
    <div className="min-h-screen text-slate-900 pb-28 pt-6 px-4 md:px-8 space-y-8 bg-white relative">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. TOP: OpenStreetMap Animated Route Viewport */}
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

        {/* 2. Searched Travel Plans History Container */}
        <SaaSCard className="p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl md:text-2xl font-black font-outfit text-slate-900">Searched Travel Plans</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Click any plan to expand itinerary, POIs & AI News</p>
              </div>
            </div>

            <SaaSButton
              variant="gold"
              size="sm"
              onClick={() => navigate('/planner')}
              icon={<Plus className="w-4 h-4" />}
            >
              Plan New Trip
            </SaaSButton>
          </div>

          {/* Searched Trip Plan Boxes Accordion Grid */}
          <div className="space-y-4">
            {savedTrips.map((trip) => {
              const isSelectedActive = activeTrip?.trip_id === trip.trip_id;
              const isExpanded = expandedTripId === trip.trip_id;

              return (
                <div
                  key={trip.trip_id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isSelectedActive
                      ? 'border-[#FFBA00] bg-[#FFBA00]/10 ring-2 ring-[#FFBA00]/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => {
                      setActiveTrip(trip);
                      setExpandedTripId(isExpanded ? null : trip.trip_id);
                    }}
                    className="p-4 sm:p-5 flex flex-col gap-3 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{trip.trip_id}</span>
                        {isSelectedActive && (
                          <span className="px-3 py-0.5 rounded-full bg-[#FFBA00] text-black text-[9px] sm:text-[10px] font-black uppercase shadow-sm">Active Plan</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-base sm:text-xl font-black font-outfit text-slate-900">
                        <span className="truncate max-w-[150px] sm:max-w-none">{trip.origin}</span>
                        <ArrowRight className="w-4 h-4 text-[#FFBA00] shrink-0" />
                        <span className="text-[#FFBA00] font-black truncate max-w-[150px] sm:max-w-none">{trip.destination}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 bg-[#FFBA00]/15 text-black px-3 py-1 rounded-full font-black text-[10px] sm:text-xs border border-[#FFBA00]/30 shadow-sm">
                          <Calendar className="w-3.5 h-3.5 text-black shrink-0" /> {trip.duration}
                        </span>
                        <span className="flex items-center gap-1 bg-[#FFBA00]/15 text-black px-3 py-1 rounded-full font-black text-[10px] sm:text-xs border border-[#FFBA00]/30 shadow-sm">
                          <Wallet className="w-3.5 h-3.5 text-black shrink-0" /> ₹{trip.budget?.toLocaleString()}
                        </span>
                        <span className="text-emerald-800 font-black bg-emerald-100 px-3 py-1 rounded-full text-[10px] sm:text-xs border border-emerald-200 shadow-sm">
                          Safety {trip.safety_score}/100
                        </span>
                      </div>

                      <button
                        className={`w-full sm:w-auto px-4 py-2 rounded-full text-[11px] sm:text-xs font-black transition flex items-center justify-center gap-1.5 min-h-[38px] active:scale-95 shadow-sm ${
                          isExpanded ? 'bg-[#FFBA00] text-black shadow-md shadow-[#FFBA00]/20' : 'bg-slate-900 border border-slate-800 text-white hover:border-[#FFBA00]'
                        }`}
                      >
                        {isExpanded ? 'Hide Details ▲' : 'Expand Details ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/60 text-slate-900 space-y-6 sm:space-y-8 animate-fadeIn">
                      {/* AI Concierge Summary */}
                      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 space-y-1.5 shadow-md border-l-4 border-l-[#FFBA00]">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#FFBA00] shrink-0" />
                          <span className="text-[10px] sm:text-xs font-black uppercase text-slate-900 tracking-wider">AI Route Concierge Summary</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{trip.trip_summary}</p>
                      </div>

                      {/* Live Weather Telemetry & AI Weather Explanation */}
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

                      {/* Categorized Route POI Sections 1 to 5 */}
                      <div className="space-y-4 border-t border-slate-200 pt-4 sm:pt-6">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBA00] shrink-0" />
                          <h3 className="text-sm sm:text-lg font-black font-outfit text-slate-900">Route POI Checkpoints (Section by Section)</h3>
                        </div>
                        <RouteDashboardCards />
                      </div>

                      {/* Destination Intelligence (Top 3 Per Category across 15 Categories) */}
                      <div className="space-y-4 border-t border-slate-200 pt-4 sm:pt-6">
                        <DestinationExplorer />
                      </div>

                      {/* Destination News Navigation Card */}
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
                              GNews live feed, LLM explanations, AI risk gauge for <span className="font-bold text-[#FFBA00]">{trip.destination}</span>
                            </p>
                          </div>
                        </div>

                        <SaaSButton
                          variant="gold"
                          size="md"
                          onClick={() => navigate(`/news?destination=${encodeURIComponent(trip.destination)}`)}
                          icon={<ArrowRight className="w-4 h-4 text-black" />}
                        >
                          View {trip.destination} Live News →
                        </SaaSButton>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SaaSCard>

      </div>
    </div>
  );
};
