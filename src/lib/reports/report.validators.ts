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

