"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { drivers } from "@/lib/mock-data";
import { payrollJobs as jobs, payrollLinesAll as payrollLines } from "@/lib/payroll/data";
import { useExpenses } from "@/lib/store/expenses";
import {
  useForemanProfiles,
  payoutModelLabel,
  payoutPercentFor,
} from "@/lib/store/foreman-profiles";
import {
  weeklyRange,
  monthlyRange,
  inRange,
  addDays,
  addMonths,
  type PayrollRange,
} from "@/lib/payroll/period";
import { usePreferences } from "@/lib/store/preferences";
import { getActiveForemanId } from "@/lib/auth/users";
import { cn, formatCurrency, initials } from "@/lib/utils";

/**
 * Self-scoped foreman payroll. This page resolves the ACTIVE foreman's identity
 * and shows ONLY their own records. There is no list of other foremen, no global
 * totals, and no approve/flag/payout-config controls — those live on the
 * Owner/Accounting page at /payroll which the foreman cannot reach.
 */
export default function ForemanMyPayrollPage() {
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const expensesAll = useExpenses((s) => s.items);
  const profiles = useForemanProfiles((s) => s.profiles);

  // The owner can preview this page too; fall back to the first foreman so the
  // page never crashes. A real foreman is always bound to their own FM id.
  const foremanId = getActiveForemanId(activeRoleId) ?? drivers[0]?.id ?? null;
  const foreman = drivers.find((d) => d.id === foremanId) ?? null;

  const [kind, setKind] = useState<"weekly" | "monthly">("weekly");
  const [offset, setOffset] = useState(0); // weeks or months back/forward from now

  const range: PayrollRange = useMemo(() => {
    if (kind === "monthly") return monthlyRange(addMonths(new Date(), offset));
    return weeklyRange(addDays(new Date(), offset * 7));
  }, [kind, offset]);

  const profile = profiles.find((p) => p.id === foremanId);
  const payoutPercent = payoutPercentFor(profile);
  const payoutLabel = payoutModelLabel(profile);

  const lines = useMemo(() => {
    if (!foreman) return [];
    return payrollLines.filter((p) => {
      const job = jobs.find((j) => j.id === p.jobId);
      if (!job) return false;
      if (job.driverId !== foreman.id && job.driverName !== foreman.name)
        return false;
      return inRange(job.scheduledAt ?? "", range);
    });
  }, [foreman, range]);

  const reimbursements = useMemo(() => {
    if (!foreman) return [];
    return expensesAll.filter(
      (e) =>
        e.foremanId === foreman.id &&
        e.reimbursable &&
        (e.status === "Approved" ||
          e.status === "Paid" ||
          e.status === "Reimbursed") &&
        inRange(e.date.slice(0, 10), range),
    );
  }, [expensesAll, foreman, range]);

  const summary = useMemo(() => {
    const commissionable = lines.reduce((s, p) => s + p.commissionableTotal, 0);
    const expectedPayout = (commissionable * payoutPercent) / 100;
    const deductions = lines.reduce((s, p) => s + p.deductions, 0);
    const onHold = lines
      .filter((p) => p.status === "Flagged")
      .reduce((s, p) => s + p.foremanPayout, 0);
    const reimbAmount = reimbursements.reduce((s, e) => s + e.amount, 0);
    const finalTotal = expectedPayout + reimbAmount - deductions - onHold;
    return { expectedPayout, deductions, onHold, reimbAmount, finalTotal };
  }, [lines, reimbursements, payoutPercent]);

  if (!foreman) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/foreman-portal">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to portal
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No payroll profile is linked to your account yet. Contact dispatch.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/foreman-portal">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to portal
        </Link>
      </Button>

      <PageHeader
        title="My payroll"
        description="Your own earnings only — week by week. For questions, contact dispatch or accounting."
      />

      {/* Identity + period navigation */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className={cn("text-white", foreman.avatarColor)}>
                {initials(foreman.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold">{foreman.name}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {foreman.id}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {payoutLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-border">
              <button
                onClick={() => {
                  setKind("weekly");
                  setOffset(0);
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold transition-colors",
                  kind === "weekly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent/40",
                )}
              >
                Weekly
              </button>
              <button
                onClick={() => {
                  setKind("monthly");
                  setOffset(0);
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold transition-colors",
                  kind === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent/40",
                )}
              >
                Monthly
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setOffset((o) => o - 1)}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-xs font-semibold">
                {range.label}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setOffset((o) => o + 1)}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {offset !== 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => setOffset(0)}
              >
                {kind === "weekly" ? "This week" : "This month"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        <Stat label="Earned" value={formatCurrency(summary.expectedPayout)} tone="primary" />
        <Stat label="Reimbursements" value={formatCurrency(summary.reimbAmount)} tone="success" />
        <Stat label="Deductions" value={formatCurrency(summary.deductions)} tone="danger" />
        <Stat label="On hold" value={formatCurrency(summary.onHold)} tone="warning" />
        <Stat label="Take-home" value={formatCurrency(summary.finalTotal)} tone="primary" big />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jobs paid — {range.label}</CardTitle>
          <CardDescription>
            {lines.length} job{lines.length !== 1 ? "s" : ""} at {payoutLabel}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
              No jobs in this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Commissionable</TableHead>
                  <TableHead className="text-right">Your payout</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((p) => {
                  const job = jobs.find((j) => j.id === p.jobId);
                  const lineExpected =
                    (p.commissionableTotal * payoutPercent) / 100;
                  return (
                    <TableRow key={p.jobId}>
                      <TableCell className="pl-5 text-[11px] text-muted-foreground">
                        {job?.scheduledAt?.slice(5, 10) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/jobs/${p.jobId}`}
                          className="font-mono text-xs hover:underline"
                        >
                          {p.jobId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs">{p.customer}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatCurrency(p.commissionableTotal)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {formatCurrency(lineExpected)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <Badge
                          variant={
                            p.status === "Approved" || p.status === "Paid"
                              ? "success"
                              : p.status === "Flagged"
                                ? "danger"
                                : "outline"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My reimbursements</CardTitle>
            <CardDescription>
              Out-of-pocket expenses approved this period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reimbursements.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                None this period.
              </p>
            ) : (
              <ul className="space-y-1">
                {reimbursements.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] px-2 py-1.5 text-xs"
                  >
                    <Link
                      href={`/expenses/${e.id}`}
                      className="font-mono hover:underline"
                    >
                      {e.id}
                    </Link>
                    <span className="text-muted-foreground">{e.category}</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      +{formatCurrency(e.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-primary" />
              How your pay is calculated
            </CardTitle>
            <CardDescription>Your payout model is {payoutLabel}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              Earned = commissionable total × {payoutPercent}%. Reimbursements
              are added back; deductions and on-hold amounts are subtracted to
              get your take-home.
            </p>
            {profile?.notes && (
              <p className="rounded-md border border-border bg-muted/20 px-2 py-1.5 text-foreground">
                <span className="font-semibold">Note from office: </span>
                {profile.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone?: "primary" | "success" | "warning" | "danger";
  big?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-3",
        tone === "primary" && "border-primary/40 bg-primary/[0.04]",
        tone === "success" && "border-success/40 bg-success/[0.04]",
        tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]",
        tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
        big && "ring-2 ring-primary/40",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 font-mono font-bold", big ? "text-2xl" : "text-lg")}>
        {value}
      </p>
    </Card>
  );
}
