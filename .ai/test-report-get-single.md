# Manual Testing Guide: GET /api/reports/{id}

This document provides comprehensive testing scenarios for the GET /api/reports/{id} endpoint.

## Prerequisites

1. **Running local server**: `npm run dev`
2. **Valid JWT token**: Use `node scripts/get-auth-token.mjs` to obtain a token
3. **Test data**: Create test reports in database using POST /api/reports

## Environment Setup

```bash
# Set your JWT token (obtain from get-auth-token.mjs script)
$TOKEN = "your-jwt-token-here"

# Set base URL
$BASE_URL = "http://localhost:4321"
```

## Test Scenarios

### ✅ Test 1: Success (200 OK)

**Description**: Retrieve an existing report that belongs to the authenticated user.

**Setup**:
1. First create a test report to get a valid ID:
```powershell
curl -X POST "$BASE_URL/api/reports" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"period_type": "week"}'
```
2. Note the `id` from the response (e.g., id: 1)

**Test Request**:
```powershell
curl -X GET "$BASE_URL/api/reports/1" `
  -H "Authorization: Bearer $TOKEN" `
  -v
```

**Expected Response**:
- Status: `200 OK`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-10-31T12:00:00Z",
  "content": "# Raport Analizy Objawów...",
  "period_start": "2025-10-24T00:00:00Z",
  "period_end": "2025-10-31T00:00:00Z",
  "period_type": "week"
}
```

---

### ❌ Test 2: Invalid ID Format (400 Bad Request)

**Description**: Request with non-numeric ID parameter.

**Test Requests**:

**2a. Non-numeric ID**:
```powershell
curl -X GET "$BASE_URL/api/reports/abc" `
  -H "Authorization: Bearer $TOKEN" `
  -v
```

**2b. Negative ID**:
```powershell
curl -X GET "$BASE_URL/api/reports/-5" `
  -H "Authorization: Bearer $TOKEN" `
  -v
```

**2c. Decimal ID**:
```powershell
curl -X GET "$BASE_URL/api/reports/3.14" `
  -H "Authorization: Bearer $TOKEN" `
  -v
```

**2d. Zero ID**:
```powershell
curl -X GET "$BASE_URL/api/reports/0" `
  -H "Authorization: Bearer $TOKEN" `
  -v
```

**Expected Response** (all cases):
- Status: `400 Bad Request`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "error": "Bad Request",
  "message": "Report ID must be a positive integer",
  "details": { ... }
}
```

---

### 🔒 Test 3: Missing Authentication (401 Unauthorized)

**Description**: Request without JWT token.

**Test Request**:
```powershell
curl -X GET "$BASE_URL/api/reports/1" `
  -v
```

**Expected Response**:
- Status: `401 Unauthorized`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

### 🚫 Test 4: Report Belongs to Another User (403 Forbidden)

**Description**: Attempt to access a report owned by a different user.

**Setup**:
1. Create a report with user A's token: `$TOKEN_A`
2. Note the report ID (e.g., id: 2)
3. Try to access it with user B's token: `$TOKEN_B`

**Test Request**:
```powershell
# First, create report as User A
$TOKEN_A = "user-a-jwt-token"
curl -X POST "$BASE_URL/api/reports" `
  -H "Authorization: Bearer $TOKEN_A" `
  -H "Content-Type: application/json" `
  -d '{"period_type": "week"}'

# Note the ID from response (e.g., 2)

# Then, try to access as User B
$TOKEN_B = "user-b-jwt-token"
curl -X GET "$BASE_URL/api/reports/2" `
  -H "Authorization: Bearer $TOKEN_B" `
  -v
```

**Expected Response**:
- Status: `403 Forbidden`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "error": "Forbidden",
  "message": "Access denied. You do not have permission to view this report."
}
```

---

### 🔍 Test 5: Report Not Found (404 Not Found)

**Description**: Request a report ID that doesn't exist in the database.

**Test Request**:
```powershell
curl -X GET "$BASE_URL/api/reports/999999" `
  -H "Authorization: Bearer $TOKEN" `
  -v
```

**Expected Response**:
- Status: `404 Not Found`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "error": "Not Found",
  "message": "Report not found"
}
```

---

### 💥 Test 6: Server Error Simulation (500 Internal Server Error)

**Description**: Trigger internal server error (requires special setup).

**Setup**: This is difficult to test without stopping the database or introducing artificial errors.

**Alternative Test**: Check server logs for proper error handling when database is temporarily unavailable.

**Expected Response** (if triggered):
- Status: `500 Internal Server Error`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to retrieve report"
}
```

---

## Automated Test Script

Create a PowerShell script to run all tests:

```powershell
# test-get-report-endpoint.ps1

