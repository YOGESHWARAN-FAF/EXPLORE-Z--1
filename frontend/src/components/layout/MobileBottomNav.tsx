import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, Sparkles, Newspaper, MessageSquare } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { label: 'Plan', path: '/planner', icon: Map },
    { label: 'News', path: '/news', icon: Newspaper },
    { label: 'AI Chat', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl rounded-full px-2 py-2 text-slate-900 flex items-center justify-around md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 active:scale-95 min-w-[54px] min-h-[44px] ${
              isActive
                ? 'bg-[#FFBA00] text-black font-black shadow-md scale-105'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-slate-600'}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-black' : 'font-semibold'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
