# API Endpoint Implementation Plan: POST /api/reports

## 1. Przegląd punktu końcowego

Endpoint `POST /api/reports` generuje nowy raport analizy symptomów AI dla uwierzytelnionego użytkownika na podstawie wybranego okresu czasu. Raport zawiera szczegółową analizę symptomów z wybranego okresu, porównanie z okresem poprzednim o takiej samej długości, identyfikację trendów oraz wykrycie nowych symptomów. Wygenerowany raport jest zapisywany w bazie danych dla przyszłych referencji i zwracany w odpowiedzi.

**Główne funkcjonalności:**
- Obliczanie dat początku i końca okresu na podstawie `period_type`
- Pobieranie danych o symptomach dla okresu bieżącego i poprzedniego
- Weryfikacja wystarczającej ilości danych do analizy
- Generowanie raportu AI przez OpenRouter.ai
- Zapis raportu do bazy danych
- Zwrócenie pełnego obiektu raportu

## 2. Szczegóły żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/reports`
- **Nagłówki:**
  - `Authorization: Bearer <JWT_TOKEN>` (wymagany)
  - `Content-Type: application/json` (wymagany)
- **Parametry:**
  - **Wymagane:**
    - `period_type` (string): Typ okresu analizy. Dozwolone wartości: `"week"`, `"month"`, `"quarter"`
  - **Opcjonalne:** Brak
- **Request Body:**
  ```json
  {
    "period_type": "month"
  }
  ```

## 3. Wykorzystywane typy

Z pliku `src/types.ts`:

- **`CreateReportCommand`**: Command model dla żądania utworzenia raportu
  ```typescript
  type CreateReportCommand = {
    period_type: PeriodType;
  }
  ```

- **`PeriodType`**: Union type określający dozwolone typy okresów
  ```typescript
  type PeriodType = 'week' | 'month' | 'quarter';
  ```

- **`ReportDto`**: DTO dla odpowiedzi (alias dla `Report`)
  ```typescript
  type ReportDto = Report;
  ```

- **`Report`**: Typ bazowy reprezentujący rekord z bazy danych
  ```typescript
  type Report = Database['public']['Tables']['reports']['Row'];
  // Zawiera: id, user_id, created_at, content, period_start, period_end, period_type
  ```

- **`ReportInsert`**: Typ dla operacji INSERT do bazy danych
  ```typescript
  type ReportInsert = Database['public']['Tables']['reports']['Insert'];
  ```

## 4. Szczegóły odpowiedzi

### Sukces (201 Created)

```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-10-31T12:00:00Z",
  "content": "# Symptom Analysis Report\n\n## Current Period Summary (2025-10-01 to 2025-10-31)...",
  "period_start": "2025-10-01T00:00:00Z",
  "period_end": "2025-10-31T23:59:59Z",
  "period_type": "month"
}
```

### Błędy

#### 400 Bad Request
Brakujący lub nieprawidłowy format request body.

```json
{
  "error": "Bad Request",
  "message": "Request body is required"
}
```

#### 401 Unauthorized
Brak tokenu JWT lub token nieważny.

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 422 Unprocessable Entity
Błąd walidacji `period_type`.

```json
{
  "error": "Validation Error",
  "message": "Invalid period_type. Must be one of: week, month, quarter"
}
```

#### 424 Failed Dependency
Niewystarczająca ilość danych symptomów.

```json
{
  "error": "Insufficient Data",
  "message": "Not enough symptom data to generate a meaningful report. Please log more symptoms and try again."
}
```

#### 500 Internal Server Error
Nieoczekiwany błąd podczas generowania raportu lub zapisu do bazy.

```json
{
  "error": "Internal Server Error",
  "message": "Failed to generate report"
}
```

#### 503 Service Unavailable
Serwis AI czasowo niedostępny.

```json
{
  "error": "Service Unavailable",
  "message": "AI service is temporarily unavailable. Please try again later."
}
```

## 5. Przepływ danych

### 5.1. Diagram przepływu

