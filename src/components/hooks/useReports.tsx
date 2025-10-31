import { useState, useEffect, useCallback } from "react";
import type { ReportDto, PeriodType, ReportListResponseDto } from "@/types";

interface ReportFilters {
  offset: number;
  limit: number;
  period_type?: PeriodType;
}

interface UseReportsReturn {
  reports: ReportDto[];
  count: number | null;
  loading: boolean;
  error: Error | null;
  filters: ReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>;
  generateReport: (periodType: PeriodType) => Promise<ReportDto>;
  isGenerating: boolean;
  fetchReports: () => Promise<void>;
}

/**
 * Custom hook for managing reports state and API interactions.
 * Provides functionality for fetching, generating, and filtering reports.
 */
export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    offset: 0,
    limit: 10,
  });

  /**
   * Fetches reports from the API based on current filters.
   */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        offset: filters.offset.toString(),
        limit: filters.limit.toString(),
      });

      if (filters.period_type) {
        params.append("period_type", filters.period_type);
      }

      const response = await fetch(`/api/reports?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const data: ReportListResponseDto = await response.json();
      setReports(data.data);
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Generates a new AI-powered report for the specified period.
   */
  const generateReport = useCallback(async (periodType: PeriodType): Promise<ReportDto> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ period_type: periodType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate report: ${response.statusText}`);
      }

      const report: ReportDto = await response.json();
      
      // Refresh the reports list after successful generation
      await fetchReports();
      
      return report;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error generating report:", err);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [fetchReports]);

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    count,
    loading,
    error,
    filters,
    setFilters,
    generateReport,
    isGenerating,
    fetchReports,
  };
}

