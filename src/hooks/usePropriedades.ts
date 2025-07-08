
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Propriedade {
  id: number;
  nome: string;
  area_total: number;
  data_registro: string;
  user_id: number;
}

export const usePropriedades = (userId: string | null) => {
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropriedades = async () => {
      if (!userId) {
        setPropriedades([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching propriedades for userId:', userId);

        // Primeiro, buscar o ID do usuário na tabela usuario
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('id')
          .eq('user_id', userId)
          .single();

        console.log('User data query result:', { userData, userError });

        if (userError) {
          console.error('Erro ao buscar usuário:', userError);
          throw userError;
        }

        if (!userData) {
          console.log('Usuário não encontrado');
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

        console.log('Propriedades query result:', { data, error });

        if (error) throw error;

        setPropriedades(data || []);
      } catch (err) {
        console.error('Erro ao buscar propriedades:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setPropriedades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPropriedades();
  }, [userId]);

  return { propriedades, loading, error };
};
