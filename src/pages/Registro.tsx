
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';

const Registro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = new URLSearchParams(location.search).get('user_id');

  useEffect(() => {
    if (user) {
      navigate('/tabelas', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!userId) {
      toast({
        title: 'User ID não encontrado',
        description: 'Acesse através do bot do Telegram para obter seu user_id.',
        variant: 'destructive',
      });
    }
  }, [userId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: 'User ID necessário',
        description: 'Acesse através do bot do Telegram para obter seu user_id.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'Por favor, verifique se as senhas estão iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(email, password, userId);
      
      if (success) {
        toast({
          title: 'Registro realizado com sucesso!',
          description: 'Agora você pode fazer login no sistema.',
        });
        navigate('/login');
      } else {
        toast({
          title: 'Erro no registro',
          description: 'Não foi possível criar sua conta. Verifique se o email já não está em uso.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no registro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
            <p className="mt-2 text-sm text-gray-600">
              Registre-se no sistema de gestão rural
            </p>
            {userId && (
              <p className="mt-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                User ID: {userId}
              </p>
            )}
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
                placeholder="Digite a senha novamente"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !userId}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Registro;
