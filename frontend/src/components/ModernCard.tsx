
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModernCardProps {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'bordered';
  loading?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
  variant = 'default',
  loading = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 border-slate-200/50 hover:border-emerald-200/60';
      case 'bordered':
        return 'bg-white border border-slate-200 hover:border-slate-300/60';
      default:
        return 'bg-white/90 backdrop-blur-sm border-slate-200/40 hover:border-slate-300/50';
    }
  };

  return (
    <Card className={`${getVariantClasses()} shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base font-semibold text-slate-700">
          {icon && (
            <span className="text-xl flex-shrink-0">{icon}</span>
          )}
          <div className="flex flex-col">
            <span>{title}</span>
            {description && (
              <span className="text-xs font-normal text-slate-500 mt-1">{description}</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex flex-col items-center space-y-3 py-6">
            <div className="relative w-6 h-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full h-6 w-6 border-t-2 border-emerald-500 animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Carregando...</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
