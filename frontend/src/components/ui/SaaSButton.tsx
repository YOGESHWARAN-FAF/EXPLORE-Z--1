import React from 'react';

interface SaaSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'sos' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const SaaSButton: React.FC<SaaSButtonProps> = ({
  variant = 'gold',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-black transition-all duration-300 rounded-full active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-xs md:text-sm',
    lg: 'px-8 py-4 text-sm md:text-base',
  };

  const variantStyles = {
    primary: 'bg-[#FFBA00] hover:bg-[#FF9F00] text-black shadow-lg shadow-[#FFBA00]/25 border border-[#FFBA00] hover:scale-105 font-black',
    gold: 'bg-[#FFBA00] hover:bg-[#FF9F00] text-black shadow-lg shadow-[#FFBA00]/25 border border-[#FFBA00] hover:scale-105 font-black',
    outline: 'bg-white hover:bg-slate-50 text-slate-900 hover:text-[#FFBA00] border border-slate-300 hover:border-[#FFBA00] shadow-sm font-bold',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold',
    sos: 'bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 shadow-lg shadow-rose-600/10 font-black',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 border border-rose-500 font-black',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
