
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userId: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Capturar e armazenar user_id da URL automaticamente
    const urlParams = new URLSearchParams(location.search);
    const userIdFromUrl = urlParams.get('user_id');
    
    if (userIdFromUrl) {
      localStorage.setItem('gestao_rural_user_id', userIdFromUrl);
      console.log('User ID capturado e armazenado da URL:', userIdFromUrl);
    }

    // Verificar token existente com validação de expiração
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const tokenExpiry = localStorage.getItem('auth_token_expiry');
        
        if (token && tokenExpiry) {
          const now = Date.now();
          const expiryTime = parseInt(tokenExpiry);
          
          // Se o token ainda é válido (não expirou)
          if (now < expiryTime) {
            const userData = JSON.parse(atob(token.split('.')[1]));
            setUser(userData);
            console.log('Token válido encontrado, usuário autenticado automaticamente');
          } else {
            console.log('Token expirado, removendo...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token_expiry');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar token existente:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expiry');
      }
      setIsLoading(false);
    };

    checkExistingAuth();
  }, [location.search]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== INÍCIO DO LOGIN ===');
      console.log('Email fornecido:', email);
      
      // Primeiro, vamos listar TODOS os usuários para debug
      const { data: allUsers, error: listError } = await supabase
        .from('usuario')
        .select('id, email, user_id');
      
      console.log('Todos os usuários no banco:', allUsers);
      console.log('Erro ao listar usuários:', listError);
      
      // Agora vamos tentar encontrar o usuário específico
      const { data: userData, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      console.log('Resposta da consulta específica:', { userData, error });

      if (error) {
        console.error('Erro na consulta:', error);
        return false;
      }

      if (!userData) {
        console.log('Usuário não encontrado. Tentando busca case-insensitive...');
        
        // Tentar busca case-insensitive
        const { data: userDataCI, error: errorCI } = await supabase
          .from('usuario')
          .select('*')
          .ilike('email', email.trim())
          .maybeSingle();
        
        console.log('Busca case-insensitive:', { userDataCI, errorCI });
        
        if (!userDataCI) {
          console.log('Usuário realmente não encontrado para o email:', email);
          return false;
        }
        
        // Se encontrou com case-insensitive, usa este usuário
        console.log('Usuário encontrado com busca case-insensitive');
        return await validateAndLoginUser(userDataCI, password);
      }

      console.log('Usuário encontrado, verificando senha...');
      return await validateAndLoginUser(userData, password);
      
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const validateAndLoginUser = async (userData: any, password: string): Promise<boolean> => {
    try {
      console.log('Dados do usuário encontrado:', {
        id: userData.id,
        email: userData.email,
        user_id: userData.user_id,
        hasPassword: !!userData.password
      });
      
      // Verificar se a senha armazenada não está vazia
      if (!userData.password) {
        console.error('Senha não encontrada no banco de dados');
        return false;
      }

      console.log('Verificando senha...');
      const isValid = await bcrypt.compare(password, userData.password);
      console.log('Senha válida:', isValid);

      if (!isValid) {
        console.log('Senha incorreta');
        return false;
      }

      // Verificar se user_id já está armazenado no localStorage, se não buscar da tabela
      let storedUserId = localStorage.getItem('gestao_rural_user_id');
      
      if (!storedUserId && userData.user_id) {
        console.log('User ID não estava armazenado, buscando da tabela usuario...');
        localStorage.setItem('gestao_rural_user_id', userData.user_id);
        storedUserId = userData.user_id;
        console.log('User ID armazenado na sessão:', userData.user_id);
      }

      // Criar token com dados do usuário
      const tokenData = {
        id: userData.id,
        email: userData.email,
        user_id: userData.user_id,
        iat: Date.now()
      };

      const token = btoa(JSON.stringify(tokenData));
      
      // Definir expiração para 7 dias (em milissegundos)
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);

      // Armazenar token e tempo de expiração
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_token_expiry', expirationTime.toString());
      
      setUser({ 
        id: userData.id, 
        email: userData.email, 
        user_id: userData.user_id 
      });
      
      console.log('Login realizado com sucesso, token válido por 7 dias');
      console.log('User ID na sessão:', storedUserId);
      console.log('=== FIM DO LOGIN ===');
      return true;
    } catch (error) {
      console.error('Erro na validação do usuário:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, userId: string): Promise<boolean> => {
    try {
      console.log('=== INÍCIO DO REGISTRO ===');
      console.log('Tentando registrar usuário:', { email: email.trim().toLowerCase(), userId });
      
      // Verificar se já existe um usuário com este email
      const { data: existingUser } = await supabase
        .from('usuario')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        console.log('Email já está em uso');
        return false;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Senha hasheada criada, length:', hashedPassword.length);
      
      const { error } = await supabase
        .from('usuario')
        .insert([
          {
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            user_id: userId
          }
        ]);

      if (error) {
        console.error('Erro no registro:', error);
        return false;
      }

      console.log('Registro realizado com sucesso');
      console.log('=== FIM DO REGISTRO ===');
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    localStorage.removeItem('gestao_rural_user_id'); // Remover user_id no logout
    const storedData = localStorage.getItem('collaborator_data');
    if (storedData) {
        localStorage.removeItem('collaborator_data');
   }
    setUser(null);
    navigate('/');
    console.log('Logout realizado, tokens removidos, user_id limpo');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
