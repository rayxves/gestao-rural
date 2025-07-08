
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateFilterState } from '@/components/DateFilter';

export type TableType = 'plantio' | 'colheita' | 'venda' | 'gasto' | 'insumo' | 'trabalho';

export const useRuralData = (tableType: TableType, userId: string, dateFilter?: DateFilterState) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching ${tableType} data for user ${userId}`);

      const dateRange = getDateRange();
      const dateColumn = getDateColumn(tableType);
      
      console.log('Date range:', { start: dateRange.start, end: dateRange.end });
      console.log('Using date column:', dateColumn);

      // First, let's try a simple query without date filters to debug
      console.log('Testing simple query first...');
      const { data: testResult, error: testError } = await supabase
        .from(tableType)
        .select('*')
        .eq('user_id', userId)
        .limit(5);

      console.log('Test query result:', testResult);
      console.log('Test query error:', testError);

      if (testError) {
        throw testError;
      }

      // Now apply date filters if the simple query works
      let query = supabase
        .from(tableType)
        .select('*')
        .eq('user_id', userId);

      // Apply date filters
      if (dateRange.start && dateColumn) {
        query = query.gte(dateColumn, dateRange.start.toISOString().split('T')[0]);
      }

      if (dateRange.end && dateColumn) {
        query = query.lte(dateColumn, dateRange.end.toISOString().split('T')[0]);
      }

      const { data: result, error: queryError } = await query.order(dateColumn || 'id', { ascending: false });

      if (queryError) {
        console.error('Query error:', queryError);
        throw queryError;
      }

      console.log(`Fetched ${result?.length || 0} records for ${tableType}`);
      console.log('Sample data:', result?.slice(0, 2));
      setData(result || []);
    } catch (err) {
      console.error(`Error fetching ${tableType} data:`, err);
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
    console.log('useRuralData effect triggered:', { userId, tableType, dateFilter });
    fetchData();
  }, [userId, tableType, dateFilter]);

  return { data, loading, error, refetch: fetchData };
};
