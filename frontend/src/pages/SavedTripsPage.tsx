import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, Compass, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { SaaSCard } from '../components/ui/SaaSCard';
import { SaaSButton } from '../components/ui/SaaSButton';
import api from '../services/api';

export const SavedTripsPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 bg-white min-h-[85vh] text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#FFBA00]" /> Saved Trips & Firebase History
          </h1>
          <p className="text-xs text-slate-500 font-medium">Synced with Firebase Realtime Database (/saved_trips)</p>
        </div>
        <SaaSButton
          variant="gold"
          size="sm"
          onClick={() => navigate('/planner')}
        >
          + Plan New Trip
        </SaaSButton>
      </div>

      {allTrips.length === 0 ? (
        <SaaSCard className="p-12 text-center space-y-4 bg-white">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">No saved trips found. Create your first AI trip plan!</p>
        </SaaSCard>
      ) : (
        <div className="space-y-4">
          {allTrips.map((trip) => (
            <SaaSCard key={trip.trip_id} className="p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#FFBA00] font-black">{trip.trip_id}</span>
                <h3 className="text-xl font-black font-outfit text-slate-900">{trip.destination}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {trip.duration}</span>
                  <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-slate-400" /> ₹{trip.budget}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTrip(trip);
                    navigate('/dashboard');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  View Dashboard <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </SaaSCard>
          ))}
        </div>
      )}
    </div>
  );
};
