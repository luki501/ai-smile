# Dokument wymagań produktu (PRD) - AI-Smile

## 1. Przegląd produktu

### 1.1 Nazwa produktu
AI-Smile

### 1.2 Cel produktu
AI-Smile to aplikacja webowa przeznaczona do śledzenia i analizy wpływu leków na przebieg stwardnienia rozsianego. Aplikacja umożliwia systematyczne dokumentowanie przyjmowanych leków, obserwowanych symptomów, działań niepożądanych oraz parametrów zdrowotnych, a następnie wykorzystuje sztuczną inteligencję do analizy korelacji między terapią a stanem zdrowia pacjenta.

### 1.3 Grupa docelowa
Aplikacja jest projektowana dla pojedynczego użytkownika - pacjentki chorej na stwardnienie rozsiane. Jest to projekt osobisty/akademicki bez komercyjnych aspiracji, przeznaczony do lokalnego użytkowania.

### 1.4 Stack techniczny
- Frontend: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- Backend: Astro API endpoints, Supabase (PostgreSQL)
- AI: OpenAI API (GPT-4, GPT-4o) / Anthropic API (Claude 3.5 Sonnet)
- Wykresy: Recharts lub Chart.js
- Deployment: Lokalne użycie (development mode)

### 1.5 Model biznesowy
Brak monetyzacji. Aplikacja tworzona jest jako projekt osobisty dla potrzeb jednego użytkownika (żony developera). Nie ma planów komercjalizacji ani rozszerzenia na szerszą grupę użytkowników.

### 1.6 Dedykacja
Aplikacja dedykowana jest Kwiatuszkowi.

## 2. Problem użytkownika

### 2.1 Kontekst medyczny
Stwardnienie rozsiane (SM) to przewlekła choroba neurologiczna charakteryzująca się zmiennym przebiegiem i różnorodnością objawów. Pacjenci z SM często przyjmują jednocześnie wiele leków (typowo 3-10 różnych preparatów), które mogą wywoływać różnorodne działania niepożądane.

### 2.2 Główne wyzwania
Pacjentka ze stwardnieniem rozsianym staje przed następującymi wyzwaniami:

1. Konieczność systematycznego śledzenia przyjmowania wielu leków jednocześnie
2. Monitorowanie zmienności i nasilenia symptomów choroby w czasie
3. Identyfikacja działań niepożądanych terapii
4. Śledzenie parametrów zdrowotnych (waga, ciśnienie krwi, ogólne samopoczucie)
5. Identyfikacja korelacji między przyjmowanymi lekami a stanem zdrowia
6. Brak narzędzia pozwalającego na kompleksową analizę zebranych danych
7. Trudność w obiektywnej ocenie skuteczności terapii

### 2.3 Aktualny stan
Obecnie pacjentka nie ma dedykowanego narzędzia do systematycznego gromadzenia i analizy danych zdrowotnych. Śledzenie informacji odbywa się prawdopodobnie w sposób nieustrukturyzowany (notatki papierowe, aplikacje ogólnego przeznaczenia), co utrudnia identyfikację trendów i korelacji.

### 2.4 Oczekiwane rozwiązanie
Aplikacja AI-Smile ma umożliwić:
- Proste i szybkie rejestrowanie codziennych danych zdrowotnych
- Elastyczność w wypełnianiu raportów (większość pól opcjonalna)
- Systematyczne gromadzenie historycznych danych w ustrukturyzowanej formie
- Automatyczną analizę zebranych danych z wykorzystaniem zaawansowanych modeli AI
- Wizualizację kluczowych parametrów zdrowotnych w czasie
- Identyfikację wzorców i korelacji między terapią a objawami choroby

## 3. Wymagania funkcjonalne

### 3.1 Zarządzanie lekami

#### 3.1.1 Dodawanie leków
- Formularz z polami: nazwa leku, masa substancji aktywnej
- Walidacja: oba pola wymagane
- Zapisywanie do bazy danych Supabase
- Automatyczne przypisanie do użytkownika (user_id)
- Timestamp utworzenia (created_at)

#### 3.1.2 Lista leków
- Wyświetlanie wszystkich leków użytkownika
- Sortowanie chronologiczne (najnowsze na górze)
- Przycisk "Dodaj lek" prowadzący do formularza
- Dla każdego leku wyświetlanie: nazwa, masa substancji aktywnej
- Możliwość przejścia do edycji leku

#### 3.1.3 Edycja leków
- Formularz edycji z polami wypełnionymi aktualnymi wartościami
- Możliwość zmiany nazwy i masy substancji aktywnej
- Zapisywanie zmian z odpowiednią walidacją
- Komunikat sukcesu po zapisaniu

#### 3.1.4 Usuwanie leków
- Możliwość usunięcia leku z listy
- Dialog potwierdzenia przed usunięciem
- Obsługa przypadku gdy lek jest przypisany do historycznych raportów
- Komunikat sukcesu po usunięciu

### 3.2 Raporty dzienne

#### 3.2.1 Tworzenie raportu
Formularz z następującymi polami:

Wymagane:
- Data raportu (type: date)

Opcjonalne:
- Lista przyjętych leków (checkboxy z leków użytkownika)
- Symptomy SM (multi-select z predefiniowanej listy + opcja "Inne" z polem tekstowym)
- Działania niepożądane (multi-select z predefiniowanej listy + opcja "Inne" z polem tekstowym)
- Nasilenie ogólne (slider/select 1-4)
- Samopoczucie (wizualna skala buźek 1-4)
- Waga (input numeryczny z jednostką kg)
- Ciśnienie krwi (pole tekstowe format: "skurczowe/rozkurczowe/puls")

Funkcjonalność:
- Możliwość zapisu niepełnego raportu (tylko z datą)
- Walidacja unikalności daty (jeden raport dziennie)
- Jeśli raport na daną datę istnieje: komunikat i link do edycji
- Możliwość utworzenia pierwszego raportu bez listy leków
- Timestamp utworzenia (created_at)
- Auto-save do tabeli daily_reports

#### 3.2.2 Predefiniowane listy

Lista symptomów SM:
- Zmęczenie
- Zawroty głowy
- Problemy z równowagą
- Zaburzenia wzroku
- Drętwienie kończyn
- Słabość mięśni
- Problemy z koordynacją
- Ból
- Sztywność mięśni
- Problemy z pamięcią/koncentracją
- Inne (pole tekstowe)

Lista działań niepożądanych:
- Mdłości
- Ból głowy
- Problemy żołądkowo-jelitowe
- Bezsenność
- Wysypka skórna
- Nadmierna senność
- Utrata apetytu
- Inne (pole tekstowe)

#### 3.2.3 Timeline raportów
- Chronologiczna lista wszystkich raportów
- Sortowanie od najnowszych do najstarszych
- Dla każdego raportu wyświetlanie: data, liczba przyjętych leków, liczba symptomów, samopoczucie (buźka)
- Kliknięcie w raport prowadzi do edycji
- Przycisk "Nowy raport" na górze listy
- Infinite scroll lub paginacja dla dużej liczby raportów

#### 3.2.4 Edycja raportu
- Formularz identyczny jak przy tworzeniu
- Wszystkie pola wypełnione aktualnymi wartościami
- Możliwość edycji wszystkich pól (włącznie z datą)
- Walidacja unikalności daty (z wyłączeniem edytowanego rekordu)
- Zapisywanie timestamp'u ostatniej modyfikacji (updated_at)
- Komunikat sukcesu po zapisaniu
- Opcja powrotu do timeline bez zapisywania

#### 3.2.5 Usuwanie raportu
- Przycisk "Usuń" w formularzu edycji
- Dialog potwierdzenia przed usunięciem
- Informacja o nieodwracalności operacji
- Przekierowanie do timeline po usunięciu
- Komunikat sukcesu

