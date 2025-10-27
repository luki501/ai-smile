# Architektura UI dla AI-Smile

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji AI-Smile została zaprojektowana w celu zapewnienia prostego, intuicyjnego i responsywnego doświadczenia dla pacjentów ze stwardnieniem rozsianym (SM). Opiera się na podejściu "mobile-first" i wykorzystuje nowoczesny stos technologiczny (Astro, React, Tailwind CSS, Shadcn/ui) do budowy wydajnego i łatwego w utrzymaniu produktu.

Struktura dzieli aplikację na dwie główne części:
-   **Publiczna (nieuwierzytelniona)**: Obejmuje strony logowania i rejestracji, dostępne dla wszystkich użytkowników. Wykorzystuje dedykowany `AuthLayout`.
-   **Prywatna (uwierzytelniona)**: Dostępna po zalogowaniu, zawiera panel główny z listą symptomów i ustawienia konta. Chroniona jest przez middleware i wykorzystuje `DashboardLayout`, który zapewnia spójną nawigację.

Zarządzanie stanem serwera (dane z API) będzie realizowane przez bibliotekę TanStack Query (React Query), co zapewni optymalne cachowanie, odświeżanie danych i obsługę stanów ładowania oraz błędów. Lokalny stan UI będzie zarządzany przy użyciu wbudowanych hooków Reacta.

## 2. Lista widoków

### Widok 1: Strona Rejestracji

-   **Nazwa widoku**: Rejestracja (Sign Up)
-   **Ścieżka widoku**: `/register`
-   **Główny cel**: Umożliwienie nowym użytkownikom założenia konta w serwisie.
-   **Kluczowe informacje do wyświetlenia**: Formularz rejestracyjny.
-   **Kluczowe komponenty widoku**:
    -   `Card`: Obramowanie dla formularza.
    -   `Formularz Rejestracji`: Pola na e-mail, hasło i potwierdzenie hasła.
    -   `Input`: Pola tekstowe.
    -   `Button`: Przycisk do przesłania formularza.
    -   `Link`: Przekierowanie na stronę logowania.
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: Walidacja pól formularza w czasie rzeczywistym z komunikatami błędów wyświetlanymi bezpośrednio pod polami. Stan ładowania na przycisku po jego kliknięciu. Po pomyślnej rejestracji, użytkownik jest automatycznie logowany i przekierowywany do panelu głównego.
    -   **Dostępność**: Poprawne etykiety (`<label>`) dla wszystkich pól formularza.
    -   **Bezpieczeństwo**: Pola hasła muszą mieć typ `password`.

### Widok 2: Strona Logowania

-   **Nazwa widoku**: Logowanie (Sign In)
-   **Ścieżka widoku**: `/login`
-   **Główny cel**: Uwierzytelnienie istniejących użytkowników.
-   **Kluczowe informacje do wyświetlenia**: Formularz logowania.
-   **Kluczowe komponenty widoku**:
    -   `Card`: Obramowanie dla formularza.
    -   `Formularz Logowania`: Pola na e-mail i hasło.
    -   `Input`: Pola tekstowe.
    -   `Button`: Przycisk do przesłania formularza.
    -   `Link`: Przekierowania na stronę rejestracji oraz do funkcji "zapomniałem hasła".
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: W przypadku błędnych danych logowania, wyświetlany jest ogólny komunikat błędu.
    -   **Dostępność**: Poprawne etykiety dla pól.
    -   **Bezpieczeństwo**: Pole hasła typu `password`.

### Widok 3: Panel Główny (Dashboard)

-   **Nazwa widoku**: Panel Główny
-   **Ścieżka widoku**: `/`
-   **Główny cel**: Główne centrum aplikacji, umożliwiające przeglądanie, dodawanie, edycję, usuwanie i filtrowanie wpisów o symptomach.
-   **Kluczowe informacje do wyświetlenia**: Chronologiczna lista symptomów, panel filtrów.
-   **Kluczowe komponenty widoku**:
    -   `Panel Filtrów`: Zestaw kontrolek do filtrowania listy.
    -   `Lista Symptomów`: Dynamicznie ładowana lista wpisów.
    -   `Element Listy Symptomów`: Pojedynczy wpis z danymi i opcjami (edytuj, usuń).
    -   `Przycisk "Dodaj symptom"`: Inicjuje proces dodawania nowego wpisu.
    -   `Modal Formularza Symptomu` (React): Okno modalne do dodawania i edycji wpisów.
    -   `Dialog Potwierdzenia`: Okno dialogowe do potwierdzania operacji usunięcia.
    -   `Wskaźnik Ładowania` (Spinner): Sygnalizuje ładowanie danych.
    -   `Komponent Stanu Pustego`: Wyświetlany w przypadku braku symptomów lub braku wyników filtrowania.
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: Zastosowanie "infinite scroll" do płynnego ładowania starszych danych. Użycie mechanizmu "debouncing" dla filtrów, aby unikać nadmiernych zapytań API. Informacje zwrotne o wynikach operacji (CRUD) w formie powiadomień "toast". Interfejs w pełni responsywny (RWD).
    -   **Dostępność**: Zapewnienie, że wszystkie interaktywne elementy są dostępne z klawiatury.
    -   **Bezpieczeństwo**: Wszystkie operacje na danych są autoryzowane na poziomie API i bazy danych (RLS), zapewniając dostęp tylko do własnych danych.

### Widok 4: Ustawienia Konta

