import React, { useState } from 'react';
import { Calendar, Search, X } from 'lucide-react';

export interface DateFilterState {
  period: 'week' | 'month' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  culture?: string;
}

interface DateFilterProps {
  value: DateFilterState;
  onChange: (filter: DateFilterState) => void;
  showCultureFilter?: boolean;
  availableCultures?: string[];
}

export const DateFilter: React.FC<DateFilterProps> = ({ 
  value, 
  onChange, 
  showCultureFilter,
  availableCultures = []
}) => {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [cultureSearch, setCultureSearch] = useState(value.culture || '');
  const [showCultureNotFound, setShowCultureNotFound] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePeriodChange = (period: 'week' | 'month' | 'year' | 'custom') => {
    onChange({
      ...value,
      period,
      startDate: period === 'custom' ? value.startDate : '',
      endDate: period === 'custom' ? value.endDate : ''
    });
    setIsPeriodOpen(false);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: string) => {
    onChange({
      ...value,
      period: 'custom',
      [field]: date
    });
  };

  const handleCultureSearch = (searchValue: string) => {
    setCultureSearch(searchValue);
    setShowCultureNotFound(false);

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      if (searchValue === '') {
        onChange({
          ...value,
          culture: undefined
        });
        return;
      }

      const foundCulture = availableCultures.find(culture =>
        culture.toLowerCase().includes(searchValue.toLowerCase())
      );

      if (foundCulture) {
        onChange({
          ...value,
          culture: foundCulture
        });
      } else if (searchValue.length > 2) {
        setShowCultureNotFound(true);
      }
    }, 500); // espera 500ms após o usuário parar de digitar

    setDebounceTimer(timer);
  };

  const clearCultureFilter = () => {
    setCultureSearch('');
    setShowCultureNotFound(false);
    if (debounceTimer) clearTimeout(debounceTimer);
    onChange({
      ...value,
      culture: undefined
    });
  };

  const periodOptions = [
    { key: 'week', label: 'Última semana' },
    { key: 'month', label: 'Último mês' },
    { key: 'year', label: 'Último ano' },
    { key: 'custom', label: 'Personalizado' }
  ];

  const getCurrentPeriodLabel = () => {
    return periodOptions.find(option => option.key === value.period)?.label || 'Selecionar período';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
          <Calendar className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="text-md font-semibold text-slate-900">Filtros</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Período</label>
          <div className="relative">
            <button
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              className="w-full px-3 py-2 text-left bg-slate-50 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all flex items-center justify-between"
            >
              <span>{getCurrentPeriodLabel()}</span>
              <span className={`transition-transform ${isPeriodOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {isPeriodOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                {periodOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handlePeriodChange(key as any)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                      value.period === key ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Culture Filter */}
        {showCultureFilter && availableCultures.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cultura</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cultura..."
                  value={cultureSearch}
                  onChange={(e) => handleCultureSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                {cultureSearch && (
                  <button
                    onClick={clearCultureFilter}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {showCultureNotFound && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Cultura não encontrada. Tente outro termo.</p>
                </div>
              )}
              
              {value.culture && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    Filtrando por: <span className="font-medium">{value.culture}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Date Inputs */}
      {value.period === 'custom' && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Data inicial</label>
            <input
              type="date"
              value={value.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Data final</label>
            <input
              type="date"
              value={value.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
