
-- Atualizar as políticas RLS da tabela propriedade para trabalhar com nosso sistema de auth customizado
-- Primeiro, vamos remover as políticas existentes
DROP POLICY IF EXISTS "permitir_insert_propriedade" ON public.propriedade;
DROP POLICY IF EXISTS "permitir_update_propriedade" ON public.propriedade;
DROP POLICY IF EXISTS "permitir_delete_propriedade" ON public.propriedade;
DROP POLICY IF EXISTS "permitir_leitura_propriedade" ON public.propriedade;

-- Criar novas políticas mais permissivas para nosso sistema customizado
-- Política para leitura - permite ler todas as propriedades
CREATE POLICY "permitir_leitura_propriedade" 
ON public.propriedade 
FOR SELECT 
USING (true);

-- Política para inserção - permite inserir propriedades
CREATE POLICY "permitir_insert_propriedade" 
ON public.propriedade 
FOR INSERT 
WITH CHECK (true);

-- Política para atualização - permite atualizar propriedades
CREATE POLICY "permitir_update_propriedade" 
ON public.propriedade 
FOR UPDATE 
USING (true);

-- Política para exclusão - permite excluir propriedades
CREATE POLICY "permitir_delete_propriedade" 
ON public.propriedade 
FOR DELETE 
USING (true);
