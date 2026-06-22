"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Receipt, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EXPENSES, type ExpenseStatus } from "@/lib/data/expenses";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  Submitted: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Under Review": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Reimbursed: "bg-success/15 text-success border-success/30",
  Deducted: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  "Needs Receipt": "bg-warning/15 text-warning border-warning/30",
};

const STATUSES: ("All" | ExpenseStatus)[] = [
  "All",
  "Submitted",
  "Under Review",
  "Approved",
  "Reimbursed",
  "Rejected",
  "Needs Receipt",
  "Deducted",
];

export default function ExpensesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");

  const filtered = useMemo(() => {
    return EXPENSES.filter((e) => {
      if (filter !== "All" && e.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        e.foremanName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.truckName.toLowerCase().includes(q) ||
        (e.jobId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [filter, query]);

  const totals = useMemo(() => {
    const submitted = EXPENSES.filter((e) =>
      ["Submitted", "Under Review", "Needs Receipt"].includes(e.status),
    );
    const approved = EXPENSES.filter((e) =>
      ["Approved", "Reimbursed"].includes(e.status),
    );
    const reimbursed = EXPENSES.filter((e) => e.status === "Reimbursed");
    const deducted = EXPENSES.filter((e) => e.status === "Deducted");
    return {
      submittedCount: submitted.length,
      submittedSum: submitted.reduce((s, e) => s + e.amount, 0),
      approvedSum: approved.reduce((s, e) => s + e.amount, 0),
      reimbursedSum: reimbursed.reduce((s, e) => s + e.amount, 0),
      deductedSum: deducted.reduce((s, e) => s + e.amount, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Foreman-submitted expenses from the field. Reviewed by accounting, reimbursed or deducted."
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Manual entry
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Pending review"
          count={totals.submittedCount}
          value={fmtUSD(totals.submittedSum)}
          accent="amber"
        />
        <Stat
          label="Approved this period"
          value={fmtUSD(totals.approvedSum)}
          accent="primary"
        />
        <Stat
          label="Reimbursed"
          value={fmtUSD(totals.reimbursedSum)}
          accent="success"
        />
        <Stat
          label="Deducted from payroll"
          value={fmtUSD(totals.deductedSum)}
          accent="violet"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-primary" />
              All expenses
            </CardTitle>
            <CardDescription>
              {filtered.length} of {EXPENSES.length} ·{" "}
              {fmtUSD(filtered.reduce((s, e) => s + e.amount, 0))} filtered total
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by foreman, category, truck, job ID..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
              <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    filter === s
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Expense</TableHead>
                  <TableHead>Foreman</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-5 font-mono text-xs">
                      {e.id}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {e.foremanName}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-[11px] text-muted-foreground">
                      {e.truckName}
                    </TableCell>
                    <TableCell className="font-mono text-[11px]">
                      {e.jobId ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {fmtUSD(e.amount)}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="pr-5">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                          STATUS_STYLES[e.status],
                        )}
                      >
                        {e.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  count,
  accent,
}: {
  label: string;
  value: string;
  count?: number;
  accent?: "amber" | "primary" | "success" | "violet";
}) {
  const accentClass = {
    amber: "border-amber-500/40 bg-amber-500/[0.04] text-amber-700",
    primary: "border-primary/40 bg-primary/[0.04] text-primary",
    success: "border-success/40 bg-success/[0.04] text-success",
    violet: "border-violet-500/40 bg-violet-500/[0.04] text-violet-700",
  }[accent ?? "primary"];
  return (
    <Card className={cn("border", accentClass)}>
      <CardContent className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-mono text-xl font-bold">{value}</p>
          {count != null && (
            <span className="text-[10px] text-muted-foreground">
              {count} items
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
