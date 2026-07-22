import React from 'react';
import { ShieldCheck, Users, AlertCircle } from 'lucide-react';

interface SafetyProps {
  score: number;
  crowdPrediction?: string;
  emergencySuggestions?: string[];
}

export const SafetyScoreCard: React.FC<SafetyProps> = ({ score, crowdPrediction = "Moderate", emergencySuggestions = [] }) => {
  return (
    <div className="glass-panel p-6 border border-slate-200 space-y-4 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-orange-600" /> AI Safety Index
        </span>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
          9.4 / 10 Safe
        </span>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="w-20 h-20 rounded-full border-4 border-orange-500 flex items-center justify-center text-2xl font-extrabold text-slate-900 bg-orange-50 font-outfit">
          {score}
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Crowd Density:</span>
          <p className="text-base font-extrabold text-slate-900">{crowdPrediction}</p>
          <span className="text-xs text-slate-500 block font-medium">Optimal visiting times: 08:30 AM - 11:30 AM</span>
        </div>
      </div>

      {emergencySuggestions.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700 font-medium">
          <span className="font-bold text-slate-900 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-600" /> Safety Suggestions:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {emergencySuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
