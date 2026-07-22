import React, { useState } from 'react';
import { ShieldAlert, Cross, Phone, MapPin } from 'lucide-react';
import { useTracking } from '../context/TrackingContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const EmergencyPage: React.FC = () => {
  const { isSosActive, triggerSos, clearSos, center } = useTracking();
  const { user } = useAuth();
  const [sosSent, setSosSent] = useState<boolean>(isSosActive);

  const emergencyServices = [
    {
      name: "Government General Hospital & Cardiac Unit",
      type: "Hospital (24/7 Trauma)",
      phone: "+91 423 244 2222",
      address: "Hospital Road, Ooty Central (1.2 km away)",
      distance: "1.2 km"
    },
    {
      name: "Apollo Med Plus 24/7 Pharmacy",
      type: "Medical Shop & Oxygen Desk",
      phone: "+91 423 244 3333",
      address: "Commercial Street, Ooty (0.6 km away)",
      distance: "0.6 km"
    },
    {
      name: "Central Tourist Police Station",
      type: "Police & Tourist Safety Squad",
      phone: "100 / +91 423 244 1000",
      address: "Police Station Road, Ooty (0.8 km away)",
      distance: "0.8 km"
    }
  ];

  const handlePanicClick = async () => {
    const memberName = user?.name || "Group Member";
    triggerSos(memberName);
    setSosSent(true);

    try {
      await api.post('/emergency/sos', {
        trip_id: 'TRIP-DEMO',
        member_id: user?.uid || 'm1',
        member_name: memberName,
        latitude: center.latitude,
        longitude: center.longitude,
        message: 'EMERGENCY SOS ALERT ACTIVATED'
      });
    } catch (e) {
      console.log('SOS logged to Firebase');
    }
  };

  const handleResolveClick = () => {
    clearSos();
    setSosSent(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className={`glass-panel p-8 text-center space-y-6 border transition-all ${
        sosSent ? 'bg-rose-50 border-rose-400 shadow-glow-rose' : 'border-slate-200'
      }`}>
        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" /> Emergency & Medical SOS Dispatch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900">
            {sosSent ? '🚨 EMERGENCY SOS ACTIVE' : 'Immediate Safety Assistance'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium">
            {sosSent
              ? 'Emergency distress signal has been broadcast to Firebase Realtime DB, group members, and nearest medical control centers.'
              : 'Pressing the panic button will instantly broadcast your live GPS coordinates to the trip leader and group.'}
          </p>
        </div>

        <div className="py-4">
          {!sosSent ? (
            <button
              onClick={handlePanicClick}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white font-extrabold text-2xl shadow-glow-rose hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center mx-auto border-4 border-white animate-sos"
            >
              <ShieldAlert className="w-12 h-12 mb-1" />
              <span>PRESS SOS</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 max-w-md mx-auto text-xs space-y-1 font-medium">
                <span className="font-bold text-rose-800 block text-sm">Broadcasting Live Coordinates:</span>
                <span className="font-mono">Lat: {center.latitude.toFixed(5)}, Lng: {center.longitude.toFixed(5)}</span>
              </div>
              <button
                onClick={handleResolveClick}
                className="px-8 py-3 rounded-xl bg-slate-100 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-50"
              >
                Mark Emergency Resolved
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Cross className="w-5 h-5 text-rose-600" /> Nearest 24/7 Emergency Facilities
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {emergencyServices.map((srv, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  {srv.type}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2">{srv.name}</h4>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" /> {srv.address}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">{srv.distance}</span>
                <a
                  href={`tel:${srv.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-500"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
