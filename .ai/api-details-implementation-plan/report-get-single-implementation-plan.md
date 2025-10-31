# API Endpoint Implementation Plan: GET /api/reports/{id}

## 1. Przegląd punktu końcowego

Endpoint `GET /api/reports/{id}` służy do pobierania pojedynczego raportu analizy symptomów na podstawie jego unikalnego identyfikatora. Endpoint zwraca pełne dane raportu wyłącznie dla uwierzytelnionego użytkownika, który jest właścicielem tego raportu. Jest to operacja odczytu (read-only), która nie modyfikuje stanu serwera.

**Główne funkcjonalności:**
- Pobranie pojedynczego raportu po ID
- Weryfikacja uwierzytelnienia użytkownika
- Sprawdzenie autoryzacji (czy raport należy do użytkownika)
- Zwrócenie pełnych danych raportu w formacie JSON

## 2. Szczegóły żądania

### Metoda HTTP
`GET`

### Struktura URL
```
GET /api/reports/{id}
```

### Parametry

#### URL Parameters (wymagane):
- **id** (number):
  - Typ: number (integer, positive)
  - Opis: Unikalny identyfikator raportu do pobrania
  - Walidacja: Musi być liczbą całkowitą dodatnią
  - Przykład: `/api/reports/42`

#### Headers:
- **Authorization**: Bearer token (JWT) - automatycznie obsługiwany przez middleware Astro
- **Content-Type**: application/json (dla odpowiedzi)

#### Request Body:
Brak (endpoint GET nie przyjmuje body)

### Kontekst (z Astro locals):
- **user**: Obiekt uwierzytelnionego użytkownika (z JWT)
- **supabase**: Instancja klienta Supabase z kontekstem użytkownika

## 3. Wykorzystywane typy

### DTOs:
```typescript
// Z src/types.ts

/**
 * Data Transfer Object dla pojedynczego raportu w odpowiedzi API.
 * Zawiera wszystkie pola z tabeli reports.
 */
export type ReportDto = Report;

/**
 * Typ bazowy reprezentujący rekord raportu z bazy danych.
 */
export type Report = Database['public']['Tables']['reports']['Row'];
// Struktura:
// {
//   id: number;
//   user_id: string;
//   created_at: string;
//   content: string;
//   period_start: string;
//   period_end: string;
//   period_type: string;
// }
```

### Validation Schemas:
```typescript
// Nowy schemat walidacji dla parametru ID (dodać do report.validators.ts)
import { z } from 'zod';

/**
 * Schemat walidacji dla parametru ID raportu w URL.
 * Konwertuje string z URL na number i waliduje jako dodatnią liczbę całkowitą.
 */
export const reportIdSchema = z.coerce.number().int().positive({
  message: 'Report ID must be a positive integer',
});
```

### Command Models:
Brak - endpoint GET nie wymaga Command Model (brak body request)

## 4. Szczegóły odpowiedzi

### Sukces (200 OK)
```typescript
// Response Type: ReportDto
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-10-31T12:00:00Z",
  "content": "# Symptom Analysis Report\n\n## Current Period Summary...",
  "period_start": "2025-10-01T00:00:00Z",
  "period_end": "2025-10-31T23:59:59Z",
  "period_type": "month"
}
```

**Status**: `200 OK`
**Headers**: `Content-Type: application/json`

### Błędy

#### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid report ID format",
  "details": {
    "field": "id",
    "issue": "Report ID must be a positive integer"
  }
}
```
**Przyczyny**:
- Parametr `id` nie jest liczbą
- Parametr `id` jest ujemny lub zerem
- Parametr `id` nie jest liczbą całkowitą

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```
**Przyczyny**:
- Brak tokenu JWT w nagłówku Authorization
- Token JWT jest nieprawidłowy lub wygasły
- Brak obiektu `user` w `context.locals`

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Access denied. You do not have permission to view this report."
}
```
**Przyczyny**:
- Raport istnieje, ale należy do innego użytkownika
- Użytkownik próbuje uzyskać dostęp do raportu, którego nie jest właścicielem

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Report not found"
}
```
**Przyczyny**:
- Raport o podanym ID nie istnieje w bazie danych
- ID przekracza zakres dostępnych raportów

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to retrieve report"
}
```
**Przyczyny**:
- Błąd połączenia z bazą danych Supabase
- Nieoczekiwany błąd w warstwie service
- Błędy runtime lub nieprzewidziane wyjątki

## 5. Przepływ danych

### Diagram przepływu:
```
1. Request: GET /api/reports/42
   ↓
