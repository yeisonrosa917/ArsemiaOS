"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotesStore } from "@/lib/store/quotes";
import { formatCurrency } from "@/lib/utils";

const COMPANY = {
  name: "Arsemia Logistics LLC",
  dba: "Arsemia",
  address: "Miami, FL 33122",
  phone: "(305) 555-0900",
  email: "sales@arsemia.co",
  dot: "DOT-3491220",
  mc: "MC-1180445",
};

export default function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const quote = useQuotesStore((s) => s.quotes.find((q) => q.id === id));

  useEffect(() => {
    if (typeof window !== "undefined" && quote) {
      document.title = `${quote.id} — ${quote.customerName}`;
    }
  }, [quote]);

  if (!quote) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold">Quote not found</p>
        <Button asChild variant="ghost" size="sm" className="mt-3 gap-1">
          <Link href="/quotes">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to quotes
          </Link>
        </Button>
      </div>
    );
  }

  const inventoryCuFt = quote.inventory.reduce((s, l) => s + l.qty * l.cuftEach, 0);
  const customerMileageCharge = quote.mileage.miles * quote.mileage.customerRatePerMile;
  const feeSubtotal = quote.fees.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b bg-white px-4 py-2 print:hidden">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={`/quotes/${quote.id}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()} className="gap-1">
          <Printer className="h-3.5 w-3.5" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="mx-auto max-w-[820px] p-10 print:p-6">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div className="flex items-start gap-4">
            <img src="/brand/arsemia-mark.svg" alt="Arsemia" width={64} height={64} className="rounded-xl" />
            <div>
              <p className="text-2xl font-bold tracking-tight">{COMPANY.dba}</p>
              <p className="text-xs text-slate-500">{COMPANY.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {COMPANY.address}
                <br />
                {COMPANY.phone}
                <br />
                {COMPANY.email}
                <br />
                {COMPANY.dot} · {COMPANY.mc}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold uppercase tracking-wider text-slate-900">Quote</p>
            <p className="mt-1 font-mono text-sm text-slate-700">{quote.id}</p>
            <p className="mt-1 text-xs text-slate-500">
              Issued{" "}
              <span className="font-semibold text-slate-700">
                {new Date(quote.createdAt).toLocaleDateString()}
              </span>
            </p>
            <p className="mt-2 inline-block rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
              {quote.status}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">For</p>
            <p className="mt-1 text-sm font-semibold">{quote.customerName}</p>
            {quote.customerPhone && <p className="text-xs text-slate-600">{quote.customerPhone}</p>}
            {quote.customerEmail && <p className="text-xs text-slate-600">{quote.customerEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Move</p>
            <p className="mt-1 text-sm">
              <span className="text-slate-500">Type:</span>{" "}
              <span className="font-semibold">{quote.jobType}</span>
            </p>
            {quote.moveDate && (
              <p className="text-sm">
                <span className="text-slate-500">Date:</span>{" "}
                <span className="font-semibold">{quote.moveDate}</span>
              </p>
            )}
            {quote.pickupAddress && (
              <p className="text-xs text-slate-600">From: {quote.pickupAddress}</p>
            )}
            {quote.deliveryAddress && (
              <p className="text-xs text-slate-600">To: {quote.deliveryAddress}</p>
            )}
          </div>
        </div>

        {quote.inventory.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Inventory ({inventoryCuFt.toFixed(0)} ft³ estimated)
            </p>
            <table className="mt-1 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="py-2 pr-2">Item</th>
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 text-right">CuFt</th>
                </tr>
              </thead>
              <tbody>
                {quote.inventory.map((l, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2">{l.itemName}</td>
                    <td className="py-1.5 pr-2 text-right font-mono text-xs">{l.qty}</td>
                    <td className="py-1.5 text-right font-mono text-xs">
                      {(l.qty * l.cuftEach).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 grid gap-1 sm:grid-cols-2">
          <div className="text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-widest text-slate-500">Charges</p>
            <ul className="mt-1 space-y-0.5">
              {quote.fees.map((f) => (
                <li key={f.id} className="flex items-center justify-between">
                  <span>
                    {f.name}
                    {!f.commissionable && (
                      <span className="ml-1 text-[9px] text-slate-400">(non-comm.)</span>
                    )}
                  </span>
                  <span className="font-mono">{formatCurrency(f.amount)}</span>
                </li>
              ))}
              <li className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1 text-[11px] font-semibold">
                <span>Fees subtotal</span>
                <span className="font-mono">{formatCurrency(feeSubtotal)}</span>
              </li>
            </ul>
          </div>
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Estimated CuFt</span>
              <span className="font-mono">{quote.estimatedCuFt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mileage</span>
              <span className="font-mono">
                {quote.mileage.miles} mi · {formatCurrency(customerMileageCharge)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-base font-bold">
              <span>Customer total</span>
              <span className="font-mono">{formatCurrency(quote.customerTotal)}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Internal commissionable base: {formatCurrency(quote.commissionableBase)}
            </p>
          </div>
        </div>

        {quote.notes.customer && (
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="font-semibold uppercase tracking-widest text-slate-500">Notes for customer</p>
            <p className="mt-1 whitespace-pre-wrap">{quote.notes.customer}</p>
          </div>
        )}

        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-700">
          Template only — review with legal counsel before production use. Final
          price may change based on actual inventory, accessibility and
          additional services on move day.
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
          Questions? {COMPANY.email} · {COMPANY.phone}
        </div>
      </div>
    </div>
  );
}