#### 3.2.6 Obsługa pierwszego użycia
- Jeśli brak leków w bazie: komunikat informacyjny w formularzu
- Link do /medications/new z sekcji leków w formularzu
- Możliwość zapisania raportu bez wybranych leków
- Sekcja leków ukryta lub wyszarzona jeśli lista pusta

### 3.3 Analizy AI

#### 3.3.1 Generowanie analizy
- Dedykowana strona /analyses
- Dropdown wyboru modelu AI:
  - GPT-4o
  - GPT-4
  - Claude 3.5 Sonnet
- Wyświetlanie liczby dostępnych dni danych
- Przycisk "Generuj analizę" (aktywny gdy ≥7 dni danych)
- Jeśli <7 dni: komunikat "Po zebraniu 7 dni danych będzie możliwe wygenerowanie pierwszej analizy"
- Loading state podczas generowania (spinner + komunikat "Trwa generowanie analizy...")
- Obsługa błędów API (timeouts, rate limits, błędy sieci)
- Retry mechanism w przypadku błędów przejściowych

#### 3.3.2 Prompt dla AI
Wysyłane dane powinny zawierać:
- Zakres dat analizy (date_from, date_to)
- Lista wszystkich raportów dziennych w zakresie
- Lista wszystkich leków użytkownika
- Instrukcje dla modelu AI co do formatu odpowiedzi

Struktura promptu (do doprecyzowania w implementacji):
- Wprowadzenie: kontekst medyczny (SM), cel analizy
- Dane wejściowe: strukturyzowane dane z raportów
- Pytania analityczne: korelacje leków z symptomami, trendy, obserwacje
- Format odpowiedzi: sekcje (podsumowanie, obserwacje, rekomendacje)

#### 3.3.3 Wyświetlanie analizy
- Card z wygenerowaną analizą
- Metadata: data wygenerowania, użyty model, zakres dat
- Sformatowany tekst (zachowanie struktury z odpowiedzi AI)
- Przycisk "Generuj nową analizę"
- Przycisk "Powrót do historii"

#### 3.3.4 Historia analiz
- Lista wszystkich wygenerowanych analiz
- Sortowanie od najnowszych
- Dla każdej analizy: data generowania, model, zakres dat, początek tekstu
- Kliknięcie rozwija pełny tekst analizy
- Możliwość usunięcia analizy (dialog potwierdzenia)
- Paginacja lub infinite scroll

### 3.4 Wizualizacje

#### 3.4.1 Wykres wagi
- Wykres liniowy: oś X - data, oś Y - waga (kg)
- Interaktywne tooltips z dokładnymi wartościami
- Wyświetlanie tylko dat z wypełnionym polem wagi
- Automatyczne skalowanie osi Y
- Responsywność (dostosowanie do rozmiaru ekranu)
- Brak danych: komunikat "Brak danych o wadze do wyświetlenia"

#### 3.4.2 Wykres ciśnienia
- Wykres liniowy z dwiema liniami:
  - Ciśnienie skurczowe (górna linia)
  - Ciśnienie rozkurczowe (dolna linie)
- Oś X: data, oś Y: ciśnienie (mmHg)
- Parsowanie pola tekstowego "skurczowe/rozkurczowe/puls"
- Interaktywne tooltips z pełnymi danymi (włącznie z pulsem)
- Legenda rozróżniająca linie
- Responsywność
- Brak danych: komunikat "Brak danych o ciśnieniu do wyświetlenia"

#### 3.4.3 Dashboard (strona główna)
- Quick stats:
  - Liczba raportów (total)
  - Liczba leków w terapii
  - Ostatni raport (data)
  - Liczba dostępnych analiz
- Shortcut: przycisk "Dodaj raport dzienny"
- Mini-preview ostatnich 3 raportów
- Link do pełnego timeline
- Wykresy wagi i ciśnienia (ostatnie 30 dni)

### 3.5 Nawigacja i routing

#### 3.5.1 Struktura aplikacji
```
/                          → Dashboard (quick stats, shortcut)
/medications               → Lista leków, przycisk "Dodaj lek"
/medications/new           → Formularz nowego leku
/medications/edit/[id]     → Formularz edycji leku
/reports                   → Timeline raportów dziennych
/reports/new               → Formularz nowego raportu
/reports/edit/[id]         → Formularz edycji raportu
/analyses                  → Historia analiz AI, przycisk "Generuj nową"
/analyses/new              → Strona generowania nowej analizy
```

#### 3.5.2 Nawigacja główna (navbar)
- Logo/nazwa aplikacji (link do /)
- Linki: Dashboard, Leki, Raporty, Analizy
- Responsywne menu mobilne (hamburger)
- Aktywna sekcja podświetlona
- Sticky positioning przy scrollowaniu

### 3.6 Uwierzytelnianie i autoryzacja

#### 3.6.1 Podejście MVP
Na MVP zastosowane zostanie uproszczone podejście:
- Hard-coded user_id w middleware
- Brak formularza logowania
- Brak mechanizmu rejestracji
- Wszystkie zapytania do bazy filtrowane po user_id z middleware
- Single-user application (lokalne użycie)

#### 3.6.2 Zabezpieczenia na poziomie danych
- Wszystkie operacje CRUD filtrowane po user_id
- Supabase RLS (Row Level Security) może być wyłączone dla MVP
- Brak publicznych endpointów
- Walidacja danych wejściowych na poziomie API endpoints

### 3.7 Walidacja i error handling

#### 3.7.1 Walidacja formularzy
Leki:
- Nazwa: required, string, min 2 znaki, max 200 znaków
- Masa substancji aktywnej: required, string, min 1 znak, max 100 znaków

Raporty:
- Data: required, type date, nie może być z przyszłości, unique per user
- Leki: optional, array of uuids
- Symptomy: optional, array of strings
- Działania niepożądane: optional, array of strings
- Nasilenie: optional, integer 1-4
- Samopoczucie: optional, integer 1-4
- Waga: optional, positive number, max 500
- Ciśnienie: optional, string, max 50 znaków

#### 3.7.2 Komunikaty błędów
- Walidacja front-end: błędy pod polami formularza (czerwone)
- Błędy API: toast notifications
- Błędy sieci: komunikat retry + przycisk "Spróbuj ponownie"
- Błędy 404: dedykowana strona "Nie znaleziono"
- Błędy 500: komunikat "Wystąpił błąd serwera. Spróbuj ponownie później"

#### 3.7.3 Loading states
- Ładowanie listy leków: skeleton loaders
- Ładowanie timeline raportów: skeleton loaders
- Zapisywanie formularza: disable przycisku + spinner
- Generowanie analizy AI: fullscreen loader z komunikatem
- Ładowanie wykresów: spinner w miejscu wykresu

#### 3.7.4 Success feedback
- Zapisanie leku: toast "Lek został dodany"
- Edycja leku: toast "Zmiany zostały zapisane"
- Usunięcie leku: toast "Lek został usunięty"
- Zapisanie raportu: toast "Raport został zapisany"
- Usunięcie raportu: toast "Raport został usunięty"
- Wygenerowanie analizy: automatyczne przejście do widoku analizy

### 3.8 Responsywność i UX

#### 3.8.1 Breakpointy
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

#### 3.8.2 Layout mobilny
- Single column layout
- Hamburger menu w navbar
- Wykresy skalowane do szerokości ekranu
- Formularze: pełna szerokość inputów
- Listy: pojedyncza kolumna card

#### 3.8.3 Accessibility
- Semantyczne tagi HTML
- ARIA labels dla interactive elements
- Keyboard navigation (focus states)
- Color contrast spełniający WCAG AA
- Error messages powiązane z polami (aria-describedby)

## 4. Granice produktu

### 4.1 Funkcjonalności NIE wchodzące w zakres MVP

