
import React from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherAlert } from '@/components/WeatherAlert';
import { CropAnalysisCard } from '@/components/CropAnalysisCard';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useUserSession } from '@/hooks/useUserSession';
import { Sun, AlertTriangle, Thermometer, Droplets, Wind, CloudSun } from 'lucide-react';

const DadosClimaticos = () => {
  const { userId } = useUserSession();
  
  // Coordenadas de exemplo - em uma implementação real, essas seriam obtidas do perfil do usuário
  const lat = -15.7942;
  const lon = -47.8822;
  
  const { data, isLoading, error } = useWeatherData(userId, lat, lon);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Carregando dados climáticos...</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium text-lg mb-2">Erro ao carregar dados climáticos</p>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-md mb-4">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dados Climáticos</h1>
            <p className="text-gray-600">Informações meteorológicas e impactos nas suas culturas</p>
          </div>

          {/* Weather Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">🌡️</div>
              <div className="text-2xl font-bold text-orange-600 mb-1">{data?.current.temperature}°C</div>
              <div className="text-sm text-gray-600">Temperatura Atual</div>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">💨</div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{data?.current.windSpeed} km/h</div>
              <div className="text-sm text-gray-600">Velocidade do Vento</div>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm text-gray-600 mb-1">Máximas (7 dias)</div>
              <div className="text-xs text-gray-500">
                {data?.forecast.map(day => `${day.high}°`).join(' ') || 'N/A'}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">🌧️</div>
              <div className="text-sm text-gray-600 mb-1">Chuva (7 dias)</div>
              <div className="text-xs text-gray-500">
                {data?.forecast.map(day => `${day.rain}mm`).join(' ') || 'N/A'}
              </div>
            </div>
          </div>

          {/* Impacted Crops Section */}
          {data?.alerts && data.alerts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌾</span>
                <h2 className="text-xl font-bold text-gray-900">Culturas plantadas no último mês que podem ser impactadas</h2>
              </div>
              
              <div className="space-y-4">
                {data.alerts.map((alert, index) => (
                  <CropAnalysisCard 
                    key={index}
                    cultura={alert.cultura}
                    impacto={alert.impacto}
                    mensagem={alert.mensagem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Weather Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <WeatherCard 
              title="Previsão do Tempo"
              icon="🌤️"
            >
              <div className="space-y-4">
                {data?.forecast.slice(0, 5).map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{day.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{day.icon}</span>
                      <span className="font-semibold">{day.high}°C</span>
                      <span className="text-xs text-gray-500">({day.rain}mm)</span>
                    </div>
                  </div>
                ))}
              </div>
            </WeatherCard>

            <WeatherCard 
              title="Análise Detalhada"
              icon="📊"
            >
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Temperatura Máxima</div>
                    <div className="text-lg font-bold text-orange-600">{data?.forecast[0]?.high}°C</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Precipitação Hoje</div>
                    <div className="text-lg font-bold text-blue-600">{data?.forecast[0]?.rain}mm</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CloudSun className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Condição</div>
                    <div className="text-lg font-bold text-yellow-600">{data?.forecast[0]?.condition}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Wind className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Vento</div>
                    <div className="text-lg font-bold text-slate-600">{data?.current.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            </WeatherCard>
          </div>

          {/* Weather Alerts */}
          {data?.forecast.some(day => day.rain > 0) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Alertas Meteorológicos</h3>
              <WeatherAlert 
                type="Previsão de Chuva"
                message="Precipitação prevista para os próximos dias. Monitore suas culturas e ajuste as práticas de irrigação conforme necessário."
                severity="medium"
              />
            </div>
          )}

          {data?.forecast.some(day => day.high > 30) && (
            <div className="space-y-4 mt-4">
              <WeatherAlert 
                type="Alerta de Calor"
                message="Temperaturas elevadas previstas. Recomenda-se irrigação adicional e monitoramento das culturas sensíveis ao calor."
                severity="high"
              />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default DadosClimaticos;
