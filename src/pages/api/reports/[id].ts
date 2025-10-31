import type { APIRoute } from 'astro';
import { reportIdSchema } from '@/lib/reports/report.validators';
import { getReportById, checkReportExists } from '@/lib/services/report.service';

export const prerender = false;

/**
 * GET /api/reports/{id}
 * 
 * Retrieves a specific report by ID for the authenticated user.
 * 
 * URL Parameters:
 * - id (number, required): The ID of the report to retrieve
 * 
 * Response (200 OK):
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
 * - 400: Bad Request - Invalid ID format
 * - 401: Unauthorized - Missing or invalid JWT
 * - 403: Forbidden - Report belongs to another user
 * - 404: Not Found - Report does not exist
 * - 500: Internal Server Error - Unexpected error
 */
export const GET: APIRoute = async (context) => {
	// 1. Validate ID parameter - early return if invalid
	const idValidation = reportIdSchema.safeParse(context.params.id);
	
	if (!idValidation.success) {
		const errorMessage = idValidation.error.errors[0]?.message || 
			'Invalid report ID format';
		
		return new Response(
			JSON.stringify({
				error: 'Bad Request',
				message: errorMessage,
				details: idValidation.error.flatten(),
			}),
			{ 
				status: 400, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	}
	
	const reportId = idValidation.data;
	
	// 2. Check authentication - early return if not authenticated
	const user = context.locals.user;
	if (!user) {
		return new Response(
			JSON.stringify({
				error: 'Unauthorized',
				message: 'Authentication required',
			}),
			{ 
				status: 401, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	}
	
	const supabase = context.locals.supabase;
	
	// 3. Retrieve report from database with error handling
	try {
		const report = await getReportById(supabase, reportId, user.id);
		
		// 4. Handle not found case - distinguish between 403 and 404
		if (!report) {
			// Check if report exists at all (to differentiate 403 from 404)
			const reportExists = await checkReportExists(supabase, reportId);
			
			if (reportExists) {
				// Report exists but belongs to another user
				return new Response(
					JSON.stringify({
						error: 'Forbidden',
						message: 'Access denied. You do not have permission to view this report.',
					}),
					{ 
						status: 403, 
						headers: { 'Content-Type': 'application/json' } 
					}
				);
			} else {
				// Report does not exist at all
				return new Response(
					JSON.stringify({
						error: 'Not Found',
						message: 'Report not found',
					}),
					{ 
						status: 404, 
						headers: { 'Content-Type': 'application/json' } 
					}
				);
			}
		}
		
		// 5. Happy path - return the report
		return new Response(
			JSON.stringify(report),
			{ 
				status: 200, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
		
	} catch (error) {
		// 6. Handle unexpected errors
		console.error('Failed to retrieve report:', {
			reportId,
			userId: user.id,
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString(),
		});
		
		return new Response(
			JSON.stringify({
				error: 'Internal Server Error',
				message: 'Failed to retrieve report',
			}),
			{ 
				status: 500, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	}
};

