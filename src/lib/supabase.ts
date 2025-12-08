/**
 * Supabase Client Configuration
 * ShiftCheck Marketing Website
 *
 * Uses environment variables for configuration.
 * See .env.local for local development.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type exports for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';
