import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { ScheduleItem } from '../../context/TripContext';

interface TimelineProps {
  schedule: ScheduleItem[];
}

export const TimelineView: React.FC<TimelineProps> = ({ schedule }) => {
  return (
    <div className="glass-panel p-6 border border-slate-200 space-y-6 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs uppercase tracking-wider text-orange-600 font-bold flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-orange-600" /> AI Generated Schedule
        </span>
        <span className="text-xs text-slate-500 font-medium font-outfit">{schedule?.length || 0} Planned Stops</span>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
        {schedule?.map((item, idx) => (
          <div key={idx} className="relative pl-8 space-y-2 group">
            <div className="absolute left-1.5 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white ring-4 ring-orange-100 group-hover:scale-125 transition-transform" />

            <div className="glass-card p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600" /> {item.title}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-600" /> {item.time} ({item.duration})
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.description}</p>

              {item.safety_tips && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium">
                  <strong>Safety Note:</strong> {item.safety_tips}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
