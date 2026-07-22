import React, { useState } from 'react';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { useTracking } from '../context/TrackingContext';
import { Users, Navigation, QrCode, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const MapPage: React.FC = () => {
  const { members, radiusKm, setRadiusKm, missingMembers, isSosActive, simulateMemberMove } = useTracking();
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      <div className="glass-panel p-4 sm:p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" /> Live Centroid GPS & OpenStreetMap
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900">
            Group Location & Geofence Map
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 px-2">Geofence:</span>
          {[3, 5, 7, 10].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRadiusKm(r);
                toast.success(`Geofence boundary set to ${r} KM`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                radiusKm === r
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r} KM
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-200 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-cyan-600" /> Share Trip QR / Code
          </button>
        </div>
      </div>

      <InteractiveMap height="600px" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs uppercase tracking-wider text-amber-700 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing Member Detector (&gt;300m)
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
              missingMembers.length > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {missingMembers.length} Flagged
            </span>
          </div>

          {missingMembers.length === 0 ? (
            <div className="text-xs text-slate-500 py-4 text-center font-medium">
              All group members are within 300 meters of the group centroid.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {missingMembers.map((m) => (
                <div key={m.member_id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1 font-medium">
                  <div className="flex items-center justify-between font-bold">
                    <span>{m.member_name}</span>
                    <span className="text-amber-700 font-mono">{m.distance_from_center}m Away</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Status: Straying &gt;300m from group center. Firebase location update triggered.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-panel p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-600" /> Live Telemetry & GPS Simulator
            </span>
            <span className="text-xs text-slate-500 font-medium">Click buttons to test live distance alerts</span>
          </div>

          <div className="space-y-2 text-xs">
            {members.map((m) => (
              <div key={m.member_id} className="glass-card p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    m.is_sos_active ? 'bg-rose-600 animate-ping' : m.is_missing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <span className="font-bold text-slate-900 block">{m.member_name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Battery: {m.battery_level}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-slate-600 text-[11px] font-medium">
                    Distance: <strong className="text-slate-900">{m.distance_from_center}m</strong>
                  </span>

                  <button
                    onClick={() => simulateMemberMove(m.member_id, 0.003, 0.003)}
                    className="px-2.5 py-1 rounded bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                    title="Simulate straying 350m away"
                  >
                    Simulate Stray (+350m)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-sm w-full text-center space-y-6 border border-slate-300 shadow-xl bg-white">
            <h3 className="text-xl font-bold text-slate-900">Join Trip QR Code</h3>
            <div className="bg-slate-50 p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border border-slate-200 shadow-inner">
              <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="25" height="25" fill="black" />
                <rect x="65" y="10" width="25" height="25" fill="black" />
                <rect x="10" y="65" width="25" height="25" fill="black" />
                <rect x="45" y="45" width="10" height="10" fill="black" />
                <rect x="65" y="65" width="25" height="25" fill="black" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Trip Code:</span>
              <span className="text-xl font-mono font-extrabold text-emerald-700 tracking-wider">TRIP-OOTY-8821</span>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
