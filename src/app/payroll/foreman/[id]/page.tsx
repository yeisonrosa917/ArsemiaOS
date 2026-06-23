"use client";

import { use, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { drivers, jobs, payrollLines } from "@/lib/mock-data";
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
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  const lines = useMemo(() => {
    if (!foreman) return [];
    return payrollLines.filter((p) => {
      const job = jobs.find((j) => j.id === p.jobId);
      return job?.driverId === foreman.id || job?.driverName === foreman.name;
    });
  }, [foreman]);

  const summary = useMemo(() => {
    const commissionable = lines.reduce((s, p) => s + p.commissionableTotal, 0);
    const payout = lines.reduce((s, p) => s + p.foremanPayout, 0);
    const helper = lines.reduce((s, p) => s + p.helperPayout, 0);
    const deductions = lines.reduce((s, p) => s + p.deductions, 0);
    const flags = lines.flatMap((p) => p.auditFlags);
    return { commissionable, payout, helper, deductions, flags };
  }, [lines]);

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
        description={`${foreman.id} · ${foreman.vehicleName}`}
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
              <p className="text-xs text-muted-foreground">{foreman.email}</p>
              <p className="text-xs text-muted-foreground">{foreman.phone}</p>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="Jobs"
              value={String(lines.length)}
              accent="primary"
            />
            <Stat
              label="Commissionable"
              value={formatCurrency(summary.commissionable)}
            />
            <Stat
              label="Foreman payout"
              value={formatCurrency(summary.payout)}
              accent="success"
            />
            <Stat
              label="Deductions"
              value={formatCurrency(summary.deductions)}
              accent={summary.deductions > 0 ? "danger" : undefined}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Jobs this period</CardTitle>
            <CardDescription>
              {lines.length} payroll line{lines.length !== 1 ? "s" : ""} · helper
              share {formatCurrency(summary.helper)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => log("approved", `Payroll approved for ${foreman.name}`)}
              className="gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve period
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => log("rejected", `Payroll flagged for ${foreman.name}`)}
              className="gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              Flag for review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
              No payroll lines this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">CuFt</TableHead>
                  <TableHead className="text-right">Miles</TableHead>
                  <TableHead className="text-right">Commissionable</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((p) => (
                  <TableRow key={p.jobId}>
                    <TableCell className="pl-5">
                      <Link
                        href={`/jobs/${p.jobId}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {p.jobId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{p.customer}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {p.cuFt}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {p.miles}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(p.commissionableTotal)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {p.crewPercent}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(p.foremanPayout)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {p.deductions > 0 ? (
                        <span className="text-rose-600">
                          -{formatCurrency(p.deductions)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="pr-5">
                      <Badge
                        variant={
                          p.status === "Approved"
                            ? "success"
                            : p.status === "Paid"
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            Audit flags
          </CardTitle>
          <CardDescription>
            {summary.flags.length === 0
              ? "No flags this period. Clean run."
              : `${summary.flags.length} flag(s) need review before approval.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.flags.length === 0 ? (
            <p className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/[0.04] p-4 text-center text-xs">
              No discrepancies detected.
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
            Payment method
          </CardTitle>
          <CardDescription>
            Configured at the foreman profile; final disbursement happens through accounting.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            Disbursement currently routes through{" "}
            <span className="font-semibold">ACH on Friday</span>. Update the
            payment plan from the foreman profile when ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 p-2",
        accent === "primary" && "border-primary/40 bg-primary/[0.04]",
        accent === "success" && "border-success/40 bg-success/[0.04]",
        accent === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-base font-bold">{value}</p>
    </div>
  );
}
