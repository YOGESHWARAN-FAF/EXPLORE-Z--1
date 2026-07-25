import React from 'react';

interface SaaSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'interactive';
  glow?: boolean;
  children: React.ReactNode;
}

export const SaaSCard: React.FC<SaaSCardProps> = ({
  variant = 'glass',
  glow = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-[2rem] md:rounded-[2.5rem] transition-all duration-300 overflow-hidden';

  const variantStyles = {
    glass: 'bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-slate-900',
    solid: 'bg-white border border-slate-200 text-slate-900 shadow-lg',
    interactive: 'bg-white/95 backdrop-blur-2xl border border-slate-200 hover:border-[#FFBA00] hover:shadow-2xl hover:shadow-[#FFBA00]/20 hover:scale-[1.01] text-slate-900 cursor-pointer',
  };

  const glowStyles = glow ? 'ring-2 ring-[#FFBA00]/50 shadow-[0_0_30px_rgba(255,186,0,0.2)]' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
