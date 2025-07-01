import { createClient } from '@supabase/supabase-js';

import { Database } from './database.types';

if (!process.env.SUPABASE_PROJECT_ID) throw new Error('SUPABASE_PROJECT_ID is not defined');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');

const supabase = createClient<Database>(
  `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default supabase;
