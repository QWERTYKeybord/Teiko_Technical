"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SampleData } from "../../lib/db";
import { PopulationSummary } from "../page";

export const summaryColumns: ColumnDef<PopulationSummary>[] = [
  { accessorKey: "sample", header: "Sample ID" },
  { accessorKey: "total_count", header: "Total Count" },
  { accessorKey: "population", header: "Population" },
  { accessorKey: "count", header: "Count" },
  { 
    accessorKey: "percentage", 
    header: "Percentage",
    cell: ({ row }) => `${row.getValue("percentage")}%` 
  },
];

export const rawColumns: ColumnDef<SampleData>[] = [
  { accessorKey: "sample_id", header: "Sample ID" },
  { accessorKey: "subject_id", header: "Subject ID" },
  { accessorKey: "treatment", header: "Treatment" },
  { accessorKey: "time_from_treatment_start", header: "Time (Days)" },
  { accessorKey: "b_cell", header: "B Cells" },
  { accessorKey: "cd8_t_cell", header: "CD8+ T Cells" },
  { accessorKey: "cd4_t_cell", header: "CD4+ T Cells" },
  { accessorKey: "nk_cell", header: "NK Cells" },
  { accessorKey: "monocyte", header: "Monocytes" },
];