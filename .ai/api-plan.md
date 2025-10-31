# REST API Plan

## 1. Resources

- **Symptom**: Represents a single symptom entry logged by a user.
  - Corresponding Database Table: `public.symptoms`
- **Report**: Represents an AI-generated analysis report of symptom data for a specific time period.
  - Corresponding Database Table: `public.reports`
- **User**: Represents a user account.
  - Corresponding Database Table: `auth.users`, `public.profiles`

## 2. Endpoints

### Symptom Endpoints

#### `GET /api/symptoms`

- **Description**: Retrieves a paginated list of symptoms for the authenticated user, with support for filtering and sorting.
- **Query Parameters**:
  - `offset` (number, optional, default: 0): The number of items to skip for pagination.
  - `limit` (number, optional, default: 20): The maximum number of items to return.
  - `occurred_at_gte` (string, optional): ISO 8601 timestamp. Filters symptoms that occurred on or after this date.
  - `occurred_at_lte` (string, optional): ISO 8601 timestamp. Filters symptoms that occurred on or before this date.
  - `symptom_type` (string, optional): Filters by a specific symptom type.
  - `body_part` (string, optional): Filters by a specific body part.
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "occurred_at": "2025-10-27T10:00:00Z",
        "symptom_type": "Tingle",
        "body_part": "Hands",
        "notes": "Slight tingle in the fingertips.",
        "created_at": "2025-10-27T10:00:15Z"
      }
    ],
    "count": 1
  }
  ```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `400 Bad Request`: Invalid query parameters.
  - `401 Unauthorized`: User is not authenticated.

---

#### `POST /api/symptoms`

- **Description**: Creates a new symptom entry for the authenticated user.
- **Request Payload**:
  ```json
  {
    "occurred_at": "2025-10-28T11:30:00Z",
    "symptom_type": "Numbness",
    "body_part": "Legs",
    "notes": "Feeling of numbness in the left leg."
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": 2,
    "user_id": "user-uuid-goes-here",
    "occurred_at": "2025-10-28T11:30:00Z",
    "symptom_type": "Numbness",
    "body_part": "Legs",
    "notes": "Feeling of numbness in the left leg.",
    "created_at": "2025-10-28T11:30:05Z"
  }
  ```
- **Success Response**: `201 Created`
- **Error Responses**:
  - `400 Bad Request`: Invalid or missing fields in the request body.
  - `401 Unauthorized`: User is not authenticated.
  - `422 Unprocessable Entity`: Validation error (e.g., `symptom_type` is not a valid enum).

---

#### `PATCH /api/symptoms/{id}`

- **Description**: Updates an existing symptom entry.
- **URL Parameters**:
  - `id` (number, required): The ID of the symptom to update.
- **Request Payload** (only include fields to be updated):
  ```json
  {
    "notes": "The numbness has slightly worsened."
  }
  ```
- **Response Payload**: The full, updated symptom object.
  ```json
  {
    "id": 2,
    "user_id": "user-uuid-goes-here",
    "occurred_at": "2025-10-28T11:30:00Z",
    "symptom_type": "Numbness",
    "body_part": "Legs",
    "notes": "The numbness has slightly worsened.",
    "created_at": "2025-10-28T11:30:05Z"
  }
  ```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `400 Bad Request`: Invalid fields in the request body.
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User does not have permission to update this symptom.
  - `404 Not Found`: Symptom with the given ID does not exist.
  - `422 Unprocessable Entity`: Validation error.

---

#### `DELETE /api/symptoms/{id}`

- **Description**: Deletes a specific symptom entry.
- **URL Parameters**:
  - `id` (number, required): The ID of the symptom to delete.
- **Request Payload**: N/A
- **Response Payload**: N/A
- **Success Response**: `204 No Content`
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User does not have permission to delete this symptom.
  - `404 Not Found`: Symptom with the given ID does not exist.

---

### Auth Endpoints

#### `DELETE /api/auth/user`

- **Description**: Permanently deletes the authenticated user's account and all associated data (profile, symptoms). This action is irreversible.
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "message": "User account deleted successfully."
  }
  ```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `500 Internal Server Error`: Failed to delete the user account.

