import type { APIRoute } from 'astro';
import { z } from 'zod';
import { SymptomService } from '@/lib/symptoms/symptoms.service';
import { getSymptomsSchema } from '@/lib/symptoms/symptoms.validators';
import type { CreateSymptomCommand } from '@/types';

export const prerender = false;

const createSymptomSchema: z.ZodType<Omit<CreateSymptomCommand, 'occurred_at'> & { occurred_at: string }> = z.object({
	occurred_at: z.string().datetime(),
	symptom_type: z.enum(['tingle', 'numbness', 'cramps', 'fuckedup']),
	body_part: z.enum(['head', 'neck', 'back', 'arms', 'hands', 'legs']),
	notes: z.string().nullable().optional(),
});

export const GET: APIRoute = async ({ request, locals }) => {
	const { session, supabase } = locals;

	if (!session?.user) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const url = new URL(request.url);
	const queryParams = Object.fromEntries(url.searchParams.entries());

	const validationResult = getSymptomsSchema.safeParse(queryParams);

	if (!validationResult.success) {
		return new Response(
			JSON.stringify({
				message: 'Bad Request',
				errors: validationResult.error.flatten(),
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	try {
		const symptomService = new SymptomService(supabase);
		const { data, count } = await symptomService.getSymptoms(
			session.user.id,
			validationResult.data,
		);

		return new Response(JSON.stringify({ data, count }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Failed to process request:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred.';
		return new Response(
			JSON.stringify({
				message: 'Internal Server Error',
				error: errorMessage,
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } },
		);
	}
};

export const POST: APIRoute = async ({ request, locals }) => {
	const { session, supabase } = locals;

	if (!session?.user) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	let requestBody;
	try {
		requestBody = await request.json();
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Bad Request: Invalid JSON' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const validationResult = createSymptomSchema.safeParse(requestBody);

	if (!validationResult.success) {
		return new Response(
			JSON.stringify({
				error: 'Validation failed',
				details: validationResult.error.flatten(),
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	try {
		const symptomService = new SymptomService(supabase);
		const newSymptom = await symptomService.createSymptom(
			session.user.id,
			validationResult.data,
		);
		return new Response(JSON.stringify(newSymptom), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Failed to create symptom:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred.';
		return new Response(
			JSON.stringify({
				message: 'Internal Server Error',
				error: errorMessage,
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } },
		);
	}
};
