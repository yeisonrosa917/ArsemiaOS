"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Settings2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  auditJob,
  buildWeeklyBuckets,
  DEFAULT_COMMISSION_CONFIG,
  type AttendanceOverride,
  type CrewMember,
  type JobAuditInput,
} from "@/lib/payroll/audit";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

const SAMPLE_CREW: CrewMember[] = [
  { id: "c_foreman", name: "Foreman / Owner", role: "foreman", basePct: 15 },
  { id: "c_h1", name: "Helper 1", role: "helper", basePct: 8 },
  { id: "c_h2", name: "Helper 2", role: "helper", basePct: 7 },
];

interface SampleJob extends JobAuditInput {
  type: string;
  attendance?: AttendanceOverride[];
}

const SAMPLE_JOBS: SampleJob[] = [
  {
    jobId: "1529981",
    customer: "Aden Lambert",
    type: "Local",
    commissionableBase: 256.25,
    paidCompanyLine: 85.84,
  },
  {
    jobId: "1415836",
    customer: "Francis Murray",
    type: "Local",
    commissionableBase: 616.25,
    paidCompanyLine: 206.44,
  },
  {
    jobId: "1505737",
    customer: "Lisa Mariano",
    type: "Local + Packing",
    commissionableBase: 1083.75,
    paidCompanyLine: 363.06,
    excluded: { admin: 150, reimbursements: 200 },
  },
  {
    jobId: "1471266",
    customer: "Cassie Henning",
    type: "Local",
    commissionableBase: 365.0,
    paidCompanyLine: 122.28,
  },
  {
    jobId: "1479260",
    customer: "Alana Varela",
    type: "LD Inbound",
    commissionableBase: 360.25,
    paidCompanyLine: 120.68,
    excluded: { admin: 230 },
  },
  {
    jobId: "1449859",
    customer: "Sam Budney",
    type: "LD Straight",
    commissionableBase: 4272.5,
    paidCompanyLine: 1431.29,
    excluded: { admin: 963.5, tolls: 150 },
  },
  {
    jobId: "1540382",
    customer: "Shulagra Shah",
    type: "LD Straight · MIA→VA",
    commissionableBase: 4187.0,
    paidCompanyLine: undefined,
    excluded: { admin: 933, tolls: 90 },
    attendance: [
      {
        crewId: "c_h2",
        mode: "pickup-only",
        flatPay: 125,
      },
    ],
  },
];

