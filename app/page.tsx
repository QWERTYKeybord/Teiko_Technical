import { getSamples, getSummaryData, getTTestResults } from "../lib/db";
import { Dashboard } from "./components/dashboard";

export default function Home() {
  const rawData = getSamples();
  const summaryData = getSummaryData();
  const ttestData = getTTestResults(); 

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
        
        <Dashboard summaryData={summaryData} rawData={rawData} ttestData={ttestData} />
      </div>
    </main>
  );
}