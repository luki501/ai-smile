import type { APIRoute } from "astro";
import { z } from "zod";
import {
  deleteReport,
  getReportById,
  checkReportExists,
} from "@/lib/services/report.service";

export const prerender = false;

/**
 * Schema for validating report ID from URL params.
 * Ensures ID is a positive integer.
 */
const reportIdSchema = z.coerce.number().int().positive();

/**
 * GET /api/reports/{id}
 *
 * Retrieves a specific report by ID for the authenticated user.
 *
 * URL Parameters:
 * - id: The ID of the report to retrieve (must be a positive integer)
 *
 * Response (200 OK):
 * - Success: Report object with full details
 *
 * Error Responses:
 * - 400: Bad Request - Invalid report ID
 * - 401: Unauthorized - Not authenticated
 * - 403: Forbidden - Report belongs to another user
 * - 404: Not Found - Report doesn't exist
 * - 500: Internal Server Error - Database error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  // 1. Check authentication - early return if not authenticated
  const user = locals.user;
  if (!user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Validate report ID - early return if invalid
  const validation = reportIdSchema.safeParse(params.id);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Invalid report ID",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const reportId = validation.data;
  const supabase = locals.supabase;

  // 3. Retrieve report with comprehensive error handling
  try {
    // First check if report exists (for better error differentiation)
    const exists = await checkReportExists(supabase, reportId);

    if (!exists) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Report not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the report (with authorization check)
    const report = await getReportById(supabase, reportId, user.id);

    if (!report) {
      // Report exists but doesn't belong to user
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          message: "You do not have permission to access this report",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Success: return report
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Generic server error
    console.error("Failed to retrieve report:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to retrieve report",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/reports/{id}
 *
 * Deletes a specific report for the authenticated user.
 *
 * URL Parameters:
 * - id: The ID of the report to delete (must be a positive integer)
 *
 * Response (204 No Content):
 * - Success: Empty response body
 *
 * Error Responses:
 * - 400: Bad Request - Invalid report ID
 * - 401: Unauthorized - Not authenticated
 * - 403: Forbidden - Report belongs to another user
 * - 404: Not Found - Report doesn't exist
 * - 500: Internal Server Error - Database error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  // 1. Check authentication - early return if not authenticated
  const user = locals.user;
  if (!user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Validate report ID - early return if invalid
  const validation = reportIdSchema.safeParse(params.id);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Invalid report ID",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const reportId = validation.data;
  const supabase = locals.supabase;

  // 3. Delete report with comprehensive error handling
  try {
    await deleteReport(supabase, user.id, reportId);

    // 4. Success: return 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      // Report not found
      if (error.message === "REPORT_NOT_FOUND") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Report not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Forbidden - report belongs to another user
      if (error.message === "FORBIDDEN") {
        return new Response(
          JSON.stringify({
            error: "Forbidden",
            message: "You do not have permission to delete this report",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generic server error
    console.error("Failed to delete report:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to delete report",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
