<conversation_summary>
<decisions>
1.  **Encja Symptomu:** Pojedynczy wpis będzie zawierał: `id`, `user_id`, `created_at` (data i godzina), `symptom_type` (typ), `body_part` (część ciała) i `notes` (notatki). Pola `symptom_type` i `body_part` są obowiązkowe.
2.  **Predefiniowane Listy:** Wartości dla `symptom_type` ('Tingle', 'Numbness', 'Cramps', 'FuckedUp') i `body_part` ('head', 'hands', 'legs', 'neck', 'back', 'arms') są stałe i niezmienne dla użytkownika w MVP.
3.  **Uwierzytelnianie:** Wdrożony zostanie prosty system uwierzytelniania (e-mail/hasło) oparty o Supabase Auth. Obejmuje to rejestrację, logowanie, funkcję "zapomniałem hasła" oraz możliwość usunięcia konta przez użytkownika. Po rejestracji użytkownik jest automatycznie logowany.
4.  **Lista Symptomów:** Główny ekran aplikacji będzie wyświetlał listę symptomów posortowaną od najnowszego. Zastosowany zostanie "infinite scroll" do ładowania starszych wpisów.
5.  **Filtrowanie:** Lista będzie filtrowana według: liczby ostatnich rekordów (domyślnie 10), zakresu dat, typu symptomu (pojedynczy wybór) i części ciała (pojedynczy wybór). Filtry będą zawsze widoczne nad listą i będzie dostępny przycisk do ich resetowania.
6.  **Operacje CRUD:** Dodawanie i edycja symptomów odbywać się będzie w tym samym oknie modalnym. Usuwanie wpisu zostanie zabezpieczone oknem dialogowym z potwierdzeniem.
7.  **UX/UI:** Interfejs będzie responsywny, oparty o komponenty z biblioteki Shadcn/ui. Będą stosowane jasne komunikaty o błędach (toasty), stany ładowania (spinners) i komunikaty o sukcesie. Ton komunikacji ma być wspierający i empatyczny. Data będzie wyświetlana w formacie absolutnym (`DD.MM.RRRR HH:MM`).
8.  **Funkcjonalności Poza Zakresem MVP:** Wizualizacja danych (wykresy), onboarding użytkownika, zbieranie opinii, mierzenie wskaźników sukcesu oraz funkcje dostępności (accessibility) zostały świadomie pominięte w pierwszej wersji produktu.
</decisions>

<matched_recommendations>
1.  **Struktura Danych:** Zdefiniowano i zaakceptowano konkretny schemat danych dla symptomu, włączając w to typy `enum` w bazie danych dla kluczowych pól, co zapewni integralność danych.
2.  **Uwierzytelnianie i Bezpieczeństwo:** Zdecydowano się na wykorzystanie gotowego rozwiązania Supabase Auth, obejmującego kluczowe funkcje bezpieczeństwa, takie jak resetowanie hasła i usuwanie konta.
3.  **Przepływ Użytkownika (User Flow):** Ustalono spójny i nowoczesny przepływ pracy: główny widok listy, "pływający" przycisk akcji, użycie okien modalnych do edycji/dodawania oraz "infinite scroll" do przeglądania danych.
4.  **Obsługa Błędów i Stanów:** Zaakceptowano rekomendacje dotyczące informowania użytkownika o stanie aplikacji poprzez wskaźniki ładowania oraz dyskretne powiadomienia (toasty) o sukcesie lub porażce operacji.
5.  **Spójność Interfejsu:** Podjęto decyzję o konsekwentnym używaniu biblioteki komponentów Shadcn/ui, co zapewni spójność wizualną i przyspieszy rozwój.
6.  **Zabezpieczenie przed Utratą Danych:** Przyjęto kluczową rekomendację dotyczącą wprowadzenia okna dialogowego z potwierdzeniem przed usunięciem wpisu, co minimalizuje ryzyko przypadkowej utraty danych.
</matched_recommendations>

<prd_planning_summary>
### **1. Główny Problem i Cel**
Aplikacja ma na celu rozwiązanie problemu efektywnego zapisywania symptomów choroby stwardnienie rozsiane (SM) przez pacjentów. Celem MVP jest dostarczenie narzędzia do szybkiego i ustrukturyzowanego logowania, przeglądania i filtrowania historii objawów. Wizualizacja danych została przesunięta do kolejnej fazy projektu.

### **2. Główne Wymagania Funkcjonalne**
*   **Zarządzanie Kontem Użytkownika:**
    *   Rejestracja za pomocą adresu e-mail i hasła.
    *   Logowanie i automatyczne logowanie po rejestracji.
    *   Mechanizm resetowania zapomnianego hasła.
    *   Możliwość trwałego usunięcia konta i wszystkich danych przez użytkownika.
*   **Zarządzanie Symptomami (CRUD):**
    *   **Dodawanie:** Użytkownik może dodać nowy symptom poprzez formularz w oknie modalnym, wybierając typ, część ciała i dodając opcjonalne notatki. Data i godzina są domyślnie ustawiane na aktualne, z możliwością edycji.
    *   **Przeglądanie:** Główny ekran aplikacji to chronologiczna (od najnowszych) lista symptomów, prezentująca datę, typ i część ciała. Lista obsługuje "infinite scroll".
    *   **Edycja:** Użytkownik może edytować wszystkie pola istniejącego wpisu w tym samym formularzu, który służy do dodawania.
    *   **Usuwanie:** Użytkownik może usunąć wpis po potwierdzeniu operacji w oknie dialogowym.
*   **Filtrowanie Danych:**
    *   Użytkownik ma dostęp do panelu filtrów, który pozwala na zawężenie listy według zakresu dat, typu symptomu oraz części ciała.
    *   Dostępna jest opcja resetowania wszystkich filtrów do stanu domyślnego.

### **3. Kluczowe Historie Użytkownika (User Stories)**
*   **Jako pacjent, chcę** założyć konto i bezpiecznie się logować, aby moje dane zdrowotne były prywatne.
*   **Jako pacjent, chcę** szybko zarejestrować nowy symptom, wybierając jego typ i lokalizację z predefiniowanej listy, aby proces był jak najszybszy.
*   **Jako pacjent, chcę** przeglądać historię moich symptomów w porządku chronologicznym, aby widzieć najnowsze zdarzenia.
*   **Jako pacjent, chcę** filtrować moje wpisy po dacie, typie i lokalizacji, aby móc analizować trendy i wzorce.
*   **Jako pacjent, chcę** mieć możliwość poprawienia lub usunięcia błędnie wprowadzonego wpisu.

### **4. Kryteria Sukcesu**
Użytkownik świadomie zdecydował o pominięciu definiowania mierzalnych wskaźników sukcesu na etapie planowania MVP.
</prd_planning_summary>

<unresolved_issues>
1.  **Dostępność (Accessibility, a11y):** Użytkownik świadomie zrezygnował z wdrożenia zasad dostępności w MVP. Jest to istotna kwestia, zwłaszcza w aplikacji o tematyce zdrowotnej, i powinna być ponownie rozważona w przyszłych iteracjach produktu, ponieważ może stanowić barierę dla części użytkowników.
</unresolved_issues>
</conversation_summary>
