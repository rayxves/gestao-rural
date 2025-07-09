
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCollaboratorSession } from './useCollaboratorSession';
import { DateFilterState } from '@/components/DateFilter';

export const useCollaboratorRuralData = (
  tableType: 'plantio' | 'colheita' | 'venda' | 'gasto' | 'insumo' | 'trabalho',
  dateFilter: DateFilterState
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { collaboratorData, isCollaborator } = useCollaboratorSession();

  const fetchData = async () => {
    if (!isCollaborator || !collaboratorData) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar o user_id do produtor
      const { data: producer, error: producerError } = await supabase
        .from('usuario')
        .select('user_id')
        .eq('id', collaboratorData.produtorId)
        .maybeSingle();

      console.log("produtor encontrado: ", data);
      if (producerError || !producer) {
        console.error('Erro ao buscar produtor:', producerError);
        setError('Erro ao carregar dados do produtor');
        setData([]);
        setLoading(false);
        return;
      }

      const producerUserId = producer.user_id;

      let query = supabase
        .from(tableType)
        .select('*')
        .eq('user_id', producerUserId)
        .eq('registrado_por', collaboratorData.username);
      console.log('colaborador encontrado: ', query)

      // Aplicar filtros de data baseados no tipo de tabela
      if (dateFilter.startDate && dateFilter.endDate) {
        let dateColumn = '';
        switch (tableType) {
          case 'plantio':
            dateColumn = 'data_plantio';
            break;
          case 'colheita':
            dateColumn = 'data_colheita';
            break;
          case 'venda':
            dateColumn = 'data_venda';
            break;
          case 'gasto':
            dateColumn = 'data_gasto';
            break;
          default:
            break;
        }

        if (dateColumn) {
          query = query
            .gte(dateColumn, dateFilter.startDate)
            .lte(dateColumn, dateFilter.endDate);
        }
      }

      // Aplicar filtro de cultura se especificado
      if (dateFilter.culture && ['plantio', 'colheita', 'venda'].includes(tableType)) {
        query = query.ilike('cultura', `%${dateFilter.culture}%`);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        console.error(`Erro ao buscar dados de ${tableType}:`, queryError);
        setError(`Erro ao carregar dados de ${tableType}`);
        setData([]);
      } else {
        setData(result || []);
      }
    } catch (error) {
      console.error(`Erro na consulta de ${tableType}:`, error);
      setError(`Erro ao carregar dados de ${tableType}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableType, dateFilter, collaboratorData, isCollaborator]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
