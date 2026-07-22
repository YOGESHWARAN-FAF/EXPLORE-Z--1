import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, ShieldAlert, Sparkles, LogOut, MessageSquare, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTracking } from '../../context/TrackingContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { triggerSos, isSosActive } = useTracking();
  const [showDropdown, setShowDropdown] = useState(false);

  // Core 5 Navigation Links
  const navItems = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { label: 'Plan Page', path: '/planner', icon: Map },
    { label: 'AI Assistant', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav className="glass-panel px-5 py-3 flex items-center justify-between border border-slate-200 shadow-md bg-white/95 backdrop-blur-xl">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-glow-orange group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight font-outfit flex items-center gap-1">
              AI Tourist <span className="text-orange-600">Planner</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-orange-600 font-bold -mt-0.5">
              Personalized Tourism & Group Safety
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-full border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* Emergency SOS Panic Button */}
          <button
            onClick={() => triggerSos(user?.name || 'Group Member')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isSosActive
                ? 'bg-rose-600 text-white animate-sos shadow-glow-rose'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline uppercase tracking-wider">Emergency SOS</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all"
              >
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-orange-500 object-cover"
                />
                <span className="hidden lg:inline text-xs font-bold">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                  <div className="p-3 border-b border-slate-100">
                    <span className="font-bold text-slate-900 block">{user.name}</span>
                    <span className="text-[11px] text-slate-500 truncate block">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold transition-all shadow-glow-orange"
            >
              Login / Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