export function PayrollAuditPanel() {
  const [config, setConfig] = useState(DEFAULT_COMMISSION_CONFIG);
  const [crew, setCrew] = useState<CrewMember[]>(SAMPLE_CREW);
  const [expanded, setExpanded] = useState<string | null>(null);

  const audits = useMemo(
    () =>
      SAMPLE_JOBS.map((j) =>
        auditJob(j, crew, j.attendance ?? [], config),
      ),
    [crew, config],
  );

  const buckets = useMemo(
    () => buildWeeklyBuckets(audits, 693.52, true),
    [audits],
  );

  const totals = useMemo(() => {
    let totalBase = 0;
    let totalExpected = 0;
    let totalPaid = 0;
    let okCount = 0;
    let flaggedCount = 0;
    for (const j of SAMPLE_JOBS) {
      totalBase += j.commissionableBase;
    }
    for (const a of audits) {
      totalExpected += a.expectedCompanyLine;
      totalPaid += a.paidCompanyLine ?? 0;
      if (a.flags.includes("OK")) okCount++;
      else if (
        a.flags.includes("UNDERPAID") ||
        a.flags.includes("OVERPAID")
      )
        flaggedCount++;
    }
    return { totalBase, totalExpected, totalPaid, okCount, flaggedCount };
  }, [audits]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          label="Commissionable base"
          value={fmtUSD(totals.totalBase)}
          hint="All commissionable items, excluding admin/tolls/reimb."
        />
        <KPI
          label={`Expected ${config.companyCommissionPct}%`}
          value={fmtUSD(totals.totalExpected)}
          hint="What the company should receive"
          primary
        />
        <KPI
          label="Actually paid"
          value={fmtUSD(totals.totalPaid)}
          hint="Sum of confirmed payroll lines"
        />
        <KPI
          label="Audit"
          value={`${totals.okCount} OK · ${totals.flaggedCount} flag`}
          hint="Match between expected and paid"
          variant={totals.flaggedCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job-by-job audit</CardTitle>
            <CardDescription>
              Compare expected vs paid. Click to expand crew distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {audits.map((a, idx) => {
              const j = SAMPLE_JOBS[idx];
              const flag = a.flags[0];
              const isExpanded = expanded === a.jobId;
              return (
                <div
                  key={a.jobId}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : a.jobId)
                    }
                    className="grid w-full grid-cols-12 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                  >
                    <div className="col-span-12 flex items-center gap-3 sm:col-span-4">
                      <FlagBadge flag={flag} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {a.customer}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          #{a.jobId} · {j.type}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Base
                      </p>
                      <p className="font-mono text-xs font-semibold">
                        {fmtUSD(j.commissionableBase)}
                      </p>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Expected
                      </p>
                      <p className="font-mono text-xs font-semibold text-primary">
                        {fmtUSD(a.expectedCompanyLine)}
                      </p>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Paid
                      </p>
                      <p className="font-mono text-xs font-semibold">
                        {a.paidCompanyLine != null
                          ? fmtUSD(a.paidCompanyLine)
                          : "—"}
                      </p>
                    </div>
                    <div className="col-span-12 flex items-center justify-end gap-2 sm:col-span-2">
                      {a.variance != null && (
                        <span
                          className={cn(
                            "font-mono text-xs font-semibold",
                            Math.abs(a.variance) < 0.01
                              ? "text-success"
                              : a.variance < 0
                                ? "text-destructive"
                                : "text-warning",
                          )}
                        >
                          {a.variance >= 0 ? "+" : ""}
                          {fmtUSD(a.variance)}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90",
                        )}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border/60 bg-muted/20 p-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Distribution
                      </p>
                      <div className="space-y-1.5">
                        {a.perCrew.map((c) => (
                          <div
                            key={c.crewId}
                            className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium">{c.name}</p>
                              {c.notes && (
                                <p className="text-[10px] text-muted-foreground">
                                  {c.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {c.pctApplied > 0 && (
                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                  {c.pctApplied}%
                                </span>
                              )}
                              <span className="font-mono text-sm font-semibold">
                                {fmtUSD(c.finalPay)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm">
                          <span className="font-semibold">Company reserve</span>
                          <span className="font-mono text-sm font-semibold text-primary">
                            {fmtUSD(a.companyReserve)}
                          </span>
                        </div>
                      </div>
                      {j.excluded && (
                        <p className="mt-3 text-[10px] text-muted-foreground">
                          Excluded from base:{" "}
                          {j.excluded.admin && `Admin ${fmtUSD(j.excluded.admin)}`}
                          {j.excluded.tolls &&
                            ` · Tolls ${fmtUSD(j.excluded.tolls)}`}
                          {j.excluded.reimbursements &&
                            ` · Reimb ${fmtUSD(j.excluded.reimbursements)}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4 text-primary" />
                Commission config
              </CardTitle>
              <CardDescription>
                Percentages of commissionable base.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ConfigRow
                label="Company commission %"
                value={config.companyCommissionPct}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, companyCommissionPct: v }))
                }
              />
              <ConfigRow
                label="Crew pool %"
                value={config.crewPoolPct}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, crewPoolPct: v }))
                }
              />
              <ConfigRow
                label="Company reserve %"
                value={config.companyReservePct}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, companyReservePct: v }))
                }
              />
              <p className="text-[10px] text-muted-foreground">
                Default: 30% crew + 3.5% reserve = 33.5% total.
              </p>
              <Separator />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Crew percentages
              </p>
              {crew.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="flex-1 font-medium">{c.name}</span>
                  <Input
                    type="number"
                    value={c.basePct}
                    onChange={(e) =>
                      setCrew((arr) => {
                        const next = [...arr];
                        next[idx] = {
                          ...next[idx],
                          basePct: Number(e.target.value) || 0,
                        };
                        return next;
                      })
                    }
                    className="h-7 w-16 text-center font-mono"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly buckets</CardTitle>
              <CardDescription>
                Where the money goes after distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <BucketRow
                label="Owner pay pending"
                value={fmtUSD(buckets.ownerPayPending)}
              />
              <BucketRow
                label="Company savings (3.5%)"
                value={fmtUSD(buckets.companySavingsPending)}
                accent
              />
              <BucketRow
                label="Reimbursements bucket"
                value={fmtUSD(buckets.reimbursementBucket)}
              />
              <Separator />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Helper payouts
              </p>
              {Object.entries(buckets.helperPayouts).map(([id, amt]) => {
                const c = crew.find((cm) => cm.id === id);
                return (
                  <BucketRow
                    key={id}
                    label={c?.name ?? id}
                    value={fmtUSD(amt)}
                  />
                );
              })}
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span className="text-xs">Total received</span>
                <span className="font-mono text-sm">
                  {fmtUSD(buckets.totalCompanyReceived)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FlagBadge({ flag }: { flag: string }) {
  if (flag === "OK")
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
    );
  if (flag === "MISSING_PAID_LINE")
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5" />
      </span>
    );
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full",
        flag === "UNDERPAID"
          ? "bg-destructive/15 text-destructive"
          : "bg-warning/15 text-warning",
      )}
    >
      <AlertCircle className="h-3.5 w-3.5" />
    </span>
  );
}

function KPI({
  label,
  value,
  hint,
  primary,
  variant,
}: {
  label: string;
  value: string;
  hint: string;
  primary?: boolean;
  variant?: "success" | "warning";
}) {
  return (
    <Card
      className={cn(
        primary && "border-primary/40",
        variant === "success" && "border-success/40",
        variant === "warning" && "border-warning/40",
      )}
    >
      <CardContent className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-2xl font-bold",
            primary && "text-primary",
            variant === "success" && "text-success",
            variant === "warning" && "text-warning",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ConfigRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex-1">{label}</span>
      <Input
        type="number"
        value={value}
        step={0.1}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-7 w-16 text-center font-mono"
      />
      <span className="text-muted-foreground">%</span>
    </div>
  );
}

function BucketRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-sm font-semibold",
          accent && "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
