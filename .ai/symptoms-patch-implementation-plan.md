# API Endpoint Implementation Plan: `PATCH /api/symptoms/{id}`

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom aktualizację istniejącego wpisu o symptomie na podstawie jego unikalnego identyfikatora (`id`). Endpoint obsługuje częściowe aktualizacje, co oznacza, że klient musi przesłać tylko te pola, które mają zostać zmienione. W odpowiedzi zwracany jest pełny, zaktualizowany obiekt symptomu.

## 2. Szczegóły żądania
-   **Metoda HTTP:** `PATCH`
-   **Struktura URL:** `/api/symptoms/{id}`
-   **Parametry:**
    -   **URL:**
        -   `id` (number, wymagany): Identyfikator symptomu, który ma zostać zaktualizowany.
    -   **Ciało żądania (Request Body):**
        -   Typ: `application/json`
        -   Struktura: Obiekt JSON zawierający dowolne z poniższych pól. Co najmniej jedno pole jest wymagane do wykonania aktualizacji.
            ```json
            {
              "occurred_at": "2025-10-28T11:30:00Z",
              "symptom_type": "Numbness",
              "body_part": "Legs",
              "notes": "The numbness has slightly worsened."
            }
            ```

## 3. Wykorzystywane typy
-   **Wejście (Ciało żądania):** `UpdateSymptomCommand` z `src/types.ts`.
-   **Wyjście (Odpowiedź):** `SymptomDetailsDto` z `src/types.ts`.

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu (`200 OK`):**
    -   Typ: `application/json`
    -   Struktura: Pełny obiekt zaktualizowanego symptomu.
        ```json
        {
          "id": 2,
          "user_id": "user-uuid-goes-here",
          "occurred_at": "2025-10-28T11:30:00Z",
          "symptom_type": "Numbness",
          "body_part": "Legs",
          "notes": "The numbness has slightly worsened.",
          "created_at": "2025-10-28T11:30:05Z"
        }
        ```
-   **Odpowiedzi błędów:**
    -   `400 Bad Request`: Gdy `id` w URL nie jest liczbą.
    -   `401 Unauthorized`: Gdy użytkownik nie jest uwierzytelniony.
    -   `404 Not Found`: Gdy symptom o podanym `id` nie istnieje lub nie należy do użytkownika.
    -   `422 Unprocessable Entity`: Gdy dane w ciele żądania są nieprawidłowe.
    -   `500 Internal Server Error`: Gdy wystąpi nieoczekiwany błąd serwera.

## 5. Przepływ danych
1.  Żądanie `PATCH` trafia do endpointu Astro `/src/pages/api/symptoms/[id].ts`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje sesję Supabase. Jeśli jest nieprawidłowa, zwraca `401`.
3.  Handler endpointu pobiera `id` z parametrów URL i parsuje je do liczby. W razie błędu zwraca `400`.
4.  Ciało żądania jest odczytywane i walidowane przy użyciu schematu Zod opartego na `UpdateSymptomCommand`. W razie błędu walidacji, zwracane jest `422` z listą błędów.
5.  Handler wywołuje funkcję `updateSymptom` z serwisu `src/lib/symptoms.service.ts`, przekazując `id`, zwalidowane dane oraz instancję `SupabaseClient` z `context.locals.supabase`.
6.  Funkcja `updateSymptom` wykonuje zapytanie `UPDATE` do tabeli `symptoms` w bazie Supabase.
7.  Polityka RLS na tabeli `symptoms` automatycznie filtruje zapytanie, zezwalając na aktualizację tylko wtedy, gdy `user_id` rekordu pasuje do `id` zalogowanego użytkownika.
8.  Jeśli zapytanie nie zaktualizuje żadnego wiersza (ponieważ `id` nie istnieje lub nie należy do użytkownika), serwis zwraca informację o niepowodzeniu. Handler zwraca `404`.
9.  W przypadku sukcesu, serwis zwraca zaktualizowany obiekt symptomu.
10. Handler endpointu formatuje odpowiedź i wysyła ją do klienta z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie:** Wszystkie żądania do tego endpointu muszą być uwierzytelnione. Middleware Astro jest odpowiedzialne za weryfikację tokenu sesji Supabase.
-   **Autoryzacja:** Zapewniona przez Row-Level Security (RLS) w Supabase. Polityka `Allow full access to own symptoms` gwarantuje, że użytkownicy mogą modyfikować wyłącznie własne dane. Zapobiega to nieautoryzowanemu dostępowi do danych innych użytkowników.
-   **Walidacja danych wejściowych:** Użycie Zod do walidacji ciała żądania chroni przed atakami typu NoSQL injection i zapewnia integralność danych przed próbą zapisu do bazy.

