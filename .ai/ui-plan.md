# Architektura UI dla AI-Smile

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji AI-Smile została zaprojektowana w celu zapewnienia prostego, intuicyjnego i responsywnego doświadczenia dla pacjentów ze stwardnieniem rozsianym (SM). Opiera się na podejściu "mobile-first" i wykorzystuje nowoczesny stos technologiczny (Astro, React, Tailwind CSS, Shadcn/ui) do budowy wydajnego i łatwego w utrzymaniu produktu.

Struktura dzieli aplikację na dwie główne części:
-   **Publiczna (nieuwierzytelniona)**: Obejmuje strony logowania i rejestracji, dostępne dla wszystkich użytkowników. Wykorzystuje dedykowany `AuthLayout`.
-   **Prywatna (uwierzytelniona)**: Dostępna po zalogowaniu, zawiera trzy główne obszary funkcjonalne:
    -   **Zarządzanie symptomami**: Panel główny z listą symptomów, filtrowaniem i operacjami CRUD.
    -   **Raporty AI**: Generowanie i przeglądanie inteligentnych analiz symptomów z wykorzystaniem sztucznej inteligencji.
    -   **Ustawienia konta**: Zarządzanie profilem użytkownika i opcja usunięcia konta.
    
    Wszystkie prywatne widoki są chronione przez middleware i wykorzystują `DashboardLayout`, który zapewnia spójną nawigację.

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
-   **Główny cel**: Główne centrum aplikacji, umożliwiające przeglądanie, dodawanie, edycję, usuwanie i filtrowanie wpisów o symptomach oraz dostęp do funkcjonalności generowania raportów.
-   **Kluczowe informacje do wyświetlenia**: Chronologiczna lista symptomów, panel filtrów, przycisk dostępu do raportów.
-   **Kluczowe komponenty widoku**:
    -   `Panel Filtrów`: Zestaw kontrolek do filtrowania listy.
    -   `Lista Symptomów`: Dynamicznie ładowana lista wpisów.
    -   `Element Listy Symptomów`: Pojedynczy wpis z danymi i opcjami (edytuj, usuń).
    -   `Przycisk "Dodaj symptom"`: Inicjuje proces dodawania nowego wpisu.
    -   `Przycisk "Generuj raport"`: Otwiera modal wyboru parametrów raportu.
    -   `Modal Formularza Symptomu` (React): Okno modalne do dodawania i edycji wpisów.
    -   `Modal Generowania Raportu` (React): Okno modalne do wyboru okresu analizy i inicjacji generowania raportu.
    -   `Dialog Potwierdzenia`: Okno dialogowe do potwierdzania operacji usunięcia.
    -   `Wskaźnik Ładowania` (Spinner): Sygnalizuje ładowanie danych.
    -   `Komponent Stanu Pustego`: Wyświetlany w przypadku braku symptomów lub braku wyników filtrowania.
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: Zastosowanie "infinite scroll" do płynnego ładowania starszych danych. Użycie mechanizmu "debouncing" dla filtrów, aby unikać nadmiernych zapytań API. Informacje zwrotne o wynikach operacji (CRUD) w formie powiadomień "toast". Interfejs w pełni responsywny (RWD). Przycisk "Generuj raport" jest łatwo dostępny, ale nie dominuje w interfejsie.
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

### Widok 5: Historia Raportów

