import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://lliowikzustvebudgsoy.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HOmmQBn10vwi0eehQDX5gg_3aRXTUTH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
