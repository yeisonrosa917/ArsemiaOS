import { jobs, payrollLines } from "@/lib/mock-data";
import { MARCUS_DEMO_JOBS, MARCUS_DEMO_LINES } from "@/lib/seeds/payroll-demo";

/**
 * Payroll reads from these merged arrays so the Marcus Reyes weekly demo is
 * visible in the payroll home, the foreman detail, and the foreman self-view —
 * without adding those demo jobs to the global Jobs list or Dispatch board.
 */
export const payrollJobs = [...MARCUS_DEMO_JOBS, ...jobs];
export const payrollLinesAll = [...MARCUS_DEMO_LINES, ...payrollLines];
