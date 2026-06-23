"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { drivers, jobs, payrollLines } from "@/lib/mock-data";
import { cn, formatCurrency, initials } from "@/lib/utils";

interface ForemanRollup {
  id: string;
  name: string;
  avatarColor: string;
  jobsCompleted: number;
  commissionableTotal: number;
  payout: number;
  deductions: number;
  auditFlags: number;
  pending: number;
}

export function PayrollForemanList() {
  const rollups: ForemanRollup[] = useMemo(() => {
    return drivers.map((d) => {
      const lines = payrollLines.filter((p) => {
        const job = jobs.find((j) => j.id === p.jobId);
        return job?.driverId === d.id || job?.driverName === d.name;
      });
      return {
        id: d.id,
        name: d.name,
        avatarColor: d.avatarColor,
        jobsCompleted: lines.length,
        commissionableTotal: lines.reduce((s, p) => s + p.commissionableTotal, 0),
        payout: lines.reduce((s, p) => s + p.foremanPayout, 0),
        deductions: lines.reduce((s, p) => s + p.deductions, 0),
        auditFlags: lines.reduce((s, p) => s + p.auditFlags.length, 0),
        pending: lines.filter((p) => p.status === "Pending").length,
      };
    });
  }, []);

  const totals = useMemo(() => {
    const total = rollups.reduce((s, r) => s + r.payout, 0);
    const flagged = rollups.filter((r) => r.auditFlags > 0).length;
    const pending = rollups.reduce((s, r) => s + r.pending, 0);
    return { total, flagged, pending };
  }, [rollups]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-primary/40 bg-primary/[0.04]">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Period payout
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {formatCurrency(totals.total)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/40 bg-amber-500/[0.04]">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pending review
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">{totals.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-rose-500/40 bg-rose-500/[0.04]">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Foremen with audit flags
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">{totals.flagged}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foremen this period</CardTitle>
          <CardDescription>
            Click any foreman to see their job-by-job breakdown, deductions, tips and audit flags.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rollups.map((r) => {
            const sharePct =
              totals.total > 0 ? (r.payout / totals.total) * 100 : 0;
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{r.name}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {r.id}
                      </span>
                      {r.auditFlags > 0 && (
                        <Badge variant="danger" className="gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          {r.auditFlags} flag{r.auditFlags !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {r.pending > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {r.pending} pending
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                      <span>
                        Jobs:{" "}
                        <span className="font-semibold text-foreground">
                          {r.jobsCompleted}
                        </span>
                      </span>
                      <span>
                        Commissionable:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {formatCurrency(r.commissionableTotal)}
                        </span>
                      </span>
                      <span>
                        Deductions:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {formatCurrency(r.deductions)}
                        </span>
                      </span>
                    </div>
                    <Progress
                      value={sharePct}
                      className="mt-2 h-1"
                      indicatorClassName="bg-primary"
                    />
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-base font-bold">
                      {formatCurrency(r.payout)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {sharePct.toFixed(1)}% of period
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
