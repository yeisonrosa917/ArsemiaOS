import { Download, Plus, Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoices } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_VARIANT = {
  Draft: "slate",
  Sent: "info",
  Paid: "success",
  Overdue: "danger",
  Void: "slate",
} as const;

export default function InvoicesPage() {
  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const overdue = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((s, i) => s + i.amount, 0);
  const paid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Billing pipeline — drafts, sent, paid, and overdue across the customer book."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled
              title="CSV export comes in Phase 10 (Analytics + Tax Summary)"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="gap-2"
              disabled
              title="New invoice form ships in Phase 8 (Payroll + Accounting)"
            >
              <Plus className="h-4 w-4" />
              New invoice
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Billed total" value={formatCurrency(total)} />
        <Stat label="Collected" value={formatCurrency(paid)} tone="success" />
        <Stat label="Overdue" value={formatCurrency(overdue)} tone="danger" />
        <Stat label="Avg DSO" value="13 days" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b p-4">
          <Receipt className="h-4 w-4 text-brand-600" />
          <p className="text-sm font-semibold">All invoices</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Invoice</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="pl-5 font-mono text-xs">{i.id}</TableCell>
                <TableCell className="font-mono text-xs">{i.jobId}</TableCell>
                <TableCell className="font-medium">{i.customer}</TableCell>
                <TableCell className="text-xs">{i.issueDate}</TableCell>
                <TableCell className="text-xs">{i.dueDate}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(i.amount)}
                </TableCell>
                <TableCell className="pr-5">
                  <Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge>
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
  tone?: "success" | "danger";
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
          tone === "danger" && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