-   **Nazwa widoku**: Ustawienia Konta
-   **Ścieżka widoku**: `/settings`
-   **Główny cel**: Zarządzanie ustawieniami konta użytkownika, w tym jego usunięcie.
-   **Kluczowe informacje do wyświetlenia**: Informacje o użytkowniku (np. e-mail), sekcja "Strefa niebezpieczna".
-   **Kluczowe komponenty widoku**:
    -   `Card`: Obramowanie sekcji.
    -   `Przycisk "Usuń konto"`: Inicjuje proces usuwania konta.
    -   `Dialog Potwierdzenia Usunięcia`: Wieloetapowe potwierdzenie z polem na wpisanie hasła w celu autoryzacji operacji.
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: Proces usuwania konta jest celowo utrudniony, aby zapobiec przypadkowemu działaniu. Komunikaty jasno informują o nieodwracalności operacji.
    -   **Dostępność**: Przycisk i dialog są w pełni dostępne.
    -   **Bezpieczeństwo**: Krytyczna operacja usunięcia konta jest zabezpieczona wymogiem ponownego podania hasła, co potwierdza tożsamość użytkownika.

## 3. Mapa podróży użytkownika

1.  **Rejestracja i Pierwsze Logowanie**:
    -   Nowy użytkownik trafia na stronę `/login`.
    -   Klika link do `/register`.
    -   Wypełnia formularz rejestracyjny i go przesyła.
    -   Po sukcesie jest automatycznie logowany i przekierowywany na stronę główną (`/`).
    -   Widzi pustą listę symptomów z zachętą do dodania pierwszego wpisu.

2.  **Zarządzanie Symptomami (Główny cykl życia aplikacji)**:
    -   Zalogowany użytkownik na stronie `/` klika przycisk "Dodaj symptom".
    -   Otwiera się `Modal Formularza Symptomu`. Użytkownik wypełnia dane (typ, część ciała, notatki, data) i zapisuje.
    -   Modal się zamyka, lista jest odświeżana, a na górze pojawia się nowy wpis. Wyświetlany jest "toast" o sukcesie.
    -   Użytkownik klika "Edytuj" przy istniejącym wpisie. Otwiera się ten sam modal, wypełniony danymi. Użytkownik poprawia dane i zapisuje. Wpis na liście zostaje zaktualizowany.
    -   Użytkownik klika "Usuń". Pojawia się `Dialog Potwierdzenia`. Po zatwierdzeniu wpis znika z listy.

3.  **Filtrowanie i Przeglądanie Historii**:
    -   Użytkownik korzysta z `Panelu Filtrów`, aby zawęzić listę np. do konkretnego typu symptomu w ostatnim miesiącu. Lista automatycznie się aktualizuje.
    -   Aby zobaczyć starsze dane, użytkownik przewija listę w dół, co powoduje doładowanie kolejnej partii wpisów (infinite scroll).

4.  **Usuwanie Konta**:
    -   Użytkownik przechodzi z panelu głównego do strony `/settings`.
    -   Klika przycisk "Usuń konto".
    -   W oknie dialogowym potwierdza swoją decyzję i wpisuje hasło.
    -   Po pomyślnym usunięciu konta jest wylogowywany i przekierowywany na stronę `/login` z komunikatem o powodzeniu operacji.

## 4. Układ i struktura nawigacji

Architektura opiera się na dwóch głównych layoutach Astro, które definiują strukturę nawigacyjną dla różnych stanów aplikacji.

-   **`AuthLayout.astro` (Dla niezalogowanych)**:
    -   Minimalistyczny układ bez stałej nawigacji.
    -   Służy jako kontener dla stron `/login` i `/register`.
    -   Nawigacja odbywa się poprzez linki umieszczone bezpośrednio w treści tych stron.

-   **`DashboardLayout.astro` (Dla zalogowanych)**:
    -   Zawiera stały nagłówek (`Header`) widoczny we wszystkich prywatnych widokach.
    -   **Nagłówek zawiera**:
        -   Logo aplikacji.
        -   Menu użytkownika (rozwijane po kliknięciu na awatar/ikonę), które zawiera:
            -   Adres e-mail zalogowanego użytkownika.
            -   Link do `Ustawień Konta` (`/settings`).
            -   Przycisk `Wyloguj`.
    -   Ten layout jest używany dla widoków `/` (Panel Główny) i `/settings` (Ustawienia Konta).

Wszystkie ścieżki objęte przez `DashboardLayout` są chronione przez **middleware Astro**, które weryfikuje token JWT użytkownika. W przypadku braku ważnej sesji, użytkownik jest automatycznie przekierowywany do `/login`.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które będą stanowić fundament interfejsu użytkownika.

-   **`SymptomFormModal`**: Reużywalny komponent React, który obsługuje logikę formularza zarówno do tworzenia, jak i edycji symptomu. Jego stan (otwarty/zamknięty, tryb działania) jest zarządzany z poziomu nadrzędnego widoku (Panelu Głównego).
-   **`FilterPanel`**: Komponent zawierający wszystkie kontrolki filtrów (zakres dat, typ symptomu, część ciała) oraz przycisk do ich resetowania. Zarządza stanem filtrów i komunikuje zmiany do nadrzędnego widoku w celu odświeżenia danych.
-   **`SymptomList` / `SymptomListItem`**: Komponenty odpowiedzialne za renderowanie listy symptomów. `SymptomList` obsługuje logikę "infinite scroll", a `SymptomListItem` renderuje pojedynczy wpis wraz z menu kontekstowym (Edytuj/Usuń).
-   **`ConfirmationDialog`**: Generyczny komponent okna dialogowego używany do potwierdzania krytycznych akcji, takich jak usuwanie symptomu lub usuwanie konta.
-   **`Toast` / `Toaster`**: System powiadomień używany do dostarczania krótkich informacji zwrotnych o wyniku operacji (np. "Symptom został pomyślnie dodany").
-   **`Layouts` (`AuthLayout`, `DashboardLayout`)**: Komponenty Astro definiujące ogólną strukturę strony i nawigację dla odpowiednich części aplikacji.
