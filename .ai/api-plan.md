# REST API Plan

## 1. Resources

- **Symptom**: Represents a single symptom entry logged by a user.
  - Corresponding Database Table: `public.symptoms`
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
- **Authorization**: Authorization is enforced at the database level using PostgreSQL Row-Level Security (RLS). Policies are configured to ensure that users can only perform actions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) on rows in the `symptoms` and `profiles` tables that are associated with their `user_id`.

## 4. Validation and Business Logic

- **Validation**: Input validation will be performed at the API layer for all `POST` and `PATCH` requests before interacting with the database. This provides faster feedback and clearer error messages. A library like `zod` will be used to define schemas for request bodies.
- **Validation Rules for `symptoms` resource**:
  - `occurred_at`: Must be a valid ISO 8601 timestamp string.
  - `symptom_type`: Must be one of `Tingle`, `Numbness`, `Cramps`, `FuckedUp`.
  - `body_part`: Must be one of `Head`, `Neck`, `Back`, `Arms`, `Hands`, `Legs`.
  - `notes`: Must be a string if provided.
- **Business Logic Implementation**:
  - **Account Deletion**: The `DELETE /api/auth/user` endpoint encapsulates the business logic for account deletion. It uses the Supabase Admin Client (initialized with a service role key) on the server to delete the user from the `auth.users` table. The `ON DELETE CASCADE` constraint on the `profiles` and `symptoms` tables ensures that all related data is automatically and atomically removed.
  - **User Profile Creation**: The creation of a user's `profile` record is automated at the database level via a trigger (`on_auth_user_created`) that fires after a new user is inserted into `auth.users`. This logic is not part of the REST API itself but is a core part of the system's architecture.
