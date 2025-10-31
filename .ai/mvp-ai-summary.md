# Podsumowanie konwersacji: Planowanie PRD dla AI-Smile MVP

## Decyzje

1. **Grupa docelowa**: Aplikacja przeznaczona dla jednego użytkownika (żony developera), projekt osobisty/akademicki
2. **Model biznesowy**: Brak monetyzacji, aplikacja lokalna bez komercyjnych aspiracji
3. **Metryki sukcesu**: Brak formalnych KPI, sukces = działająca aplikacja dla użytkownika końcowego
4. **Bezpieczeństwo**: Na MVP bez zaawansowanych zabezpieczeń, użycie lokalne
5. **Struktura raportu dziennego**: Data, lista leków (checkbox przyjęcia), symptomy SM (lista stringów), działania niepożądane (lista stringów), nasilenie ogólne (1-4), samopoczucie (1-4 buźki), waga, ciśnienie (tekstowo: skurczowe/rozkurczowe/puls)
6. **Model leków**: Nazwa + masa substancji aktywnej, wsparcie dla wielu leków jednocześnie
7. **Symptomy i działania niepożądane**: Lista stringów, nasilenie zbiorczo w skali 1-4 (nie osobno dla każdego)
8. **Integracja AI**: Predefiniowana lista modeli (GPT-4o, GPT-4, Claude 3.5 Sonnet) - wybór konkretnych modeli do ustalenia później
9. **Edycja danych**: Dane historyczne edytowalne, timestamp ostatniej modyfikacji
10. **Walidacja formularza**: Większość pól opcjonalna (wymagana tylko data), pierwszy raport może być bez listy leków
11. **Architektura danych**: JSON arrays dla symptomów w kolumnie raportu (uproszczenie dla MVP)
12. **Wymagania sieciowe**: Aplikacja wymaga połączenia z internetem (brak trybu offline)
13. **Eksport danych**: Brak funkcji eksportu na MVP
14. **Refaktoring**: Komponent "Combination" do usunięcia/zastąpienia

## Dopasowane rekomendacje

### Funkcjonalność podstawowa
- **Hybrid approach dla symptomów**: Predefiniowana lista najpopularniejszych symptomów + opcja "Inne" z polem tekstowym
- **Edytowalne dane historyczne**: Możliwość korekty błędów, timestamp "ostatnia edycja"
- **Opcjonalność pól**: Tylko data obowiązkowa, reszta opcjonalna (zwiększa prawdopodobieństwo regularnego użycia)

### UI/UX
- **Layout 3-panelowy**: Navbar (Raporty, Leki, Analizy) → Dashboard z quick stats → Timeline raportów
- **Buźki dla samopoczucia**: Wizualna skala 1-4 zamiast numerycznej
- **Minimalistyczny onboarding**: Opcjonalny, możliwość pominięcia

### Dane medyczne
- **Predefiniowana lista symptomów SM**: Zmęczenie, Zawroty głowy, Problemy z równowagą, Zaburzenia wzroku, Drętwienie kończyn, Słabość mięśni, Problemy z koordynacją, Ból, Sztywność mięśni, Problemy z pamięcią/koncentracją
- **Predefiniowana lista działań niepożądanych**: Mdłości, Ból głowy, Problemy żołądkowo-jelitowe, Bezsenność, Wysypka skórna, Nadmierna senność, Utrata apetytu, Inne
- **Wsparcie wielu leków**: Typowe dla SM (3-10 różnych leków), relacja many-to-many

### Analiza AI
- **Dedykowana strona /analizy**: Przycisk "Generuj analizę", loading state, wynik jako sformatowany tekst z datą, historia poprzednich analiz
- **Minimalny próg danych**: Informacja po pierwszym raporcie "Po 7 dniach danych dostępna będzie pierwsza analiza"
- **Wybór modelu**: Dropdown przy generowaniu, zapisywanie informacji który model użyto

### Wizualizacje
- **Podstawowe wykresy liniowe**: Waga i ciśnienie w czasie (recharts/chart.js)
- **Timeline raportów**: Chronologiczna lista z najpóźniejszymi na górze

