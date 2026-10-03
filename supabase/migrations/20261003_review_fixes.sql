-- Correções da revisão de 03/10/2026 (aplicadas no projeto cjbptiubvfpaqgvzpkyy).
-- As funções de roubo/avistamento/recuperação em produção diferem das versões do repositório,
-- por isso elas são corrigidas "no lugar": a verificação de segurança é inserida na definição
-- atual (pg_get_functiondef) em vez de substituir a função inteira.

BEGIN;

-- 1. Coluna usada pelo lembrete quinzenal de KM (Premium). Não existia: o app gravava
--    e lia um campo inexistente, então o lembrete nunca funcionava.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_km_reminder_date date;

-- 2. Notificações: faltava política de UPDATE ("marcar como lida" não persistia).
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- A política de INSERT com WITH CHECK (true) deixava qualquer usuário criar notificações
-- falsas para qualquer outro. As funções SECURITY DEFINER não dependem dela.
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Veículos roubados eram legíveis por QUALQUER pessoa com a chave anônima (inclusive
--    sem login), expondo dono e coordenadas. Restringe a usuários autenticados.
DROP POLICY IF EXISTS "Public access to stolen vehicles info" ON public.vehicles;
CREATE POLICY "Public access to stolen vehicles info"
ON public.vehicles FOR SELECT
TO authenticated
USING (is_stolen = true);

-- 4. Verificações de segurança nas funções SECURITY DEFINER.
DO $migration$
DECLARE
    v_def text;
    v_new text;
BEGIN
    -- 4a. handle_theft_report: qualquer usuário podia marcar QUALQUER veículo como roubado.
    v_def := pg_get_functiondef('public.handle_theft_report(uuid, double precision, double precision, text)'::regprocedure);
    IF position('ACCESS_CHECK_OWNER' in v_def) = 0 THEN
        v_new := regexp_replace(
            v_def,
            '(FROM vehicles WHERE id = p_vehicle_id;)',
            E'\\1\n    -- ACCESS_CHECK_OWNER\n    IF v_owner_id IS NULL OR v_owner_id <> auth.uid() THEN\n        RAISE EXCEPTION ''Veículo não encontrado ou não pertence ao usuário'';\n    END IF;'
        );
        IF v_new = v_def THEN RAISE EXCEPTION 'handle_theft_report: ponto de inserção não encontrado'; END IF;
        EXECUTE v_new;
    END IF;

    -- 4b. confirm_vehicle_recovery: qualquer usuário podia "recuperar" o carro de outro,
    --     apagando o alerta de roubo.
    v_def := pg_get_functiondef('public.confirm_vehicle_recovery(uuid)'::regprocedure);
    IF position('ACCESS_CHECK_OWNER' in v_def) = 0 THEN
        v_new := regexp_replace(
            v_def,
            '(FROM vehicles WHERE id = p_vehicle_id;)',
            E'\\1\n    -- ACCESS_CHECK_OWNER\n    IF v_owner_id IS NULL OR v_owner_id <> auth.uid() THEN\n        RAISE EXCEPTION ''Veículo não encontrado ou não pertence ao usuário'';\n    END IF;'
        );
        IF v_new = v_def THEN RAISE EXCEPTION 'confirm_vehicle_recovery: ponto de inserção não encontrado'; END IF;
        EXECUTE v_new;
    END IF;

    -- 4c. report_vehicle_sighting: aceitava avistamentos de qualquer veículo (mesmo não
    --     roubado) e de chamadas sem login, notificando o dono indevidamente.
    v_def := pg_get_functiondef('public.report_vehicle_sighting(uuid, text, text, text)'::regprocedure);
    IF position('ACCESS_CHECK_STOLEN' in v_def) = 0 THEN
        v_new := regexp_replace(
            v_def,
            '(SELECT owner_id, model INTO v_owner_id, v_model FROM vehicles WHERE id = p_vehicle_id;)',
            E'\\1\n    -- ACCESS_CHECK_STOLEN\n    IF auth.uid() IS NULL THEN\n        RAISE EXCEPTION ''Usuário não autenticado'';\n    END IF;\n    IF v_owner_id IS NULL OR NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND is_stolen) THEN\n        RAISE EXCEPTION ''Este veículo não possui alerta de roubo ativo'';\n    END IF;'
        );
        IF v_new = v_def THEN RAISE EXCEPTION 'report_vehicle_sighting: ponto de inserção não encontrado'; END IF;
        EXECUTE v_new;
    END IF;
END
$migration$;

-- 5. Exclusão de conta (exigência do Google Play). O app apagava só veículos e perfil:
--    o login continuava existindo e abastecimentos/registros/notificações ficavam.
--    As FKs para auth.users já são ON DELETE CASCADE; os DELETEs explícitos são redundância.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID AS $$
DECLARE
    v_uid UUID := auth.uid();
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    DELETE FROM public.notifications WHERE user_id = v_uid;
    DELETE FROM public.fuel_logs WHERE user_id = v_uid;
    DELETE FROM public.service_records WHERE user_id = v_uid;
    DELETE FROM public.vehicles WHERE owner_id = v_uid;
    DELETE FROM public.profiles WHERE id = v_uid;
    DELETE FROM auth.users WHERE id = v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMIT;
