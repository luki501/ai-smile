import type { SupabaseClient } from '@/db/supabase.client';
import type { PeriodType, Report, Symptom } from '@/types';

/**
 * Interface representing the date ranges for current and previous periods.
 */
interface PeriodDates {
	current_start: Date;
	current_end: Date;
	previous_start: Date;
	previous_end: Date;
}

/**
 * Interface for AI service response containing generated content.
 */
interface AIServiceResponse {
	content: string;
}

/**
 * Minimum number of symptoms required to generate a meaningful report.
 */
const MIN_SYMPTOMS_REQUIRED = 3;

/**
 * Maximum number of symptoms to include in the AI prompt to avoid token limits.
 */
const MAX_SYMPTOMS_IN_PROMPT = 100;

/**
 * Timeout for AI service requests in milliseconds (30 seconds).
 */
const AI_REQUEST_TIMEOUT = 30000;

/**
 * Calculates the start and end dates for the current and previous periods
 * based on the specified period type.
 *
 * @param periodType - The type of period: 'week', 'month', or 'quarter'
 * @returns Object containing current and previous period date ranges
 *
 * @example
 * const dates = calculatePeriodDates('month');
 * // Returns dates for current month and previous month
 */
export function calculatePeriodDates(periodType: PeriodType): PeriodDates {
	const now = new Date();
	const currentEnd = now;

	let daysBack: number;
	switch (periodType) {
		case 'week':
			daysBack = 7;
			break;
		case 'month':
			daysBack = 30;
			break;
		case 'quarter':
			daysBack = 90;
			break;
	}

	const currentStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
	const previousEnd = new Date(currentStart.getTime() - 1);
	const previousStart = new Date(
		previousEnd.getTime() - daysBack * 24 * 60 * 60 * 1000,
	);

	return {
		current_start: currentStart,
		current_end: currentEnd,
		previous_start: previousStart,
		previous_end: previousEnd,
	};
}

/**
 * Fetches symptoms for a specific user within a given date range.
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the user whose symptoms to fetch
 * @param startDate - Start date of the period
 * @param endDate - End date of the period
 * @returns Array of symptoms within the specified period
 * @throws Error if the database query fails
 */
export async function fetchSymptomsForPeriod(
	supabase: SupabaseClient,
	userId: string,
	startDate: Date,
	endDate: Date,
): Promise<Symptom[]> {
	const { data, error } = await supabase
		.from('symptoms')
		.select('*')
		.eq('user_id', userId)
		.gte('occurred_at', startDate.toISOString())
		.lte('occurred_at', endDate.toISOString())
		.order('occurred_at', { ascending: false });

	if (error) {
		console.error('Failed to fetch symptoms:', error);
		throw new Error(`Failed to fetch symptoms: ${error.message}`);
	}

	return data || [];
}

/**
 * Constructs a detailed prompt for the AI service to generate a symptom analysis report.
 * The prompt includes structured symptom data for both current and previous periods.
 *
 * @param periodType - The type of period being analyzed
 * @param currentSymptoms - Symptoms from the current period
 * @param previousSymptoms - Symptoms from the previous period
 * @param dates - Period date ranges
 * @returns Formatted prompt string for the AI service
 */
export function buildReportPrompt(
	periodType: PeriodType,
	currentSymptoms: Symptom[],
	previousSymptoms: Symptom[],
	dates: PeriodDates,
): string {
	const formatSymptoms = (symptoms: Symptom[]) => {
		return symptoms
			.map((s) => {
				const notes = s.notes
					? ` (Notatki: ${s.notes.slice(0, 200)})`
					: '';
				return `- ${s.occurred_at}: ${s.symptom_type} w ${s.body_part}${notes}`;
			})
			.join('\n');
	};

	const currentSymptomsForPrompt = currentSymptoms.slice(
		0,
		MAX_SYMPTOMS_IN_PROMPT,
	);
	const previousSymptomsForPrompt = previousSymptoms.slice(
		0,
		MAX_SYMPTOMS_IN_PROMPT,
	);

	const prompt = `Jesteś analitykiem danych medycznych specjalizującym się w analizie objawów stwardnienia rozsianego (SM).

Przeanalizuj poniższe dane objawów i wygeneruj kompleksowy raport w języku polskim.

**Okres bieżący (${periodType})**: ${dates.current_start.toISOString()} do ${dates.current_end.toISOString()}
Całkowita liczba zapisanych objawów: ${currentSymptoms.length}

Objawy:
${formatSymptoms(currentSymptomsForPrompt)}
${currentSymptoms.length > MAX_SYMPTOMS_IN_PROMPT ? `\n(Pokazano ${MAX_SYMPTOMS_IN_PROMPT} z ${currentSymptoms.length} objawów)` : ''}

**Okres poprzedni (${periodType})**: ${dates.previous_start.toISOString()} do ${dates.previous_end.toISOString()}
Całkowita liczba zapisanych objawów: ${previousSymptoms.length}

Objawy:
${formatSymptoms(previousSymptomsForPrompt)}
${previousSymptoms.length > MAX_SYMPTOMS_IN_PROMPT ? `\n(Pokazano ${MAX_SYMPTOMS_IN_PROMPT} z ${previousSymptoms.length} objawów)` : ''}

Wygeneruj raport w języku polskim zawierający:
1. **Podsumowanie objawów z bieżącego okresu** - częstotliwość, typy, lokalizacje, wzorce czasowe
2. **Porównanie z okresem poprzednim** - zwiększenie/zmniejszenie liczby objawów, zmiany w typach i lokalizacjach
3. **Analiza trendów** - czy objawy się nasilają, stabilizują, czy zmniejszają; czy są wzorce sezonowe lub czasowe
4. **Nowe objawy** - objawy, które nie występowały w poprzednim okresie
5. **Statystyki liczbowe** - konkretne liczby dla obu okresów, procentowe zmiany

Formatuj raport używając składni Markdown z odpowiednimi sekcjami. Używaj jasnego, przyjaznego dla pacjenta języka, ale zachowaj profesjonalny ton medyczny. Bądź empatyczny i wspierający w swoim tonie.`;

	return prompt;
}

