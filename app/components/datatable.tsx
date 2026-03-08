"use client";

import { useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
} from "@tanstack/react-table";
import { Filter } from "./filter"; 

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sample_id", desc: false } 
  ]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      pagination: { pageSize: 50 },
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4 font-sans">

      {/* Faceted filter */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <span>Data Filters</span>
          <span>{isFilterMenuOpen ? "▲" : "▼"}</span>
        </button>

        {table.getState().columnFilters.length > 0 && (
          <button
            onClick={() => table.resetColumnFilters()}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* dropdown filter table */}
      {isFilterMenuOpen && (
        <div className="absolute z-10 mt-2 w-full max-w-4xl p-6 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-wrap gap-8">
          {table.getAllLeafColumns().map(column => {
            const headerText = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;
            
            return (
              <div key={column.id} className="flex-1 min-w-[200px]">
                {/* individual column head + clear button*/}
                <div className="flex justify-between items-center border-b pb-1 mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{headerText}</h3>
                  
                  {column.getIsFiltered() && (
                    <button
                      onClick={() => column.setFilterValue(undefined)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <Filter column={column} table={table} />
              </div>
            );
          })}
        </div>
      )}

      {/* Column toggler (to view specific columns) */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <span className="text-sm font-semibold text-gray-700 mb-3 block">Toggle Columns:</span>
        <div className="flex flex-wrap gap-4">
          {table.getAllLeafColumns().map(column => {
            return (
              <label key={column.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                {/* display the column header name if string, otherwise fallback to ID */}
                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
              </label>
            )
          })}
        </div>
      </div>
      {/* Sort function for columns */}
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-x-auto bg-white">
        <table className="w-full text-sm text-left whitespace-nowrap">
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
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg mt-4">
        
        {/* Left side: "Displaying X-Y of Z" and page size dropdown */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div>
            Displaying <span className="font-semibold text-gray-900">{startRow}</span> - <span className="font-semibold text-gray-900">{endRow}</span> of <span className="font-semibold text-gray-900">{totalRows.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize">Rows per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              {[10, 25, 50, 100, 250].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side: previous/next buttons */}
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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