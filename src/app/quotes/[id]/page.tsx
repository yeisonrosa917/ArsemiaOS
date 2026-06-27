"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Phone, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuotesStore, type QuoteStatus } from "@/lib/store/quotes";
import { fmtUSD, fmtCuft } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<QuoteStatus, string> = {
  Draft: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Sent: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Booked: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "Converted to Job": "bg-success/15 text-success border-success/30",
  Lost: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Cancelled: "bg-amber-500/15 text-amber-600 border-amber-500/30",
};

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const quote = useQuotesStore((s) => s.getById(id));

  if (!quote) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/quotes">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to New Quote
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">Quote not found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Quote {id} doesn&apos;t exist in this session. Quotes are
              currently stored in your browser only (Phase 11 connects to
              backend).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inventoryTotal = quote.inventory.reduce(
    (a, i) => a + i.qty * i.cuftEach,
    0,
  );

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/quotes">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to New Quote
        </Link>
      </Button>

      <PageHeader
        title={`Quote ${quote.id}`}
        description={`${quote.jobType} for ${quote.customerName}`}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border", STATUS_STYLES[quote.status])}>
                {quote.status}
              </Badge>
              <Badge variant="outline">{quote.jobType}</Badge>
              {quote.leadId && (
                <Badge variant="outline" className="font-mono">
                  from {quote.leadId}
                </Badge>
              )}
            </div>
            <h1 className="mt-1 text-lg font-bold">{quote.customerName}</h1>
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
              {quote.customerPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {quote.customerPhone}
                </span>
              )}
              {quote.customerEmail && <span>{quote.customerEmail}</span>}
              {quote.moveDate && <span>Move: {quote.moveDate}</span>}
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            <Stat
              label="Customer total"
              value={fmtUSD(quote.customerTotal)}
              primary
            />
            <Stat
              label="Commissionable"
              value={fmtUSD(quote.commissionableBase)}
            />
            <Stat label="CuFt" value={fmtCuft(quote.estimatedCuFt)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory</CardTitle>
              <CardDescription>
                {quote.inventory.length} items · {fmtCuft(inventoryTotal)} ft³
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quote.inventory.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                  Estimated CuFt only — no itemized inventory yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-right">CuFt</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                        <th className="p-2.5">Pack</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.inventory.map((it, idx) => (
                        <tr
                          key={idx}
                          className="border-t border-border/60"
                        >
                          <td className="p-2.5 font-medium">{it.itemName}</td>
                          <td className="p-2.5 text-right font-mono text-xs">
                            {fmtCuft(it.cuftEach)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs">
                            {it.qty}
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs">
                            {fmtCuft(it.qty * it.cuftEach)} ft³
                          </td>
                          <td className="p-2.5 text-[10px]">
                            {it.packByCrew ? "✓ Crew" : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {quote.fees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {quote.fees.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                  >
                    <div>
                      <p>{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {f.commissionable
                          ? "Commissionable"
                          : "Non-commissionable"}
                        {!f.customerVisible && " · Internal only"}
                      </p>
                    </div>
                    <span className="font-mono font-semibold">
                      {fmtUSD(f.amount)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <NotesRow label="Customer" value={quote.notes.customer} />
              <NotesRow label="Foreman" value={quote.notes.foreman} />
              <NotesRow label="Internal" value={quote.notes.internal} />
              <NotesRow label="Accounting" value={quote.notes.accounting} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pickup
                </p>
                <p>{quote.pickupAddress || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery
                </p>
                <p>{quote.deliveryAddress || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Miles & rates
                </p>
                <p>
                  {quote.mileage.miles} mi · customer $
                  {quote.mileage.customerRatePerMile}/mi · internal $
                  {quote.mileage.internalRatePerMile}/mi
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <Row label="Quote ID" value={quote.id} />
              <Row label="Created" value={new Date(quote.createdAt).toLocaleString()} />
              <Row label="Updated" value={new Date(quote.updatedAt).toLocaleString()} />
              {quote.customerId && (
                <Row label="Customer ID" value={quote.customerId} />
              )}
              {quote.leadId && <Row label="From lead" value={quote.leadId} />}
            </CardContent>
          </Card>

          <Button asChild className="w-full gap-1" variant="default">
            <Link href={`/quotes/${quote.id}/print`} target="_blank">
              <FileText className="h-3.5 w-3.5" />
              Preview / Download PDF
            </Link>
          </Button>

          <Button
            asChild
            className="w-full gap-1"
            variant="outline"
          >
            <Link
              href={{
                pathname: "/quotes",
                query: {
                  customer: quote.customerName,
                  phone: quote.customerPhone ?? "",
                  jobType: quote.jobType,
                  customerId: quote.customerId ?? "",
                },
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Clone as new quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 p-2",
        primary && "border-primary/40 bg-primary/[0.04]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono text-base font-bold",
          primary && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

function NotesRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-muted/20 p-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line">{value}</p>
    </div>
  );
}
