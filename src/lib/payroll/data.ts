import { jobs, payrollLines } from "@/lib/mock-data";
import { PAYROLL_DEMO_JOBS, PAYROLL_DEMO_LINES } from "@/lib/seeds/payroll-demo";

/**
 * Payroll reads from these merged arrays so the weekly foreman payroll demos
 * (Marcus Reyes, Luis Mendoza, Andres Molina) are visible in the payroll home,
 * the foreman detail, and the foreman self-view — without adding those demo
 * jobs to the global Jobs list or Dispatch board.
 */
export const payrollJobs = [...PAYROLL_DEMO_JOBS, ...jobs];
export const payrollLinesAll = [...PAYROLL_DEMO_LINES, ...payrollLines];
