import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, ShieldAlert, Sparkles, LogOut, MessageSquare, Newspaper, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTracking } from '../../context/TrackingContext';
import { SaaSButton } from '../ui/SaaSButton';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { triggerSos, isSosActive } = useTracking();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Navigation Links
  const navItems = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { label: 'Plan Page', path: '/planner', icon: Map },
    { label: 'GNews Live', path: '/news', icon: Newspaper },
    { label: 'AI Assistant', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav className="px-5 py-3.5 flex items-center justify-between border border-slate-200 shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-2xl rounded-3xl text-slate-900">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFBA00]/30 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight font-outfit flex items-center gap-1">
              TripPlanner<span className="text-[#FFBA00]">.ai</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold -mt-0.5">
              Smart Tourist & Route Concierge
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-[#FFBA00] text-black shadow-md shadow-[#FFBA00]/30 font-black scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#FFBA00]'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* Emergency SOS Panic Button */}
          <SaaSButton
            variant={isSosActive ? 'danger' : 'sos'}
            size="sm"
            onClick={() => triggerSos(user?.name || 'Group Member')}
            className={isSosActive ? 'animate-sos' : ''}
            icon={<ShieldAlert className="w-4 h-4 animate-bounce text-rose-600" />}
          >
            <span className="hidden sm:inline uppercase tracking-wider font-extrabold">Emergency SOS</span>
          </SaaSButton>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 hover:border-[#FFBA00] transition-all cursor-pointer shadow-sm"
              >
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FFBA00&color=000`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-[#FFBA00] object-cover"
                />
                <span className="hidden lg:inline text-xs font-extrabold">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="p-3 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 block">{user.name}</span>
                    <span className="text-[11px] text-slate-500 truncate block">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <SaaSButton variant="gold" size="sm">
                Login / Register
              </SaaSButton>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 hover:text-[#FFBA00]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FFBA00] text-black font-black'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#FFBA00]'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
