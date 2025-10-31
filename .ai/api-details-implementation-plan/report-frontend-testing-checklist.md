# Checklist testowania funkcjonalności raportów - Frontend

## ✅ Komponenty utworzone

### Custom Hooks
- [x] `src/components/hooks/useReports.tsx` - hook zarządzający stanem raportów

### Komponenty React
- [x] `src/components/reports/ReportGenerator.tsx` - formularz generowania raportów
- [x] `src/components/reports/ReportsList.tsx` - lista raportów z paginacją
- [x] `src/components/reports/ReportViewer.tsx` - widok pojedynczego raportu
- [x] `src/components/reports/ReportsFilter.tsx` - filtr raportów według typu okresu

### Strony Astro
- [x] `src/pages/reports/new.astro` - strona generowania raportów
- [x] `src/pages/reports/index.astro` - strona listy raportów
- [x] `src/pages/reports/[id].astro` - strona pojedynczego raportu

### Integracje
- [x] Link "Raporty AI" dodany na stronie głównej
- [x] Instalacja `react-markdown` i `remark-gfm`
- [x] Usunięcie duplikatów Toaster (już w Layout)

## 📋 Scenariusze testowe

### 1. Generowanie raportów (`/reports/new`)

#### Test 1.1: Wyświetlanie formularza
- [ ] Strona `/reports/new` się ładuje poprawnie
- [ ] Widoczny jest dropdown z wyborem okresu (tydzień, miesiąc, kwartał)
- [ ] Domyślnie wybrany jest "Miesiąc"
- [ ] Widoczna jest sekcja informacyjna o raportach AI
- [ ] Przycisk "Wygeneruj raport" jest aktywny

#### Test 1.2: Wybór różnych okresów
- [ ] Można wybrać "Tydzień (7 dni)"
- [ ] Można wybrać "Miesiąc (30 dni)"
- [ ] Można wybrać "Kwartał (90 dni)"
- [ ] Opis zmienia się odpowiednio do wybranego okresu

#### Test 1.3: Generowanie raportu z wystarczającymi danymi
**Prereq**: Użytkownik ma ≥3 symptomy w wybranym okresie
- [ ] Kliknięcie "Wygeneruj raport" pokazuje spinner "Generowanie raportu..."
- [ ] Przycisk jest zablokowany podczas generowania
- [ ] Po sukcesie: toast "Raport wygenerowany pomyślnie!"
- [ ] Nastąpi przekierowanie do `/reports/{id}` nowo utworzonego raportu

#### Test 1.4: Generowanie raportu z niewystarczającymi danymi (424)
**Prereq**: Użytkownik ma <3 symptomy w wybranym okresie
- [ ] Pokazuje się toast z błędem: "Not enough symptom data..."
- [ ] Pozostajemy na stronie generowania
- [ ] Przycisk wraca do stanu aktywnego

#### Test 1.5: Błąd serwisu AI (503)
**Prereq**: OpenRouter API niedostępny lub OPENROUTER_API_KEY nieprawidłowy
- [ ] Pokazuje się toast: "AI service is temporarily unavailable..."
- [ ] Pozostajemy na stronie generowania

#### Test 1.6: Timeout (504)
**Prereq**: Generowanie trwa >30 sekund
- [ ] Pokazuje się toast: "Report generation took too long..."
- [ ] Pozostajemy na stronie generowania

### 2. Lista raportów (`/reports`)

#### Test 2.1: Wyświetlanie pustej listy
**Prereq**: Użytkownik nie ma żadnych raportów
- [ ] Strona `/reports` się ładuje
- [ ] Widoczny nagłówek "Twoje raporty (0)"
- [ ] EmptyState z komunikatem "Brak raportów"
- [ ] Przycisk "Wygeneruj raport" w EmptyState
- [ ] Przycisk "Wygeneruj nowy raport" w nagłówku

#### Test 2.2: Wyświetlanie listy raportów
**Prereq**: Użytkownik ma raporty
- [ ] Widoczna liczba raportów w nagłówku
- [ ] Każdy raport pokazuje:
  - Typ okresu (Tydzień/Miesiąc/Kwartał)
  - Daty okresu analizy
  - Data i czas wygenerowania
  - Preview treści (pierwsze 3 linie)
  - Przycisk "Wyświetl"
- [ ] Podczas ładowania widoczne są skeletony

#### Test 2.3: Filtrowanie według typu okresu
- [ ] Komponent filtra jest widoczny
- [ ] Domyślnie pokazane są "Wszystkie okresy"
- [ ] Można wybrać filtr "Tydzień"
  - Lista odświeża się
  - Pokazane tylko raporty typu "week"
  - Licznik aktualizuje się
- [ ] Można wybrać filtr "Miesiąc"
- [ ] Można wybrać filtr "Kwartał"
- [ ] Przycisk "Wyczyść" pojawia się przy aktywnym filtrze
- [ ] Kliknięcie "Wyczyść" resetuje do "Wszystkie okresy"

#### Test 2.4: Paginacja
**Prereq**: Użytkownik ma >10 raportów
- [ ] Paginacja jest widoczna
- [ ] Przycisk "Previous" jest zablokowany na pierwszej stronie
- [ ] Kliknięcie numeru strony ładuje odpowiednią stronę
- [ ] Kliknięcie "Next" przechodzi do następnej strony
- [ ] Przycisk "Next" jest zablokowany na ostatniej stronie
- [ ] Aktywna strona jest podświetlona

