# Dokument wymagań produktu (PRD) - AI-Smile

## 1. Przegląd produktu

Celem aplikacji AI-Smile jest dostarczenie pacjentom ze stwardnieniem rozsianym (SM) prostego i efektywnego narzędzia do monitorowania i zapisywania objawów choroby. Wersja MVP (Minimum Viable Product) koncentruje się na podstawowych funkcjonalnościach, które umożliwiają użytkownikom szybkie logowanie symptomów, przeglądanie historii oraz filtrowanie danych. Aplikacja ma na celu ułatwienie śledzenia przebiegu choroby, co może być pomocne w komunikacji z lekarzami i lepszym zrozumieniu własnego stanu zdrowia. Interfejs użytkownika będzie nowoczesny, responsywny i oparty na gotowych komponentach, aby zapewnić spójność i szybkość wdrożenia.

## 2. Problem użytkownika

Pacjenci ze stwardnieniem rozsianym często doświadczają różnorodnych i zmieniających się w czasie objawów. Ręczne prowadzenie notatek jest nieefektywne, podatne na błędy i utrudnia analizę wzorców czy trendów. Brakuje dedykowanego, prostego narzędzia, które pozwalałoby na szybkie i ustrukturyzowane zapisywanie symptomów, takich jak typ objawu i jego lokalizacja w ciele. Taka aplikacja pozwoliłaby na gromadzenie cennych danych, które mogą wspierać proces leczenia i rehabilitacji, a także dawać pacjentowi większą kontrolę nad informacjami o swoim zdrowiu.

## 3. Wymagania funkcjonalne

### 3.1. Zarządzanie Kontem Użytkownika
-   Rejestracja nowego użytkownika za pomocą adresu e-mail i hasła.
-   Logowanie do istniejącego konta.
-   Automatyczne logowanie użytkownika bezpośrednio po pomyślnej rejestracji.
-   Mechanizm odzyskiwania hasła ("zapomniałem hasła").
-   Możliwość usunięcia konta wraz ze wszystkimi powiązanymi danymi przez użytkownika.

### 3.2. Zarządzanie Symptomami (CRUD)
-   *Dodawanie (Create):* Użytkownik może dodać nowy wpis o symptomie poprzez formularz w oknie modalnym. Formularz zawiera predefiniowane listy dla typu symptomu i części ciała oraz pole na opcjonalne notatki. Data i godzina są ustawiane domyślnie na bieżące, z możliwością ręcznej zmiany.
-   *Przeglądanie (Read):* Główny widok aplikacji to chronologiczna lista symptomów (od najnowszego do najstarszego), która obsługuje mechanizm "infinite scroll" do ładowania starszych wpisów.
-   *Edycja (Update):* Użytkownik ma możliwość edycji wszystkich pól istniejącego wpisu w tym samym oknie modalnym, które jest używane do dodawania.
-   *Usuwanie (Delete):* Użytkownik może usunąć wybrany wpis po uprzednim potwierdzeniu operacji w oknie dialogowym.

### 3.3. Filtrowanie Danych
-   Użytkownik ma dostęp do panelu filtrów, który jest zawsze widoczny nad listą symptomów.
-   Możliwość filtrowania listy według:
    -   Zakresu dat (od-do).
    -   Typu symptomu (wybór z predefiniowanej listy).
    -   Części ciała (wybór z predefiniowanej listy).
-   Dostępny jest przycisk do resetowania wszystkich aktywnych filtrów do wartości domyślnych.

### 3.4. Interfejs Użytkownika (UI/UX)
-   Interfejs musi być responsywny i poprawnie wyświetlać się na urządzeniach mobilnych i desktopowych.
-   Aplikacja będzie wykorzystywać komponenty z biblioteki Shadcn/ui.
-   Stany ładowania (np. podczas pobierania danych) będą sygnalizowane za pomocą spinnerów.
-   Operacje zakończone sukcesem (np. dodanie wpisu) lub niepowodzeniem będą komunikowane za pomocą powiadomień typu "toast".
-   Format daty i godziny będzie ujednolicony w całej aplikacji (`DD.MM.RRRR HH:MM`).

### 3.5. Generowanie Raportu AI
-   Użytkownik ma możliwość wygenerowania inteligentnego raportu tekstowego dotyczącego symptomów z wybranego okresu czasu.
-   Raport jest generowany automatycznie przez model AI na podstawie zapisanych danych o symptomach.
-   Funkcjonalność dostępna jest przez dedykowany przycisk "Generuj raport" w głównym widoku aplikacji.
-   Użytkownik może wybrać:
    -   Okres analizy (np. ostatni tydzień, miesiąc, 3 miesiące).
    -   Raport domyślnie analizuje ostatni miesiąc.
-   Raport zawiera:
    -   Podsumowanie obecnych symptomów z wybranego okresu (częstotliwość występowania, lokalizacje, wzorce).
    -   Porównanie z okresem poprzednim o takiej samej długości (np. jeśli wybrano ostatni miesiąc, porównanie z miesiącem poprzednim).
    -   Analizę trendów: czy objawy się nasilają, stabilizują czy zmniejszają.
    -   Identyfikację nowych symptomów, które nie występowały w poprzednim okresie.
    -   Statystyki liczbowe: całkowita liczba zgłoszonych symptomów w obu okresach.
