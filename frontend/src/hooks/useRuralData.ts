
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateFilterState } from '@/components/DateFilter';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';

export type TableType = 'plantio' | 'colheita' | 'venda' | 'gasto' | 'insumo' | 'trabalho';

export const useRuralData = (tableType: TableType, _userId: string, dateFilter?: DateFilterState) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { effectiveUserId, isReady, userType, error: userIdError } = useEffectiveUserId();

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    // If no dateFilter provided, default to last month
    if (!dateFilter) {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: startDate, end: now };
    }

    // If custom dates are provided, use them
    if (dateFilter.period === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      return {
        start: new Date(dateFilter.startDate),
        end: new Date(dateFilter.endDate)
      };
    }

    // For fixed periods
    switch (dateFilter.period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { start: startDate, end: now };
  };

  const fetchData = async () => {
    // Aguardar que o userId efetivo esteja pronto
    if (!isReady) {
      console.log(`useRuralData (${tableType}): Aguardando userId efetivo...`);
      setLoading(true);
      return;
    }

    // Se há erro no userId, não prosseguir
    if (userIdError) {
      console.error(`useRuralData (${tableType}): Erro no userId:`, userIdError);
      setError(userIdError);
      setData([]);
      setLoading(false);
      return;
    }

    // Se não há userId efetivo, limpar dados
    if (!effectiveUserId) {
      console.log(`useRuralData (${tableType}): Nenhum userId efetivo, limpando dados`);
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`useRuralData (${tableType}): Buscando dados para userId efetivo:`, {
        effectiveUserId,
        userType,
        tableType
      });

      const dateRange = getDateRange();
      const dateColumn = getDateColumn(tableType);
      
      console.log(`useRuralData (${tableType}): Date range:`, { start: dateRange.start, end: dateRange.end });
      console.log(`useRuralData (${tableType}): Using date column:`, dateColumn);

      let query = supabase
        .from(tableType)
        .select('*')
        .eq('user_id', effectiveUserId);

      // Apply date filters
      if (dateRange.start && dateColumn) {
        query = query.gte(dateColumn, dateRange.start.toISOString().split('T')[0]);
      }

      if (dateRange.end && dateColumn) {
        query = query.lte(dateColumn, dateRange.end.toISOString().split('T')[0]);
      }

      const { data: result, error: queryError } = await query.order(dateColumn || 'id', { ascending: false });

      if (queryError) {
        console.error(`useRuralData (${tableType}): Query error:`, queryError);
        throw queryError;
      }

      console.log(`useRuralData (${tableType}): Fetched ${result?.length || 0} records`);
      setData(result || []);
    } catch (err) {
      console.error(`useRuralData (${tableType}): Error fetching data:`, err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getDateColumn = (table: TableType): string | null => {
    switch (table) {
      case 'plantio':
        return 'data_plantio';
      case 'colheita':
        return 'data_colheita';
      case 'venda':
        return 'data_venda';
      case 'gasto':
        return 'data_gasto';
      case 'insumo':
      case 'trabalho':
        return null; // These tables don't have date columns
      default:
        return null;
    }
  };

  useEffect(() => {
    console.log(`useRuralData (${tableType}): Effect triggered:`, { 
      effectiveUserId, 
      isReady, 
      userType, 
      tableType, 
      dateFilter 
    });
    fetchData();
  }, [effectiveUserId, isReady, userType, tableType, dateFilter]);

  return { data, loading, error, refetch: fetchData };
};
