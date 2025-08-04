
-- Remover a política de login existente que está muito restritiva
DROP POLICY IF EXISTS "permitir_login_usuario" ON public.usuario;

-- Criar política que permite leitura de qualquer usuário para login
-- (necessário para verificar email/senha durante o processo de autenticação)
CREATE POLICY "permitir_leitura_login" 
ON public.usuario 
FOR SELECT 
USING (true);

-- Manter a política de registro (já existe e está funcionando)
-- CREATE POLICY "permitir_registro_usuario" 
-- ON public.usuario 
-- FOR INSERT 
-- WITH CHECK (true);
