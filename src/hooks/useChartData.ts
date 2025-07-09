import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';

export const useChartData = (_userId: string) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [expensesByType, setExpensesByType] = useState<any[]>([]);
  const [plantingByArea, setPlantingByArea] = useState<any[]>([]);
  const [harvestByArea, setHarvestByArea] = useState<any[]>([]);
  const [insumosPorTipo, setInsumosPorTipo] = useState<any[]>([]);
  const [insumosGastoPorTipo, setInsumosGastoPorTipo] = useState<any[]>([]);
  const [trabalhoPorResponsavel, setTrabalhoPorResponsavel] = useState<any[]>([]);
  const [trabalhoAoLongoDoTempo, setTrabalhoAoLongoDoTempo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { effectiveUserId, isReady, userType, error: userIdError } = useEffectiveUserId();

  const fetchChartData = async () => {
    // Aguardar que o userId efetivo esteja pronto
    if (!isReady) {
      console.log('useChartData: Aguardando userId efetivo...');
      setLoading(true);
      return;
    }

    // Se há erro no userId, não prosseguir
    if (userIdError) {
      console.error('useChartData: Erro no userId:', userIdError);
      setError(userIdError);
      setLoading(false);
      return;
    }

    // Se não há userId efetivo, limpar dados
    if (!effectiveUserId) {
      console.log('useChartData: Nenhum userId efetivo, limpando dados');
      // Reset all states to empty
      setSalesData([]);
      setExpensesByType([]);
      setPlantingByArea([]);
      setHarvestByArea([]);
      setInsumosPorTipo([]);
      setInsumosGastoPorTipo([]);
      setTrabalhoPorResponsavel([]);
      setTrabalhoAoLongoDoTempo([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useChartData: Buscando dados do gráfico para userId efetivo:', {
        effectiveUserId,
        userType
      });

      // Fetch sales data
      const { data: vendaData, error: vendaError } = await supabase
        .from('venda')
        .select('cultura, valor_total')
        .eq('user_id', effectiveUserId);

      if (vendaError) throw vendaError;

      // Process sales data by culture
      const salesByculture = vendaData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.cultura === item.cultura);
        if (existing) {
          existing.valor_total += Number(item.valor_total || 0);
        } else {
          acc.push({
            cultura: item.cultura,
            valor_total: Number(item.valor_total || 0)
          });
        }
        return acc;
      }, []) || [];
      setSalesData(salesByculture);

      // Fetch expenses data
      const { data: gastoData, error: gastoError } = await supabase
        .from('gasto')
        .select('tipo, valor')
        .eq('user_id', effectiveUserId);

      if (gastoError) throw gastoError;

      // Process expenses by type
      const expensesByTypeData = gastoData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.name === item.tipo);
        if (existing) {
          existing.valor += Number(item.valor || 0);
        } else {
          acc.push({
            name: item.tipo,
            valor: Number(item.valor || 0)
          });
        }
        return acc;
      }, []) || [];
      setExpensesByType(expensesByTypeData);

      // Fetch planting data
      const { data: plantioData, error: plantioError } = await supabase
        .from('plantio')
        .select('cultura, area_plantada')
        .eq('user_id', effectiveUserId);

      if (plantioError) throw plantioError;

      // Process planting by area
      const plantingByAreaData = plantioData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.cultura === item.cultura);
        if (existing) {
          existing.area_plantada += Number(item.area_plantada || 0);
        } else {
          acc.push({
            cultura: item.cultura,
            area_plantada: Number(item.area_plantada || 0)
          });
        }
        return acc;
      }, []) || [];
      setPlantingByArea(plantingByAreaData);

      // Fetch harvest data
      const { data: colheitaData, error: colheitaError } = await supabase
        .from('colheita')
        .select('cultura, quantidade')
        .eq('user_id', effectiveUserId);

      if (colheitaError) throw colheitaError;

      // Process harvest by area
      const harvestByAreaData = colheitaData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.cultura === item.cultura);
        if (existing) {
          existing.quantidade += Number(item.quantidade || 0);
        } else {
          acc.push({
            cultura: item.cultura,
            quantidade: Number(item.quantidade || 0)
          });
        }
        return acc;
      }, []) || [];
      setHarvestByArea(harvestByAreaData);

      // Fetch insumo data
      const { data: insumoData, error: insumoError } = await supabase
        .from('insumo')
        .select('tipo, quantidade, preco_unitario')
        .eq('user_id', effectiveUserId);

      if (insumoError) throw insumoError;

      // Process insumos by type (quantity)
      const insumosPorTipoData = insumoData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.tipo === item.tipo);
        if (existing) {
          existing.quantidade += Number(item.quantidade || 0);
        } else {
          acc.push({
            tipo: item.tipo || 'Sem tipo',
            quantidade: Number(item.quantidade || 0)
          });
        }
        return acc;
      }, []) || [];
      setInsumosPorTipo(insumosPorTipoData);

      // Process insumos by type (total cost)
      const insumosGastoPorTipoData = insumoData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.name === item.tipo);
        const gastoTotal = Number(item.quantidade || 0) * Number(item.preco_unitario || 0);
        if (existing) {
          existing.gasto_total += gastoTotal;
        } else {
          acc.push({
            name: item.tipo || 'Sem tipo',
            gasto_total: gastoTotal
          });
        }
        return acc;
      }, []) || [];
      setInsumosGastoPorTipo(insumosGastoPorTipoData);

      // Fetch trabalho data
      const { data: trabalhoData, error: trabalhoError } = await supabase
        .from('trabalho')
        .select('responsavel, custo')
        .eq('user_id', effectiveUserId);

      if (trabalhoError) throw trabalhoError;

      // Process trabalho by responsavel
      const trabalhoPorResponsavelData = trabalhoData?.reduce((acc: any, item: any) => {
        const existing = acc.find((entry: any) => entry.responsavel === item.responsavel);
        if (existing) {
          existing.custo_total += Number(item.custo || 0);
        } else {
          acc.push({
            responsavel: item.responsavel || 'Sem responsável',
            custo_total: Number(item.custo || 0)
          });
        }
        return acc;
      }, []) || [];
      setTrabalhoPorResponsavel(trabalhoPorResponsavelData);

      // For now, set empty data for trabalho ao longo do tempo
      setTrabalhoAoLongoDoTempo([]);

    } catch (err) {
      console.error('useChartData: Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useChartData: Effect triggered:', { 
      effectiveUserId, 
      isReady, 
      userType 
    });
    fetchChartData();
  }, [effectiveUserId, isReady, userType]);

  return {
    salesData,
    expensesByType,
    plantingByArea,
    harvestByArea,
    insumosPorTipo,
    insumosGastoPorTipo,
    trabalhoPorResponsavel,
    trabalhoAoLongoDoTempo,
    loading,
    error,
    refetch: fetchChartData
  };
};
