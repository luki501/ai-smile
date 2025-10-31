# Instrukcje testowania GET /api/reports

## Przygotowanie środowiska

### 1. Zastosowanie migracji RLS

**WAŻNE**: Przed testowaniem należy zastosować nową migrację przywracającą Row-Level Security:

```bash
# Jeśli używasz lokalnego Supabase
supabase db reset

# Lub zastosuj migrację manualnie
supabase migration up
```

Migracja `20251031200000_enable_reports_rls.sql` przywraca RLS dla tabeli `reports`, zapewniając, że użytkownicy mogą widzieć tylko swoje raporty.

### 2. Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Serwer powinien uruchomić się na `http://localhost:4321`.

### 3. Uzyskanie tokenu JWT

Użyj skryptu pomocniczego do pobrania tokenu:

```bash
node scripts/get-auth-token.mjs twoj-email@example.com twoje-haslo
```

Zapisz wyświetlony token JWT - będzie potrzebny w każdym teście.

---

## Testy manualne

### Test 1: Podstawowe żądanie bez parametrów

**Cel**: Sprawdzenie czy endpoint zwraca listę raportów z domyślnymi parametrami paginacji.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:4321/api/reports" -Headers $headers -Method GET
```

**Polecenie** (curl):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     http://localhost:4321/api/reports
```

**Oczekiwany wynik**:
- Status: `200 OK`
- Response body:
  ```json
  {
    "data": [ ...maksymalnie 10 raportów... ],
    "count": <całkowita liczba raportów użytkownika>
  }
  ```

---

### Test 2: Paginacja z custom offset i limit

**Cel**: Sprawdzenie czy parametry paginacji działają poprawnie.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:4321/api/reports?offset=5&limit=3" -Headers $headers -Method GET
```

**Polecenie** (curl):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     "http://localhost:4321/api/reports?offset=5&limit=3"
```

**Oczekiwany wynik**:
- Status: `200 OK`
- Response body zawiera maksymalnie 3 raporty (pomijając pierwsze 5)
- Pole `count` pozostaje bez zmian (całkowita liczba)

---

### Test 3: Filtrowanie według period_type

**Cel**: Sprawdzenie czy filtrowanie według typu okresu działa.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:4321/api/reports?period_type=month" -Headers $headers -Method GET
```

**Polecenie** (curl):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     "http://localhost:4321/api/reports?period_type=month"
```

**Oczekiwany wynik**:
- Status: `200 OK`
- Wszystkie raporty w `data` mają `period_type: "month"`
- Pole `count` pokazuje liczbę raportów miesięcznych

**Dodatkowe testy**:
- Spróbuj z `period_type=week`
- Spróbuj z `period_type=quarter`

---

### Test 4: Walidacja - nieprawidłowy offset

**Cel**: Sprawdzenie czy walidacja parametrów działa.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
try {
    Invoke-RestMethod -Uri "http://localhost:4321/api/reports?offset=-1" -Headers $headers -Method GET
} catch {
    $_.Exception.Response.StatusCode.value__
    $_.ErrorDetails.Message
}
```

**Polecenie** (curl):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     "http://localhost:4321/api/reports?offset=-1"
```

**Oczekiwany wynik**:
- Status: `400 Bad Request`
- Response body:
  ```json
  {
    "error": "Invalid query parameters",
    "details": { ...szczegóły błędu walidacji... }
  }
  ```

---

### Test 5: Walidacja - limit przekraczający maksimum

**Cel**: Sprawdzenie czy limit jest ograniczony do 100.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
try {
    Invoke-RestMethod -Uri "http://localhost:4321/api/reports?limit=101" -Headers $headers -Method GET
} catch {
    $_.Exception.Response.StatusCode.value__
    $_.ErrorDetails.Message
}
```

**Polecenie** (curl):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     "http://localhost:4321/api/reports?limit=101"
```

**Oczekiwany wynik**:
- Status: `400 Bad Request`
- Response body zawiera informację o błędzie walidacji

---

### Test 6: Walidacja - nieprawidłowy period_type

**Cel**: Sprawdzenie czy tylko dozwolone wartości period_type są akceptowane.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
try {
    Invoke-RestMethod -Uri "http://localhost:4321/api/reports?period_type=invalid" -Headers $headers -Method GET
} catch {
    $_.Exception.Response.StatusCode.value__
    $_.ErrorDetails.Message
}
```

**Polecenie** (curl):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     "http://localhost:4321/api/reports?period_type=invalid"
```