#### 4.1.1 Import/Export danych
- Import danych z plików (CSV, JSON, Excel)
- Export raportów do CSV
- Export analiz do PDF
- Backup/restore bazy danych

#### 4.1.2 Współdzielenie i współpraca
- Współdzielenie danych między użytkownikami
- Udostępnianie raportów lekarzom
- Grupy wsparcia / społeczność
- Komentarze i adnotacje współdzielone

#### 4.1.3 Integracje zewnętrzne
- Integracja z platformami zdrowotnymi (Apple Health, Google Fit)
- Synchronizacja z urządzeniami medycznymi (ciśnieniomierz, waga Bluetooth)
- Integracja z systemami EHR (Electronic Health Records)
- API dla aplikacji trzecich

#### 4.1.4 Aplikacje mobilne
- Dedykowana aplikacja iOS
- Dedykowana aplikacja Android
- Progressive Web App (PWA) z trybem offline

#### 4.1.5 Zaawansowane funkcje analityczne
- Zaawansowane filtry i wyszukiwanie
- Custom reports i dashboardy
- Predykcja przyszłych objawów
- Machine learning na własnych danych (poza AI API)
- Kalendarzowy widok raportów

#### 4.1.6 Notyfikacje i przypomnienia
- Push notifications
- Email reminders
- SMS reminders
- Przypomnienia o przyjęciu leków

#### 4.1.7 Tryb offline
- Progressive Web App
- Offline data storage
- Synchronizacja po powrocie online

#### 4.1.8 Zaawansowane zarządzanie danymi
- Dodawanie własnych symptomów do predefiniowanej listy (persistent)
- Historia zmian w raportach (audit log)
- Soft delete z możliwością przywrócenia
- Archiwizacja starych danych

#### 4.1.9 Customizacja
- Motywy kolorystyczne (dark mode)
- Konfiguracja predefiniowanych list
- Personalizacja dashboardu
- Ustawienia jednostek (kg vs lbs, mmHg vs kPa)

#### 4.1.10 Multi-user features
- System logowania i rejestracji
- Role i uprawnienia
- Profil użytkownika z ustawieniami
- Zarządzanie wieloma profilami pacjentów

### 4.2 Ograniczenia techniczne MVP

#### 4.2.1 Bezpieczeństwo
- Brak zaawansowanych mechanizmów autentykacji
- Brak szyfrowania danych at-rest (poza standardem Supabase)
- Brak audit logs
- Brak rate limiting na endpointach

#### 4.2.2 Wydajność
- Brak optymalizacji dla bardzo dużych zbiorów danych (>1000 raportów)
- Brak cachowania po stronie frontendu
- Brak lazy loading dla dużych list
- Podstawowa paginacja lub infinite scroll

#### 4.2.3 Deployment
- Lokalne użycie (development mode)
- Brak CI/CD pipeline
- Brak monitoringu i alertów
- Brak automated testing (unit, integration, e2e)

#### 4.2.4 Dostępność
- Wymaga połączenia z internetem (brak trybu offline)
- Testowane tylko na najnowszych przeglądarkach (Chrome, Firefox, Safari)
- Brak wsparcia dla starszych przeglądarek
- Brak optymalizacji dla bardzo wolnych połączeń

## 5. Historyjki użytkowników

### 5.1 Zarządzanie lekami

#### US-001: Dodanie nowego leku
Jako użytkowniczka
Chcę dodać nowy lek do mojej listy
Aby móc śledzić jego przyjmowanie i wpływ na zdrowie

Kryteria akceptacji:
- Dostępny przycisk "Dodaj lek" na stronie /medications
- Przycisk prowadzi do formularza na /medications/new
- Formularz zawiera pola: nazwa leku (required), masa substancji aktywnej (required)
- Walidacja: nazwa min 2 znaki, max 200 znaków
- Walidacja: masa min 1 znak, max 100 znaków
- Błędy walidacji wyświetlane pod polami formularza
- Przycisk "Zapisz" jest disabled podczas wysyłania
- Po zapisie: redirect do /medications
- Toast notification: "Lek został dodany"
- Lek widoczny na liście leków
- Lek zapisany w tabeli medications z user_id i created_at

#### US-002: Przeglądanie listy leków
Jako użytkowniczka
Chcę zobaczyć wszystkie moje leki
Aby mieć przegląd mojej aktualnej terapii

Kryteria akceptacji:
- Strona /medications wyświetla wszystkie leki użytkownika
- Każdy lek pokazuje: nazwę, masę substancji aktywnej
- Leki sortowane od najnowszych (created_at DESC)
- Przycisk "Dodaj lek" widoczny na górze listy
- Każdy lek ma przycisk/link "Edytuj" i "Usuń"
- Jeśli brak leków: komunikat "Nie masz jeszcze żadnych leków. Dodaj pierwszy lek."
- Loading state: skeleton loaders podczas ładowania
- Responsywny layout (mobile: single column, desktop: grid)

#### US-003: Edycja istniejącego leku
Jako użytkowniczka
Chcę edytować dane leku
Aby poprawić błąd lub zaktualizować dawkę

Kryteria akceptacji:
- Kliknięcie "Edytuj" prowadzi do /medications/edit/[id]
- Formularz identyczny jak przy dodawaniu
- Pola wypełnione aktualnymi wartościami leku
- Możliwość edycji nazwy i masy substancji aktywnej
- Ta sama walidacja jak przy tworzeniu
- Przycisk "Zapisz zmiany"
- Przycisk "Anuluj" (powrót do /medications bez zapisywania)
- Po zapisie: redirect do /medications
- Toast: "Zmiany zostały zapisane"
- Zaktualizowane dane widoczne na liście

#### US-004: Usunięcie leku
Jako użytkowniczka
Chcę usunąć lek z listy
Aby usunąć lek którego już nie przyjmuję

Kryteria akceptacji:
- Przycisk "Usuń" dostępny przy każdym leku na liście
- Kliknięcie wywołuje dialog potwierdzenia
- Dialog zawiera: "Czy na pewno chcesz usunąć ten lek? Tej operacji nie można cofnąć."
- Przyciski w dialogu: "Anuluj", "Usuń"
- Po potwierdzeniu: lek usunięty z bazy
- Toast: "Lek został usunięty"
- Lista leków odświeżona (bez usuniętego leku)
- Jeśli lek przypisany do raportów: brak efektu na historyczne raporty (relacja zachowana)

#### US-005: Brak leków - komunikat
Jako użytkowniczka odwiedzająca aplikację po raz pierwszy
Chcę zobaczyć pomocny komunikat gdy nie mam leków
Aby wiedzieć co zrobić dalej

Kryteria akceptacji:
- Strona /medications bez leków wyświetla empty state
- Komunikat: "Nie masz jeszcze żadnych leków. Dodaj pierwszy lek aby móc go śledzić w raportach dziennych."
- Przycisk "Dodaj pierwszy lek" prowadzący do /medications/new
- Ikona lub ilustracja empty state
- Po dodaniu pierwszego leku: empty state znika

### 5.2 Raporty dzienne - tworzenie

#### US-006: Dodanie nowego raportu dziennego
Jako użytkowniczka
Chcę stworzyć raport dzienny
Aby udokumentować mój stan zdrowia i przyjęte leki

Kryteria akceptacji:
- Dostępny przycisk "Nowy raport" na /reports i na dashboard
- Przycisk prowadzi do /reports/new
- Formularz zawiera wszystkie pola raportu
- Pole "Data" jest required
- Pozostałe pola opcjonalne
- Możliwość zapisania raportu tylko z datą
- Sekcja leków: checkboxy dla wszystkich leków użytkownika
- Sekcja symptomów: multi-select z predefiniowanej listy + opcja "Inne"
- Pole "Inne symptomy": textarea, widoczne gdy "Inne" zaznaczone
- Sekcja działań niepożądanych: multi-select + "Inne"
- Pole "Inne działania": textarea, widoczne gdy "Inne" zaznaczone
- Nasilenie: radio buttons lub slider 1-4
- Samopoczucie: 4 buźki do wyboru (😞 😐 🙂 😊)
- Waga: input number z jednostką "kg"
- Ciśnienie: input text z placeholderem "120/80/72"
- Przycisk "Zapisz raport"
- Przycisk "Anuluj"
- Po zapisie: redirect do /reports
- Toast: "Raport został zapisany"

