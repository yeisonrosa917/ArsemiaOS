"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Wallet,
  XCircle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { drivers, jobs, payrollLines } from "@/lib/mock-data";
import { useExpenses } from "@/lib/store/expenses";
import {
  useForemanProfiles,
  payoutModelLabel,
  payoutPercentFor,
  type PayoutModelKind,
} from "@/lib/store/foreman-profiles";
import {
  weeklyRange,
  monthlyRange,
  customRange,
  inRange,
  type PayrollRange,
} from "@/lib/payroll/period";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { cn, formatCurrency, initials } from "@/lib/utils";

export default function ForemanPayrollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const foreman = drivers.find((d) => d.id === id);
  const expensesAll = useExpenses((s) => s.items);
  const profiles = useForemanProfiles((s) => s.profiles);
  const updateProfile = useForemanProfiles((s) => s.update);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  const [rangeKind, setRangeKind] = useState<"weekly" | "monthly" | "custom">("weekly");
  const [customFrom, setCustomFrom] = useState(weeklyRange().from);
  const [customTo, setCustomTo] = useState(weeklyRange().to);

  const range: PayrollRange = useMemo(() => {
    if (rangeKind === "weekly") return weeklyRange();
    if (rangeKind === "monthly") return monthlyRange();
    return customRange(customFrom, customTo);
  }, [rangeKind, customFrom, customTo]);

  const profile = profiles.find((p) => p.id === id);
  const payoutPercent = payoutPercentFor(profile);
  const payoutLabel = payoutModelLabel(profile);

  const lines = useMemo(() => {
    if (!foreman) return [];
    return payrollLines.filter((p) => {
      const job = jobs.find((j) => j.id === p.jobId);
      if (!job) return false;
      if (job.driverId !== foreman.id && job.driverName !== foreman.name) return false;
      return inRange(job.scheduledAt ?? "", range);
    });
  }, [foreman, range]);

  const reimbursements = useMemo(() => {
    if (!foreman) return [];
    return expensesAll.filter(
      (e) =>
        e.foremanId === foreman.id &&
        e.reimbursable &&
        (e.status === "Approved" || e.status === "Paid" || e.status === "Reimbursed") &&
        inRange(e.date.slice(0, 10), range),
    );
  }, [expensesAll, foreman, range]);

  const summary = useMemo(() => {
    const commissionable = lines.reduce((s, p) => s + p.commissionableTotal, 0);
    const expectedPayout = (commissionable * payoutPercent) / 100;
    const deductionsList = lines
      .filter((p) => p.deductions > 0)
      .map((p) => ({
        jobId: p.jobId,
        amount: p.deductions,
        reason: p.auditFlags[0] ?? "Audit deduction",
      }));
    const deductions = deductionsList.reduce((s, d) => s + d.amount, 0);
    const onHoldList = lines
      .filter((p) => p.status === "Flagged")
      .map((p) => ({
        jobId: p.jobId,
        amount: p.foremanPayout,
        reason: p.auditFlags[0] ?? "Pending audit",
      }));
    const onHold = onHoldList.reduce((s, h) => s + h.amount, 0);
    const reimbAmount = reimbursements.reduce((s, e) => s + e.amount, 0);
    const finalTotal = expectedPayout + reimbAmount - deductions - onHold;
    const flags = lines.flatMap((p) => p.auditFlags);
    return {
      commissionable,
      expectedPayout,
      deductionsList,
      deductions,
      onHoldList,
      onHold,
      reimbAmount,
      finalTotal,
      flags,
    };
  }, [lines, reimbursements, payoutPercent]);

  if (!foreman) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/payroll">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to payroll
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">Foreman not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const log = (action: "approved" | "rejected", title: string) => {
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Payroll",
      action,
      objectType: "PayrollPeriod",
      objectId: foreman.id,
      title,
    });
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/payroll">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to payroll
        </Link>
      </Button>

      <PageHeader
        title={`Payroll · ${foreman.name}`}
        description={`${foreman.id} · ${range.label}`}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-12">
          <div className="lg:col-span-5 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={cn("text-white", foreman.avatarColor)}>
                {initials(foreman.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold">{foreman.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {payoutLabel}
                </Badge>
                {profile?.contractorCompany && (
                  <Badge variant="outline" className="text-[10px]">
                    {profile.contractorCompany}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {foreman.email} · {foreman.phone}
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-2">
            <RangeButton label="This week" active={rangeKind === "weekly"} onClick={() => setRangeKind("weekly")} />
            <RangeButton label="This month" active={rangeKind === "monthly"} onClick={() => setRangeKind("monthly")} />
            <RangeButton label="Custom" active={rangeKind === "custom"} onClick={() => setRangeKind("custom")} />
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
        <Stat label="Payroll total" value={formatCurrency(summary.expectedPayout)} tone="primary" />
        <Stat label="Reimbursements" value={formatCurrency(summary.reimbAmount)} tone="success" />
        <Stat label="Deducted" value={formatCurrency(summary.deductions)} tone="danger" />
        <Stat label="On hold" value={formatCurrency(summary.onHold)} tone="warning" />
        <Stat label="Final total" value={formatCurrency(summary.finalTotal)} tone="primary" big />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Jobs — {range.label}</CardTitle>
            <CardDescription>
              {lines.length} job{lines.length !== 1 ? "s" : ""} at {payoutLabel}.
              Tap any row to open the job.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => log("approved", `Payroll approved for ${foreman.name} (${range.label})`)}
              className="gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => log("rejected", `Payroll flagged for ${foreman.name} (${range.label})`)}
              className="gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              Flag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
              No jobs in this date range.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Commissionable</TableHead>
                  <TableHead className="text-right">Model</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                  <TableHead className="text-right">Deduct</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((p) => {
                  const job = jobs.find((j) => j.id === p.jobId);
                  const lineExpected = (p.commissionableTotal * payoutPercent) / 100;
                  return (
                    <TableRow key={p.jobId}>
                      <TableCell className="pl-5 text-[11px] text-muted-foreground">
                        {job?.scheduledAt?.slice(5, 10) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/jobs/${p.jobId}`} className="font-mono text-xs hover:underline">
                          {p.jobId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs">{p.customer}</TableCell>
                      <TableCell className="text-[11px]">
                        <Badge variant="outline" className="text-[10px]">
                          {job?.type ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatCurrency(p.commissionableTotal)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                        {payoutPercent}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {formatCurrency(lineExpected)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {p.deductions > 0 ? (
                          <span className="text-rose-600">-{formatCurrency(p.deductions)}</span>
                        ) : (
                          "—"
                        )}
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reimbursements</CardTitle>
            <CardDescription>
              Out-of-pocket expenses approved in this period.
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
                    <Link href={`/expenses/${e.id}`} className="font-mono hover:underline">
                      {e.id}
                    </Link>
                    <span className="text-muted-foreground">{e.category}</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      +{formatCurrency(e.amount)}
                    </span>
                  </li>
                ))}
                <li className="mt-2 flex items-center justify-between border-t pt-2 text-xs font-semibold">
                  <span>Subtotal</span>
                  <span className="font-mono text-emerald-600">
                    +{formatCurrency(summary.reimbAmount)}
                  </span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deductions</CardTitle>
            <CardDescription>Audit deductions tied to jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.deductionsList.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                Clean. No deductions.
              </p>
            ) : (
              <ul className="space-y-1">
                {summary.deductionsList.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-rose-500/20 bg-rose-500/[0.04] px-2 py-1.5 text-xs"
                  >
                    <Link href={`/jobs/${d.jobId}`} className="font-mono hover:underline">
                      {d.jobId}
                    </Link>
                    <span className="truncate text-muted-foreground">{d.reason}</span>
                    <span className="font-mono font-semibold text-rose-600">
                      -{formatCurrency(d.amount)}
                    </span>
                  </li>
                ))}
                <li className="mt-2 flex items-center justify-between border-t pt-2 text-xs font-semibold">
                  <span>Subtotal</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(summary.deductions)}
                  </span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">On hold</CardTitle>
            <CardDescription>Amounts pending audit before release.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.onHoldList.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                Nothing held back.
              </p>
            ) : (
              <ul className="space-y-1">
                {summary.onHoldList.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/[0.04] px-2 py-1.5 text-xs"
                  >
                    <Link href={`/jobs/${h.jobId}`} className="font-mono hover:underline">
                      {h.jobId}
                    </Link>
                    <span className="truncate text-muted-foreground">{h.reason}</span>
                    <span className="font-mono font-semibold text-amber-600">
                      {formatCurrency(h.amount)}
                    </span>
                  </li>
                ))}
                <li className="mt-2 flex items-center justify-between border-t pt-2 text-xs font-semibold">
                  <span>Subtotal</span>
                  <span className="font-mono text-amber-600">
                    {formatCurrency(summary.onHold)}
                  </span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            Audit flags
          </CardTitle>
          <CardDescription>
            {summary.flags.length === 0
              ? "No flags this period."
              : `${summary.flags.length} flag(s) need review before approval.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.flags.length === 0 ? (
            <p className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/[0.04] p-4 text-center text-xs">
              Clean.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {summary.flags.map((f, i) => (
                <li
                  key={i}
                  className="rounded-md border border-rose-500/30 bg-rose-500/[0.04] px-3 py-2 text-xs"
                >
                  <ShieldAlert className="mr-1 inline h-3 w-3 text-rose-600" />
                  {f}
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
            Payout configuration
          </CardTitle>
          <CardDescription>
            Stored on the foreman profile and applied to every payroll line.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payout model
            </label>
            <select
              value={profile?.payoutModel ?? "crew_30"}
              onChange={(e) =>
                updateProfile(foreman.id, {
                  payoutModel: e.target.value as PayoutModelKind,
                })
              }
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="contractor_33_5">Contractor — 33.5%</option>
              <option value="crew_30">Crew — 30%</option>
              <option value="custom">Custom %</option>
            </select>
          </div>
          {profile?.payoutModel === "custom" && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Custom percent
              </label>
              <Input
                type="number"
                value={profile?.customPercent ?? 30}
                onChange={(e) =>
                  updateProfile(foreman.id, {
                    customPercent: Number(e.target.value) || 30,
                  })
                }
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contractor company
            </label>
            <Input
              value={profile?.contractorCompany ?? ""}
              placeholder="e.g. Reyes Moving LLC"
              onChange={(e) =>
                updateProfile(foreman.id, { contractorCompany: e.target.value })
              }
            />
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Profile notes
            </label>
            <Input
              value={profile?.notes ?? ""}
              placeholder="Probationary, special rate, payment cadence..."
              onChange={(e) => updateProfile(foreman.id, { notes: e.target.value })}
            />
          </div>
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
