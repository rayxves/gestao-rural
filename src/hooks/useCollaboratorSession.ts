
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  isInitialized: boolean;
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
  const navigate = useNavigate();

  const checkCollaboratorAuth = useCallback(async () => {
    console.log('=== INÍCIO DA VERIFICAÇÃO DE COLABORADOR ===');
    console.log('Location atual:', { pathname: location.pathname, search: location.search });
    
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        isInitialized: false 
      }));

      // Extração corrigida dos parâmetros da URL
      const searchParams = new URLSearchParams(location.search);
      const userIdFromUrl = searchParams.get('user_id');
      const produtorIdFromUrl = searchParams.get('produtor_id');

      console.log('Parâmetros da URL extraídos CORRIGIDOS:', { 
        userIdFromUrl, 
        produtorIdFromUrl,
        fullSearch: location.search,
        pathname: location.pathname,
        allParams: Object.fromEntries(searchParams.entries())
      });

      // PRIMEIRO: Verificar se há parâmetros na URL para colaborador
      if (userIdFromUrl && produtorIdFromUrl) {
        console.log('=== VERIFICAÇÃO VIA PARÂMETROS DA URL ===');
        
        const produtorIdInt = parseInt(produtorIdFromUrl);
        
        if (isNaN(produtorIdInt)) {
          console.error('produtor_id inválido:', produtorIdFromUrl);
          setState({
            collaboratorData: null,
            isCollaborator: false,
            isLoading: false,
            isInitialized: true,
            error: 'ID do produtor inválido'
          });
          return;
        }

        console.log('Buscando colaborador no Supabase:', { userIdFromUrl, produtorIdInt });

        const { data: collaborator, error } = await supabase
          .from('colaborador')
          .select('*')
          .eq('user_id', userIdFromUrl)
          .eq('produtor_id', produtorIdInt)
          .maybeSingle();

        console.log('Resultado da busca colaborador:', { collaborator, error });

        if (error) {
          console.error('Erro ao buscar colaborador:', error);
          setState({
            collaboratorData: null,
            isCollaborator: false,
            isLoading: false,
            isInitialized: true,
            error: 'Erro ao verificar colaborador'
          });
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
          
          console.log('✅ COLABORADOR AUTENTICADO VIA URL:', collaboratorInfo);
          setState({
            collaboratorData: collaboratorInfo,
            isCollaborator: true,
            isLoading: false,
            isInitialized: true,
            error: null
          });
          return;
        } else {
          console.log('❌ Colaborador não encontrado na base de dados para URL params');
          localStorage.removeItem('collaborator_data');
        }
      }

      // SEGUNDO: Se não há parâmetros na URL, tentar recuperar do localStorage
      console.log('=== VERIFICAÇÃO VIA LOCALSTORAGE ===');
      const storedData = localStorage.getItem('collaborator_data');
      
      if (storedData) {
        try {
          const collaboratorInfo: CollaboratorData = JSON.parse(storedData);
          console.log('Dados do localStorage:', collaboratorInfo);
          
          // Validar estrutura dos dados
          if (collaboratorInfo.userId && collaboratorInfo.produtorId && collaboratorInfo.username) {
            console.log('Validando dados do localStorage no Supabase...');
            
            // Verificar se os dados do localStorage ainda são válidos no Supabase
            const { data: collaborator, error: validationError } = await supabase
              .from('colaborador')
              .select('*')
              .eq('user_id', collaboratorInfo.userId)
              .eq('produtor_id', collaboratorInfo.produtorId)
              .maybeSingle();

            console.log('Validação localStorage:', { collaborator, validationError });

            if (validationError || !collaborator) {
              console.log('❌ Dados do localStorage inválidos, removendo...');
              localStorage.removeItem('collaborator_data');
            } else {
              console.log('✅ COLABORADOR RECUPERADO DO LOCALSTORAGE E VALIDADO');
              setState({
                collaboratorData: collaboratorInfo,
                isCollaborator: true,
                isLoading: false,
                isInitialized: true,
                error: null
              });
              return;
            }
          } else {
            console.log('❌ Dados do localStorage incompletos, removendo...');
            localStorage.removeItem('collaborator_data');
          }
        } catch (error) {
          console.error('Erro ao recuperar dados do colaborador:', error);
          localStorage.removeItem('collaborator_data');
        }
      }

      // TERCEIRO: Nenhum colaborador encontrado - finalizar como não-colaborador
      console.log('=== FINALIZADO: NÃO É COLABORADOR ===');
      setState({
        collaboratorData: null,
        isCollaborator: false,
        isLoading: false,
        isInitialized: true,
        error: null
      });

    } catch (error) {
      console.error('❌ Erro na autenticação do colaborador:', error);
      setState({
        collaboratorData: null,
        isCollaborator: false,
        isLoading: false,
        isInitialized: true,
        error: 'Erro interno na verificação'
      });
    }

    console.log('=== FIM DA VERIFICAÇÃO DE COLABORADOR ===');
  }, [location.search, location.pathname]);

  useEffect(() => {
    console.log('🔄 useCollaboratorSession: Effect disparado');
    checkCollaboratorAuth();
  }, [checkCollaboratorAuth]);

  const clearCollaboratorSession = useCallback(() => {
    localStorage.removeItem('collaborator_data');
    const storedUserId = localStorage.getItem('gestao_rural_user_id');
    if (storedUserId) {
       localStorage.removeItem('gestao_rural_user_id');
    } 
    setState({
      collaboratorData: null,
      isCollaborator: false,
      isLoading: false,
      isInitialized: true,
      error: null
    });
    console.log('Sessão do colaborador limpa');
    navigate('/');
  }, []);

  // Log do estado atual
  console.log('useCollaboratorSession Estado Final:', {
    isCollaborator: state.isCollaborator,
    hasCollaboratorData: !!state.collaboratorData,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    collaboratorData: state.collaboratorData
  });

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
