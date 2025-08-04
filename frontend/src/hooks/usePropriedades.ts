
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';

interface Propriedade {
  id: number;
  nome: string;
  area_total: number;
  data_registro: string;
  user_id: number;
}

export const usePropriedades = (_userId: string | null) => {
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { effectiveUserId, isReady, userType, error: userIdError } = useEffectiveUserId();

  useEffect(() => {
    const fetchPropriedades = async () => {
      // Aguardar que o userId efetivo esteja pronto
      if (!isReady) {
        console.log('usePropriedades: Aguardando userId efetivo...');
        setLoading(true);
        return;
      }

      // Se há erro no userId, não prosseguir
      if (userIdError) {
        console.error('usePropriedades: Erro no userId:', userIdError);
        setError(userIdError);
        setPropriedades([]);
        setLoading(false);
        return;
      }

      // Se não há userId efetivo, limpar dados
      if (!effectiveUserId) {
        console.log('usePropriedades: Nenhum userId efetivo, limpando dados');
        setPropriedades([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('usePropriedades: Buscando propriedades para userId efetivo:', {
          effectiveUserId,
          userType
        });

        // Primeiro, buscar o ID do usuário na tabela usuario
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('id')
          .eq('user_id', effectiveUserId)
          .maybeSingle();

        console.log('usePropriedades: User data query result:', { userData, userError });

        if (userError) {
          console.error('usePropriedades: Erro ao buscar usuário:', userError);
          throw userError;
        }

        if (!userData) {
          console.log('usePropriedades: Usuário não encontrado na tabela usuario');
          setPropriedades([]);
          setLoading(false);
          return;
        }

        // Agora buscar as propriedades usando o ID do usuário
        const { data, error } = await supabase
          .from('propriedade')
          .select('*')
          .eq('user_id', userData.id)
          .order('nome');

        console.log('usePropriedades: Propriedades query result:', { data, error });

        if (error) throw error;

        setPropriedades(data || []);
      } catch (err) {
        console.error('usePropriedades: Erro ao buscar propriedades:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setPropriedades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPropriedades();
  }, [effectiveUserId, isReady, userType]);

  return { propriedades, loading, error };
};
