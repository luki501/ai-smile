# API Endpoint Implementation Plan: GET /api/reports

## 1. Przegląd punktu końcowego

Endpoint `GET /api/reports` służy do pobierania spaginowanej listy wcześniej wygenerowanych raportów AI dla zalogowanego użytkownika. Raporty są sortowane według daty utworzenia (od najnowszych do najstarszych) i mogą być opcjonalnie filtrowane według typu okresu analizy (`week`, `month`, `quarter`).

**Główne funkcje:**
- Paginacja wyników z konfigurowalnymi parametrami `offset` i `limit`
- Opcjonalne filtrowanie według `period_type`
- Zwracanie zarówno danych jak i całkowitej liczby rekordów (dla interfejsu paginacji)
- Automatyczna autoryzacja poprzez Row-Level Security (RLS)

## 2. Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/reports`
- **Parametry zapytania (Query Parameters)**:
  - **Opcjonalne**:
    - `offset` (number): Liczba rekordów do pominięcia (domyślnie: 0)
    - `limit` (number): Maksymalna liczba zwracanych rekordów (domyślnie: 10, maksimum: 100)
    - `period_type` (string): Filtr według typu okresu ('week', 'month', 'quarter')
- **Request Body**: N/A (GET request)
- **Nagłówki**:
  - `Authorization: Bearer <JWT_TOKEN>` (wymagany, obsługiwany przez middleware)

**Przykładowe żądania:**
```
GET /api/reports
GET /api/reports?offset=10&limit=20
GET /api/reports?period_type=month
GET /api/reports?offset=0&limit=10&period_type=week
```

## 3. Wykorzystywane typy

### Istniejące typy (z `src/types.ts`):

- **`PeriodType`**: Union type reprezentujący dopuszczalne typy okresów
  ```typescript
  type PeriodType = 'week' | 'month' | 'quarter';
  ```

- **`Report`**: Typ bazowy z bazy danych reprezentujący pojedynczy raport
  ```typescript
  type Report = Database['public']['Tables']['reports']['Row'];
  // Zawiera: id, user_id, created_at, content, period_start, period_end, period_type
  ```

- **`ReportDto`**: DTO dla pojedynczego raportu w odpowiedzi API (tożsamy z Report)
  ```typescript
  type ReportDto = Report;
  ```

- **`ReportListResponseDto`**: DTO dla odpowiedzi zawierającej listę raportów z paginacją
  ```typescript
  type ReportListResponseDto = {
    data: ReportDto[];
    count: number;
  };
  ```

### Nowe typy do utworzenia:

- **Zod schema walidacji** (w `src/lib/reports/report-query.validators.ts`):
  ```typescript
  import { z } from 'zod';

  export const ReportQueryParamsSchema = z.object({
    offset: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    period_type: z.enum(['week', 'month', 'quarter']).optional(),
  });

  export type ReportQueryParams = z.infer<typeof ReportQueryParamsSchema>;
  ```

## 4. Szczegóły odpowiedzi

### Sukces (200 OK)

**Struktura odpowiedzi:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-10-31T12:00:00Z",
      "content": "# Raport Analizy Objawów\n\n## Podsumowanie bieżącego okresu...",
      "period_start": "2025-10-01T00:00:00Z",
      "period_end": "2025-10-31T23:59:59Z",
      "period_type": "month"
    },
    {
      "id": 2,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-10-24T10:30:00Z",
      "content": "# Raport Analizy Objawów\n\n## Podsumowanie bieżącego okresu...",
      "period_start": "2025-10-17T00:00:00Z",
      "period_end": "2025-10-24T23:59:59Z",
      "period_type": "week"
    }
  ],
  "count": 15
}
```

**Pola:**
- `data`: Tablica obiektów `ReportDto` zawierająca żądane raporty
- `count`: Całkowita liczba raportów użytkownika spełniających kryteria filtrowania (niezależnie od paginacji)

### Błędy

#### 400 Bad Request
Nieprawidłowe parametry zapytania (failed validation).

```json
{
  "error": "Invalid query parameters",
  "details": {
    "offset": ["Expected number, received string"],
    "limit": ["Number must be less than or equal to 100"]
  }
}
```

#### 401 Unauthorized
Użytkownik nie jest zalogowany (brak lub nieprawidłowy JWT token).

```json
{
  "error": "Unauthorized"
}
```

#### 500 Internal Server Error
Błąd po stronie serwera (np. błąd bazy danych).

```json
{
  "error": "Failed to fetch reports"
}
```

## 5. Przepływ danych

### Diagram przepływu:

```
1. Klient → Request GET /api/reports?offset=0&limit=10&period_type=month
              ↓
