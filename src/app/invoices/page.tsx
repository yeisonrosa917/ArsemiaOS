"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Receipt, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoices, INVOICE_STATUSES, type InvoiceStatus } from "@/lib/store/invoices";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  Draft: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Sent: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Viewed: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  "Partially Paid": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Paid: "bg-success/15 text-success border-success/30",
  Overdue: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Void: "bg-muted text-muted-foreground border-border",
  Refunded: "bg-violet-500/15 text-violet-600 border-violet-500/30",
};

const FILTERS: ("All" | InvoiceStatus)[] = ["All", ...INVOICE_STATUSES];

export default function InvoicesPage() {
  const router = useRouter();
  const items = useInvoices((s) => s.items);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      items
        .filter((i) => filter === "All" || i.status === filter)
        .filter((i) => {
          if (!query) return true;
          const q = query.toLowerCase();
          return (
            i.customerName.toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q) ||
            (i.jobId?.toLowerCase().includes(q) ?? false) ||
            i.type.toLowerCase().includes(q)
          );
        }),
    [items, filter, query],
  );

  const totals = useMemo(() => {
    const billed = items.reduce((s, i) => s + i.total, 0);
    const collected = items.reduce((s, i) => s + i.paid, 0);
    const outstanding = items
      .filter((i) => i.status !== "Paid" && i.status !== "Void")
      .reduce((s, i) => s + i.balance, 0);
    const overdue = items
      .filter((i) => i.status === "Overdue")
      .reduce((s, i) => s + i.balance, 0);
    return { billed, collected, outstanding, overdue };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Customer bills, adjustment invoices, and receipts. Each row opens a working detail page."
        actions={
          <Button size="sm" className="gap-2" asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Billed total" value={formatCurrency(totals.billed)} />
        <Stat label="Collected" value={formatCurrency(totals.collected)} tone="success" />
        <Stat label="Outstanding" value={formatCurrency(totals.outstanding)} tone="warning" />
        <Stat label="Overdue" value={formatCurrency(totals.overdue)} tone="danger" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, invoice ID, job ID, type..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
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
        <div className="flex items-center gap-2 border-b p-3 text-sm">
          <Receipt className="h-4 w-4 text-primary" />
          <p className="font-semibold">{filtered.length} of {items.length} invoices</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Job / Quote</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow
                key={i.id}
                className="cursor-pointer hover:bg-accent/30"
                onClick={() => router.push(`/invoices/${i.id}`)}
              >
                <TableCell className="pl-5">
                  <Link href={`/invoices/${i.id}`} className="font-mono text-xs hover:underline">
                    {i.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/invoices/${i.id}`} className="font-medium hover:underline">
                    {i.customerName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {i.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {i.jobId ?? i.quoteId ?? "—"}
                </TableCell>
                <TableCell className="text-xs">{i.issueDate}</TableCell>
                <TableCell className="text-xs">{i.dueDate}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(i.total)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatCurrency(i.balance)}
                </TableCell>
                <TableCell className="pr-5">
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                      STATUS_STYLES[i.status],
                    )}
                  >
                    {i.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
          tone === "danger" && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
