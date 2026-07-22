import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Compass, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import api from '../services/api';

export const SavedTripsPage: React.FC = () => {
  const { savedTrips, setSavedTrips, activeTrip, setActiveTrip } = useTrip();

  useEffect(() => {
    // Fetch live saved trips from Firebase Realtime DB via FastAPI
    api.get('/planner/saved')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setSavedTrips(res.data);
        }
      })
      .catch(err => console.log(err));
  }, [setSavedTrips]);

  const allTrips = activeTrip ? [activeTrip, ...savedTrips.filter(t => t.trip_id !== activeTrip.trip_id)] : savedTrips;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" /> Saved Trips & Firebase History
          </h1>
          <p className="text-xs text-slate-500 font-medium">Synced with Firebase Realtime Database (/saved_trips)</p>
        </div>
        <Link
          to="/planner"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-500"
        >
          + Plan New Trip
        </Link>
      </div>

      {allTrips.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">No saved trips found. Create your first AI trip plan!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allTrips.map((trip) => (
            <div key={trip.trip_id} className="glass-panel p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 font-bold">{trip.trip_id}</span>
                <h3 className="text-xl font-bold text-slate-900">{trip.destination}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {trip.duration}</span>
                  <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-slate-500" /> ₹{trip.budget}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTrip(trip)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                >
                  View Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
