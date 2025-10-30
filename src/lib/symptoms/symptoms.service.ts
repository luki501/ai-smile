import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type {
	CreateSymptomCommand,
	SymptomDetailsDto,
	SymptomDto,
	UpdateSymptomCommand,
} from '@/types';
import type { getSymptomsSchema } from './symptoms.validators';
import type { z } from 'zod';

type GetSymptomsFilters = z.infer<typeof getSymptomsSchema>;

export class SymptomService {
	constructor(private readonly supabase: SupabaseClient<Database>) {}

	async createSymptom(
		userId: string,
		symptomData: CreateSymptomCommand
	): Promise<SymptomDetailsDto> {
		const { data, error } = await this.supabase
			.from('symptoms')
			.insert({ ...symptomData, user_id: userId })
			.select()
			.single();

		if (error) {
			console.error('Error creating symptom:', error);
			throw new Error('Could not create the symptom. Please try again later.');
		}

		return data;
	}

	async getSymptoms(
		userId: string,
		filters: GetSymptomsFilters,
	): Promise<{ data: SymptomDto[] | null; count: number | null }> {
		const {
			limit,
			offset,
			body_part,
			occurred_at_gte,
			occurred_at_lte,
			symptom_type,
		} = filters;

		let query = this.supabase
			.from('symptoms')
			.select('*', { count: 'exact' })
			.eq('user_id', userId);

		if (occurred_at_gte) {
			query = query.gte('occurred_at', occurred_at_gte);
		}

		if (occurred_at_lte) {
			query = query.lte('occurred_at', occurred_at_lte);
		}

		if (symptom_type) {
			query = query.eq('symptom_type', symptom_type);
		}

		if (body_part) {
			query = query.eq('body_part', body_part);
		}

		query = query.range(offset, offset + limit - 1).order('occurred_at', { ascending: false });

		const { data, error, count } = await query;

		if (error) {
			// In a real application, you'd want to log this error.
			console.error('Error fetching symptoms:', error);
			throw new Error('Could not fetch symptoms. Please try again later.');
		}

		return { data, count };
	}

	async getSymptomById(
		symptomId: number,
		userId: string
	): Promise<SymptomDetailsDto | null> {
		const { data, error } = await this.supabase
			.from('symptoms')
			.select('*')
			.eq('id', symptomId)
			.eq('user_id', userId)
			.single();

		if (error) {
			console.error('Error fetching single symptom:', error);
			if (error.code === 'PGRST116') {
				return null;
			}
			throw new Error('Could not fetch the symptom.');
		}

		return data;
	}

	async updateSymptom(
		symptomId: number,
		userId: string,
		symptomData: UpdateSymptomCommand
	): Promise<SymptomDetailsDto | null> {
		const { data, error } = await this.supabase
			.from('symptoms')
			.update(symptomData)
			.eq('id', symptomId)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) {
			// In a real application, you'd want to log this error.
			console.error('Error updating symptom:', error);
			// Consider more specific error handling based on Supabase error codes
			if (error.code === 'PGRST116') {
				// This code means exactly one row was expected, but 0 or more were found.
				// In our case, it means the symptom was not found for the given user.
				return null;
			}
			throw new Error('Could not update the symptom. Please try again later.');
		}

		return data;
	}

	async deleteSymptom(symptomId: number, userId: string): Promise<void> {
		const { error, count } = await this.supabase
			.from('symptoms')
			.delete({ count: 'exact' })
			.eq('id', symptomId)
			.eq('user_id', userId);

		if (error) {
			console.error('Error deleting symptom:', error);
			throw new Error('Could not delete the symptom. Please try again later.');
		}

		if (count === 0) {
			throw new Error('Symptom not found or user does not have permission to delete it.');
		}
	}
}