/**
 * Generates an AI-powered symptom analysis report by calling the OpenRouter API.
 *
 * @param prompt - The formatted prompt containing symptom data and analysis instructions
 * @returns Object containing the generated report content
 * @throws Error with specific message codes for different failure scenarios:
 *   - 'SERVICE_UNAVAILABLE' - AI service is temporarily unavailable (503/429)
 *   - 'REQUEST_TIMEOUT' - Request exceeded timeout limit
 *   - Generic error message for other failures
 */
export async function generateAIReport(
	prompt: string,
): Promise<AIServiceResponse> {
	const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

	if (!OPENROUTER_API_KEY) {
		console.error('OPENROUTER_API_KEY is not configured');
		throw new Error('OPENROUTER_API_KEY is not configured');
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT);

	try {
		const response = await fetch(
			'https://openrouter.ai/api/v1/chat/completions',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${OPENROUTER_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'openai/gpt-4o-mini',
					messages: [
						{
							role: 'system',
							content:
								'Jesteś analitykiem danych medycznych specjalizującym się w analizie objawów stwardnienia rozsianego. Tworzysz jasne, empatyczne i informacyjne raporty w języku polskim dla pacjentów.',
						},
						{
							role: 'user',
							content: prompt,
						},
					],
				}),
				signal: controller.signal,
			},
		);

		clearTimeout(timeoutId);

		if (!response.ok) {
			if (response.status === 503 || response.status === 429) {
				console.error('OpenRouter service unavailable:', response.status);
				throw new Error('SERVICE_UNAVAILABLE');
			}
			console.error('OpenRouter API error:', response.status);
			throw new Error(`OpenRouter API error: ${response.status}`);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (!content || content.trim().length === 0) {
			console.error('Empty response from AI service');
			throw new Error('Empty response from AI service');
		}

		return { content };
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				console.error('AI request timeout');
				throw new Error('REQUEST_TIMEOUT');
			}
			throw error;
		}
		throw new Error('Unknown error during AI report generation');
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * Saves a generated report to the database.
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the user for whom the report is being created
 * @param content - The generated report content (markdown format)
 * @param periodType - The type of period analyzed
 * @param dates - Period date ranges
 * @returns The saved report record
 * @throws Error if the database insert operation fails
 */
export async function saveReport(
	supabase: SupabaseClient,
	userId: string,
	content: string,
	periodType: PeriodType,
	dates: PeriodDates,
): Promise<Report> {
	const { data, error } = await supabase
		.from('reports')
		.insert({
			user_id: userId,
			content,
			period_type: periodType,
			period_start: dates.current_start.toISOString(),
			period_end: dates.current_end.toISOString(),
		})
		.select()
		.single();

	if (error) {
		console.error('Failed to save report to database:', error);
		throw new Error(`Failed to save report: ${error.message}`);
	}

	return data;
}

/**
 * Main service function that orchestrates the entire report generation process.
 * This function:
 * 1. Calculates period dates
 * 2. Fetches symptoms for both periods
 * 3. Validates sufficient data exists
 * 4. Generates AI report
 * 5. Saves report to database
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param periodType - The type of period to analyze: 'week', 'month', or 'quarter'
 * @returns The generated and saved report
 * @throws Error with specific message codes:
 *   - 'INSUFFICIENT_DATA' - Not enough symptoms to generate a report (< 3)
 *   - 'SERVICE_UNAVAILABLE' - AI service temporarily unavailable
 *   - 'REQUEST_TIMEOUT' - AI request timed out
 *   - Other errors from underlying functions
 */
export async function generateReport(
	supabase: SupabaseClient,
	userId: string,
	periodType: PeriodType,
): Promise<Report> {
	// 1. Calculate period dates
	const dates = calculatePeriodDates(periodType);

	// 2. Fetch symptoms for both periods in parallel
	const [currentSymptoms, previousSymptoms] = await Promise.all([
		fetchSymptomsForPeriod(
			supabase,
			userId,
			dates.current_start,
			dates.current_end,
		),
		fetchSymptomsForPeriod(
			supabase,
			userId,
			dates.previous_start,
			dates.previous_end,
		),
	]);

	// 3. Validate sufficient data
	if (currentSymptoms.length < MIN_SYMPTOMS_REQUIRED) {
		console.warn(
			`User ${userId} attempted to generate report with insufficient data: ${currentSymptoms.length} symptoms`,
		);
		throw new Error('INSUFFICIENT_DATA');
	}

	// 4. Build AI prompt
	const prompt = buildReportPrompt(
		periodType,
		currentSymptoms,
		previousSymptoms,
		dates,
	);

	// 5. Generate report via AI
	const { content } = await generateAIReport(prompt);

	// 6. Save report to database
	const report = await saveReport(supabase, userId, content, periodType, dates);

	console.log(`Successfully generated report ${report.id} for user ${userId}`);

	return report;
}

