# API Endpoint Implementation Plan: DELETE /api/reports/{id}

## 1. Przegląd punktu końcowego

Endpoint `DELETE /api/reports/{id}` umożliwia uwierzytelnionym użytkownikom usuwanie własnych raportów z systemu. Jest to operacja nieodwracalna, która służy do zarządzania historią raportów i usuwania nieaktualnych analiz. Endpoint wymaga zarówno autentykacji (JWT token), jak i autoryzacji (użytkownik musi być właścicielem raportu).

**Główne funkcjonalności:**
- Usunięcie konkretnego raportu na podstawie ID
- Weryfikacja własności raportu przed usunięciem
- Zapewnienie bezpieczeństwa poprzez kontrolę dostępu
- Zwrócenie odpowiednich kodów błędów dla różnych scenariuszy

**Kluczowe aspekty:**
- Operacja DELETE jest idempotentna (wielokrotne wywołanie daje ten sam efekt)
- Nie zwraca żadnej zawartości w przypadku sukcesu (204 No Content)
- Kaskadowe usuwanie nie jest wymagane (raport nie ma powiązanych rekordów potomnych)

## 2. Szczegóły żądania

- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/reports/{id}`
- **Nagłówki:**
  - `Authorization: Bearer <JWT_TOKEN>` (wymagany)
- **Parametry URL:**
  - **Wymagane:**
    - `id` (number): ID raportu do usunięcia. Musi być dodatnią liczbą całkowitą.
  - **Opcjonalne:** Brak
- **Request Body:** N/A (endpoint nie przyjmuje body)

**Przykład żądania:**
```http
DELETE /api/reports/123 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Wykorzystywane typy

Z pliku `src/types.ts`:

- **`Report`**: Typ bazowy reprezentujący rekord raportu z bazy danych
  ```typescript
  type Report = Database['public']['Tables']['reports']['Row'];
  // Zawiera: id, user_id, created_at, content, period_start, period_end, period_type
  ```

**Uwaga:** Endpoint DELETE nie wymaga nowych typów DTO ani Command Modeli, ponieważ:
- Nie przyjmuje request body
- Nie zwraca response body przy sukcesie (204)
- Wykorzystuje tylko istniejący typ `Report` wewnętrznie w serwisie

## 4. Szczegóły odpowiedzi

### Sukces (204 No Content)

Raport został pomyślnie usunięty. Brak treści w odpowiedzi.

```http
HTTP/1.1 204 No Content
```

### Błędy

#### 400 Bad Request

Nieprawidłowy format ID raportu (nie jest liczbą, jest ujemny, lub nie jest liczbą całkowitą).

```json
{
  "error": "Bad Request",
  "message": "Invalid report ID"
}
```

#### 401 Unauthorized

Brak tokenu JWT lub token nieważny. Użytkownik nie jest uwierzytelniony.

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden

Raport istnieje, ale należy do innego użytkownika. Użytkownik nie ma uprawnień do jego usunięcia.

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to delete this report"
}
```

**Alternatywa dla bezpieczeństwa:** W niektórych przypadkach można zwrócić 404 zamiast 403, aby uniemożliwić wyliczanie ID raportów należących do innych użytkowników. Decyzja zależy od wymagań bezpieczeństwa projektu.

#### 404 Not Found

Raport o podanym ID nie istnieje w systemie.

```json
{
  "error": "Not Found",
  "message": "Report not found"
}
```

#### 500 Internal Server Error

Nieoczekiwany błąd podczas usuwania raportu (np. błąd bazy danych).

```json
{
  "error": "Internal Server Error",
  "message": "Failed to delete report"
}
```

## 5. Przepływ danych

### 5.1. Diagram przepływu

```
1. Klient wysyła DELETE /api/reports/{id} z JWT token
   ↓
2. Middleware Astro weryfikuje JWT i wyciąga user_id
   ↓
3. Endpoint waliduje parametr ID (Zod)
   ↓
4. Service pobiera raport z bazy na podstawie ID
   ↓
5. Service weryfikuje czy raport istnieje (404 jeśli nie)
   ↓
6. Service weryfikuje czy user_id z raportu == user_id z tokenu
   ↓
7. Service usuwa raport z bazy danych
   ↓
