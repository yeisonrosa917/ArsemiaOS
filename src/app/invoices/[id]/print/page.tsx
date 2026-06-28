"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useInvoices } from "@/lib/store/invoices";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { formatDateStable } from "@/lib/dates";

const COMPANY = {
  name: "Arsemia Logistics LLC",
  dba: "Arsemia Dispatch",
  address: "Miami, FL 33122",
  phone: "(305) 555-0900",
  email: "billing@arsemia.co",
  dot: "DOT-3491220",
  mc: "MC-1180445",
};

export default function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const invoice = useInvoices((s) => s.items.find((i) => i.id === id));

  useEffect(() => {
    if (typeof window !== "undefined" && invoice) {
      document.title = `${invoice.id} — ${invoice.customerName}`;
    }
  }, [invoice]);

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold">Invoice not found</p>
        <Button asChild variant="ghost" size="sm" className="mt-3 gap-1">
          <Link href="/invoices">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to invoices
          </Link>
        </Button>
      </div>
    );
  }

  const grouped = invoice.lines.reduce<Record<string, typeof invoice.lines>>(
    (acc, l) => {
      (acc[l.category] = acc[l.category] ?? []).push(l);
      return acc;
    },
    {},
  );

  const categorySubtotal = (cat: string) =>
    (grouped[cat] ?? []).reduce((s, l) => s + l.qty * l.unitPrice, 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b bg-white px-4 py-2 print:hidden">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={`/invoices/${invoice.id}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to detail
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
            <img
              src="/brand/arsemia-mark.svg"
              alt="Arsemia"
              width={64}
              height={64}
              className="rounded-xl"
            />
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
            <p className="text-3xl font-bold uppercase tracking-wider text-slate-900">
              Invoice
            </p>
            <p className="mt-1 font-mono text-sm text-slate-700">{invoice.id}</p>
            <p className="mt-1 text-xs text-slate-500">
              Issued <span className="font-semibold text-slate-700">{invoice.issueDate}</span>
            </p>
            <p className="text-xs text-slate-500">
              Due <span className="font-semibold text-slate-700">{invoice.dueDate}</span>
            </p>
            <p className="mt-2 inline-block rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
              {invoice.status}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Bill to
            </p>
            <p className="mt-1 text-sm font-semibold">{invoice.customerName}</p>
            {invoice.customerId && (
              <p className="text-[10px] font-mono text-slate-500">
                Customer ID {invoice.customerId}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              References
            </p>
            <p className="mt-1 text-sm">
              <span className="text-slate-500">Type:</span>{" "}
              <span className="font-semibold">{invoice.type}</span>
            </p>
            {invoice.jobId && (
              <p className="text-sm">
                <span className="text-slate-500">Job:</span>{" "}
                <span className="font-mono">{invoice.jobId}</span>
              </p>
            )}
            {invoice.quoteId && (
              <p className="text-sm">
                <span className="text-slate-500">Quote:</span>{" "}
                <span className="font-mono">{invoice.quoteId}</span>
              </p>
            )}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-[10px] uppercase tracking-widest text-slate-500">
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 pr-2">Category</th>
              <th className="py-2 pr-2 text-right">Qty</th>
              <th className="py-2 pr-2 text-right">Unit</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l, i) => (
              <tr key={i} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2">{l.description}</td>
                <td className="py-2 pr-2 text-xs text-slate-500">{l.category}</td>
                <td className="py-2 pr-2 text-right font-mono text-xs">{l.qty}</td>
                <td className="py-2 pr-2 text-right font-mono text-xs">
                  {formatCurrency(l.unitPrice)}
                </td>
                <td className="py-2 text-right font-mono text-sm font-semibold">
                  {formatCurrency(l.qty * l.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid gap-1 sm:grid-cols-2">
          <div className="text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-widest text-slate-500">
              Charge breakdown
            </p>
            <ul className="mt-1 space-y-0.5">
              {Object.keys(grouped).map((cat) => (
                <li key={cat} className="flex items-center justify-between">
                  <span>{cat}</span>
                  <span className="font-mono">{formatCurrency(categorySubtotal(cat))}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <Row label="Subtotal" value={formatCurrency(invoice.total)} />
            <Row label="Paid" value={`-${formatCurrency(invoice.paid)}`} />
            <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-base font-bold">
              <span>Balance due</span>
              <span className="font-mono">{formatCurrency(invoice.balance)}</span>
            </div>
          </div>
        </div>

        {invoice.payments.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Payments received
            </p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {invoice.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>
                    {formatDateStable(p.receivedAt)} · {p.method}
                    {p.reference && ` · ${p.reference}`}
                  </span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {invoice.notes && (
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs italic text-slate-700">
            {invoice.notes}
          </div>
        )}

        <div className="mt-10 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
          Thank you for your business. Questions? {COMPANY.email} · {COMPANY.phone}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