# Configuration
$TOKEN = "your-jwt-token-here"
$BASE_URL = "http://localhost:4321"

Write-Host "=== Testing GET /api/reports/{id} ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create a report first
Write-Host "Test 1: Creating test report..." -ForegroundColor Yellow
$createResponse = curl -s -X POST "$BASE_URL/api/reports" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"period_type": "week"}' | ConvertFrom-Json

$testReportId = $createResponse.id
Write-Host "✓ Created report with ID: $testReportId" -ForegroundColor Green
Write-Host ""

# Test 2: Success - Get the created report
Write-Host "Test 2: GET existing report (200 OK)..." -ForegroundColor Yellow
$response = curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/reports/$testReportId" `
  -H "Authorization: Bearer $TOKEN"
$statusCode = ($response -split '\n')[-1]
Write-Host "Status Code: $statusCode"
if ($statusCode -eq "200") {
    Write-Host "✓ PASS" -ForegroundColor Green
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}
Write-Host ""

# Test 3: Invalid ID (400 Bad Request)
Write-Host "Test 3: Invalid ID format (400 Bad Request)..." -ForegroundColor Yellow
$response = curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/reports/abc" `
  -H "Authorization: Bearer $TOKEN"
$statusCode = ($response -split '\n')[-1]
Write-Host "Status Code: $statusCode"
if ($statusCode -eq "400") {
    Write-Host "✓ PASS" -ForegroundColor Green
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}
Write-Host ""

# Test 4: No authentication (401 Unauthorized)
Write-Host "Test 4: No authentication (401 Unauthorized)..." -ForegroundColor Yellow
$response = curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/reports/$testReportId"
$statusCode = ($response -split '\n')[-1]
Write-Host "Status Code: $statusCode"
if ($statusCode -eq "401") {
    Write-Host "✓ PASS" -ForegroundColor Green
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}
Write-Host ""

# Test 5: Non-existent report (404 Not Found)
Write-Host "Test 5: Non-existent report (404 Not Found)..." -ForegroundColor Yellow
$response = curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/reports/999999" `
  -H "Authorization: Bearer $TOKEN"
$statusCode = ($response -split '\n')[-1]
Write-Host "Status Code: $statusCode"
if ($statusCode -eq "404") {
    Write-Host "✓ PASS" -ForegroundColor Green
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
```

**Usage**:
```powershell
# Save the script as test-get-report-endpoint.ps1
# Update $TOKEN variable with your JWT
# Run the script
.\test-get-report-endpoint.ps1
```

---

## Integration Test Checklist

After running all tests, verify:

- [ ] ✅ Endpoint returns correct report data for authorized user (200)
- [ ] ✅ Validation rejects invalid ID formats (400)
- [ ] ✅ Authentication is properly enforced (401)
- [ ] ✅ Authorization prevents access to other users' reports (403)
- [ ] ✅ Non-existent reports return 404
- [ ] ✅ All responses have correct Content-Type header
- [ ] ✅ Error responses have consistent structure
- [ ] ✅ Server logs errors appropriately (check console)
- [ ] ✅ No sensitive data leaked in error messages
- [ ] ✅ Response times are acceptable (< 200ms typical)

---

## Performance Testing

**Load test** with Apache Bench (if available):
```bash
# Install Apache Bench first if not available
# Test with 1000 requests, 100 concurrent
ab -n 1000 -c 100 -H "Authorization: Bearer $TOKEN" \
  http://localhost:4321/api/reports/1
```

**Expected metrics**:
- Mean response time: < 100ms
- P95 response time: < 200ms
- P99 response time: < 300ms
- Success rate: 100%

---

## Database Verification

After running tests, verify database state:

```sql
-- Check that the composite index was created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'reports' 
  AND indexname = 'idx_reports_user_id_id';

-- Check query plan uses the index
EXPLAIN ANALYZE 
SELECT * FROM reports 
WHERE user_id = 'test-user-id' AND id = 1;

-- Should show: "Index Scan using idx_reports_user_id_id"
```

---

## Troubleshooting

### Issue: 401 Unauthorized despite valid token
**Solution**: 
- Check token hasn't expired
- Verify middleware is properly configured
- Check `context.locals.user` is populated

### Issue: All reports return 404
**Solution**:
- Verify database has test data
- Check Supabase connection is working
- Review RLS policies (should be disabled for reports table)

### Issue: Slow response times
**Solution**:
- Verify composite index is created and being used
- Check database connection pool settings
- Monitor Supabase dashboard for performance metrics

---

## Next Steps

After successful manual testing:
1. ✅ Create automated unit tests for service functions
2. ✅ Create automated integration tests for the endpoint
3. ✅ Set up CI/CD pipeline to run tests automatically
4. ✅ Configure monitoring and alerting for production

