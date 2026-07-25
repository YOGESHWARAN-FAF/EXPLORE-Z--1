import React from 'react';

interface StatWidgetProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  badge?: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  icon,
  badge,
  subtext,
  className = '',
}) => {
  return (
    <div className={`bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl space-y-2 hover:border-slate-700 transition ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">{label}</span>
        {icon && <span className="text-xl shrink-0">{icon}</span>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl md:text-3xl font-black font-outfit text-white">{value}</span>
        {badge && (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{subtext}</p>}
    </div>
  );
};
