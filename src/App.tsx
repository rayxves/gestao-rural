
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { CollaboratorRoute } from "@/components/CollaboratorRoute";
import Tabelas from "./pages/Tabelas";
import Graficos from "./pages/Graficos";
import Upload from "./pages/Upload";
import DadosClimaticos from "./pages/DadosClimaticos";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import CadastroPropriedade from "./pages/CadastroPropriedade";
import VincularPropriedade from "./pages/VincularPropriedade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/tabelas" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route 
              path="/tabelas" 
              element={
                <AuthGuard>
                  <CollaboratorRoute>
                    <Tabelas />
                  </CollaboratorRoute>
                </AuthGuard>
              } 
            />
            <Route 
              path="/graficos" 
              element={
                <AuthGuard>
                  <CollaboratorRoute allowedPaths={['/graficos']}>
                    <Graficos />
                  </CollaboratorRoute>
                </AuthGuard>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <AuthGuard>
                  <CollaboratorRoute>
                    <Upload />
                  </CollaboratorRoute>
                </AuthGuard>
              } 
            />
            <Route 
              path="/dados-climaticos" 
              element={
                <AuthGuard>
                  <CollaboratorRoute allowedPaths={['/dados-climaticos']}>
                    <DadosClimaticos />
                  </CollaboratorRoute>
                </AuthGuard>
              } 
            />
            <Route 
              path="/cadastro-propriedade" 
              element={
                <AuthGuard>
                  <CollaboratorRoute allowedPaths={['/cadastro-propriedade']}>
                    <CadastroPropriedade />
                  </CollaboratorRoute>
                </AuthGuard>
              } 
            />
            <Route 
              path="/vincular-propriedade" 
              element={
                <AuthGuard>
                  <CollaboratorRoute allowedPaths={['/vincular-propriedade']}>
                    <VincularPropriedade />
                  </CollaboratorRoute>
                </AuthGuard>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