## 3. Authentication and Authorization

- **Mechanism**: Authentication will be handled using JSON Web Tokens (JWT) provided by Supabase Auth. When a user signs in or registers, Supabase issues an access token and a refresh token.
- **Implementation**:
  1.  The client-side application will store the JWT securely (e.g., in a cookie).
  2.  For every request to a protected API endpoint, the client must include the JWT in the `Authorization` header as a Bearer token (`Authorization: Bearer <YOUR_JWT>`).
  3.  An Astro middleware will intercept incoming requests to the API routes. This middleware will use Supabase's server-side helpers to validate the JWT.
  4.  If the token is valid, the request proceeds, and the user's identity is available in the request context. If invalid, a `401 Unauthorized` error is returned.
- **Authorization**: Authorization is enforced at the database level using PostgreSQL Row-Level Security (RLS). Policies are configured to ensure that users can only perform actions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) on rows in the `symptoms`, `reports`, and `profiles` tables that are associated with their `user_id`.

### Report Endpoints

> **Implementation Status**: 
> - ✅ `POST /api/reports` implemented (2025-10-31)
> - ✅ `GET /api/reports` implemented (2025-10-31)

#### `POST /api/reports`

- **Description**: Generates a new AI-powered symptom analysis report for the authenticated user based on a specified time period. The report includes symptom summaries, trend analysis, comparisons with the previous period, and identification of new symptoms. The generated report is saved to the database for future reference.
- **Request Payload**:
  ```json
  {
    "period_type": "month"
  }
  ```
  - `period_type` (string, required): The analysis period. Must be one of: `week`, `month`, `quarter`.
- **Response Payload**:
  ```json
  {
    "id": 1,
    "user_id": "user-uuid-goes-here",
    "created_at": "2025-10-31T12:00:00Z",
    "content": "# Symptom Analysis Report\n\n## Current Period Summary (2025-10-01 to 2025-10-31)\n\nDuring this month, you recorded 15 symptom entries...",
    "period_start": "2025-10-01T00:00:00Z",
    "period_end": "2025-10-31T23:59:59Z",
    "period_type": "month"
  }
  ```
- **Success Response**: `201 Created`
- **Error Responses**:
  - `400 Bad Request`: Invalid or missing `period_type` in the request body.
  - `401 Unauthorized`: User is not authenticated.
  - `422 Unprocessable Entity`: Validation error (e.g., invalid period_type value).
  - `424 Failed Dependency`: Insufficient symptom data to generate a meaningful report.
  - `500 Internal Server Error`: Failed to generate report (e.g., AI service unavailable).
  - `503 Service Unavailable`: AI service is temporarily unavailable.

---

#### `GET /api/reports`

- **Description**: Retrieves a paginated list of previously generated reports for the authenticated user, sorted by creation date (newest first).
- **Query Parameters**:
  - `offset` (number, optional, default: 0): The number of items to skip for pagination.
  - `limit` (number, optional, default: 10): The maximum number of items to return.
  - `period_type` (string, optional): Filter reports by period type (`week`, `month`, `quarter`).
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "user_id": "user-uuid-goes-here",
        "created_at": "2025-10-31T12:00:00Z",
        "content": "# Symptom Analysis Report\n\n## Current Period Summary...",
        "period_start": "2025-10-01T00:00:00Z",
        "period_end": "2025-10-31T23:59:59Z",
        "period_type": "month"
      }
    ],
    "count": 1
  }
  ```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `400 Bad Request`: Invalid query parameters.
  - `401 Unauthorized`: User is not authenticated.

---

#### `GET /api/reports/{id}`

- **Description**: Retrieves a specific report by ID for the authenticated user.
- **URL Parameters**:
  - `id` (number, required): The ID of the report to retrieve.
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "id": 1,
    "user_id": "user-uuid-goes-here",
    "created_at": "2025-10-31T12:00:00Z",
    "content": "# Symptom Analysis Report\n\n## Current Period Summary (2025-10-01 to 2025-10-31)\n\nDuring this month, you recorded 15 symptom entries...",
    "period_start": "2025-10-01T00:00:00Z",
    "period_end": "2025-10-31T23:59:59Z",
    "period_type": "month"
  }
  ```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User does not have permission to access this report.
  - `404 Not Found`: Report with the given ID does not exist.

