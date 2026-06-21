/**
 * Payroll commission engine.
 *
 * Models the "company commission %" structure where the company receives a
 * commission slice of the commissionable base, which is then internally
 * split between human crew pool and a company reserve (savings).
 *
 * Default split: 30% crew pool + 3.5% company reserve = 33.5% total.
 * Both percentages, the crew member %, and exclusions are fully configurable.
 *
 * Key invariant: NEVER multiply helper_percent directly against the company
 * commission line — that under-pays. helper_percent is of the commissionable
 * base, NOT of the commission line.
 */

export interface CommissionConfig {
  /** % of commissionable base that the company receives. e.g. 33.5 */
  companyCommissionPct: number;
  /** % of commissionable base allocated to human crew pool. e.g. 30 */
  crewPoolPct: number;
  /** % of commissionable base reserved as company savings. e.g. 3.5 */
  companyReservePct: number;
}

export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  companyCommissionPct: 33.5,
  crewPoolPct: 30,
  companyReservePct: 3.5,
};

export interface CrewMember {
  id: string;
  name: string;
  role: "foreman" | "helper" | "driver";
  /** % of the commissionable base this person earns. e.g. 8, 7, 15 */
  basePct: number;
}

export interface AttendanceOverride {
  crewId: string;
  /**
   * - "pickup-only"   : do NOT receive mileage commission; flat fee instead.
   * - "no-travel"     : reduced pct, no mileage.
   * - "full"          : normal.
   * - "off"           : excluded entirely.
   */
  mode: "full" | "pickup-only" | "no-travel" | "off";
  /** Optional flat pay used when mode = "pickup-only" or manager override. */
  flatPay?: number;
  /** Optional pct override (replaces basePct for this job). */
  pctOverride?: number;
}

export interface JobAuditInput {
  jobId: string;
  customer: string;
  /** Customer-facing total from the app (used for audit comparison only). */
  appCustomerTotal?: number;
  /** Internal commissionable base, computed via calculator.engine. */
  commissionableBase: number;
  /** What the company actually received from this job (e.g. Ileana line). */
  paidCompanyLine?: number;
  /** Exclusions reported by app but NOT in commissionable base. */
  excluded?: {
    admin?: number;
    tolls?: number;
    reimbursements?: number;
  };
}

export interface JobAuditResult {
  jobId: string;
  customer: string;
  expectedCompanyLine: number;
  paidCompanyLine?: number;
  variance?: number;
  variancePct?: number;
  flags: AuditFlag[];
  crewPool: number;
  companyReserve: number;
  perCrew: CrewDistribution[];
}

export type AuditFlag =
  | "OK"
  | "UNDERPAID"
  | "OVERPAID"
  | "MISSING_PAID_LINE"
  | "BASE_BELOW_CUFT_MIN";

export interface CrewDistribution {
  crewId: string;
  name: string;
  role: CrewMember["role"];
  pctApplied: number;
  formulaPay: number;
  finalPay: number;
  notes?: string;
}

export function auditJob(
  input: JobAuditInput,
  crew: CrewMember[],
  attendance: AttendanceOverride[] = [],
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG,
): JobAuditResult {
  const base = Math.max(0, input.commissionableBase);
  const expected = base * (config.companyCommissionPct / 100);
  const crewPool = base * (config.crewPoolPct / 100);
  const companyReserve = base * (config.companyReservePct / 100);

  const flags: AuditFlag[] = [];
  if (input.paidCompanyLine == null) {
    flags.push("MISSING_PAID_LINE");
  } else {
    const variance = input.paidCompanyLine - expected;
    if (Math.abs(variance) < 0.01) {
      flags.push("OK");
    } else if (variance < 0) {
      flags.push("UNDERPAID");
    } else {
      flags.push("OVERPAID");
    }
  }

  const perCrew: CrewDistribution[] = crew.map((member) => {
    const override = attendance.find((a) => a.crewId === member.id);
    if (override?.mode === "off") {
      return {
        crewId: member.id,
        name: member.name,
        role: member.role,
        pctApplied: 0,
        formulaPay: 0,
        finalPay: 0,
        notes: "Off — excluded from job.",
      };
    }
    if (override?.mode === "pickup-only") {
      const flat = override.flatPay ?? 100;
      return {
        crewId: member.id,
        name: member.name,
        role: member.role,
        pctApplied: 0,
        formulaPay: 0,
        finalPay: flat,
        notes: `Pickup-only: flat $${flat}, no commission.`,
      };
    }
    const pct = override?.pctOverride ?? member.basePct;
    const formulaPay = base * (pct / 100);
    return {
      crewId: member.id,
      name: member.name,
      role: member.role,
      pctApplied: pct,
      formulaPay,
      finalPay: formulaPay,
      notes: override?.mode === "no-travel" ? "No travel — reduced pct." : undefined,
    };
  });

  const variance =
    input.paidCompanyLine != null
      ? input.paidCompanyLine - expected
      : undefined;
  const variancePct =
    variance != null && expected > 0 ? (variance / expected) * 100 : undefined;

  return {
    jobId: input.jobId,
    customer: input.customer,
    expectedCompanyLine: expected,
    paidCompanyLine: input.paidCompanyLine,
    variance,
    variancePct,
    flags,
    crewPool,
    companyReserve,
    perCrew,
  };
}

export interface WeeklyBankingBuckets {
  ownerPayPending: number;
  companySavingsPending: number;
  reimbursementBucket: number;
  helperPayouts: Record<string, number>;
  totalCompanyReceived: number;
}

export function buildWeeklyBuckets(
  audits: JobAuditResult[],
  reimbursements: number = 0,
  foremanIsOwner: boolean = true,
): WeeklyBankingBuckets {
  const buckets: WeeklyBankingBuckets = {
    ownerPayPending: 0,
    companySavingsPending: 0,
    reimbursementBucket: reimbursements,
    helperPayouts: {},
    totalCompanyReceived: 0,
  };

  for (const a of audits) {
    buckets.companySavingsPending += a.companyReserve;
    buckets.totalCompanyReceived += a.paidCompanyLine ?? a.expectedCompanyLine;

    for (const c of a.perCrew) {
      if (c.role === "foreman" && foremanIsOwner) {
        buckets.ownerPayPending += c.finalPay;
      } else {
        buckets.helperPayouts[c.crewId] =
          (buckets.helperPayouts[c.crewId] ?? 0) + c.finalPay;
      }
    }
  }

  return buckets;
}
