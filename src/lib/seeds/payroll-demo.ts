import type { Job, PayrollLine } from "@/lib/types";

/**
 * Marcus Reyes (FM-1042) weekly payroll demo — a designed set of jobs for the
 * current week (Mon Jun 30 – Sun Jul 6, 2026) so the Ileana-style payroll detail
 * can be studied end to end: a normal local move, a long-distance move, a job
 * with a deduction, and a job on hold pending audit. A matching reimbursable
 * expense lives in the expenses seed (EXP-M901) and flows in automatically.
 *
 * These records are merged into the payroll data source only (see
 * src/lib/payroll/data.ts) — they intentionally do not pollute the global Jobs
 * list or Dispatch board.
 */

const MARCUS = { id: "FM-1042", name: "Marcus Reyes" };

function mjob(p: {
  id: string;
  customer: string;
  type: Job["type"];
  cuFt: number;
  miles: number;
  price: number;
  scheduledAt: string;
  pickupCity: string;
  deliveryCity: string;
}): Job {
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
    driverId: MARCUS.id,
    driverName: MARCUS.name,
    crew: [MARCUS.name],
    price: p.price,
    payrollStatus: "Approved",
    scheduledAt: p.scheduledAt,
    zone: "Miami-Dade",
    priority: "Medium",
  };
}

export const MARCUS_DEMO_JOBS: Job[] = [
  mjob({ id: "JOB-M501", customer: "Alvarez Residence", type: "Local Move", cuFt: 620, miles: 12, price: 1950, scheduledAt: "2026-06-30T08:00:00", pickupCity: "Brickell", deliveryCity: "Coral Gables" }),
  mjob({ id: "JOB-M502", customer: "Kaufman (Miami → Orlando)", type: "Long Distance", cuFt: 880, miles: 235, price: 5200, scheduledAt: "2026-07-01T07:00:00", pickupCity: "Doral", deliveryCity: "Orlando" }),
  mjob({ id: "JOB-M503", customer: "Okonkwo Move", type: "Local Move", cuFt: 540, miles: 9, price: 1680, scheduledAt: "2026-07-02T09:00:00", pickupCity: "Wynwood", deliveryCity: "Aventura" }),
  mjob({ id: "JOB-M504", customer: "Silva Studio", type: "Local Move", cuFt: 410, miles: 7, price: 1200, scheduledAt: "2026-07-03T10:00:00", pickupCity: "Miami Beach", deliveryCity: "North Miami" }),
  mjob({ id: "JOB-M505", customer: "Brennan Move", type: "Local Move", cuFt: 700, miles: 15, price: 2100, scheduledAt: "2026-07-05T08:30:00", pickupCity: "Kendall", deliveryCity: "Pinecrest" }),
];

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
