"use client";

import { useState } from "react";
import { DataTable } from "./datatable";
import { summaryColumns, rawColumns } from "./columns";
import { SampleData, PopulationSummary, TTestResult } from "../../lib/db"; // <-- Updated imports!
import { AnalysisView } from "./analysisview";

interface DashboardProps {
  summaryData: PopulationSummary[];
  rawData: SampleData[];
  ttestData: TTestResult[];
}

export function Dashboard({ summaryData, rawData, ttestData }: DashboardProps) {
  const [view, setView] = useState<"summary" | "raw" | "analysis">("summary");

  const currentData = view === "summary" ? summaryData : rawData;
  const currentColumns = view === "summary" ? summaryColumns : rawColumns;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {view === "summary" && "Population Frequency Summary"}
          {view === "raw" && "All Samples Data"}
          {view === "analysis" && "Statistical Analysis (Responder vs Non-Responder)"}
        </h2>
        
        <select 
          className="border rounded px-3 py-2 bg-white shadow-sm"
          value={view}
          onChange={(e) => setView(e.target.value as "summary" | "raw" | "analysis")}
        >
          <option value="summary">Summary Table</option>
          <option value="raw">Raw Sample Data</option>
          <option value="analysis">Statistical Analysis</option>
        </select>
      </div>

      {view === "analysis" ? (
        <AnalysisView ttestData={ttestData} /> 
      ) : (
        <DataTable columns={currentColumns as any} data={currentData as any[]} />
      )}
    </div>
  );
}