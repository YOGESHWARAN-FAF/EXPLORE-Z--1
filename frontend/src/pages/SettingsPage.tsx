import React from 'react';
import { Settings, User, Shield, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" /> Platform Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">Manage profile, Firebase Realtime DB & safety thresholds</p>
      </div>

      <div className="glass-panel p-6 border border-slate-200 space-y-6 text-xs">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> User Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 font-semibold block mb-1">Display Name</label>
              <input type="text" readOnly value={user?.name || ''} className="w-full glass-input font-medium" />
            </div>
            <div>
              <label className="text-slate-500 font-semibold block mb-1">Email</label>
              <input type="email" readOnly value={user?.email || ''} className="w-full glass-input font-medium" />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" /> Live Firebase Integration
          </h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Firebase Project ID:</span>
              <span className="font-mono text-emerald-700">tourism-e45c9</span>
            </div>
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Realtime Database URL:</span>
              <span className="font-mono text-emerald-700">https://tourism-e45c9-default-rtdb.firebaseio.com</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" /> Safety & Geofence Defaults
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <span>Missing Member Threshold</span>
              <span className="font-bold text-emerald-700 font-mono">300 Meters</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <span>Default Geofence Radius</span>
              <span className="font-bold text-cyan-700 font-mono">5.0 KM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
