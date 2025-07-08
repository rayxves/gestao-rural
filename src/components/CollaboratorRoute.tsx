
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
  const { isCollaborator, collaboratorData, isLoading } = useCollaboratorSession();
  const { user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Se é colaborador
  if (isCollaborator && collaboratorData) {
    // Verificar se a rota atual é permitida para colaboradores
    const currentPath = location.pathname;
    const isAllowedPath = allowedPaths.some(path => currentPath.startsWith(path));
    
    if (!isAllowedPath) {
      return <Navigate to="/tabelas" replace />;
    }
    
    return <>{children}</>;
  }

  // Se é usuário normal (produtor), permitir acesso normal
  if (user) {
    return <>{children}</>;
  }

  // Se não é nem colaborador nem usuário logado, redirecionar para login
  return <Navigate to="/login" replace />;
};