```
1. Klient wysyła POST /api/reports z { period_type }
   ↓
2. Middleware Astro weryfikuje JWT i wyciąga user_id
   ↓
3. Endpoint waliduje request body (Zod)
   ↓
4. Service oblicza daty period_start i period_end
   ↓
5. Service pobiera symptomy z bazy dla okresu bieżącego i poprzedniego
   ↓
6. Service weryfikuje wystarczającą ilość danych (min. próg)
   ↓
7. Service konstruuje prompt dla AI
   ↓
8. Service wysyła request do OpenRouter API
   ↓
9. Service przetwarza odpowiedź AI
   ↓
10. Service zapisuje raport do tabeli reports
    ↓
11. Endpoint zwraca utworzony raport (201 Created)
```

### 5.2. Szczegółowy opis kroków

#### Krok 1-2: Autentykacja
Middleware Astro (`src/middleware/index.ts`) weryfikuje JWT token i dodaje `user_id` do `context.locals`.

#### Krok 3: Walidacja
Zod schema waliduje struktur request body:
- Sprawdzenie obecności `period_type`
- Weryfikacja, czy wartość jest jedną z dozwolonych: 'week', 'month', 'quarter'

#### Krok 4: Obliczanie dat
Funkcja `calculatePeriodDates(period_type: PeriodType)` zwraca:
- `current_period_start` i `current_period_end`
- `previous_period_start` i `previous_period_end`

Logika:
- `period_end` = teraz (bieżąca data i godzina)
- Dla `week`: `period_start` = 7 dni wstecz
- Dla `month`: `period_start` = 1 miesiąc wstecz (30 dni)
- Dla `quarter`: `period_start` = 3 miesiące wstecz (90 dni)
- Okres poprzedni: takie samo przesunięcie wstecz od `period_start`

#### Krok 5: Pobieranie symptomów
Zapytanie do Supabase:
```typescript
const { data: currentSymptoms } = await supabase
  .from('symptoms')
  .select('*')
  .eq('user_id', userId)
  .gte('occurred_at', current_period_start)
  .lte('occurred_at', current_period_end)
  .order('occurred_at', { ascending: false });

// Podobnie dla poprzedniego okresu
```

#### Krok 6: Weryfikacja danych
Minimalne wymagania:
- Co najmniej 3 symptomy w okresie bieżącym
- Jeśli nie spełnione, zwróć 424 Failed Dependency

#### Krok 7-8: Generowanie raportu AI
Konstruowanie promptu zawierającego:
- Opis zadania analizy
- Dane symptomów dla obu okresów w strukturalnym formacie
- Instrukcje dotyczące zawartości raportu

Wysłanie requestu do OpenRouter API:
```typescript
POST https://openrouter.ai/api/v1/chat/completions
Headers:
  Authorization: Bearer ${OPENROUTER_API_KEY}
  Content-Type: application/json
Body:
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "You are a medical data analyst..." },
    { "role": "user", "content": "<prompt z danymi>" }
  ]
}
```

#### Krok 9-10: Zapis raportu
Po otrzymaniu odpowiedzi AI:
- Wyciągnięcie treści raportu z response
- Zapis do bazy danych:
```typescript
const { data: report } = await supabase
  .from('reports')
  .insert({
    user_id: userId,
    content: aiGeneratedContent,
    period_start: current_period_start,
    period_end: current_period_end,
    period_type: period_type
  })
  .select()
  .single();
```

#### Krok 11: Odpowiedź
Zwrócenie pełnego obiektu `ReportDto` z kodem 201 Created.

## 6. Względy bezpieczeństwa

### 6.1. Autentykacja i autoryzacja

- **Wymagane uwierzytelnienie JWT**: Wszystkie żądania muszą zawierać ważny token JWT w nagłówku `Authorization`
- **Middleware Astro**: Weryfikacja tokenu w middleware przed dotarciem do endpointu
- **Row-Level Security (RLS)**: Polityki na poziomie bazy danych zapewniają, że użytkownik ma dostęp tylko do własnych symptomów i raportów
- **Izolacja user_id**: `user_id` jest wyciągany z JWT i nigdy nie jest przyjmowany z request body