#### US-007: Tworzenie raportu bez leków w systemie
Jako użytkowniczka tworząca pierwszy raport
Chcę stworzyć raport nawet jeśli nie mam jeszcze leków
Aby nie być zablokowaną w użytkowaniu aplikacji

Kryteria akceptacji:
- Formularz /reports/new dostępny nawet gdy brak leków w bazie
- Jeśli brak leków: sekcja leków pokazuje komunikat
- Komunikat: "Nie masz jeszcze żadnych leków. Dodaj leki w zakładce Leki aby móc je śledzić."
- Link "Dodaj leki" prowadzący do /medications/new
- Możliwość zapisania raportu bez wybranych leków
- Reszta formularza działa normalnie
- Po dodaniu leków i ponownym wejściu: checkboxy leków widoczne

#### US-008: Walidacja unikalności daty
Jako użytkowniczka
Chcę być poinformowana gdy raport na daną datę już istnieje
Aby nie tworzyć duplikatów

Kryteria akceptacji:
- Wybór daty która już ma raport wywołuje walidację
- Komunikat błędu: "Raport na ten dzień już istnieje."
- Link w komunikacie: "Przejdź do edycji tego raportu"
- Kliknięcie linka prowadzi do /reports/edit/[id] istniejącego raportu
- Przycisk "Zapisz" jest disabled gdy data nieunique
- Walidacja działa real-time (onBlur lub onChange)
- Walidacja również po stronie backendu (API endpoint)

#### US-009: Walidacja daty w przyszłości
Jako użytkowniczka
Chcę być powstrzymana od utworzenia raportu z przyszłą datą
Aby zachować spójność danych

Kryteria akceptacji:
- Wybór daty z przyszłości wywołuje błąd walidacji
- Komunikat: "Nie możesz utworzyć raportu z datą z przyszłości"
- Przycisk "Zapisz" disabled gdy data w przyszłości
- Walidacja real-time
- Data dzisiejsza jest dozwolona

#### US-010: Wypełnianie raportu z predefiniowanymi listami
Jako użytkowniczka
Chcę szybko wybierać symptomy z listy
Aby nie musieć wpisywać ich ręcznie

Kryteria akceptacji:
- Sekcja "Symptomy SM" zawiera checkboxy:
  - Zmęczenie
  - Zawroty głowy
  - Problemy z równowagą
  - Zaburzenia wzroku
  - Drętwienie kończyn
  - Słabość mięśni
  - Problemy z koordynacją
  - Ból
  - Sztywność mięśni
  - Problemy z pamięcią/koncentracją
  - Inne (z polem tekstowym)
- Możliwość zaznaczenia wielu symptomów
- Checkbox "Inne" pokazuje textarea
- Zapisywane symptomy: array z nazwami zaznaczonych + text z "Inne"

#### US-011: Wypełnianie działań niepożądanych
Jako użytkowniczka
Chcę szybko wybierać działania niepożądane z listy
Aby dokumentować skutki uboczne leków

Kryteria akceptacji:
- Sekcja "Działania niepożądane" zawiera checkboxy:
  - Mdłości
  - Ból głowy
  - Problemy żołądkowo-jelitowe
  - Bezsenność
  - Wysypka skórna
  - Nadmierna senność
  - Utrata apetytu
  - Inne (z polem tekstowym)
- Możliwość zaznaczenia wielu
- Checkbox "Inne" pokazuje textarea
- Zapisywane jako array

#### US-012: Wybór samopoczucia za pomocą buźek
Jako użytkowniczka
Chcę wybrać moje samopoczucie za pomocą buźek
Aby intuicyjnie ocenić mój stan

Kryteria akceptacji:
- Sekcja "Samopoczucie" pokazuje 4 buźki:
  - 1: 😞 (bardzo złe)
  - 2: 😐 (słabe)
  - 3: 🙂 (dobre)
  - 4: 😊 (bardzo dobre)
- Kliknięcie buźki zaznacza ją (visual feedback)
- Możliwość zmiany wyboru
- Możliwość pozostawienia niewypełnionego
- Zapisywana wartość: integer 1-4

### 5.3 Raporty dzienne - przeglądanie i edycja

#### US-013: Przeglądanie timeline raportów
Jako użytkowniczka
Chcę zobaczyć wszystkie moje raporty w porządku chronologicznym
Aby śledzić historię mojego stanu zdrowia

Kryteria akceptacji:
- Strona /reports wyświetla listę wszystkich raportów
- Sortowanie: od najnowszych do najstarszych (data DESC)
- Każdy raport na liście pokazuje:
  - Data raportu
  - Liczba przyjętych leków (np. "3 leki")
  - Liczba symptomów (np. "5 symptomów")
  - Samopoczucie (buźka)
- Kliknięcie w raport prowadzi do /reports/edit/[id]
- Przycisk "Nowy raport" na górze listy
- Loading state: skeleton loaders
- Responsywny layout (karty raportów)

#### US-014: Pusta lista raportów
Jako użytkowniczka bez raportów
Chcę zobaczyć pomocny komunikat
Aby wiedzieć co zrobić dalej

Kryteria akceptacji:
- Strona /reports bez raportów pokazuje empty state
- Komunikat: "Nie masz jeszcze żadnych raportów. Utwórz pierwszy raport aby zacząć śledzić swój stan zdrowia."
- Przycisk "Utwórz pierwszy raport" → /reports/new
- Ikona lub ilustracja empty state

#### US-015: Edycja historycznego raportu
Jako użytkowniczka
Chcę poprawić błąd w starym raporcie
Aby dane były dokładne dla analizy AI

Kryteria akceptacji:
- Kliknięcie raportu z listy prowadzi do /reports/edit/[id]
- Formularz identyczny jak przy tworzeniu
- Wszystkie pola wypełnione aktualnymi wartościami
- Możliwość edycji wszystkich pól (włącznie z datą)
- Walidacja unikalności daty (z wyłączeniem edytowanego rekordu)
- Przycisk "Zapisz zmiany"
- Przycisk "Anuluj"
- Przycisk "Usuń raport" (opcjonalnie)
- Po zapisie: aktualizacja updated_at timestamp
- Redirect do /reports
- Toast: "Zmiany zostały zapisane"

#### US-016: Usunięcie raportu
Jako użytkowniczka
Chcę usunąć błędnie utworzony raport
Aby zachować czystość danych

Kryteria akceptacji:
- Przycisk "Usuń raport" w formularzu edycji
- Kliknięcie wywołuje dialog potwierdzenia
- Dialog: "Czy na pewno chcesz usunąć ten raport? Tej operacji nie można cofnąć."
- Przyciski: "Anuluj", "Usuń"
- Po potwierdzeniu: raport usunięty z bazy
- Redirect do /reports
- Toast: "Raport został usunięty"
- Raport znika z timeline

#### US-017: Walidacja edycji - zmiana daty na już istniejącą
Jako użytkowniczka edytująca raport
Chcę być powstrzymana od zmiany daty na taką która już ma raport
Aby nie tworzyć duplikatów

Kryteria akceptacji:
- Zmiana daty na już istniejącą (inna niż obecna) wywołuje błąd
- Komunikat: "Raport na ten dzień już istnieje"
- Przycisk "Zapisz" disabled
- Walidacja pomija obecnie edytowany raport
- Możliwość pozostawienia obecnej daty bez zmiany

