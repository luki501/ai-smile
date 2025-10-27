import { defineMiddleware } from 'astro:middleware';

import { supabaseClient } from '../db/supabase.client.ts';

export const onRequest = defineMiddleware(async (context, next) => {
	const authHeader = context.request.headers.get('Authorization');
	const token = authHeader?.split(' ')[1];

	if (token) {
		const { data } = await supabaseClient.auth.getUser(token);
		if (data.user) {
			context.locals.user = data.user;
			context.locals.session = null;
		} else {
			context.locals.session = null;
			context.locals.user = null;
		}
	} else {
		context.locals.session = null;
		context.locals.user = null;
	}
	
	context.locals.supabase = supabaseClient;
	return next();
});
