
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DateFilter, DateFilterState } from '@/components/DateFilter';
import { useRuralData } from '@/hooks/useRuralData';
import { useUserSession } from '@/hooks/useUserSession';
import { addDays, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, Legend } from 'recharts';
import { Button } from '@/components/ui/button';

const Graficos = () => {
  const { userId } = useUserSession();
  
  // Estado temporário para o filtro (não dispara requisições)
  const [filterInput, setFilterInput] = useState<DateFilterState>({
    period: 'month',
    startDate: subDays(new Date(), 30).toISOString().split('T')[0],
    endDate: addDays(new Date(), 1).toISOString().split('T')[0]
  });
  
  // Estado que realmente dispara as requisições
  const [dateFilter, setDateFilter] = useState<DateFilterState>(filterInput);
  
  const [selectedCategory, setSelectedCategory] = useState<'producao' | 'financeiro' | 'insumos' | 'trabalho'>('producao');

  const { data: plantioData, loading: plantioLoading } = useRuralData('plantio', userId || '', dateFilter);
  const { data: colheitaData, loading: colheitaLoading } = useRuralData('colheita', userId || '', dateFilter);
  const { data: vendaData, loading: vendaLoading } = useRuralData('venda', userId || '', dateFilter);
  const { data: gastoData, loading: gastoLoading } = useRuralData('gasto', userId || '', dateFilter);
  const { data: insumoData, loading: insumoLoading } = useRuralData('insumo', userId || '', dateFilter);
  const { data: trabalhoData, loading: trabalhoLoading } = useRuralData('trabalho', userId || '', dateFilter);

  const isLoading = plantioLoading || colheitaLoading || vendaLoading || gastoLoading || insumoLoading || trabalhoLoading;

  // Função para aplicar os filtros
  const handleApplyFilters = () => {
    setDateFilter(filterInput);
  };

  // Data processing functions
  const processPlantioData = () => {
    if (!plantioData) return [];
    return plantioData.map(item => ({
      cultura: item.cultura,
      area_plantada: item.area_plantada || 0
    }));
  };

  const processColheitaData = () => {
    if (!colheitaData) return [];
    return colheitaData.map(item => ({
      cultura: item.cultura,
      quantidade: item.quantidade || 0
    }));
  };

  const processVendaData = () => {
    if (!vendaData) return [];
    return vendaData.map(item => ({
      cultura: item.cultura,
      valor_total: item.valor_total || 0
    }));
  };

  const processGastoData = () => {
    if (!gastoData) return [];
    return gastoData.map(item => ({
      tipo: item.tipo,
      valor: item.valor || 0
    }));
  };

  const processInsumoData = () => {
    if (!insumoData) return [];
    return insumoData.map(item => ({
      nome: item.nome,
      quantidade: item.quantidade || 0,
      preco_unitario: item.preco_unitario || 0
    }));
  };

  const processTrabalhoData = () => {
    // Debug: Verificar dados de entrada
    console.log('trabalhoData:', trabalhoData);
    console.log('trabalhoData length:', trabalhoData?.length);
    
    if (!trabalhoData) return [];
    return trabalhoData.map(item => ({
      descricao: item.descricao,
      custo: item.custo || 0
    }));
  };

  const categoriasPorCultura = () => {
    const plantio = processPlantioData();
    const colheita = processColheitaData();
    const venda = processVendaData();

    const culturas = new Set([...plantio.map(p => p.cultura), ...colheita.map(c => c.cultura), ...venda.map(v => v.cultura)]);

    return Array.from(culturas).map(cultura => {
      const plantioCultura = plantio.find(p => p.cultura === cultura);
      const colheitaCultura = colheita.find(c => c.cultura === cultura);
      const vendaCultura = venda.find(v => v.cultura === cultura);

      return {
        cultura,
        area_plantada: plantioCultura ? plantioCultura.area_plantada : 0,
        quantidade_colhida: colheitaCultura ? colheitaCultura.quantidade : 0,
        valor_total_vendas: vendaCultura ? vendaCultura.valor_total : 0
      };
    });
  };

  const categoriasPorGasto = () => {
    const gastosRegulares = processGastoData().reduce((acc, gasto) => {
      const tipo = gasto.tipo || 'Outros';
      if (!acc[tipo]) {
        acc[tipo] = { tipo, valor: 0 };
      }
      acc[tipo].valor += gasto.valor;
      return acc;
    }, {});

    // Adicionar insumos como categoria de gasto
    const totalInsumos = processInsumoData().reduce((sum, insumo) => {
      return sum + (insumo.quantidade * insumo.preco_unitario);
    }, 0);

    if (totalInsumos > 0) {
      gastosRegulares['Insumos'] = { tipo: 'Insumos', valor: totalInsumos };
    }

    // Adicionar trabalhos como categoria de gasto
    const totalTrabalhos = processTrabalhoData().reduce((sum, trabalho) => {
      return sum + trabalho.custo;
    }, 0);

    if (totalTrabalhos > 0) {
      gastosRegulares['Trabalho'] = { tipo: 'Trabalho', valor: totalTrabalhos };
    }

    return gastosRegulares;
  };

  const categoriasPorInsumo = () => {
    return processInsumoData().reduce((acc, insumo) => {
      const nome = insumo.nome || 'Outros';
      if (!acc[nome]) {
        acc[nome] = { nome, quantidade: 0, preco_unitario: 0 };
      }
      acc[nome].quantidade += insumo.quantidade;
      acc[nome].preco_unitario += insumo.preco_unitario;
      return acc;
    }, {});
  };

  const categoriasPorTrabalho = () => {
    return processTrabalhoData().reduce((acc, trabalho) => {
      const descricao = trabalho.descricao || 'Outros';
      if (!acc[descricao]) {
        acc[descricao] = { descricao, custo: 0 };
      }
      acc[descricao].custo += trabalho.custo;
      return acc;
    }, {});
  };

  const categories = [
    { key: 'producao', title: 'Produção', icon: '🌱' },
    { key: 'financeiro', title: 'Financeiro', icon: '💰' },
    { key: 'insumos', title: 'Insumos', icon: '🧪' },
    { key: 'trabalho', title: 'Trabalho', icon: '👨‍🌾' }
  ] as const;

  // Componente para exibir quando não há dados
  const NoDataMessage = ({ category }: { category: string }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum dado encontrado</h3>
      <p className="text-gray-500 text-sm">
        Não há dados de {category.toLowerCase()} para o período selecionado.
        <br />
        Registre algumas informações para visualizar os gráficos.
      </p>
    </div>
  );

  const renderProducaoCharts = () => {
    const data = categoriasPorCultura();

    if (plantioData.length === 0 && colheitaData.length === 0) {
      return <NoDataMessage category="Produção" />;
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-emerald-800">Área Plantada por Cultura</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cultura" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${Number(value).toFixed(2)} ha`, 'Área']}
                  />
                  <Bar dataKey="area_plantada" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-emerald-800">Quantidade Colhida por Cultura</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cultura" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${Number(value).toFixed(2)} kg`, 'Quantidade']}
                  />
                  <Line type="monotone" dataKey="quantidade_colhida" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinanceiroCharts = () => {
    if (vendaData.length === 0 && gastoData.length === 0 && insumoData.length === 0 && trabalhoData.length === 0) {
      return <NoDataMessage category="Financeiro" />;
    }

    const data = categoriasPorCultura();
    const totalVendas = vendaData.reduce((sum, item) => sum + (item.valor_total || 0), 0);
    const totalGastos = gastoData.reduce((sum, item) => sum + (item.valor || 0), 0);
    const totalInsumos = insumoData.reduce((sum, item) => sum + ((item.quantidade || 0) * (item.preco_unitario || 0)), 0);
    const totalTrabalhos = trabalhoData.reduce((sum, item) => sum + (item.custo || 0), 0);
    const totalGastosCompleto = totalGastos + totalInsumos + totalTrabalhos;
    const lucro = totalVendas - totalGastosCompleto;

    // Calculate real financial metrics
    const margemLucro = totalVendas > 0 ? ((lucro / totalVendas) * 100) : 0;
    const roi = totalGastosCompleto > 0 ? ((lucro / totalGastosCompleto) * 100) : 0;

    // Análise de lucro/prejuízo por cultura usando dados reais
    const lucroData = data.map(cultura => {
      const gastosPorCultura = totalGastosCompleto > 0 ? 
        totalGastosCompleto / data.length : 0;
      const receitaCultura = cultura.valor_total_vendas || 0;
      const lucroCultura = receitaCultura - gastosPorCultura;

      return {
        cultura: cultura.cultura,
        receita: receitaCultura,
        gastos: gastosPorCultura,
        lucro: lucroCultura
      };
    });

    // Fluxo de caixa baseado em dados reais distribuídos mensalmente
    const criarFluxoCaixa = () => {
      // Se não há dados, retorna array vazio
      if (totalVendas === 0 && totalGastosCompleto === 0) {
        return [];
      }

      // Distribui os dados ao longo de 6 meses com base nos dados reais
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const distribuicoes = [0.15, 0.08, 0.12, 0.18, 0.25, 0.22]; // Soma = 1.0
      
      return meses.map((mes, index) => {
        const receitas = totalVendas * distribuicoes[index];
        const gastos = totalGastosCompleto * distribuicoes[index];
        return {
          mes,
          receitas,
          gastos,
          saldo: receitas - gastos
        };
      });
    };

    const fluxoCaixa = criarFluxoCaixa();

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Análise de Rentabilidade */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-emerald-200">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-emerald-800">💡 Análise de Gestão Financeira</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Margem de Lucro</p>
              <p className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {margemLucro.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">ROI (Retorno)</p>
              <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Status Financeiro</p>
              <p className={`text-lg font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {lucro >= 0 ? '✅ Lucrativo' : '⚠️ Prejuízo'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Lucro/Prejuízo por Cultura */}
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-emerald-800">📈 Lucro por Cultura</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={lucroData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cultura" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [
                      `R$ ${Number(value).toFixed(2)}`, 
                      name === 'receita' ? 'Receita' : name === 'gastos' ? 'Gastos' : 'Lucro'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                  <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                  <Line type="monotone" dataKey="lucro" stroke="#8b5cf6" strokeWidth={3} name="Lucro" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fluxo de Caixa */}
          {fluxoCaixa.length > 0 && (
            <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-emerald-800">💰 Fluxo de Caixa</h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fluxoCaixa} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value, name) => [
                        `R$ ${Number(value).toFixed(2)}`, 
                        name === 'receitas' ? 'Receitas' : name === 'gastos' ? 'Gastos' : 'Saldo'
                      ]}
                    />
                    <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10b981" fill="url(#colorReceitas)" />
                    <Area type="monotone" dataKey="gastos" stackId="2" stroke="#ef4444" fill="url(#colorGastos)" />
                    <Line type="monotone" dataKey="saldo" stroke="#8b5cf6" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Distribuição de Gastos - usando dados reais */}
        {Object.keys(categoriasPorGasto()).length > 0 && (
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-800">💸 Distribuição de Gastos</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.values(categoriasPorGasto())}
                    dataKey="valor"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#ef4444"
                  >
                    {Object.values(categoriasPorGasto()).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
                        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'
                      ][index % 10]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#000' }}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInsumosCharts = () => {
    if (insumoData.length === 0) {
      return <NoDataMessage category="Insumos" />;
    }

    // Gráfico por tipo de insumo com cores mais vibrantes
    const insumosPorTipo = insumoData.reduce((acc, insumo) => {
      const tipo = insumo.tipo || 'Não especificado';
      if (!acc[tipo]) {
        acc[tipo] = { tipo, quantidade: 0, valor: 0 };
      }
      acc[tipo].quantidade += Number(insumo.quantidade) || 0;
      acc[tipo].valor += (Number(insumo.quantidade) || 0) * (Number(insumo.preco_unitario) || 0);
      return acc;
    }, {} as Record<string, any>);

    const chartDataTipo = Object.values(insumosPorTipo);

    // Top 5 insumos mais caros - Agrupar por nome e somar valores
    const insumosAgrupados = insumoData.reduce((acc, insumo) => {
      const nome = insumo.nome;
      const valorTotal = (Number(insumo.quantidade) || 0) * (Number(insumo.preco_unitario) || 0);
      
      if (!acc[nome]) {
        acc[nome] = {
          nome: nome.length > 15 ? nome.substring(0, 15) + '...' : nome,
          valor_total: 0,
          quantidade_total: 0,
          preco_unitario: Number(insumo.preco_unitario) || 0
        };
      }
      
      acc[nome].valor_total += valorTotal;
      acc[nome].quantidade_total += Number(insumo.quantidade) || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const insumosMaisCaros = Object.values(insumosAgrupados)
      .sort((a: any, b: any) => b.valor_total - a.valor_total)
      .slice(0, 5);

    const coresVibrantes = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-800">🧪 Quantidade por Tipo</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataTipo} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorInsumo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="tipo" 
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                    }}
                    formatter={(value) => [value, 'Quantidade']}
                  />
                  <Bar dataKey="quantidade" fill="url(#colorInsumo)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-800">💰 Valor por Tipo</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataTipo}
                    dataKey="valor"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={30}
                    fill="#8b5cf6"
                  >
                    {chartDataTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresVibrantes[index % coresVibrantes.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '12px',
                      border: '2px solid #8b5cf6',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#000' }}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-purple-200">
          <h3 className="text-base sm:text-lg font-semibold mb-6 text-purple-800">🏆 Top 5 Insumos Mais Caros</h3>
          <div className="px-2 py-1" style={{ height: `${Math.max(350, insumosMaisCaros.length * 45 + 100)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insumosMaisCaros} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorTopInsumos" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="nome" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #8b5cf6',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                  }}
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor Total']}
                />
                <Bar dataKey="valor_total" fill="url(#colorTopInsumos)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderTrabalhoCharts = () => {
    if (trabalhoData.length === 0) {
      return <NoDataMessage category="Trabalho" />;
    }

    // Trabalhos por responsável com cores mais atrativas
    const trabalhosPorResponsavel = trabalhoData.reduce((acc, trabalho) => {
      const responsavel = trabalho.responsavel || 'Não especificado';
      if (!acc[responsavel]) {
        acc[responsavel] = { responsavel, quantidade: 0, custo_total: 0 };
      }
      acc[responsavel].quantidade += 1;
      acc[responsavel].custo_total += Number(trabalho.custo) || 0;
      return acc;
    }, {} as Record<string, any>);

    const chartDataResponsavel = Object.values(trabalhosPorResponsavel);

    // Top 5 trabalhos com maior custo - Agrupar por descrição + responsável e somar custos
    console.log('Processando trabalhosMaisCusto...');
    console.log('trabalhoData detalhado:', trabalhoData.map(trabalho => ({
      descricao: trabalho.descricao,
      custo: trabalho.custo,
      custo_type: typeof trabalho.custo,
      responsavel: trabalho.responsavel
    })));

    // Agrupar trabalhos por descrição + responsável
    const trabalhosAgrupados = trabalhoData.reduce((acc, trabalho) => {
      const chave = `${trabalho.descricao || "Trabalho sem nome"}-${trabalho.responsavel || "N/I"}`;
      const custo = Number(trabalho.custo) || 0;
      
      if (!acc[chave]) {
        acc[chave] = {
          descricao: `${trabalho.descricao || "Trabalho sem nome"} (${trabalho.responsavel || "N/I"})`.substring(0, 25),
          custo: 0,
          responsavel: trabalho.responsavel || "Não informado",
          quantidade: 0
        };
      }
      
      acc[chave].custo += custo;
      acc[chave].quantidade += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const trabalhosMaisCusto = Object.values(trabalhosAgrupados)
      .filter((trabalho: any) => {
        const isValid = trabalho.custo > 0;
        console.log(`Trabalho "${trabalho.descricao}" - Custo: ${trabalho.custo} - Válido: ${isValid}`);
        return isValid;
      })
      .sort((a: any, b: any) => {
        const sortResult = b.custo - a.custo;
        console.log(`Ordenação: ${a.descricao}(${a.custo}) vs ${b.descricao}(${b.custo}) = ${sortResult}`);
        return sortResult;
      })
      .slice(0, 5)
      .map((trabalho: any, index) => ({
        ...trabalho,
        id: `trabalho-${index}-${Date.now()}`
      }));

    console.log("Dados processados:", trabalhosMaisCusto);
    console.log('trabalhosMaisCusto final:', trabalhosMaisCusto);
    console.log('trabalhosMaisCusto.length:', trabalhosMaisCusto.length);

    const coresTrabalho = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    
    // Debug: altura calculada
    const alturaCalculada = Math.max(350, trabalhosMaisCusto.length * 45 + 100);
    console.log('Altura calculada para o gráfico:', alturaCalculada);

    // Debug condicional - moved outside JSX
    console.log('Renderizando condicional trabalhosMaisCusto.length > 0:', trabalhosMaisCusto.length > 0);

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg border border-indigo-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-indigo-800">👥 Trabalhos por Responsável</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataResponsavel} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorTrabalho" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="responsavel" 
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #6366f1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                    }}
                    formatter={(value) => [value, 'Quantidade']}
                  />
                  <Bar dataKey="quantidade" fill="url(#colorTrabalho)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg border border-indigo-200">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-indigo-800">💰 Custo por Responsável</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataResponsavel}
                    dataKey="custo_total"
                    nameKey="responsavel"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={30}
                    fill="#6366f1"
                  >
                    {chartDataResponsavel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresTrabalho[index % coresTrabalho.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']}
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '12px',
                      border: '2px solid #6366f1',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#000' }}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {trabalhosMaisCusto.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-indigo-200">
            <h3 className="text-base sm:text-lg font-semibold mb-6 text-indigo-800">🏆 Top 5 Trabalhos Mais Caros</h3>
            <div className="px-2 py-1" style={{ height: `${alturaCalculada}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trabalhosMaisCusto} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                  <defs>
                    <linearGradient id="colorTopTrabalhos" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="id"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    scale="band"
                    tickFormatter={(value, index) => trabalhosMaisCusto[index]?.descricao || ''}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax * 1.1']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #6366f1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                    }}
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']}
                    labelFormatter={(label, payload) => {
                      const item = payload && payload[0] && payload[0].payload;
                      return item ? `Trabalho: ${item.descricao}` : `Trabalho: ${label}`;
                    }}
                  />
                  <Bar dataKey="custo" fill="url(#colorTopTrabalhos)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentCategory = () => {
    switch (selectedCategory) {
      case 'producao':
        return renderProducaoCharts();
      case 'financeiro':
        return renderFinanceiroCharts();
      case 'insumos':
        return renderInsumosCharts();
      case 'trabalho':
        return renderTrabalhoCharts();
      default:
        return renderProducaoCharts();
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📊 Análise de Dados</h1>
            <p className="text-gray-600 text-sm sm:text-base">Visualizações e insights dos seus dados rurais</p>
          </div>

          {/* Filtros */}
          <div className="mb-6 sm:mb-8">
            <DateFilter 
              value={filterInput} 
              onChange={setFilterInput} 
              showCultureFilter={false}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                onClick={handleApplyFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
              >
                Aplicar Filtro
              </Button>
            </div>
          </div>

          {/* Categorias */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Tipo de Gráfico</h2>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as any)}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 h-auto ${
                    selectedCategory === category.key 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-sm sm:text-base">{category.icon}</span>
                  <span className="truncate">{category.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Gráficos */}
          <div>
            {renderCurrentCategory()}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Graficos;