#### US-018: Śledzenie czasu ostatniej modyfikacji
Jako użytkowniczka
Chcę wiedzieć kiedy ostatnio edytowałam raport
Aby mieć pewność co do świeżości danych

Kryteria akceptacji:
- Każda edycja raportu aktualizuje pole updated_at
- W formularzu edycji wyświetlana informacja: "Ostatnia modyfikacja: [data i czas]"
- Format daty: "31 października 2025, 14:30"
- Jeśli raport nigdy nie był edytowany: brak informacji lub "Utworzono: [created_at]"

### 5.4 Analizy AI

#### US-019: Sprawdzenie dostępności analiz
Jako użytkowniczka
Chcę wiedzieć czy mogę wygenerować analizę AI
Aby zrozumieć wymagania dotyczące danych

Kryteria akceptacji:
- Strona /analyses pokazuje liczbę dostępnych dni danych
- Komunikat: "Masz X dni danych"
- Jeśli <7 dni: informacja "Do pierwszej analizy potrzeba minimum 7 dni danych. Pozostało Y dni."
- Jeśli ≥7 dni: przycisk "Generuj nową analizę" jest aktywny
- Jeśli <7 dni: przycisk disabled z tooltipem wyjaśniającym

#### US-020: Generowanie nowej analizy AI
Jako użytkowniczka
Chcę wygenerować analizę AI moich danych
Aby zrozumieć korelacje między lekami a objawami

Kryteria akceptacji:
- Strona /analyses/new lub modal na /analyses
- Dropdown wyboru modelu AI:
  - GPT-4o
  - GPT-4
  - Claude 3.5 Sonnet
- Domyślnie wybrany: GPT-4o
- Informacja o zakresie dat analizy (automatycznie: wszystkie dostępne dane)
- Przycisk "Generuj analizę"
- Przycisk aktywny tylko gdy ≥7 dni danych
- Kliknięcie wywołuje API request do modelu AI
- Fullscreen loading state z komunikatem: "Trwa generowanie analizy... To może potrwać do minuty."
- Spinner animowany
- Po otrzymaniu odpowiedzi: automatyczny redirect do widoku analizy
- W przypadku błędu: komunikat błędu + przycisk "Spróbuj ponownie"

#### US-021: Wyświetlanie wygenerowanej analizy
Jako użytkowniczka
Chcę przeczytać wygenerowaną analizę AI
Aby zrozumieć wnioski dotyczące mojej terapii

Kryteria akceptacji:
- Card lub strona z pełną treścią analizy
- Metadata na górze:
  - Data wygenerowania: "Wygenerowano: 31 października 2025, 15:45"
  - Użyty model: "Model: GPT-4o"
  - Zakres dat: "Dane z okresu: 1-31 października 2025"
- Tekst analizy sformatowany (zachowane paragrafy, listy z odpowiedzi AI)
- Przycisk "Generuj nową analizę"
- Przycisk "Powrót do historii"
- Możliwość scrollowania długiej analizy
- Responsywny layout (czytelność na mobile)

#### US-022: Przeglądanie historii analiz
Jako użytkowniczka
Chcę zobaczyć wszystkie poprzednie analizy
Aby porównać wnioski z różnych okresów

Kryteria akceptacji:
- Strona /analyses wyświetla listę wszystkich analiz
- Sortowanie: od najnowszych (generated_at DESC)
- Każda analiza na liście pokazuje:
  - Data wygenerowania
  - Użyty model
  - Zakres dat analizy
  - Pierwsze 2-3 zdania tekstu (preview)
- Kliknięcie rozwija pełny tekst (accordion) lub prowadzi do widoku pełnej analizy
- Przycisk "Generuj nową analizę" na górze
- Loading state podczas ładowania historii
- Responsywny layout

#### US-023: Pusta historia analiz
Jako użytkowniczka bez analiz
Chcę zobaczyć komunikat zachęcający do wygenerowania pierwszej
Aby zrozumieć funkcjonalność

Kryteria akceptacji:
- Strona /analyses bez analiz pokazuje empty state
- Komunikat zależny od liczby dni danych:
  - Jeśli <7 dni: "Potrzebujesz minimum 7 dni danych aby wygenerować pierwszą analizę. Aktualnie masz X dni."
  - Jeśli ≥7 dni: "Nie masz jeszcze żadnych analiz. Wygeneruj pierwszą analizę aby uzyskać wgląd w swoją terapię."
- Przycisk "Generuj pierwszą analizę" (disabled jeśli <7 dni)
- Ikona lub ilustracja

#### US-024: Usunięcie analizy
Jako użytkowniczka
Chcę usunąć nieaktualną analizę
Aby zachować porządek w historii

Kryteria akceptacji:
- Każda analiza na liście ma przycisk "Usuń" (ikona kosza)
- Kliknięcie wywołuje dialog potwierdzenia
- Dialog: "Czy na pewno chcesz usunąć tę analizę?"
- Po potwierdzeniu: analiza usunięta z bazy
- Lista analiz odświeżona
- Toast: "Analiza została usunięta"

#### US-025: Obsługa błędów API AI
Jako użytkowniczka
Chcę być poinformowana gdy generowanie analizy się nie powiedzie
Aby móc spróbować ponownie

Kryteria akceptacji:
- Timeout (>60s): komunikat "Upłynął limit czasu. Spróbuj ponownie."
- Rate limit: komunikat "Osiągnięto limit zapytań. Spróbuj ponownie za kilka minut."
- Błąd sieci: komunikat "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- Błąd 500 z API: komunikat "Wystąpił błąd podczas generowania analizy. Spróbuj ponownie."
- Każdy komunikat ma przycisk "Spróbuj ponownie"
- Kliknięcie wywołuje ponowną próbę generowania
- Loading state zostaje przywrócony

### 5.5 Wizualizacje i Dashboard

#### US-026: Przeglądanie wykresu wagi
Jako użytkowniczka
Chcę zobaczyć wykres mojej wagi w czasie
Aby śledzić trendy

Kryteria akceptacji:
- Wykres dostępny na dashboard lub dedykowanej zakładce
- Wykres liniowy: oś X - daty, oś Y - waga (kg)
- Wyświetlanie tylko dat z wypełnionym polem wagi
- Tooltips interaktywne: hover pokazuje dokładną datę i wagę
- Automatyczne skalowanie osi Y (min-max z danymi + margines)
- Responsywny: dostosowanie do szerokości ekranu
- Jeśli brak danych: komunikat "Brak danych o wadze. Dodaj wagę w raportach dziennych."
- Loading state: spinner podczas ładowania danych

#### US-027: Przeglądanie wykresu ciśnienia
Jako użytkowniczka
Chcę zobaczyć wykres mojego ciśnienia w czasie
Aby monitorować parametry sercowo-naczyniowe

Kryteria akceptacji:
- Wykres dostępny na dashboard
- Wykres liniowy z dwiema liniami:
  - Ciśnienie skurczowe (czerwona/pomarańczowa linia)
  - Ciśnienie rozkurczowe (niebieska/zielona linia)
- Oś X: daty, oś Y: ciśnienie (mmHg)
- Legenda rozróżniająca linie
- Tooltips: hover pokazuje datę, ciśnienie skurczowe, rozkurczowe, puls
- Parsowanie pola tekstowego "120/80/72" na komponenty
- Jeśli format niepoprawny: pomijanie tego wpisu (nie crashowanie)
- Responsywny
- Jeśli brak danych: komunikat "Brak danych o ciśnieniu."
- Loading state

#### US-028: Dashboard - quick stats
Jako użytkowniczka
Chcę zobaczyć szybki przegląd moich danych na stronie głównej
Aby mieć natychmiastowy wgląd w stan aplikacji

