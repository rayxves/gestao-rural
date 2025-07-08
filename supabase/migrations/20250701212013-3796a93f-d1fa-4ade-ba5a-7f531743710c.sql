
-- Criar políticas RLS mais permissivas para permitir updates sem depender de JWT claims
-- Estas políticas são temporárias e devem ser ajustadas conforme a necessidade de segurança

-- Para a tabela insumo
DROP POLICY IF EXISTS "permitir_update_insumo" ON public.insumo;
CREATE POLICY "permitir_update_insumo_temp" 
ON public.insumo 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Para a tabela trabalho
DROP POLICY IF EXISTS "permitir_update_trabalho" ON public.trabalho;
CREATE POLICY "permitir_update_trabalho_temp" 
ON public.trabalho 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Para a tabela plantio
DROP POLICY IF EXISTS "permitir_update_plantio" ON public.plantio;
CREATE POLICY "permitir_update_plantio_temp" 
ON public.plantio 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Para a tabela colheita
DROP POLICY IF EXISTS "permitir_update_colheita" ON public.colheita;
CREATE POLICY "permitir_update_colheita_temp" 
ON public.colheita 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Para a tabela venda
DROP POLICY IF EXISTS "permitir_update_venda" ON public.venda;
CREATE POLICY "permitir_update_venda_temp" 
ON public.venda 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Para a tabela gasto
DROP POLICY IF EXISTS "permitir_update_gasto" ON public.gasto;
CREATE POLICY "permitir_update_gasto_temp" 
ON public.gasto 
FOR UPDATE 
USING (true)
WITH CHECK (true);
