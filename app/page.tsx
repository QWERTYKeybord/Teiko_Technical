import { getSamples } from "../lib/db";
import { DataTable } from "./components/datatable";
import { columns } from "./components/columns";

export default function Home() {
  const data = getSamples();

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subject Sample Data</h1>
      
      <DataTable columns={columns} data={data} />
    </main>
  );
}