8. Endpoint zwraca 204 No Content (bez body)
```

### 5.2. Szczegółowy opis kroków

#### Krok 1-2: Autentykacja

Middleware Astro (`src/middleware/index.ts`) automatycznie:
- Weryfikuje token JWT z nagłówka `Authorization`
- Dodaje obiekt `user` do `context.locals`
- Dodaje klient `supabase` do `context.locals`

Jeśli token jest nieważny lub brakuje, middleware może zwrócić 401 lub przekazać request dalej z pustym `user`.

#### Krok 3: Walidacja ID

```typescript
const idSchema = z.coerce.number().int().positive();
const validationResult = idSchema.safeParse(params.id);
```

Walidacja sprawdza:
- Czy ID można skonwertować na liczbę
- Czy jest to liczba całkowita (`int`)
- Czy jest dodatnia (`positive`)

W przypadku niepowodzenia zwracany jest 400 Bad Request.

#### Krok 4-6: Weryfikacja w serwisie

Funkcja `deleteReport` w serwisie wykonuje następujące kroki:

1. **Pobranie raportu:**
   ```typescript
   const { data: report, error } = await supabase
     .from('reports')
     .select('id, user_id')
     .eq('id', reportId)
     .single();
   ```

2. **Sprawdzenie czy raport istnieje:**
   ```typescript
   if (!report || error) {
     throw new Error('REPORT_NOT_FOUND');
   }
   ```

3. **Weryfikacja autoryzacji:**
   ```typescript
   if (report.user_id !== userId) {
     throw new Error('FORBIDDEN');
   }
   ```

**Uwaga bezpieczeństwa:** Kroki 2 i 3 można połączyć, zwracając 404 w obu przypadkach, aby uniknąć ujawniania informacji o istnieniu raportów:
```typescript
if (!report || error || report.user_id !== userId) {
  throw new Error('REPORT_NOT_FOUND');
}
```

#### Krok 7: Usunięcie raportu

```typescript
const { error: deleteError } = await supabase
  .from('reports')
  .delete()
  .eq('id', reportId)
  .eq('user_id', userId); // Dodatkowe zabezpieczenie na poziomie zapytania

if (deleteError) {
  throw new Error(`Failed to delete report: ${deleteError.message}`);
}
```

**Uwaga:** Dodanie warunku `.eq('user_id', userId)` w zapytaniu DELETE zapewnia dodatkową warstwę bezpieczeństwa, nawet jeśli wcześniejsze sprawdzenie zawiedzie.

#### Krok 8: Odpowiedź

Endpoint zwraca:
```typescript
return new Response(null, { status: 204 });
```

Zgodnie ze standardem HTTP, odpowiedź 204 No Content nie zawiera body.

## 6. Względy bezpieczeństwa

### 6.1. Autentykacja i autoryzacja

**Autentykacja (Authentication):**
- **Wymagane uwierzytelnienie JWT:** Wszystkie żądania muszą zawierać ważny token JWT w nagłówku `Authorization: Bearer <token>`
- **Middleware Astro:** Automatyczna weryfikacja tokenu przez middleware przed dotarciem do endpointu
- **Early return:** Natychmiastowy zwrot 401 jeśli `context.locals.user` jest `null` lub `undefined`

**Autoryzacja (Authorization):**
- **Weryfikacja własności:** Serwis sprawdza czy `report.user_id === userId` przed usunięciem
- **Row-Level Security (RLS):** Polityki na poziomie bazy danych PostgreSQL zapewniają dodatkową warstwę ochrony
- **Wielowarstwowe zabezpieczenie:** Sprawdzenie własności zarówno w logice aplikacji, jak i w warunku DELETE query

### 6.2. Ochrona przed atakami

**Broken Access Control (OWASP A01):**
- Zawsze sprawdzamy `user_id` przed operacją DELETE
- Używamy warunku `.eq('user_id', userId)` w zapytaniu DELETE jako backup
- RLS policies w bazie danych jako ostatnia linia obrony

**Information Disclosure:**
- **Rozważenie:** Zwracanie 404 zamiast 403 dla raportów innych użytkowników
- **Zaleta:** Uniemożliwia wyliczanie ID raportów należących do innych użytkowników
- **Wada:** Mniej precyzyjna informacja zwrotna dla klienta
- **Rekomendacja:** Dla wyższego poziomu bezpieczeństwa zwracać 404 w obu przypadkach

**SQL Injection:**
- Minimalne ryzyko dzięki Supabase client
- Wszystkie parametry są automatycznie escapowane
- Walidacja ID przez Zod zapewnia dodatkową ochronę

**Idempotentność:**
- Wielokrotne wywołanie DELETE na tym samym ID nie powoduje błędu
- Drugie i kolejne wywołania zwracają 404 (raport już nie istnieje)
- Zgodne z semantyką HTTP DELETE

### 6.3. Rate Limiting (opcjonalne)

Chociaż nie jest wymagane w MVP, warto rozważyć implementację rate limiting:

```typescript
// Przykładowa implementacja:
const MAX_DELETES_PER_HOUR = 50;

