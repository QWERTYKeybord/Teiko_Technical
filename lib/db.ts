import Database from 'better-sqlite3';
import path from 'path';

// Connect to the SQLite DB file
const dbPath = path.resolve(process.cwd(), 'data/database.db');
const db = new Database(dbPath, { readonly: true });

export type SampleData = {
  sample_id: string;
  subject_id: string;
  treatment: string;
  time_from_treatment_start: number;
  cd8_t_cell: number;
  b_cell: number;
};

export function getSamples(): SampleData[] {
  // A simple join to get sample data alongside the subject's treatment
  const stmt = db.prepare(`
    SELECT 
      samples.sample_id, 
      samples.subject_id, 
      subjects.treatment, 
      samples.time_from_treatment_start, 
      samples.cd8_t_cell, 
      samples.b_cell
    FROM samples
    JOIN subjects ON samples.subject_id = subjects.subject_id
  `);
  
  return stmt.all() as SampleData[];
}