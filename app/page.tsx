import { getSamples } from "../lib/db";
import { Dashboard } from "./components/dashboard";

export type PopulationSummary = {
  sample: string;
  total_count: number;
  population: string;
  count: number;
  percentage: number;
};

function transformToSummary(dbData: any[]): PopulationSummary[] {
  const result: PopulationSummary[] = [];
  const populations = ['b_cell', 'cd8_t_cell', 'cd4_t_cell', 'nk_cell', 'monocyte'];

  for (const row of dbData) {
    const totalCount = populations.reduce((sum, pop) => sum + (row[pop] || 0), 0);
    for (const pop of populations) {
      const count = row[pop] || 0;
      const percentage = totalCount === 0 ? 0 : (count / totalCount) * 100;
      result.push({
        sample: row.sample_id,
        total_count: totalCount,
        population: pop,
        count: count,
        percentage: Number(percentage.toFixed(2))
      });
    }
  }
  return result;
}

export default function Home() {
  const rawData = getSamples();
  const summaryData = transformToSummary(rawData);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      
      <div className="max-w-[95%] mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        
        <div className="border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Clinical Trial Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review patient population frequencies and raw sample data.
          </p>
        </div>
        
        <Dashboard summaryData={summaryData} rawData={rawData} />
        
      </div>
    </main>
  );
}