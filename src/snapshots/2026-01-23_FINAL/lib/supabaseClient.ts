
import { createClient } from '@supabase/supabase-js';

// Project URL (Confirmed by User)
const supabaseUrl = 'https://wjrlcxnulfnhjzgikbtp.supabase.co';

// Publishable Key (Confirmed by User)
// Note: This key is safe to expose in the browser if Row Level Security (RLS) is enabled.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcmxjeG51bGZuaGp6Z2lrYnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTM5NTksImV4cCI6MjA4NDM4OTk1OX0.t8r2_sRLL8SMSCaW-p0obnn5lDME6lm9b8qo6QDB9sM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
