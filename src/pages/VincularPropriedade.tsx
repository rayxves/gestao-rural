
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';

interface Record {
  id: string;
  table: string;
  description: string;
  date?: string;
  data?: any;
}

interface Propriedade {
  id: number;
  nome: string;
}

const VincularPropriedade = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectedPropriedade, setSelectedPropriedade] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      console.log('Buscando dados para o usuário:', user);
      
      // Buscar o ID numérico do usuário na tabela usuario
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id')
        .eq('user_id', user.user_id)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw new Error('Usuário não encontrado no banco de dados');
      }

      console.log('ID numérico do usuário encontrado:', userData.id);

      // Buscar propriedades usando o ID numérico correto
      const { data: propriedadesData, error: propriedadesError } = await supabase
        .from('propriedade')
        .select('id, nome')
        .eq('user_id', userData.id);

      if (propriedadesError) throw propriedadesError;
      
      console.log('Propriedades encontradas:', propriedadesData);
      setPropriedades(propriedadesData || []);

      // Buscar registros sem propriedade de cada tabela específica
      const allRecords: Record[] = [];

      // Plantio
      const { data: plantioData, error: plantioError } = await supabase
        .from('plantio')
        .select('*')
        .eq('user_id', user.user_id)
        .is('propriedade_id', null);

      if (!plantioError && plantioData) {
        plantioData.forEach((item: any) => {
          allRecords.push({
            id: item.id,
            table: 'plantio',
            description: `Plantio - ${item.cultura} (${item.area_plantada} ha)`,
            date: item.data_plantio,
            data: item
          });
        });
      }

      // Colheita
      const { data: colheitaData, error: colheitaError } = await supabase
        .from('colheita')
        .select('*')
        .eq('user_id', user.user_id)
        .is('propriedade_id', null);

      if (!colheitaError && colheitaData) {
        colheitaData.forEach((item: any) => {
          allRecords.push({
            id: item.id,
            table: 'colheita',
            description: `Colheita - ${item.cultura} (${item.quantidade} kg)`,
            date: item.data_colheita,
            data: item
          });
        });
      }

      // Venda
      const { data: vendaData, error: vendaError } = await supabase
        .from('venda')
        .select('*')
        .eq('user_id', user.user_id)
        .is('propriedade_id', null);

      if (!vendaError && vendaData) {
        vendaData.forEach((item: any) => {
          allRecords.push({
            id: item.id,
            table: 'venda',
            description: `Venda - ${item.cultura} (R$ ${item.valor_total})`,
            date: item.data_venda,
            data: item
          });
        });
      }

      // Gasto
      const { data: gastoData, error: gastoError } = await supabase
        .from('gasto')
        .select('*')
        .eq('user_id', user.user_id)
        .is('propriedade_id', null);

      if (!gastoError && gastoData) {
        gastoData.forEach((item: any) => {
          allRecords.push({
            id: item.id,
            table: 'gasto',
            description: `Gasto - ${item.tipo} (R$ ${item.valor})`,
            date: item.data_gasto,
            data: item
          });
        });
      }

      // Trabalho
      const { data: trabalhoData, error: trabalhoError } = await supabase
        .from('trabalho')
        .select('*')
        .eq('user_id', user.user_id)
        .is('propriedade_id', null);

      if (!trabalhoError && trabalhoData) {
        trabalhoData.forEach((item: any) => {
          allRecords.push({
            id: item.id.toString(),
            table: 'trabalho',
            description: `Trabalho - ${item.descricao}`,
            date: null, // trabalho não tem data
            data: item
          });
        });
      }

      // Insumo
      const { data: insumoData, error: insumoError } = await supabase
        .from('insumo')
        .select('*')
        .eq('user_id', user.user_id)
        .is('propriedade_id', null);

      if (!insumoError && insumoData) {
        insumoData.forEach((item: any) => {
          allRecords.push({
            id: item.id.toString(),
            table: 'insumo',
            description: `Insumo - ${item.nome} (${item.quantidade})`,
            date: null, // insumo não tem data
            data: item
          });
        });
      }

      setRecords(allRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleRecordToggle = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const handleVincular = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: 'Nenhum registro selecionado',
        description: 'Selecione pelo menos um registro para vincular.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPropriedade) {
      toast({
        title: 'Propriedade não selecionada',
        description: 'Selecione uma propriedade para vincular os registros.',
        variant: 'destructive',
      });
      return;
    }

    const propriedadeId = parseInt(selectedPropriedade);
    if (isNaN(propriedadeId)) {
      console.error('Erro: propriedade_id inválido:', selectedPropriedade);
      toast({
        title: 'Erro de validação',
        description: 'ID da propriedade inválido.',
        variant: 'destructive',
      });
      return;
    }

    console.log('=== INÍCIO DA VINCULAÇÃO ===');
    console.log('Propriedade ID validado:', propriedadeId);
    console.log('Registros selecionados:', selectedRecords);
    console.log('Usuário atual:', user);

    setIsLoading(true);

    try {
      // Agrupar registros por tabela
      const recordsByTable: { [key: string]: string[] } = {};
      
      selectedRecords.forEach(recordId => {
        const record = records.find(r => r.id === recordId);
        if (record) {
          if (!recordsByTable[record.table]) {
            recordsByTable[record.table] = [];
          }
          recordsByTable[record.table].push(recordId);
        }
      });

      console.log('Registros agrupados por tabela:', recordsByTable);

      let totalUpdated = 0;
      
      for (const [tableName, ids] of Object.entries(recordsByTable)) {
        console.log(`\n=== ATUALIZANDO TABELA ${tableName.toUpperCase()} ===`);
        
        if (ids.length === 0) {
          console.warn(`Nenhum ID para atualizar na tabela ${tableName}`);
          continue;
        }

        console.log('IDs originais:', ids);

        let processedIds: (string | number)[] = ids;

        // Para tabelas com ID bigint, converter para números
        if (tableName === 'trabalho' || tableName === 'insumo') {
          const numericIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
          processedIds = numericIds;
          console.log('IDs processados (convertidos para números):', processedIds);
        }

        console.log('Executando update simples com:');
        console.log('- Tabela:', tableName);
        console.log('- propriedade_id:', propriedadeId);
        console.log('- IDs para filtro:', processedIds);
        console.log('- user_id do filtro:', user.user_id);

        try {
          // Fazer update direto usando o client do Supabase
          const updateResult = await supabase
            .from(tableName as any)
            .update({ propriedade_id: propriedadeId })
            .in('id', processedIds)
            .eq('user_id', user.user_id)
            .select();

          console.log(`Resultado completo do update para ${tableName}:`, updateResult);

          if (updateResult.error) {
            console.error(`Erro no update da tabela ${tableName}:`, updateResult.error);
            throw updateResult.error;
          } else if (updateResult.data && updateResult.data.length > 0) {
            console.log(`✅ ${updateResult.data.length} registros atualizados na tabela ${tableName}`);
            console.log('Registros atualizados:', updateResult.data);
            totalUpdated += updateResult.data.length;
          } else {
            console.warn(`⚠️ Nenhum registro foi atualizado na tabela ${tableName}`);
          }

        } catch (error) {
          console.error(`Erro durante update da tabela ${tableName}:`, error);
          throw error;
        }
      }

      console.log(`\n=== RESULTADO FINAL ===`);
      console.log(`Total de registros atualizados: ${totalUpdated}`);

      if (totalUpdated > 0) {
        toast({
          title: 'Registros vinculados!',
          description: `${totalUpdated} registros foram vinculados à propriedade com sucesso.`,
        });

        // Recarregar dados
        await fetchData();
        setSelectedRecords([]);
        setSelectedPropriedade('');
      } else {
        toast({
          title: 'Nenhum registro foi atualizado',
          description: 'Verifique se você tem permissão para editar esses registros.',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Erro geral na vinculação:', error);
      toast({
        title: 'Erro ao vincular registros',
        description: 'Ocorreu um erro ao vincular os registros. Verifique os logs no console.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vincular Registros à Propriedade</CardTitle>
            <p className="text-gray-600">
              Selecione os registros que deseja vincular a uma propriedade específica.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {propriedades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Você precisa ter pelo menos uma propriedade cadastrada.</p>
                <Button onClick={() => window.location.href = '/cadastro-propriedade'}>
                  Cadastrar Propriedade
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Propriedade
                  </label>
                  <Select value={selectedPropriedade} onValueChange={setSelectedPropriedade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma propriedade" />
                    </SelectTrigger>
                    <SelectContent>
                      {propriedades.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id.toString()}>
                          {prop.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registros sem Propriedade ({records.length})
                  </label>
                  
                  {records.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Todos os registros já estão vinculados a propriedades.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {records.map((record) => (
                        <div key={record.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded border-b">
                          <Checkbox
                            id={record.id}
                            checked={selectedRecords.includes(record.id)}
                            onCheckedChange={() => handleRecordToggle(record.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={record.id} className="text-sm cursor-pointer block">
                              <div className="font-medium text-gray-900 mb-1">
                                {record.description}
                              </div>
                              {record.date && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                  Data: {formatDate(record.date)}
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {records.length > 0 && (
                  <div className="flex gap-4">
                    <Button
                      onClick={handleVincular}
                      disabled={isLoading || selectedRecords.length === 0 || !selectedPropriedade}
                      className="flex-1"
                    >
                      {isLoading ? 'Vinculando...' : `Vincular ${selectedRecords.length} Registros`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VincularPropriedade;
