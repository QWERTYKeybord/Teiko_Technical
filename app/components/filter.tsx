import { Column, Table } from "@tanstack/react-table";
import ReactSlider from "react-slider";

export function Filter({ column, table }: { column: Column<any, unknown>; table: Table<any> }) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);
  const columnFilterValue = column.getFilterValue();
  
  const isNumericOrId = typeof firstValue === "number" || column.id.includes("id") || column.id === "sample";

  if (!isNumericOrId) {
    const uniqueValues = Array.from(column.getFacetedUniqueValues().keys()).sort();
    const selectedValues = new Set(columnFilterValue as string[] || []);

    return (
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto mt-2">
        {uniqueValues.map((val) => {
          if (!val) return null;
          return (
            <label key={val} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.has(val)}
                onChange={(e) => {
                  const newSet = new Set(selectedValues);
                  if (e.target.checked) newSet.add(val);
                  else newSet.delete(val);
                  column.setFilterValue(newSet.size ? Array.from(newSet) : undefined);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {val}
            </label>
          );
        })}
      </div>
    );
  }

  const facetedValues = column.getFacetedMinMaxValues();
  let minBound = facetedValues?.[0] ?? 0;
  let maxBound = facetedValues?.[1] ?? 100;

  // ID string check
  if (typeof firstValue === "string") {
      const allNums = table.getPreFilteredRowModel().flatRows.map(r => parseInt((r.getValue(column.id) as string).replace(/\D/g, "") || "0", 10));
      minBound = Math.min(...allNums);
      maxBound = Math.max(...allNums);
  }

  const currentMin = (columnFilterValue as [number, number])?.[0] ?? minBound;
  const currentMax = (columnFilterValue as [number, number])?.[1] ?? maxBound;

  return (
    <div className="mt-4 flex flex-col gap-4">
      
      {/* Slider */}
      <div className="px-2">
        <ReactSlider
          className="w-full h-2 flex items-center"
          thumbClassName="w-3 h-3 bg-[#e83e3e] rounded-full cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-red-300 shadow"
          renderTrack={(props, state) => {
            const { key, ...restProps } = props;
            
            return (
              <div
                key={key} 
                {...restProps} 
                className={`h-2 rounded-full ${state.index === 1 ? 'bg-[#12141d]' : 'bg-gray-200'}`}
              />
            );
          }}
          min={minBound}
          max={maxBound}
          value={[currentMin, currentMax]}
          onChange={(val) => column.setFilterValue(val)}
          pearling
          minDistance={0}
        />
      </div>
      
      {/* Numerical min/max */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Min</label>
          <input
            type="number"
            min={minBound}
            max={maxBound}
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(e) => column.setFilterValue((old: [number, number]) => [e.target.value ? Number(e.target.value) : undefined, old?.[1]])}
            placeholder={String(minBound)}
            className="w-24 border border-gray-300 rounded px-2 py-1 shadow-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        
        <span className="text-gray-400 mt-5">-</span>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Max</label>
          <input
            type="number"
            min={minBound}
            max={maxBound}
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(e) => column.setFilterValue((old: [number, number]) => [old?.[0], e.target.value ? Number(e.target.value) : undefined])}
            placeholder={String(maxBound)}
            className="w-24 border border-gray-300 rounded px-2 py-1 shadow-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>
      
    </div>
  );
}