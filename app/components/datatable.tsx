"use client";

import { useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      pagination: { pageSize: 50 },
    },
  });

  return (
    <div className="space-y-4 font-sans">
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold border-b-2 border-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortStatus = header.column.getIsSorted();
                  let sortIcon = " ≡"; 
                  if (sortStatus === "asc") sortIcon = " 🔼";
                  if (sortStatus === "desc") sortIcon = " 🔽";

                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-gray-400 text-xs">{sortIcon}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="text-gray-600">
            {table.getRowModel().rows.map((row, index, rows) => {
              const currentSample = (row.original as any).sample || (row.original as any).sample_id;
              const nextRow = rows[index + 1];
              const nextSample = nextRow ? ((nextRow.original as any).sample || (nextRow.original as any).sample_id) : null;
              
              const isLastOfSample = currentSample !== nextSample;

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-blue-50 transition-colors ${
                    isLastOfSample ? "border-b-2 border-gray-300" : "border-b border-gray-100"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 text-sm text-gray-600">
        <div>
          Page <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span> of{" "}
          <span className="font-semibold">{table.getPageCount()}</span>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}