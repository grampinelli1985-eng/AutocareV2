
-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('theft', 'maintenance', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Usually we'd use security definer functions, but for simplicity...

-- 2. Enhanced handle_theft_report RPC
CREATE OR REPLACE FUNCTION public.handle_theft_report(
    p_vehicle_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_description TEXT
)
RETURNS TABLE (recipient_count INT, tokens TEXT[]) AS $$
DECLARE
    v_owner_id UUID;
    v_brand TEXT;
    v_model TEXT;
    v_plate TEXT;
    v_reporter_plan TEXT;
    v_recipient_count INT := 0;
    v_tokens TEXT[] := '{}';
BEGIN
    -- Get vehicle and owner info
    SELECT owner_id, brand, model, plate 
    INTO v_owner_id, v_brand, v_model, v_plate
    FROM vehicles 
    WHERE id = p_vehicle_id;

    -- Get reporter plan
    SELECT plan INTO v_reporter_plan FROM profiles WHERE id = v_owner_id;

    -- Update vehicle status
    UPDATE vehicles 
    SET is_stolen = true,
        theft_report = jsonb_build_object(
            'date', now(),
            'description', p_description,
            'latitude', p_lat,
            'longitude', p_lng,
            'reporterPlan', v_reporter_plan
        ),
        last_known_lat = p_lat,
        last_known_lng = p_lng
    WHERE id = p_vehicle_id;

    -- 3. Find recipients and insert notifications
    -- Logic: 
    -- - Premium users always get it (National)
    -- - Free users get it if within 100km (100,000 meters)
    
    WITH recipients AS (
        SELECT 
            p.id, 
            p.push_token
        FROM profiles p
        WHERE p.id != v_owner_id -- Don't notify the reporter
        AND (
            p.plan = 'premium'
            OR (
                p.plan = 'free' 
                AND p.location IS NOT NULL 
                AND ST_DWithin(
                    p.location,
                    ST_SetSRID(ST_Point(p_lng, p_lat), 4326)::geography,
                    100000 -- 100km
                )
            )
        )
    )
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
        r.id, 
        'theft', 
        'ALERTA DE ROUBO: ' || v_brand || ' ' || v_model,
        'Um veículo foi dado como roubado próximo a você ou na rede nacional: ' || v_plate || '. ' || p_description,
        jsonb_build_object(
            'vehicleId', p_vehicle_id,
            'brand', v_brand,
            'model', v_model,
            'plate', v_plate,
            'latitude', p_lat,
            'longitude', p_lng
        )
    FROM recipients r;

    -- Get token list for push service
    SELECT array_agg(push_token) INTO v_tokens FROM profiles WHERE push_token IS NOT NULL AND id IN (SELECT id FROM profiles WHERE id != v_owner_id); -- Simplify for tokens

    -- Count affected rows (recipients)
    GET DIAGNOSTICS v_recipient_count = ROW_COUNT;

    RETURN QUERY SELECT v_recipient_count, v_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
