
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCollaboratorSession } from '@/hooks/useCollaboratorSession';
import { useAuth } from '@/hooks/useAuth';

interface CollaboratorRouteProps {
  children: React.ReactNode;
  allowedPaths?: string[];
}

export const CollaboratorRoute: React.FC<CollaboratorRouteProps> = ({ 
  children, 
  allowedPaths = ['/tabelas', '/upload'] 
}) => {
  const { 
    isCollaborator, 
    collaboratorData, 
    isLoading, 
    isInitialized 
  } = useCollaboratorSession();
  const { user } = useAuth();
  const location = useLocation();

  // Aguardar inicialização completa
  if (isLoading || !isInitialized) {
    console.log('CollaboratorRoute: Aguardando inicialização...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  console.log('CollaboratorRoute Estado:', {
    isCollaborator,
    hasCollaboratorData: !!collaboratorData,
    hasUser: !!user,
    currentPath: location.pathname,
    allowedPaths
  });

  // CORREÇÃO: Se é colaborador válido, permitir acesso diretamente
  if (isCollaborator && collaboratorData) {
    // Verificar se a rota atual é permitida para colaboradores
    const currentPath = location.pathname;
    const isAllowedPath = allowedPaths.some(path => currentPath.startsWith(path));
    
    if (!isAllowedPath) {
      console.log('CollaboratorRoute: Rota não permitida para colaborador, redirecionando para /tabelas');
      return <Navigate to="/tabelas" replace />;
    }
    
    console.log('CollaboratorRoute: Acesso permitido para colaborador na rota:', currentPath);
    return <>{children}</>;
  }

  // Se é usuário normal (produtor logado), permitir acesso normal
  if (user) {
    console.log('CollaboratorRoute: Acesso permitido para usuário logado (produtor)');
    return <>{children}</>;
  }

  // IMPORTANTE: Só redirecionar para login se NÃO for colaborador
  // Se chegou aqui, não é nem colaborador válido nem usuário logado
  console.log('CollaboratorRoute: Sem permissões válidas, redirecionando para login');
  return <Navigate to="/login" replace />;
};
