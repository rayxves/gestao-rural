
import React from 'react';

interface WeatherAlertProps {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const WeatherAlert: React.FC<WeatherAlertProps> = ({
  type,
  message,
  severity
}) => {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getSeverityStyles()}`}>
      <h4 className="font-medium text-sm">{type}</h4>
      <p className="text-xs mt-1 opacity-90">{message}</p>
    </div>
  );
};