### 6.2. Zabezpieczenie kluczy API

- **Zmienna środowiskowa**: Klucz OpenRouter API (`OPENROUTER_API_KEY`) przechowywany w zmiennej środowiskowej
- **Nigdy w kodzie klienta**: Klucz API nigdy nie jest eksponowany do przeglądarki
- **Limity finansowe**: Ustawienie limitów wydatków na poziomie konta OpenRouter

### 6.3. Rate limiting

- **Limit per użytkownik**: Maksymalnie 10 raportów na godzinę per użytkownik (opcjonalnie)
- **Mechanizm**: Można użyć prostej implementacji opartej o bazę (zliczanie raportów created_at > now() - 1 hour)
- **Komunikat**: W przypadku przekroczenia zwrócić 429 Too Many Requests

### 6.4. Walidacja i sanityzacja danych

- **Zod schema**: Ścisła walidacja struktury request body
- **Sanityzacja notatek**: Przed włączeniem notatek z symptomów do promptu AI, należy je odpowiednio zesanityzować (usunięcie potencjalnie niebezpiecznych znaków)
- **Limit długości**: Notatki z symptomów mogą być obcięte do maksymalnej długości w prompcie (np. 500 znaków per symptom)

### 6.5. Zabezpieczenie przed atakami

- **SQL Injection**: Używanie Supabase client z parametryzowanymi zapytaniami
- **Prompt Injection**: Struktura promptu powinna być zaprojektowana tak, aby notatki użytkownika nie mogły manipulować instrukcjami dla AI
- **XSS**: Content raportu jest przechowywany jako plain text; przy wyświetlaniu należy zastosować odpowiednie escapowanie

## 7. Obsługa błędów

### 7.1. Błędy walidacji (400, 422)

**Scenariusz:** Brakujące lub nieprawidłowe dane wejściowe

**Obsługa:**
```typescript
// Early return pattern
if (!request.body) {
  return new Response(JSON.stringify({
    error: 'Bad Request',
    message: 'Request body is required'
  }), { status: 400 });
}

// Zod validation
const result = createReportSchema.safeParse(body);
if (!result.success) {
  return new Response(JSON.stringify({
    error: 'Validation Error',
    message: result.error.errors[0].message
  }), { status: 422 });
}
```

### 7.2. Brak autentykacji (401)

**Scenariusz:** Brak JWT lub token nieważny

**Obsługa:**
```typescript
const user = context.locals.user;
if (!user) {
  return new Response(JSON.stringify({
    error: 'Unauthorized',
    message: 'Authentication required'
  }), { status: 401 });
}
```

### 7.3. Niewystarczające dane (424)

**Scenariusz:** Użytkownik ma zbyt mało symptomów do wygenerowania raportu

**Obsługa:**
```typescript
const MIN_SYMPTOMS_REQUIRED = 3;

if (currentSymptoms.length < MIN_SYMPTOMS_REQUIRED) {
  return new Response(JSON.stringify({
    error: 'Insufficient Data',
    message: `Not enough symptom data to generate a meaningful report. Please log at least ${MIN_SYMPTOMS_REQUIRED} symptoms and try again.`
  }), { status: 424 });
}
```

**Logowanie:** Rejestracja próby generowania raportu z niewystarczającymi danymi

### 7.4. Błędy AI Service (500, 503)

**Scenariusz:** OpenRouter API zwraca błąd lub jest niedostępny

**Obsługa:**
```typescript
try {
  const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(aiRequest)
  });

  if (!aiResponse.ok) {
    if (aiResponse.status === 503 || aiResponse.status === 429) {
      // Temporary service issue
      console.error('OpenRouter service unavailable:', aiResponse.status);
      return new Response(JSON.stringify({
        error: 'Service Unavailable',
        message: 'AI service is temporarily unavailable. Please try again later.'
      }), { status: 503 });
    }
    
    throw new Error(`OpenRouter API error: ${aiResponse.status}`);
  }
  
} catch (error) {
  console.error('Failed to generate AI report:', error);
  return new Response(JSON.stringify({
    error: 'Internal Server Error',
    message: 'Failed to generate report'
  }), { status: 500 });
}
```

