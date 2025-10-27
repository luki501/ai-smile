# API Endpoint Implementation Plan: POST /api/symptoms

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom tworzenie nowych wpisów dotyczących symptomów. Endpoint przyjmuje szczegółowe dane o symptomie, waliduje je, a następnie zapisuje w bazie danych, wiążąc je z aktualnie zalogowanym użytkownikiem. W odpowiedzi zwracany jest nowo utworzony obiekt symptomu.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/symptoms`
- **Parametry**:
  - **Wymagane**:
    - `occurred_at` (string, format ISO 8601)
    - `symptom_type` (string, enum: 'Tingle', 'Numbness', 'Cramps', 'FuckedUp')
    - `body_part` (string, enum: 'Head', 'Neck', 'Back', 'Arms', 'Hands', 'Legs')
  - **Opcjonalne**:
    - `notes` (string)
- **Request Body**:
  ```json
  {
    "occurred_at": "2025-10-28T11:30:00Z",
    "symptom_type": "Numbness",
    "body_part": "Legs",
    "notes": "Feeling of numbness in the left leg."
  }
  ```

## 3. Wykorzystywane typy
- **Request (Command Model)**: `CreateSymptomCommand` z `src/types.ts` do mapowania i walidacji ciała żądania.
- **Response (DTO)**: `SymptomDetailsDto` z `src/types.ts` do reprezentowania obiektu symptomu w odpowiedzi.

## 4. Szczegóły odpowiedzi
- **`201 Created`**: Zwraca pełny obiekt nowo utworzonego symptomu w formacie `SymptomDetailsDto`.
  ```json
  {
    "id": 2,
    "user_id": "user-uuid-goes-here",
    "occurred_at": "2025-10-28T11:30:00Z",
    "symptom_type": "Numbness",
    "body_part": "Legs",
    "notes": "Feeling of numbness in the left leg.",
    "created_at": "2025-10-28T11:30:05Z"
  }
  ```
- **`400 Bad Request`**: Zwracane, gdy dane wejściowe są nieprawidłowe. Odpowiedź zawiera szczegóły błędu walidacji.
  ```json
  {
    "error": "Validation failed",
    "details": [
      { "path": ["symptom_type"], "message": "Invalid enum value..." }
    ]
  }
  ```
- **`401 Unauthorized`**: Zwracane, gdy użytkownik nie jest uwierzytelniony.
- **`500 Internal Server Error`**: Zwracane w przypadku nieoczekiwanego błędu serwera.

## 5. Przepływ danych
1.  Żądanie `POST` trafia do endpointu `src/pages/api/symptoms.ts`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje sesję użytkownika. Jeśli sesja jest nieprawidłowa, żądanie jest odrzucane z kodem 401.
3.  Handler `POST` weryfikuje, czy `context.locals.user` istnieje, aby potwierdzić uwierzytelnienie.
4.  Ciało żądania jest parsowane i walidowane przy użyciu predefiniowanego schematu Zod. W przypadku błędu walidacji zwracana jest odpowiedź 400.
5.  Handler wywołuje funkcję `createSymptom` z serwisu `SymptomService` (`src/lib/services/symptom.service.ts`).
6.  Do serwisu przekazywana jest instancja klienta Supabase (`context.locals.supabase`), ID użytkownika (`context.locals.user.id`) oraz zwalidowane dane z ciała żądania.
7.  `SymptomService` wykonuje operację `insert` na tabeli `symptoms` w bazie danych.
8.  Serwis zwraca nowo utworzony rekord do handlera.
9.  Handler formatuje odpowiedź i wysyła ją do klienta z kodem statusu `201 Created`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do endpointu jest ograniczony wyłącznie do uwierzytelnionych użytkowników. Jest to zapewnione przez middleware Astro, który weryfikuje token sesji Supabase.
- **Autoryzacja**: Supabase Row-Level Security (RLS) gwarantuje, że użytkownik może tworzyć wpisy wyłącznie dla siebie. Polityka bezpieczeństwa na tabeli `symptoms` sprawdza, czy `user_id` wstawianego wiersza jest zgodne z `auth.uid()` sesji.
- **Walidacja danych**: Użycie Zod do walidacji schematu ciała żądania chroni przed nieprawidłowymi lub złośliwymi danymi, zapobiegając błędom w logice biznesowej i bazie danych. `user_id` jest pobierane z sesji, a nie z payloadu, co uniemożliwia przypisywanie symptomów innym użytkownikom.

## 7. Rozważania dotyczące wydajności
Operacja polega na pojedynczym zapisie (`INSERT`) do bazy danych, co jest wysoce zoptymalizowane w PostgreSQL. Nie przewiduje się żadnych wąskich gardeł wydajnościowych dla tego endpointu przy standardowym obciążeniu. Indeksy na tabeli `symptoms` są głównie zorientowane na odczyt, jednak indeks klucza głównego zapewnia wydajność zapisu.

## 8. Etapy wdrożenia
1.  **Stworzenie pliku endpointu**: Utwórz nowy plik `src/pages/api/symptoms.ts`.
2.  **Konfiguracja endpointu**: W `symptoms.ts` dodaj `export const prerender = false;` oraz podstawową strukturę dla handlera `POST` typu `APIRoute`.
3.  **Definicja schematu walidacji**: W `symptoms.ts` zdefiniuj schemat walidacji Zod dla `CreateSymptomCommand`, uwzględniając typy `enum` dla `symptom_type` i `body_part`.
4.  **Stworzenie serwisu**: Utwórz plik `src/lib/services/symptom.service.ts`.
5.  **Implementacja logiki serwisu**: W `symptom.service.ts` zaimplementuj asynchroniczną funkcję `createSymptom`, która przyjmuje klienta Supabase, ID użytkownika i dane symptomu, a następnie wykonuje operację `insert` w bazie danych, obsługując ewentualne błędy.
6.  **Implementacja handlera API**:
    - W handlerze `POST` w `symptoms.ts` zaimplementuj logikę pobierania i walidacji ciała żądania.
    - Sprawdź, czy użytkownik jest uwierzytelniony (`context.locals.user`).
    - Wywołaj funkcję `createSymptom` z serwisu, przekazując wymagane parametry.
    - Obsłuż błędy walidacji, błędy z serwisu oraz błędy serwera, zwracając odpowiednie kody statusu (400, 500).
7.  **Formatowanie odpowiedzi**: W przypadku sukcesu, zwróć nowo utworzony obiekt symptomu z kodem statusu `201 Created`.