### Harmonogram implementacji (4 tygodnie)
1. **Tydzień 1**: Autentykacja basic, model danych, CRUD leków
2. **Tydzień 2**: CRUD raportów dziennych (pełny formularz)
3. **Tydzień 3**: Lista/widok raportów, podstawowe filtry, wykresy
4. **Tydzień 4**: Integracja AI, polish UI, bugfixy

## Szczegółowe podsumowanie planowania PRD

### 1. Główny problem użytkownika
Pacjentka ze stwardnieniem rozsianym potrzebuje narzędzia do systematycznego śledzenia:
- Przyjmowanych leków (często 3-10 jednocześnie)
- Symptomów choroby (zmienność, nasilenie)
- Działań niepożądanych leków
- Parametrów zdrowotnych (waga, ciśnienie, samopoczucie)
- Korelacji między terapią a stanem zdrowia

Celem jest umożliwienie analizy wpływu leków na przebieg choroby z wykorzystaniem AI.

### 2. Kluczowe funkcjonalności MVP

#### A. Zarządzanie lekami
- CRUD leków z polami: nazwa, masa substancji aktywnej
- Lista aktywnych leków użytkownika
- Możliwość przypisania wielu leków do raportu dziennego

#### B. Raporty dzienne
**Pola raportu:**
- Data (obowiązkowe)
- Lista przyjętych leków tego dnia (opcjonalne, checkbox)
- Symptomy SM - wybór z predefiniowanej listy + "Inne" (opcjonalne)
- Działania niepożądane - wybór z predefiniowanej listy + "Inne" (opcjonalne)
- Nasilenie symptomów/działań - skala 1-4 (opcjonalne)
- Samopoczucie ogólne - buźki 1-4 (opcjonalne)
- Waga (opcjonalne)
- Ciśnienie - pole tekstowe "skurczowe/rozkurczowe/puls" (opcjonalne)

**Funkcjonalność:**
- Tworzenie nowych raportów
- Edycja historycznych raportów (z timestampem modyfikacji)
- Widok chronologiczny (timeline)
- Możliwość utworzenia pierwszego raportu bez istniejącej listy leków

#### C. Analizy AI
- Dedykowana strona /analizy
- Dropdown wyboru modelu AI (GPT-4o, GPT-4, Claude 3.5 Sonnet)
- Przycisk "Generuj analizę" z informacją o liczbie dostępnych dni danych
- Loading state podczas generowania
- Wyświetlanie analizy tekstowej w card z datą i użytym modelem
- Historia poprzednich analiz
- Minimum 7 dni danych dla pierwszej analizy (komunikat informacyjny)

#### D. Wizualizacje
- Wykresy liniowe: waga w czasie
- Wykresy liniowe: ciśnienie w czasie (skurczowe i rozkurczowe)
- Timeline raportów dziennych

### 3. Kluczowe historie użytkownika

**US1: Dodawanie leku**
```
JAKO użytkowniczka
CHCĘ dodać nowy lek do mojej listy
ABY móc śledzić jego przyjmowanie i wpływ na zdrowie
```
Acceptance Criteria:
- Formularz z polami: nazwa, masa substancji aktywnej
- Walidacja: oba pola wymagane
- Zapisanie do bazy Supabase
- Przekierowanie do listy leków

**US2: Tworzenie raportu dziennego**
```
JAKO użytkowniczka
CHCĘ stworzyć raport dzienny
ABY udokumentować mój stan zdrowia i przyjęte leki
```
Acceptance Criteria:
- Formularz z wszystkimi polami raportu
- Tylko data obowiązkowa, reszta opcjonalna
- Predefiniowane listy symptomów i działań niepożądanych + opcja "Inne"
- Checkboxy leków (jeśli istnieją w bazie)
- Buźki 1-4 dla samopoczucia
- Skala 1-4 dla nasilenia
- Możliwość zapisu niepełnego raportu

**US3: Edycja historycznego raportu**
```
JAKO użytkowniczka
CHCĘ poprawić błąd w starym raporcie
ABY dane były dokładne dla analizy AI
```
Acceptance Criteria:
- Kliknięcie w raport z listy otwiera formularz edycji
- Wszystkie pola edytowalne
- Zapisanie timestampu "ostatnia modyfikacja"
- Komunikat sukcesu po zapisaniu