// Sprawdzenie liczby usuniętych raportów w ostatniej godzinie
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
// ... logika zliczania i odmowy jeśli limit przekroczony
```

**Zalety:**
- Ochrona przed przypadkowym lub złośliwym masowym usuwaniem
- Ochrona zasobów bazy danych

**Implementacja:** Można dodać w przyszłej iteracji, jeśli będzie potrzebna.

### 6.4. Audit Trail (opcjonalne)

W przyszłości można rozważyć:
- Logowanie operacji DELETE do osobnej tabeli `audit_log`
- Przechowywanie informacji: kto, kiedy, jaki raport usunął
- Soft delete zamiast hard delete (oznaczanie jako usunięte zamiast fizycznego usunięcia)

## 7. Obsługa błędów

### 7.1. Brak autentykacji (401)

**Scenariusz:** Brak JWT token lub token nieważny

**Obsługa w endpointcie:**
```typescript
const user = context.locals.user;
if (!user) {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication required',
    }),
    { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
```

**Kiedy występuje:**
- Brak nagłówka `Authorization`
- Token JWT wygasły
- Token JWT nieprawidłowy (zmodyfikowany, błędny podpis)

### 7.2. Nieprawidłowe ID (400)

**Scenariusz:** Parametr ID nie jest dodatnią liczbą całkowitą

**Obsługa:**
```typescript
const idSchema = z.coerce.number().int().positive();
const validation = idSchema.safeParse(params.id);

if (!validation.success) {
  return new Response(
    JSON.stringify({
      error: 'Bad Request',
      message: 'Invalid report ID',
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
```

**Przykłady nieprawidłowych ID:**
- `/api/reports/abc` - nie-numeryczne
- `/api/reports/-5` - ujemne
- `/api/reports/3.14` - nie-całkowite
- `/api/reports/0` - zero

### 7.3. Raport nie istnieje (404)

**Scenariusz:** Raport o podanym ID nie istnieje w bazie danych

**Obsługa w serwisie:**
```typescript
export async function deleteReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: number
): Promise<void> {
  const { data: report, error } = await supabase
    .from('reports')
    .select('id, user_id')
    .eq('id', reportId)
    .single();
  
  if (!report || error) {
    throw new Error('REPORT_NOT_FOUND');
  }
  
  // ... reszta logiki
}
```

**Obsługa w endpointcie:**
```typescript
try {
  await deleteReport(supabase, user.id, reportId);
} catch (error) {
  if (error.message === 'REPORT_NOT_FOUND') {
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        message: 'Report not found',
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  // ... inne błędy
}
```

**Logowanie:** Optionally log attempt to delete non-existent report (może wskazywać na próby exploitacji).

### 7.4. Brak uprawnień (403)

**Scenariusz:** Raport istnieje, ale należy do innego użytkownika

**Obsługa w serwisie:**
```typescript
if (report.user_id !== userId) {
  console.warn(`User ${userId} attempted to delete report ${reportId} owned by ${report.user_id}`);
  throw new Error('FORBIDDEN');
}
```

**Obsługa w endpointcie:**
```typescript
try {
  await deleteReport(supabase, user.id, reportId);
} catch (error) {
  if (error.message === 'FORBIDDEN') {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to delete this report',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  // ... inne błędy
}
```

**Alternatywna implementacja (wyższy poziom bezpieczeństwa):**
Zwracanie 404 zamiast 403:
```typescript
if (!report || error || report.user_id !== userId) {
  throw new Error('REPORT_NOT_FOUND');
}
```

**Logowanie:** Zawsze logować próby nieautoryzowanego dostępu (potencjalne zagrożenie bezpieczeństwa).

### 7.5. Błędy bazy danych (500)

**Scenariusz:** Nieoczekiwany błąd podczas operacji na bazie danych

**Obsługa w serwisie:**
```typescript
const { error: deleteError } = await supabase
  .from('reports')
  .delete()
  .eq('id', reportId)
  .eq('user_id', userId);

if (deleteError) {
  console.error('Database error during report deletion:', deleteError);
  throw new Error(`Failed to delete report: ${deleteError.message}`);
}
```

**Obsługa w endpointcie:**
```typescript
try {
  await deleteReport(supabase, user.id, reportId);
} catch (error) {
  // ... obsługa specyficznych błędów (404, 403)
  
  // Generic database/server error
  console.error('Failed to delete report:', error);
  return new Response(
    JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to delete report',
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

**Logowanie:** Zawsze szczegółowo logować błędy 500 do konsoli (kluczowe dla debugowania).

### 7.6. Podsumowanie mapowania błędów

| Kod błędu w serwisie | HTTP Status | Komunikat użytkownika |
|----------------------|-------------|------------------------|
| `REPORT_NOT_FOUND` | 404 | Report not found |
| `FORBIDDEN` | 403 | You do not have permission to delete this report |
| Inne (nieoczekiwane) | 500 | Failed to delete report |

## 8. Rozważania dotyczące wydajności

### 8.1. Potencjalne wąskie gardła

1. **Zapytanie SELECT przed DELETE:** 
   - Wymaga dwóch operacji na bazie danych
   - Możliwa optymalizacja (patrz poniżej)

2. **Indeksy bazy danych:**
   - Primary key index na `reports.id` - bardzo szybki lookup
   - Index na `reports.user_id` (jeśli istnieje) - przyspiesza sprawdzanie własności

3. **Network latency:**
   - Połączenie z bazą danych Supabase
   - Minimalne (zazwyczaj < 50ms dla prostych operacji)

### 8.2. Strategie optymalizacji

#### Optymalizacja #1: Połączone zapytanie DELETE

Zamiast dwóch operacji (SELECT + DELETE), można wykonać tylko DELETE z warunkami:

```typescript
export async function deleteReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: number
): Promise<void> {
  const { data, error, count } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId)
    .select(); // Returns deleted rows
  
  if (error) {
    console.error('Database error during report deletion:', error);
    throw new Error(`Failed to delete report: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    // Report doesn't exist OR doesn't belong to user
    // For security: return same error for both cases
    throw new Error('REPORT_NOT_FOUND');
  }
}
```

**Zalety:**
- Tylko jedno zapytanie do bazy danych
- Szybsze wykonanie (brak round-trip)
- Atomiczność operacji

**Wady:**
- Nie można rozróżnić między "nie istnieje" a "nie należy do użytkownika"
- Mniej precyzyjna informacja zwrotna

**Rekomendacja:** Dla MVP warto użyć podejścia z dwoma zapytaniami (SELECT + DELETE) dla lepszej czytelności i debugowania. Optymalizację można wprowadzić później, jeśli będzie potrzebna.

#### Optymalizacja #2: Wykorzystanie RLS

Jeśli polityki RLS są poprawnie skonfigurowane w bazie danych:

```sql
CREATE POLICY "Users can delete own reports"
ON reports FOR DELETE
USING (auth.uid() = user_id);
```

Można uprościć logikę aplikacji:

```typescript
export async function deleteReport(
  supabase: SupabaseClient,
  reportId: number
): Promise<void> {
  // RLS automatically ensures user can only delete own reports
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);
  
  if (error) {
    // Could be "not found" or "forbidden" - RLS doesn't distinguish
    throw new Error('REPORT_NOT_FOUND');
  }
}
```

**Uwaga:** Supabase RLS działa na poziomie sesji użytkownika, więc `auth.uid()` jest automatycznie rozwiązywane na podstawie JWT tokenu.

#### Indeksy bazy danych

Sprawdzić czy istnieją odpowiednie indeksy:

```sql
-- Primary key index (automatycznie utworzony)
-- reports_pkey ON reports(id)

-- Index dla zapytań po user_id (prawdopodobnie już istnieje)
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports(user_id);

-- Composite index dla optymalizacji (opcjonalny)
CREATE INDEX IF NOT EXISTS reports_id_user_id_idx ON reports(id, user_id);
```

**Uwaga:** Composite index może przyspieszyć zapytania z warunkami na obu kolumnach, ale jest to optymalizacja zaawansowana, która może nie być potrzebna dla małych tabel.

### 8.3. Charakterystyka wydajności

**Oczekiwany czas odpowiedzi:**
- Typowy przypadek (raport istnieje i należy do użytkownika): **< 100ms**
- Raport nie istnieje: **< 50ms** (tylko SELECT)
- Błędy walidacji: **< 5ms** (brak operacji na bazie)

**Obciążenie bazy danych:**
- SELECT: 1 query, bardzo szybki (primary key lookup)
- DELETE: 1 query, bardzo szybki (primary key + user_id)
- **Razem:** 2 round-trips do bazy danych

**Skalowalność:**
- Operacja DELETE jest lekka i skaluje się bardzo dobrze
- Brak transakcji multi-row, brak locków
- Można obsłużyć tysiące requestów na minutę bez problemu

### 8.4. Monitoring

Warto monitorować:
- Czas odpowiedzi endpointu (p50, p95, p99)
- Liczba błędów 404 vs 403 (wykrywanie prób exploitacji)
- Liczba operacji DELETE per użytkownik per godzinę
- Błędy 500 (wskazują problemy z bazą danych)

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie walidatora ID (opcjonalne)

Jeśli validator ID nie jest jeszcze wspólny dla wszystkich endpointów:

**Rozważenie:** Utworzenie wspólnego walidatora w `src/lib/reports/report.validators.ts`

```typescript
// src/lib/reports/report.validators.ts
import { z } from 'zod';

export const reportIdSchema = z.coerce.number().int().positive();
```

**Alternatywnie:** Zdefiniowanie bezpośrednio w pliku endpointu (tak jak w `symptoms/[id].ts`).

**Rekomendacja:** Dla MVP wystarczy definicja lokalna w pliku endpointu.

### Krok 2: Implementacja funkcji w serwisie

**Plik:** `src/lib/services/report.service.ts`

**Dodanie nowej funkcji:**

```typescript
/**
 * Deletes a specific report for a user.
 * Performs authorization checks to ensure the user owns the report before deletion.
 * 
 * @param supabase - Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param reportId - The ID of the report to delete
 * @throws Error with specific message codes:
 *   - 'REPORT_NOT_FOUND' - Report doesn't exist
 *   - 'FORBIDDEN' - Report belongs to another user
 *   - Other errors for database failures
 */
export async function deleteReport(
	supabase: SupabaseClient,
	userId: string,
	reportId: number,
): Promise<void> {
	// 1. Fetch the report to verify ownership
	const { data: report, error: fetchError } = await supabase
		.from('reports')
		.select('id, user_id')
		.eq('id', reportId)
		.single();

	// 2. Check if report exists
	if (fetchError || !report) {
		console.log(`Report ${reportId} not found`);
		throw new Error('REPORT_NOT_FOUND');
	}

	// 3. Verify ownership (authorization)
	if (report.user_id !== userId) {
		console.warn(
			`User ${userId} attempted to delete report ${reportId} owned by ${report.user_id}`,
		);
		throw new Error('FORBIDDEN');
	}

	// 4. Delete the report
	const { error: deleteError } = await supabase
		.from('reports')
		.delete()
		.eq('id', reportId)
		.eq('user_id', userId); // Additional safety check at query level

	if (deleteError) {
		console.error('Failed to delete report:', deleteError);
		throw new Error(`Failed to delete report: ${deleteError.message}`);
	}

	console.log(`Successfully deleted report ${reportId} for user ${userId}`);
}
```

**Alternatywna implementacja (wyższy poziom bezpieczeństwa):**

Zwracanie tego samego błędu dla "nie istnieje" i "nie należy do użytkownika":

```typescript
export async function deleteReport(
	supabase: SupabaseClient,
	userId: string,
	reportId: number,
): Promise<void> {
	const { data: report, error: fetchError } = await supabase
		.from('reports')
		.select('id, user_id')
		.eq('id', reportId)
		.single();

	// Combined check: doesn't exist OR doesn't belong to user
	if (fetchError || !report || report.user_id !== userId) {
		throw new Error('REPORT_NOT_FOUND');
	}

	const { error: deleteError } = await supabase
		.from('reports')
		.delete()
		.eq('id', reportId)
		.eq('user_id', userId);

	if (deleteError) {
		console.error('Failed to delete report:', deleteError);
		throw new Error(`Failed to delete report: ${deleteError.message}`);
	}

	console.log(`Successfully deleted report ${reportId} for user ${userId}`);
}
```

**Wybór implementacji:** Zależy od wymagań bezpieczeństwa projektu. Rekomendacja: pierwsza wersja (rozróżnianie 403/404) dla lepszej UX podczas development, druga wersja dla production.

### Krok 3: Utworzenie pliku endpointu

**Utworzenie pliku:**
```
src/pages/api/reports/[id].ts
```

**Zawartość:**

```typescript
import type { APIContext } from 'astro';
import { z } from 'zod';
import { deleteReport } from '@/lib/services/report.service';

export const prerender = false;

/**
 * Schema for validating report ID from URL params.
 * Ensures ID is a positive integer.
 */
const reportIdSchema = z.coerce.number().int().positive();

/**
 * DELETE /api/reports/{id}
 * 
 * Deletes a specific report for the authenticated user.
 * 
 * URL Parameters:
 * - id: The ID of the report to delete (must be a positive integer)
 * 
 * Response (204 No Content):
 * - Success: Empty response body
 * 
 * Error Responses:
 * - 400: Bad Request - Invalid report ID
 * - 401: Unauthorized - Not authenticated
 * - 403: Forbidden - Report belongs to another user
 * - 404: Not Found - Report doesn't exist
 * - 500: Internal Server Error - Database error
 */
export async function DELETE({ params, locals }: APIContext): Promise<Response> {
	// 1. Check authentication - early return if not authenticated
	const user = locals.user;
	if (!user) {
		return new Response(
			JSON.stringify({
				error: 'Unauthorized',
				message: 'Authentication required',
			}),
			{ 
				status: 401, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	}

	// 2. Validate report ID - early return if invalid
	const validation = reportIdSchema.safeParse(params.id);
	if (!validation.success) {
		return new Response(
			JSON.stringify({
				error: 'Bad Request',
				message: 'Invalid report ID',
			}),
			{ 
				status: 400, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	}

	const reportId = validation.data;
	const supabase = locals.supabase;

	// 3. Delete report with comprehensive error handling
	try {
		await deleteReport(supabase, user.id, reportId);

		// 4. Success: return 204 No Content
		return new Response(null, { status: 204 });

	} catch (error) {
		// Handle specific error types
		if (error instanceof Error) {
			// Report not found
			if (error.message === 'REPORT_NOT_FOUND') {
				return new Response(
					JSON.stringify({
						error: 'Not Found',
						message: 'Report not found',
					}),
					{ 
						status: 404, 
						headers: { 'Content-Type': 'application/json' } 
					}
				);
			}

			// Forbidden - report belongs to another user
			if (error.message === 'FORBIDDEN') {
				return new Response(
					JSON.stringify({
						error: 'Forbidden',
						message: 'You do not have permission to delete this report',
					}),
					{ 
						status: 403, 
						headers: { 'Content-Type': 'application/json' } 
					}
				);
			}
		}

		// Generic server error
		console.error('Failed to delete report:', error);
		return new Response(
			JSON.stringify({
				error: 'Internal Server Error',
				message: 'Failed to delete report',
			}),
			{ 
				status: 500, 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
	}
}
```

**Uwagi do implementacji:**
- **Early returns:** Wszystkie błędy są obsługiwane przez natychmiastowy zwrot (guard clauses)
- **Typed errors:** Wykorzystanie specyficznych komunikatów błędów z serwisu
- **Logging:** Logowanie tylko błędów 500 (nieoczekiwanych)
- **Content-Type:** Wszystkie odpowiedzi JSON mają odpowiedni header
- **204 No Content:** Sukces zwraca `null` jako body

### Krok 4: Testowanie

#### 4.1. Testy manualne

**Test 1: Pomyślne usunięcie raportu**
```bash
# Utworzenie raportu (POST)
curl -X POST http://localhost:4321/api/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"period_type": "week"}'
# Zapisz ID raportu z odpowiedzi, np. 123

# Usunięcie raportu
curl -X DELETE http://localhost:4321/api/reports/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 204 No Content
```

**Test 2: Brak autentykacji (401)**
```bash
curl -X DELETE http://localhost:4321/api/reports/123 -v
# Oczekiwany wynik: HTTP 401 Unauthorized
```

**Test 3: Nieprawidłowe ID (400)**
```bash
curl -X DELETE http://localhost:4321/api/reports/abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 400 Bad Request

curl -X DELETE http://localhost:4321/api/reports/-5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 400 Bad Request
```

**Test 4: Raport nie istnieje (404)**
```bash
curl -X DELETE http://localhost:4321/api/reports/99999 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 404 Not Found
```

**Test 5: Raport należy do innego użytkownika (403)**
```bash
# Zaloguj się jako user A i utwórz raport
# Zapisz ID raportu
# Zaloguj się jako user B i spróbuj usunąć raport user A
curl -X DELETE http://localhost:4321/api/reports/123 \
  -H "Authorization: Bearer USER_B_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 403 Forbidden
# LUB HTTP 404 Not Found (jeśli używamy implementacji z wyższym poziomem bezpieczeństwa)
```

**Test 6: Idempotentność**
```bash
# Usuń raport pierwszy raz
curl -X DELETE http://localhost:4321/api/reports/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 204 No Content

# Usuń ten sam raport drugi raz
curl -X DELETE http://localhost:4321/api/reports/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
# Oczekiwany wynik: HTTP 404 Not Found
```

#### 4.2. Testy jednostkowe (opcjonalne dla MVP)

Jeśli projekt używa frameworka testowego (np. Vitest):

```typescript
// tests/services/report.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { deleteReport } from '@/lib/services/report.service';

describe('deleteReport', () => {
  it('should successfully delete a report when user is owner', async () => {
    // Mock Supabase client
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 1, user_id: 'user-123' },
              error: null,
            })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null })),
          })),
        })),
      })),
    };

    await expect(
      deleteReport(mockSupabase as any, 'user-123', 1)
    ).resolves.not.toThrow();
  });

  it('should throw REPORT_NOT_FOUND when report does not exist', async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: 'Not found' },
            })),
          })),
        })),
      })),
    };

    await expect(
      deleteReport(mockSupabase as any, 'user-123', 999)
    ).rejects.toThrow('REPORT_NOT_FOUND');
  });

  it('should throw FORBIDDEN when user is not owner', async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 1, user_id: 'user-456' }, // Different user
              error: null,
            })),
          })),
        })),
      })),
    };

    await expect(
      deleteReport(mockSupabase as any, 'user-123', 1)
    ).rejects.toThrow('FORBIDDEN');
  });
});
```

#### 4.3. Weryfikacja w bazie danych

Po każdym teście usunięcia, sprawdzić w bazie danych Supabase:

```sql
-- Sprawdź czy raport został usunięty
SELECT * FROM reports WHERE id = 123;
-- Powinno zwrócić 0 wyników

