import React, { useState } from 'react';
import { 
  History, Clock, Calendar, Wallet, ShieldCheck, ArrowRight, 
  Sparkles, MapPin, Eye, Compass, Car, Bike, Bus, Activity, 
  Footprints, ChevronRight, X, Layers, AlertCircle, Hotel, Utensils, 
  HeartHandshake, Newspaper, CheckCircle2, Shield
} from 'lucide-react';
import { TripPlan, useTrip } from '../../context/TripContext';
import { SaaSCard } from '../ui/SaaSCard';
import { SaaSButton } from '../ui/SaaSButton';
import { ModalOverlay } from '../ui/ModalOverlay';

interface SearchedPlansHistoryProps {
  userUid?: string;
  onSelectTrip?: (trip: TripPlan) => void;
}

const getVehicleIcon = (mode: string) => {
  switch (mode?.toLowerCase()) {
    case 'car': return <Car className="w-4 h-4 text-[#FFBA00]" />;
    case 'bike': return <Bike className="w-4 h-4 text-[#FFBA00]" />;
    case 'bus': return <Bus className="w-4 h-4 text-[#FFBA00]" />;
    case 'cycling': return <Activity className="w-4 h-4 text-[#FFBA00]" />;
    case 'walking': return <Footprints className="w-4 h-4 text-[#FFBA00]" />;
    default: return <Car className="w-4 h-4 text-[#FFBA00]" />;
  }
};

