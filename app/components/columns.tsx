"use client";

import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { SampleData, PopulationSummary } from "../../lib/db";

export const idRangeFilter: FilterFn<any> = (row, columnId, value) => {
  const rowValue = row.getValue<string>(columnId) || "";
  const num = parseInt(rowValue.replace(/\D/g, ""), 10);
  
  const [min, max] = value as [number | undefined, number | undefined];

  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const summaryColumns: ColumnDef<PopulationSummary>[] = [
  { accessorKey: "sample_id", header: "Sample ID", filterFn: idRangeFilter },
  { accessorKey: "total_count", header: "Total Count", filterFn: "inNumberRange" },
  { accessorKey: "population", header: "Population" },
  { accessorKey: "count", header: "Count", filterFn: "inNumberRange" },
  { 
    accessorKey: "percentage", 
    header: "Percentage",
    filterFn: "inNumberRange",
    cell: ({ row }) => `${Number(row.getValue("percentage")).toFixed(2)}%` 
  },
];

export const rawColumns: ColumnDef<SampleData>[] = [
  { accessorKey: "sample_id", header: "Sample ID", filterFn: idRangeFilter },
  { accessorKey: "subject_id", header: "Subject ID", filterFn: idRangeFilter },
  { accessorKey: "condition", header: "Condition" },
  { accessorKey: "sample_type", header: "Sample Type" },
  { accessorKey: "treatment", header: "Treatment" },
  { accessorKey: "response", header: "Response" },
  { accessorKey: "time_from_treatment_start", header: "Time (Days)", filterFn: "inNumberRange" },
  { accessorKey: "b_cell", header: "B Cells", filterFn: "inNumberRange" },
  { accessorKey: "cd8_t_cell", header: "CD8+ T Cells", filterFn: "inNumberRange" },
  { accessorKey: "cd4_t_cell", header: "CD4+ T Cells", filterFn: "inNumberRange" },
  { accessorKey: "nk_cell", header: "NK Cells", filterFn: "inNumberRange" },
  { accessorKey: "monocyte", header: "Monocytes", filterFn: "inNumberRange" },
];