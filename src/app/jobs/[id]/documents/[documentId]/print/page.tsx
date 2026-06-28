"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobDocuments } from "@/lib/store/job-documents";
import { useJobsStore } from "@/lib/store/jobs";
import { formatDateStable, formatDateTimeStable } from "@/lib/dates";

const COMPANY = {
  name: "Arsemia Logistics LLC",
  dba: "Arsemia",
  address: "Miami, FL 33122",
  phone: "(305) 555-0900",
  email: "ops@arsemia.co",
};

function render(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

export default function JobDocumentPrintPage({
  params,
}: {
  params: Promise<{ id: string; documentId: string }>;
}) {
  const { id, documentId } = use(params);
  const doc = useJobDocuments((s) => s.items.find((d) => d.id === documentId));
  const job = useJobsStore((s) => s.jobs.find((j) => j.id === id));

  useEffect(() => {
    if (typeof window !== "undefined" && doc) {
      document.title = `${doc.title} — ${id}`;
    }
  }, [doc, id]);

  if (!doc) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold">Document not found</p>
        <Button asChild variant="ghost" size="sm" className="mt-3 gap-1">
          <Link href={`/jobs/${id}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to job
          </Link>
        </Button>
      </div>
    );
  }

  const customer = job?.customer ?? "Customer";
  const foreman = job?.driverName ?? "";
  const body = render(doc.snapshotContent, {
    company: COMPANY.name,
    customer,
    foreman,
    jobId: id,
    date: formatDateStable(doc.generatedAt),
    timestamp: formatDateTimeStable(doc.generatedAt),
    validDays: "14",
    amount: "TBD",
    claimId: "—",
    total: "TBD",
    paid: "TBD",
    balance: "TBD",
  });

  const requiresCustomerSig = doc.type !== "pre_move_guide" && doc.type !== "final_invoice_receipt";
  const requiresForemanSig = doc.type === "bol" || doc.type === "start_job_agreement" || doc.type === "delivery_completion";

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b bg-white px-4 py-2 print:hidden">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={`/jobs/${id}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to job
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
            <img src="/brand/arsemia-mark.svg" alt="Arsemia" width={56} height={56} className="rounded-xl" />
            <div>
              <p className="text-xl font-bold tracking-tight">{COMPANY.dba}</p>
              <p className="text-[11px] text-slate-500">{COMPANY.name}</p>
              <p className="text-[10px] text-slate-500">
                {COMPANY.address} · {COMPANY.phone} · {COMPANY.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold uppercase tracking-wider text-slate-900">
              {doc.title}
            </p>
            <p className="font-mono text-[11px] text-slate-600">Job {id}</p>
            <p className="text-[10px] text-slate-500">
              v{1} · Generated {formatDateStable(doc.generatedAt)}
            </p>
            <p className="mt-1 inline-block rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {doc.status.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-xs sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Customer
            </p>
            <p className="mt-0.5 font-semibold">{customer}</p>
          </div>
          {foreman && (
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Foreman
              </p>
              <p className="mt-0.5 font-semibold">{foreman}</p>
            </div>
          )}
        </div>

        <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
          {body}
        </pre>

        {(requiresCustomerSig || requiresForemanSig) && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {requiresCustomerSig && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Customer signature
                </p>
                <div className="mt-6 border-b border-slate-400" />
                <p className="mt-1 text-[10px] text-slate-500">
                  {doc.signatures.find((s) => s.role === "customer")
                    ? `Signed by ${doc.signatures.find((s) => s.role === "customer")?.name} on ${formatDateStable(doc.signatures.find((s) => s.role === "customer")!.signedAt)}`
                    : "Sign on move day."}
                </p>
              </div>
            )}
            {requiresForemanSig && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Foreman signature
                </p>
                <div className="mt-6 border-b border-slate-400" />
                <p className="mt-1 text-[10px] text-slate-500">
                  {doc.signatures.find((s) => s.role === "foreman")
                    ? `Signed by ${doc.signatures.find((s) => s.role === "foreman")?.name} on ${formatDateStable(doc.signatures.find((s) => s.role === "foreman")!.signedAt)}`
                    : "Sign on move day."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-700">
          Template only — review with legal counsel before production use.
        </div>

        <div className="mt-6 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-500">
          {COMPANY.dba} · {COMPANY.phone} · {COMPANY.email}
        </div>
      </div>
    </div>
  );
}
