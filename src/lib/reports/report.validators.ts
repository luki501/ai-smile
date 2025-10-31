import { z } from 'zod';
import type { CreateReportCommand } from '@/types';

/**
 * Zod schema for validating period type values.
 * Ensures only 'week', 'month', or 'quarter' are accepted.
 */
export const periodTypeSchema = z.enum(['week', 'month', 'quarter'], {
	errorMap: () => ({
		message: 'Invalid period_type. Must be one of: week, month, quarter',
	}),
});

/**
 * Zod schema for validating the CreateReportCommand request body.
 * Validates the POST /api/reports request payload.
 */
export const createReportSchema = z.object({
	period_type: periodTypeSchema,
}) satisfies z.ZodType<CreateReportCommand>;

/**
 * Zod schema for validating query parameters for GET /api/reports endpoint.
 * Ensures type safety and provides default values for optional parameters.
 */
export const ReportQueryParamsSchema = z.object({
	/**
	 * Number of records to skip (for pagination).
	 * Must be a non-negative integer. Defaults to 0.
	 */
	offset: z.coerce.number().int().min(0).default(0),
	
	/**
	 * Maximum number of records to return (for pagination).
	 * Must be between 1 and 100. Defaults to 10.
	 */
	limit: z.coerce.number().int().min(1).max(100).default(10),
	
	/**
	 * Optional filter for period type.
	 * When provided, only reports matching this period type are returned.
	 */
	period_type: periodTypeSchema.optional(),
});

/**
 * TypeScript type inferred from ReportQueryParamsSchema.
 * Represents validated and type-safe query parameters.
 */
export type ReportQueryParams = z.infer<typeof ReportQueryParamsSchema>;

/**
 * Zod schema for validating report ID URL parameter.
 * Coerces string from URL to number and validates as positive integer.
 */
export const reportIdSchema = z.coerce.number().int().positive({
	message: 'Report ID must be a positive integer',
});