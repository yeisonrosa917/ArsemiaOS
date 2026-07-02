"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { drivers, jobs, payrollLines } from "@/lib/mock-data";
import { useExpenses } from "@/lib/store/expenses";
import {
  useForemanProfiles,
  payoutModelLabel,
  payoutPercentFor,
} from "@/lib/store/foreman-profiles";
import {
  weeklyRange,
  monthlyRange,
  customRange,
  inRange,
  addDays,
  addMonths,
  type PayrollRange,
} from "@/lib/payroll/period";
import { cn, formatCurrency, initials } from "@/lib/utils";

interface ForemanRollup {
  id: string;
  name: string;
  avatarColor: string;
  payoutLabel: string;
  payoutPercent: number;
  contractorCompany?: string;
  jobsCompleted: number;
  commissionableTotal: number;
  expectedPayout: number;
  reimbursements: number;
  deductions: number;
  onHold: number;
  finalTotal: number;
  flags: number;
  pending: number;
  status: "needs_review" | "approved" | "paid" | "on_hold" | "disputed";
}

export function PayrollForemanList() {
  const expenseItems = useExpenses((s) => s.items);
  const profiles = useForemanProfiles((s) => s.profiles);

  const [rangeKind, setRangeKind] = useState<"weekly" | "monthly" | "custom">("weekly");
  const [offset, setOffset] = useState(0); // weeks/months back/forward from now
  const [customFrom, setCustomFrom] = useState(weeklyRange().from);
  const [customTo, setCustomTo] = useState(weeklyRange().to);

  const range: PayrollRange = useMemo(() => {
    if (rangeKind === "weekly")
      return weeklyRange(addDays(new Date(), offset * 7));
    if (rangeKind === "monthly")
      return monthlyRange(addMonths(new Date(), offset));
    return customRange(customFrom, customTo);
  }, [rangeKind, offset, customFrom, customTo]);

  const rollups: ForemanRollup[] = useMemo(() => {
    return drivers.map((d) => {
      const profile = profiles.find((p) => p.id === d.id);
      const payoutPercent = payoutPercentFor(profile);
      const payoutLabel = payoutModelLabel(profile);

      const foremanLines = payrollLines.filter((p) => {
        const job = jobs.find((j) => j.id === p.jobId);
        if (!job) return false;
        if (job.driverId !== d.id && job.driverName !== d.name) return false;
        return inRange(job.scheduledAt ?? "", range);
      });

      const commissionable = foremanLines.reduce(
        (s, p) => s + p.commissionableTotal,
        0,
      );
      const expectedPayout = (commissionable * payoutPercent) / 100;
      const deductions = foremanLines.reduce((s, p) => s + p.deductions, 0);
      const flags = foremanLines.reduce((s, p) => s + p.auditFlags.length, 0);
      const pending = foremanLines.filter((p) => p.status === "Pending").length;

      const reimbursements = expenseItems
        .filter(
          (e) =>
            e.foremanId === d.id &&
            e.reimbursable &&
            (e.status === "Approved" ||
              e.status === "Paid" ||
              e.status === "Reimbursed") &&
            inRange(e.date.slice(0, 10), range),
        )
        .reduce((s, e) => s + e.amount, 0);

      const onHold = foremanLines
        .filter((p) => p.status === "Flagged")
        .reduce((s, p) => s + p.foremanPayout, 0);

      const finalTotal = expectedPayout + reimbursements - deductions - onHold;

      const status: ForemanRollup["status"] = flags > 0
        ? "disputed"
        : pending > 0
          ? "needs_review"
          : onHold > 0
            ? "on_hold"
            : foremanLines.length > 0 && foremanLines.every((p) => p.status === "Paid")
              ? "paid"
              : "approved";

      return {
        id: d.id,
        name: d.name,
        avatarColor: d.avatarColor,
        payoutLabel,
        payoutPercent,
        contractorCompany: profile?.contractorCompany,
        jobsCompleted: foremanLines.length,
        commissionableTotal: commissionable,
        expectedPayout,
        reimbursements,
        deductions,
        onHold,
        finalTotal,
        flags,
        pending,
        status,
      };
    });
  }, [expenseItems, profiles, range]);

  const totals = useMemo(() => {
    return {
      payroll: rollups.reduce((s, r) => s + r.finalTotal, 0),
      reimbursements: rollups.reduce((s, r) => s + r.reimbursements, 0),
      deductions: rollups.reduce((s, r) => s + r.deductions, 0),
      onHold: rollups.reduce((s, r) => s + r.onHold, 0),
      flags: rollups.reduce((s, r) => s + r.flags, 0),
    };
  }, [rollups]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {rangeKind !== "custom" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setOffset((o) => o - 1)}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <p className="min-w-[120px] text-center text-sm font-semibold">
              {range.label}
            </p>
            {rangeKind !== "custom" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setOffset((o) => o + 1)}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="outline" className="text-[10px]">
              {range.kind}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RangeButton
              label="This week"
              active={rangeKind === "weekly"}
              onClick={() => {
                setRangeKind("weekly");
                setOffset(0);
              }}
            />
            <RangeButton
              label="This month"
              active={rangeKind === "monthly"}
              onClick={() => {
                setRangeKind("monthly");
                setOffset(0);
              }}
            />
            <RangeButton
              label="Custom"
              active={rangeKind === "custom"}
              onClick={() => {
                setRangeKind("custom");
                setOffset(0);
              }}
            />
            {rangeKind === "custom" && (
              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 w-36 text-xs"
                />
                <span className="text-xs text-muted-foreground">→</span>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 w-36 text-xs"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        <Stat label="Total payroll" value={formatCurrency(totals.payroll)} tone="primary" />
        <Stat label="Reimbursements" value={formatCurrency(totals.reimbursements)} tone="success" />
        <Stat label="Deductions" value={formatCurrency(totals.deductions)} tone="danger" />
        <Stat label="On hold" value={formatCurrency(totals.onHold)} tone="warning" />
        <Stat label="Audit flags" value={String(totals.flags)} tone={totals.flags > 0 ? "danger" : undefined} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foremen — {range.label}</CardTitle>
          <CardDescription>
            Click any foreman to open the weekly breakdown, reimbursements,
            deductions and final total.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rollups.map((r) => {
            const sharePct =
              totals.payroll > 0 ? (r.finalTotal / totals.payroll) * 100 : 0;
            return (
              <Link
                key={r.id}
                href={`/payroll/foreman/${r.id}`}
                className="block rounded-xl border border-border bg-background p-3 transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn("text-white", r.avatarColor)}>
                      {initials(r.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{r.name}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {r.id}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.payoutLabel}
                      </Badge>
                      {r.contractorCompany && (
                        <Badge variant="outline" className="text-[10px]">
                          {r.contractorCompany}
                        </Badge>
                      )}
                      <StatusPill status={r.status} />
                      {r.flags > 0 && (
                        <Badge variant="danger" className="gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          {r.flags}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground sm:grid-cols-4">
                      <span>
                        Jobs{" "}
                        <span className="font-semibold text-foreground">
                          {r.jobsCompleted}
                        </span>
                      </span>
                      <span>
                        Commissionable{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {formatCurrency(r.commissionableTotal)}
                        </span>
                      </span>
                      <span>
                        Reimb.{" "}
                        <span className="font-mono font-semibold text-emerald-600">
                          {formatCurrency(r.reimbursements)}
                        </span>
                      </span>
                      <span>
                        Deductions{" "}
                        <span className="font-mono font-semibold text-rose-600">
                          {formatCurrency(r.deductions)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-base font-bold">
                      {formatCurrency(r.finalTotal)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {sharePct.toFixed(1)}% of period payroll
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function RangeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="h-8 text-xs"
    >
      {label}
    </Button>
  );
}

function StatusPill({ status }: { status: ForemanRollup["status"] }) {
  const styles: Record<ForemanRollup["status"], string> = {
    needs_review: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    paid: "bg-success/15 text-success border-success/30",
    on_hold: "bg-orange-500/15 text-orange-700 border-orange-500/30",
    disputed: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  };
  const labels: Record<ForemanRollup["status"], string> = {
    needs_review: "Needs review",
    approved: "Approved",
    paid: "Paid",
    on_hold: "On hold",
    disputed: "Disputed",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  return (
    <Card
      className={cn(
        "p-3",
        tone === "primary" && "border-primary/40 bg-primary/[0.04]",
        tone === "success" && "border-success/40 bg-success/[0.04]",
        tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]",
        tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-bold">{value}</p>
    </Card>
  );
}
