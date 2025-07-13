import { createClient } from '@supabase/supabase-js';
import type { Database } from 'warrantywise-database/database.types';

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL is not defined');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');

const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default supabase;
