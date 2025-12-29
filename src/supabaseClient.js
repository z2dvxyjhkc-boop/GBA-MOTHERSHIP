import { createClient } from '@supabase/supabase-js';

// En Create React App usamos process.env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERROR CRÍTICO: No se leyeron las variables de entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);