import { useState } from "react";
import { useReports } from "../hooks/useReports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { PeriodType } from "@/types";

/**
 * Component for generating AI-powered symptom analysis reports.
 * Allows users to select a time period and generate a comprehensive analysis.
 */
export default function ReportGenerator() {
  const { generateReport, isGenerating } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("month");

  const handleGenerateReport = async () => {
    try {
      const report = await generateReport(selectedPeriod);
      toast.success("Raport wygenerowany pomyślnie!");
      
      // Redirect to the generated report
      window.location.href = `/reports/${report.id}`;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Nie udało się wygenerować raportu");
      }
    }
  };

  const periodLabels: Record<PeriodType, string> = {
    week: "Tydzień (7 dni)",
    month: "Miesiąc (30 dni)",
    quarter: "Kwartał (90 dni)",
  };

  const periodDescriptions: Record<PeriodType, string> = {
    week: "Analiza objawów z ostatniego tygodnia",
    month: "Analiza objawów z ostatniego miesiąca",
    quarter: "Analiza objawów z ostatniego kwartału",
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Wygeneruj raport AI</CardTitle>
        <CardDescription>
          Wybierz okres analizy, aby wygenerować szczegółowy raport porównujący Twoje objawy z bieżącego okresu z
          okresem poprzednim
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="period-select" className="text-sm font-medium">
            Okres analizy
          </label>
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodType)}>
            <SelectTrigger id="period-select">
              <SelectValue placeholder="Wybierz okres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{periodLabels.week}</SelectItem>
              <SelectItem value="month">{periodLabels.month}</SelectItem>
              <SelectItem value="quarter">{periodLabels.quarter}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600">{periodDescriptions[selectedPeriod]}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Czego możesz się spodziewać w raporcie:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Podsumowanie objawów z wybranego okresu</li>
            <li>Porównanie z okresem poprzednim</li>
            <li>Analiza trendów i wzorców</li>
            <li>Identyfikacja nowych objawów</li>
            <li>Statystyki i wykresy</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Uwaga:</strong> Do wygenerowania raportu potrzebne są co najmniej 3 objawy z wybranego okresu.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generowanie raportu...
            </>
          ) : (
            "Wygeneruj raport"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

