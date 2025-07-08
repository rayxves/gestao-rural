
import React from 'react';
import { ModernCard } from './ModernCard';

interface WeatherCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'bordered';
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  title,
  icon,
  children,
  variant = 'default'
}) => {
  return (
    <ModernCard
      title={title}
      icon={icon}
      variant={variant}
      className="h-full"
    >
      {children}
    </ModernCard>
  );
};
