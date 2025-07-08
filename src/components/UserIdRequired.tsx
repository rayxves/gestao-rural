
import React from 'react';
import { Button } from '@/components/ui/button';

export const UserIdRequired: React.FC = () => {
  const handleTelegramRedirect = () => {
    window.open('https://t.me/gestao_rural_bot', '_blank');
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <span className="text-white text-4xl">🌾</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">✨</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-600 bg-clip-text text-transparent mb-4">
            AgroSystem
          </h1>
          
          <p className="text-xl text-slate-600 font-medium mb-2">
            Sistema de Gestão Rural
          </p>
          
          <p className="text-slate-500 text-lg">
            Controle completo da sua propriedade rural
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Primeira vez aqui?
            </h2>
            
            <p className="text-slate-600 mb-4 text-sm">
              Converse com nosso assistente no Telegram para registrar seus dados
            </p>
            
            <Button 
              onClick={handleTelegramRedirect}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Conversar no Telegram
            </Button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Já tem uma conta?
            </h2>
            
            <p className="text-slate-600 mb-4 text-sm">
              Acesse o sistema com suas credenciais
            </p>
            
            <Button 
              onClick={handleLoginRedirect}
              variant="outline"
              className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
            >
              🔐 Acessar o Sistema
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-slate-800 text-sm">Registros</h3>
            <p className="text-xs text-slate-600">Controle de plantio e colheita</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-slate-800 text-sm">Análises</h3>
            <p className="text-xs text-slate-600">Gráficos e relatórios</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-slate-800 text-sm">Financeiro</h3>
            <p className="text-xs text-slate-600">Controle de gastos</p>
          </div>
        </div>
        
        {/* Alternative access info */}
        <div className="text-sm text-slate-500 bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
          <p className="font-medium text-slate-700 mb-1">💡 Já tem seu ID de usuário?</p>
          <p className="text-xs">Acesse diretamente: <span className="font-mono text-emerald-600">{window.location.origin}/registro?user_id=SEU_ID</span></p>
        </div>
      </div>
    </div>
  );
};
