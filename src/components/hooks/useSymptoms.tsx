import { useState, useEffect, useCallback } from 'react';
import type { SymptomDto, CreateSymptomCommand, UpdateSymptomCommand } from '@/types';
import { getSymptomsSchema } from '@/lib/symptoms/symptoms.validators';
import { z } from 'zod';

type Filters = z.infer<typeof getSymptomsSchema>;

export type SymptomsHook = {
	symptoms: SymptomDto[];
	count: number;
	isLoading: boolean;
	error: Error | null;
	filters: Filters;
	setFilters: (filters: Filters | ((prevFilters: Filters) => Filters)) => void;
	createSymptom: (symptom: CreateSymptomCommand) => Promise<void>;
	updateSymptom: (id: string, symptom: UpdateSymptomCommand) => Promise<void>;
	deleteSymptom: (id: string) => Promise<void>;
	isDeleting: boolean;
};

export function useSymptoms(initialFilters: Partial<Filters> = {}): SymptomsHook {
	const [symptoms, setSymptoms] = useState<SymptomDto[]>([]);
	const [count, setCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [filters, setFilters] = useState<Filters>({
		offset: 0,
		limit: 20,
		...initialFilters,
	});

	const fetchSymptoms = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const validatedFilters = getSymptomsSchema.parse(filters);
			const params = new URLSearchParams(
				Object.entries(validatedFilters).reduce(
					(acc, [key, value]) => {
						if (value !== undefined && value !== null) {
							acc[key] = String(value);
						}
						return acc;
					},
					{} as Record<string, string>,
				),
			);
			const response = await fetch(`/api/symptoms?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch symptoms');
			}
			const result = await response.json();
			setSymptoms(result.data || []);
			setCount(result.count || 0);
		} catch (e) {
			setError(e as Error);
		} finally {
			setIsLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchSymptoms();
	}, [fetchSymptoms]);

	const createSymptom = useCallback(
		async (symptomData: CreateSymptomCommand) => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch('/api/symptoms', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(symptomData),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to create symptom');
				}

				// After creating, refetch the list to see the new symptom
				await fetchSymptoms();
			} catch (e) {
				setError(e as Error);
				throw e;
			} finally {
				setIsLoading(false);
			}
		},
		[fetchSymptoms],
	);

	const updateSymptom = useCallback(
		async (id: string, symptomData: UpdateSymptomCommand) => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/symptoms/${id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(symptomData),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to update symptom');
				}

				await fetchSymptoms();
			} catch (e) {
				setError(e as Error);
				throw e;
			} finally {
				setIsLoading(false);
			}
		},
		[fetchSymptoms]
	);

	const deleteSymptom = useCallback(
		async (id: string) => {
			setIsDeleting(true);
			setError(null);
			try {
				const response = await fetch(`/api/symptoms/${id}`, {
					method: 'DELETE',
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to delete symptom');
				}

				await fetchSymptoms();
			} catch (e) {
				setError(e as Error);
				throw e;
			} finally {
				setIsDeleting(false);
			}
		},
		[fetchSymptoms]
	);

	return {
		symptoms,
		count,
		isLoading,
		error,
		filters,
		setFilters,
		createSymptom,
		updateSymptom,
		deleteSymptom,
		isDeleting,
	};
}

