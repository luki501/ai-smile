# API Endpoint Implementation Plan: GET /api/symptoms

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia pobranie listy symptomów dla uwierzytelnionego użytkownika. Wspiera paginację, filtrowanie według zakresu dat, typu symptomu oraz części ciała, a także zwraca całkowitą liczbę pasujących rekordów.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/symptoms`
- **Parametry**:
  - **Wymagane**: Brak
  - **Opcjonalne**:
    - `offset` (number, default: 0): Liczba rekordów do pominięcia (dla paginacji).
    - `limit` (number, default: 20): Maksymalna liczba rekordów do zwrócenia.
    - `occurred_at_gte` (string): Filtr daty "większe lub równe" w formacie ISO 8601.
    - `occurred_at_lte` (string): Filtr daty "mniejsze lub równe" w formacie ISO 8601.
    - `symptom_type` (string): Filtr po typie symptomu (wartość z `symptom_type_enum`).
    - `body_part` (string): Filtr po części ciała (wartość z `body_part_enum`).
- **Request Body**: Brak

## 3. Wykorzystywane typy
- `SymptomDto` (`src/types.ts`): Obiekt transferu danych reprezentujący pojedynczy symptom w odpowiedzi.
- **Typ odpowiedzi**:
  ```typescript
  {
    data: SymptomDto[];
    count: number;
  }
  ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (`200 OK`)**: Zwraca obiekt JSON zawierający tablicę symptomów (`data`) oraz całkowitą liczbę znalezionych rekordów (`count`).
  ```json
  {
    "data": [
      {
        "id": 1,
        "occurred_at": "2025-10-27T10:00:00Z",
        "symptom_type": "Tingle",
        "body_part": "Hands",
        "notes": "Slight tingle in the fingertips.",
        "created_at": "2025-10-27T10:00:15Z"
      }
    ],
    "count": 1
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błędne lub brakujące parametry zapytania.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Żądanie `GET` trafia do endpointu `/api/symptoms`.
2.  Astro middleware (`src/middleware/index.ts`) weryfikuje sesję użytkownika. Jeśli sesja jest nieprawidłowa, zwraca `401 Unauthorized`.
3.  Handler `GET` w `src/pages/api/symptoms.ts` jest wywoływany.
4.  Parametry zapytania są parsowane i walidowane przy użyciu schemy `zod` z `src/lib/symptoms/symptoms.validators.ts`. W przypadku błędu walidacji zwracany jest `400 Bad Request`.
5.  Handler wywołuje metodę z serwisu `SymptomService` (`src/lib/symptoms/symptoms.service.ts`), przekazując ID użytkownika (z `context.locals.session`) oraz zwalidowane filtry.
6.  `SymptomService` dynamicznie buduje zapytanie do Supabase na podstawie przekazanych parametrów.
7.  Zapytanie jest wykonywane z opcją `count: 'exact'`, aby pobrać zarówno dane, jak i całkowitą liczbę pasujących rekordów.
8.  Serwis zwraca dane i liczbę rekordów do handlera.
9.  Handler formatuje odpowiedź w strukturze `{ data, count }` i odsyła ją do klienta z kodem `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do endpointu jest ograniczony wyłącznie do uwierzytelnionych użytkowników poprzez middleware weryfikujące sesję Supabase.
- **Autoryzacja**: Polityki Row-Level Security (RLS) w bazie danych PostgreSQL zapewniają, że użytkownik może odczytać wyłącznie własne dane. Każde zapytanie do tabeli `symptoms` jest automatycznie filtrowane przez `user_id` zalogowanego użytkownika (`auth.uid()`).

## 7. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Wydajność zapytań jest zapewniona przez istniejące indeksy w tabeli `symptoms`:
  - `symptoms_user_id_occurred_at_idx` (złożony indeks na `user_id` i `occurred_at`): Kluczowy dla szybkiego sortowania i pobierania danych dla konkretnego użytkownika.
  - `symptoms_symptom_type_idx` i `symptoms_body_part_idx`: Przyspieszają operacje filtrowania.
- **Paginacja**: Implementacja paginacji (`offset`, `limit`) jest kluczowa dla unikania przesyłania dużych ilości danych i przeciążania zarówno serwera, jak i klienta.

## 8. Etapy wdrożenia
1.  **Utworzenie walidatora Zod**:
    -   Stwórz plik `src/lib/symptoms/symptoms.validators.ts`.
    -   Zdefiniuj schemę `zod` do walidacji opcjonalnych parametrów zapytania: `offset`, `limit`, `occurred_at_gte`, `occurred_at_lte`, `symptom_type`, `body_part`. Uwzględnij transformację stringów na liczby dla `offset` i `limit` oraz walidację formatu daty.

2.  **Implementacja serwisu**:
    -   Stwórz plik `src/lib/symptoms/symptoms.service.ts`.
    -   Zaimplementuj klasę `SymptomService` z metodą `getSymptoms`, która przyjmuje `SupabaseClient`, `userId` oraz obiekt zwalidowanych filtrów.
    -   Wewnątrz metody, zbuduj zapytanie do Supabase `.from('symptoms').select('*', { count: 'exact' })`.
    -   Dynamicznie dodawaj filtry (`.gte()`, `.lte()`, `.eq()`) do zapytania na podstawie dostarczonych parametrów.
    -   Zastosuj paginację za pomocą `.range(offset, offset + limit - 1)`.
    -   Wykonaj zapytanie i zwróć `{ data, count }`.

3.  **Utworzenie endpointu API**:
    -   Stwórz plik `src/pages/api/symptoms.ts`.
    -   Dodaj `export const prerender = false;` na początku pliku.
    -   Zaimplementuj handler `GET: APIRoute`.
    -   Pobierz sesję użytkownika i klienta Supabase z `context.locals`. Jeśli brak sesji, zwróć `401`.
    -   Sparsuj i zwaliduj parametry URL przy użyciu wcześniej utworzonej schemy `zod`. W przypadku błędu zwróć `401` ze szczegółami błędu.
    -   Utwórz instancję `SymptomService` i wywołaj metodę `getSymptoms`.
    -   Zaimplementuj blok `try...catch` do obsługi potencjalnych błędów z serwisu i zwracania `500 Internal Server Error`.
    -   Zwróć pomyślną odpowiedź z danymi i liczbą rekordów w formacie JSON.
