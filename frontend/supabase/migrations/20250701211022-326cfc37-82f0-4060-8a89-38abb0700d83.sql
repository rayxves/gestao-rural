
-- Verificar e corrigir as políticas RLS para permitir updates
-- Primeiro, vamos verificar se as políticas existem e estão corretas

-- Para a tabela insumo
DROP POLICY IF EXISTS "permitir_update_insumo" ON public.insumo;
CREATE POLICY "permitir_update_insumo" 
ON public.insumo 
FOR UPDATE 
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Para a tabela trabalho
DROP POLICY IF EXISTS "permitir_update_trabalho" ON public.trabalho;
CREATE POLICY "permitir_update_trabalho" 
ON public.trabalho 
FOR UPDATE 
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Para a tabela plantio
DROP POLICY IF EXISTS "permitir_update_plantio" ON public.plantio;
CREATE POLICY "permitir_update_plantio" 
ON public.plantio 
FOR UPDATE 
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Para a tabela colheita
DROP POLICY IF EXISTS "permitir_update_colheita" ON public.colheita;
CREATE POLICY "permitir_update_colheita" 
ON public.colheita 
FOR UPDATE 
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Para a tabela venda
DROP POLICY IF EXISTS "permitir_update_venda" ON public.venda;
CREATE POLICY "permitir_update_venda" 
ON public.venda 
FOR UPDATE 
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Para a tabela gasto
DROP POLICY IF EXISTS "permitir_update_gasto" ON public.gasto;
CREATE POLICY "permitir_update_gasto" 
ON public.gasto 
FOR UPDATE 
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));
