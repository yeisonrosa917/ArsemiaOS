import type { Job, PayrollLine } from "@/lib/types";
import { weeklyRange } from "@/lib/payroll/period";

/**
 * Luis & Andres demos are dated into the CURRENT pay week (anchored to the same
 * Monday the payroll weekly view uses) so they're visible by default no matter
 * when the app is opened. Marcus's set stays on its original week (it's linked
 * to a fixed reimbursable expense) and is reachable via the week navigator.
 */
const WEEK_FROM = weeklyRange().from; // "YYYY-MM-DD" — Monday of the current week
function demoDate(offsetDays: number, hour: number): string {
  const [y, m, d] = WEEK_FROM.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(hour)}:00:00`;
}

/**
 * Weekly payroll demos (Mon Jun 30 – Sun Jul 6, 2026) for the foremen whose
 * Ileana-style payroll detail is meant to be studied end to end:
 *   - Marcus Reyes  (FM-1042): local + long-distance, a deduction, a hold.
 *   - Luis Mendoza  (FM-1049): busy local week with a packing-heavy job.
 *   - Andres Molina (FM-1050): mixed week with a reimbursed expense + a hold.
 *
 * A matching reimbursable expense (EXP-M901) lives in the expenses seed and
 * flows into Marcus's detail automatically.
 *
 * These records are merged into the payroll data source only (see
 * src/lib/payroll/data.ts) — they intentionally do not pollute the global Jobs
 * list or Dispatch board.
 */

type Foreman = { id: string; name: string };

const MARCUS: Foreman = { id: "FM-1042", name: "Marcus Reyes" };
const LUIS: Foreman = { id: "FM-1049", name: "Luis Mendoza" };
const ANDRES: Foreman = { id: "FM-1050", name: "Andres Molina" };

function mjob(
  foreman: Foreman,
  p: {
    id: string;
    customer: string;
    type: Job["type"];
    cuFt: number;
    miles: number;
    price: number;
    scheduledAt: string;
    pickupCity: string;
    deliveryCity: string;
  },
): Job {
  return {
    id: p.id,
    customer: p.customer,
    customerPhone: "(305) 555-0000",
    pickup: `${p.pickupCity}, FL`,
    delivery: `${p.deliveryCity}, FL`,
    pickupCity: p.pickupCity,
    deliveryCity: p.deliveryCity,
    type: p.type,
    cuFt: p.cuFt,
    miles: p.miles,
    status: "Completed",
    driverId: foreman.id,
    driverName: foreman.name,
    crew: [foreman.name],
    price: p.price,
    payrollStatus: "Approved",
    scheduledAt: p.scheduledAt,
    zone: "Miami-Dade",
    priority: "Medium",
  };
}

function mline(p: {
  jobId: string;
  customer: string;
  cuFt: number;
  miles: number;
  commissionableTotal: number;
  deductions?: number;
  status: PayrollLine["status"];
  auditFlags?: string[];
}): PayrollLine {
  const foremanPayout = Math.round(p.commissionableTotal * 0.3 * 100) / 100;
  return {
    jobId: p.jobId,
    customer: p.customer,
    cuFt: p.cuFt,
    miles: p.miles,
    cuFtCharge: Math.round(p.cuFt * 2.5),
    mileageCharge: Math.round(p.miles * 3),
    mileageRate: 3,
    extras: 0,
    adminSurcharge: 75,
    tolls: 0,
    commissionableTotal: p.commissionableTotal,
    crewPercent: 30,
    foremanPayout,
    helperPayout: 0,
    deductions: p.deductions ?? 0,
    finalPayout: foremanPayout - (p.deductions ?? 0),
    auditFlags: p.auditFlags ?? [],
    status: p.status,
  };
}

/* ---------------- Marcus Reyes ---------------- */

export const MARCUS_DEMO_JOBS: Job[] = [
  mjob(MARCUS, { id: "JOB-M501", customer: "Alvarez Residence", type: "Local Move", cuFt: 620, miles: 12, price: 1950, scheduledAt: "2026-06-30T08:00:00", pickupCity: "Brickell", deliveryCity: "Coral Gables" }),
  mjob(MARCUS, { id: "JOB-M502", customer: "Kaufman (Miami → Orlando)", type: "Long Distance", cuFt: 880, miles: 235, price: 5200, scheduledAt: "2026-07-01T07:00:00", pickupCity: "Doral", deliveryCity: "Orlando" }),
  mjob(MARCUS, { id: "JOB-M503", customer: "Okonkwo Move", type: "Local Move", cuFt: 540, miles: 9, price: 1680, scheduledAt: "2026-07-02T09:00:00", pickupCity: "Wynwood", deliveryCity: "Aventura" }),
  mjob(MARCUS, { id: "JOB-M504", customer: "Silva Studio", type: "Local Move", cuFt: 410, miles: 7, price: 1200, scheduledAt: "2026-07-03T10:00:00", pickupCity: "Miami Beach", deliveryCity: "North Miami" }),
  mjob(MARCUS, { id: "JOB-M505", customer: "Brennan Move", type: "Local Move", cuFt: 700, miles: 15, price: 2100, scheduledAt: "2026-07-05T08:30:00", pickupCity: "Kendall", deliveryCity: "Pinecrest" }),
];

export const MARCUS_DEMO_LINES: PayrollLine[] = [
  mline({ jobId: "JOB-M501", customer: "Alvarez Residence", cuFt: 620, miles: 12, commissionableTotal: 1950, status: "Approved" }),
  mline({ jobId: "JOB-M502", customer: "Kaufman (Miami → Orlando)", cuFt: 880, miles: 235, commissionableTotal: 5200, status: "Approved" }),
  mline({ jobId: "JOB-M503", customer: "Okonkwo Move", cuFt: 540, miles: 9, commissionableTotal: 1680, status: "Approved" }),
  mline({
    jobId: "JOB-M504",
    customer: "Silva Studio",
    cuFt: 410,
    miles: 7,
    commissionableTotal: 1200,
    deductions: 120,
    status: "Approved",
    auditFlags: ["Customer-reported scratch on dresser — $120 deduction"],
  }),
  mline({
    jobId: "JOB-M505",
    customer: "Brennan Move",
    cuFt: 700,
    miles: 15,
    commissionableTotal: 2100,
    status: "Flagged",
    auditFlags: ["Inventory count mismatch — held pending audit"],
  }),
];

/* ---------------- Luis Mendoza ---------------- */

export const LUIS_DEMO_JOBS: Job[] = [
  mjob(LUIS, { id: "JOB-L601", customer: "Nguyen Residence", type: "Local Move", cuFt: 480, miles: 8, price: 1520, scheduledAt: demoDate(0, 8), pickupCity: "Hialeah", deliveryCity: "Miami Lakes" }),
  mjob(LUIS, { id: "JOB-L602", customer: "Castellanos Move", type: "Local Move", cuFt: 660, miles: 14, price: 1980, scheduledAt: demoDate(1, 9), pickupCity: "Westchester", deliveryCity: "Doral" }),
  mjob(LUIS, { id: "JOB-L603", customer: "Beckham Loft (full pack)", type: "Local Move", cuFt: 720, miles: 6, price: 2450, scheduledAt: demoDate(2, 8), pickupCity: "Edgewater", deliveryCity: "Brickell" }),
  mjob(LUIS, { id: "JOB-L604", customer: "Ferreira Residence", type: "Local Move", cuFt: 390, miles: 11, price: 1180, scheduledAt: demoDate(3, 10), pickupCity: "Little Havana", deliveryCity: "Coral Gables" }),
  mjob(LUIS, { id: "JOB-L605", customer: "Osei Move", type: "Local Move", cuFt: 560, miles: 18, price: 1740, scheduledAt: demoDate(5, 8), pickupCity: "Cutler Bay", deliveryCity: "Homestead" }),
];

export const LUIS_DEMO_LINES: PayrollLine[] = [
  mline({ jobId: "JOB-L601", customer: "Nguyen Residence", cuFt: 480, miles: 8, commissionableTotal: 1520, status: "Approved" }),
  mline({ jobId: "JOB-L602", customer: "Castellanos Move", cuFt: 660, miles: 14, commissionableTotal: 1980, status: "Approved" }),
  mline({
    jobId: "JOB-L603",
    customer: "Beckham Loft (full pack)",
    cuFt: 720,
    miles: 6,
    commissionableTotal: 2450,
    status: "Approved",
    auditFlags: ["Full-pack job — packing materials billed to customer"],
  }),
  mline({ jobId: "JOB-L604", customer: "Ferreira Residence", cuFt: 390, miles: 11, commissionableTotal: 1180, status: "Approved" }),
  mline({
    jobId: "JOB-L605",
    customer: "Osei Move",
    cuFt: 560,
    miles: 18,
    commissionableTotal: 1740,
    status: "Pending",
    auditFlags: ["Awaiting signed delivery confirmation"],
  }),
];

/* ---------------- Andres Molina ---------------- */

export const ANDRES_DEMO_JOBS: Job[] = [
  mjob(ANDRES, { id: "JOB-A701", customer: "Petrov Residence", type: "Local Move", cuFt: 520, miles: 10, price: 1600, scheduledAt: demoDate(0, 9), pickupCity: "Aventura", deliveryCity: "Sunny Isles" }),
  mjob(ANDRES, { id: "JOB-A702", customer: "Delgado (Miami → Tampa)", type: "Long Distance", cuFt: 940, miles: 280, price: 5600, scheduledAt: demoDate(2, 6), pickupCity: "Kendall", deliveryCity: "Tampa" }),
  mjob(ANDRES, { id: "JOB-A703", customer: "Whitfield Move", type: "Local Move", cuFt: 430, miles: 9, price: 1340, scheduledAt: demoDate(3, 11), pickupCity: "North Miami", deliveryCity: "Miami Shores" }),
  mjob(ANDRES, { id: "JOB-A704", customer: "Ramos Residence", type: "Local Move", cuFt: 610, miles: 13, price: 1880, scheduledAt: demoDate(4, 9), pickupCity: "Coral Way", deliveryCity: "West Miami" }),
];

export const ANDRES_DEMO_LINES: PayrollLine[] = [
  mline({ jobId: "JOB-A701", customer: "Petrov Residence", cuFt: 520, miles: 10, commissionableTotal: 1600, status: "Approved" }),
  mline({
    jobId: "JOB-A702",
    customer: "Delgado (Miami → Tampa)",
    cuFt: 940,
    miles: 280,
    commissionableTotal: 5600,
    status: "Approved",
    auditFlags: ["Long-distance — fuel + toll reimbursement approved"],
  }),
  mline({ jobId: "JOB-A703", customer: "Whitfield Move", cuFt: 430, miles: 9, commissionableTotal: 1340, status: "Approved" }),
  mline({
    jobId: "JOB-A704",
    customer: "Ramos Residence",
    cuFt: 610,
    miles: 13,
    commissionableTotal: 1880,
    deductions: 90,
    status: "Flagged",
    auditFlags: ["Late start reported by customer — $90 deduction under review"],
  }),
];

/* ---------------- Combined ---------------- */

export const PAYROLL_DEMO_JOBS: Job[] = [
  ...MARCUS_DEMO_JOBS,
  ...LUIS_DEMO_JOBS,
  ...ANDRES_DEMO_JOBS,
];

export const PAYROLL_DEMO_LINES: PayrollLine[] = [
  ...MARCUS_DEMO_LINES,
  ...LUIS_DEMO_LINES,
  ...ANDRES_DEMO_LINES,
];
