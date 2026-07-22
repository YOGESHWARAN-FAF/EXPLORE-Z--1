import React from 'react';
import { Sun, CloudRain, Wind, Droplets, ShieldCheck } from 'lucide-react';
import { WeatherInfo } from '../../context/TripContext';

interface WeatherWidgetProps {
  weather: WeatherInfo;
  advice?: string | string[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, advice = [] }) => {
  const adviceText = Array.isArray(advice) ? advice.join(' ') : advice;

  return (
    <div className="glass-panel p-6 border border-slate-200 space-y-4 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Open-Meteo Forecast
          </span>
          <h3 className="text-xl font-bold font-outfit text-slate-900">Destination Weather</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold font-outfit text-slate-900">{weather?.temperature || 22}°C</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            {weather?.condition || "Sunny"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-cyan-600" />
          <div>
            <span className="block text-[10px] text-slate-500">Rain Prob</span>
            <span className="font-bold text-slate-900">{weather?.rain_probability || 10}%</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-blue-600" />
          <div>
            <span className="block text-[10px] text-slate-500">Humidity</span>
            <span className="font-bold text-slate-900">{weather?.humidity || 65}%</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-teal-600" />
          <div>
            <span className="block text-[10px] text-slate-500">Wind</span>
            <span className="font-bold text-slate-900">{weather?.wind_speed || 12.4} km/h</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <div>
            <span className="block text-[10px] text-slate-500">Air Quality</span>
            <span className="font-bold text-slate-900">{weather?.air_quality || "Good"}</span>
          </div>
        </div>
      </div>

      {adviceText && (
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 font-medium">
          <span className="font-bold block text-orange-800">Weather Advice:</span>
          <p>{adviceText}</p>
        </div>
      )}
    </div>
  );
};