export const SearchedPlansHistory: React.FC<SearchedPlansHistoryProps> = ({ userUid, onSelectTrip }) => {
  const { activeTrip, setActiveTrip, searchHistory, savedTrips } = useTrip();
  const [selectedModalTrip, setSelectedModalTrip] = useState<TripPlan | null>(null);

  // Combine search history and saved trips, deduped by trip_id
  const historyItems = (searchHistory.length > 0 ? searchHistory : savedTrips)
    .sort((a, b) => {
      const timeA = a.searched_at ? new Date(a.searched_at).getTime() : 0;
      const timeB = b.searched_at ? new Date(b.searched_at).getTime() : 0;
      return timeB - timeA;
    });

  const handleTripClick = (trip: TripPlan) => {
    setActiveTrip(trip);
    if (onSelectTrip) {
      onSelectTrip(trip);
    }
  };

  const handleOpenFullData = (e: React.MouseEvent, trip: TripPlan) => {
    e.stopPropagation();
    setActiveTrip(trip);
    setSelectedModalTrip(trip);
  };

  return (
    <div className="space-y-4">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black font-outfit text-slate-900 flex items-center gap-2">
              Latest Searched Plans History
            </h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Synced with Firebase Realtime DB {userUid ? `(UID: ${userUid.slice(0, 8)}...)` : '(Active Session)'}
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold font-mono self-start sm:self-auto">
          {historyItems.length} Searches Saved
        </span>
      </div>

      {/* History Grid */}
      {historyItems.length === 0 ? (
        <SaaSCard className="p-8 text-center space-y-3 bg-slate-50/50 border border-dashed border-slate-300">
          <Compass className="w-10 h-10 text-slate-400 mx-auto animate-spin-slow" />
          <p className="text-xs text-slate-600 font-semibold">No search history found under this account yet.</p>
          <p className="text-[11px] text-slate-400">Generate a route plan in the Planner tab to automatically record search history in Firebase.</p>
        </SaaSCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historyItems.map((trip) => {
            const isActive = activeTrip?.trip_id === trip.trip_id;
            const formattedDate = trip.searched_at
              ? new Date(trip.searched_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
              : 'Recent Search';

            return (
              <div
                key={trip.trip_id}
                onClick={() => handleTripClick(trip)}
                className={`group relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3.5 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] ${
                  isActive
                    ? 'bg-gradient-to-br from-[#FFBA00]/15 via-white to-amber-50/30 border-[#FFBA00] ring-2 ring-[#FFBA00]/40 shadow-lg'
                    : 'bg-white border-slate-200 hover:border-[#FFBA00]/60'
                }`}
              >
                {/* Header Badge & Timestamp */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-bold truncate">
                    <Clock className="w-3 h-3 text-[#FFBA00] shrink-0" />
                    <span className="truncate">{formattedDate}</span>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFBA00] text-black text-[9px] font-black uppercase tracking-wider shadow-sm shrink-0">
                      Active Plan
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">
                      ID: {trip.trip_id?.slice(-6)}
                    </span>
                  )}
                </div>

                {/* Route Headline */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                    <span className="truncate">From {trip.origin}</span>
                    {getVehicleIcon(trip.travel_mode)}
                  </div>
                  <div className="text-lg sm:text-xl font-black font-outfit text-slate-900 group-hover:text-[#FFBA00] transition-colors flex items-center gap-2">
                    <span className="truncate">{trip.destination}</span>
                    <ArrowRight className="w-4 h-4 text-[#FFBA00] shrink-0" />
                  </div>
                  {trip.trip_summary && (
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                      {trip.trip_summary}
                    </p>
                  )}
                </div>

                {/* Info Badges */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <div className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase truncate">Duration</div>
                    <div className="text-xs font-black text-slate-800 truncate">{trip.duration}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <div className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase truncate">Budget</div>
                    <div className="text-xs font-black text-slate-800 truncate">₹{trip.budget?.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 min-w-0">
                    <div className="text-[8px] sm:text-[9px] text-emerald-600 font-extrabold uppercase truncate">Safety</div>
                    <div className="text-xs font-black text-emerald-800 truncate">{trip.safety_score}/100</div>
                  </div>
                </div>

                {/* Actions Button Structure */}
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTripClick(trip);
                    }}
                    className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#FFBA00]/20 active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Expand Full Plan & Map →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL DATA MODAL OVERLAY */}
      {selectedModalTrip && (
        <ModalOverlay isOpen={!!selectedModalTrip} onClose={() => setSelectedModalTrip(null)} maxWidth="xl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto text-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FFBA00] text-black font-black text-[10px] uppercase">
                    Firebase History Record
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">ID: {selectedModalTrip.trip_id}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 flex items-center gap-2">
                  <span>{selectedModalTrip.origin}</span>
                  <ArrowRight className="w-5 h-5 text-[#FFBA00]" />
                  <span className="text-[#FFBA00]">{selectedModalTrip.destination}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Mode: <span className="font-bold text-slate-800">{selectedModalTrip.travel_mode}</span> | Duration: <span className="font-bold text-slate-800">{selectedModalTrip.duration}</span> | Budget: <span className="font-bold text-slate-800">₹{selectedModalTrip.budget?.toLocaleString()}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedModalTrip(null)}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Concierge Summary */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#FFBA00]" /> AI Trip Concierge Executive Summary
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {selectedModalTrip.trip_summary}
              </p>
            </div>

            {/* Key Telemetry Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Distance</div>
                <div className="text-lg font-black text-slate-900 font-outfit">{selectedModalTrip.total_distance_km} KM</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Drive Time</div>
                <div className="text-lg font-black text-slate-900 font-outfit">{selectedModalTrip.duration_hours} Hours</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Safety Rating</div>
                <div className="text-lg font-black text-emerald-800 font-outfit">{selectedModalTrip.safety_score} / 100</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Expected Arrival</div>
                <div className="text-lg font-black text-slate-900 font-outfit">{selectedModalTrip.expected_arrival_time || '6:30 PM'}</div>
              </div>
            </div>

            {/* Budget Breakdown */}
            {selectedModalTrip.budget_breakdown && (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#FFBA00]" /> Budget Allocation Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-medium">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">Stay</span>
                    <span className="font-black text-slate-900">₹{selectedModalTrip.budget_breakdown.accommodation?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">Food & Dining</span>
                    <span className="font-black text-slate-900">₹{selectedModalTrip.budget_breakdown.food_and_dining?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">Fuel & Transport</span>
                    <span className="font-black text-slate-900">₹{selectedModalTrip.budget_breakdown.transportation?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">Entry & Passes</span>
                    <span className="font-black text-slate-900">₹{selectedModalTrip.budget_breakdown.activities_and_entry?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-rose-600 block font-bold">Emergency Reserve</span>
                    <span className="font-black text-rose-800">₹{selectedModalTrip.budget_breakdown.emergency_fund?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Itinerary Schedule Highlights */}
            {selectedModalTrip.travel_schedule && selectedModalTrip.travel_schedule.length > 0 && (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFBA00]" /> Itinerary Schedule ({selectedModalTrip.travel_schedule.length} Milestones)
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedModalTrip.travel_schedule.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFBA00] text-black font-mono font-black text-[10px]">
                          {item.time}
                        </span>
                        <span className="font-bold text-slate-800">{item.title || item.activity}</span>
                      </div>
                      {item.km_mark !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                          @ {item.km_mark} KM
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Advisories */}
            {selectedModalTrip.health_recommendations && selectedModalTrip.health_recommendations.length > 0 && (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-500" /> Member Medical Health Guidelines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedModalTrip.health_recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1.5 text-xs">
                      <div className="font-extrabold text-rose-900">{rec.member_name}</div>
                      <p className="text-[11px] text-slate-600 font-medium">{rec.condition_summary || 'Standard health guidelines apply.'}</p>
                      {rec.medical_warnings && rec.medical_warnings.length > 0 && (
                        <div className="text-[10px] text-rose-700 font-bold">
                          ⚠️ {rec.medical_warnings.join(' • ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Insights & Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 pt-4">
              {selectedModalTrip.hidden_gems && selectedModalTrip.hidden_gems.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5 text-xs">
                  <div className="font-black text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFBA00]" /> Hidden Gems
                  </div>
                  <ul className="text-[11px] text-slate-600 font-medium list-disc list-inside space-y-0.5">
                    {selectedModalTrip.hidden_gems.slice(0, 3).map((gem, gIdx) => (
                      <li key={gIdx}>{gem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedModalTrip.local_foods && selectedModalTrip.local_foods.length > 0 && (
                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200 space-y-1.5 text-xs">
                  <div className="font-black text-orange-900 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-orange-500" /> Must-Try Foods
                  </div>
                  <ul className="text-[11px] text-slate-600 font-medium list-disc list-inside space-y-0.5">
                    {selectedModalTrip.local_foods.slice(0, 3).map((food, fIdx) => (
                      <li key={fIdx}>{food}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedModalTrip.travel_tips && selectedModalTrip.travel_tips.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5 text-xs">
                  <div className="font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pro Travel Tips
                  </div>
                  <ul className="text-[11px] text-slate-600 font-medium list-disc list-inside space-y-0.5">
                    {selectedModalTrip.travel_tips.slice(0, 3).map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <SaaSButton variant="outline" size="md" onClick={() => setSelectedModalTrip(null)}>
                Close Window
              </SaaSButton>
              <SaaSButton
                variant="gold"
                size="md"
                onClick={() => {
                  setActiveTrip(selectedModalTrip);
                  setSelectedModalTrip(null);
                }}
                icon={<CheckCircle2 className="w-4 h-4 text-black" />}
              >
                Set as Active Dashboard Trip
              </SaaSButton>
            </div>

          </div>
        </ModalOverlay>
      )}

    </div>
  );
};
