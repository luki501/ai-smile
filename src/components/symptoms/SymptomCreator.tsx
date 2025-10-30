'use client';

import { useSymptoms } from '../hooks/useSymptoms';
import { SymptomForm } from './SymptomForm';
import type { CreateSymptomCommand } from '@/types';
import { useState } from 'react';

export default function SymptomCreator() {
	const { createSymptom, isLoading } = useSymptoms();
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleSubmit = async (data: CreateSymptomCommand) => {
		setSuccessMessage(null);
		try {
			await createSymptom(data);
			setSuccessMessage('Symptom logged successfully!');
			// Optionally clear the message after a few seconds
			setTimeout(() => setSuccessMessage(null), 5000);
		} catch (error) {
			// The error is already handled and displayed within SymptomForm,
			// but you could add additional logging or handling here if needed.
			console.error('Failed to create symptom:', error);
			// Re-throw the error to let SymptomForm handle its display
			throw error;
		}
	};

	return (
		<>
			<SymptomForm
				onSubmit={handleSubmit}
				isLoading={isLoading}
				title="Log a New Symptom"
				description="Fill out the form below to add a new symptom entry."
				submitButtonText="Save Symptom"
			/>
			{successMessage && (
				<p className="mt-4 text-center text-sm text-green-500">{successMessage}</p>
			)}
		</>
	);
}
