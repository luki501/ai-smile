# API Endpoint Implementation Plan: DELETE /api/symptoms/{id}

## 1. Przegląd punktu końcowego
Ten punkt końcowy (endpoint) jest odpowiedzialny za trwałe usunięcie wpisu o symptomie z bazy danych. Operacja jest dostępna tylko dla uwierzytelnionego użytkownika i może być wykonana wyłącznie na wpisie, którego jest on właścicielem. Pomyślne usunięcie zasobu nie zwraca żadnej treści.

## 2. Szczegóły żądania
- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/symptoms/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (w URL): Identyfikator numeryczny (`BIGINT`) symptomu, który ma zostać usunięty.
  - **Opcjonalne:** Brak.
- **Request Body:** Brak.

## 3. Wykorzystywane typy
Dla tej operacji nie są wymagane żadne dedykowane typy DTO ani Command Modele, ponieważ żądanie i odpowiedź nie zawierają ciała (payload).

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu:**
  - **Kod stanu:** `204 No Content`
  - **Ciało odpowiedzi:** Brak.
- **Odpowiedzi błędów:**
  - **Kod stanu:** `400 Bad Request` - gdy `id` jest nieprawidłowe.
  - **Kod stanu:** `401 Unauthorized` - gdy użytkownik nie jest zalogowany.
  - **Kod stanu:** `404 Not Found` - gdy symptom o podanym `id` nie istnieje lub nie należy do użytkownika.
  - **Kod stanu:** `500 Internal Server Error` - w przypadku nieoczekiwanego błędu serwera.

## 5. Przepływ danych
1.  Klient wysyła żądanie `DELETE` na adres `/api/symptoms/{id}`.
2.  Middleware Astro weryfikuje token autentykacyjny użytkownika. Jeśli jest nieprawidłowy, zwraca `401 Unauthorized`.
3.  Handler API w `src/pages/api/symptoms/[id].ts` jest wywoływany.
4.  Parametr `id` z URL jest walidowany przy użyciu schemy Zod w celu upewnienia się, że jest to dodatnia liczba całkowita. W przypadku błędu walidacji, zwracany jest status `400 Bad Request`.
5.  Handler wywołuje metodę `deleteSymptom` z serwisu `SymptomService`, przekazując jej `id` symptomu, `id` zalogowanego użytkownika oraz instancję klienta Supabase z `context.locals`.
6.  `SymptomService` wykonuje zapytanie `delete` do tabeli `symptoms` w bazie Supabase z warunkami `id` oraz `user_id`. Polityka RLS w bazie danych stanowi dodatkowe zabezpieczenie.
7.  Serwis sprawdza wynik operacji. Jeśli liczba usuniętych wierszy wynosi `0`, oznacza to, że zasób nie został znaleziony (lub użytkownik nie miał do niego dostępu), więc serwis zgłasza błąd.
8.  Handler API łapie błąd z serwisu i zwraca odpowiedź `404 Not Found`.
9.  W przypadku pomyślnego usunięcia rekordu, handler API zwraca odpowiedź `204 No Content`.
10. W przypadku nieoczekiwanego błędu na którymkolwiek etapie, zwracany jest status `500 Internal Server Error`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Dostęp do endpointu jest chroniony przez middleware Astro, które sprawdza ważność sesji użytkownika Supabase.
- **Autoryzacja:** Mechanizm Row-Level Security (RLS) w Supabase na tabeli `symptoms` gwarantuje, że operacje mogą być wykonywane tylko na wierszach należących do zalogowanego użytkownika (`auth.uid() = user_id`). Dodatkowo, zapytanie w serwisie będzie zawierało jawny warunek `user_id`, co stanowi drugą warstwę zabezpieczeń przed nieautoryzowanym dostępem (IDOR).
- **Walidacja danych wejściowych:** Parametr `id` jest rygorystycznie walidowany za pomocą Zod, aby zapobiec błędom i potencjalnym atakom (np. SQL Injection, chociaż Supabase SDK parametryzuje zapytania).

## 7. Rozważania dotyczące wydajności
Operacja `DELETE` na tabeli `symptoms` jest wykonywana z użyciem klucza głównego (`id`), co zapewnia wysoką wydajność dzięki indeksowi `PRIMARY KEY`. Nie przewiduje się problemów z wydajnością dla tej operacji, nawet przy dużej liczbie wpisów.

## 8. Etapy wdrożenia
1.  **Utworzenie pliku endpointu:** Stwórz plik `src/pages/api/symptoms/[id].ts`.
2.  **Dodanie konfiguracji Astro:** W nowym pliku dodaj `export const prerender = false;`, aby zapewnić, że endpoint jest renderowany dynamicznie.
3.  **Implementacja handlera `DELETE`:** Zaimplementuj funkcję `DELETE({ params, locals })`, która będzie obsługiwać logikę żądania.
4.  **Walidacja `id`:** Wewnątrz handlera `DELETE` zdefiniuj schemę Zod do walidacji `params.id` (musi być liczbą dodatnią).
5.  **Utworzenie serwisu:** Jeśli nie istnieje, utwórz plik `src/lib/symptoms.service.ts` i zdefiniuj w nim klasę `SymptomService`.
6.  **Implementacja metody `deleteSymptom`:** W `SymptomService` dodaj metodę `deleteSymptom`, która przyjmuje `id`, `userId` i klienta Supabase. Metoda ta powinna:
    -   Wykonać operację `supabase.from('symptoms').delete().match({ id, user_id })`.
    -   Sprawdzić, czy `count` w odpowiedzi od Supabase jest większy od `0`.
    -   Jeśli `count` wynosi `0`, rzucić wyjątek (np. `SymptomNotFoundError`).
7.  **Integracja handlera z serwisem:** W handlerze `DELETE`, po pomyślnej walidacji, wywołaj `SymptomService.deleteSymptom`.
8.  **Obsługa błędów w handlerze:** Zaimplementuj bloki `try...catch` do obsługi błędów walidacji Zod, błędów z serwisu (np. `SymptomNotFoundError`) oraz wszelkich innych nieoczekiwanych wyjątków, zwracając odpowiednie kody statusu (`400`, `404`, `500`).
9.  **Zwrócenie odpowiedzi:** W przypadku pomyślnego wykonania operacji przez serwis, zwróć `new Response(null, { status: 204 })`.