**Logowanie:** Szczegółowe logowanie błędów komunikacji z OpenRouter (status code, error message)

### 7.5. Błędy bazy danych (500)

**Scenariusz:** Niepowodzenie zapisu raportu do bazy

**Obsługa:**
```typescript
const { data: report, error: dbError } = await supabase
  .from('reports')
  .insert(reportData)
  .select()
  .single();

if (dbError) {
  console.error('Failed to save report to database:', dbError);
  return new Response(JSON.stringify({
    error: 'Internal Server Error',
    message: 'Failed to save report'
  }), { status: 500 });
}
```

**Logowanie:** Szczegółowe logowanie błędów bazy danych

### 7.6. Timeout

**Scenariusz:** Generowanie raportu AI trwa zbyt długo

**Obsługa:**
```typescript
const AI_REQUEST_TIMEOUT = 30000; // 30 sekund

const aiResponsePromise = fetch(/* ... */);
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('AI request timeout')), AI_REQUEST_TIMEOUT)
);

try {
  const aiResponse = await Promise.race([aiResponsePromise, timeoutPromise]);
  // ...
} catch (error) {
  if (error.message === 'AI request timeout') {
    return new Response(JSON.stringify({
      error: 'Request Timeout',
      message: 'Report generation took too long. Please try again.'
    }), { status: 504 });
  }
  // ...
}
```

## 8. Rozważania dotyczące wydajności

### 8.1. Potencjalne wąskie gardła

1. **Czas odpowiedzi AI service**: Generowanie raportu przez AI może zająć 5-30 sekund
2. **Zapytania do bazy danych**: Pobieranie symptomów dla dwóch okresów
3. **Rozmiar danych**: Użytkownicy z setkami symptomów mogą przekraczać limity promptu AI

### 8.2. Strategie optymalizacji

#### Indeksy bazy danych
Wykorzystanie istniejących indeksów:
- `symptoms_user_id_occurred_at_idx`: Przyspiesza pobieranie symptomów dla okresu
- `reports_user_id_created_at_idx`: Przydatny dla rate limiting

#### Ograniczenie danych w prompcie
```typescript
const MAX_SYMPTOMS_IN_PROMPT = 100;
const currentSymptomsForPrompt = currentSymptoms.slice(0, MAX_SYMPTOMS_IN_PROMPT);
```

Jeśli użytkownik ma więcej symptomów, można:
- Wybrać reprezentatywną próbkę (np. równomiernie rozłożoną w czasie)
- Zaagregować dane (np. liczba wystąpień per typ i lokalizacja)
- Dodać informację w raporcie o liczbie przetworzonych vs. całkowitej liczby symptomów

#### Caching (opcjonalne dla przyszłych wersji)
- Cache raportu dla tego samego `period_type` i zbliżonego czasu (TTL: 1 godzina)
- Pozwoli uniknąć regenerowania identycznego raportu

#### Asynchroniczne generowanie (przyszła iteracja)
- Zwrócenie 202 Accepted z `report_id` i statusem "pending"
- Generowanie raportu w tle (np. przez job queue)
- Dodatkowy endpoint GET /api/reports/{id}/status do sprawdzania statusu

### 8.3. Monitoring i metryki

Warto monitorować:
- Czas generowania raportów (średnia, p95, p99)
- Wskaźnik sukcesu vs. błędów
- Koszty wywołań AI API
- Liczba raportów generowanych per użytkownik
- Przypadki błędu 424 (niewystarczające dane)

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie struktury plików

**Utworzenie walidatora:**
```
src/lib/reports/report.validators.ts
```

Zawartość:
```typescript
import { z } from 'zod';
import type { CreateReportCommand, PeriodType } from '@/types';

export const periodTypeSchema = z.enum(['week', 'month', 'quarter']);

export const createReportSchema = z.object({
  period_type: periodTypeSchema,
}) satisfies z.ZodType<CreateReportCommand>;
```

**Utworzenie serwisu:**
```
src/lib/services/report.service.ts
```

