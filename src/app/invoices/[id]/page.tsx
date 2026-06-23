"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, DollarSign, FileText, XCircle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoices, type InvoiceStatus } from "@/lib/store/invoices";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { formatCurrency } from "@/lib/utils";

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

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const invoice = useInvoices((s) => s.items.find((i) => i.id === id));
  const setStatus = useInvoices((s) => s.setStatus);
  const recordPayment = useInvoices((s) => s.recordPayment);
  const voidInvoice = useInvoices((s) => s.voidInvoice);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/invoices">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to invoices
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">Invoice not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatus = (next: InvoiceStatus) => {
    const prev = invoice.status;
    setStatus(invoice.id, next, user.name);
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Invoices",
      action: "status_changed",
      objectType: "Invoice",
      objectId: invoice.id,
      title: `Invoice ${invoice.id} marked ${next}`,
      beforeValue: { status: prev },
      afterValue: { status: next },
    });
  };

  const handleMarkPaid = () => {
    if (invoice.balance > 0) {
      recordPayment(invoice.id, {
        amount: invoice.balance,
        method: "Card",
        receivedAt: new Date().toISOString(),
        receivedBy: user.name,
      });
    } else {
      handleStatus("Paid");
    }
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Invoices",
      action: "paid",
      objectType: "Invoice",
      objectId: invoice.id,
      title: `Invoice ${invoice.id} marked as Paid`,
      afterValue: { amount: invoice.balance > 0 ? invoice.balance : invoice.total },
    });
  };

  const handleVoid = () => {
    if (!confirm(`Void invoice ${invoice.id}? This cannot be undone.`)) return;
    voidInvoice(invoice.id);
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Invoices",
      action: "rejected",
      objectType: "Invoice",
      objectId: invoice.id,
      title: `Invoice ${invoice.id} voided`,
    });
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/invoices">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to invoices
        </Link>
      </Button>

      <PageHeader title={`${invoice.type} ${invoice.id}`} description={invoice.customerName} />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold " +
                  STATUS_STYLES[invoice.status]
                }
              >
                {invoice.status}
              </span>
              <Badge variant="outline">{invoice.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Row label="Issued" value={invoice.issueDate} />
              <Row label="Due" value={invoice.dueDate} />
              {invoice.paidDate && <Row label="Paid date" value={invoice.paidDate} />}
              {invoice.jobId && (
                <Row label="Job" value={invoice.jobId} link={`/jobs/${invoice.jobId}`} />
              )}
              {invoice.quoteId && (
                <Row
                  label="Quote"
                  value={invoice.quoteId}
                  link={`/quotes/${invoice.quoteId}`}
                />
              )}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Total" value={formatCurrency(invoice.total)} primary />
              <Stat label="Paid" value={formatCurrency(invoice.paid)} accent="success" />
              <Stat label="Balance" value={formatCurrency(invoice.balance)} accent="warning" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {invoice.status === "Draft" && (
                <Button size="sm" onClick={() => handleStatus("Sent")}>
                  Mark Sent
                </Button>
              )}
              {invoice.balance > 0 && invoice.status !== "Void" && (
                <Button size="sm" onClick={handleMarkPaid} className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Paid
                </Button>
              )}
              {invoice.status === "Sent" && invoice.balance > 0 && (
                <Button size="sm" variant="outline" onClick={() => handleStatus("Overdue")}>
                  Mark Overdue
                </Button>
              )}
              {invoice.status !== "Void" && invoice.status !== "Paid" && (
                <Button size="sm" variant="outline" onClick={handleVoid} className="gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Void Invoice
                </Button>
              )}
              <Button asChild size="sm" variant="outline" className="gap-1">
                <Link href={`/invoices/${invoice.id}/print`} target="_blank">
                  <FileText className="h-3.5 w-3.5" /> Preview / Download PDF
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="pr-5 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lines.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="pl-5">{l.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {l.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{l.qty}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(l.unitPrice)}
                  </TableCell>
                  <TableCell className="pr-5 text-right font-mono font-semibold">
                    {formatCurrency(l.qty * l.unitPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <div className="grid gap-3 p-3 md:grid-cols-2">
            <div className="text-xs">
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                Charge breakdown
              </p>
              <ul className="mt-1 space-y-0.5">
                {Object.entries(
                  invoice.lines.reduce<Record<string, number>>((acc, l) => {
                    acc[l.category] = (acc[l.category] ?? 0) + l.qty * l.unitPrice;
                    return acc;
                  }, {}),
                ).map(([cat, sub]) => (
                  <li key={cat} className="flex items-center justify-between">
                    <span>{cat}</span>
                    <span className="font-mono">{formatCurrency(sub)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono font-semibold text-emerald-600">
                  -{formatCurrency(invoice.paid)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-1 text-base font-semibold">
                <span>Balance due</span>
                <span className="font-mono">{formatCurrency(invoice.balance)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments</CardTitle>
          <CardDescription>
            {invoice.payments.length} payment{invoice.payments.length !== 1 ? "s" : ""}{" "}
            recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
              No payments recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-success" />
                      {formatCurrency(p.amount)} · {p.method}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Received {new Date(p.receivedAt).toLocaleString()} by {p.receivedBy}
                      {p.reference && ` · ref: ${p.reference}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, link }: { label: string; value: string; link?: string }) {
  const content = (
    <>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-semibold">{value}</span>
    </>
  );
  return link ? (
    <Link href={link} className="hover:underline">
      {content}
    </Link>
  ) : (
    <p>{content}</p>
  );
}

function Stat({
  label,
  value,
  primary,
  accent,
}: {
  label: string;
  value: string;
  primary?: boolean;
  accent?: "success" | "warning";
}) {
  return (
    <div
      className={
        "rounded-lg border border-border bg-muted/20 p-2 " +
        (primary
          ? "border-primary/40 bg-primary/[0.04]"
          : accent === "success"
            ? "border-success/40 bg-success/[0.04]"
            : accent === "warning"
              ? "border-warning/40 bg-warning/[0.04]"
              : "")
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-base font-bold">{value}</p>
    </div>
  );
}
