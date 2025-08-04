
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  submessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Carregando...',
  submessage
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 py-6">
      <div className={`relative ${getSizeClasses()}`}>
        <div className={`animate-spin rounded-full ${getSizeClasses()} border-2 border-slate-200`}></div>
        <div className={`absolute inset-0 rounded-full ${getSizeClasses()} border-t-2 border-emerald-500 animate-spin`}></div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-slate-600 font-medium text-sm">{message}</p>
        {submessage && (
          <p className="text-xs text-slate-500">{submessage}</p>
        )}
      </div>
    </div>
  );
};
