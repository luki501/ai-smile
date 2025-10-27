<conversation_summary>
<decisions>
1. Zaakceptowano wszystkie 10 przedstawionych rekomendacji dotyczących architektury interfejsu użytkownika, które posłużą jako fundament dla etapu implementacyjnego. Ustalono, że należy postępować zgodnie z tymi wytycznymi w celu zbudowania spójnego i funkcjonalnego MVP.
</decisions>
<matched_recommendations>
1. **Struktura Layoutów**: Zostaną utworzone dwa oddzielne layouty Astro: `AuthLayout.astro` dla publicznych stron uwierzytelniania (logowanie, rejestracja) oraz `DashboardLayout.astro` dla prywatnej części aplikacji dostępnej po zalogowaniu, zawierającej nawigację i panel użytkownika.
2. **Zarządzanie Stanem**: Do zarządzania stanem serwera (dane z API, paginacja, cachowanie) zostanie wykorzystana biblioteka `TanStack Query` (React Query). Do zarządzania lokalnym stanem UI (np. stan formularzy) wystarczające będą wbudowane hooki Reacta (`useState`, `useContext`).
3. **Reużywalne Komponenty**: Zostanie stworzony jeden, reużywalny komponent React `SymptomFormModal`, który będzie obsługiwał zarówno dodawanie, jak i edycję symptomów, co zapewni spójność i zredukuje duplikację kodu.
4. **Obsługa Błędów API**: Zostanie wdrożony scentralizowany mechanizm obsługi błędów. Błędy walidacji (422) będą wyświetlane przy polach formularza, a błędy ogólne (np. 500) za pomocą powiadomień "toast". Błędy autoryzacji (401) spowodują przekierowanie na stronę logowania.
5. **Nieskończone Przewijanie ("Infinite Scroll")**: Funkcjonalność dynamicznego doładowywania listy symptomów zostanie zaimplementowana z użyciem `Intersection Observer API` we współpracy z paginacją (`offset`, `limit`) udostępnianą przez API.
6. **Optymalizacja Filtrów**: Interakcja z filtrami listy symptomów będzie zoptymalizowana przez zastosowanie mechanizmu "debouncing", aby uniknąć nadmiernej liczby zapytań do API podczas ich zmiany przez użytkownika.
7. **Responsywność (RWD)**: Interfejs będzie projektowany w podejściu "mobile-first". Panel filtrów na urządzeniach mobilnych będzie domyślnie zwinięty lub dostępny w modalu, aby oszczędzać przestrzeń ekranu.
8. **Ochrona Tras i Zarządzanie Sesją**: Middleware w Astro będzie odpowiedzialny za ochronę prywatnych tras aplikacji. Będzie weryfikować sesję użytkownika na podstawie tokena JWT z Supabase przechowywanego w ciasteczkach i przekierowywać do logowania w razie potrzeby.
9. **Bezpieczeństwo Usuwania Konta**: Proces usuwania konta będzie zabezpieczony dodatkowym krokiem potwierdzającym (np. poprzez wpisanie hasła lub frazy kluczowej), aby zminimalizować ryzyko przypadkowej i nieodwracalnej utraty danych.
10. **Centralizacja Danych Statycznych**: Predefiniowane listy (typy symptomów, części ciała) zostaną zdefiniowane w jednym, współdzielonym pliku (`src/lib/symptoms/symptoms.constants.ts`), aby zapewnić spójność między UI a logiką walidacji ("single source of truth").
</matched_recommendations>
<ui_architecture_planning_summary>
Na podstawie analizy wymagań produktu, stosu technologicznego i planu API, opracowano kompleksową strategię dla architektury interfejsu użytkownika MVP.

**a. Główne wymagania dotyczące architektury UI**
Aplikacja zostanie zbudowana przy użyciu Astro 5 jako frameworka, z React 19 do renderowania dynamicznych i interaktywnych komponentów UI. Za warstwę wizualną odpowiadać będzie Tailwind 4 wraz z biblioteką gotowych komponentów Shadcn/ui. Podstawą struktury będą dwa layouty: jeden dla procesu uwierzytelniania i drugi dla głównego panelu aplikacji.

**b. Kluczowe widoki, ekrany i przepływy użytkownika**
-   **Widoki Uwierzytelniania**: Strony logowania, rejestracji oraz (w przyszłości) resetowania hasła.
-   **Panel Główny**: Centralny widok aplikacji po zalogowaniu, prezentujący chronologiczną listę symptomów z możliwością filtrowania.
-   **Przepływy**:
    -   **Rejestracja i Logowanie**: Standardowe przepływy z wykorzystaniem formularzy i przekierowań.
    -   **Zarządzanie Symptomami (CRUD)**: Dodawanie i edycja wpisów odbywać się będzie w jednym, spójnym oknie modalnym. Usuwanie będzie wymagało dodatkowego potwierdzenia w oknie dialogowym.
    -   **Przeglądanie i Filtrowanie**: Lista będzie wspierać "infinite scroll". Panel filtrów pozwoli na dynamiczne zawężanie wyników według daty, typu symptomu i części ciała.

**c. Strategia integracji z API i zarządzania stanem**
Integracja z backendem będzie oparta na zdefiniowanym REST API. Do zarządzania cyklem życia danych z serwera (pobieranie, buforowanie, aktualizowanie) zostanie użyta biblioteka `@tanstack/react-query`. Zapewni to optymalną wydajność i uprości logikę obsługi stanów ładowania, błędów oraz paginacji. Prosty stan po stronie klienta (np. otwarcie modala, zawartość pól formularza) będzie zarządzany przez hooki Reacta.

**d. Kwestie dotyczące responsywności, dostępności i bezpieczeństwa**
Projekt UI będzie w pełni responsywny, z podejściem "mobile-first". Bezpieczeństwo zostanie zapewnione na poziomie routingu przez middleware Astro, które będzie chronić dostęp do prywatnych części aplikacji w oparciu o sesję JWT Supabase. Zaprojektowano również bezpieczny, wieloetapowy proces usuwania konta użytkownika w celu ochrony przed przypadkowym działaniem. Podstawowe zasady dostępności (a11y) będą stosowane, chociaż zaawansowane funkcje w tym zakresie są poza zakresem MVP.
</ui_architecture_planning_summary>
<unresolved_issues>
1.  **Szczegółowy Projekt UI/UX**: Mimo że architektura i komponenty są zaplanowane, brakuje szczegółowych makiet (wireframes/mockups). Wygląd i dokładne rozmieszczenie elementów w komponentach takich jak modal, filtry czy powiadomienia "toast" będą wymagały doprecyzowania na etapie implementacji.
2.  **Pełny Przepływ Resetowania Hasła**: Zidentyfikowano potrzebę stworzenia strony do resetowania hasła, jednak szczegółowy przepływ interakcji użytkownika (formularz zgłoszeniowy, obsługa linku z e-maila, formularz zmiany hasła) nie został jeszcze w pełni zaprojektowany.
3.  **Treści i Komunikaty (Copywriting)**: Precyzyjne treści komunikatów o błędach, sukcesie, tekstów w oknach potwierdzeń oraz etykiet w interfejsie wymagają zdefiniowania w celu zapewnienia jasnej i spójnej komunikacji z użytkownikiem.
</unresolved_issues>
</conversation_summary>
