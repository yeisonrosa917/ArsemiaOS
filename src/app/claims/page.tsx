"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Filter, Plus, Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useClaims, CLAIM_STATUSES, type ClaimStatus } from "@/lib/store/claims";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  New: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Under Review": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Waiting for Evidence": "bg-orange-500/15 text-orange-600 border-orange-500/30",
  "Foreman Response Needed": "bg-rose-500/15 text-rose-600 border-rose-500/30",
  "Insurance Review": "bg-violet-500/15 text-violet-600 border-violet-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Reimbursed: "bg-success/15 text-success border-success/30",
  Deducted: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  Closed: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

const FILTERS: ("All" | ClaimStatus)[] = ["All", ...CLAIM_STATUSES];

export default function ClaimsPage() {
  const items = useClaims((s) => s.items);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(
    () =>
      items
        .filter((c) => filter === "All" || c.status === filter)
        .filter((c) => {
          if (!query) return true;
          const q = query.toLowerCase();
          return (
            c.customerName.toLowerCase().includes(q) ||
            c.jobId.toLowerCase().includes(q) ||
            c.foremanName.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.claimType.toLowerCase().includes(q)
          );
        }),
    [items, query, filter],
  );

  const totals = useMemo(() => {
    const open = items.filter(
      (c) =>
        !["Approved", "Rejected", "Reimbursed", "Deducted", "Closed"].includes(
          c.status,
        ),
    );
    const atRisk = open.reduce((s, c) => s + c.claimAmount, 0);
    const reimbursed = items
      .filter((c) => c.status === "Reimbursed")
      .reduce((s, c) => s + (c.reimbursedAmount ?? c.claimAmount), 0);
    return {
      openCount: open.length,
      total: items.length,
      atRisk,
      reimbursed,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims & evidence"
        description="Damage, lost items, late deliveries. Each claim is clickable and has a full evidence trail."
        actions={
          <Button asChild size="sm" className="gap-2">
            <Link href="/claims/new">
              <Plus className="h-4 w-4" />
              File claim
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Open claims" value={String(totals.openCount)} tone="warning" />
        <SummaryCard label="Total claims" value={String(totals.total)} />
        <SummaryCard
          label="Amount at risk"
          value={formatCurrency(totals.atRisk)}
          tone="danger"
        />
        <SummaryCard
          label="Reimbursed (lifetime)"
          value={formatCurrency(totals.reimbursed)}
          tone="success"
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, job, foreman, claim ID..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
            <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            {FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Claim</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Job · Foreman</TableHead>
              <TableHead>Damage type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead className="pr-5 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-accent/30"
              >
                <TableCell className="pl-5">
                  <Link href={`/claims/${c.id}`} className="font-mono text-xs hover:underline">
                    {c.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/claims/${c.id}`} className="font-medium hover:underline">
                    {c.customerName}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">
                  <p className="font-mono text-muted-foreground">{c.jobId}</p>
                  <p>{c.foremanName}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{c.claimType}</Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                      STATUS_STYLES[c.status],
                    )}
                  >
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-semibold">
                    <Camera className="h-3 w-3" />
                    {c.evidence.length}
                  </span>
                </TableCell>
                <TableCell className="pr-5 text-right font-semibold">
                  {formatCurrency(c.claimAmount)}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  No claims match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning" | "danger" | "success";
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
          tone === "danger" && "text-rose-600 dark:text-rose-400",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
