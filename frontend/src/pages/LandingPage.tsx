import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Map, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { SaaSCard } from '../components/ui/SaaSCard';
import { SaaSButton } from '../components/ui/SaaSButton';

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
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative px-4 text-center py-12 space-y-16 bg-white text-slate-900">
      {/* Background Subtle Emerald Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-[32rem] h-96 md:h-[32rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Top SaaS Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI-Powered Route & Smart Tourism Concierge</span>
        </motion.div>

        {/* Main Title with Animated Typewriter Text in Emerald */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-7xl font-black font-outfit text-slate-900 tracking-tight leading-tight"
        >
          Plan Your Next Journey to{' '}
          <span className="text-emerald-600 underline decoration-emerald-500/40 font-mono">
            {displayText}
            <span className="animate-pulse text-emerald-600">|</span>
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

        {/* Big Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-4 space-y-3"
        >
          <SaaSButton
            variant="gold"
            size="lg"
            onClick={handleLetsGo}
            icon={<ArrowRight className="w-5 h-5" />}
            className="text-base font-black px-10 py-5 shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-all"
          >
            Start Planning Journey
          </SaaSButton>
        </motion.div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full relative z-10">
        {[
          { icon: Map, title: "Checkpoint Routing", desc: "POIs every 5–10 km along your driving corridor." },
          { icon: ShieldCheck, title: "Health Guard", desc: "Senior, diabetic, and cardiac friendly schedule rules." },
          { icon: Zap, title: "15 POI Categories", desc: "Top 3 attractions, hotels, bakeries, EVs & ATMs." }
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <SaaSCard key={idx} className="p-6 text-left space-y-3 border-slate-200 bg-white">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-200">
                <IconComp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </SaaSCard>
          );
        })}
      </div>
    </div>
  );
};
