"use client";

import { useState } from "react";
import { DataTable } from "./datatable";
import { summaryColumns, rawColumns } from "./columns";
import { SampleData } from "../../lib/db";
import { PopulationSummary } from "../page";
import { AnalysisView } from "./analysisview";

interface DashboardProps {
  summaryData: PopulationSummary[];
  rawData: SampleData[];
}

export function Dashboard({ summaryData, rawData }: DashboardProps) {
  // 2. Add "analysis" to the state options
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
        <AnalysisView rawData={rawData} />
      ) : (
        <DataTable columns={currentColumns as any} data={currentData as any[]} />
      )}
    </div>
  );
}