-   **Nazwa widoku**: Historia Raportów
-   **Ścieżka widoku**: `/reports`
-   **Główny cel**: Przeglądanie listy wcześniej wygenerowanych raportów AI z możliwością dostępu do ich treści i zarządzania nimi.
-   **Kluczowe informacje do wyświetlenia**: Lista raportów posortowana chronologicznie (od najnowszego), data utworzenia, okres analizy, podgląd treści.
-   **Kluczowe komponenty widoku**:
    -   `Przycisk "Generuj nowy raport"`: Otwiera modal generowania raportu.
    -   `Lista Raportów`: Wyświetla wcześniej wygenerowane raporty z podstawowymi metadanymi.
    -   `Element Listy Raportów`: Pojedynczy raport z informacjami: data utworzenia, typ okresu (tydzień/miesiąc/kwartał), zakres dat analizy, opcje (podgląd, usuń).
    -   `Wskaźnik Ładowania`: Spinner podczas ładowania listy raportów.
    -   `Komponent Stanu Pustego`: Wyświetlany gdy brak jest wcześniej wygenerowanych raportów z zachętą do utworzenia pierwszego.
    -   `Paginacja`: Obsługa większej liczby raportów (offset-based pagination).
    -   `Dialog Potwierdzenia Usunięcia`: Do potwierdzania usuwania raportu.
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: Każdy raport wyświetla metadane w formie czytelnej karty. Kliknięcie na raport otwiera jego pełną treść w nowym widoku lub modalu. Możliwość szybkiego filtrowania po typie okresu. Komunikaty "toast" o powodzeniu/błędzie operacji usunięcia.
    -   **Dostępność**: Wszystkie elementy listy dostępne z klawiatury, odpowiednie role ARIA dla listy raportów.
    -   **Bezpieczeństwo**: RLS na poziomie API zapewnia dostęp tylko do własnych raportów. Potwierdzenie przed usunięciem raportu.

### Widok 6: Szczegóły Raportu

-   **Nazwa widoku**: Szczegóły Raportu
-   **Ścieżka widoku**: `/reports/{id}`
-   **Główny cel**: Wyświetlenie pełnej treści wygenerowanego raportu AI z możliwością skopiowania lub pobrania.
-   **Kluczowe informacje do wyświetlenia**: Pełna treść raportu, metadane (data utworzenia, zakres analizy), opcje eksportu.
-   **Kluczowe komponenty widoku**:
    -   `Nagłówek Raportu`: Wyświetla metadane (data utworzenia, okres analizy, zakres dat).
    -   `Treść Raportu`: Czytelnie sformatowana treść wygenerowana przez AI, z odpowiednimi nagłówkami sekcji i podziałami.
    -   `Przycisk "Skopiuj do schowka"`: Kopiuje całą treść raportu do schowka systemowego.
    -   `Przycisk "Pobierz jako TXT"`: Inicjuje pobranie raportu jako plik tekstowy.
    -   `Przycisk "Powrót"`: Nawigacja z powrotem do listy raportów.
    -   `Przycisk "Usuń raport"`: Usuwa raport po potwierdzeniu.
    -   `Toast`: Komunikaty o sukcesie kopiowania/pobierania.
-   **UX, dostępność i względy bezpieczeństwa**:
    -   **UX**: Treść raportu jest renderowana w czytelny sposób z zachowaniem struktury i formatowania (nagłówki, listy, akapity). Przyciski akcji są widoczne i łatwo dostępne. Po skopiowaniu/pobraniu użytkownik otrzymuje natychmiastowy feedback. Format pliku TXT zawiera nazwę zawierającą datę raportu (np., `raport_2025-10-31.txt`).
    -   **Dostępność**: Treść raportu jest semantycznie poprawna (odpowiednie tagi HTML dla nagłówków, list, akapitów). Wszystkie przyciski mają odpowiednie etykiety i są dostępne z klawiatury.
    -   **Bezpieczeństwo**: Dostęp do raportu tylko dla jego właściciela (weryfikacja na poziomie API i RLS). Treść raportu jest escapowana, aby zapobiec potencjalnym atakom XSS.

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

5.  **Generowanie i Przeglądanie Raportów AI**:
    -   Zalogowany użytkownik na stronie `/` klika przycisk "Generuj raport".
    -   Otwiera się `Modal Generowania Raportu` z opcjami wyboru okresu analizy (tydzień, miesiąc, kwartał). Domyślnie zaznaczony jest "miesiąc".
    -   Użytkownik wybiera okres i klika "Generuj".
    -   Jeśli użytkownik ma zbyt mało danych symptomów, wyświetlany jest komunikat informujący o braku wystarczających danych z sugestią zapisania większej liczby symptomów.
    -   Jeśli danych jest wystarczająco, wyświetlany jest wskaźnik ładowania z komunikatem "Generowanie raportu...".
    -   Po zakończeniu generowania (sukces):
        -   Modal zamyka się automatycznie.
        -   Wyświetlany jest toast z informacją o sukcesie.
        -   Użytkownik jest automatycznie przekierowywany na stronę `/reports/{id}` ze szczegółami nowo wygenerowanego raportu.
    -   Na stronie szczegółów raportu użytkownik może:
        -   Przeczytać pełną treść analizy AI.
        -   Skopiować raport do schowka (otrzymuje toast o powodzeniu).
        -   Pobrać raport jako plik tekstowy.
        -   Wrócić do listy wszystkich raportów (`/reports`).
        -   Usunąć raport (po potwierdzeniu).
    -   Użytkownik może przejść do strony `/reports` z menu nawigacji lub przez link w nagłówku.
    -   Na stronie `/reports` widzi listę wszystkich wcześniej wygenerowanych raportów.
    -   Kliknięcie na dowolny raport przenosi do strony `/reports/{id}` z jego pełną treścią.
    -   Użytkownik może usunąć raport bezpośrednio z listy (po potwierdzeniu), co powoduje odświeżenie listy i wyświetlenie toastu o sukcesie.

