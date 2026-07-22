import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DESTINATIONS = ["Ooty", "Manali", "Goa", "Paris", "Tokyo", "Kerala", "Kyoto", "Zurich"];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Typewriter effect state
  const [placeIndex, setPlaceIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPlace = DESTINATIONS[placeIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText.length < currentPlace.length) {
      timer = setTimeout(() => {
        setDisplayText(currentPlace.substring(0, displayText.length + 1));
      }, 150);
    } else if (!isDeleting && displayText.length === currentPlace.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentPlace.substring(0, displayText.length - 1));
      }, 80);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setPlaceIndex((prev) => (prev + 1) % DESTINATIONS.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, placeIndex]);

  const handleLetsGo = () => {
    if (user) {
      // User logged in -> go to Dashboard directly
      navigate('/dashboard');
    } else {
      // User unauthenticated -> go to Login / Register page
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative px-4 text-center">
      {/* Background Subtle Orange Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-extrabold shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
          <span>AI-Powered Personalized Tourism & Group Safety Platform</span>
        </motion.div>

        {/* Main Title with Animated Typewriter Text in Orange */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-7xl font-extrabold font-outfit text-slate-900 tracking-tight leading-tight"
        >
          Plan Your Next Adventure to{' '}
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent underline decoration-orange-400/40 font-mono">
            {displayText}
            <span className="animate-pulse text-orange-600">|</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Personalized itineraries tailored for member health profiles, real-time group GPS tracking, missing member alerts (&gt;300m), and 1-click emergency SOS.
        </motion.p>

        {/* Big Orange Let's Go Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-4"
        >
          <button
            onClick={handleLetsGo}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-lg sm:text-xl shadow-glow-orange hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto group border border-orange-400"
          >
            <span>LET'S GO</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <span className="block text-xs text-slate-500 mt-3 font-semibold">
            {user ? `Logged in as ${user.email} • Click to open Dashboard` : 'Sign in or Register to start trip planning'}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
