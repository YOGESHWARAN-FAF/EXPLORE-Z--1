import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Map, Newspaper, MessageSquare } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { label: 'Plan', path: '/planner', icon: Map },
    { label: 'News', path: '/news', icon: Newspaper },
    { label: 'AI Chat', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 md:hidden flex items-center justify-between h-16 text-slate-900">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-300 active:scale-95 h-13 mx-0.5 ${
              isActive
                ? 'bg-[#FFBA00] text-black font-black shadow-md shadow-[#FFBA00]/25'
                : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-black stroke-[2.5]' : 'text-slate-500'}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-black' : 'font-bold'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
