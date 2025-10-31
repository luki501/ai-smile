import type { Database } from "./db/database.types";

/**
 * Represents the shape of a symptom record as it is stored in the database.
 * This is the base type from which all other symptom-related DTOs and command models are derived.
 */
export type Symptom = Database["public"]["Tables"]["symptoms"]["Row"];

/**
 * Represents the shape of a symptom record for an insert operation.
 */
export type SymptomInsert = Database["public"]["Tables"]["symptoms"]["Insert"];

/**
 * Data Transfer Object for creating a new symptom.
 * It includes all the necessary fields that a user must provide.
 * The `user_id` is excluded as it will be inferred from the authenticated session on the server.
 */
export type CreateSymptomCommand = Omit<SymptomInsert, "id" | "created_at" | "user_id"> & {
  occurred_at: string;
};

/**
 * Data Transfer Object for updating an existing symptom.
 * All fields are optional, allowing for partial updates.
 */
export type UpdateSymptomCommand = Partial<CreateSymptomCommand>;

/**
 * Data Transfer Object for representing a symptom in a list view.
 * It omits the `user_id` to avoid sending redundant information to the client.
 */
export type SymptomDto = Omit<Symptom, "user_id">;

/**
 * Data Transfer Object for representing the full details of a symptom.
 * This type includes all fields from the database entity and is used when a single symptom's complete data is required.
 */
export type SymptomDetailsDto = Symptom;

/**
 * Data Transfer Object for the response of a successful user account deletion.
 */
export interface UserDeletionResponseDto {
  message: string;
}

// ============================================================================
// Report Types
// ============================================================================

/**
 * Union type representing valid period types for report generation.
 * These correspond to the analysis periods supported by the report generation system.
 */
export type PeriodType = "week" | "month" | "quarter";

/**
 * Represents the shape of a report record as it is stored in the database.
 * This is the base type from which all other report-related DTOs and command models are derived.
 */
export type Report = Database["public"]["Tables"]["reports"]["Row"];

/**
 * Represents the shape of a report record for an insert operation.
 * Used internally when creating new reports in the database.
 */
export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

/**
 * Command model for generating a new AI-powered symptom analysis report.
 * The user only needs to specify the period type (week, month, or quarter).
 * Other fields such as period_start, period_end, user_id, and content are calculated
 * and populated server-side during the report generation process.
 */
export interface CreateReportCommand {
  period_type: PeriodType;
}

/**
 * Data Transfer Object for representing a single report in API responses.
 * This type includes all fields from the database entity and is returned by:
 * - POST /api/reports (after report generation)
 * - GET /api/reports/{id} (single report retrieval)
 * - GET /api/reports (as items in the data array)
 */
export type ReportDto = Report;

/**
 * Data Transfer Object for the response of a paginated report list.
 * Used by GET /api/reports to return multiple reports with pagination metadata.
 *
 * @property data - Array of report objects matching the query criteria
 * @property count - Total number of reports available (for pagination)
 */
export interface ReportListResponseDto {
  data: ReportDto[];
  count: number;
}
