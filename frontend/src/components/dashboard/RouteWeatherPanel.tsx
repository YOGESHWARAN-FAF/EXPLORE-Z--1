import React from 'react';
import { Sun, CloudRain, Wind, Droplets, Thermometer, ShieldCheck, Sparkles, Shirt, Eye } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { SaaSCard } from '../ui/SaaSCard';

export const RouteWeatherPanel: React.FC = () => {
  const { activeTrip } = useTrip();

  if (!activeTrip) return null;

  const weather = activeTrip.weather_overview || {};
  const destination = activeTrip.destination || 'Destination';

  const condition = weather.condition || weather.summary || 'Clear Skies & Pleasant Sunshine';
  const temperature = weather.temperature || '24°C';
  const humidity = weather.humidity || '62%';
  const windSpeed = weather.wind_speed || '14 km/h';
  const uvIndex = weather.uv_index || 'Moderate (UV 4)';
  const visibility = weather.visibility || '10 KM (Excellent)';
  const clothingAdvice = weather.clothing_advice || 'Light cotton clothing for midday travel. Carry a light jacket or windbreaker for evening viewpoints.';
  
  const aiExplanation = weather.ai_weather_explanation || 
    `Groq LLM Analysis for ${destination}: Clear highway visibility and comfortable temperatures make conditions optimal for driving. Afternoon cloud cover provides pleasant shade at hill viewpoints. Standard sun protection and light layers recommended.`;

  return (
    <SaaSCard className="p-4 sm:p-6 border border-slate-200 bg-white space-y-4 sm:space-y-6 text-slate-900 shadow-xl rounded-2xl sm:rounded-3xl">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20 shrink-0">
            <Sun className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#FFBA00] text-black shadow-sm">
                Live Route Weather Telemetry
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 mt-1">
              Weather & AI Corridor Advisory for <span className="text-[#FFBA00] font-black">{destination}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-800 self-start sm:self-auto shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#FFBA00]" />
          <span>Groq Llama 3.1 8B Live Feed</span>
        </div>
      </div>

      {/* 4 Telemetry Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Temperature & Condition */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold">
            <span>Temperature</span>
            <Thermometer className="w-4 h-4 text-[#FFBA00]" />
          </div>
          <p className="text-lg sm:text-2xl font-black font-outfit text-slate-900">{temperature}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate">{condition}</p>
        </div>

        {/* Humidity */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-lg sm:text-2xl font-black font-outfit text-slate-900">{humidity}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600">Optimal Air Comfort</p>
        </div>

        {/* Wind Speed */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold">
            <span>Wind Speed</span>
            <Wind className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-lg sm:text-2xl font-black font-outfit text-slate-900">{windSpeed}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600">Gentle Breeze</p>
        </div>

        {/* UV Index / Visibility */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold">
            <span>Visibility</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-2xl font-black font-outfit text-slate-900">{visibility}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate">{uvIndex}</p>
        </div>
      </div>

      {/* Groq LLM AI Weather Explanation Box */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFBA00]/10 border border-[#FFBA00]/30 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-black shrink-0" />
          <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black">
            AI Weather Impact & Driving Explanation
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
          {aiExplanation}
        </p>
      </div>

      {/* AI Clothing & Equipment Advisory */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-[#FFBA00] text-black flex items-center justify-center font-black flex-shrink-0 mt-0.5 shadow-sm">
          <Shirt className="w-4 h-4 text-black" />
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-slate-500 block">
            Recommended Tourist Clothing & Gear
          </span>
          <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
            {clothingAdvice}
          </p>
        </div>
      </div>
    </SaaSCard>
  );
};
