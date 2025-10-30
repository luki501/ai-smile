import { z } from 'zod';
import { Constants } from '../../db/database.types';

export const getSymptomsSchema = z.object({
	offset: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	occurred_at_gte: z.string().datetime().optional(),
	occurred_at_lte: z.string().datetime().optional(),
	symptom_type: z.enum(Constants.public.Enums.symptom_type_enum).optional(),
	body_part: z.enum(Constants.public.Enums.body_part_enum).optional(),
});

export type GetSymptomsQuery = z.infer<typeof getSymptomsSchema>;

export const createSymptomSchema = z.object({
	occurred_at: z.string().datetime(),
	symptom_type: z.enum(Constants.public.Enums.symptom_type_enum),
	body_part: z.enum(Constants.public.Enums.body_part_enum),
	notes: z.string().optional(),
});

export const updateSymptomCommandSchema = z
	.object({
		occurred_at: z.string().datetime({ offset: true }).optional(),
		symptom_type: z.enum(['tingle', 'numbness', 'cramps', 'fuckedup']).optional(),
		body_part: z.enum(['head', 'neck', 'back', 'arms', 'hands', 'legs']).optional(),
		notes: z.string().nullable().optional(),
	})
	.refine(
		(data) => Object.keys(data).length > 0,
		'At least one field must be provided for update'
	);

export const updateSymptomSchema = createSymptomSchema.partial();