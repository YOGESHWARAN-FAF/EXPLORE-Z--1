import React from 'react';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fadeIn">
      <div
        className={`bg-zinc-950/95 border border-zinc-800 rounded-[2.5rem] p-6 md:p-8 ${maxWidthStyles[maxWidth]} w-full shadow-2xl space-y-6 text-white text-center relative overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-extrabold font-outfit text-white">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
