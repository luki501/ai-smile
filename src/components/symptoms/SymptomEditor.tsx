'use client';

import { useState } from 'react';
import type { SymptomDetailsDto, UpdateSymptomCommand } from '@/types';
import { SymptomForm } from './SymptomForm';

interface SymptomEditorProps {
	symptom: SymptomDetailsDto;
}

export default function SymptomEditor({ symptom }: SymptomEditorProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleSubmit = async (formData: UpdateSymptomCommand) => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const response = await fetch(`/api/symptoms/${symptom.id}`, {
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
			setSuccessMessage('Symptom updated successfully! Redirecting...');
			setTimeout(() => {
				window.location.href = '/';
			}, 2000);
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<SymptomForm
				initialData={symptom}
				onSubmit={handleSubmit}
				isLoading={isLoading}
				title="Edit Symptom"
				description="Update the details of your symptom entry below."
				submitButtonText="Update Symptom"
			/>
			{error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
			{successMessage && (
				<p className="mt-4 text-center text-sm text-green-500">{successMessage}</p>
			)}
		</>
	);
}