**US4: Generowanie analizy AI**
```
JAKO użytkowniczka
CHCĘ wygenerować analizę AI moich danych
ABY zrozumieć korelacje między lekami a objawami
```
Acceptance Criteria:
- Przycisk widoczny po zebraniu min. 7 dni danych
- Dropdown wyboru modelu AI
- Loading indicator podczas generowania
- Wyświetlenie tekstowej analizy w card
- Zapisanie analizy w historii (data, model, treść)
- Informacja o koszcie/czasie generowania

**US5: Przeglądanie wykresów**
```
JAKO użytkowniczka
CHCĘ zobaczyć wykresy mojej wagi i ciśnienia
ABY wizualnie śledzić trendy
```
Acceptance Criteria:
- Wykres liniowy wagi (oś X: data, oś Y: waga)
- Wykres liniowy ciśnienia (dwie linie: skurczowe, rozkurczowe)
- Interaktywne tooltips z wartościami
- Responsywne na różnych ekranach

### 4. Model danych

**Table: medications**
```typescript
{
  id: uuid (PK)
  name: string
  active_substance_mass: string
  created_at: timestamp
  user_id: uuid (FK) // na MVP zawsze ten sam
}
```

**Table: daily_reports**
```typescript
{
  id: uuid (PK)
  date: date (required, unique per user)
  medications_taken: uuid[] // array of medication IDs
  symptoms: string[] // JSON array
  side_effects: string[] // JSON array
  severity: integer (1-4, nullable)
  mood: integer (1-4, nullable)
  weight: float (nullable)
  blood_pressure: string (nullable) // format: "120/80/72"
  created_at: timestamp
  updated_at: timestamp
  user_id: uuid (FK)
}
```

**Table: ai_analyses**
```typescript
{
  id: uuid (PK)
  model_used: string // "GPT-4o", "GPT-4", "Claude-3.5-Sonnet"
  analysis_text: text
  date_from: date
  date_to: date
  generated_at: timestamp
  user_id: uuid (FK)
}
```

### 5. Stack techniczny
- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- **Backend**: Astro API endpoints, Supabase (PostgreSQL)
- **AI**: OpenAI API (GPT-4, GPT-4o) / Anthropic API (Claude)
- **Charts**: Recharts lub Chart.js
- **Deployment**: Lokalne użycie (development mode)

### 6. Architektura strony

```
/                          → Dashboard (quick stats, shortcut do nowego raportu)
/medications               → Lista leków, przycisk "Dodaj lek"
/medications/new           → Formularz nowego leku
/reports                   → Timeline raportów dziennych, filtry
/reports/new               → Formularz nowego raportu
/reports/[id]              → Edycja istniejącego raportu
/analyses                  → Historia analiz AI, przycisk "Generuj nową"
/api/medications           → CRUD endpoints
/api/reports               → CRUD endpoints
/api/analyses              → POST /generate, GET /list
```

### 7. Priorytety implementacyjne

**P0 (Krytyczne - Tydzień 1-2):**
- Autentykacja basic (email/password, single user)
- Model danych i migracje Supabase
- CRUD leków (backend + frontend)
- CRUD raportów (backend + frontend)
- Podstawowy routing

**P1 (Wysokie - Tydzień 3):**
- Timeline/lista raportów
- Podstawowe wykresy (waga, ciśnienie)
- Walidacja formularzy
- Error handling

**P2 (Średnie - Tydzień 4):**
- Integracja AI (generowanie analiz)
- Historia analiz
- UI polish i responsywność
- Loading states i feedback użytkownika

**P3 (Nice-to-have - Post-MVP):**
- Zaawansowane filtry i wyszukiwanie
- Kalendarzowy widok raportów
- Eksport do CSV/PDF
- Notyfikacje/przypomnienia
- Tryb offline (PWA)
- Dodawanie własnych symptomów do predefiniowanej listy

## Nierozwiązane kwestie

