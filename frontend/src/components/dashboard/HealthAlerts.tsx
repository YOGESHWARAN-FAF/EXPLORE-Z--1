import React from 'react';
import { HeartPulse, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { HealthRecommendation } from '../../context/TripContext';

interface HealthProps {
  healthRecs: HealthRecommendation[];
}

export const HealthAlerts: React.FC<HealthProps> = ({ healthRecs }) => {
  if (!healthRecs || healthRecs.length === 0) return null;

  return (
    <div className="glass-panel p-6 border border-slate-200 space-y-4 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs uppercase tracking-wider text-rose-600 font-bold flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" /> Health AI Advisory & Member Precautions
        </span>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
          {healthRecs.length} Member Constraints
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthRecs.map((rec, idx) => {
          const warnings = rec.medical_warnings || rec.avoid_activities || [];
          const recs = rec.suitable_activities || rec.recommended_activities || [];
          const kit = rec.emergency_kit_items || rec.special_care_tips || [];

          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-sm text-slate-900">{rec.member_name}</span>
                {rec.walking_limit && <span className="text-xs font-bold text-orange-600">Walking: {rec.walking_limit}</span>}
              </div>

              {warnings.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Medical Warnings / Avoid:
                  </span>
                  <ul className="list-disc list-inside text-xs text-rose-900 space-y-0.5 font-medium">
                    {warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recs.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Recommended Activities:
                  </span>
                  <p className="text-xs text-emerald-900 font-medium">{recs.join(', ')}</p>
                </div>
              )}

              {kit.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-cyan-600" /> Care Tips / Medical Kit:
                  </span>
                  <p className="text-xs text-slate-700 font-medium">{kit.join(', ')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