-   Podczas generowania raportu wyświetlany jest wskaźnik ładowania z informacją o trwającym procesie.
-   Wygenerowany raport wyświetlany jest w czytelnym formacie tekstowym w oknie modalnym lub na dedykowanej stronie.
-   Użytkownik może skopiować raport do schowka lub pobrać jako plik tekstowy.
-   W przypadku braku wystarczających danych do wygenerowania pełnego raportu, system informuje użytkownika o tym fakcie.

## 4. Granice produktu

### 4.1. W zakresie MVP
-   Pełna funkcjonalność zarządzania kontem użytkownika (rejestracja, logowanie, reset hasła, usuwanie konta).
-   Operacje CRUD na wpisach dotyczących symptomów.
-   Sortowanie listy symptomów chronologicznie (od najnowszych).
-   Filtrowanie listy według daty, typu symptomu i części ciała.
-   Generowanie inteligentnego raportu AI z analizą symptomów i porównaniem okresów.
-   Aplikacja webowa działająca w przeglądarce.

### 4.2. Poza zakresem MVP
-   Wizualizacja danych (np. wykresy, mapy ciała).
-   Import i eksport danych do plików zewnętrznych.
-   Współdzielenie danych z lekarzami lub innymi użytkownikami.
-   Integracje z zewnętrznymi platformami zdrowotnymi.
-   Dedykowane aplikacje mobilne (iOS, Android).
-   Zaawansowane funkcje dostępności (accessibility, a11y).
-   Proces onboardingu dla nowych użytkowników.

## 5. Historyjki użytkowników

---
-   ID: US-001
-   Tytuł: Rejestracja nowego użytkownika
-   Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, aby uzyskać dostęp do jej funkcjonalności.
-   Kryteria akceptacji:
    1.  Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
    2.  System waliduje poprawność formatu adresu e-mail.
    3.  System sprawdza, czy hasła w obu polach są identyczne.
    4.  Po pomyślnej rejestracji jestem automatycznie zalogowany i przekierowany do głównego widoku listy symptomów.
    5.  Jeśli adres e-mail jest już zajęty, wyświetlany jest odpowiedni komunikat błędu.

---
-   ID: US-002
-   Tytuł: Logowanie do aplikacji
-   Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, podając e-mail i hasło, aby uzyskać dostęp do moich prywatnych danych.
-   Kryteria akceptacji:
    1.  Formularz logowania zawiera pola na adres e-mail i hasło.
    2.  Po pomyślnym zalogowaniu jestem przekierowany do głównego widoku listy symptomów.
    3.  W przypadku podania błędnych danych logowania, wyświetlany jest stosowny komunikat.
    4.  Na stronie logowania znajduje się link do funkcji "zapomniałem hasła".

---
-   ID: US-003
-   Tytuł: Resetowanie hasła
-   Opis: Jako użytkownik, który zapomniał hasła, chcę mieć możliwość jego zresetowania, aby odzyskać dostęp do mojego konta.
-   Kryteria akceptacji:
    1.  Po kliknięciu linku "zapomniałem hasła", przechodzę do formularza, gdzie mogę podać swój adres e-mail.
    2.  Po podaniu adresu e-mail, na moją skrzynkę pocztową wysyłany jest link do zresetowania hasła.
    3.  Link jest unikalny i ma ograniczony czas ważności.
    4.  Po kliknięciu w link, jestem przekierowany do formularza, gdzie mogę ustawić nowe hasło.

---
-   ID: US-004
-   Tytuł: Przeglądanie listy symptomów
-   Opis: Jako zalogowany użytkownik, chcę widzieć listę moich zapisanych symptomów posortowaną od najnowszego, aby móc śledzić historię objawów.
-   Kryteria akceptacji:
    1.  Główny widok po zalogowaniu to lista moich symptomów.
    2.  Wpisy są domyślnie posortowane od najnowszego do najstarszego.
    3.  Każdy element listy wyświetla datę, typ symptomu i część ciała.
    4.  Gdy przewijam listę w dół, starsze wpisy są automatycznie doładowywane (infinite scroll).
    5.  Podczas ładowania danych widoczny jest wskaźnik ładowania.

---
-   ID: US-005
-   Tytuł: Dodawanie nowego symptomu
-   Opis: Jako użytkownik, chcę móc szybko dodać nowy symptom, wybierając jego typ i lokalizację z predefiniowanej listy, aby proces był jak najszybszy.
-   Kryteria akceptacji:
    1.  Na głównym ekranie znajduje się przycisk "Dodaj symptom", który otwiera okno modalne z formularzem.
    2.  Formularz zawiera pola: typ symptomu (lista wyboru), część ciała (lista wyboru), notatki (pole tekstowe) oraz data i godzina (z możliwością edycji).
    3.  Pola "typ symptomu" i "część ciała" są wymagane.
    4.  Po pomyślnym zapisaniu formularza, okno modalne jest zamykane, a nowy wpis pojawia się na górze listy symptomów.
    5.  Wyświetlane jest powiadomienie o sukcesie operacji.

