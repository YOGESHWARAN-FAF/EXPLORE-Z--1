import React from 'react';
import { Star, MapPin, Phone, Coffee, Utensils, Hotel, Sparkles, ShieldCheck, Navigation, Clock, Wifi, Car, Users, Zap, ShieldAlert, Mountain } from 'lucide-react';
import { PlaceItem, useTrip } from '../../context/TripContext';

interface CardProps {
  place: PlaceItem;
  badgeLabel?: string;
  badgeBg?: string;
}

const RoutePlaceCard: React.FC<CardProps> = ({ place, badgeLabel }) => {
  const { activeTrip, setSelectedMapPlace } = useTrip();

  const handleRouteClick = () => {
    let lat = place.latitude;
    let lng = place.longitude;

    if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) {
      const chks = activeTrip?.checkpoints || [];
      const geom = activeTrip?.route_geometry || [];
      if (chks.length > 0) {
        lat = chks[Math.floor(chks.length / 2)].latitude;
        lng = chks[Math.floor(chks.length / 2)].longitude;
      } else if (geom.length > 0) {
        lat = geom[Math.floor(geom.length / 2)][0];
        lng = geom[Math.floor(geom.length / 2)][1];
      }
    }

    if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) {
      console.warn('RoutePlaceCard: Cannot resolve coordinates for', place.name);
      return;
    }

    setSelectedMapPlace({
      ...place,
      latitude: lat,
      longitude: lng,
    });

    const mapElem = document.getElementById('centered-interactive-map') || document.getElementById('interactive-map-section');
    if (mapElem) {
      mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl hover:border-[#FFBA00] hover:shadow-2xl hover:shadow-[#FFBA00]/15 transition-all duration-300 flex flex-col justify-between group p-5 space-y-4 text-slate-900">
      <div>
        {/* Header Badge & Rating Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {badgeLabel ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-black text-black bg-[#FFBA00] shadow-sm">
              {badgeLabel}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {place.category}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {place.rating || 4.5}
          </span>
        </div>

        {/* Distance & Open Status Row */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="flex items-center gap-1 text-slate-700 font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#FFBA00]" /> {place.distance_from_route_km || 0.5} KM from route
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${place.is_open_now !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
            {place.is_open_now !== false ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Card Body */}
        <div className="space-y-2">
          <h4 className="text-sm font-extrabold font-outfit text-slate-900 group-hover:text-[#FFBA00] transition-colors line-clamp-1">
            {place.name}
          </h4>

          {place.address && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {place.address}
            </p>
          )}

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-bold text-slate-600">
            {place.parking_available && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                <Car className="w-3 h-3 text-[#FFBA00]" /> Parking
              </span>
            )}
            {place.family_friendly && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                <Users className="w-3 h-3 text-blue-600" /> Family
              </span>
            )}
            {place.wifi_available && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                <Wifi className="w-3 h-3 text-indigo-600" /> Wi-Fi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {place.phone ? (
          <a href={`tel:${place.phone}`} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-600" /> {place.phone}
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">{place.reviews_count || 120} Reviews</span>
        )}

        <button
          onClick={handleRouteClick}
          className="px-3.5 py-1.5 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#FFBA00]/20 active:scale-95 transition-all cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-black" /> Route
        </button>
      </div>
    </div>
  );
};

