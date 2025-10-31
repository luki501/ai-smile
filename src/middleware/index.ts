import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerClient } from "../db/supabase.server";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && import.meta.env.DEV) {
    const email = import.meta.env.DEV_USER_EMAIL;
    const password = import.meta.env.DEV_USER_PASSWORD;

    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        const {
          data: { session: newSession },
        } = await supabase.auth.getSession();
        context.locals.session = newSession;
        context.locals.user = newSession?.user ?? null;
      }
    }
  } else {
    context.locals.session = session;
    context.locals.user = session?.user ?? null;
  }

  context.locals.supabase = supabase;
  context.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  };

  return next();
});
