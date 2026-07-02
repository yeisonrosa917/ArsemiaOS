"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PayrollStatusBadge } from "@/components/shared/status-badge";
import { payrollLinesAll as payrollLines } from "@/lib/payroll/data";
import { cn, formatCurrency } from "@/lib/utils";

export function PayrollTable() {
  const [search, setSearch] = useState("");
  const [onlyFlags, setOnlyFlags] = useState(false);

  const rows = useMemo(() => {
    return payrollLines.filter((p) => {
      if (onlyFlags && p.auditFlags.length === 0) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${p.jobId} ${p.customer}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, onlyFlags]);

  const totalPayout = rows.reduce((s, p) => s + p.finalPayout, 0);
  const totalCommissionable = rows.reduce(
    (s, p) => s + p.commissionableTotal,
    0,
  );
  const flagged = payrollLines.filter((p) => p.auditFlags.length > 0).length;

  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="border-b p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job or customer"
                className="pl-9"
              />
            </div>
            <Button
              variant={onlyFlags ? "default" : "outline"}
              size="sm"
              onClick={() => setOnlyFlags((v) => !v)}
              className="gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Audit flags ({flagged})
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export period
            </Button>
            <Button size="sm">Approve all</Button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <Pill label="Lines in period" value={String(payrollLines.length)} />
          <Pill
            label="Commissionable"
            value={formatCurrency(totalCommissionable)}
          />
          <Pill label="Total payout" value={formatCurrency(totalPayout)} />
          <Pill
            label="Flagged"
            value={`${flagged} item${flagged === 1 ? "" : "s"}`}
            tone="warning"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Job</TableHead>
            <TableHead className="text-right">CuFt</TableHead>
            <TableHead className="text-right">Miles</TableHead>
            <TableHead className="text-right">CuFt charge</TableHead>
            <TableHead className="text-right">Mileage</TableHead>
            <TableHead className="text-right">Extras</TableHead>
            <TableHead className="text-right">Non-commissionable</TableHead>
            <TableHead className="text-right">Commissionable</TableHead>
            <TableHead className="text-right">Crew %</TableHead>
            <TableHead className="text-right">Foreman</TableHead>
            <TableHead className="text-right">Helper</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Final payout</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-5">Audit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.jobId} className={cn(p.auditFlags.length > 0 && "bg-amber-500/5")}>
              <TableCell className="pl-5">
                <p className="font-mono text-xs">{p.jobId}</p>
                <p className="text-xs text-muted-foreground">{p.customer}</p>
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {p.cuFt}
                {p.cuFt < 200 && (
                  <span className="ml-1 text-[10px] font-semibold text-amber-600">
                    {"<"}min
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {p.miles.toFixed(1)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatCurrency(p.cuFtCharge)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatCurrency(p.mileageCharge)}
                <span className="ml-1 text-[10px] text-muted-foreground">
                  @${p.mileageRate}/mi
                </span>
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatCurrency(p.extras)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {formatCurrency(p.adminSurcharge + p.tolls)}
                <p className="text-[10px]">admin + tolls</p>
              </TableCell>
              <TableCell className="text-right font-mono text-xs font-semibold">
                {formatCurrency(p.commissionableTotal)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {p.crewPercent}%
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatCurrency(p.foremanPayout)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {p.helperPayout > 0 ? formatCurrency(p.helperPayout) : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {p.deductions > 0 ? formatCurrency(p.deductions) : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-semibold">
                {formatCurrency(p.finalPayout)}
              </TableCell>
              <TableCell>
                <PayrollStatusBadge status={p.status} />
              </TableCell>
              <TableCell className="pr-5">
                {p.auditFlags.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {p.auditFlags.map((f) => (
                      <Badge key={f} variant="warning" className="whitespace-normal text-left">
                        <AlertTriangle className="h-3 w-3" />
                        {f}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground">OK</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/30 p-3",
        tone === "warning" && "border-amber-500/30 bg-amber-500/10",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-base font-semibold",
          tone === "warning" && "text-amber-700 dark:text-amber-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}
