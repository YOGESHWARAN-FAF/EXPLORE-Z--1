import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, Sparkles, LogOut, MessageSquare, Newspaper, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SaaSButton } from '../ui/SaaSButton';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Navigation Links
  const navItems = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { label: 'Plan', path: '/planner', icon: Map },
    { label: 'News', path: '/news', icon: Newspaper },
    { label: 'AI Chat', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between gap-2 text-slate-900">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/30 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight font-outfit leading-none">
                TripPlanner<span className="text-[#FFBA00]">.ai</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                AI Route Concierge
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 hover:border-[#FFBA00] transition-all cursor-pointer shadow-sm min-h-[40px]"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FFBA00&color=000`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-[#FFBA00] object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-extrabold">{user.name.split(' ')[0]}</span>
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
                  Login
                </SaaSButton>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 hover:text-[#FFBA00] flex items-center justify-center transition active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100 bg-white space-y-1 animate-fadeIn">
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
                      ? 'bg-[#FFBA00] text-black font-black shadow-sm'
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
      </div>
    </header>
  );
};