**Oczekiwany wynik**:
- Status: `400 Bad Request`
- Response body zawiera informację o dopuszczalnych wartościach (week, month, quarter)

---

### Test 7: Brak autoryzacji

**Cel**: Sprawdzenie czy endpoint wymaga autentykacji.

**Polecenie** (PowerShell):
```powershell
try {
    Invoke-RestMethod -Uri "http://localhost:4321/api/reports" -Method GET
} catch {
    $_.Exception.Response.StatusCode.value__
    $_.ErrorDetails.Message
}
```

**Polecenie** (curl):
```bash
curl http://localhost:4321/api/reports
```

**Oczekiwany wynik**:
- Status: `401 Unauthorized`
- Response body:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

### Test 8: Sortowanie chronologiczne

**Cel**: Sprawdzenie czy raporty są sortowane od najnowszych.

**Polecenie** (PowerShell):
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE" }
$response = Invoke-RestMethod -Uri "http://localhost:4321/api/reports?limit=5" -Headers $headers -Method GET
$response.data | ForEach-Object { Write-Host "ID: $($_.id), Created: $($_.created_at)" }
```

**Polecenie** (curl + jq):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     "http://localhost:4321/api/reports?limit=5" | jq '.data[] | {id, created_at}'
```

**Oczekiwany wynik**:
- Daty `created_at` są w porządku malejącym (najnowsze pierwsze)

---

## Weryfikacja bezpieczeństwa RLS

### Test 9: Izolacja danych między użytkownikami

**Cel**: Upewnić się, że użytkownik A nie widzi raportów użytkownika B.

**Kroki**:
1. Zaloguj się jako użytkownik A i pobierz token JWT
2. Wykonaj żądanie `GET /api/reports` i zapisz ID raportów
3. Zaloguj się jako użytkownik B i pobierz token JWT
4. Wykonaj żądanie `GET /api/reports` z tokenem użytkownika B
5. Sprawdź czy lista nie zawiera raportów użytkownika A

**Oczekiwany wynik**:
- Użytkownik B widzi tylko swoje raporty
- ID raportów nie pokrywają się z raportami użytkownika A

---

## Checklist testów

- [ ] Test 1: Podstawowe żądanie - PASSED
- [ ] Test 2: Paginacja - PASSED
- [ ] Test 3: Filtrowanie period_type - PASSED
- [ ] Test 4: Walidacja offset < 0 - PASSED
- [ ] Test 5: Walidacja limit > 100 - PASSED
- [ ] Test 6: Walidacja nieprawidłowy period_type - PASSED
- [ ] Test 7: Brak autoryzacji - PASSED
- [ ] Test 8: Sortowanie chronologiczne - PASSED
- [ ] Test 9: Izolacja danych RLS - PASSED

---

## Rozwiązywanie problemów

### Problem: Brak raportów w odpowiedzi

**Możliwe przyczyny**:
1. Użytkownik nie wygenerował jeszcze żadnych raportów
   - **Rozwiązanie**: Utwórz raport używając `POST /api/reports`
2. RLS blokuje dostęp (przed zastosowaniem migracji)
   - **Rozwiązanie**: Zastosuj migrację `20251031200000_enable_reports_rls.sql`

### Problem: 401 Unauthorized mimo poprawnego tokenu

**Możliwe przyczyny**:
1. Token wygasł
   - **Rozwiązanie**: Wygeneruj nowy token
2. Token został skopiowany niepoprawnie
   - **Rozwiązanie**: Upewnij się, że token nie zawiera spacji ani znaków nowej linii

### Problem: 500 Internal Server Error

**Możliwe przyczyny**:
1. Błąd połączenia z bazą danych
   - **Rozwiązanie**: Sprawdź czy Supabase jest uruchomiony i dostępny
2. Błąd w logice serwera
   - **Rozwiązanie**: Sprawdź logi serwera deweloperskiego

---

## Dodatkowe notatki

- **Indeksy DB**: Endpoint korzysta z indeksu `reports_user_id_created_at_idx` dla optymalnej wydajności
- **RLS Policy**: Policy `reports_auth_select` automatycznie filtruje raporty według `user_id`
- **Limity**: Maksymalny limit na żądanie to 100 rekordów (hardcoded)
- **Domyślne wartości**: offset=0, limit=10