## 4. Układ i struktura nawigacji

Architektura opiera się na dwóch głównych layoutach Astro, które definiują strukturę nawigacyjną dla różnych stanów aplikacji.

-   **`AuthLayout.astro` (Dla niezalogowanych)**:
    -   Minimalistyczny układ bez stałej nawigacji.
    -   Służy jako kontener dla stron `/login` i `/register`.
    -   Nawigacja odbywa się poprzez linki umieszczone bezpośrednio w treści tych stron.

-   **`DashboardLayout.astro` (Dla zalogowanych)**:
    -   Zawiera stały nagłówek (`Header`) widoczny we wszystkich prywatnych widokach.
    -   **Nagłówek zawiera**:
        -   Logo aplikacji (link do `/`).
        -   Link nawigacyjny do `Moje Raporty` (`/reports`).
        -   Menu użytkownika (rozwijane po kliknięciu na awatar/ikonę), które zawiera:
            -   Adres e-mail zalogowanego użytkownika.
            -   Link do `Ustawień Konta` (`/settings`).
            -   Przycisk `Wyloguj`.
    -   Ten layout jest używany dla widoków `/` (Panel Główny), `/reports` (Historia Raportów), `/reports/{id}` (Szczegóły Raportu) i `/settings` (Ustawienia Konta).

Wszystkie ścieżki objęte przez `DashboardLayout` są chronione przez **middleware Astro**, które weryfikuje token JWT użytkownika. W przypadku braku ważnej sesji, użytkownik jest automatycznie przekierowywany do `/login`.

**Struktura nawigacji dla zalogowanych użytkowników**:
-   `/` (Panel Główny) - domyślny widok po zalogowaniu
-   `/reports` - dostępny przez link w nagłówku "Moje Raporty"
-   `/reports/{id}` - dostępny przez kliknięcie na raport z listy lub po wygenerowaniu nowego raportu
-   `/settings` - dostępny z rozwijanego menu użytkownika

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które będą stanowić fundament interfejsu użytkownika.

### Komponenty zarządzania symptomami

-   **`SymptomFormModal`**: Reużywalny komponent React, który obsługuje logikę formularza zarówno do tworzenia, jak i edycji symptomu. Jego stan (otwarty/zamknięty, tryb działania) jest zarządzany z poziomu nadrzędnego widoku (Panelu Głównego).
-   **`FilterPanel`**: Komponent zawierający wszystkie kontrolki filtrów (zakres dat, typ symptomu, część ciała) oraz przycisk do ich resetowania. Zarządza stanem filtrów i komunikuje zmiany do nadrzędnego widoku w celu odświeżenia danych.
-   **`SymptomList` / `SymptomListItem`**: Komponenty odpowiedzialne za renderowanie listy symptomów. `SymptomList` obsługuje logikę "infinite scroll", a `SymptomListItem` renderuje pojedynczy wpis wraz z menu kontekstowym (Edytuj/Usuń).

### Komponenty zarządzania raportami

