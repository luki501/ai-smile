import type { APIRoute } from 'astro';
import { createReportSchema } from '@/lib/reports/report.validators';
import { generateReport } from '@/lib/services/report.service';

export const prerender = false;

/**
 * POST /api/reports
 * 
 * Generates a new AI-powered symptom analysis report for the authenticated user
 * based on the specified time period.
 * 
 * Request Body:
 * {
 *   "period_type": "week" | "month" | "quarter"
 * }
 * 
 * Response (201 Created):
 * {
 *   "id": number,
 *   "user_id": string,
 *   "created_at": string,
 *   "content": string,
 *   "period_start": string,
 *   "period_end": string,
 *   "period_type": string
 * }
 * 
 * Error Responses:
 * - 400: Bad Request - Invalid JSON
 * - 401: Unauthorized - Missing or invalid JWT
 * - 422: Validation Error - Invalid period_type
 * - 424: Insufficient Data - Not enough symptoms
 * - 500: Internal Server Error - Unexpected error
 * - 503: Service Unavailable - AI service unavailable
 * - 504: Request Timeout - AI request timed out
 */
export const POST: APIRoute = async (context) => {
	// 1. Check authentication - early return if not authenticated
	const user = context.locals.user;
	if (!user) {
		return new Response(
			JSON.stringify({
				error: 'Unauthorized',
				message: 'Authentication required',
			}),
			{ status: 401, headers: { 'Content-Type': 'application/json' } },
		);
	}

	// 2. Parse request body - early return if invalid JSON
	let body;
	try {
		body = await context.request.json();
	} catch {
		return new Response(
			JSON.stringify({
				error: 'Bad Request',
				message: 'Invalid JSON in request body',
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	// 3. Validate request body - early return if validation fails
	const validation = createReportSchema.safeParse(body);
	if (!validation.success) {
		const errorMessage =
			validation.error.errors[0]?.message ||
			'Invalid period_type. Must be one of: week, month, quarter';
		return new Response(
			JSON.stringify({
				error: 'Validation Error',
				message: errorMessage,
			}),
			{ status: 422, headers: { 'Content-Type': 'application/json' } },
		);
	}

	const { period_type } = validation.data;
	const supabase = context.locals.supabase;

	// 4. Generate report with comprehensive error handling
	try {
		const report = await generateReport(supabase, user.id, period_type);

		// Success - return the generated report
		return new Response(JSON.stringify(report), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Report generation error:', error);

		// Handle specific error types with appropriate HTTP status codes
		if (error instanceof Error) {
			// Insufficient data - user needs to log more symptoms
			if (error.message === 'INSUFFICIENT_DATA') {
				return new Response(
					JSON.stringify({
						error: 'Insufficient Data',
						message:
							'Not enough symptom data to generate a meaningful report. Please log more symptoms and try again.',
					}),
					{ status: 424, headers: { 'Content-Type': 'application/json' } },
				);
			}

			// AI service temporarily unavailable
			if (error.message === 'SERVICE_UNAVAILABLE') {
				return new Response(
					JSON.stringify({
						error: 'Service Unavailable',
						message:
							'AI service is temporarily unavailable. Please try again later.',
					}),
					{ status: 503, headers: { 'Content-Type': 'application/json' } },
				);
			}

			// Request timeout
			if (error.message === 'REQUEST_TIMEOUT') {
				return new Response(
					JSON.stringify({
						error: 'Request Timeout',
						message: 'Report generation took too long. Please try again.',
					}),
					{ status: 504, headers: { 'Content-Type': 'application/json' } },
				);
			}
		}

		// Generic server error for all other cases
		return new Response(
			JSON.stringify({
				error: 'Internal Server Error',
				message: 'Failed to generate report',
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } },
		);
	}
};