Kryteria akceptacji:
- Strona / (dashboard) wyświetla karty z quick stats:
  - "Liczba raportów" - total count
  - "Liczba leków w terapii" - aktywne leki
  - "Ostatni raport" - data ostatniego raportu lub "Brak"
  - "Liczba analiz" - total count analiz AI
- Każda karta ma ikonę i wartość
- Kliknięcie karty prowadzi do odpowiedniej sekcji
- Wykresy wagi i ciśnienia (ostatnie 30 dni) pod statsami
- Przycisk call-to-action: "Dodaj raport dzienny"
- Loading states dla stats podczas ładowania

#### US-029: Dashboard - shortcut do nowego raportu
Jako użytkowniczka
Chcę szybko dodać raport z dashboardu
Aby nie przechodzić przez menu

Kryteria akceptacji:
- Duży, widoczny przycisk "Dodaj raport dzienny" na dashboard
- Przycisk prowadzi do /reports/new
- Alternatywnie: floating action button (FAB) zawsze widoczny
- Przycisk wyróżniony kolorystycznie (primary color)

#### US-030: Dashboard - preview ostatnich raportów
Jako użytkowniczka
Chcę zobaczyć na dashboard ostatnie raporty
Aby szybko przypomnieć sobie ostatnie wpisy

Kryteria akceptacji:
- Sekcja "Ostatnie raporty" na dashboard
- Wyświetlanie 3 najnowszych raportów
- Format identyczny jak na /reports timeline
- Link "Zobacz wszystkie raporty" → /reports
- Jeśli brak raportów: mini empty state z linkiem do tworzenia

### 5.6 Nawigacja i UX

#### US-031: Główna nawigacja
Jako użytkowniczka
Chcę łatwo poruszać się między sekcjami aplikacji
Aby szybko znaleźć potrzebne funkcje

Kryteria akceptacji:
- Navbar widoczny na wszystkich stronach
- Logo/nazwa "AI-Smile" po lewej (link do /)
- Linki: Dashboard, Leki, Raporty, Analizy
- Aktywna sekcja podświetlona (np. underline lub bold)
- Sticky positioning (pozostaje na górze przy scrollu)
- Na mobile: hamburger menu z rozwijanym menu
- Responsywne breakpointy
- Keyboard navigation (Tab, Enter)

#### US-032: Responsywność na urządzeniach mobilnych
Jako użytkowniczka używająca telefonu
Chcę komfortowo korzystać z aplikacji na małym ekranie
Aby móc dodawać raporty w każdej sytuacji

Kryteria akceptacji:
- Wszystkie strony responsywne dla mobile (<640px)
- Formularze: pełna szerokość inputów, wystarczające odstępy
- Listy: pojedyncza kolumna
- Wykresy: skalowane do szerokości ekranu, zachowana czytelność
- Navbar: hamburger menu
- Przyciski: wystarczająco duże touch targets (min 44x44px)
- Tesowane na Chrome Mobile, Safari iOS
- Brak horizontal scroll

#### US-033: Loading states
Jako użytkowniczka
Chcę widzieć że aplikacja pracuje gdy ładuje dane
Aby wiedzieć że nie zawiesiła się

Kryteria akceptacji:
- Lista leków: skeleton loaders podczas ładowania
- Timeline raportów: skeleton loaders
- Formularze podczas save: przycisk "Zapisz" disabled + spinner
- Generowanie analizy AI: fullscreen loader z tekstem i animacją
- Wykresy: spinner w miejscu wykresu podczas ładowania danych
- Dashboard stats: skeleton loaders
- Konsystentny design loading indicators w całej aplikacji

#### US-034: Toast notifications
Jako użytkowniczka
Chcę otrzymywać feedback po wykonaniu akcji
Aby wiedzieć że operacja się powiodła

Kryteria akceptacji:
- Sukces: zielony toast z checkmarkiem
- Błąd: czerwony toast z X
- Toast pojawia się w prawym górnym rogu
- Auto-dismiss po 3 sekundach
- Możliwość ręcznego zamknięcia (X)
- Przykłady komunikatów:
  - "Lek został dodany"
  - "Raport został zapisany"
  - "Analiza została wygenerowana"
  - "Wystąpił błąd podczas zapisywania"
- Kolejkowanie toastów jeśli wiele akcji jednocześnie

#### US-035: Error pages
Jako użytkowniczka
Chcę zobaczyć przyjazną stronę błędu gdy coś pójdzie nie tak
Aby móc wrócić do normalnego używania

Kryteria akceptacji:
- 404 Not Found: dedykowana strona
  - Komunikat: "Strona nie została znaleziona"
  - Przycisk: "Wróć do strony głównej"
- 500 Server Error: dedykowana strona
  - Komunikat: "Wystąpił błąd serwera"
  - Przycisk: "Wróć do strony głównej"
  - Opcjonalnie: link "Zgłoś problem"
- Navbar widoczny na error pages
- Przyjazny design (nie techniczny stack trace)

#### US-036: Keyboard navigation
Jako użytkowniczka
Chcę móc poruszać się po aplikacji używając klawiatury
Aby zwiększyć dostępność i szybkość pracy

Kryteria akceptacji:
- Tab: przechodzenie między interaktywnymi elementami
- Enter: aktywacja przycisków i linków
- Escape: zamykanie dialogów i modali
- Widoczne focus states (outline)
- Logiczna kolejność tabulacji
- Brak keyboard traps

### 5.7 Walidacja i error handling

#### US-037: Walidacja formularza leków
Jako użytkowniczka
Chcę być informowana o błędach podczas wypełniania formularza leku
Aby móc je szybko poprawić

Kryteria akceptacji:
- Nazwa leku: required
  - Jeśli puste: "Nazwa leku jest wymagana"
  - Jeśli <2 znaki: "Nazwa musi mieć minimum 2 znaki"
  - Jeśli >200 znaków: "Nazwa może mieć maksymalnie 200 znaków"
- Masa substancji aktywnej: required
  - Jeśli puste: "Masa substancji aktywnej jest wymagana"
  - Jeśli >100 znaków: "Masa może mieć maksymalnie 100 znaków"
- Błędy wyświetlane pod polami (czerwony tekst)
- Walidacja real-time (onBlur) lub przy submit
- Przycisk "Zapisz" disabled gdy formularz invalid

#### US-038: Walidacja formularza raportu
Jako użytkowniczka
Chcę być informowana o błędach w formularzu raportu
Aby dane były poprawne

Kryteria akceptacji:
- Data: required
  - Jeśli pusta: "Data jest wymagana"
  - Jeśli w przyszłości: "Nie możesz utworzyć raportu z datą z przyszłości"
  - Jeśli duplikat: "Raport na ten dzień już istnieje"
- Waga: opcjonalne
  - Jeśli <0: "Waga musi być liczbą dodatnią"
  - Jeśli >500: "Waga wydaje się nieprawidłowa"
- Ciśnienie: opcjonalne
  - Jeśli >50 znaków: "Ciśnienie może mieć maksymalnie 50 znaków"
- Błędy pod polami
- Przycisk "Zapisz" disabled gdy formularz invalid

#### US-039: Obsługa błędów sieci
Jako użytkowniczka
Chcę być informowana gdy operacja nie powiedzie się z powodu problemów z siecią
Aby móc spróbować ponownie

Kryteria akceptacji:
- Błąd sieci podczas zapisywania: toast "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- Timeout: toast "Upłynął limit czasu. Spróbuj ponownie."
- Przycisk "Spróbuj ponownie" w toaście lub formularzu
- Dane w formularzu nie są tracone po błędzie
- Możliwość ręcznego retry

#### US-040: Obsługa błędów API
Jako użytkowniczka
Chcę być informowana gdy operacja nie powiedzie się z powodu błędu serwera
Aby zrozumieć co się stało

