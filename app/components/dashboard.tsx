"use client";

import { useState } from "react";
import { DataTable } from "./datatable";
import { summaryColumns, rawColumns } from "./columns";
import { SampleData } from "../../lib/db";
import { PopulationSummary } from "../page";

interface DashboardProps {
  summaryData: PopulationSummary[];
  rawData: SampleData[];
}

export function Dashboard({ summaryData, rawData }: DashboardProps) {
  const [view, setView] = useState<"summary" | "raw">("summary");

  const currentData = view === "summary" ? summaryData : rawData;
  const currentColumns = view === "summary" ? summaryColumns : rawColumns;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {view === "summary" ? "Population Frequency Summary" : "All Samples Data"}
        </h2>
        
        <select 
          className="border rounded px-3 py-2 bg-white shadow-sm"
          value={view}
          onChange={(e) => setView(e.target.value as "summary" | "raw")}
        >
          <option value="summary">Summary Table</option>
          <option value="raw">Raw Sample Data</option>
        </select>
      </div>

      <DataTable columns={currentColumns as any} data={currentData as any[]} />
    </div>
  );
}