-- Sprawdź wszystkie raporty użytkownika
SELECT * FROM reports WHERE user_id = 'YOUR_USER_ID';
```

### Krok 5: Dokumentacja i finalizacja

#### 5.1. Aktualizacja dokumentacji API

W pliku `.ai/api-plan.md`, sekcja `DELETE /api/reports/{id}`, dodać:

```markdown
> **Implementation Status**: ✅ `DELETE /api/reports/{id}` implemented (2025-10-31)
```

#### 5.2. Aktualizacja typu response w dokumentacji (jeśli potrzebne)

Upewnić się, że dokumentacja jasno wskazuje na odpowiedź 204 No Content (bez body).

#### 5.3. Code review checklist

- [ ] Funkcja `deleteReport` poprawnie zaimplementowana w serwisie
- [ ] Endpoint zwraca wszystkie wymagane kody statusu (204, 400, 401, 403, 404, 500)
- [ ] Walidacja ID działa poprawnie
- [ ] Sprawdzanie autentykacji i autoryzacji
- [ ] Odpowiednie logowanie błędów
- [ ] Kod zgodny z wytycznymi projektu (early returns, guard clauses)
- [ ] Brak hardcoded wartości
- [ ] Testy manualne zakończone sukcesem

#### 5.4. Linter i formatowanie

```bash
# Uruchomienie lintera
npm run lint

