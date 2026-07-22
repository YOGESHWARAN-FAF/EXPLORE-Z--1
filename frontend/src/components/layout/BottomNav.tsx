import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Map, ShieldAlert, MessageSquare } from 'lucide-react';
import { useTracking } from '../../context/TrackingContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { triggerSos, isSosActive } = useTracking();

  const items = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { label: 'Plan Page', path: '/planner', icon: Map },
    { label: 'AI Assistant', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="glass-panel px-4 py-2 flex items-center justify-around border border-slate-200 shadow-xl bg-white/95 backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-orange-600 bg-orange-50 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => triggerSos('Mobile Member')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
            isSosActive ? 'bg-rose-600 text-white animate-sos' : 'text-rose-600 bg-rose-50'
          }`}
        >
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span className="text-[10px]">SOS</span>
        </button>
      </div>
    </div>
  );
};
