import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable } from '@/components/DataTable';
import { DateFilter, DateFilterState } from '@/components/DateFilter';
import { ExportButtons } from '@/components/ExportButtons';
import { useRuralData } from '@/hooks/useRuralData';
import { useCollaboratorRuralData } from '@/hooks/useCollaboratorRuralData';
import { useUserSession } from '@/hooks/useUserSession';
import { useCollaboratorSession } from '@/hooks/useCollaboratorSession';
import { usePropriedades } from '@/hooks/usePropriedades';
import { addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Tabelas = () => {
  const { userId } = useUserSession();
  const { isCollaborator, collaboratorData } = useCollaboratorSession();
  
  const [filterInput, setFilterInput] = useState<DateFilterState>({
    period: 'month',
    startDate: subDays(new Date(), 30).toISOString().split('T')[0],
    endDate: addDays(new Date(), 1).toISOString().split('T')[0]
  });
  
  const [dateFilter, setDateFilter] = useState<DateFilterState>(filterInput);
  
  const [availableCultures, setAvailableCultures] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<'plantio' | 'colheita' | 'venda' | 'gasto' | 'insumo' | 'trabalho'>('plantio');
  const [selectedPropriedade, setSelectedPropriedade] = useState<string>('all');

  const { propriedades, loading: propriedadesLoading } = usePropriedades(userId);

  // Hooks para dados de produtor
  const { data: plantioData, loading: plantioLoading, refetch: refetchPlantio } = useRuralData('plantio', userId || '', dateFilter);
  const { data: colheitaData, loading: colheitaLoading, refetch: refetchColheita } = useRuralData('colheita', userId || '', dateFilter);
  const { data: vendaData, loading: vendaLoading, refetch: refetchVenda } = useRuralData('venda', userId || '', dateFilter);
  const { data: gastoData, loading: gastoLoading, refetch: refetchGasto } = useRuralData('gasto', userId || '', dateFilter);
  const { data: insumoData, loading: insumoLoading, refetch: refetchInsumo } = useRuralData('insumo', userId || '', dateFilter);
  const { data: trabalhoData, loading: trabalhoLoading, refetch: refetchTrabalho } = useRuralData('trabalho', userId || '', dateFilter);

  // Hooks para dados de colaborador
  const { data: collaboratorPlantioData, loading: collaboratorPlantioLoading, refetch: refetchCollaboratorPlantio } = useCollaboratorRuralData('plantio', dateFilter);
  const { data: collaboratorColheitaData, loading: collaboratorColheitaLoading, refetch: refetchCollaboratorColheita } = useCollaboratorRuralData('colheita', dateFilter);
  const { data: collaboratorVendaData, loading: collaboratorVendaLoading, refetch: refetchCollaboratorVenda } = useCollaboratorRuralData('venda', dateFilter);
  const { data: collaboratorGastoData, loading: collaboratorGastoLoading, refetch: refetchCollaboratorGasto } = useCollaboratorRuralData('gasto', dateFilter);
  const { data: collaboratorInsumoData, loading: collaboratorInsumoLoading, refetch: refetchCollaboratorInsumo } = useCollaboratorRuralData('insumo', dateFilter);
  const { data: collaboratorTrabalhoData, loading: collaboratorTrabalhoLoading, refetch: refetchCollaboratorTrabalho } = useCollaboratorRuralData('trabalho', dateFilter);

  // Determinar quais dados usar baseado no tipo de usuário
  const currentPlantioData = isCollaborator ? collaboratorPlantioData : plantioData;
  const currentColheitaData = isCollaborator ? collaboratorColheitaData : colheitaData;
  const currentVendaData = isCollaborator ? collaboratorVendaData : vendaData;
  const currentGastoData = isCollaborator ? collaboratorGastoData : gastoData;
  const currentInsumoData = isCollaborator ? collaboratorInsumoData : insumoData;
  const currentTrabalhoData = isCollaborator ? collaboratorTrabalhoData : trabalhoData;

  const isLoading = isCollaborator ? 
    (collaboratorPlantioLoading || collaboratorColheitaLoading || collaboratorVendaLoading || collaboratorGastoLoading || collaboratorInsumoLoading || collaboratorTrabalhoLoading) :
    (plantioLoading || colheitaLoading || vendaLoading || gastoLoading || insumoLoading || trabalhoLoading);

  // Function to handle data updates after edit/delete operations
  const handleDataUpdate = () => {
    if (isCollaborator) {
      refetchCollaboratorPlantio();
      refetchCollaboratorColheita();
      refetchCollaboratorVenda();
      refetchCollaboratorGasto();
      refetchCollaboratorInsumo();
      refetchCollaboratorTrabalho();
    } else {
      refetchPlantio();
      refetchColheita();
      refetchVenda();
      refetchGasto();
      refetchInsumo();
      refetchTrabalho();
    }
  };

  const handleApplyFilters = () => {
    setDateFilter(filterInput);
  };

  useEffect(() => {
    const fetchAvailableCultures = async () => {
      if (!userId && !isCollaborator) return;

      try {
        let plantioResult, colheitaResult, vendaResult;

        if (isCollaborator && collaboratorData) {
          // Buscar o user_id do produtor para colaboradores
          const { data: producer } = await supabase
            .from('usuario')
            .select('user_id')
            .eq('id', collaboratorData.produtorId)
            .maybeSingle();

          if (!producer) return;

          const producerUserId = producer.user_id;

          [plantioResult, colheitaResult, vendaResult] = await Promise.all([
            supabase
              .from('plantio')
              .select('cultura')
              .eq('user_id', producerUserId)
              .eq('registrado_por', collaboratorData.username),
            supabase
              .from('colheita')
              .select('cultura')
              .eq('user_id', producerUserId)
              .eq('registrado_por', collaboratorData.username),
            supabase
              .from('venda')
              .select('cultura')
              .eq('user_id', producerUserId)
              .eq('registrado_por', collaboratorData.username)
          ]);
        } else if (userId) {
          [plantioResult, colheitaResult, vendaResult] = await Promise.all([
            supabase
              .from('plantio')
              .select('cultura')
              .eq('user_id', userId),
            supabase
              .from('colheita')
              .select('cultura')
              .eq('user_id', userId),
            supabase
              .from('venda')
              .select('cultura')
              .eq('user_id', userId)
          ]);
        }

        const allCultures = new Set<string>();
        
        plantioResult?.data?.forEach(item => allCultures.add(item.cultura));
        colheitaResult?.data?.forEach(item => allCultures.add(item.cultura));
        vendaResult?.data?.forEach(item => allCultures.add(item.cultura));

        setAvailableCultures(Array.from(allCultures).sort());
      } catch (error) {
        console.error('Error fetching cultures:', error);
      }
    };

    fetchAvailableCultures();
  }, [userId, isCollaborator, collaboratorData]);

  const totalVendas = currentVendaData.reduce((sum, item) => sum + (item.valor_total || 0), 0);
  const totalGastos = currentGastoData.reduce((sum, item) => sum + (item.valor || 0), 0);
  const totalInsumos = currentInsumoData.reduce((sum, item) => sum + ((item.quantidade || 0) * (item.preco_unitario || 0)), 0);
  const totalTrabalhos = currentTrabalhoData.reduce((sum, item) => sum + (item.custo || 0), 0);
  const totalGastosCompleto = totalGastos + totalInsumos + totalTrabalhos;
  const lucro = totalVendas - totalGastosCompleto;
  const areaTotal = currentPlantioData.reduce((sum, item) => sum + (item.area_plantada || 0), 0);
  const produtividade = areaTotal > 0 ? currentColheitaData.reduce((sum, item) => sum + (item.quantidade || 0), 0) / areaTotal : 0;

  const margemLucro = totalVendas > 0 ? ((lucro / totalVendas) * 100) : 0;
  const roi = totalGastosCompleto > 0 ? ((lucro / totalGastosCompleto) * 100) : 0;

  const filterByCulture = (data: any[], cultureField: string) => {
    if (!dateFilter.culture) return data;
    return data.filter(item => 
      item[cultureField]?.toLowerCase().includes(dateFilter.culture!.toLowerCase())
    );
  };

  const filterByPropriedade = (data: any[]) => {
    if (selectedPropriedade === 'all' || isCollaborator) return data;
    return data.filter(item => item.propriedade_id === parseInt(selectedPropriedade));
  };

  const getCurrentTableData = () => {
    let data: any[] = [];
    switch (selectedTable) {
      case 'plantio':
        data = filterByCulture(currentPlantioData, 'cultura');
        break;
      case 'colheita':
        data = filterByCulture(currentColheitaData, 'cultura');
        break;
      case 'venda':
        data = filterByCulture(currentVendaData, 'cultura');
        break;
      case 'gasto':
        data = currentGastoData;
        break;
      case 'insumo':
        data = currentInsumoData;
        break;
      case 'trabalho':
        data = currentTrabalhoData;
        break;
      default:
        data = [];
    }
    
    if (['plantio', 'colheita', 'venda', 'gasto', 'insumo', 'trabalho'].includes(selectedTable)) {
      data = filterByPropriedade(data);
    }
    
    return data;
  };

  const getCurrentTableHeaders = () => {
    switch (selectedTable) {
      case 'plantio':
        return [
          { label: 'Data', key: 'data_plantio' },
          { label: 'Cultura', key: 'cultura' },
          { label: 'Área Plantada', key: 'area_plantada' },
          { label: 'Registrado Por', key: 'registrado_por' }
        ];
      case 'colheita':
        return [
          { label: 'Data', key: 'data_colheita' },
          { label: 'Cultura', key: 'cultura' },
          { label: 'Quantidade', key: 'quantidade' },
          { label: 'Registrado Por', key: 'registrado_por' }
        ];
      case 'venda':
        return [
          { label: 'Data', key: 'data_venda' },
          { label: 'Cultura', key: 'cultura' },
          { label: 'Quantidade', key: 'quantidade' },
          { label: 'Valor Total', key: 'valor_total' },
          { label: 'Registrado Por', key: 'registrado_por' }
        ];
      case 'gasto':
        return [
          { label: 'Data', key: 'data_gasto' },
          { label: 'Tipo', key: 'tipo' },
          { label: 'Descrição', key: 'descricao' },
          { label: 'Valor', key: 'valor' },
          { label: 'Registrado Por', key: 'registrado_por' }
        ];
      case 'insumo':
        return [
          { label: 'Nome', key: 'nome' },
          { label: 'Tipo', key: 'tipo' },
          { label: 'Quantidade', key: 'quantidade' },
          { label: 'Preço Unitário', key: 'preco_unitario' },
          { label: 'Registrado Por', key: 'registrado_por' }
        ];
      case 'trabalho':
        return [
          { label: 'Descrição', key: 'descricao' },
          { label: 'Responsável', key: 'responsavel' },
          { label: 'Custo', key: 'custo' },
          { label: 'Registrado Por', key: 'registrado_por' }
        ];
      default:
        return [];
    }
  };

  const tableConfigs = [
    { key: 'plantio', title: 'Plantio', icon: '🌱', count: currentPlantioData.length },
    { key: 'colheita', title: 'Colheita', icon: '🌾', count: currentColheitaData.length },
    { key: 'venda', title: 'Venda', icon: '💰', count: currentVendaData.length },
    { key: 'gasto', title: 'Gasto', icon: '💳', count: currentGastoData.length },
    { key: 'insumo', title: 'Insumo', icon: '🧪', count: currentInsumoData.length },
    { key: 'trabalho', title: 'Trabalho', icon: '👨‍🌾', count: currentTrabalhoData.length }
  ] as const;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              📊 Registros Agrícolas
              {isCollaborator && (
                <span className="block text-sm text-emerald-600 mt-1">
                  Colaborador: {collaboratorData?.username}
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Visualize e gerencie seus dados de produção</p>
          </div>

          {/* Filtros */}
          <div className="mb-6 sm:mb-8">
            <DateFilter 
              value={filterInput} 
              onChange={setFilterInput} 
              showCultureFilter={true}
              availableCultures={availableCultures}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                onClick={handleApplyFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>

          {/* Filtro de Propriedade - Ocultar para colaboradores */}
          {!isCollaborator && (
            <div className="mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualizar por propriedade</h3>
                <div className="w-full sm:w-64">
                  <Select value={selectedPropriedade} onValueChange={setSelectedPropriedade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as propriedades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as propriedades</SelectItem>
                      {propriedades.map((propriedade) => (
                        <SelectItem key={propriedade.id} value={propriedade.id.toString()}>
                          {propriedade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {!isCollaborator && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 sm:p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 font-medium text-sm sm:text-base">Receita Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-800 whitespace-nowrap">R${totalVendas.toFixed(2)}</p>
                  <p className="text-xs text-green-600">Margem: {margemLucro.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-4 sm:p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 font-medium text-sm sm:text-base">Gastos Totais</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-800 whitespace-nowrap">R${totalGastosCompleto.toFixed(2)}</p>
                  <p className="text-xs text-red-600">ROI: {roi.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">💸</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 font-medium text-sm sm:text-base">Lucro Líquido</p>
                  <p className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${lucro >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    R${lucro.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 sm:p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-700 font-medium text-sm sm:text-base">Produtividade</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-800">{produtividade.toFixed(1)}</p>
                  <p className="text-xs text-yellow-600">ton/hectare</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">📊</span>
                </div>
              </div>
            </div>
          </div>
          )};
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">Tipo de Registro</h2>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Escolha uma categoria para visualizar os dados</p>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              {tableConfigs.map((config) => (
                <Button
                  key={config.key}
                  onClick={() => setSelectedTable(config.key as any)}
                  variant={selectedTable === config.key ? "default" : "outline"}
                  className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 h-auto ${
                    selectedTable === config.key 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-sm sm:text-base">{config.icon}</span>
                  <span className="truncate">{config.title}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-emerald-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-emerald-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">
                    {tableConfigs.find(c => c.key === selectedTable)?.icon}
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Registros de {tableConfigs.find(c => c.key === selectedTable)?.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {getCurrentTableData().length} {getCurrentTableData().length === 1 ? 'registro encontrado' : 'registros encontrados'}
                    </p>
                  </div>
                </div>
                {getCurrentTableData().length > 0 && (
                  <div className="flex-shrink-0">
                    <ExportButtons 
                      data={getCurrentTableData()} 
                      filename={`${selectedTable}_${new Date().toISOString().split('T')[0]}`}
                      headers={getCurrentTableHeaders()}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-6 overflow-x-auto">
              {getCurrentTableData().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Nenhum dado encontrado</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {isCollaborator 
                      ? "Você ainda não registrou dados nesta categoria."
                      : "Não há registros para os filtros selecionados."
                    }
                  </p>
                </div>
              ) : (
                <DataTable 
                  data={getCurrentTableData()}
                  loading={isLoading}
                  error={null}
                  tableType={selectedTable}
                  onDataUpdate={handleDataUpdate}
                  isCollaborator={isCollaborator}
                />
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Tabelas;
