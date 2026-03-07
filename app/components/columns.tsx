"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SampleData } from "../../lib/db";

export const columns: ColumnDef<SampleData>[] = [
  {
    accessorKey: "sample_id",
    header: "Sample ID",
  },
  {
    accessorKey: "subject_id",
    header: "Subject ID",
  },
  {
    accessorKey: "treatment",
    header: "Treatment",
  },
  {
    accessorKey: "time_from_treatment_start",
    header: "Time (Days)",
  },
  {
    accessorKey: "cd8_t_cell",
    header: "CD8+ T Cells",
  },
  {
    accessorKey: "b_cell",
    header: "B Cells",
  },
];