#### Test 2.5: Nawigacja
- [ ] Kliknięcie "Strona główna" przekierowuje do `/`
- [ ] Kliknięcie "Wygeneruj nowy raport" przekierowuje do `/reports/new`
- [ ] Kliknięcie "Wyświetl" na raporcie przekierowuje do `/reports/{id}`

### 3. Widok pojedynczego raportu (`/reports/{id}`)

#### Test 3.1: Wyświetlanie raportu
**Prereq**: Użytkownik ma dostęp do raportu
- [ ] Strona `/reports/{id}` się ładuje
- [ ] Widoczny przycisk "Powrót do listy raportów"
- [ ] Widoczny przycisk "Usuń raport"
- [ ] Card z metadanymi pokazuje:
  - Typ okresu
  - Daty okresu analizy
  - Data i godzina wygenerowania
- [ ] Card z analizą pokazuje pełną treść raportu
- [ ] Markdown jest poprawnie wyrenderowany (nagłówki, listy, bold)
- [ ] Widoczny ID raportu w stopce
- [ ] Widoczny przycisk "Drukuj raport"

#### Test 3.2: Nawigacja powrotna
- [ ] Kliknięcie "Powrót do listy raportów" przekierowuje do `/reports`

#### Test 3.3: Drukowanie raportu
- [ ] Kliknięcie "Drukuj raport" otwiera dialog drukowania przeglądarki

#### Test 3.4: Usuwanie raportu
- [ ] Kliknięcie "Usuń raport" otwiera AlertDialog
- [ ] Dialog zawiera ostrzeżenie o nieodwracalności
- [ ] Kliknięcie "Anuluj" zamyka dialog bez usuwania
- [ ] Kliknięcie "Usuń":
  - Przycisk zmienia się na "Usuwanie..."
  - Po sukcesie: toast "Raport został usunięty"
  - Przekierowanie do `/reports`

#### Test 3.5: Błąd usuwania (403)
**Prereq**: Raport należy do innego użytkownika
- [ ] Pokazuje się toast z błędem uprawnień

#### Test 3.6: Raport nie istnieje (404)
- [ ] Strona `/reports/999999` zwraca błąd 404
- [ ] Użytkownik widzi komunikat "Report not found..."

#### Test 3.7: Nieprawidłowe ID
- [ ] Strona `/reports/abc` zwraca błąd 400
- [ ] Użytkownik widzi komunikat "Invalid report ID"

### 4. Integracja ze stroną główną

#### Test 4.1: Link do raportów
- [ ] Na stronie głównej `/` widoczny przycisk "Raporty AI"
- [ ] Ikona dokumentu jest widoczna
- [ ] Kliknięcie przekierowuje do `/reports`

### 5. Responsywność

#### Test 5.1: Mobile (< 640px)
- [ ] Formularz generowania raportu dobrze się wyświetla
- [ ] Lista raportów jest czytelna
- [ ] Widok raportu jest czytelny
- [ ] Przyciski nie nakładają się
- [ ] Filtr działa poprawnie

#### Test 5.2: Tablet (640px - 1024px)
- [ ] Wszystkie komponenty dobrze się skalują
- [ ] Paginacja jest czytelna

#### Test 5.3: Desktop (> 1024px)
- [ ] Layout jest wycentrowany
- [ ] Maksymalne szerokości są zachowane

### 6. Stany błędów API

#### Test 6.1: Błąd 401 (Unauthorized)
- [ ] Przekierowanie do strony logowania/głównej

#### Test 6.2: Błąd 500 (Internal Server Error)
- [ ] Pokazuje się toast z komunikatem błędu
- [ ] Użytkownik może spróbować ponownie

### 7. Performance

#### Test 7.1: Ładowanie
- [ ] Skeletony pokazują się natychmiast podczas ładowania
- [ ] Dane ładują się w rozsądnym czasie
- [ ] Nie ma niepotrzebnych re-renderów

#### Test 7.2: Długie raporty
**Prereq**: Raport z dużą ilością treści
- [ ] Markdown renderuje się poprawnie
- [ ] Strona nie zawiesa się
- [ ] Scrollowanie jest płynne

## 🔧 Konfiguracja testowa

### Wymagane zmienne środowiskowe
```env
OPENROUTER_API_KEY=sk-or-v1-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
PUBLIC_SUPABASE_URL=https://...
PUBLIC_SUPABASE_KEY=...
```

### Dane testowe
1. Utworzyć użytkownika testowego
2. Dodać co najmniej 5-10 symptomów w różnych okresach:
   - 5 symptomów z ostatniego tygodnia
   - 10 symptomów z ostatniego miesiąca
   - 20 symptomów z ostatniego kwartału
3. Wygenerować po 1-2 raporty dla każdego typu okresu

## 📝 Notatki

### Znane ograniczenia
- Maksymalnie 100 symptomów jest wysyłanych do AI (limit tokenów)
- Timeout dla AI wynosi 30 sekund
- Minimum 3 symptomy wymagane do wygenerowania raportu

### Przyszłe usprawnienia
- [ ] Asynchroniczne generowanie raportów (202 Accepted + polling)
- [ ] Export raportu do PDF
- [ ] Wizualizacje (wykresy, statystyki)
- [ ] Porównanie wielu raportów
- [ ] Rate limiting per użytkownik
- [ ] Caching identycznych raportów