---
-   ID: US-006
-   Tytuł: Edycja istniejącego symptomu
-   Opis: Jako użytkownik, chcę mieć możliwość poprawienia błędnie wprowadzonego wpisu, aby moje dane były zawsze aktualne i poprawne.
-   Kryteria akceptacji:
    1.  Każdy wpis na liście ma opcję "Edytuj".
    2.  Kliknięcie "Edytuj" otwiera to samo okno modalne co przy dodawaniu, ale wypełnione danymi wybranego wpisu.
    3.  Mogę zmienić dowolne pole i zapisać zmiany.
    4.  Po zapisaniu zmian, okno modalne jest zamykane, a zaktualizowany wpis jest widoczny na liście.
    5.  Wyświetlane jest powiadomienie o pomyślnej aktualizacji.

---
-   ID: US-007
-   Tytuł: Usuwanie symptomu
-   Opis: Jako użytkownik, chcę mieć możliwość usunięcia wpisu, aby móc pozbyć się niepotrzebnych lub błędnych danych.
-   Kryteria akceptacji:
    1.  Każdy wpis na liście ma opcję "Usuń".
    2.  Po kliknięciu "Usuń", wyświetlane jest okno dialogowe z prośbą o potwierdzenie operacji.
    3.  Dopiero po potwierdzeniu wpis jest trwale usuwany z bazy danych.
    4.  Po usunięciu wpis znika z listy, a ja widzę komunikat o pomyślnym usunięciu.
    5.  Jeśli anuluję operację w oknie dialogowym, wpis nie jest usuwany.

---
-   ID: US-008
-   Tytuł: Filtrowanie listy symptomów
-   Opis: Jako użytkownik, chcę filtrować moje wpisy po dacie, typie i lokalizacji, aby móc analizować trendy i wzorce w moich objawach.
-   Kryteria akceptacji:
    1.  Nad listą symptomów znajduje się panel z polami filtrów: zakres dat, typ symptomu, część ciała.
    2.  Zmiana wartości w dowolnym filtrze automatycznie odświeża listę, pokazując tylko pasujące wpisy.
    3.  Dostępny jest przycisk "Resetuj filtry", który przywraca domyślny widok listy i czyści wszystkie pola filtrów.
    4.  Filtry mogą być łączone (np. mogę wyszukać "mrowienie" w "rękach" w ostatnim tygodniu).

---
-   ID: US-009
-   Tytuł: Usunięcie konta
-   Opis: Jako użytkownik, chcę mieć możliwość trwałego usunięcia mojego konta i wszystkich moich danych, aby mieć pełną kontrolę nad swoją prywatnością.
-   Kryteria akceptacji:
    1.  W ustawieniach konta znajduje się opcja "Usuń konto".
    2.  Po kliknięciu tej opcji, system prosi o ostateczne potwierdzenie, informując o nieodwracalności tej akcji.
    3.  Po potwierdzeniu, moje konto oraz wszystkie powiązane z nim symptomy są trwale usuwane z bazy danych.
    4.  Jestem automatycznie wylogowywany i nie mogę się już zalogować na to konto.

---
-   ID: US-010
-   Tytuł: Generowanie raportu AI o symptomach
-   Opis: Jako użytkownik, chcę móc wygenerować inteligentny raport tekstowy o moich symptomach z wybranego okresu, aby lepiej zrozumieć przebieg mojej choroby i przygotować się do konsultacji lekarskiej.
-   Kryteria akceptacji:
    1.  Na głównym ekranie znajduje się przycisk "Generuj raport", który otwiera okno z opcjami generowania.
    2.  Mogę wybrać okres analizy (ostatni tydzień, miesiąc, 3 miesiące) lub wybrać domyślną wartość (ostatni miesiąc).
    3.  Po kliknięciu "Generuj", system wyświetla wskaźnik ładowania z informacją o trwającym procesie.
    4.  Wygenerowany raport zawiera:
        -   Podsumowanie symptomów z wybranego okresu (typy, częstotliwość, lokalizacje).
        -   Porównanie z okresem poprzednim (np. ostatni miesiąc vs. poprzedni miesiąc).
        -   Analizę trendów (nasilenie, stabilizacja, zmniejszenie objawów).
        -   Informację o nowych symptomach, które nie występowały wcześniej.
        -   Statystyki liczbowe dla obu okresów.
    5.  Raport jest prezentowany w czytelnym formacie tekstowym.
    6.  Mam możliwość skopiowania raportu do schowka lub pobrania jako plik tekstowy.
    7.  Jeśli nie mam wystarczających danych, system informuje mnie o tym i sugeruje zapisanie większej liczby symptomów.
    8.  Po zamknięciu raportu wracam do głównego widoku aplikacji.
