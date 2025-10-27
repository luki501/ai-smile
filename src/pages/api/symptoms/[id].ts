import { SymptomService } from '@lib/symptoms/symptoms.service';
import { updateSymptomCommandSchema } from '@lib/symptoms/symptoms.validators';
import type { APIContext } from 'astro';
import { z } from 'zod';

export const prerender = false;

export async function PATCH({
	params,
	request,
	locals,
}: APIContext): Promise<Response> {
	const { session, supabase } = locals;

	if (!session?.user) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), {
			status: 401,
		});
	}
	const { user } = session;

	const symptomId = Number(params.id);

	if (isNaN(symptomId)) {
		return new Response(JSON.stringify({ message: 'Symptom ID must be a number.' }), {
			status: 400,
		});
	}

	let requestBody;
	try {
		requestBody = await request.json();
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Invalid JSON body.' }), {
			status: 400,
		});
	}

	const validationResult = updateSymptomCommandSchema.safeParse(requestBody);

	if (!validationResult.success) {
		return new Response(JSON.stringify({ errors: validationResult.error.flatten() }), {
			status: 422,
		});
	}

	try {
		const symptomService = new SymptomService(supabase);
		const updatedSymptom = await symptomService.updateSymptom(
			symptomId,
			user.id,
			validationResult.data
		);

		if (!updatedSymptom) {
			return new Response(
				JSON.stringify({
					message: `Symptom with ID ${symptomId} not found.`,
				}),
				{ status: 404 }
			);
		}

		return new Response(JSON.stringify(updatedSymptom), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Failed to update symptom:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
		return new Response(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), {
			status: 500,
		});
	}
}
