import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { PeriodType } from "@/types";

interface ReportsFilterProps {
  onFilterChange: (periodType?: PeriodType) => void;
  selectedPeriodType?: PeriodType;
}

/**
 * Component for filtering reports by period type.
 * Allows users to filter the reports list by week, month, quarter, or show all.
 */
export default function ReportsFilter({ onFilterChange, selectedPeriodType }: ReportsFilterProps) {
  const periodLabels: Record<PeriodType, string> = {
    week: "Tydzień",
    month: "Miesiąc",
    quarter: "Kwartał",
  };

  const handleClearFilter = () => {
    onFilterChange(undefined);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label htmlFor="period-filter" className="text-sm font-medium text-gray-700 block mb-2">
            Filtruj według okresu:
          </label>
          <div className="flex gap-2">
            <Select
              value={selectedPeriodType || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  onFilterChange(undefined);
                } else {
                  onFilterChange(value as PeriodType);
                }
              }}
            >
              <SelectTrigger id="period-filter" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Wszystkie okresy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie okresy</SelectItem>
                <SelectItem value="week">{periodLabels.week}</SelectItem>
                <SelectItem value="month">{periodLabels.month}</SelectItem>
                <SelectItem value="quarter">{periodLabels.quarter}</SelectItem>
              </SelectContent>
            </Select>
            {selectedPeriodType && (
              <Button variant="outline" size="sm" onClick={handleClearFilter}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Wyczyść
              </Button>
            )}
          </div>
        </div>
        {selectedPeriodType && (
          <div className="text-sm text-gray-600">
            Wyświetlane: raporty typu <strong>{periodLabels[selectedPeriodType]}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