Kryteria akceptacji:
- Błąd 500: toast "Wystąpił błąd serwera. Spróbuj ponownie później."
- Błąd 400 (bad request): toast z konkretnym komunikatem z API
- Błąd 404: toast "Nie znaleziono zasobu"
- Błąd 401/403: komunikat "Brak autoryzacji" (rzadko na MVP)
- Logi błędów w console dla debugowania

### 5.8 Dostępność (Accessibility)

#### US-041: Semantyczne HTML
Jako użytkowniczka korzystająca z screen readera
Chcę aby aplikacja była zrozumiała dla technologii asystujących
Aby móc z niej korzystać

Kryteria akceptacji:
- Używanie semantycznych tagów HTML: header, nav, main, section, article, footer
- Heading hierarchy (h1, h2, h3) bez pomijania poziomów
- Formularze z label dla każdego inputu
- Button vs link: button dla akcji, link dla nawigacji
- Lists (ul/ol) dla list elementów
- Brak div soup (nadużycia divów)

#### US-042: ARIA labels i atrybuty
Jako użytkowniczka korzystająca z screen readera
Chcę aby interaktywne elementy były opisane
Aby rozumieć ich funkcję

Kryteria akceptacji:
- Przyciski ikony (np. hamburger, edit, delete) mają aria-label
- Formularze: aria-describedby dla komunikatów błędów
- Modals: aria-modal="true", role="dialog"
- Loading states: aria-busy="true"
- aria-label dla custom controls (np. buźki samopoczucia)
- aria-live dla toast notifications

#### US-043: Contrast kolorów
Jako użytkowniczka z problemami wzrokowymi
Chcę aby tekst był czytelny
Aby móc komfortowo korzystać z aplikacji

Kryteria akceptacji:
- Wszystkie teksty spełniają WCAG AA contrast ratio (min 4.5:1 dla normal text)
- Large text (>24px): min 3:1
- Przyciski: wyraźny contrast w stosunku do tła
- Linki: odróżnialne od normalnego tekstu (color + underline)
- Error messages: nie tylko kolor (również ikona lub tekst)
- Testowane narzędziem do sprawdzania kontrastu

#### US-044: Focus states
Jako użytkowniczka korzystająca z klawiatury
Chcę widzieć który element jest aktualnie wybrany
Aby móc się sprawnie poruszać

Kryteria akceptacji:
- Wszystkie interaktywne elementy mają widoczny focus state
- Focus outline nie usunięty (outline: none bez zamiennika)
- Custom focus styles: wyraźne, odpowiadające designowi
- Focus visible podczas keyboard navigation
- Focus order logiczny (zgodny z visual order)

### 5.9 Autoryzacja i bezpieczeństwo (uproszczona dla MVP)

#### US-045: Hard-coded user ID
Jako deweloper
Chcę uprościć autentykację na MVP
Aby zaoszczędzić czas implementacji

Kryteria akceptacji:
- Middleware w Astro ustawia stały user_id dla wszystkich requestów
- user_id hard-coded jako zmienna środowiskowa lub constanta
- Wszystkie queries do bazy filtrowane po tym user_id
- Brak UI dla logowania/rejestracji
- Brak protected routes (wszystko dostępne)
- Komentarz w kodzie: "TODO: implement proper auth post-MVP"

#### US-046: Filtrowanie danych po user_id
Jako deweloper
Chcę zapewnić że użytkownik widzi tylko swoje dane
Aby zachować izolację (przygotowanie na multi-user)

Kryteria akceptacji:
- Wszystkie SELECT queries zawierają WHERE user_id = [current_user]
- Wszystkie INSERT operations ustawiają user_id
- Wszystkie UPDATE/DELETE weryfikują user_id przed operacją
- Niemożliwość dostępu do danych innego użytkownika (nawet przez URL)
- Unit tests sprawdzające izolację danych

#### US-047: Walidacja danych wejściowych
Jako deweloper
Chcę walidować wszystkie dane wejściowe
Aby zapobiec błędom i potencjalnym atakom

Kryteria akceptacji:
- Walidacja na poziomie frontendu (user feedback)
- Walidacja na poziomie API endpoints (security)
- Type checking dla wszystkich parametrów
- Sanityzacja string inputs (trim, escape)
- Walidacja długości stringów
- Walidacja range dla liczb
- Reject nietypowych znaków jeśli niepotrzebne
- Używanie prepared statements dla SQL (Supabase domyślnie)

### 5.10 Przypadki brzegowe (Edge cases)

#### US-048: Bardzo długie listy
Jako użytkowniczka z setkami raportów
Chcę aby aplikacja działała płynnie
Aby móc przeglądać wszystkie dane

Kryteria akceptacji:
- Timeline raportów: paginacja lub infinite scroll
- Domyślnie: 20 raportów na stronę/batch
- "Załaduj więcej" button lub auto-load przy scroll
- Performance: nie ładowanie wszystkich raportów na raz
- Wykresy: limit do ostatnich 100 punktów lub date range picker

#### US-049: Raport bez żadnych opcjonalnych pól
Jako użytkowniczka
Chcę móc zapisać raport tylko z datą
Aby nie być zmuszaną do wypełniania wszystkiego

Kryteria akceptacji:
- Możliwość zapisania raportu tylko z datą
- Backend akceptuje wszystkie opcjonalne pola jako null/empty
- Raport wyświetlany na timeline (pokazuje datę, reszta "brak danych")
- Brak błędów walidacji
- W statystykach/wykresach: pomijanie pustych wartości

#### US-050: Pierwsza wizyta w aplikacji (onboarding)
Jako użytkowniczka po raz pierwszy w aplikacji
Chcę zrozumieć co robić dalej
Aby szybko zacząć korzystać z aplikacji

Kryteria akceptacji:
- Dashboard dla nowego użytkownika pokazuje welcome message
- Komunikat: "Witaj w AI-Smile! Zacznij od dodania swoich leków, a następnie utwórz pierwszy raport dzienny."
- Przyciski call-to-action:
  - "Dodaj leki" → /medications/new
  - "Utwórz raport" → /reports/new
- Empty states we wszystkich sekcjach z instrukcjami
- Możliwość pominięcia welcome message (dismiss button)

#### US-051: Długie teksty w polach "Inne"
Jako użytkowniczka
Chcę wpisać szczegółowy opis nietypowego symptomu
Aby zachować wszystkie istotne informacje

Kryteria akceptacji:
- Pole "Inne symptomy": textarea z limitem 500 znaków
- Pole "Inne działania niepożądane": textarea z limitem 500 znaków
- Counter znaków: "245/500"
- Soft wrap długiego tekstu w wyświetlaniu raportu
- Możliwość rozwinięcia/zwinięcia długiego tekstu (expand/collapse)

#### US-052: Niepoprawny format ciśnienia
Jako użytkowniczka
Chcę wpisać ciśnienie w dowolnym formacie
Aby nie być blokowaną przez strict validation

Kryteria akceptacji:
- Pole ciśnienia: input text (nie numeryczne)
- Brak strict validation formatu na frontendzie
- Akceptowane przykłady: "120/80/72", "120/80", "120-80-72"
- W wykresie: próba parsowania z regex
- Jeśli parsowanie się nie powiedzie: pomijanie tego wpisu w wykresie (bez crashowania)
- Komunikat helper text: "Przykład: 120/80/72"

#### US-053: Brak leków do wybrania podczas edycji raportu
Jako użytkowniczka
Chcę edytować raport nawet jeśli usunęłam wszystkie leki
Aby móc zaktualizować inne pola

Kryteria akceptacji:
- Formularz edycji dostępny nawet gdy brak leków w bazie
- Sekcja leków pokazuje komunikat: "Brak dostępnych leków. Dodaj leki w zakładce Leki."
- Historycznie wybrane leki (ID) pozostają w danych raportu
- Możliwość zapisu raportu bez zmian w lekach
- Nie crashuje jeśli leki w raporcie nie istnieją już w bazie