2. Middleware (Astro)
   - Weryfikacja JWT token
   - Wstrzyknięcie user i supabase do context.locals
   ↓
3. API Route Handler (/api/reports/[id].ts)
   ↓
4. Walidacja parametru ID (Zod schema)
   ├─ Niepoprawne → 400 Bad Request
   └─ Poprawne → kontynuuj
   ↓
5. Sprawdzenie uwierzytelnienia
   ├─ Brak user → 401 Unauthorized
   └─ User OK → kontynuuj
   ↓
6. Service Layer (report.service.ts → getReportById)
   - Query do Supabase: SELECT * FROM reports WHERE id = ? AND user_id = ?
   ↓
7. Weryfikacja autoryzacji i istnienia
   ├─ Raport nie istnieje → 404 Not Found
   ├─ Raport należy do innego user → 403 Forbidden
   └─ Raport znaleziony i należy do user → kontynuuj
   ↓
8. Zwrócenie raportu jako JSON
   - Status: 200 OK
   - Body: ReportDto
```

### Szczegółowy opis kroków:

#### Krok 1-2: Middleware i uwierzytelnienie
- Astro middleware automatycznie weryfikuje JWT token
- Tworzy instancję Supabase client z kontekstem użytkownika
- Wstrzykuje `user` i `supabase` do `context.locals`

#### Krok 3: API Route Handler
- Pobiera parametr `id` z `context.params`
- Obsługuje główną logikę endpointu
- Koordynuje między walidacją, service layer i odpowiedzią

#### Krok 4: Walidacja ID
- Używa `reportIdSchema.safeParse()` do walidacji parametru
- Konwertuje string z URL na number
- Sprawdza, czy jest dodatnią liczbą całkowitą

#### Krok 5: Sprawdzenie uwierzytelnienia
- Weryfikuje obecność `context.locals.user`
- Early return z 401 jeśli użytkownik nie jest uwierzytelniony

#### Krok 6: Service Layer
- Wywołanie funkcji `getReportById(supabase, reportId, userId)`
- Query do bazy danych z warunkami:
  - `id = reportId`
  - `user_id = userId` (automatyczna autoryzacja)
- Supabase automatycznie sanitize parametry (ochrona przed SQL injection)

#### Krok 7: Weryfikacja wyniku
- Jeśli zwrócono `null` → raport nie istnieje lub nie należy do użytkownika
- Rozróżnienie między 404 a 403 wymaga dodatkowego query (sprawdzenie czy raport w ogóle istnieje)

#### Krok 8: Zwrócenie odpowiedzi
- Serializacja obiektu Report do JSON
- Ustawienie odpowiednich nagłówków (Content-Type)
- Zwrócenie Response z statusem 200

### Interakcje z zewnętrznymi usługami:

#### Supabase (PostgreSQL):
```sql
-- Query wykonywane w service layer
SELECT 
  id, 
  user_id, 
  created_at, 
  content, 
  period_start, 
  period_end, 
  period_type
