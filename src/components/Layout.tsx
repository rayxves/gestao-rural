import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserSession } from '@/hooks/useUserSession';
import { useAuth } from '@/hooks/useAuth';
import { useCollaboratorSession } from '@/hooks/useCollaboratorSession';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { userId, clearUserId } = useUserSession();
  const { user, logout } = useAuth();
  const {
    isCollaborator,
    isInitialized,
    collaboratorData
  } = useCollaboratorSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentUser = user || (userId ? { user_id: userId } : null);
  const userIdentifier = currentUser?.user_id || collaboratorData?.userId || 'Desconhecido';

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (user) {
      logout();
    } else {
      clearUserId();
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = isCollaborator
    ? [
        { path: '/tabelas', label: 'Registros', icon: '📊' },
        { path: '/upload', label: 'Upload', icon: '📤' }
      ]
    : [
        { path: '/tabelas', label: 'Registros', icon: '📊' },
        { path: '/graficos', label: 'Análises', icon: '📈' },
        { path: '/dados-climaticos', label: 'Clima', icon: '🌤️' },
        { path: '/upload', label: 'Upload', icon: '📤' },
        { path: '/cadastro-propriedade', label: 'Propriedade', icon: '🏡' },
        { path: '/vincular-propriedade', label: 'Vincular', icon: '🔗' }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🌾</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  AgroSystem
                </h1>
                <p className="text-xs text-slate-500 font-medium">Gestão Rural Inteligente</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!currentUser && !isCollaborator && (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </Link>
                  <Link
                    to="/registro"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registro</span>
                  </Link>
                </div>
              )}

              {(currentUser || isCollaborator) && (
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all duration-200"
                  title="Menu de navegação"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-slate-200 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {(currentUser || isCollaborator) ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeMenu}
                          className={`group flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                            isActive(item.path) || (item.path === '/tabelas' && isActive('/'))
                              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                              : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div>
                          <span className="text-xs text-slate-500 font-medium">Usuário: </span>
                          <span className="font-bold text-slate-700 text-sm">{userIdentifier}</span>
                        </div>
                      </div>
                      {currentUser && (
                        <button
                          onClick={handleLogout}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-200 text-sm"
                          title="Desconectar usuário"
                        >
                          Sair
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center space-x-4">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center space-x-3 p-3 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Fazer Login</span>
                    </Link>
                    <Link
                      to="/registro"
                      onClick={closeMenu}
                      className="flex items-center space-x-3 p-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all duration-200"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span className="font-medium">Criar Conta</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