### Krok 2: Implementacja funkcji pomocniczych w serwisie

**a) Funkcja obliczania dat okresu:**
```typescript
interface PeriodDates {
  current_start: Date;
  current_end: Date;
  previous_start: Date;
  previous_end: Date;
}

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
  const previousStart = new Date(previousEnd.getTime() - daysBack * 24 * 60 * 60 * 1000);
  
  return {
    current_start: currentStart,
    current_end: currentEnd,
    previous_start: previousStart,
    previous_end: previousEnd,
  };
}
```

**b) Funkcja pobierania symptomów:**
```typescript
import type { SupabaseClient } from '@/db/supabase.server';
import type { Symptom } from '@/types';

export async function fetchSymptomsForPeriod(
  supabase: SupabaseClient,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Symptom[]> {
  const { data, error } = await supabase
    .from('symptoms')
    .select('*')
    .eq('user_id', userId)
    .gte('occurred_at', startDate.toISOString())
    .lte('occurred_at', endDate.toISOString())
    .order('occurred_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to fetch symptoms: ${error.message}`);
  }
  
  return data || [];
}
```

**c) Funkcja konstrukcji promptu:**
```typescript
export function buildReportPrompt(
  periodType: PeriodType,
  currentSymptoms: Symptom[],
  previousSymptoms: Symptom[],
  dates: PeriodDates
): string {
  const formatSymptoms = (symptoms: Symptom[]) => {
    return symptoms.map(s => 
      `- ${s.occurred_at}: ${s.symptom_type} in ${s.body_part}${s.notes ? ` (${s.notes.slice(0, 200)})` : ''}`
    ).join('\n');
  };
  
  const prompt = `You are a medical data analyst specializing in multiple sclerosis symptom tracking.

Analyze the following symptom data and generate a comprehensive report in Polish language.

**Current Period (${periodType})**: ${dates.current_start.toISOString()} to ${dates.current_end.toISOString()}
Total symptoms recorded: ${currentSymptoms.length}

Symptoms:
${formatSymptoms(currentSymptoms.slice(0, 100))}

**Previous Period (${periodType})**: ${dates.previous_start.toISOString()} to ${dates.previous_end.toISOString()}
Total symptoms recorded: ${previousSymptoms.length}

Symptoms:
${formatSymptoms(previousSymptoms.slice(0, 100))}

Generate a report in Polish including:
1. Podsumowanie objawów z bieżącego okresu (częstotliwość, typy, lokalizacje, wzorce)
2. Porównanie z okresem poprzednim
3. Analiza trendów (nasilanie się, stabilizacja, zmniejszanie objawów)
4. Nowe objawy, które nie występowały w poprzednim okresie
5. Statystyki liczbowe dla obu okresów

Format the report in clear, patient-friendly language with appropriate sections using Markdown formatting.`;
  
  return prompt;
}
```

**d) Funkcja komunikacji z OpenRouter API:**
```typescript
interface AIServiceResponse {
  content: string;
}

