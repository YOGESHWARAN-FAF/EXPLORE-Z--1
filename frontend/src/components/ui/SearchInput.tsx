import React from 'react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  icon,
  rightElement,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 font-medium text-base md:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/50 focus:border-[#FFBA00] ${
            icon ? 'pl-12' : 'pl-4'
          } ${rightElement ? 'pr-12' : 'pr-4'} py-3.5 ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs font-bold text-rose-600 pl-1">{error}</p>}
    </div>
  );
};
