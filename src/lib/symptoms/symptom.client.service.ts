import type { UpdateSymptomCommand } from '@/types';

export const updateSymptom = async (
	symptomId: number,
	formData: UpdateSymptomCommand,
): Promise<Response> => {
	const response = await fetch(`/api/symptoms/${symptomId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to update symptom.');
	}

	return response;
};

export const deleteSymptom = async (symptomId: number): Promise<Response> => {
	const response = await fetch(`/api/symptoms/${symptomId}`, {
		method: 'DELETE',
	});

	if (!response.ok && response.status !== 204) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to delete symptom.');
	}

	return response;
};