export async function generateAIReport(prompt: string): Promise<AIServiceResponse> {
  const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
  const AI_REQUEST_TIMEOUT = 30000;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a medical data analyst specializing in multiple sclerosis symptom analysis. Provide clear, empathetic, and informative reports in Polish.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 503 || response.status === 429) {
        throw new Error('SERVICE_UNAVAILABLE');
      }
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content || content.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }
    
    return { content };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('REQUEST_TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**e) Funkcja zapisu raportu:**
```typescript
export async function saveReport(
  supabase: SupabaseClient,
  userId: string,
  content: string,
  periodType: PeriodType,
  dates: PeriodDates
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
    throw new Error(`Failed to save report: ${error.message}`);
  }
  
  return data;
}
```

### Krok 3: Implementacja głównej funkcji serwisu

```typescript
export async function generateReport(
  supabase: SupabaseClient,
  userId: string,
  periodType: PeriodType
): Promise<Report> {
  // 1. Calculate period dates
  const dates = calculatePeriodDates(periodType);
  
  // 2. Fetch symptoms for both periods
  const [currentSymptoms, previousSymptoms] = await Promise.all([
    fetchSymptomsForPeriod(supabase, userId, dates.current_start, dates.current_end),
    fetchSymptomsForPeriod(supabase, userId, dates.previous_start, dates.previous_end),
  ]);
  
  // 3. Validate sufficient data
  const MIN_SYMPTOMS_REQUIRED = 3;
  if (currentSymptoms.length < MIN_SYMPTOMS_REQUIRED) {
    throw new Error('INSUFFICIENT_DATA');
  }
  
  // 4. Build AI prompt
  const prompt = buildReportPrompt(periodType, currentSymptoms, previousSymptoms, dates);
  
  // 5. Generate report via AI
  const { content } = await generateAIReport(prompt);
  
  // 6. Save report to database
  const report = await saveReport(supabase, userId, content, periodType, dates);
  
  return report;
}
```

### Krok 4: Implementacja endpointu API

**Utworzenie pliku:**
```
src/pages/api/reports.ts
```

**Zawartość:**
```typescript
import type { APIRoute } from 'astro';
import { createReportSchema } from '@/lib/reports/report.validators';
import { generateReport } from '@/lib/services/report.service';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  // 1. Check authentication
  const user = context.locals.user;
  if (!user) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 2. Parse and validate request body
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid JSON in request body',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const validation = createReportSchema.safeParse(body);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: 'Validation Error',
        message: validation.error.errors[0].message,
      }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const { period_type } = validation.data;
  const supabase = context.locals.supabase;
  
  // 3. Generate report
  try {
    const report = await generateReport(supabase, user.id, period_type);
    
    return new Response(
      JSON.stringify(report),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Report generation error:', error);
    
    // Handle specific error types
    if (error.message === 'INSUFFICIENT_DATA') {
      return new Response(
        JSON.stringify({
          error: 'Insufficient Data',
          message: 'Not enough symptom data to generate a meaningful report. Please log more symptoms and try again.',
        }),
        { status: 424, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (error.message === 'SERVICE_UNAVAILABLE') {
      return new Response(
        JSON.stringify({
          error: 'Service Unavailable',
          message: 'AI service is temporarily unavailable. Please try again later.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (error.message === 'REQUEST_TIMEOUT') {
      return new Response(
        JSON.stringify({
          error: 'Request Timeout',
          message: 'Report generation took too long. Please try again.',
        }),
        { status: 504, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generic server error
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to generate report',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

### Krok 5: Dodanie zmiennej środowiskowej

Dodać do pliku `.env`:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Dodać do pliku `src/env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  // ... existing env vars
}
```

### Krok 6: Testowanie

**a) Test jednostkowy funkcji pomocniczych:**
- Test `calculatePeriodDates` z różnymi period_types
- Test `buildReportPrompt` z przykładowymi danymi
- Mock'owanie odpowiedzi OpenRouter API

**b) Test integracyjny endpointu:**
- Test z prawidłowymi danymi (201)
- Test bez autentykacji (401)
- Test z nieprawidłowym period_type (422)
- Test z niewystarczającymi danymi (424)
- Test z mock'owanym błędem AI service (503)

**c) Test manualny:**
- Utworzenie kilku symptomów w różnych okresach
- Wywołanie endpointu z różnymi period_types
- Weryfikacja poprawności wygenerowanego raportu
- Sprawdzenie zapisu do bazy danych

### Krok 7: Dokumentacja i finalizacja

- Aktualizacja dokumentacji API w `.ai/api-plan.md`
- Dodanie przykładów użycia w README
- Code review
- Deployment do środowiska testowego
- Monitoring początkowych wywołań w production

### Krok 8: Opcjonalne usprawnienia (post-MVP)

- Implementacja rate limiting per użytkownik
- Dodanie cachingu dla identycznych raportów
- Implementacja asynchronicznego generowania dla lepszej UX
- Eksport raportu do PDF
- Historia wersji raportów (jeśli ten sam okres jest analizowany wielokrotnie)
- Możliwość wyboru niestandardowego zakresu dat
- Wybór modelu AI (różne modele dla różnych potrzeb)

