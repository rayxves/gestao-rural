
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CollaboratorData {
  userId: string;
  produtorId: number;
  username: string;
}

interface CollaboratorSessionState {
  collaboratorData: CollaboratorData | null;
  isCollaborator: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Novo estado para controlar inicialização
  error: string | null;
}

export const useCollaboratorSession = () => {
  const [state, setState] = useState<CollaboratorSessionState>({
    collaboratorData: null,
    isCollaborator: false,
    isLoading: true,
    isInitialized: false,
    error: null
  });
  
  const location = useLocation();

  const checkCollaboratorAuth = useCallback(async () => {
    console.log('=== INÍCIO DA VERIFICAÇÃO DE COLABORADOR ===');
    
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        isInitialized: false 
      }));

      const urlParams = new URLSearchParams(location.search);
      const userIdFromUrl = urlParams.get('user_id');
      const produtorIdFromUrl = urlParams.get('produtor_id');

      console.log('Parâmetros da URL:', { userIdFromUrl, produtorIdFromUrl });

      // Verificar se há parâmetros na URL
      if (userIdFromUrl && produtorIdFromUrl) {
        console.log('Verificando colaborador via URL...');
        
        const produtorIdInt = parseInt(produtorIdFromUrl);
        
        if (isNaN(produtorIdInt)) {
          console.error('produtor_id inválido:', produtorIdFromUrl);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isInitialized: true,
            error: 'ID do produtor inválido'
          }));
          return;
        }

        const { data: collaborator, error } = await supabase
          .from('colaborador')
          .select('*')
          .eq('user_id', userIdFromUrl)
          .eq('produtor_id', produtorIdInt)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar colaborador:', error);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isInitialized: true,
            error: 'Erro ao verificar colaborador'
          }));
          return;
        }

        if (collaborator) {
          const collaboratorInfo: CollaboratorData = {
            userId: collaborator.user_id,
            produtorId: collaborator.produtor_id,
            username: collaborator.username || ''
          };

          // Armazenar dados do colaborador no localStorage
          localStorage.setItem('collaborator_data', JSON.stringify(collaboratorInfo));
          
          console.log('Colaborador autenticado via URL:', collaboratorInfo);
          setState({
            collaboratorData: collaboratorInfo,
            isCollaborator: true,
            isLoading: false,
            isInitialized: true,
            error: null
          });
          return;
        } else {
          console.log('Colaborador não encontrado na base de dados');
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isInitialized: true,
            error: null
          }));
          return;
        }
      }

      // Se não há parâmetros na URL, tentar recuperar do localStorage
      console.log('Tentando recuperar colaborador do localStorage...');
      const storedData = localStorage.getItem('collaborator_data');
      
      if (storedData) {
        try {
          const collaboratorInfo: CollaboratorData = JSON.parse(storedData);
          
          // Validar dados do localStorage
          if (collaboratorInfo.userId && collaboratorInfo.produtorId && collaboratorInfo.username) {
            console.log('Colaborador recuperado do localStorage:', collaboratorInfo);
            setState({
              collaboratorData: collaboratorInfo,
              isCollaborator: true,
              isLoading: false,
              isInitialized: true,
              error: null
            });
            return;
          } else {
            console.log('Dados do localStorage inválidos, removendo...');
            localStorage.removeItem('collaborator_data');
          }
        } catch (error) {
          console.error('Erro ao recuperar dados do colaborador:', error);
          localStorage.removeItem('collaborator_data');
        }
      }

      // Nenhum colaborador encontrado
      console.log('Nenhum colaborador encontrado');
      setState({
        collaboratorData: null,
        isCollaborator: false,
        isLoading: false,
        isInitialized: true,
        error: null
      });

    } catch (error) {
      console.error('Erro na autenticação do colaborador:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: true,
        error: 'Erro interno na verificação'
      }));
    }

    console.log('=== FIM DA VERIFICAÇÃO DE COLABORADOR ===');
  }, [location.search]);

  useEffect(() => {
    checkCollaboratorAuth();
  }, [checkCollaboratorAuth]);

  const clearCollaboratorSession = useCallback(() => {
    localStorage.removeItem('collaborator_data');
    setState({
      collaboratorData: null,
      isCollaborator: false,
      isLoading: false,
      isInitialized: true,
      error: null
    });
    console.log('Sessão do colaborador limpa');
  }, []);

  return {
    collaboratorData: state.collaboratorData,
    isCollaborator: state.isCollaborator,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    clearCollaboratorSession,
    hasCollaboratorAccess: !!state.collaboratorData && state.isInitialized
  };
};