FROM reports
WHERE id = $1 AND user_id = $2
LIMIT 1;
```

**Indeksy w bazie danych**:
- Primary key na `id` (automatyczny indeks)
- Sugerowany composite index: `(user_id, id)` dla optymalizacji query

## 6. Względy bezpieczeństwa

### Uwierzytelnienie (Authentication)
- **Mechanizm**: JWT Bearer token w nagłówku Authorization
- **Weryfikacja**: Automatyczna przez middleware Astro i Supabase
- **Kontrola**: Early return z 401 Unauthorized jeśli `context.locals.user` jest undefined
- **Token refresh**: Obsługiwany automatycznie przez Supabase client

### Autoryzacja (Authorization)
- **Zasada**: Użytkownik może zobaczyć tylko swoje raporty
- **Implementacja**: 
  - Service query zawiera warunek `WHERE user_id = :userId`
  - Rozróżnienie między 403 Forbidden (raport istnieje, ale nie należy do użytkownika) i 404 Not Found (raport nie istnieje)
- **Weryfikacja własności**: Automatyczna przez warunek SQL w query

### Walidacja danych wejściowych
- **Parametr ID**:
  - Zod schema: `z.coerce.number().int().positive()`
  - Konwersja typu: string → number (bezpieczna z Zod)
  - Walidacja zakresu: musi być dodatnią liczbą całkowitą
  - Ochrona przed: SQL injection, type coercion attacks

### Ochrona przed atakami

#### SQL Injection
- **Mitygacja**: Supabase automatycznie używa prepared statements
- **Dodatkowa ochrona**: Walidacja typu przez Zod przed przekazaniem do query

#### Information Disclosure
- **Problem**: Nie ujawniać czy raport istnieje dla innych użytkowników
- **Rozwiązanie**: 
  - Opcja A (zgodna ze specyfikacją): Zwróć 403 Forbidden dla raportów innych użytkowników
  - Opcja B (lepsza bezpieczeństwo): Zwróć 404 Not Found dla wszystkich nieautoryzowanych raportów
- **Implementacja**: Używamy Opcji A zgodnie ze specyfikacją API

#### Insecure Direct Object Reference (IDOR)
- **Zagrożenie**: Użytkownik może odgadywać ID raportów innych użytkowników
- **Mitygacja**: Weryfikacja `user_id` w każdym query
- **Dodatkowa ochrona**: Rozważyć UUID zamiast sequential ID (przyszła iteracja)

### Rate Limiting
- **Rekomendacja**: Implementacja rate limiting na poziomie middleware lub API gateway
- **Sugerowane limity**: 
  - 100 requests/minute per user
  - 1000 requests/hour per user
- **Scope**: Całość API, nie tylko ten endpoint

### Logging i Monitoring
- **Co logować**:
  - Wszystkie błędy 500 (z stack trace)
  - Próby nieautoryzowanego dostępu (401, 403)
  - ID użytkownika i ID raportu dla celów audytu
- **Czego NIE logować**:
  - Zawartość raportu (może zawierać dane medyczne)
  - Pełne dane użytkownika
  - JWT tokens

### Zgodność z RODO/GDPR
- **Dane osobowe**: Raporty zawierają dane medyczne (szczególna kategoria danych)
- **Szyfrowanie**: 
  - W tranzycie: HTTPS (obowiązkowe)
  - W spoczynku: Supabase używa encryption at rest
- **Usuwanie danych**: Cascade delete z tabeli `profiles` (ON DELETE CASCADE)

## 7. Obsługa błędów

### Hierarchia obsługi błędów (Early returns pattern):

```typescript
// 1. Walidacja ID - najwcześniejsza weryfikacja
if (!idValidation.success) {
  return 400 Bad Request
}

// 2. Uwierzytelnienie - guard clause
if (!user) {
  return 401 Unauthorized
}

// 3. Service layer - try/catch
try {
  const report = await getReportById(...)
  
  // 4. Sprawdzenie istnienia i autoryzacji
  if (!report) {
    // Dodatkowe query aby rozróżnić 403 vs 404
    const reportExists = await checkReportExists(reportId)
    if (reportExists) {
      return 403 Forbidden
    } else {
      return 404 Not Found
    }
  }
  
  // 5. Happy path - zwrócenie raportu
  return 200 OK with report
  
} catch (error) {
  // 6. Obsługa błędów bazy danych i nieoczekiwanych błędów
  console.error('Error retrieving report:', error)
  return 500 Internal Server Error
}
```

### Szczegółowa specyfikacja błędów:

#### 1. Błąd walidacji ID (400 Bad Request)
```typescript
// Trigger: Parametr id nie przeszedł walidacji Zod
// Przykłady: id="abc", id="-5", id="3.14"

