import { useReports } from "../hooks/useReports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../EmptyState";
import ReportsFilter from "./ReportsFilter";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { ReportDto, PeriodType } from "@/types";

/**
 * Skeleton loader for report items while fetching data.
 */
const ReportItemSkeleton = () => (
  <Card className="mb-4">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

/**
 * Individual report item component displaying summary information.
 */
const ReportItem: React.FC<{ report: ReportDto }> = ({ report }) => {
  const formattedDate = new Date(report.created_at).toLocaleString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const periodStart = new Date(report.period_start).toLocaleDateString("pl-PL");
  const periodEnd = new Date(report.period_end).toLocaleDateString("pl-PL");

  const periodLabels: Record<PeriodType, string> = {
    week: "Tydzień",
    month: "Miesiąc",
    quarter: "Kwartał",
  };

  // Extract first few lines of content as preview
  const contentPreview = report.content.split("\n").slice(0, 3).join("\n");
  const hasMore = report.content.split("\n").length > 3;

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">
              Raport: {periodLabels[report.period_type as PeriodType]}
            </CardTitle>
            <CardDescription className="mt-2">
              Okres analizy: {periodStart} - {periodEnd}
            </CardDescription>
            <CardDescription className="text-xs">Wygenerowano: {formattedDate}</CardDescription>
          </div>
          <a href={`/reports/${report.id}`}>
            <Button variant="outline" size="sm">
              Wyświetl
            </Button>
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 line-clamp-3">{contentPreview}</pre>
          {hasMore && <p className="text-sm text-gray-500 mt-2">...</p>}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main component displaying a paginated list of reports.
 */
export default function ReportsList() {
  const { reports, count, loading, error, filters, setFilters } = useReports();

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * filters.limit;
    setFilters((prev) => ({ ...prev, offset: newOffset }));
  };

  const handleFilterChange = (periodType?: PeriodType) => {
    setFilters((prev) => ({ ...prev, period_type: periodType, offset: 0 }));
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Błąd: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const pageCount = count ? Math.ceil(count / filters.limit) : 0;
  const currentPage = Math.floor((filters.offset ?? 0) / filters.limit) + 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Twoje raporty ({count ?? 0})</h2>
        <a href="/reports/new">
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Wygeneruj nowy raport
          </Button>
        </a>
      </div>

      {/* Filter component */}
      <ReportsFilter onFilterChange={handleFilterChange} selectedPeriodType={filters.period_type} />

      {loading ? (
        <div>
          {Array.from({ length: filters.limit }).map((_, index) => (
            <ReportItemSkeleton key={index} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="Brak raportów"
          description="Nie masz jeszcze żadnych raportów. Wygeneruj swój pierwszy raport, aby zobaczyć analizę swoich objawów."
          action={{
            label: "Wygeneruj raport",
            href: "/reports/new",
          }}
        />
      ) : (
        <>
          <div>
            {reports.map((report) => (
              <ReportItem key={report.id} report={report} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < pageCount) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage >= pageCount ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