---

#### `DELETE /api/reports/{id}`

- **Description**: Deletes a specific report. Allows users to manage their report history and remove outdated analyses.
- **URL Parameters**:
  - `id` (number, required): The ID of the report to delete.
- **Request Payload**: N/A
- **Response Payload**: N/A
- **Success Response**: `204 No Content`
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User does not have permission to delete this report.
  - `404 Not Found`: Report with the given ID does not exist.

---

## 4. Validation and Business Logic

- **Validation**: Input validation will be performed at the API layer for all `POST` and `PATCH` requests before interacting with the database. This provides faster feedback and clearer error messages. A library like `zod` will be used to define schemas for request bodies.
- **Validation Rules for `symptoms` resource**:
  - `occurred_at`: Must be a valid ISO 8601 timestamp string.
  - `symptom_type`: Must be one of `Tingle`, `Numbness`, `Cramps`, `FuckedUp`.
  - `body_part`: Must be one of `Head`, `Neck`, `Back`, `Arms`, `Hands`, `Legs`.
  - `notes`: Must be a string if provided.
- **Validation Rules for `reports` resource**:
  - `period_type`: Must be one of `week`, `month`, `quarter`.
  - `period_start`: Must be a valid ISO 8601 timestamp (calculated automatically based on period_type).
  - `period_end`: Must be a valid ISO 8601 timestamp (calculated automatically based on period_type).
  - `content`: Must be a non-empty string (generated by AI service).
- **Business Logic Implementation**:
  - **Account Deletion**: The `DELETE /api/auth/user` endpoint encapsulates the business logic for account deletion. It uses the Supabase Admin Client (initialized with a service role key) on the server to delete the user from the `auth.users` table. The `ON DELETE CASCADE` constraint on the `profiles`, `symptoms`, and `reports` tables ensures that all related data is automatically and atomically removed.
  - **User Profile Creation**: The creation of a user's `profile` record is automated at the database level via a trigger (`on_auth_user_created`) that fires after a new user is inserted into `auth.users`. This logic is not part of the REST API itself but is a core part of the system's architecture.
  - **Report Generation**: The `POST /api/reports` endpoint implements complex business logic:
    1. **Period Calculation**: Based on the `period_type`, the endpoint calculates the current period (period_end = now, period_start = now - period_duration) and the previous period for comparison.
    2. **Data Retrieval**: Fetches symptom data for both current and previous periods from the database.
    3. **Data Sufficiency Check**: Validates that there is sufficient data to generate a meaningful report. Returns `424 Failed Dependency` if insufficient data exists.
    4. **AI Analysis**: Sends symptom data to the AI service (via Openrouter.ai) with a structured prompt requesting:
       - Summary of current period symptoms (frequency, locations, patterns)
       - Comparison with previous period of equal length
       - Trend analysis (intensifying, stabilizing, decreasing)
       - Identification of new symptoms not present in previous period
       - Numerical statistics for both periods
    5. **Report Storage**: Saves the generated report content along with metadata to the `reports` table.
    6. **Error Handling**: Implements retry logic for transient AI service failures and returns appropriate error codes for different failure scenarios.
  - **Report Retrieval Optimization**: The `GET /api/reports` endpoint leverages the database index `reports_user_id_created_at_idx` for efficient retrieval of reports sorted by creation date.
  - **Report Access Control**: All report endpoints rely on RLS policies to ensure users can only access their own reports. The `USING (auth.uid() = user_id)` policy automatically filters results and prevents unauthorized access.

