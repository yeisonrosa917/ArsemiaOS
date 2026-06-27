"use client";

import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Briefcase,
  Clock,
  FileSignature,
  History,
  Truck,
  UserCog,
  Wallet,
  X,
} from "lucide-react";
import { useActivityLog } from "@/lib/store/activity-log";
import { useJobEvents } from "@/lib/store/job-events";
import { useJobDocuments } from "@/lib/store/job-documents";
import { useInvoices } from "@/lib/store/invoices";
import { useClaims } from "@/lib/store/claims";
import { useExpenses } from "@/lib/store/expenses";
import { humanizeActivity } from "@/lib/activity/humanize";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  ts: string;
  source: "activity" | "event" | "document" | "invoice" | "claim" | "expense";
  message: string;
  actor?: string;
}

function timeFmt(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  return sameDay
    ? `Today · ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
    : d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function sourceIcon(source: TimelineEntry["source"]) {
  switch (source) {
    case "activity":
      return UserCog;
    case "event":
      return Briefcase;
    case "document":
      return FileSignature;
    case "invoice":
      return Wallet;
    case "claim":
      return Truck;
    case "expense":
      return Wallet;
    default:
      return Clock;
  }
}

export function JobHistoryDrawer({
  jobId,
  open,
  onOpenChange,
}: {
  jobId: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const activity = useActivityLog((s) => s.entries);
  const events = useJobEvents((s) => s.events);
  const documents = useJobDocuments((s) => s.items);
  const invoices = useInvoices((s) => s.items);
  const claims = useClaims((s) => s.items);
  const expenses = useExpenses((s) => s.items);

  const entries: TimelineEntry[] = useMemo(() => {
    const list: TimelineEntry[] = [];

    activity
      .filter((a) => a.objectId === jobId || a.metadata?.jobId === jobId)
      .forEach((a) =>
        list.push({
          ts: a.timestamp,
          source: "activity",
          message: humanizeActivity(a),
          actor: a.actorName,
        }),
      );

    events
      .filter((e) => e.jobId === jobId)
      .forEach((e) =>
        list.push({
          ts: e.createdAt,
          source: "event",
          message: e.message,
          actor: e.actor,
        }),
      );

    documents
      .filter((d) => d.jobId === jobId)
      .forEach((d) => {
        list.push({
          ts: d.generatedAt,
          source: "document",
          message: `${d.title} generated.`,
        });
        if (d.sentAt) {
          list.push({
            ts: d.sentAt,
            source: "document",
            message: `${d.title} marked as sent.`,
          });
        }
        d.signatures.forEach((sg) =>
          list.push({
            ts: sg.signedAt,
            source: "document",
            message: `${sg.role === "customer" ? "Customer" : "Foreman"} (${sg.name}) signed ${d.title}.`,
          }),
        );
        if (d.status === "voided") {
          list.push({
            ts: d.generatedAt,
            source: "document",
            message: `${d.title} was voided.`,
          });
        }
      });

    invoices
      .filter((i) => i.jobId === jobId)
      .forEach((i) => {
        list.push({
          ts: i.issueDate,
          source: "invoice",
          message: `Invoice ${i.id} created — ${i.status}.`,
        });
        if (i.paidDate) {
          list.push({
            ts: i.paidDate,
            source: "invoice",
            message: `Invoice ${i.id} marked Paid.`,
          });
        }
      });

    claims
      .filter((c) => c.jobId === jobId)
      .forEach((c) =>
        list.push({
          ts: c.openedAt ?? new Date().toISOString(),
          source: "claim",
          message: `Claim ${c.id} opened — ${c.claimType}.`,
        }),
      );

    expenses
      .filter((e) => e.jobId === jobId)
      .forEach((e) =>
        list.push({
          ts: e.date,
          source: "expense",
          message: `Expense ${e.id} (${e.category}) submitted by ${e.foremanName}.`,
          actor: e.foremanName,
        }),
      );

    return list.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [activity, events, documents, invoices, claims, expenses, jobId]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-screen w-[92vw] max-w-[480px] overflow-hidden border-l border-border bg-popover shadow-elevated">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-base font-semibold">
              <History className="h-4 w-4 text-primary" />
              Job History · {jobId}
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 hover:bg-accent">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="border-b px-4 py-2 text-[11px] text-muted-foreground">
            Plain-English timeline pulled from every store this job touches.
          </Dialog.Description>

          <div className="h-[calc(100vh-100px)] overflow-y-auto p-4">
            {entries.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
                No activity recorded for this job yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {entries.map((e, i) => {
                  const Icon = sourceIcon(e.source);
                  return (
                    <li
                      key={i}
                      className={cn(
                        "rounded-lg border border-border bg-background p-2.5 text-xs",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="leading-snug">{e.message}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {timeFmt(e.ts)}
                            {e.actor && ` · ${e.actor}`}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
