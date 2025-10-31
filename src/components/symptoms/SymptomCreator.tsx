'use client';

import { useSymptoms } from '../hooks/useSymptoms';
import { SymptomForm } from './SymptomForm';
import type { CreateSymptomCommand } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SymptomCreator() {
	const { createSymptom, isLoading } = useSymptoms();

	const handleSubmit = async (data: CreateSymptomCommand) => {
		try {
			await createSymptom(data);
			toast.success('Symptom logged successfully!');
			window.location.href = '/';
		} catch (error) {
			toast.error((error as Error).message);
			throw error;
		}
	};

	return (
		<SymptomForm
			onSubmit={handleSubmit}
			isLoading={isLoading}
			title="Log a New Symptom"
			description="Fill out the form below to add a new symptom entry."
			submitButtonText="Save Symptom"
		/>
	);
}