# Naprawienie błędów lintera (jeśli są)
npm run lint:fix
```

### Krok 6: Deployment

#### 6.1. Deployment do środowiska testowego

```bash
# Build aplikacji
npm run build

# Weryfikacja builda
npm run preview

# Deployment (zgodnie z konfiguracją projektu)
# np. git push, który triggeruje GitHub Actions
```

#### 6.2. Weryfikacja w środowisku produkcyjnym

Po deployment, powtórzyć kluczowe testy manualne na środowisku produkcyjnym.

#### 6.3. Monitoring

Przez pierwsze 24-48 godzin po deployment monitorować:
- Logi serwera (błędy 500)
- Wskaźniki użycia endpointu
- Nietypowe wzorce (np. wiele błędów 403)

### Krok 7: Opcjonalne usprawnienia (post-MVP)

Po wdrożeniu i stabilizacji MVP, można rozważyć:

#### 7.1. Soft Delete

Zamiast fizycznego usuwania, oznaczanie jako usunięte:

```sql
-- Dodanie kolumny
ALTER TABLE reports ADD COLUMN deleted_at TIMESTAMPTZ;

-- Modyfikacja zapytań
-- SELECT: WHERE deleted_at IS NULL
-- DELETE: UPDATE ... SET deleted_at = NOW()
```

**Zalety:**
- Możliwość odzyskania przypadkowo usuniętych raportów
- Audit trail
- Zgodność z GDPR (można później permanentnie usunąć)

#### 7.2. Batch Delete

Endpoint do usuwania wielu raportów naraz:

```
DELETE /api/reports
Body: { "ids": [1, 2, 3] }
```

#### 7.3. Rate Limiting

Implementacja limitu operacji DELETE per użytkownik per okres czasu.

#### 7.4. Webhook / Event

Emitowanie eventu po usunięciu raportu (np. dla analytics, notyfikacji).

#### 7.5. Confirmation Token

Dla krytycznych operacji, wymaganie dodatkowego tokenu potwierdzenia:

```
DELETE /api/reports/{id}?confirm_token=abc123
```

Token generowany przez oddzielny endpoint `POST /api/reports/{id}/delete-token`.

## 10. Podsumowanie

Endpoint `DELETE /api/reports/{id}` jest prostą, ale kluczową operacją CRUD, która pozwala użytkownikom zarządzać historią swoich raportów. Implementacja skupia się na:

1. **Bezpieczeństwie:** Ścisła kontrola autentykacji i autoryzacji
2. **Prostocie:** Minimalistyczna implementacja zgodna z REST API best practices
3. **Niezawodności:** Comprehensive error handling dla wszystkich scenariuszy
4. **Wydajności:** Optymalne zapytania do bazy danych z wykorzystaniem indeksów

**Kluczowe aspekty techniczne:**
- Dwa zapytania do bazy: SELECT (weryfikacja) + DELETE
- Walidacja ID przez Zod schema
- Obsługa 6 różnych kodów statusu HTTP
- Idempotentność operacji (wielokrotne wywołanie nie powoduje błędu)

**Compliance:**
- Zgodność z GDPR (użytkownik ma prawo usuwać swoje dane)
- Zgodność z RESTful API conventions
- Zgodność z istniejącymi wzorcami w projekcie

**Maintenance:**
- Jasny, czytelny kod z komentarzami
- Szczegółowe logowanie błędów
- Łatwe do przetestowania i debugowania

Plan można bezpośrednio wykorzystać jako przewodnik implementacji, a następnie jako dokumentację referencyjną dla zespołu.

