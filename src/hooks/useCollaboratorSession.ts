
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CollaboratorData {
  userId: string;
  produtorId: number;
  username: string;
}

export const useCollaboratorSession = () => {
  const [collaboratorData, setCollaboratorData] = useState<CollaboratorData | null>(null);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkCollaboratorAuth = async () => {
      const urlParams = new URLSearchParams(location.search);
      const userIdFromUrl = urlParams.get('user_id');
      const produtorIdFromUrl = urlParams.get('produtor_id');

      if (userIdFromUrl && produtorIdFromUrl) {
        try {
          const produtorIdInt = parseInt(produtorIdFromUrl);
          
          const { data: collaborator, error } = await supabase
            .from('colaborador')
            .select('*')
            .eq('user_id', userIdFromUrl)
            .eq('produtor_id', produtorIdInt)
            .maybeSingle();

          if (error) {
            console.error('Erro ao buscar colaborador:', error);
            setIsLoading(false);
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
            
            setCollaboratorData(collaboratorInfo);
            setIsCollaborator(true);
            console.log('Colaborador autenticado:', collaboratorInfo);
          }
        } catch (error) {
          console.error('Erro na autenticação do colaborador:', error);
        }
      } else {
        // Tentar recuperar dados do localStorage se não houver parâmetros na URL
        const storedData = localStorage.getItem('collaborator_data');
        if (storedData) {
          try {
            const collaboratorInfo: CollaboratorData = JSON.parse(storedData);
            setCollaboratorData(collaboratorInfo);
            setIsCollaborator(true);
            console.log('colaborador recuperado do localstorage')
          } catch (error) {
            console.error('Erro ao recuperar dados do colaborador:', error);
            localStorage.removeItem('collaborator_data');
          }
        }
      }
      
      setIsLoading(false);
    };

    checkCollaboratorAuth();
  }, [location.search]);

  const clearCollaboratorSession = () => {
    localStorage.removeItem('collaborator_data');
    setCollaboratorData(null);
    setIsCollaborator(false);
    console.log('Sessão do colaborador limpa');
  };

  return {
    collaboratorData,
    isCollaborator,
    isLoading,
    clearCollaboratorSession,
    hasCollaboratorAccess: !!collaboratorData
  };
};
