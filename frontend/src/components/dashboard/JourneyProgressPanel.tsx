import React from 'react';
import { Compass, Navigation, Clock, Fuel, Sun, Utensils, Coffee, Hotel, ShieldCheck, MapPin } from 'lucide-react';
import { SaaSCard } from '../ui/SaaSCard';

interface JourneyProgressProps {
  origin: string;
  destination: string;
  totalDistanceKm: number;
  durationHours: number;
  expectedArrival?: string;
  weatherAdvice?: string;
  nextStop?: string;
  nextMealTime?: string;
  nextHotel?: string;
  fuelEstimatePct?: number;
}

export const JourneyProgressPanel: React.FC<JourneyProgressProps> = ({
  origin,
  destination,
  totalDistanceKm,
  durationHours,
  expectedArrival = '4:30 PM',
  weatherAdvice = 'Pleasant & clear skies along route corridor',
  nextStop = 'Sri Krishna Inn Tea Stop (KM 48)',
  nextMealTime = '1:15 PM (Lunch Highway Rest Stop)',
  nextHotel = 'Royal Regency Resort (Day 1 Stay)',
  fuelEstimatePct = 85,
}) => {
  // Simulated travel progress state
  const distanceCompleted = Math.round(totalDistanceKm * 0.25);
  const distanceRemaining = totalDistanceKm - distanceCompleted;
  const progressPct = Math.min(100, Math.round((distanceCompleted / totalDistanceKm) * 100));

  return (
    <SaaSCard className="p-6 md:p-8 space-y-6 bg-white border border-slate-200 shadow-xl text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFBA00]/30">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">
                Real-Time Journey Telemetry
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-outfit text-slate-900 flex items-center gap-2">
              <span>{origin}</span>
              <span className="text-[#FFBA00]">→</span>
              <span className="text-[#FFBA00]">{destination}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Arrival</span>
            <span className="text-sm font-black text-slate-900 font-mono">{expectedArrival}</span>
          </div>
          <Clock className="w-5 h-5 text-[#FFBA00]" />
        </div>
      </div>

      {/* Progress Bar & Telemetry Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold font-mono">
          <span className="text-slate-600">Route Progress</span>
          <span className="text-slate-900 font-black">{progressPct}% Completed ({distanceCompleted} KM / {totalDistanceKm} KM)</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className="h-full bg-[#FFBA00] rounded-full transition-all duration-700 shadow-md"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Real-Time Journey Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#FFBA00]" /> Remaining
          </span>
          <span className="text-base font-black text-slate-900 font-outfit">{distanceRemaining} KM</span>
          <span className="text-[10px] text-slate-500 font-semibold block">~{durationHours} Hours Drive</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Coffee className="w-3 h-3 text-[#FFBA00]" /> Next Stop
          </span>
          <span className="text-xs font-bold text-slate-900 line-clamp-1">{nextStop}</span>
          <span className="text-[10px] text-slate-500 font-semibold block">Smart Tea Checkpoint</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Utensils className="w-3 h-3 text-[#FFBA00]" /> Next Meal
          </span>
          <span className="text-xs font-bold text-slate-900 line-clamp-1">{nextMealTime}</span>
          <span className="text-[10px] text-slate-500 font-semibold block">Highway Restaurant</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Fuel className="w-3 h-3 text-emerald-600" /> Fuel Reserve
          </span>
          <span className="text-base font-black text-emerald-700 font-outfit">{fuelEstimatePct}% Tank</span>
          <span className="text-[10px] text-slate-500 font-semibold block">Nearest Station: 12 KM</span>
        </div>
      </div>

      {/* Live Weather Forecast Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
        <Sun className="w-5 h-5 text-[#FFBA00] shrink-0" />
        <div className="text-xs space-y-0.5">
          <span className="font-extrabold text-slate-900">Weather at Next Corridor Stop: </span>
          <span className="text-slate-600 font-medium">{weatherAdvice}</span>
        </div>
      </div>
    </SaaSCard>
  );
};
