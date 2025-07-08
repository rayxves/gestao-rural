
import React from 'react';

interface CropAnalysisCardProps {
  cultura: string;
  impacto: 'positivo' | 'negativo' | 'neutro';
  mensagem: string;
}

export const CropAnalysisCard: React.FC<CropAnalysisCardProps> = ({
  cultura,
  impacto,
  mensagem
}) => {
  const getImpactStyles = () => {
    switch (impacto) {
      case 'positivo':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          icon: '✅'
        };
      case 'negativo':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getImpactStyles();

  return (
    <div className={`p-4 rounded-xl border-2 ${styles.bg} ${styles.text} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-3">
        <span className="text-xl flex-shrink-0">{styles.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-base mb-2">{cultura}</h4>
          <p className="text-sm leading-relaxed opacity-90">{mensagem}</p>
        </div>
      </div>
    </div>
  );
};
