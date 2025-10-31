-- Migration: Add performance index for report retrieval
-- Created: 2025-10-31
-- Description: Adds composite index on (user_id, id) for optimal query performance
--              when retrieving reports by ID with user authorization check.

-- Add composite index on (user_id, id) for optimal query performance
-- This index will be used by the getReportById query which filters on both columns
CREATE INDEX IF NOT EXISTS idx_reports_user_id_id 
ON public.reports (user_id, id);

COMMENT ON INDEX idx_reports_user_id_id IS 
'Composite index for efficient report retrieval filtered by user_id and id. 
Used by GET /api/reports/{id} endpoint for authorization and data retrieval.';