#### US-054: Bardzo długa analiza AI
Jako użytkowniczka
Chcę przeczytać pełną analizę nawet jeśli jest bardzo długa
Aby nie stracić żadnych informacji

Kryteria akceptacji:
- Scrollowanie w obrębie card/container analizy
- Brak max-height z ukrytym tekstem
- Responsywność: długi tekst zawijany (word wrap)
- Przyjazne formatowanie (paragrafy, odstępy)
- Możliwość copy-paste pełnej analizy

#### US-055: Concurrent edits (nie dotyczy single-user, ale edge case)
Jako deweloper
Chcę obsłużyć sytuację otwarcia aplikacji w dwóch kartach
Aby uniknąć race conditions

Kryteria akceptacji:
- Zapisywanie w obu kartach: ostatni zapis wygrywa (optimistic updates)
- Brak konfliktów na poziomie bazy (updated_at timestamp)
- Odświeżanie listy po zapisie w innej karcie: może wymagać ręcznego refresh (akceptowalne dla MVP)
- Brak data corruption

## 6. Metryki sukcesu

### 6.1 Definicja sukcesu dla MVP
Jako projekt osobisty dla pojedynczego użytkownika, AI-Smile nie ma tradycyjnych metryk biznesowych (revenue, user acquisition, retention). Sukces MVP definiowany jest jako:

1. Aplikacja działa bez krytycznych błędów
2. Użytkownik końcowy (żona developera) regularnie korzysta z aplikacji
3. Wszystkie kluczowe funkcjonalności działają zgodnie z wymaganiami
4. Analiza AI generuje wartościowe wnioski

### 6.2 Metryki techniczne

#### 6.2.1 Funkcjonalność
- 100% user stories z priorytetu P0 i P1 zaimplementowanych
- 0 critical bugs w produkcji
- Wszystkie formularze z działającą walidacją
- API endpoints zwracają odpowiednie status codes
- Integracja AI działa w >95% przypadków (uwzględniając rate limits)

#### 6.2.2 Performance
- Czas ładowania strony głównej: <2 sekundy
- Czas ładowania timeline raportów (20 elementów): <1 sekunda
- Czas generowania wykresu: <500ms
- Czas generowania analizy AI: <60 sekund
- Aplikacja responsywna na urządzeniach mobilnych (>60 FPS scrolling)

#### 6.2.3 Reliability
- Uptime: >95% (lokalne użycie, zależne od Supabase i AI API)
- Error rate API endpoints: <5%
- Brak data loss (successful saves, proper transactions)
- Backup danych: ręczny export bazy Supabase (weekly)

### 6.3 Metryki użytkowania (internal tracking)

#### 6.3.1 Adoption
- Użytkownik stworzył profil leków (≥3 leki)
- Pierwszy raport dzienny utworzony w ciągu 24h od setupu
- Minimum 7 raportów dziennych w ciągu pierwszych 2 tygodni
- Pierwsza analiza AI wygenerowana

#### 6.3.2 Engagement
- Średnia liczba raportów na tydzień: ≥5 (cel: codzienne użycie)
- Średnia liczba pól wypełnionych na raport: ≥4 (z 8 dostępnych)
- Liczba wygenerowanych analiz AI: ≥2 w miesiącu
- Przeglądanie wykresów: ≥2 razy w tygodniu

#### 6.3.3 Data quality
- % raportów z wypełnioną wagą: ≥60%
- % raportów z wypełnionym ciśnieniem: ≥50%
- % raportów z wybranymi lekami: ≥80%
- % raportów z wybranymi symptomami: ≥70%
- Średnia liczba symptomów na raport: ≥2

### 6.4 Metryki jakościowe (user feedback)

#### 6.4.1 Usability
- Użytkownik potrafi dodać lek bez instrukcji: TAK
- Użytkownik potrafi stworzyć raport dzienny bez instrukcji: TAK
- Użytkownik rozumie jak wygenerować analizę AI: TAK
- Średni czas tworzenia raportu: <3 minuty
- Brak zgłoszonych problemów z nawigacją

#### 6.4.2 Value delivery
- Użytkownik uważa analizy AI za wartościowe: TAK (qualitative feedback)
- Użytkownik identyfikuje korelacje dzięki wykresom: TAK
- Użytkownik woli używać aplikacji niż papierowych notatek: TAK
- Aplikacja pomaga w komunikacji z lekarzem: TAK (możliwość pokazania danych)

#### 6.4.3 Satisfaction
- Net Promoter Score (NPS): nie dotyczy (single user)
- User satisfaction: 4/5 lub wyżej (qualitative)
- Zgłoszenia feature requests: wskaźnik zaangażowania
- Chęć kontynuowania użytkowania po 1 miesiącu: TAK

### 6.5 Harmonogram ewaluacji

#### Week 1 (post-launch)
- Weryfikacja wszystkich user stories P0
- Testy wszystkich formularzy
- Sprawdzenie integracji AI
- Pierwsze użycie przez end usera

#### Week 2
- Zebranie pierwszych 7 dni danych
- Wygenerowanie pierwszej analizy AI
- User feedback session
- Identyfikacja top 3 bugów/improvements

#### Week 4
- Przegląd wszystkich metryk użytkowania
- Ocena data quality
- Decyzja o priorytetach post-MVP
- Retrospektywa developmentu

### 6.6 Kryteria akceptacji MVP

MVP uznawane jest za ukończone gdy:

1. Wszystkie user stories z P0 i P1 są zaimplementowane i przetestowane
2. Użytkownik końcowy stworzył ≥7 raportów dziennych
3. Użytkownik końcowy wygenerował ≥1 analizę AI
4. Brak critical bugs w core functionality
5. Aplikacja spełnia minimalne wymagania performance (sekcja 6.2.2)
6. Użytkownik końcowy wyraża zadowolenie z aplikacji (feedback session)
7. Dokumentacja techniczna ukończona (README, setup instructions)
8. Dane zapisywane poprawnie w Supabase (verified przez SQL queries)

### 6.7 Post-MVP roadmap indicators

Decyzja o kontynuacji developmentu (P3 features) będzie oparta na:

1. Częstotliwość użytkowania (≥5 raportów/tydzień przez 4 tygodnie)
2. Feature requests od użytkownika końcowego
3. Wartość wygenerowanych analiz AI (qualitative assessment)
4. Stabilność aplikacji (brak częstych bugów wymagających fixes)
5. Developer satisfaction (czy projekt był satysfakcjonujący technicznie)

---

## Podsumowanie

Ten dokument PRD definiuje pełny zakres funkcjonalny aplikacji AI-Smile MVP. Zawiera 55 szczegółowych user stories pokrywających wszystkie aspekty aplikacji: od zarządzania lekami, przez raporty dzienne, analizy AI, wizualizacje, aż po responsywność i accessibility.

Kluczowe cechy MVP:
- Single-user application (uproszczona autentykacja)
- Elastyczność danych (większość pól opcjonalna)
- Integracja z zaawansowanymi modelami AI (GPT-4, Claude)
- Nowoczesny stack (Astro 5, React 19, Tailwind 4)
- Responsive design (desktop + mobile)
- Focus na usability i user experience

Następne kroki:
1. Review PRD z developerem i użytkownikiem końcowym
2. Priorytetyzacja user stories wg harmonogramu 4-tygodniowego
3. Setup projektu i środowiska (Supabase, API keys)
4. Implementacja zgodnie z harmonogramem (P0 → P1 → P2)
5. Iteracyjne testowanie i zbieranie feedbacku
6. Ewaluacja metryk sukcesu po 4 tygodniach użytkowania