-   **`ReportGenerationModal`**: Komponent React w formie modala, który pozwala użytkownikowi wybrać parametry generowania raportu (okres analizy: tydzień/miesiąc/kwartał). Zawiera formularz wyboru, przycisk "Generuj" oraz obsługę stanów ładowania i błędów. Po pomyślnym wygenerowaniu raportu kieruje użytkownika do strony szczegółów raportu.
-   **`ReportsList` / `ReportListItem`**: Komponenty do wyświetlania listy wygenerowanych raportów. `ReportsList` obsługuje paginację i stany pustej listy, a `ReportListItem` renderuje pojedynczy raport z metadanymi (data, okres, zakres dat) oraz menu akcji (podgląd, usuń).
-   **`ReportContent`**: Komponent renderujący treść raportu AI w czytelnym formacie. Parsuje tekst wygenerowany przez AI i stosuje odpowiednie formatowanie HTML (nagłówki, listy, akapity) zachowując semantyczną poprawność.
-   **`ReportActions`**: Komponent zawierający akcje dostępne dla raportu: "Skopiuj do schowka", "Pobierz jako TXT", "Usuń raport". Obsługuje logikę kopiowania, generowania i pobierania pliku tekstowego oraz wywoływania dialogu potwierdzenia usunięcia.
-   **`InsufficientDataMessage`**: Komponent wyświetlany w `ReportGenerationModal`, gdy użytkownik ma zbyt mało danych symptomów do wygenerowania raportu. Zawiera przyjazne wyjaśnienie i zachętę do zapisania większej liczby symptomów.

### Komponenty wspólne

-   **`ConfirmationDialog`**: Generyczny komponent okna dialogowego używany do potwierdzania krytycznych akcji, takich jak usuwanie symptomu, usuwanie raportu lub usuwanie konta.
-   **`Toast` / `Toaster`**: System powiadomień używany do dostarczania krótkich informacji zwrotnych o wyniku operacji (np. "Symptom został pomyślnie dodany", "Raport skopiowany do schowka").
-   **`LoadingSpinner`**: Reużywalny komponent wskaźnika ładowania używany podczas pobierania danych, generowania raportów lub wykonywania operacji asynchronicznych.
-   **`EmptyState`**: Generyczny komponent wyświetlany w przypadku pustych list (brak symptomów, brak raportów, brak wyników filtrowania). Przyjmuje props z niestandardowym komunikatem i opcjonalnym przyciskiem akcji.
-   **`Layouts` (`AuthLayout`, `DashboardLayout`)**: Komponenty Astro definiujące ogólną strukturę strony i nawigację dla odpowiednich części aplikacji.

## 6. Integracja z API

### Endpointy używane przez komponenty raportów

-   **`ReportGenerationModal`**:
    -   `POST /api/reports` - Wysyła żądanie generowania nowego raportu z wybranym `period_type`.
    -   Obsługuje kody odpowiedzi: 201 (sukces), 424 (niewystarczające dane), 500/503 (błędy serwisu AI).

-   **`ReportsList`**:
    -   `GET /api/reports` - Pobiera listę raportów użytkownika z obsługą paginacji (`offset`, `limit`).
    -   `DELETE /api/reports/{id}` - Usuwa wybrany raport z listy.

-   **Strona `/reports/{id}`**:
    -   `GET /api/reports/{id}` - Pobiera szczegóły konkretnego raportu.
    -   `DELETE /api/reports/{id}` - Usuwa raport ze strony szczegółów.

### Zarządzanie stanem

Wszystkie komponenty związane z raportami korzystają z TanStack Query (React Query) do:
-   Cachowania danych raportów.
-   Automatycznego odświeżania po mutacjach (generowanie, usuwanie).
-   Obsługi stanów ładowania i błędów.
-   Optymistycznych aktualizacji UI.

Przykładowe query keys:
-   `['reports']` - lista wszystkich raportów
-   `['reports', reportId]` - szczegóły konkretnego raportu
-   Mutacje automatycznie invalidują odpowiednie cache keys po sukcesie.

## 7. Przypadki brzegowe i obsługa błędów dla funkcjonalności raportów

### Niewystarczające dane do generowania raportu (HTTP 424)

