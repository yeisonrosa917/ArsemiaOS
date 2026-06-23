"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { useExpenses, EXPENSE_STATUSES, type ExpenseStatus } from "@/lib/store/expenses";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  Submitted: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Needs Receipt": "bg-warning/15 text-warning border-warning/30",
  "Under Review": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Duplicate: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Paid: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  Reimbursed: "bg-success/15 text-success border-success/30",
  "On Hold": "bg-orange-500/15 text-orange-600 border-orange-500/30",
};

const STATUSES: ("All" | ExpenseStatus)[] = ["All", ...EXPENSE_STATUSES];

export default function ExpensesPage() {
  const items = useExpenses((s) => s.items);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");

  const filtered = useMemo(() => {
    return items.filter((e) => {
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
  }, [items, filter, query]);

  const totals = useMemo(() => {
    const pending = items.filter((e) =>
      ["Submitted", "Under Review", "Needs Receipt", "On Hold"].includes(e.status),
    );
    const approved = items.filter((e) =>
      ["Approved", "Paid", "Reimbursed"].includes(e.status),
    );
    const reimbursed = items.filter((e) => e.status === "Reimbursed");
    const rejected = items.filter((e) =>
      ["Rejected", "Duplicate"].includes(e.status),
    );
    return {
      pendingCount: pending.length,
      pendingSum: pending.reduce((s, e) => s + e.amount, 0),
      approvedSum: approved.reduce((s, e) => s + e.amount, 0),
      reimbursedSum: reimbursed.reduce((s, e) => s + e.amount, 0),
      rejectedSum: rejected.reduce((s, e) => s + e.amount, 0),
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Foreman-submitted expenses from the field. Each row opens a working detail page with approve/reject/paid actions."
        actions={
          <Button
            size="sm"
            className="gap-2"
            disabled
            title="Manual expense entry ships with the Foreman App. Until then, expenses flow from the field."
          >
            <Plus className="h-4 w-4" /> Manual entry
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Pending review"
          count={totals.pendingCount}
          value={formatCurrency(totals.pendingSum)}
          accent="amber"
        />
        <Stat
          label="Approved / Paid"
          value={formatCurrency(totals.approvedSum)}
          accent="primary"
        />
        <Stat
          label="Reimbursed"
          value={formatCurrency(totals.reimbursedSum)}
          accent="success"
        />
        <Stat
          label="Rejected / duplicate"
          value={formatCurrency(totals.rejectedSum)}
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
              {filtered.length} of {items.length} ·{" "}
              {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))} filtered total
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
                  <TableRow key={e.id} className="cursor-pointer hover:bg-accent/30">
                    <TableCell className="pl-5">
                      <Link
                        href={`/expenses/${e.id}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {e.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/expenses/${e.id}`}
                        className="text-xs font-semibold hover:underline"
                      >
                        {e.foremanName}
                      </Link>
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
                      {formatCurrency(e.amount)}
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
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                      No expenses match your filters.
                    </TableCell>
                  </TableRow>
                )}
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
