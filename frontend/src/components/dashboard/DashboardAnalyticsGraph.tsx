import React, { useState } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Wallet, MapPin, Compass, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { TripPlan, PlaceItem, useTrip } from '../../context/TripContext';

interface AnalyticsProps {
  trips: TripPlan[];
  activeTrip: TripPlan;
  allMapPlaces: PlaceItem[];
}

export const DashboardAnalyticsGraph: React.FC<AnalyticsProps> = ({ trips, activeTrip, allMapPlaces }) => {
  const { setSelectedMapPlace } = useTrip();

  // Active Category Filter for Place Recommendations Click Buttons
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: '🌟 All Places', count: allMapPlaces.length },
    { id: 'Tourist Attraction', label: '🏛️ Attractions', count: allMapPlaces.filter(p => p.category?.includes('Tourist') || p.category?.includes('Scenic') || p.category?.includes('Temple')).length },
    { id: 'Hotel', label: '🏨 Hotels & Stay', count: allMapPlaces.filter(p => p.category?.includes('Hotel') || p.category?.includes('Lodge') || p.category?.includes('Resort')).length },
    { id: 'Restaurant', label: '🍽️ Food & Dining', count: allMapPlaces.filter(p => p.category?.includes('Restaurant') || p.category?.includes('Tea') || p.category?.includes('Bakery')).length },
    { id: 'Hospital', label: '🏥 Medical & Safety', count: allMapPlaces.filter(p => p.category?.includes('Hospital') || p.category?.includes('Medical')).length },
    { id: 'EV Charging', label: '⚡ EV Chargers', count: allMapPlaces.filter(p => p.category?.includes('EV')).length },
    { id: 'Fuel Station', label: '⛽ Fuel Stations', count: allMapPlaces.filter(p => p.category?.includes('Fuel') || p.category?.includes('Petrol')).length },
  ];

  const filteredPlaces = selectedCategory === 'All'
    ? allMapPlaces.slice(0, 8)
    : allMapPlaces.filter(p => {
        if (selectedCategory === 'Tourist Attraction') return p.category?.includes('Tourist') || p.category?.includes('Scenic') || p.category?.includes('Temple');
        if (selectedCategory === 'Hotel') return p.category?.includes('Hotel') || p.category?.includes('Lodge') || p.category?.includes('Resort');
        if (selectedCategory === 'Restaurant') return p.category?.includes('Restaurant') || p.category?.includes('Tea') || p.category?.includes('Bakery');
        if (selectedCategory === 'Hospital') return p.category?.includes('Hospital') || p.category?.includes('Medical');
        if (selectedCategory === 'EV Charging') return p.category?.includes('EV');
        if (selectedCategory === 'Fuel Station') return p.category?.includes('Fuel') || p.category?.includes('Petrol');
        return true;
      }).slice(0, 8);

  // Compute maximum distance among trips for bar graph normalization
  const maxDist = Math.max(...trips.map(t => t.total_distance_km || 300), 400);

  return (
    <div className="space-y-8">
      {/* Analytics Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Recent Searches & Distance Comparison Bar Graph */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold font-outfit text-slate-900 text-base">Searched Routes Distance Graph</h3>
                <p className="text-xs text-slate-500">Comparing travel distance across all searched trip plans</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider border border-orange-200">
              Live Metrics
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {trips.map((trip) => {
              const isCurrent = trip.trip_id === activeTrip.trip_id;
              const pct = Math.min(100, Math.round((trip.total_distance_km / maxDist) * 100));
              return (
                <div key={trip.trip_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-orange-600 font-extrabold' : 'text-slate-700'}`}>
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      {trip.origin} → {trip.destination}
                    </span>
                    <span className="font-mono text-slate-800">{trip.total_distance_km} KM</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm'
                          : 'bg-slate-400/60 hover:bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Active Trip Budget Allocation & Safety Analytics Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold font-outfit text-slate-900 text-base">Active Plan Budget & Safety Analytics</h3>
                <p className="text-xs text-slate-500">AI cost breakdown & route safety confidence score</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              Safety {activeTrip.safety_score}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Hotel & Stay</div>
              <div className="text-base font-black text-slate-900 font-outfit">₹{activeTrip.budget_breakdown?.accommodation?.toLocaleString() || '3,800'}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Food & Dining</div>
              <div className="text-base font-black text-slate-900 font-outfit">₹{activeTrip.budget_breakdown?.food_and_dining?.toLocaleString() || '2,800'}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Fuel / Transit</div>
              <div className="text-base font-black text-slate-900 font-outfit">₹{activeTrip.budget_breakdown?.transportation?.toLocaleString() || '1,800'}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Emergency Reserve</div>
              <div className="text-base font-black text-emerald-600 font-outfit">₹{activeTrip.budget_breakdown?.emergency_fund?.toLocaleString() || '600'}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Place Recommendation Category Click Buttons & Grid */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-extrabold font-outfit text-slate-900">
                Route Place Recommendations
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Click category buttons to filter verified places along {activeTrip.origin} → {activeTrip.destination}
            </p>
          </div>

          {/* Interactive Category Click Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Place Cards Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
            No places found for selected category along this route.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredPlaces.map((place, pIdx) => (
              <div
                key={pIdx}
                onClick={() => {
                  if (place.latitude == null || place.longitude == null || !isFinite(place.latitude) || !isFinite(place.longitude)) return;
                  setSelectedMapPlace(place);
                  const elem = document.getElementById('centered-interactive-map');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-orange-400 hover:bg-white hover:shadow-lg transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-orange-600 truncate max-w-[120px]">
                      {place.category}
                    </span>
                    <span className="text-amber-500 font-bold">★ {place.rating || 4.8}</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {place.description || place.address}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-orange-500">
                  <span>View on Map</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
