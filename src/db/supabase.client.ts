import type { SupabaseClient as BaseSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Type-safe Supabase client type for the application.
 * This ensures all database operations are type-checked against the generated schema.
 */
export type SupabaseClient = BaseSupabaseClient<Database>;

