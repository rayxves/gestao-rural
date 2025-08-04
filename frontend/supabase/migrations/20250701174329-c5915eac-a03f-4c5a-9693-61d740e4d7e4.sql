
-- Adicionar políticas de leitura para as tabelas que ainda não têm acesso adequado

-- Políticas para a tabela insumo (adicionar leitura pública para consultas)
DROP POLICY IF EXISTS "permitir_leitura_insumo" ON public.insumo;
CREATE POLICY "permitir_leitura_insumo" 
ON public.insumo 
FOR SELECT 
USING (true);

-- Políticas para a tabela trabalho (adicionar leitura pública para consultas)
DROP POLICY IF EXISTS "permitir_leitura_trabalho" ON public.trabalho;
CREATE POLICY "permitir_leitura_trabalho" 
ON public.trabalho 
FOR SELECT 
USING (true);

-- Políticas para a tabela propriedade (adicionar leitura pública para consultas)
DROP POLICY IF EXISTS "permitir_leitura_propriedade" ON public.propriedade;
CREATE POLICY "permitir_leitura_propriedade" 
ON public.propriedade 
FOR SELECT 
USING (true);
