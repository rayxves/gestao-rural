import { useAuth } from '@/hooks/useAuth';
import { useCollaboratorSession } from '@/hooks/useCollaboratorSession';
import { useUserSession } from '@/hooks/useUserSession';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EffectiveUserIdState {
  effectiveUserId: string | null;
  isReady: boolean;
  userType: 'producer' | 'collaborator' | null;
  error: string | null;
}

export const useEffectiveUserId = () => {
  const { user } = useAuth();
  const { userId } = useUserSession();
  const { 
    isCollaborator, 
    collaboratorData, 
    isInitialized: collaboratorInitialized,
    isLoading: collaboratorLoading 
  } = useCollaboratorSession();

  const [state, setState] = useState<EffectiveUserIdState>({
    effectiveUserId: null,
    isReady: false,
    userType: null,
    error: null
  });

  useEffect(() => {
    const determineEffectiveUserId = async () => {
      console.log('🔍 useEffectiveUserId: Iniciando determinação...');
      
      if (!collaboratorInitialized || collaboratorLoading) {
        console.log('⏳ useEffectiveUserId: Aguardando inicialização do colaborador...');
        setState(prev => ({ ...prev, isReady: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, error: null }));

        // CASO 1: É colaborador autenticado
        if (isCollaborator && collaboratorData) {
          console.log('👥 useEffectiveUserId: COLABORADOR detectado:', collaboratorData);
          
          const { data: producer, error: producerError } = await supabase
            .from('usuario')
            .select('user_id')
            .eq('id', collaboratorData.produtorId)
            .maybeSingle();

          if (producerError || !producer) {
            console.error('❌ useEffectiveUserId: Erro ao buscar produtor:', producerError);
            setState({
              effectiveUserId: null,
              isReady: true,
              userType: 'collaborator',
              error: 'Erro ao buscar dados do produtor'
            });
            return;
          }

          console.log('✅ useEffectiveUserId: UserId do produtor encontrado:', producer.user_id);
          setState({
            effectiveUserId: producer.user_id,
            isReady: true,
            userType: 'collaborator',
            error: null
          });
          return;
        }

        // CASO 2: É usuário autenticado (produtor) - CORREÇÃO APLICADA AQUI
        if (user && user.user_id) {
          console.log('🏢 useEffectiveUserId: PRODUTOR LOGADO detectado:', user.user_id);
          setState({
            effectiveUserId: user.user_id, // <<<-- AQUI ESTAVA O ERRO, AGORA CORRIGIDO
            isReady: true,
            userType: 'producer',
            error: null
          });
          return;
        }

        // CASO 3: Sessão com userId (produtor via URL/localStorage)
        if (userId) {
          console.log('🔗 useEffectiveUserId: PRODUTOR VIA SESSÃO detectado:', userId);
          setState({
            effectiveUserId: userId,
            isReady: true,
            userType: 'producer',
            error: null
          });
          return;
        }

        // CASO 4: Nenhum usuário identificado
        console.log('❓ useEffectiveUserId: Nenhum usuário identificado');
        setState({
          effectiveUserId: null,
          isReady: true,
          userType: null,
          error: null
        });

      } catch (error) {
        console.error('❌ useEffectiveUserId: Erro ao determinar userId efetivo:', error);
        setState({
          effectiveUserId: null,
          isReady: true,
          userType: null,
          error: 'Erro interno'
        });
      }
    };

    determineEffectiveUserId();
  }, [isCollaborator, collaboratorData, collaboratorInitialized, collaboratorLoading, user, userId]);

  console.log('🏁 useEffectiveUserId Estado Final:', {
    effectiveUserId: state.effectiveUserId,
    isReady: state.isReady,
    userType: state.userType,
    error: state.error,
    dependencies: {
      isCollaborator,
      hasCollaboratorData: !!collaboratorData,
      collaboratorInitialized,
      collaboratorLoading,
      hasUser: !!user,
      hasUserId: !!userId
    }
  });

  return state;
};