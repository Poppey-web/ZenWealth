import { createClient } from '@supabase/supabase-js';

// Configuration avec vos identifiants fournis
const supabaseUrl = 'https://xvkrlrumisqhppipcjfo.supabase.co';
const supabaseAnonKey = 'sb_publishable_z9I6RKZAXHd6lUpc5uCr3w_4cPbLcBK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
