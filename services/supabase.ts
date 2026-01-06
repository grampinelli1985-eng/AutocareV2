
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let internalSupabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase URL or Anon Key is missing! Check your .env.local file or Vercel environment variables.');
    // Export a dummy client that doesn't crash on initialization, 
    // but will fail on calls (which we should handle in App.tsx)
    // @ts-ignore
    const missingKeyError = (method: string) => {
        const msg = `ERRO CRÍTICO: Supabase não configurado. O método '${method}' não pode ser executado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel ou .env.local.`;
        console.error(msg);
        return { error: { message: msg } };
    };

    internalSupabase = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signOut: async () => ({ error: null }),
            signInWithPassword: async () => missingKeyError('signInWithPassword'),
            signInWithOAuth: async () => missingKeyError('signInWithOAuth'),
            signUp: async () => missingKeyError('signUp'),
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) })
        })
    } as any;
} else {
    internalSupabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = internalSupabase;