const idValidation = reportIdSchema.safeParse(params.id);
if (!idValidation.success) {
  const errorMessage = idValidation.error.errors[0]?.message || 
    'Invalid report ID format';
  
  return new Response(
    JSON.stringify({
      error: 'Bad Request',
      message: errorMessage,
      details: idValidation.error.flatten(),
    }),
    { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
```

#### 2. Brak uwierzytelnienia (401 Unauthorized)
```typescript
// Trigger: context.locals.user jest undefined
// Przyczyny: brak token, nieprawidłowy token, token wygasł

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

#### 3. Brak uprawnień (403 Forbidden)
```typescript
// Trigger: Raport istnieje, ale user_id nie pasuje
// Wymaga dodatkowego query do rozróżnienia od 404

// W service layer:
const report = await getReportById(supabase, reportId, userId);

if (!report) {
  // Sprawdź czy raport w ogóle istnieje
  const { data: existingReport } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();
  
  if (existingReport) {
    // Raport istnieje, ale nie należy do tego użytkownika
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Access denied. You do not have permission to view this report.',
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // Raport nie istnieje w ogóle - przechodzimy do 404
}
```

#### 4. Raport nie znaleziony (404 Not Found)
```typescript
// Trigger: Raport o podanym ID nie istnieje w bazie danych
// Lub: Po wykluczeniu 403, raport po prostu nie istnieje

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
```

#### 5. Błąd serwera (500 Internal Server Error)
```typescript
// Trigger: Błędy bazy danych, nieoczekiwane wyjątki

catch (error) {
  console.error('Failed to retrieve report:', {
    reportId,
    userId: user.id,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
  
  return new Response(
    JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to retrieve report',
    }),
    { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
```

### Logowanie błędów:

```typescript
// Console.error dla wszystkich błędów z kontekstem
console.error('Report retrieval error:', {
  reportId: number,
  userId: string,
  errorType: string,
  message: string,
  timestamp: new Date().toISOString(),
  // NIE logować: zawartości raportu, pełnych danych użytkownika
});
```

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła:

#### 1. Query do bazy danych
- **Problem**: Każde żądanie wykonuje query SELECT do PostgreSQL
- **Czas odpowiedzi**: ~10-50ms (zależnie od lokalizacji i obciążenia)
- **Mitygacja**:
  - Indeksowanie: Composite index na `(user_id, id)`
  - Connection pooling: Supabase automatycznie zarządza pulą połączeń

#### 2. Rozmiar zawartości raportu
- **Problem**: Pole `content` może zawierać długie raporty tekstowe (10-100KB)
- **Transfer**: Może wpłynąć na czas odpowiedzi przy wolnym łączu
- **Mitygacja**:
  - Compression: Włączyć gzip/brotli compression na poziomie serwera
  - Rozważyć pagination lub truncation dla bardzo długich raportów (przyszła iteracja)

#### 3. Serializacja JSON
- **Problem**: Konwersja obiektu Report do JSON
- **Czas**: Zazwyczaj <1ms, ale może wzrosnąć dla dużych raportów
- **Mitygacja**: V8 engine w Node.js jest bardzo szybki, brak optymalizacji na tym etapie

### Strategie optymalizacji:

#### Caching
**Nie zalecane dla tego endpointu**, ponieważ:
- Dane są specyficzne dla użytkownika (trudne do cache'owania bezpiecznie)
- Raporty są generowane rzadko i czytane często (ale private per user)
- Ryzyko ujawnienia danych między użytkownikami

Jeśli caching byłby rozważany:
```typescript
// Przykład z Redis (nie implementować na tym etapie)
const cacheKey = `report:${userId}:${reportId}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
// ... fetch from DB and cache with TTL
```

#### Database Indexing
```sql
-- Rekomendowany composite index dla optymalnej wydajności
CREATE INDEX idx_reports_user_id_id ON reports(user_id, id);

-- Wyjaśnienie:
-- - user_id jako pierwszy (wyższa selektywność dla query)
-- - id jako drugi (unique constraint dla danego user_id)
-- - Pozwala na index-only scan dla tego query
```

#### Query Optimization
```typescript
// Dobre: Pobierz tylko potrzebne kolumny (jeśli DTO nie wymaga wszystkich)
.select('id, user_id, created_at, period_start, period_end, period_type')

// Dla pełnego raportu (zgodnie ze specyfikacją):
.select('*') // lub explicit wszystkie kolumny
```

#### Connection Management
- Supabase automatycznie zarządza connection pooling
- Brak potrzeby ręcznej optymalizacji na tym etapie
- Monitoring: Obserwować metryki połączeń w Supabase Dashboard

### Metryki wydajności (cele):

- **Czas odpowiedzi (P95)**: < 100ms dla raportów o standardowym rozmiarze
- **Czas odpowiedzi (P99)**: < 200ms
- **Throughput**: > 100 requests/second per instance
- **Database query time**: < 50ms

### Monitoring i Alerting:

```typescript
// Przykład instrumentacji (opcjonalne, dla production)
const startTime = performance.now();

// ... execute query ...

const queryTime = performance.now() - startTime;
console.log(`Report retrieval took ${queryTime}ms`, {
  reportId,
  userId,
  queryTime,
});

// Alert jeśli > 200ms
if (queryTime > 200) {
  console.warn('Slow report retrieval detected', { reportId, queryTime });
}
```

## 9. Etapy wdrożenia

### Krok 1: Rozszerzenie validation schema
**Plik**: `src/lib/reports/report.validators.ts`

**Akcja**: Dodanie nowego schematu walidacji dla parametru ID

```typescript
/**
 * Zod schema for validating report ID URL parameter.
 * Coerces string from URL to number and validates as positive integer.
 */
export const reportIdSchema = z.coerce.number().int().positive({
  message: 'Report ID must be a positive integer',
});
```

**Testy**:
- ✓ Poprawne ID: "42" → 42
- ✗ Niepoprawne: "abc", "-1", "3.14", "0"

---

### Krok 2: Dodanie funkcji service do pobierania raportu
**Plik**: `src/lib/services/report.service.ts`

**Akcja**: Implementacja dwóch funkcji pomocniczych

#### Funkcja 1: `getReportById`
```typescript
/**
 * Retrieves a single report by ID for a specific user.
 * Includes authorization check by filtering on user_id.
 *
 * @param supabase - Supabase client instance
 * @param reportId - The ID of the report to retrieve
 * @param userId - The ID of the authenticated user
 * @returns The report if found and owned by user, null otherwise
 * @throws Error if database query fails
 */
export async function getReportById(
  supabase: SupabaseClient,
  reportId: number,
  userId: string,
): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single();

  if (error) {
    // Supabase returns PGRST116 error for not found
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Failed to fetch report:', error);
    throw new Error(`Failed to fetch report: ${error.message}`);
  }

  return data;
}
```

#### Funkcja 2: `checkReportExists` (dla rozróżnienia 403 vs 404)
```typescript
/**
 * Checks if a report exists in the database (regardless of ownership).
 * Used to differentiate between 403 Forbidden and 404 Not Found.
 *
 * @param supabase - Supabase client instance
 * @param reportId - The ID of the report to check
 * @returns True if report exists, false otherwise
 * @throws Error if database query fails
 */
export async function checkReportExists(
  supabase: SupabaseClient,
  reportId: number,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();

  if (error) {
    // PGRST116 means not found, which is expected
    if (error.code === 'PGRST116') {
      return false;
    }
    console.error('Failed to check report existence:', error);
    throw new Error(`Failed to check report existence: ${error.message}`);
  }

  return !!data;
}
```

**Testy**:
- ✓ Raport istnieje i należy do użytkownika → zwrócony Report
- ✓ Raport istnieje, ale należy do innego → null
- ✓ Raport nie istnieje → null
- ✗ Błąd bazy danych → throw Error

---

### Krok 3: Utworzenie API route handler
**Plik**: `src/pages/api/reports/[id].ts`

**Akcja**: Implementacja endpointu GET z pełną obsługą błędów

```typescript
import type { APIRoute } from 'astro';
import { reportIdSchema } from '@/lib/reports/report.validators';
import { getReportById, checkReportExists } from '@/lib/services/report.service';

export const prerender = false;

/**
 * GET /api/reports/{id}
 * 
 * Retrieves a specific report by ID for the authenticated user.
 * 
 * URL Parameters:
 * - id (number, required): The ID of the report to retrieve
 * 
 * Response (200 OK):
 * {
 *   "id": number,
 *   "user_id": string,
 *   "created_at": string,
 *   "content": string,
 *   "period_start": string,
 *   "period_end": string,
 *   "period_type": string
 * }
 * 
 * Error Responses:
 * - 400: Bad Request - Invalid ID format
 * - 401: Unauthorized - Missing or invalid JWT
 * - 403: Forbidden - Report belongs to another user
 * - 404: Not Found - Report does not exist
 * - 500: Internal Server Error - Unexpected error
 */
export const GET: APIRoute = async (context) => {
  // 1. Validate ID parameter - early return if invalid
  const idValidation = reportIdSchema.safeParse(context.params.id);
  
  if (!idValidation.success) {
    const errorMessage = idValidation.error.errors[0]?.message || 
      'Invalid report ID format';
    
    return new Response(
      JSON.stringify({
        error: 'Bad Request',
        message: errorMessage,
        details: idValidation.error.flatten(),
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  const reportId = idValidation.data;
  
  // 2. Check authentication - early return if not authenticated
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
  
  const supabase = context.locals.supabase;
  
  // 3. Retrieve report from database with error handling
  try {
    const report = await getReportById(supabase, reportId, user.id);
    
    // 4. Handle not found case - distinguish between 403 and 404
    if (!report) {
      // Check if report exists at all (to differentiate 403 from 404)
      const reportExists = await checkReportExists(supabase, reportId);
      
      if (reportExists) {
        // Report exists but belongs to another user
        return new Response(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Access denied. You do not have permission to view this report.',
          }),
          { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      } else {
        // Report does not exist at all
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
    }
    
    // 5. Happy path - return the report
    return new Response(
      JSON.stringify(report),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    // 6. Handle unexpected errors
    console.error('Failed to retrieve report:', {
      reportId,
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to retrieve report',
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
```

**Kluczowe punkty implementacji**:
- Early returns dla walidacji i uwierzytelnienia
- Rozróżnienie między 403 Forbidden i 404 Not Found
- Comprehensive error logging z kontekstem
- Spójne formatowanie odpowiedzi JSON

---

### Krok 4: Dodanie indeksu w bazie danych (opcjonalne, ale zalecane)
**Plik**: `supabase/migrations/YYYYMMDDHHMMSS_add_reports_index.sql`

**Akcja**: Utworzenie composite index dla optymalizacji query

```sql
-- Add composite index on (user_id, id) for optimal query performance
-- This index will be used by the getReportById query which filters on both columns
CREATE INDEX IF NOT EXISTS idx_reports_user_id_id 
ON public.reports (user_id, id);

COMMENT ON INDEX idx_reports_user_id_id IS 
'Composite index for efficient report retrieval filtered by user_id and id';
```

**Weryfikacja**:
```sql
-- Sprawdź plan wykonania query
EXPLAIN ANALYZE 
SELECT * FROM reports 
WHERE user_id = 'test-user-id' AND id = 1;

-- Oczekiwany wynik: Index Scan using idx_reports_user_id_id
```

---

### Krok 5: Testowanie endpointu

#### 5.1. Testy jednostkowe (unit tests)
**Plik**: `src/lib/services/report.service.test.ts` (nowy plik)

**Test cases dla `getReportById`**:
```typescript
describe('getReportById', () => {
  it('should return report when it exists and belongs to user', async () => {
    // Arrange
    const mockSupabase = createMockSupabase();
    const reportId = 1;
    const userId = 'user-123';
    
    mockSupabase.from('reports').select().eq().eq().single.mockResolvedValue({
      data: { id: 1, user_id: userId, content: '...' },
      error: null,
    });
    
    // Act
    const result = await getReportById(mockSupabase, reportId, userId);
    
    // Assert
    expect(result).not.toBeNull();
    expect(result?.id).toBe(reportId);
    expect(result?.user_id).toBe(userId);
  });
  
  it('should return null when report does not exist', async () => {
    // Test implementation
  });
  
  it('should return null when report belongs to another user', async () => {
    // Test implementation
  });
  
  it('should throw error on database failure', async () => {
    // Test implementation
  });
});

describe('checkReportExists', () => {
  it('should return true when report exists', async () => {
    // Test implementation
  });
  
  it('should return false when report does not exist', async () => {
    // Test implementation
  });
});
```

#### 5.2. Testy integracyjne (integration tests)
**Narzędzie**: Postman, curl, lub automated test suite

**Test case 1: Sukces (200 OK)**
```bash
# Setup: Create test user and report in database
# Request:
curl -X GET http://localhost:4321/api/reports/1 \
  -H "Authorization: Bearer <valid-jwt-token>"

# Expected response:
# Status: 200 OK
# Body: { "id": 1, "user_id": "...", "content": "...", ... }
```

**Test case 2: Nieprawidłowe ID (400 Bad Request)**
```bash
curl -X GET http://localhost:4321/api/reports/abc \
  -H "Authorization: Bearer <valid-jwt-token>"

# Expected: 400 Bad Request
```

**Test case 3: Brak uwierzytelnienia (401 Unauthorized)**
```bash
curl -X GET http://localhost:4321/api/reports/1
# No Authorization header

# Expected: 401 Unauthorized
```

**Test case 4: Raport innego użytkownika (403 Forbidden)**
```bash
# Setup: Report ID 1 belongs to user-A
# Request with user-B token:
curl -X GET http://localhost:4321/api/reports/1 \
  -H "Authorization: Bearer <user-b-jwt-token>"

# Expected: 403 Forbidden
```

**Test case 5: Nieistniejący raport (404 Not Found)**
```bash
curl -X GET http://localhost:4321/api/reports/999999 \
  -H "Authorization: Bearer <valid-jwt-token>"

# Expected: 404 Not Found
```

#### 5.3. Testy wydajnościowe (performance tests)
**Narzędzie**: Apache Bench (ab) lub k6

```bash
# Load test: 100 concurrent requests
ab -n 1000 -c 100 -H "Authorization: Bearer <token>" \
  http://localhost:4321/api/reports/1

# Target metrics:
# - Mean response time: < 100ms
# - P95 response time: < 200ms
# - Error rate: 0%
```

---

### Krok 6: Dokumentacja API
**Plik**: `docs/api/reports.md` lub aktualizacja istniejącej dokumentacji

**Akcja**: Dodanie szczegółowej dokumentacji endpointu

```markdown
## GET /api/reports/{id}

Retrieves a specific report by ID for the authenticated user.

### Authentication
Required. Bearer JWT token in Authorization header.

### URL Parameters
- `id` (integer, required): The unique identifier of the report

### Response

#### Success (200 OK)
\`\`\`json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-10-31T12:00:00Z",
  "content": "# Symptom Analysis Report\n\n...",
  "period_start": "2025-10-01T00:00:00Z",
  "period_end": "2025-10-31T23:59:59Z",
  "period_type": "month"
}
\`\`\`

#### Error Responses
- `400 Bad Request`: Invalid ID format
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (report belongs to another user)
- `404 Not Found`: Report not found
- `500 Internal Server Error`: Server error

### Example Usage

\`\`\`bash
curl -X GET https://api.example.com/api/reports/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`
```

---

### Krok 7: Code review checklist

Przed mergem do main branch, zweryfikuj:

#### Funkcjonalność:
- [ ] Endpoint zwraca poprawne dane dla autoryzowanego użytkownika
- [ ] Walidacja ID działa prawidłowo
- [ ] Uwierzytelnienie jest wymuszane
- [ ] Autoryzacja jest sprawdzana (tylko własne raporty)
- [ ] Wszystkie kody błędów są zwracane zgodnie ze specyfikacją
- [ ] Rozróżnienie między 403 Forbidden i 404 Not Found działa

#### Bezpieczeństwo:
- [ ] Brak możliwości IDOR (dostęp do raportów innych użytkowników)
- [ ] SQL injection jest niemożliwe (Supabase + Zod)
- [ ] JWT token jest prawidłowo weryfikowany
- [ ] Żadne wrażliwe dane nie są logowane
- [ ] Content-Type headers są ustawione prawidłowo

#### Kod:
- [ ] Kod jest zgodny z zasadami projektu (early returns, guard clauses)
- [ ] TypeScript typy są prawidłowe
- [ ] Brak eslint errors
- [ ] Funkcje service są prawidłowo wyodrębnione
- [ ] Error handling jest kompletny
- [ ] Logging jest odpowiedni (nie za dużo, nie za mało)

#### Testy:
- [ ] Wszystkie unit tests przechodzą
- [ ] Integration tests pokrywają wszystkie scenariusze
- [ ] Edge cases są przetestowane
- [ ] Performance tests pokazują akceptowalne czasy odpowiedzi

#### Dokumentacja:
- [ ] API documentation jest zaktualizowana
- [ ] JSDoc comments są dodane do nowych funkcji
- [ ] README jest zaktualizowany (jeśli potrzeba)

---

### Krok 8: Deployment i monitoring

#### Pre-deployment checklist:
- [ ] Wszystkie testy przechodzą w CI/CD pipeline
- [ ] Database migrations są uruchomione (indeks)
- [ ] Environment variables są skonfigurowane
- [ ] HTTPS jest włączony
- [ ] Rate limiting jest skonfigurowany (jeśli dotyczy)

#### Post-deployment monitoring:
- [ ] Monitor error rates w logach
- [ ] Sprawdź response times (P50, P95, P99)
- [ ] Monitoruj database query performance
- [ ] Obserwuj memory i CPU usage
- [ ] Sprawdź czy nie ma 5xx errors

#### Metryki do śledzenia:
```typescript
// Przykład metryk do monitorowania
{
  "endpoint": "GET /api/reports/:id",
  "metrics": {
    "total_requests": number,
    "success_rate": percentage, // 200 responses / total
    "avg_response_time": milliseconds,
    "p95_response_time": milliseconds,
    "p99_response_time": milliseconds,
    "error_rates": {
      "400": number,
      "401": number,
      "403": number,
      "404": number,
      "500": number
    },
    "database_query_time": milliseconds
  }
}
```

#### Alerting thresholds:
- Error rate > 1% → Warning
- Error rate > 5% → Critical
- P95 response time > 200ms → Warning
- P95 response time > 500ms → Critical
- 5xx errors > 0 → Immediate investigation

---

## Podsumowanie

Implementacja endpointu `GET /api/reports/{id}` obejmuje:

1. ✅ **Walidację** parametru ID za pomocą Zod schema
2. ✅ **Uwierzytelnienie** poprzez weryfikację JWT token
3. ✅ **Autoryzację** poprzez filtrowanie po `user_id` w query
4. ✅ **Rozróżnienie błędów** między 403 Forbidden i 404 Not Found
5. ✅ **Service layer** z dwiema funkcjami pomocniczymi
6. ✅ **Comprehensive error handling** z early returns pattern
7. ✅ **Optymalizację wydajności** poprzez database indexing
8. ✅ **Bezpieczeństwo** z ochroną przed IDOR i SQL injection
9. ✅ **Testowanie** na wszystkich poziomach (unit, integration, performance)
10. ✅ **Dokumentację** API i kod

Endpoint jest gotowy do implementacji zgodnie z best practices projektu i wymogami bezpieczeństwa dla aplikacji medycznych.