-   **Kiedy**: Użytkownik próbuje wygenerować raport, ale ma zbyt mało zapisanych symptomów w wybranym okresie.
-   **Obsługa UI**:
    -   Wyświetlenie przyjaznego komunikatu w `InsufficientDataMessage` wewnątrz `ReportGenerationModal`.
    -   Komunikat powinien zawierać: "Nie masz wystarczającej liczby symptomów do wygenerowania raportu. Zapisz więcej symptomów i spróbuj ponownie."
    -   Przycisk "Generuj" pozostaje aktywny, ale po kliknięciu nie wysyła zapytania - zamiast tego pokazuje ten komunikat.
    -   Opcjonalnie: pokazać użytkownikowi liczbę zapisanych symptomów w wybranym okresie i minimalną wymaganą liczbę.

### Błąd serwisu AI (HTTP 500, 503)

-   **Kiedy**: Serwis AI (Openrouter.ai) jest niedostępny lub zwraca błąd podczas generowania raportu.
-   **Obsługa UI**:
    -   Wyświetlenie komunikatu błędu w toaście: "Nie udało się wygenerować raportu. Spróbuj ponownie za chwilę."
    -   Modal pozostaje otwarty, aby użytkownik mógł ponowić próbę.
    -   W przypadku błędu 503: dodatkowy komunikat o tymczasowej niedostępności serwisu.

### Raport nie istnieje lub został usunięty (HTTP 404)

-   **Kiedy**: Użytkownik próbuje otworzyć raport `/reports/{id}`, który nie istnieje lub został usunięty.
-   **Obsługa UI**:
    -   Przekierowanie do strony `/reports` z komunikatem toastu: "Raport nie został znaleziony."
    -   Opcjonalnie: wyświetlenie dedykowanej strony błędu 404 z przyciskiem powrotu do listy raportów.

### Brak dostępu do raportu (HTTP 403)

-   **Kiedy**: Użytkownik próbuje uzyskać dostęp do raportu należącego do innego użytkownika (teoretycznie niemożliwe z UI, ale możliwe przez bezpośredni URL).
-   **Obsługa UI**:
    -   Przekierowanie do strony `/reports` z komunikatem toastu: "Nie masz dostępu do tego raportu."

### Pusta lista raportów

-   **Kiedy**: Użytkownik nigdy nie wygenerował żadnego raportu.
-   **Obsługa UI**:
    -   Wyświetlenie komponentu `EmptyState` z komunikatem: "Nie masz jeszcze żadnych raportów."
    -   Przycisk akcji: "Generuj pierwszy raport" - otwiera `ReportGenerationModal`.
    -   Opcjonalnie: krótkie wyjaśnienie czym są raporty i jak mogą pomóc.

### Błąd podczas kopiowania do schowka

-   **Kiedy**: Przeglądarka nie obsługuje Clipboard API lub użytkownik nie wyraził zgody.
-   **Obsługa UI**:
    -   Wyświetlenie toastu z błędem: "Nie udało się skopiować do schowka."
    -   Fallback: automatyczne zaznaczenie całej treści raportu, aby użytkownik mógł ręcznie skopiować (Ctrl+C).

### Długi czas generowania raportu

-   **Kiedy**: Generowanie raportu przez AI trwa dłużej niż zwykle (>10 sekund).
-   **Obsługa UI**:
    -   Wyświetlenie animowanego spinnera z komunikatem: "Generowanie raportu... To może potrwać chwilę."
    -   Po 20 sekundach: dodanie informacji: "Raport jest bardziej szczegółowy niż zwykle. Dziękujemy za cierpliwość."
    -   Brak timeoutu po stronie klienta - czekamy na odpowiedź serwera lub błąd.

### Strona szczegółów raportu podczas ładowania

-   **Kiedy**: Strona `/reports/{id}` ładuje dane raportu z API.
-   **Obsługa UI**:
    -   Wyświetlenie skeleton loader lub spinnera na miejscu treści raportu.
    -   Nagłówek i przyciski akcji pozostają widoczne, ale nieaktywne (disabled).

### Usuwanie raportu podczas przeglądania

-   **Kiedy**: Użytkownik usuwa raport ze strony `/reports/{id}`.
-   **Obsługa UI**:
    -   Wyświetlenie `ConfirmationDialog`: "Czy na pewno chcesz usunąć ten raport? Tej operacji nie można cofnąć."
    -   Po potwierdzeniu: przekierowanie do `/reports` z toastem: "Raport został usunięty."
    -   Invalidacja cache dla `['reports']` i `['reports', reportId]`.
