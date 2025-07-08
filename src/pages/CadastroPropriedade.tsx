
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';

const CadastroPropriedade = () => {
  const [nome, setNome] = useState('');
  const [areaTotal, setAreaTotal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Usuário não autenticado',
        description: 'Faça login para continuar.',
        variant: 'destructive',
      });
      return;
    }

    const areaNumeric = parseFloat(areaTotal);
    if (isNaN(areaNumeric) || areaNumeric <= 0) {
      toast({
        title: 'Área inválida',
        description: 'Por favor, informe uma área válida em hectares.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Dados do usuário:', user);
      
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

      const { error } = await supabase
        .from('propriedade')
        .insert([
          {
            nome,
            area_total: areaNumeric,
            user_id: userData.id, // Usar o ID numérico da tabela usuario
            data_registro: new Date().toISOString().split('T')[0]
          }
        ]);

      if (error) {
        console.error('Erro ao inserir propriedade:', error);
        throw error;
      }

      toast({
        title: 'Propriedade cadastrada!',
        description: 'Propriedade foi cadastrada com sucesso.',
      });

      navigate('/tabelas');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro ao cadastrar propriedade',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao salvar a propriedade. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Cadastrar Nova Propriedade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Propriedade
                </label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full"
                  placeholder="Ex: Fazenda São João"
                />
              </div>
              
              <div>
                <label htmlFor="areaTotal" className="block text-sm font-medium text-gray-700 mb-1">
                  Área Total (hectares)
                </label>
                <Input
                  id="areaTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={areaTotal}
                  onChange={(e) => setAreaTotal(e.target.value)}
                  required
                  className="w-full"
                  placeholder="Ex: 150.5"
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar Propriedade'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/tabelas')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CadastroPropriedade;
