/// <reference types="astro/client" />

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
      user: User | null;
      safeGetSession(): Promise<Session | null>;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  readonly DEV_USER_EMAIL?: string;
  readonly DEV_USER_PASSWORD?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
