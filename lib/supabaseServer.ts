// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js'

// Make sure these are defined in your .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // safe only on the server
)

export default supabase;