## 7. Obsługa błędów
| Kod statusu              | Opis                                                                                                     | Sposób obsługi                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `400 Bad Request`         | Parametr `id` w URL jest nieprawidłowy (np. nie jest liczbą).                                             | Sprawdzić, czy `id` jest poprawną liczbą na początku handlera.                                                |
| `401 Unauthorized`        | Brak lub nieprawidłowy token sesji użytkownika.                                                          | Obsługiwane automatycznie przez middleware Astro.                                                            |
| `404 Not Found`           | Symptom o podanym `id` nie został znaleziony dla danego użytkownika.                                      | Sprawdzić wynik operacji `UPDATE` z Supabase. Jeśli liczba zmodyfikowanych wierszy wynosi 0, zwrócić `404`. |
| `422 Unprocessable Entity`| Ciało żądania zawiera nieprawidłowe dane (np. zły typ, niedozwolona wartość `enum`).                      | Walidować ciało żądania za pomocą Zod i zwrócić szczegółowe błędy walidacji.                                 |
| `500 Internal Server Error`| Wystąpił nieoczekiwany błąd po stronie serwera (np. błąd połączenia z bazą danych).                        | Użyć bloku `try...catch` wokół logiki biznesowej i logować błąd na serwerze.                                   |

## 8. Rozważania dotyczące wydajności
-   Operacja `UPDATE` na pojedynczym rekordzie w PostgreSQL jest bardzo wydajna, zwłaszcza gdy jest wykonywana na podstawie klucza głównego.
-   Indeks `symptoms_user_id_occurred_at_idx` nie ma bezpośredniego wpływu na operację `UPDATE` przez `id`, ale zapewnia ogólną wydajność operacji na tabeli.
-   Wpływ na wydajność jest minimalny. Należy upewnić się, że połączenie z Supabase jest zarządzane efektywnie (co zapewnia `supabase-js`).

## 9. Etapy wdrożenia
1.  **Stworzenie schematu walidacji Zod:**
    -   W nowym pliku `src/lib/schemas.ts` zdefiniować schemat Zod dla `UpdateSymptomCommand`.
    -   Schemat powinien używać `z.partial()` i uwzględniać typy `enum` dla `symptom_type` i `body_part`.
2.  **Implementacja logiki serwisu:**
    -   Utworzyć plik `src/lib/symptoms.service.ts` (jeśli nie istnieje).
    -   Dodać funkcję `updateSymptom(id: number, data: UpdateSymptomCommand, supabase: SupabaseClient): Promise<SymptomDetailsDto | null>`.
    -   Wewnątrz funkcji zaimplementować logikę `UPDATE` przy użyciu `supabase.from('symptoms').update(data).eq('id', id).select().single()`.
    -   Obsłużyć przypadki, gdy `error` jest `truthy` lub `data` jest `null`.
3.  **Implementacja endpointu API:**
    -   Utworzyć plik `/src/pages/api/symptoms/[id].ts`.
    -   Dodać `export const prerender = false;`.
    -   Zaimplementować handler `PATCH({ params, request, context }: APIContext)`.
    -   Pobrać i zwalidować `id` z `params`.
    -   Pobrać i zwalidować ciało żądania przy użyciu stworzonego schematu Zod.
    -   Wywołać funkcję `updateSymptom` z serwisu.
    -   Zwrócić odpowiednią odpowiedź HTTP (`200` z danymi, `404`, `422`, `500`) w zależności od wyniku operacji.
4.  **Testowanie:**
    -   Napisać testy (jeśli projekt zakłada testy automatyczne) lub przeprowadzić manualne testy dla wszystkich scenariuszy sukcesu i błędów przy użyciu narzędzia do testowania API (np. Postman, Insomnia).
    -   Zweryfikować działanie RLS, próbując zaktualizować zasób należący do innego użytkownika.
