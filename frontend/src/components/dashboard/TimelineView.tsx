import React from 'react';
import { Clock, MapPin, Coffee, Utensils, Hotel, Camera, ShieldCheck, Heart, AlertCircle, Compass, Navigation } from 'lucide-react';
import { ScheduleItem, RouteCheckpoint, useTrip } from '../../context/TripContext';

interface TimelineProps {
  schedule: ScheduleItem[];
  dayTitle?: string;
  routeGeometry?: [number, number][];
  checkpoints?: RouteCheckpoint[];
  totalRouteKm?: number;
}

const getItemIcon = (category: string = "Activity") => {
  const cat = category.toLowerCase();
  if (cat.includes("departure")) return "🏁";
  if (cat.includes("breakfast")) return "🥞";
  if (cat.includes("tea") || cat.includes("bakery") || cat.includes("coffee")) return "☕";
  if (cat.includes("lunch") || cat.includes("dining")) return "🍽️";
  if (cat.includes("tourist") || cat.includes("sightseeing")) return "🏛️";
  if (cat.includes("photo") || cat.includes("viewpoint")) return "📸";
  if (cat.includes("hotel") || cat.includes("check-in")) return "🏨";
  return "📍";
};

export const TimelineView: React.FC<TimelineProps> = ({ schedule, dayTitle = "Daily Schedule", routeGeometry = [], checkpoints = [], totalRouteKm = 0 }) => {
  const { setSelectedMapPlace } = useTrip();

  // Interpolate lat/lng from route geometry using km_mark ratio
  const getCoordinatesForKm = (km: number): { lat: number; lng: number } | null => {
    // First try matching a checkpoint
    if (checkpoints.length > 0) {
      const closest = checkpoints.reduce((prev, curr) =>
        Math.abs(curr.km_mark - km) < Math.abs(prev.km_mark - km) ? curr : prev
      );
      if (Math.abs(closest.km_mark - km) <= 15) {
        return { lat: closest.latitude, lng: closest.longitude };
      }
    }
    // Fallback: interpolate from route geometry
    if (routeGeometry.length > 1 && totalRouteKm > 0) {
      const ratio = Math.min(km / totalRouteKm, 1);
      const idx = Math.floor(ratio * (routeGeometry.length - 1));
      const point = routeGeometry[Math.min(idx, routeGeometry.length - 1)];
      return { lat: point[0], lng: point[1] };
    }
    return null;
  };

  const handleNavToMap = (item: ScheduleItem) => {
    let lat = item.latitude;
    let lng = item.longitude;

    // If no explicit coords, derive from km_mark
    if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) {
      const derived = getCoordinatesForKm(item.km_mark || 0);
      if (derived) {
        lat = derived.lat;
        lng = derived.lng;
      }
    }

    // Final guard: bail if still no valid coordinates
    if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) {
      console.warn('TimelineView: Cannot navigate — no valid coordinates for', item.activity || item.title);
      return;
    }

    const placeForMap: any = {
      id: `timeline-${item.km_mark || 0}`,
      name: item.activity || item.title || 'Route Stop',
      address: item.location || `Route KM ${item.km_mark || 0}`,
      category: item.category || 'Timeline Stop',
      rating: 4.8,
      distance_from_route_km: 0,
      is_open_now: true,
      phone: '',
      latitude: lat,
      longitude: lng,
    };
    setSelectedMapPlace(placeForMap);

    const mapElem = document.getElementById('centered-interactive-map') || document.getElementById('interactive-map-section');
    if (mapElem) {
      mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper: check if an item can resolve coordinates
  const canNavigate = (item: ScheduleItem): boolean => {
    if (item.latitude != null && item.longitude != null && isFinite(item.latitude) && isFinite(item.longitude)) return true;
    const derived = getCoordinatesForKm(item.km_mark || 0);
    return derived != null;
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFBA00] text-black flex items-center justify-center font-bold text-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base font-outfit text-slate-900">{dayTitle}</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">Route Progression & Scheduled Stops</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-bold self-start sm:self-auto">
          {schedule?.length || 0} Route Milestones
        </span>
      </div>

      {/* Timeline Items */}
      <div className="space-y-4 sm:space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-[#FFBA00]">
        {schedule?.map((item, idx) => {
          const iconEmoji = getItemIcon(item.category || "Activity");

          return (
            <div key={idx} className="relative pl-10 space-y-2 group">
              {/* Timeline Pin */}
              <div className="absolute left-2 top-2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#FFBA00] shadow-md flex items-center justify-center text-[10px] group-hover:scale-125 transition-transform">
                {iconEmoji}
              </div>

              {/* Event Card */}
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#FFBA00] transition-all shadow-sm space-y-3">
                {/* Top Row: Activity + KM + Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">{iconEmoji}</span>
                    <span className="font-black text-xs sm:text-sm text-slate-900 truncate">{item.activity || item.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {item.km_mark !== undefined && (
                      <span className="px-3 py-1 rounded-full bg-[#FFBA00] text-black text-[10px] sm:text-xs font-black shadow-sm">
                        KM {item.km_mark}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-[#FFBA00] text-[10px] sm:text-[11px] font-black flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3 text-[#FFBA00]" /> {item.time}
                    </span>
                  </div>
                </div>

                {/* Location Row + Navigate Button */}
                {item.location && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                    <div className="text-[11px] sm:text-xs text-slate-700 font-bold flex items-center gap-1.5 min-w-0 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#FFBA00] shrink-0" /> {item.location}
                    </div>
                    {canNavigate(item) && (
                      <button
                        onClick={() => handleNavToMap(item)}
                        className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-full bg-[#FFBA00] hover:bg-[#FF9F00] text-black text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#FFBA00]/20 cursor-pointer min-h-[38px]"
                      >
                        <Navigation className="w-3.5 h-3.5 text-black fill-black" /> Navigate on Map
                      </button>
                    )}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed pl-4 sm:pl-5 font-medium border-l-2 border-slate-200">
                    {item.notes}
                  </p>
                )}

                {/* Health Advisory Alert */}
                {item.health_advisory && (
                  <div className="text-[10px] sm:text-xs text-red-800 bg-red-50 border border-red-200 p-2 sm:p-2.5 rounded-xl font-semibold flex items-start gap-2">
                    <Heart className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-900">Health Advisory:</strong> {item.health_advisory}
                    </div>
                  </div>
                )}

                {/* Safety Tips */}
                {item.safety_tips && (
                  <div className="text-[10px] sm:text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 sm:p-2.5 rounded-xl font-semibold flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-900">Safety Tip:</strong> {item.safety_tips}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
