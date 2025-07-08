
import { useState, useEffect } from 'react';

interface WeatherData {
  current: {
    temperature: string;
    humidity?: string;
    windSpeed: string;
    condition?: string;
    icon?: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low?: number;
    rain: number;
    condition?: string;
    icon?: string;
  }>;
  alerts: Array<{
    cultura: string;
    impacto: 'positivo' | 'negativo' | 'neutro';
    mensagem: string;
  }>;
}

interface APIResponse {
  temperaturaAtual: string;
  vento: string;
  maximosProximosDias: string;
  chuvaProximosDias: string;
  ia: string;
}

export const useWeatherData = (userId?: string, lat?: number, lon?: number) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!userId || !lat || !lon) {
        setError('Dados de localização não disponíveis');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 40000); 

        console.log('Fazendo requisição para dados climáticos com:', { user_id: userId, lat, lon });

        const response = await fetch('https://api.teste.onlinecenter.com.br/webhook/dados-climaticos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            lat: lat,
            lon: lon
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const apiData: APIResponse = await response.json();
        console.log('Resposta da API:', apiData);
        
        if (!apiData) {
          throw new Error('Nenhum dado climático encontrado');
        }

        // Parse forecast data - handle the double-quoted JSON strings
        let maxTemps: number[] = [];
        let rainData: number[] = [];
        
        try {
          // Clean up the JSON strings by removing extra quotes
          let maxTempsStr = apiData.maximosProximosDias;
          let rainStr = apiData.chuvaProximosDias;
          
          // Remove outer quotes if they exist
          if (maxTempsStr.startsWith('"') && maxTempsStr.endsWith('"')) {
            maxTempsStr = maxTempsStr.slice(1, -1);
          }
          if (rainStr.startsWith('"') && rainStr.endsWith('"')) {
            rainStr = rainStr.slice(1, -1);
          }
          
          // Parse the JSON arrays
          maxTemps = JSON.parse(maxTempsStr);
          rainData = JSON.parse(rainStr);
          
          console.log('Máximas parseadas:', maxTemps);
          console.log('Chuva parseada:', rainData);
        } catch (parseError) {
          console.error('Erro ao parsear dados de previsão:', parseError);
          console.error('Dados originais:', { maximos: apiData.maximosProximosDias, chuva: apiData.chuvaProximosDias });
          maxTemps = [];
          rainData = [];
        }

        // Parse IA analysis - handle the new format
        let iaAnalysis: Array<{cultura: string, impacto: string, mensagem: string}> = [];
        try {
          const iaText = apiData.ia;
          console.log('Texto da IA completo:', iaText);
          
          // Try to extract JSON from the text - look for array patterns
          const jsonMatch = iaText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            console.log('JSON extraído:', jsonStr);
            iaAnalysis = JSON.parse(jsonStr);
            console.log('Análise IA parseada:', iaAnalysis);
          } else {
            // If no JSON array found, try to find individual objects
            const objectMatches = iaText.match(/\{[\s\S]*?\}/g);
            if (objectMatches) {
              iaAnalysis = objectMatches.map(match => {
                try {
                  return JSON.parse(match);
                } catch {
                  return null;
                }
              }).filter(item => item !== null);
            }
          }
        } catch (parseError) {
          console.error('Erro ao parsear análise da IA:', parseError);
          console.error('Texto original da IA:', apiData.ia);
          iaAnalysis = [];
        }

        // Build forecast array
        const forecast = maxTemps.map((temp, index) => ({
          date: index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : `Dia ${index + 1}`,
          high: temp,
          rain: rainData[index] || 0,
          condition: rainData[index] > 0 ? 'Chuvoso' : 'Ensolarado',
          icon: rainData[index] > 0 ? '🌧️' : '☀️'
        }));

        const processedData: WeatherData = {
          current: {
            temperature: apiData.temperaturaAtual,
            windSpeed: apiData.vento,
            condition: 'Atual',
            icon: '🌡️'
          },
          forecast,
          alerts: iaAnalysis.map(item => ({
            cultura: item.cultura,
            impacto: item.impacto as 'positivo' | 'negativo' | 'neutro',
            mensagem: item.mensagem
          }))
        };

        console.log('Dados processados:', processedData);
        setData(processedData);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Tempo limite excedido. Tente novamente.');
          } else {
            setError(`Erro ao carregar dados climáticos: ${err.message}`);
          }
        } else {
          setError('Erro desconhecido ao carregar dados climáticos');
        }
        console.error('Erro ao buscar dados climáticos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [userId, lat, lon]);

  return { data, isLoading, error };
};
