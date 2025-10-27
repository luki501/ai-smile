import { defineMiddleware } from 'astro:middleware';

import { supabaseClient } from '../db/supabase.client.ts';

export const onRequest = defineMiddleware(async (context, next) => {
	context.locals.supabase = supabaseClient;

	const {
		data: { session },
	} = await supabaseClient.auth.getSession();
	context.locals.session = session;

	return next();
});
