'use client';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
	BODY_PARTS,
	SYMPTOM_TYPES,
} from '@/lib/symptoms/symptom.constants';
import { cn, capitalize } from '@/lib/utils';
import type { CreateSymptomCommand, SymptomDto } from '@/types';

interface SymptomFormProps {
	initialData?: SymptomDto | null;
	onSubmit: (data: CreateSymptomCommand) => Promise<void>;
	isLoading: boolean;
	submitButtonText?: string;
	title: string;
	description: string;
}

export function SymptomForm({
	initialData,
	onSubmit,
	isLoading,
	submitButtonText = 'Save',
	title,
	description,
}: SymptomFormProps) {
	const [error, setError] = useState<string | null>(null);

	const initialOccurredAt = initialData?.occurred_at
		? new Date(initialData.occurred_at)
		: new Date();
	const [occurredAt, setOccurredAt] = useState<Date | undefined>(
		initialOccurredAt,
	);
	const [symptomType, setSymptomType] = useState(
		initialData?.symptom_type ? capitalize(initialData.symptom_type) : ''
	);
	const [bodyPart, setBodyPart] = useState(
		initialData?.body_part ? capitalize(initialData.body_part) : ''
	);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const formData = new FormData(event.currentTarget);
		// notes and occurred_at are handled separately or via state
		const notes = formData.get('notes') as string;

		const symptomData: CreateSymptomCommand = {
			symptom_type: symptomType.toLowerCase() as any,
			body_part: bodyPart.toLowerCase() as any,
			notes: notes,
			occurred_at: occurredAt ? occurredAt.toISOString() : new Date().toISOString(),
		};

		if (!occurredAt) {
			setError('Date of occurrence is required.');
			return;
		}
		symptomData.occurred_at = occurredAt.toISOString();

		if (!symptomData.symptom_type || !symptomData.body_part) {
			setError('Symptom type and body part are required.');
			return;
		}

		try {
			await onSubmit(symptomData);
			if (!initialData) {
				event.currentTarget.reset();
				setOccurredAt(new Date());
				setSymptomType('');
				setBodyPart('');
			}
		} catch (e) {
			setError((e as Error).message);
		}
	};

	return (
		<Card className="w-full max-w-lg">
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="occurred_at">Date of Occurrence</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'outline'}
									className={cn(
										'w-full justify-start text-left font-normal',
										!occurredAt && 'text-muted-foreground',
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{occurredAt ? (
										format(occurredAt, 'PPP')
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={occurredAt}
									onSelect={setOccurredAt}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="symptom_type">Symptom Type</Label>
						<Select
							value={symptomType}
							onValueChange={setSymptomType}
						>
							<SelectTrigger id="symptom_type">
								<SelectValue placeholder="Select a symptom type" />
							</SelectTrigger>
							<SelectContent>
								{SYMPTOM_TYPES.map((type) => (
									<SelectItem key={type} value={type}>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="body_part">Body Part</Label>
						<Select
							value={bodyPart}
							onValueChange={setBodyPart}
						>
							<SelectTrigger id="body_part">
								<SelectValue placeholder="Select a body part" />
							</SelectTrigger>
							<SelectContent>
								{BODY_PARTS.map((part) => (
									<SelectItem key={part} value={part}>
										{part}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							name="notes"
							placeholder="Enter any additional notes..."
							className="min-h-[100px]"
							defaultValue={initialData?.notes ?? ''}
						/>
					</div>
					{error && <p className="text-sm text-red-500">{error}</p>}
				</CardContent>
				<CardFooter>
					<Button type="submit" className="ml-auto" disabled={isLoading}>
						{isLoading ? 'Saving...' : submitButtonText}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