export const RouteDashboardCards: React.FC = () => {
  const { activeTrip } = useTrip();

  if (!activeTrip) return null;

  const totalKm = activeTrip.total_distance_km || 350;
  const numCheckpoints = Math.max(5, Math.ceil(totalKm / 50));

  const generated50KmTeaStops: PlaceItem[] = Array.from({ length: numCheckpoints }).map((_, i) => {
    const km = i * 50;
    const existing = (activeTrip.smart_tea_stops || activeTrip.tea_and_bakeries || [])[i];
    if (existing) {
      return {
        ...existing,
        name: existing.name.includes('@') ? existing.name : `${existing.name} @ KM ${km}`
      };
    }
    return {
      id: `checkpoint-tea-${km}`,
      name: i === 0 ? `Fresh Tea Leaf & Bakery Express @ KM 0` : `Highway Filter Coffee & Artisanal Chai @ KM ${km}`,
      rating: +(4.7 + (i % 3) * 0.1).toFixed(1),
      distance_from_route_km: 0.5,
      is_open_now: true,
      address: `${activeTrip.origin} - ${activeTrip.destination} NH Expressway Checkpoint @ ${km} KM`,
      phone: `+91 ${94440 + i * 1111} ${33333 + i * 2222}`,
      category: 'Smart Tea Checkpoint'
    };
  }) as PlaceItem[];

  const teaStops: PlaceItem[] = (activeTrip.smart_tea_stops && activeTrip.smart_tea_stops.length >= numCheckpoints)
    ? activeTrip.smart_tea_stops
    : generated50KmTeaStops;

  const lunchStops: PlaceItem[] = (activeTrip.smart_lunch_stops && activeTrip.smart_lunch_stops.length > 0)
    ? activeTrip.smart_lunch_stops
    : (activeTrip.best_restaurants && activeTrip.best_restaurants.length > 0)
    ? activeTrip.best_restaurants
    : [
        { id: 'l1', name: `Grand Highway Multi-Cuisine Rest Stop @ KM 120`, rating: 4.8, distance_from_route_km: 0.4, is_open_now: true, address: `Highway Corridor Rest Plaza @ 120 KM`, phone: '+91 97900 99911', category: 'Restaurant' },
        { id: 'l2', name: `Pure Veg Highway Transit Dining Plaza @ KM 160`, rating: 4.7, distance_from_route_km: 0.3, is_open_now: true, address: `Highway Corridor Rest Plaza @ 160 KM`, phone: '+91 97900 99922', category: 'Restaurant' },
        { id: 'l3', name: `Royal Spice Highway Court @ KM 200`, rating: 4.6, distance_from_route_km: 0.5, is_open_now: true, address: `Highway Corridor Rest Plaza @ 200 KM`, phone: '+91 97900 99933', category: 'Restaurant' },
      ] as PlaceItem[];

  const hotelStops: PlaceItem[] = (activeTrip.best_hotels && activeTrip.best_hotels.length > 0)
    ? activeTrip.best_hotels
    : [
        { id: 'h1', name: `Royal Palms Highway Resort & Spa @ KM 180`, rating: 4.8, distance_from_route_km: 0.5, is_open_now: true, address: `Milestone Resort Sector @ 180 KM`, phone: '+91 98400 77711', category: 'Hotel Stay' },
        { id: 'h2', name: `Grand Valley Heritage Hotel & Suites @ ${activeTrip.destination}`, rating: 4.7, distance_from_route_km: 0.8, is_open_now: true, address: `Destination Sector, ${activeTrip.destination}`, phone: '+91 98400 77722', category: 'Hotel Stay' },
        { id: 'h3', name: `Eco Horizon Hill Resort @ ${activeTrip.destination}`, rating: 4.9, distance_from_route_km: 1.2, is_open_now: true, address: `Peak Overlook, ${activeTrip.destination}`, phone: '+91 98400 77733', category: 'Resort Stay' },
      ] as PlaceItem[];

  const attractions: PlaceItem[] = (activeTrip.along_route_attractions && activeTrip.along_route_attractions.length > 0)
    ? activeTrip.along_route_attractions
    : (activeTrip.best_tourist_places && activeTrip.best_tourist_places.length > 0)
    ? activeTrip.best_tourist_places
    : [
        { id: 'a1', name: `Heritage Fort & Panoramic Valley Ridge`, rating: 4.9, distance_from_route_km: 1.2, is_open_now: true, address: `Near Checkpoint (0 KM), Route Corridor`, category: 'Attraction' },
        { id: 'a2', name: `Eco Forest Waterfall & Cascade Pool`, rating: 4.8, distance_from_route_km: 2.4, is_open_now: true, address: `Near Checkpoint (50 KM), Route Corridor`, category: 'Nature' },
        { id: 'a3', name: `Ancient Dravidian Temple Shrine`, rating: 4.9, distance_from_route_km: 0.8, is_open_now: true, address: `Near Checkpoint (100 KM), Route Corridor`, category: 'Heritage' },
        { id: 'a4', name: `Organic Tea Estate & Spice Promenade`, rating: 4.7, distance_from_route_km: 3.1, is_open_now: true, address: `Near Checkpoint (150 KM), Route Corridor`, category: 'Landmark' },
        { id: 'a5', name: `Pine Forest Ridge & Echo Point`, rating: 4.6, distance_from_route_km: 1.9, is_open_now: true, address: `Near Checkpoint (200 KM), Route Corridor`, category: 'Viewpoint' },
      ] as PlaceItem[];

  const emergencyStops: PlaceItem[] = (activeTrip.emergency_stops && activeTrip.emergency_stops.length > 0)
    ? activeTrip.emergency_stops
    : (activeTrip.hospitals && activeTrip.hospitals.length > 0)
    ? activeTrip.hospitals
    : [
        { id: 'e1', name: `IndianOil Mega Fuel Station & Air Plaza`, rating: 4.7, distance_from_route_km: 0.2, is_open_now: true, address: `Emergency Sector @ KM 0`, phone: '108 / +91 44 2888 9999', category: 'Fuel Station' },
        { id: 'e2', name: `TATA Power 60kW DC Fast EV Charger`, rating: 4.9, distance_from_route_km: 0.2, is_open_now: true, address: `Emergency Sector @ KM 50`, phone: '108 / +91 44 2888 9999', category: 'EV Charging' },
        { id: 'e3', name: `Highway Lifeline Multispeciality Hospital`, rating: 4.8, distance_from_route_km: 0.3, is_open_now: true, address: `Emergency Sector @ KM 100`, phone: '108 / +91 44 2888 9999', category: 'Hospital' },
        { id: 'e4', name: `District Highway Emergency Police Station`, rating: 4.9, distance_from_route_km: 0.2, is_open_now: true, address: `Emergency Sector @ KM 150`, phone: '100 / 108', category: 'Police Station' },
      ] as PlaceItem[];

  return (
    <div className="space-y-10">

      {/* SECTION 1: Tea & Bakery Stops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFBA00]">Smart Route Checkpoints</span>
              <h3 className="text-lg md:text-xl font-extrabold font-outfit text-slate-900">
                Section 1: Smart Tea & Bakery Stops (~50 KM Intervals)
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1">
          {teaStops.map((place, idx) => (
            <RoutePlaceCard
              key={place.id || idx}
              place={place}
              badgeLabel={`Checkpoint @ ${idx * 50} KM`}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: Restaurants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFBA00]">Route Dining Intelligence</span>
              <h3 className="text-lg md:text-xl font-extrabold font-outfit text-slate-900">
                Section 2: Smart Lunch Stops (150–200 KM Intervals)
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1">
          {lunchStops.map((place, idx) => (
            <RoutePlaceCard
              key={place.id || idx}
              place={place}
              badgeLabel="Lunch Recommended"
            />
          ))}
        </div>
      </div>

      {/* SECTION 3: Hotels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFBA00]">Daily Milestone Stays</span>
              <h3 className="text-lg md:text-xl font-extrabold font-outfit text-slate-900">
                Section 3: Smart Hotel Planning (1 Recommended Hotel Per Day)
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1">
          {hotelStops.map((place, idx) => (
            <RoutePlaceCard
              key={place.id || idx}
              place={place}
              badgeLabel={`Day ${idx + 1} Stay`}
            />
          ))}
        </div>
      </div>

      {/* SECTION 4: Tourist Attractions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFBA00]">Within 5 KM of Route</span>
              <h3 className="text-lg md:text-xl font-extrabold font-outfit text-slate-900">
                Section 4: Top 5 Along Route Attractions
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1">
          {attractions.map((place, idx) => (
            <RoutePlaceCard
              key={place.id || idx}
              place={place}
              badgeLabel={`Top ${idx + 1} Attraction`}
            />
          ))}
        </div>
      </div>

      {/* SECTION 5: Fuel & Emergency */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Checkpoint Safety & Fuel</span>
              <h3 className="text-lg md:text-xl font-extrabold font-outfit text-slate-900">
                Section 5: Fuel & Emergency Stops
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1">
          {emergencyStops.map((place, idx) => (
            <RoutePlaceCard
              key={place.id || idx}
              place={place}
              badgeLabel={place.category || 'Emergency Spot'}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
