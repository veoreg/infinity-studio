
import { createClient } from '@supabase/supabase-js';

// Project URL (Confirmed by User)
const supabaseUrl = 'https://wjrlcxnulfnhjzgikbtp.supabase.co';

// Publishable Key (Confirmed by User)
// Note: This key is safe to expose in the browser if Row Level Security (RLS) is enabled.
const supabaseAnonKey = 'sb_publishable_ZYFVMgqtEyRwGKNbvtWVIw_tH1Rdlup';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
