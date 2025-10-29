import { useState, useEffect, useCallback } from 'react';
import type { SymptomDto } from '../../types';
import { getSymptomsSchema } from '../../lib/symptoms/symptoms.validators';
import { z } from 'zod';

type Filters = z.infer<typeof getSymptomsSchema>;

interface UseSymptomsResult {
	symptoms: SymptomDto[];
	count: number;
	loading: boolean;
	error: Error | null;
	filters: Filters;
	setFilters: (filters: Filters | ((prevFilters: Filters) => Filters)) => void;
}

const useSymptoms = (initialFilters: Partial<Filters> = {}): UseSymptomsResult => {
	const [symptoms, setSymptoms] = useState<SymptomDto[]>([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [filters, setFilters] = useState<Filters>({
		offset: 0,
		limit: 20,
		...initialFilters,
	});

	const fetchSymptoms = useCallback(async () => {
		setLoading(true);
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
				throw new Error(`Failed to fetch symptoms: ${response.statusText}`);
			}
			
			const result = await response.json();
			
			setSymptoms(result.data || []);
			setCount(result.count || 0);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('An unknown error occurred'));
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchSymptoms();
	}, [fetchSymptoms]);

	return { symptoms, count, loading, error, filters, setFilters };
};

export default useSymptoms;

