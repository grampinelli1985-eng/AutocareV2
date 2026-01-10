import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Request received:", req.method)
        const authHeader = req.headers.get('Authorization')
        console.log("Auth Header present:", !!authHeader)

        const { vehicleId, latitude, longitude, description } = await req.json()

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader || '' }
                }
            }
        )

        // 2. Call the RPC
        const { data, error: rpcError } = await supabase.rpc('handle_theft_report', {
            p_vehicle_id: vehicleId,
            p_lat: latitude,
            p_lng: longitude,
            p_description: description
        })

        if (rpcError) {
            console.error("RPC Error:", rpcError)
            return new Response(JSON.stringify({ error: rpcError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const result = (data && data.length > 0) ? data[0] : { recipient_count: 0, tokens: [] }

        console.log(`Theft alert processed. Recipients: ${result.recipient_count}`)

        return new Response(JSON.stringify({
            success: true,
            recipientCount: result.recipient_count
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error("Critical Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
