"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  auditJob,
  DEFAULT_COMMISSION_CONFIG,
  type CrewMember,
  type JobAuditInput,
} from "@/lib/payroll/audit";
import { fmtUSD } from "@/lib/calculator/engine";
import { useJobsStore } from "@/lib/store/jobs";
import { cn } from "@/lib/utils";

const FOREMAN_AS_CONTRACTOR: CrewMember[] = [
  {
    id: "c_foreman",
    name: "Foreman (registered contractor)",
    role: "foreman",
    basePct: 30,
  },
];

interface AuditInputWithMeta extends JobAuditInput {
  type: string;
}

export function PayrollAuditPanel() {
  // Toggle: foreman operates as a registered contractor (33.5% model active).
  // When false, payroll is just gross commission to foreman with no company
  // savings split — UI hides the reserve and 33.5% layer.
  const [registeredContractor, setRegisteredContractor] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Live jobs from the persistent jobs store — same source of truth as JobDetail
  // and Operations Board. Filter to those that have a foreman + commissionableBase.
  const jobs = useJobsStore((s) => s.jobs);

  const SAMPLE_JOBS: AuditInputWithMeta[] = useMemo(
    () =>
      jobs
        .filter((j) => j.driverId && j.commissionableBase && j.commissionableBase > 0)
        .slice(0, 10)
        .map((j) => ({
          jobId: j.id,
          customer: j.customer,
          type: j.type,
          commissionableBase: j.commissionableBase ?? 0,
          // Mock "paid" line: 33.5% of commissionable base. In Phase 8 this will
          // come from the actual payroll line from accounting.
          paidCompanyLine:
            Math.round((j.commissionableBase ?? 0) * 0.335 * 100) / 100,
        })),
    [jobs],
  );

  const config = registeredContractor
    ? DEFAULT_COMMISSION_CONFIG
    : {
        companyCommissionPct: DEFAULT_COMMISSION_CONFIG.companyCommissionPct,
        crewPoolPct: DEFAULT_COMMISSION_CONFIG.companyCommissionPct,
        companyReservePct: 0,
      };

  const audits = useMemo(
    () => SAMPLE_JOBS.map((j) => auditJob(j, FOREMAN_AS_CONTRACTOR, [], config)),
    [SAMPLE_JOBS, config],
  );

  const totals = useMemo(() => {
    let totalBase = 0;
    let totalExpected = 0;
    let totalPaid = 0;
    let totalReserve = 0;
    let totalForeman = 0;
    let okCount = 0;
    let flaggedCount = 0;
    for (const j of SAMPLE_JOBS) totalBase += j.commissionableBase;
    for (const a of audits) {
      totalExpected += a.expectedCompanyLine;
      totalPaid += a.paidCompanyLine ?? 0;
      totalReserve += a.companyReserve;
      totalForeman += a.perCrew.reduce((acc, c) => acc + c.finalPay, 0);
      if (a.flags.includes("OK")) okCount++;
      else if (
        a.flags.includes("UNDERPAID") ||
        a.flags.includes("OVERPAID")
      )
        flaggedCount++;
    }
    return {
      totalBase,
      totalExpected,
      totalPaid,
      totalReserve,
      totalForeman,
      okCount,
      flaggedCount,
    };
  }, [audits, SAMPLE_JOBS]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Contractor model
          </CardTitle>
          <CardDescription>
            Activa esto solo si el foreman tiene compañía registrada (LLC /
            contractor). Habilita el modelo 33.5%: el foreman cobra como
            contractor y separa una reserva de empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent/30">
            <input
              type="checkbox"
              checked={registeredContractor}
              onChange={(e) => setRegisteredContractor(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Foreman opera como contractor registrado (33.5% del base)
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cuando está ON, el motor calcula el {config.companyCommissionPct}%
                del base comisionable como ingreso al contractor; un {DEFAULT_COMMISSION_CONFIG.companyReservePct}%
                queda como reserva de la compañía. Cuando está OFF, el foreman
                recibe el gross commission directo sin separar reserva.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          label="Commissionable base"
          value={fmtUSD(totals.totalBase)}
          hint="Items comisionables (excl. admin/tolls/reimb)"
        />
        <KPI
          label={`Expected ${config.companyCommissionPct}%`}
          value={fmtUSD(totals.totalExpected)}
          hint="Lo que debe recibir el contractor"
          primary
        />
        <KPI
          label="Actually paid"
          value={fmtUSD(totals.totalPaid)}
          hint="Suma de payroll lines confirmados"
        />
        <KPI
          label="Audit"
          value={`${totals.okCount} OK · ${totals.flaggedCount} flag`}
          hint="Match entre expected y paid"
          variant={totals.flaggedCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job-by-job audit</CardTitle>
            <CardDescription>
              Compara expected vs paid. Click para ver el desglose.
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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Contractor income (foreman)
                          </p>
                          <p className="mt-1 font-mono text-lg font-bold">
                            {fmtUSD(
                              a.perCrew.reduce((acc, c) => acc + c.finalPay, 0),
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {a.perCrew[0]?.pctApplied ?? 0}% del base
                          </p>
                        </div>
                        {registeredContractor && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Company reserve
                            </p>
                            <p className="mt-1 font-mono text-lg font-bold text-primary">
                              {fmtUSD(a.companyReserve)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {DEFAULT_COMMISSION_CONFIG.companyReservePct}% del
                              base
                            </p>
                          </div>
                        )}
                      </div>
                      {j.excluded && (
                        <p className="mt-3 text-[10px] text-muted-foreground">
                          Excluido del base:{" "}
                          {j.excluded.admin &&
                            `Admin ${fmtUSD(j.excluded.admin)}`}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Period summary</CardTitle>
            <CardDescription>
              {registeredContractor
                ? "Distribución entre foreman y reserva de empresa"
                : "Gross foreman commission"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <BucketRow
              label="Foreman income"
              value={fmtUSD(totals.totalForeman)}
            />
            {registeredContractor && (
              <BucketRow
                label="Company savings (3.5%)"
                value={fmtUSD(totals.totalReserve)}
                accent
              />
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span className="text-xs">Total received</span>
              <span className="font-mono text-sm">
                {fmtUSD(totals.totalPaid)}
              </span>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              La repartición a helpers/empleados se maneja por separado en la
              contabilidad del contractor — no se refleja en este panel.
            </p>
          </CardContent>
        </Card>
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