2. Astro Middleware → Sprawdzenie JWT i uwierzytelnienie
              ↓ (jeśli brak/nieprawidłowy token)
              401 Unauthorized
              ↓ (jeśli token prawidłowy)
3. API Route Handler (src/pages/api/reports.ts)
   a. Parsowanie query params z URL.searchParams
   b. Walidacja z użyciem Zod schema
              ↓ (jeśli walidacja fail)
              400 Bad Request
              ↓ (jeśli walidacja OK)
   c. Pobranie supabase client z context.locals
   d. Pobranie user_id z authenticated session
   e. Wywołanie report.service.fetchReports()
              ↓
4. Report Service (src/lib/services/report.service.ts)
   a. Konstrukcja zapytania Supabase:
      - FROM reports
      - WHERE user_id = authenticated_user (enforced by RLS)
      - WHERE period_type = filter (if provided)
      - ORDER BY created_at DESC
      - RANGE offset to (offset + limit - 1)
   b. Wykonanie dwóch zapytań:
      - SELECT * (z paginacją i filtrowaniem)
      - COUNT(*) (z tym samym filtrowaniem, bez paginacji)
              ↓ (jeśli błąd DB)
              throw Error
              ↓ (jeśli sukces)
   c. Zwrócenie { reports: Report[], totalCount: number }
              ↓
5. API Route Handler
   a. Formatowanie odpowiedzi według ReportListResponseDto
   b. Zwrócenie Response JSON z statusem 200
              ↓
6. Klient ← Response { data: [...], count: 15 }
```

### Szczegóły interakcji z bazą danych:

**Zapytanie Supabase (pseudokod):**
```typescript
// Zapytanie dla danych
const query = supabase
  .from('reports')
  .select('*')
  .eq('user_id', userId) // RLS automatically enforces this
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

if (period_type) {
  query.eq('period_type', period_type);
}

const { data, error } = await query;

// Zapytanie dla count
const countQuery = supabase
  .from('reports')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);

if (period_type) {
  countQuery.eq('period_type', period_type);
}

