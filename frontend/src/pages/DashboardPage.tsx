import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Sparkles, Map, ShieldCheck, Sun, Wallet, History, ArrowRight, Star, HeartPulse } from 'lucide-react';
import { useTrip, TripPlan } from '../context/TripContext';
import api from '../services/api';

const FEATURED_RECOMMENDATIONS = [
  {
    destination: "Ooty",
    tagline: "Queen of Hill Stations • Botanical & Tea Excursions",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600",
    rating: 4.9,
    bestSeason: "Oct - Jun",
    avgTemp: "18°C",
    budget: 5000,
    duration: "1 Day"
  },
  {
    destination: "Manali",
    tagline: "Snowy Alpine Valleys • Solang Valley Adventures",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600",
    rating: 4.8,
    bestSeason: "Sep - May",
    avgTemp: "14°C",
    budget: 8500,
    duration: "2 Days"
  },
  {
    destination: "Goa",
    tagline: "Sun-Kissed Beaches • Heritage Architecture & Seafood",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
    rating: 4.7,
    bestSeason: "Nov - Feb",
    avgTemp: "28°C",
    budget: 7000,
    duration: "3 Days"
  },
  {
    destination: "Paris",
    tagline: "Iconic Landmarks • Museums & Accessible City Walking",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
    rating: 4.9,
    bestSeason: "Apr - Oct",
    avgTemp: "21°C",
    budget: 25000,
    duration: "3 Days"
  },
  {
    destination: "Tokyo",
    tagline: "Futuristic Transit • Accessible Gardens & Historic Shrines",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
    rating: 4.9,
    bestSeason: "Mar - May",
    avgTemp: "19°C",
    budget: 32000,
    duration: "3 Days"
  },
  {
    destination: "Kerala",
    tagline: "Tranquil Backwaters • Ayurvedic Wellness & Houseboats",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600",
    rating: 4.8,
    bestSeason: "Sep - Mar",
    avgTemp: "26°C",
    budget: 6500,
    duration: "2 Days"
  }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip, savedTrips, setSavedTrips } = useTrip();

  useEffect(() => {
    // Fetch live saved trips from Firebase Realtime DB via FastAPI
    api.get('/planner/saved')
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSavedTrips(res.data);
        }
      })
      .catch(err => console.log('Saved trips fetch notice:', err));
  }, [setSavedTrips]);

  const handlePlanDestination = (dest: string) => {
    navigate(`/planner?dest=${encodeURIComponent(dest)}`);
  };

  const allTrips = activeTrip ? [activeTrip, ...savedTrips.filter(t => t.trip_id !== activeTrip.trip_id)] : savedTrips;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 border border-slate-200 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden bg-white">
        <div className="space-y-2 max-w-2xl z-10">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-800 border border-orange-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> AI Travel Dashboard & Trip Explorer
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900 tracking-tight">
            {activeTrip ? activeTrip.destination : 'Tourist Control Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {activeTrip ? activeTrip.trip_summary : 'Explore your recent trip plans, AI recommendations, and live destination advisories.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/planner"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-glow-orange hover:scale-105 transition-all flex items-center gap-2"
          >
            <Map className="w-4 h-4" /> Open Plan Page & Map
          </Link>
        </div>
      </div>

      {/* SECTION 1: RECENT TRIPS HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5">
              <History className="w-4 h-4 text-orange-600" /> Firebase Realtime DB History
            </span>
            <h2 className="text-2xl font-extrabold font-outfit text-slate-900 mt-0.5">Recent & Saved Trips ({allTrips.length})</h2>
          </div>
          <Link to="/planner" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
            + Plan New Trip <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {allTrips.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs font-semibold bg-white">
            No saved trips found yet. Click "Open Plan Page & Map" to generate your first AI trip!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTrips.map((trip) => (
              <div
                key={trip.trip_id}
                className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 bg-white ${
                  activeTrip?.trip_id === trip.trip_id ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {trip.trip_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {trip.safety_score} / 10 Safe
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 font-outfit">{trip.destination}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 font-medium">{trip.trip_summary}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                    <span>Duration: <strong className="text-slate-900">{trip.duration}</strong></span>
                    <span>Budget: <strong className="text-slate-900">₹{trip.budget}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTrip(trip);
                    navigate('/planner');
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 font-extrabold text-xs border border-orange-200 transition-all flex items-center justify-center gap-1.5"
                >
                  Load in Plan Page & Map <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: NEW TRIP RECOMMENDATIONS */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-orange-600" /> Handpicked Destinations
            </span>
            <h2 className="text-2xl font-extrabold font-outfit text-slate-900 mt-0.5">New AI Trip Recommendations</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_RECOMMENDATIONS.map((rec) => (
            <div key={rec.destination} className="glass-card overflow-hidden group border border-slate-200 flex flex-col justify-between bg-white hover:border-orange-400">
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={rec.image}
                    alt={rec.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 shadow-sm border border-slate-200 backdrop-blur-md">
                    {rec.bestSeason}
                  </span>

                  <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-slate-950" /> {rec.rating}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-2xl font-extrabold font-outfit">{rec.destination}</h3>
                    <p className="text-xs text-slate-200 font-medium line-clamp-1">{rec.tagline}</p>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Average Weather: <strong className="text-slate-900">{rec.avgTemp}</strong></span>
                    <span>Est. Budget: <strong className="text-slate-900">₹{rec.budget}</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handlePlanDestination(rec.destination)}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Plan {rec.destination} Trip <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: QUICK ACTIVE TRIP DATA SUMMARY */}
      {activeTrip && (
        <div className="glass-panel p-6 border border-slate-200 space-y-4 bg-white">
          <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-orange-600" /> Active Destination Overview ({activeTrip.destination})
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Temperature</span>
              <span className="font-extrabold text-slate-900 text-base">{activeTrip.weather_overview.temperature || 22}°C</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Safety Score</span>
              <span className="font-extrabold text-emerald-700 text-base">{activeTrip.safety_score} / 10</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Total Budget</span>
              <span className="font-extrabold text-slate-900 text-base">₹{activeTrip.budget}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Health Constraints</span>
              <span className="font-extrabold text-orange-600 text-base">{activeTrip.health_recommendations.length} Members</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
