<conversation_summary>
<decisions>
1.  Zostanie utworzona dedykowana tabela `profiles` do przechowywania danych aplikacji użytkownika, która będzie miała relację jeden-do-jednego z wbudowaną tabelą `auth.users` Supabase.
2.  Predefiniowane listy dla typów symptomów i części ciała zostaną zaimplementowane jako typy `ENUM` w PostgreSQL.
3.  Zastosowana zostanie strategia indeksowania obejmująca indeks złożony (`user_id`, `occurred_at DESC`) w celu optymalizacji sortowania oraz osobne indeksy dla kolumn `symptom_type` i `body_part` w celu przyspieszenia filtrowania.
4.  Kluczowym mechanizmem bezpieczeństwa będzie Row-Level Security (RLS), włączone dla tabel `profiles` i `symptoms`, aby zapewnić, że użytkownicy mają dostęp wyłącznie do swoich danych.
5.  Integralność danych zostanie zapewniona przez użycie klucza obcego z opcją `ON DELETE CASCADE`, co spowoduje automatyczne usunięcie powiązanych symptomów po usunięciu użytkownika.
6.  Wszystkie kolumny przechowujące datę i czas (np. `occurred_at`, `created_at`) będą używać typu danych `TIMESTAMPTZ` w celu poprawnego zarządzania strefami czasowymi.
7.  Wymagane pola w tabeli `symptoms` (takie jak `user_id`, `symptom_type`) będą miały ograniczenie `NOT NULL`.
8.  Proces tworzenia profilu użytkownika zostanie zautomatyzowany za pomocą funkcji i wyzwalacza (trigger) w bazie danych, uruchamianego po każdej nowej rejestracji w `auth.users`.
9.  Klucz główny dla tabeli `symptoms` zostanie zaimplementowany jako auto-inkrementowana liczba całkowita (`bigint`), a nie `UUID`.
10. Zaawansowane techniki skalowalności, takie jak partycjonowanie tabel, nie są konieczne dla wersji MVP i zostaną pominięte.
</decisions>

<matched_recommendations>
1.  Utworzenie tabeli `profiles` w celu oddzielenia danych aplikacji od danych autentykacyjnych `auth.users`, co jest zgodne z najlepszymi praktykami Supabase.
2.  Zastosowanie typów `ENUM` dla statycznych, predefiniowanych list w celu zapewnienia spójności i wydajności danych.
3.  Implementacja strategii indeksowania w celu zapewnienia wysokiej wydajności zapytań, kluczowej dla responsywności interfejsu użytkownika (sortowanie, filtrowanie).
4.  Wykorzystanie Row-Level Security (RLS) jako podstawowego mechanizmu kontroli dostępu do danych, gwarantującego prywatność użytkowników.
5.  Użycie opcji `ON DELETE CASCADE` w kluczach obcych w celu zautomatyzowania procesu usuwania danych i utrzymania spójności referencyjnej.
6.  Zastosowanie typu `TIMESTAMPTZ` dla wszystkich znaczników czasu w celu uniknięcia problemów ze strefami czasowymi.
7.  Automatyzacja logiki biznesowej (tworzenie profilu) na poziomie bazy danych za pomocą wyzwalaczy, co upraszcza kod aplikacji i zwiększa niezawodność.
8.  Pominięcie zaawansowanych technik optymalizacyjnych (np. partycjonowania) na etapie MVP na rzecz prostszych i wystarczających rozwiązań, takich jak indeksowanie.
</matched_recommendations>

<database_planning_summary>
Na podstawie wymagań produktu i dyskusji technicznej zaplanowano schemat bazy danych PostgreSQL dla aplikacji AI-Smile, zoptymalizowany pod kątem wykorzystania z platformą Supabase.

a. **Główne wymagania dotyczące schematu bazy danych:**
Schemat musi obsługiwać pełen cykl życia danych użytkownika i jego symptomów. Obejmuje to bezpieczną rejestrację i logowanie (obsługiwane przez Supabase Auth), przechowywanie informacji o profilach użytkowników oraz operacje CRUD (Create, Read, Update, Delete) na wpisach dotyczących symptomów. Kluczowe jest zapewnienie wydajnego filtrowania i sortowania danych w głównym widoku aplikacji.

b. **Kluczowe encje i ich relacje:**
-   `auth.users`: Wbudowana tabela Supabase do autentykacji. Stanowi źródło prawdy o tożsamości użytkownika.
-   `public.profiles`: Tabela przechowująca dodatkowe dane użytkowników. Posiada relację **jeden-do-jednego** z `auth.users` (połączone przez `id` typu `uuid`). Wpis w tej tabeli jest tworzony automatycznie przez trigger po rejestracji nowego użytkownika.
-   `public.symptoms`: Główna tabela przechowująca wpisy o symptomach. Posiada relację **wiele-do-jednego** z tabelą `public.profiles` poprzez klucz obcy `user_id`. Każdy wpis należy do jednego użytkownika. Tabela wykorzystuje typy `ENUM` (`symptom_type`, `body_part`) do walidacji danych wejściowych.

c. **Ważne kwestie dotyczące bezpieczeństwa i skalowalności:**
-   **Bezpieczeństwo:** Podstawą jest mechanizm Row-Level Security (RLS) włączony dla tabel `profiles` i `symptoms`. Zdefiniowane polityki (`POLICY`) ściśle ograniczają dostęp, pozwalając użytkownikom na odczyt i modyfikację wyłącznie własnych danych (`auth.uid() = user_id`).
-   **Skalowalność:** Na etapie MVP skalowalność jest zapewniona przez przemyślaną strategię indeksowania. Indeks złożony na `(user_id, occurred_at DESC)` jest kluczowy dla głównej funkcjonalności (chronologiczna lista), a dodatkowe indeksy wspierają filtrowanie. Partycjonowanie tabeli nie jest konieczne, ale pozostaje opcją na przyszłość w razie znacznego wzrostu ilości danych.

d. **Integralność i spójność danych:**
Integralność jest zapewniona na kilku poziomach: relacji (`FOREIGN KEY`), ograniczeń (`NOT NULL`), typów danych (`ENUM`) oraz automatyzacji procesów (`TRIGGER` do tworzenia profili), co razem tworzy spójny i niezawodny model danych.
</database_planning_summary>

<unresolved_issues>
Wszystkie kluczowe kwestie architektoniczne dotyczące schematu bazy danych dla MVP zostały omówione i rozstrzygnięte. Nie zidentyfikowano żadnych nierozwiązanych problemów blokujących przejście do następnego etapu, którym jest implementacja schematu.
</unresolved_issues>
</conversation_summary>