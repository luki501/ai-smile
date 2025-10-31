import type { APIRoute } from 'astro';
import { createReportSchema, ReportQueryParamsSchema } from '@/lib/reports/report.validators';
import { generateReport, fetchReports } from '@/lib/services/report.service';
import type { ReportListResponseDto } from '@/types';

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

/**
 * GET /api/reports
 * 
 * Retrieves a paginated list of reports for the authenticated user.
 * Reports are sorted by creation date (newest first).
 * 
 * Query Parameters:
 * - offset (optional, default: 0): Number of records to skip
 * - limit (optional, default: 10, max: 100): Maximum number of records to return
 * - period_type (optional): Filter by period type ('week', 'month', 'quarter')
 * 
 * Response (200 OK):
 * {
 *   "data": [ {...report objects...} ],
 *   "count": <total number of reports>
 * }
 * 
 * Error Responses:
 * - 400: Bad Request - Invalid query parameters
 * - 401: Unauthorized - Missing or invalid JWT
 * - 500: Internal Server Error - Server error
 */
export const GET: APIRoute = async (context) => {
	// 1. Check authentication - early return if not authenticated
	const session = await context.locals.supabase.auth.getSession();
	
	if (!session.data.session) {
		return new Response(
			JSON.stringify({ error: 'Unauthorized' }),
			{ status: 401, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const userId = session.data.session.user.id;
	const url = context.url;

	// 2. Parse and validate query parameters - early return if validation fails
	const validationResult = ReportQueryParamsSchema.safeParse({
		offset: url.searchParams.get('offset') ?? undefined,
		limit: url.searchParams.get('limit') ?? undefined,
		period_type: url.searchParams.get('period_type') ?? undefined,
	});

	if (!validationResult.success) {
		console.warn('Invalid query parameters:', validationResult.error.format());
		return new Response(
			JSON.stringify({
				error: 'Invalid query parameters',
				details: validationResult.error.format(),
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const { offset, limit, period_type } = validationResult.data;

	// 3. Fetch reports from database with error handling
	try {
		const result = await fetchReports(
			context.locals.supabase,
			userId,
			offset,
			limit,
			period_type,
		);

		// 4. Format response according to ReportListResponseDto
		const response: ReportListResponseDto = {
			data: result.reports,
			count: result.totalCount,
		};

		return new Response(
			JSON.stringify(response),
			{ 
				status: 200, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	} catch (error) {
		console.error('Failed to fetch reports:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch reports' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

