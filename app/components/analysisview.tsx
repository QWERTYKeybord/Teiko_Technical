"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import ttest from "ttest";
import { SampleData } from "../../lib/db";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const POPULATIONS = ["b_cell", "cd8_t_cell", "cd4_t_cell", "nk_cell", "monocyte"];

export function AnalysisView({ rawData }: { rawData: SampleData[] }) {
  const { plotData, statsTable } = useMemo(() => {
    // filter for melanoma, miraclib, and PBMC samples
    const cohort = rawData.filter(
      (d) =>
        d.condition?.toLowerCase() === "melanoma" &&
        d.treatment?.toLowerCase() === "miraclib" &&
        d.sample_type?.toUpperCase() === "PBMC"
    );

    // setup buckets for our statistical testing
    const percentages: Record<string, { yes: number[]; no: number[] }> = {};
    POPULATIONS.forEach((pop) => (percentages[pop] = { yes: [], no: [] }));

    // calculate relative frequencies for each sample and sort into Y/N buckets
    cohort.forEach((row) => {
      const response = row.response?.toLowerCase() === "yes" ? "yes" : "no";
      const totalCount = POPULATIONS.reduce((sum, pop) => sum + (Number(row[pop as keyof SampleData]) || 0), 0);

      if (totalCount > 0) {
        POPULATIONS.forEach((pop) => {
          const count = Number(row[pop as keyof SampleData]) || 0;
          percentages[pop][response].push((count / totalCount) * 100);
        });
      }
    });

    // format data for plots
    const plotData = [
      {
        y: POPULATIONS.flatMap((pop) => percentages[pop].yes),
        x: POPULATIONS.flatMap((pop) => Array(percentages[pop].yes.length).fill(pop)),
        type: "box",
        name: "Responders (Yes)",
        marker: { color: "#3b82f6" },
      },
      {
        y: POPULATIONS.flatMap((pop) => percentages[pop].no),
        x: POPULATIONS.flatMap((pop) => Array(percentages[pop].no.length).fill(pop)),
        type: "box",
        name: "Non-Responders (No)",
        marker: { color: "#ef4444" },
      },
    ];

    // 2 sample t test
    const statsTable = POPULATIONS.map((pop) => {
      const yesData = percentages[pop].yes;
      const noData = percentages[pop].no;
      
      let pValue = 1;
      if (yesData.length > 1 && noData.length > 1) {
        const stat = ttest(yesData, noData);
        pValue = stat.pValue();
      }

      return {
        population: pop,
        pValue,
        isSignificant: pValue < 0.05,
      };
    });

    return { plotData, statsTable };
  }, [rawData]);

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm text-blue-800">
        <strong>Active Filter:</strong> Melanoma patients receiving Miraclib (PBMC samples only).
      </div>

      {/* boxplot container */}
      <div className="bg-white border rounded-lg shadow-sm p-4 w-full overflow-hidden flex justify-center">
        <Plot
          data={plotData as any}
          layout={{
            title: { text: "Relative Frequency of Cell Populations by Response" },
            boxmode: "group",
            yaxis: { title: { text: "Relative Frequency (%)" } }, 
            xaxis: { title: { text: "Cell Population" } },
            width: 900,
            height: 500,
          }}
          config={{ displayModeBar: false }}
        />
      </div>

      {/* stat results table */}
      <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">T-Test Results (Significance: p &lt; 0.05)</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2">Cell Population</th>
              <th className="px-4 py-2">P-Value</th>
              <th className="px-4 py-2">Significant Difference?</th>
            </tr>
          </thead>
          <tbody>
            {statsTable.map((row) => (
              <tr key={row.population} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{row.population}</td>
                <td className="px-4 py-2">{row.pValue.toExponential(4)}</td>
                <td className="px-4 py-2">
                  {row.isSignificant ? (
                    <span className="text-green-600 font-bold">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}