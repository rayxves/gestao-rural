
-- Permitir que usuários se registrem na tabela user
CREATE POLICY "permitir_registro_usuario" 
ON public.user 
FOR INSERT 
WITH CHECK (true);

-- Permitir que usuários façam login (leitura de seus próprios dados)
CREATE POLICY "permitir_login_usuario" 
ON public.user 
FOR SELECT 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Habilitar RLS na tabela user
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários insiram dados nas tabelas principais
CREATE POLICY "permitir_insert_colheita" 
ON public.colheita 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_colheita" 
ON public.colheita 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_colheita" 
ON public.colheita 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_insert_gasto" 
ON public.gasto 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_gasto" 
ON public.gasto 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_gasto" 
ON public.gasto 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_insert_plantio" 
ON public.plantio 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_plantio" 
ON public.plantio 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_plantio" 
ON public.plantio 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_insert_venda" 
ON public.venda 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_venda" 
ON public.venda 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_venda" 
ON public.venda 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Habilitar RLS nas tabelas insumo e trabalho
ALTER TABLE public.insumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trabalho ENABLE ROW LEVEL SECURITY;

-- Políticas para insumo
CREATE POLICY "permitir_leitura_insumo" 
ON public.insumo 
FOR SELECT 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_insert_insumo" 
ON public.insumo 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_insumo" 
ON public.insumo 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_insumo" 
ON public.insumo 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Políticas para trabalho
CREATE POLICY "permitir_leitura_trabalho" 
ON public.trabalho 
FOR SELECT 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_insert_trabalho" 
ON public.trabalho 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_trabalho" 
ON public.trabalho 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_trabalho" 
ON public.trabalho 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Habilitar RLS na tabela propriedade
ALTER TABLE public.propriedade ENABLE ROW LEVEL SECURITY;

-- Políticas para propriedade
CREATE POLICY "permitir_leitura_propriedade" 
ON public.propriedade 
FOR SELECT 
USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_insert_propriedade" 
ON public.propriedade 
FOR INSERT 
WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_update_propriedade" 
ON public.propriedade 
FOR UPDATE 
USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "permitir_delete_propriedade" 
ON public.propriedade 
FOR DELETE 
USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');
