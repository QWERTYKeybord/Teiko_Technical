import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'cell_counts.db');
const db = new Database(dbPath, { readonly: true });

export type SampleData = {
  sample_id: string;
  subject_id: string;
  condition: string;
  sample_type: string;
  treatment: string;
  response: string;
  time_from_treatment_start: number;
  b_cell: number;
  cd8_t_cell: number;
  cd4_t_cell: number;
  nk_cell: number;
  monocyte: number;
};

export function getSamples(): SampleData[] {
  const stmt = db.prepare(`
    SELECT 
      samples.sample_id, 
      samples.subject_id, 
      subjects.condition, 
      samples.sample_type,
      subjects.treatment, 
      subjects.response,
      samples.time_from_treatment_start, 
      samples.b_cell,
      samples.cd8_t_cell, 
      samples.cd4_t_cell,
      samples.nk_cell,
      samples.monocyte
    FROM samples
    JOIN subjects ON samples.subject_id = subjects.subject_id
  `);
  return stmt.all() as SampleData[];
}

export type PopulationSummary = {
  id: number,
  sample_id: string;
  total_count: number;
  population: string;
  count: number;
  percentage: number;
};

export type TTestResult = {
  population: string;
  p_value: number;
  is_significant: string;
};

export function getSummaryData(): PopulationSummary[] {
  const stmt = db.prepare(`SELECT * FROM population_summary`);
  return stmt.all() as PopulationSummary[];
}

export function getTTestResults(): TTestResult[] {
  try {
    const stmt = db.prepare(`SELECT * FROM ttest_results`);
    return stmt.all() as TTestResult[];
  } catch (e) {
    return [];
  }
}