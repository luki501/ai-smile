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
import { cn } from '@/lib/utils';
import type { CreateSymptomCommand } from '@/types';
import { useSymptoms } from '../hooks/useSymptoms';

export function SymptomForm() {
	const { createSymptom, isLoading } = useSymptoms();
	const [error, setError] = useState<string | null>(null);
	const [occurredAt, setOccurredAt] = useState<Date | undefined>(new Date());

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const formData = new FormData(event.currentTarget);
		const symptomData = Object.fromEntries(
			formData.entries(),
		) as CreateSymptomCommand;

		if (typeof symptomData.symptom_type === 'string') {
			symptomData.symptom_type = symptomData.symptom_type.toLowerCase() as any;
		}
		if (typeof symptomData.body_part === 'string') {
			symptomData.body_part = symptomData.body_part.toLowerCase() as any;
		}

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
			await createSymptom(symptomData);
			event.currentTarget.reset();
			setOccurredAt(new Date());
		} catch (e) {
			setError((e as Error).message);
		}
	};

	return (
		<Card className="w-full max-w-lg">
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle>Log a New Symptom</CardTitle>
					<CardDescription>
						Fill out the form below to add a new symptom entry.
					</CardDescription>
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
						<Select name="symptom_type">
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
						<Select name="body_part">
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
						/>
					</div>
					{error && <p className="text-sm text-red-500">{error}</p>}
				</CardContent>
				<CardFooter>
					<Button type="submit" className="ml-auto" disabled={isLoading}>
						{isLoading ? 'Saving...' : 'Save Symptom'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