const { count, error: countError } = await countQuery;
```

**Wykorzystywane indeksy:**
- `reports_user_id_created_at_idx` - optymalizuje sortowanie według daty dla konkretnego użytkownika
- RLS policy automatycznie filtruje według `user_id`

## 6. Względy bezpieczeństwa

### Uwierzytelnianie
- **Mechanizm**: JWT tokens zarządzane przez Supabase Auth
- **Implementacja**: Astro middleware (`src/middleware/index.ts`) sprawdza token przed dotarciem do route handler
- **Błąd**: Brak lub nieprawidłowy token → 401 Unauthorized

### Autoryzacja
- **Row-Level Security (RLS)**: Włączona na tabeli `reports`
- **Polityka**:
  ```sql
  CREATE POLICY "Allow full access to own reports"
  ON public.reports
  FOR ALL
  USING (auth.uid() = user_id);
  ```
- **Efekt**: Użytkownik automatycznie widzi tylko swoje raporty, niezależnie od parametrów zapytania
- **Zaleta**: Eliminuje konieczność ręcznej walidacji uprawnień w kodzie aplikacji

### Walidacja danych wejściowych

**Ochrona przed atakami:**
- **SQL Injection**: Zapobiegane przez:
  - Użycie Supabase query builder (parametryzowane zapytania)
  - Walidacja typów przez Zod
- **Resource exhaustion**: Zapobiegane przez:
  - Maksymalny limit = 100 (nie pozwala na pobieranie zbyt dużej ilości danych)
  - Walidacja minimalnych wartości (offset >= 0, limit >= 1)
- **Type coercion attacks**: Zapobiegane przez `z.coerce.number()` z walidacją zakresu

**Sanityzacja**:
- Query params są konwertowane i walidowane przed użyciem
- Nie ma user-controlled strings w zapytaniach SQL (tylko typowane wartości)

### Użycie Supabase Client
- **Źródło**: `context.locals.supabase` (nie bezpośredni import)
- **Powód**: Klient z `context.locals` posiada kontekst sesji użytkownika i automatycznie stosuje RLS
- **Import type**: `SupabaseClient` z `@/db/supabase.client.ts`

### Bezpieczeństwo danych
- **Transmisja**: Wszystkie połączenia przez HTTPS (wymuszane na poziomie hostingu)
- **Przechowywanie**: Raporty zawierają wrażliwe dane medyczne, chronione przez RLS
- **GDPR**: Kaskadowe usuwanie (`ON DELETE CASCADE`) zapewnia usunięcie raportów przy usunięciu konta

## 7. Obsługa błędów

### Tabela scenariuszy błędów

| Scenariusz | HTTP Status | Response Body | Logowanie |
|------------|-------------|---------------|-----------|
| Brak tokenu JWT | 401 | `{ "error": "Unauthorized" }` | Middleware log |
| Nieprawidłowy token JWT | 401 | `{ "error": "Unauthorized" }` | Middleware log |
| offset < 0 | 400 | `{ "error": "Invalid query parameters", "details": {...} }` | console.warn |
| limit > 100 | 400 | `{ "error": "Invalid query parameters", "details": {...} }` | console.warn |
| limit < 1 | 400 | `{ "error": "Invalid query parameters", "details": {...} }` | console.warn |
| period_type nieprawidłowy | 400 | `{ "error": "Invalid query parameters", "details": {...} }` | console.warn |
| Błąd zapytania DB | 500 | `{ "error": "Failed to fetch reports" }` | console.error (szczegóły) |
| Błąd count query DB | 500 | `{ "error": "Failed to fetch reports" }` | console.error (szczegóły) |
| Nieoczekiwany błąd | 500 | `{ "error": "Internal server error" }` | console.error (stack trace) |

### Implementacja obsługi błędów

**W API Route Handler:**
```typescript
try {
  // Walidacja
  const params = ReportQueryParamsSchema.safeParse({
    offset: url.searchParams.get('offset'),
    limit: url.searchParams.get('limit'),
    period_type: url.searchParams.get('period_type'),
  });

  if (!params.success) {
    console.warn('Invalid query parameters:', params.error.format());
    return new Response(
      JSON.stringify({
        error: 'Invalid query parameters',
        details: params.error.format(),
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Business logic
  const result = await fetchReports(...);
  
  return new Response(
    JSON.stringify({ data: result.reports, count: result.totalCount }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
} catch (error) {
  console.error('Failed to fetch reports:', error);
  return new Response(
    JSON.stringify({ error: 'Failed to fetch reports' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

**W Report Service:**
```typescript
export async function fetchReports(...): Promise<{ reports: Report[], totalCount: number }> {
  const { data, error } = await query;
  
  if (error) {
    console.error('Database query failed:', error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }
  
  // ... count query with similar error handling
  
  return { reports: data || [], totalCount: count || 0 };
}
```

### Best practices:
- **Wczesne zwroty** dla walidacji (guard clauses)
- **Szczegółowe logowanie** błędów po stronie serwera (z pełnym kontekstem)
- **Ogólne komunikaty** w odpowiedziach klienta (ukrywanie szczegółów implementacji)
- **Różne poziomy logowania**: `console.warn` dla błędów klienta, `console.error` dla błędów serwera

## 8. Rozważania dotyczące wydajności

### Optymalizacje bazy danych

**Indeksy:**
- `reports_user_id_created_at_idx` (już istnieje):
  ```sql
  CREATE INDEX reports_user_id_created_at_idx 
  ON public.reports(user_id, created_at DESC);
  ```
  - **Cel**: Optymalizacja sortowania chronologicznego dla konkretnego użytkownika
  - **Zastosowanie**: Główne zapytanie tego endpointu
  - **Efekt**: Znaczne przyspieszenie zapytań o listy raportów

**Strategia paginacji:**
- Offset-based pagination (wystarczające dla MVP)
- Dla bardzo dużych zbiorów danych (100,000+ rekordów) rozważyć cursor-based pagination w przyszłości

### Limity i zabezpieczenia

**Maksymalny limit:**
- Hardcoded max: 100 rekordów na żądanie
- **Powód**: Zapobiega przeciążeniu serwera i nadmiernemu transferowi danych
- **Trade-off**: Balance między wygodą użytkownika a wydajnością

**Domyślne wartości:**
- `limit: 10` - rozsądna wartość dla większości przypadków użycia
- `offset: 0` - standardowy początek paginacji

### Potencjalne wąskie gardła

1. **Duże zapytania count:**
   - **Problem**: COUNT(*) może być wolny dla bardzo dużych tabel
   - **Mitigation**: Indeks `reports_user_id_created_at_idx` pomaga
   - **Przyszłość**: Rozważyć cache'owanie wartości count lub przybliżone liczenie

2. **Filtrowanie według period_type:**
   - **Obecna sytuacja**: Brak dedykowanego indeksu dla `period_type`
   - **Wpływ**: Dla MVP akceptowalne (tabela nie będzie bardzo duża)
   - **Przyszłość**: Jeśli filtrowanie jest często używane, dodać composite index: `(user_id, period_type, created_at)`

3. **Duże pola content:**
   - **Problem**: Pole `content` zawiera pełny tekst raportu (może być duże)
   - **Mitigation**: Dla MVP akceptowalne
   - **Przyszłość**: Rozważyć:
     - Endpoint `/api/reports` zwracający tylko metadane (bez `content`)
     - Endpoint `/api/reports/{id}` zwracający pełny raport z contentem
     - Kompresja contentu przed zapisem do DB

### Strategie optymalizacji dla przyszłości

**Caching:**
- **Client-side**: Implementacja cache'u po stronie frontend (React Query, SWR)
- **Server-side**: Cache wyników dla popularnych kombinacji parametrów
- **TTL**: Krótki czas życia (5-10 minut) ze względu na możliwość tworzenia nowych raportów

**Database connection pooling:**
- Supabase zarządza tym automatycznie
- Monitoring liczby otwartych połączeń

**Monitoring:**
- Logowanie czasu wykonania zapytań
- Alerty dla zapytań przekraczających próg (np. > 1s)
- Tracking użycia per-user (rate limiting w przyszłości)

## 9. Etapy wdrożenia

### Krok 1: Utworzenie walidatora Zod
**Plik**: `src/lib/reports/report-query.validators.ts`

**Zadania:**
- [ ] Utworzenie pliku `report-query.validators.ts` w katalogu `src/lib/reports/`
- [ ] Zaimportowanie `z` z `zod`
- [ ] Zdefiniowanie `ReportQueryParamsSchema`:
  - `offset`: `z.coerce.number().int().min(0).default(0)`
  - `limit`: `z.coerce.number().int().min(1).max(100).default(10)`
  - `period_type`: `z.enum(['week', 'month', 'quarter']).optional()`
- [ ] Eksport typu `ReportQueryParams` z użyciem `z.infer`
- [ ] Dodanie komentarzy JSDoc dla dokumentacji

**Przykładowa implementacja:**
```typescript
import { z } from 'zod';

/**
 * Zod schema for validating query parameters for GET /api/reports endpoint.
 * Ensures type safety and provides default values for optional parameters.
 */
export const ReportQueryParamsSchema = z.object({
  /**
   * Number of records to skip (for pagination).
   * Must be a non-negative integer. Defaults to 0.
   */
  offset: z.coerce.number().int().min(0).default(0),
  
  /**
   * Maximum number of records to return (for pagination).
   * Must be between 1 and 100. Defaults to 10.
   */
  limit: z.coerce.number().int().min(1).max(100).default(10),
  
  /**
   * Optional filter for period type.
   * When provided, only reports matching this period type are returned.
   */
  period_type: z.enum(['week', 'month', 'quarter']).optional(),
});

/**
 * TypeScript type inferred from ReportQueryParamsSchema.
 * Represents validated and type-safe query parameters.
 */
export type ReportQueryParams = z.infer<typeof ReportQueryParamsSchema>;
```

### Krok 2: Dodanie funkcji do report.service.ts
**Plik**: `src/lib/services/report.service.ts`

**Zadania:**
- [ ] Dodanie importów dla `PeriodType` i `Report` z `@/types`
- [ ] Zdefiniowanie nowej funkcji `fetchReports`:
  - Parametry: `supabase`, `userId`, `offset`, `limit`, `periodType?`
  - Typ zwracany: `Promise<{ reports: Report[], totalCount: number }>`
- [ ] Implementacja zapytania z paginacją i sortowaniem
- [ ] Implementacja opcjonalnego filtrowania według `period_type`
- [ ] Implementacja zapytania count (dla całkowitej liczby)
- [ ] Dodanie error handling i logowania
- [ ] Dodanie komentarzy JSDoc

**Przykładowa implementacja:**
```typescript
/**
 * Fetches a paginated list of reports for a specific user.
 * Reports are sorted by creation date (newest first) and can be optionally filtered by period type.
 *
 * @param supabase - Supabase client instance with user context
 * @param userId - The ID of the user whose reports to fetch
 * @param offset - Number of records to skip (for pagination)
 * @param limit - Maximum number of records to return
 * @param periodType - Optional filter for period type ('week', 'month', 'quarter')
 * @returns Object containing array of reports and total count
 * @throws Error if the database query fails
 *
 * @example
 * const result = await fetchReports(supabase, userId, 0, 10, 'month');
 * console.log(`Found ${result.totalCount} reports, showing ${result.reports.length}`);
 */
export async function fetchReports(
	supabase: SupabaseClient,
	userId: string,
	offset: number,
	limit: number,
	periodType?: PeriodType,
): Promise<{ reports: Report[]; totalCount: number }> {
	// Build query for fetching reports
	let query = supabase
		.from('reports')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	// Apply optional period_type filter
	if (periodType) {
		query = query.eq('period_type', periodType);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Failed to fetch reports:', error);
		throw new Error(`Failed to fetch reports: ${error.message}`);
	}

	// Build query for count (same filters, no pagination)
	let countQuery = supabase
		.from('reports')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId);

	if (periodType) {
		countQuery = countQuery.eq('period_type', periodType);
	}

	const { count, error: countError } = await countQuery;

	if (countError) {
		console.error('Failed to count reports:', countError);
		throw new Error(`Failed to count reports: ${countError.message}`);
	}

	return {
		reports: data || [],
		totalCount: count || 0,
	};
}
```

### Krok 3: Utworzenie API route handler
**Plik**: `src/pages/api/reports.ts`

**Zadania:**
- [ ] Utworzenie pliku `reports.ts` w `src/pages/api/`
- [ ] Dodanie `export const prerender = false` (SSR required)
- [ ] Zaimportowanie niezbędnych typów i funkcji:
  - `APIContext` z `astro`
  - `ReportQueryParamsSchema` z walidatora
  - `fetchReports` z report.service
  - `ReportListResponseDto` z `@/types`
- [ ] Implementacja funkcji `GET`:
  - Sprawdzenie autentykacji (session z `context.locals`)
  - Parsowanie query params z `context.url.searchParams`
  - Walidacja z użyciem Zod schema
  - Wywołanie `fetchReports` z report.service
  - Formatowanie odpowiedzi według `ReportListResponseDto`
  - Obsługa błędów z odpowiednimi kodami statusu
- [ ] Dodanie komentarzy JSDoc

**Przykładowa implementacja:**
```typescript
import type { APIContext } from 'astro';
import type { ReportListResponseDto } from '@/types';
import { ReportQueryParamsSchema } from '@/lib/reports/report-query.validators';
import { fetchReports } from '@/lib/services/report.service';

export const prerender = false;

/**
 * GET /api/reports
 * Retrieves a paginated list of reports for the authenticated user.
 * 
 * Query Parameters:
 * - offset (optional, default: 0): Number of records to skip
 * - limit (optional, default: 10): Maximum number of records to return
 * - period_type (optional): Filter by period type ('week', 'month', 'quarter')
 * 
 * Returns:
 * - 200 OK: { data: ReportDto[], count: number }
 * - 400 Bad Request: Invalid query parameters
 * - 401 Unauthorized: User not authenticated
 * - 500 Internal Server Error: Server error
 */
export async function GET(context: APIContext): Promise<Response> {
	// 1. Check authentication
	const session = await context.locals.supabase.auth.getSession();
	
	if (!session.data.session) {
		return new Response(
			JSON.stringify({ error: 'Unauthorized' }),
			{ status: 401, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const userId = session.data.session.user.id;
	const url = context.url;

	// 2. Parse and validate query parameters
	const validationResult = ReportQueryParamsSchema.safeParse({
		offset: url.searchParams.get('offset'),
		limit: url.searchParams.get('limit'),
		period_type: url.searchParams.get('period_type'),
	});

	if (!validationResult.success) {
		console.warn('Invalid query parameters:', validationResult.error.format());
		return new Response(
			JSON.stringify({
				error: 'Invalid query parameters',
				details: validationResult.error.format(),
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const { offset, limit, period_type } = validationResult.data;

	try {
		// 3. Fetch reports from database
		const result = await fetchReports(
			context.locals.supabase,
			userId,
			offset,
			limit,
			period_type,
		);

		// 4. Format response
		const response: ReportListResponseDto = {
			data: result.reports,
			count: result.totalCount,
		};

		return new Response(
			JSON.stringify(response),
			{ 
				status: 200, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	} catch (error) {
		console.error('Failed to fetch reports:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch reports' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}
```

### Krok 4: Testowanie endpoint
**Narzędzia**: cURL, Postman, lub Thunder Client

**Zadania:**
- [ ] Test 1: Podstawowe żądanie bez parametrów
  ```bash
  curl -H "Authorization: Bearer <JWT_TOKEN>" \
       http://localhost:4321/api/reports
  ```
  Oczekiwany wynik: 200 OK, `{ data: [...], count: N }`

- [ ] Test 2: Paginacja
  ```bash
  curl -H "Authorization: Bearer <JWT_TOKEN>" \
       "http://localhost:4321/api/reports?offset=10&limit=5"
  ```
  Oczekiwany wynik: 200 OK, maksymalnie 5 rekordów

- [ ] Test 3: Filtrowanie według period_type
  ```bash
  curl -H "Authorization: Bearer <JWT_TOKEN>" \
       "http://localhost:4321/api/reports?period_type=month"
  ```
  Oczekiwany wynik: 200 OK, tylko raporty typu 'month'

- [ ] Test 4: Nieprawidłowe parametry
  ```bash
  curl -H "Authorization: Bearer <JWT_TOKEN>" \
       "http://localhost:4321/api/reports?offset=-1"
  ```
  Oczekiwany wynik: 400 Bad Request z details

- [ ] Test 5: Brak autoryzacji
  ```bash
  curl http://localhost:4321/api/reports
  ```
  Oczekiwany wynik: 401 Unauthorized

- [ ] Test 6: Limit przekraczający max (101)
  ```bash
  curl -H "Authorization: Bearer <JWT_TOKEN>" \
       "http://localhost:4321/api/reports?limit=101"
  ```
  Oczekiwany wynik: 400 Bad Request

### Krok 5: Weryfikacja bezpieczeństwa
**Zadania:**
- [ ] Sprawdzenie, czy RLS policy działa poprawnie:
  - Zalogować się jako user A
  - Pobrać listę raportów
  - Zalogować się jako user B
  - Sprawdzić, czy user B nie widzi raportów user A
- [ ] Sprawdzenie, czy middleware poprawnie blokuje nieautoryzowane żądania
- [ ] Sprawdzenie, czy walidacja query params działa dla wszystkich edge cases
- [ ] Code review: sprawdzenie, czy używamy `context.locals.supabase`, nie bezpośredniego importu

### Krok 6: Dokumentacja i czyszczenie
**Zadania:**
- [ ] Aktualizacja `api-plan.md` - oznaczenie endpointu jako zaimplementowanego
- [ ] Dodanie przykładów użycia w dokumentacji (jeśli istnieje)
- [ ] Sprawdzenie feedback z lintera
- [ ] Sprawdzenie czy wszystkie importy są poprawne
- [ ] Sprawdzenie czy kod spełnia zasady clean code z `.cursorrules`

### Krok 7: Integracja z frontendem (opcjonalnie)
**Zadania:**
- [ ] Utworzenie custom hook `useReports()` w React (jeśli potrzebne)
- [ ] Implementacja komponentu listy raportów z paginacją
- [ ] Implementacja filtrowania według period_type w UI
- [ ] Testowanie E2E całego flow

---

## 10. Checklist przed wdrożeniem na produkcję

### Funkcjonalność
- [ ] Wszystkie testy manualne przechodzą pomyślnie
- [ ] Paginacja działa poprawnie dla różnych wartości offset/limit
- [ ] Filtrowanie według period_type działa
- [ ] Sortowanie według created_at DESC działa
- [ ] Zwracany count jest poprawny

### Bezpieczeństwo
- [ ] Middleware sprawdza JWT token
- [ ] RLS policy ogranicza dostęp tylko do własnych raportów
- [ ] Walidacja query params działa
- [ ] Nie ma SQL injection vulnerabilities
- [ ] Używamy `context.locals.supabase`

### Wydajność
- [ ] Indeks `reports_user_id_created_at_idx` jest utworzony w DB
- [ ] Zapytania DB wykonują się w rozsądnym czasie (< 500ms dla typowego przypadku)
- [ ] Limit max (100) jest egzekwowany

### Kod
- [ ] Kod jest zgodny z zasadami z `.cursorrules`
- [ ] Wszystkie funkcje mają komentarze JSDoc
- [ ] Error handling jest kompletny
- [ ] Logowanie jest odpowiednie (warn dla client errors, error dla server errors)
- [ ] Brak linter errors/warnings

### Dokumentacja
- [ ] `api-plan.md` jest zaktualizowany
- [ ] Ten plan implementacji jest zapisany jako `.ai/report-get-implementation-plan.md`
- [ ] Przykłady użycia są udokumentowane

---

## Podsumowanie

Endpoint `GET /api/reports` to standardowy endpoint odczytu z paginacją i filtrowaniem. Główne punkty implementacji:

1. **Walidacja** query params z użyciem Zod
2. **Bezpieczeństwo** zapewnione przez JWT + RLS
3. **Wydajność** zoptymalizowana przez indeksy DB
4. **Separacja concerns** - walidacja w validator, logika w service, routing w API handler

Implementacja powinna zająć około 2-3 godzin dla doświadczonego dewelopera, włączając testy manualne.