### 1. Szczegóły integracji AI
**Co wymaga doprecyzowania:**
- Dokładny wybór modeli AI z listy (GPT-4o, GPT-4, Claude 3.5 Sonnet - które dokładnie?)
- Struktura promptu dla analizy (jakie konkretnie pytania zadawać?)
- Sposób formatowania danych wejściowych (JSON, markdown, plain text?)
- Obsługa błędów API (rate limits, timeouts)
- Koszty i limity użycia API

**Rekomendacja akcji:** 
Przed implementacją tygodnia 4, ustal dokładne promptowanie i przetestuj na przykładowych danych.

### 2. Format pola ciśnienia
**Aktualnie:** Pole tekstowe "skurczowe/rozkurczowe/puls"

**Potencjalny problem:** 
- Brak walidacji (użytkownik może wpisać cokolwiek)
- Trudniejsze parsowanie dla wykresów
- Możliwość błędów formatowania

**Pytanie:** Czy na pewno pole tekstowe, czy jednak rozdzielić na 3 osobne pola numeryczne dla lepszej walidacji?

### 3. Definicja "nasilenia"
**Aktualne:** Jedna wartość 1-4 dla ogólnego nasilenia symptomów i działań niepożądanych

**Niejasność:** Co dokładnie oznacza ta wartość?
- Subiektywne odczucie nasilenia wszystkich symptomów łącznie?
- Najgorszy symptom z listy?
- Średnia nasilenia?

**Rekomendacja:** Doprecyzuj w UI label i placeholder, np. "Ogólne nasilenie objawów (1-słabe, 4-bardzo silne)"

### 4. Mechanizm "Combination"
**Status:** Do usunięcia/zastąpienia

**Pytanie:** Czy ten komponent ma zostać po prostu usunięty, czy zastąpiony czymś innym? Jaka była pierwotna funkcjonalność?

### 5. Obsługa pierwszego użycia
**Decyzja:** Pierwszy raport może być bez listy leków

**Implikacje UX:**
- Jak wyświetlić sekcję leków w formularzu jeśli lista jest pusta?
- Czy pokazać komunikat "Najpierw dodaj leki w zakładce Leki"?
- Czy zablokować checkboxy leków, czy ukryć całą sekcję?

**Rekomendacja:** Pokaż komunikat informacyjny + link do /medications/new

### 6. Autentykacja single-user
**Aktualnie:** Aplikacja dla jednego użytkownika

**Pytanie techniczne:** 
- Czy w ogóle implementować logowanie, czy hard-code jednego usera?
- Jeśli logowanie - czy zabezpieczyć routes przed dostępem bez autentykacji?
- Czy Supabase auth (email/password) czy prostszy mechanizm?

**Rekomendacja dla MVP:** Hard-code user_id w middleware, pomiń formularz logowania (zaoszczędzi tydzień developmentu)

### 7. Walidacja unikalności daty raportu
**Wymaganie biznesowe:** Jeden raport na dzień

**Pytanie implementacyjne:**
- Czy zablokować tworzenie drugiego raportu na ten sam dzień (constraint w DB)?
- Czy przekierować do edycji istniejącego raportu?
- Czy pozwolić na overwrite?

**Rekomendacja:** Unique constraint (user_id, date), w UI sprawdzanie przed zapisem i komunikat "Raport na ten dzień już istnieje. Przejdź do edycji."

### 8. Predefiniowane listy - zarządzanie
**Aktualne:** Listy symptomów i działań niepożądanych są predefiniowane

**Pytania:**
- Czy pozwolić użytkownikowi dodawać własne pozycje do list? (opcja była w rekomendacji)
- Jeśli tak, czy zapisywać je jako custom entries w osobnej tabeli?
- Czy po wybraniu "Inne" zapisywać ten custom text do późniejszego wykorzystania?

**Rekomendacja:** Na MVP tylko predefiniowane + pole "Inne" z free text (nie zapisuj do stałej listy). Custom entries można dodać post-MVP.

---

**Następny krok:** Utworzenie pełnego dokumentu PRD z powyższymi ustaleniami, wraz z wireframes, user flows i technical specifications.