## 5. AI Service Integration

- **Service Provider**: Openrouter.ai provides access to multiple AI model providers (OpenAI, Anthropic, Google, etc.).
- **Configuration**:
  - API key stored securely as an environment variable (`OPENROUTER_API_KEY`).
  - Financial limits configured at the API key level in the Openrouter dashboard.
  - Model selection: Use cost-effective models with good reasoning capabilities (e.g., GPT-4o-mini, Claude Sonnet).
- **Report Generation Prompt Structure**:
  ```
  You are a medical data analyst specializing in multiple sclerosis symptom tracking.
  
  Analyze the following symptom data and generate a comprehensive report:
  
  Current Period ({period_type}): {period_start} to {period_end}
  [Symptom data in structured format]
  
  Previous Period ({period_type}): {prev_period_start} to {prev_period_end}
  [Symptom data in structured format]
  
  Generate a report including:
  1. Summary of current period symptoms (frequency, types, locations, patterns)
  2. Comparison with the previous period
  3. Trend analysis (improving, stable, worsening)
  4. New symptoms not present in the previous period
  5. Statistical summary for both periods
  
  Format the report in clear, patient-friendly language with appropriate sections.
  ```
- **Response Processing**:
  - Extract the AI-generated text content from the API response.
  - Validate that the response is non-empty and meets minimum quality standards.
  - Store the raw text content in the `reports.content` field.
- **Error Handling**:
  - Implement exponential backoff for rate limiting (HTTP 429).
  - Return `503 Service Unavailable` for temporary AI service outages.
  - Return `500 Internal Server Error` for unexpected AI service errors.
  - Log all AI service interactions for debugging and cost tracking.

## 6. Performance and Scalability Considerations

- **Database Indexes**: The following indexes optimize report-related queries:
  - `reports_user_id_created_at_idx`: Speeds up retrieval of user reports sorted by date.
  - `reports_period_idx`: Optimizes queries filtering reports by time periods.
  - `symptoms_user_id_occurred_at_idx`: Essential for efficient symptom data retrieval during report generation.
- **Caching Strategy**: 
  - Consider implementing application-level caching for recently generated reports to reduce redundant AI API calls.
  - Reports for the same period_type and similar time ranges could be cached with appropriate TTL (e.g., 1 hour).
- **Rate Limiting**: 
  - Implement per-user rate limiting for report generation (e.g., maximum 10 reports per hour) to prevent abuse and control AI API costs.
  - Use HTTP 429 Too Many Requests status code when limits are exceeded.
- **Asynchronous Processing**: 
  - For MVP, report generation is synchronous. Future iterations may implement asynchronous processing with webhooks or polling for status updates.
- **Pagination**: All list endpoints (`GET /api/reports`, `GET /api/symptoms`) implement offset-based pagination to handle large datasets efficiently.

## 7. Security Considerations

- **Data Privacy**: All reports contain sensitive health information and are protected by:
  - JWT-based authentication for all API requests.
  - Row-Level Security (RLS) policies ensuring users can only access their own reports.
  - HTTPS encryption for all data in transit.
- **GDPR Compliance**: 
  - User account deletion cascades to all reports (`ON DELETE CASCADE`), ensuring complete data removal.
  - Reports can be individually deleted by users via `DELETE /api/reports/{id}`.
- **API Key Security**: 
  - Openrouter.ai API key is stored as a server-side environment variable and never exposed to the client.
  - Financial limits set at the provider level to prevent unexpected costs.
- **Input Sanitization**: 
  - All user inputs are validated and sanitized before being included in AI prompts.
  - SQL injection is prevented through the use of parameterized queries in Supabase client.
- **Content Security**: 
  - AI-generated report content is stored as plain text.
  - When displayed to users, appropriate escaping is applied to prevent XSS attacks.
