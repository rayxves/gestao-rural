
import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserSession } from '@/hooks/useUserSession';
import { useCollaboratorSession } from '@/hooks/useCollaboratorSession';
import { Layout } from '@/components/Layout';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { userId } = useUserSession();
  const { isCollaborator, collaboratorData, isLoading: collaboratorLoading } = useCollaboratorSession();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const userIdFromUrl = urlParams.get('user_id');
  const hasUserIdInUrl = !!(userIdFromUrl || userId);


  const isLoading = authLoading || collaboratorLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Se é colaborador, permitir acesso
  if (isCollaborator && collaboratorData) {
    return <>{children}</>;
  }

  // Se usuário logado → renderizar normalmente
  if (user) {
    return <>{children}</>;
  }

  // Se usuário NÃO logado E URL contém user_id → redirecionar para /login
  if (!user && hasUserIdInUrl) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se usuário NÃO logado E URL NÃO contém user_id → mostrar mensagem padrão
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white text-3xl">🌾</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Bem-vindo ao AgroSystem
            </h2>
            <p className="text-gray-600">
              Para acessar o sistema, converse com nosso bot no Telegram e obtenha seu link personalizado.
            </p>
          </div>
          
          <div className="space-y-4">
            <a
              href="https://web.telegram.org/k/#@gestao_rural_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Conversar com o Bot 🤖
            </a>
            
            <div className="text-sm text-gray-500">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-emerald-600 hover:text-emerald-500 font-medium"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
