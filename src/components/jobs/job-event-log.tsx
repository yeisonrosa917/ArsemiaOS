"use client";

import { useMemo } from "react";
import {
  BellRing,
  CheckCircle2,
  FileText,
  History,
  Plus,
  RefreshCw,
  Send,
  Truck,
  Undo2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useActivityLog,
  timelineForJob,
  readLegacyJobEvents,
} from "@/lib/store/activity-log";
import { humanizeActivity } from "@/lib/activity/humanize";
import type { ActivityEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Job timeline (Sprint 3) — ONE chronological stream for this job, read from
 * the unified event store. Newest first, human language, actor + source +
 * timestamp on every row. Entries from the retired job-events store are
 * merged read-only so older browsers keep their history.
 */

const EVENT_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  job_created: { icon: Plus, color: "text-blue-600 bg-blue-500/15" },
  assignment_drafted: { icon: Truck, color: "text-slate-600 bg-slate-500/15" },
  assignment_sent: { icon: BellRing, color: "text-sky-600 bg-sky-500/15" },
  assignment_update_sent: { icon: Send, color: "text-sky-600 bg-sky-500/15" },
  assignment_accepted_by_foreman: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/15" },
  assignment_dispatch_override: { icon: CheckCircle2, color: "text-amber-600 bg-amber-500/15" },
  // Pre-QA-patch event type names (still present in persisted entries).
  assignment_confirmed_by_foreman: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/15" },
  assignment_confirmed_by_dispatch: { icon: CheckCircle2, color: "text-teal-600 bg-teal-500/15" },
  assignment_declined_by_foreman: { icon: XCircle, color: "text-rose-600 bg-rose-500/15" },
  assignment_unconfirmed: { icon: Undo2, color: "text-slate-600 bg-slate-500/15" },
  assignment_changed_after_sent: { icon: RefreshCw, color: "text-amber-600 bg-amber-500/15" },
  job_reassigned: { icon: RefreshCw, color: "text-amber-600 bg-amber-500/15" },
  truck_changed: { icon: Truck, color: "text-cyan-600 bg-cyan-500/15" },
  job_updated: { icon: FileText, color: "text-slate-600 bg-slate-500/15" },
  warehouse_preload_completed: { icon: CheckCircle2, color: "text-violet-600 bg-violet-500/15" },
  warehouse_preload_skipped: { icon: XCircle, color: "text-slate-600 bg-slate-500/15" },
  document_event: { icon: FileText, color: "text-blue-600 bg-blue-500/15" },
  adjustment_event: { icon: FileText, color: "text-violet-600 bg-violet-500/15" },
};

const FALLBACK_META = { icon: History, color: "text-slate-600 bg-slate-500/15" };

const SOURCE_LABEL: Record<string, string> = {
  owner_web: "Owner Web",
  foreman_portal: "Foreman Portal",
  system: "System",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface Row {
  id: string;
  ts: string;
  eventType?: string;
  message: string;
  actor?: string;
  source?: string;
  legacy?: boolean;
}

function rowFromEntry(e: ActivityEntry): Row {
  return {
    id: e.id,
    ts: e.timestamp,
    eventType: e.eventType,
    // Unified entries store the human sentence as the title; older entries
    // go through the legacy humanizer.
    message: e.eventType ? e.title : humanizeActivity(e),
    actor: e.actorName,
    source: e.source,
  };
}

export function JobEventLog({ jobId }: { jobId: string }) {
  const entries = useActivityLog((s) => s.entries);

  const rows = useMemo(() => {
    const unified = timelineForJob(entries, jobId).map(rowFromEntry);
    // Read-only merge of pre-Sprint-3 job-events history (deduped by message
    // when the same moment was dual-written to both old stores).
    const seen = new Set(unified.map((r) => `${r.ts.slice(0, 16)}|${r.message}`));
    const legacy = readLegacyJobEvents(jobId)
      .filter((e) => !seen.has(`${e.createdAt.slice(0, 16)}|${e.message}`))
      .map<Row>((e) => ({
        id: `legacy_${e.id}`,
        ts: e.createdAt,
        message: e.message,
        actor: e.actor,
        legacy: true,
      }));
    return [...unified, ...legacy].sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
    );
  }, [entries, jobId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Timeline
        </CardTitle>
        <CardDescription>
          Every change to this job — who, when, what, and where it came from.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
            No activity recorded yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const meta = (row.eventType && EVENT_META[row.eventType]) || FALLBACK_META;
              const Icon = meta.icon;
              return (
                <li key={row.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        meta.color,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-xs font-semibold leading-tight">{row.message}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {row.actor && <span className="font-medium">{row.actor}</span>}
                      {row.actor && " · "}
                      {row.source && SOURCE_LABEL[row.source] && (
                        <>
                          {SOURCE_LABEL[row.source]}
                          {" · "}
                        </>
                      )}
                      {timeAgo(row.ts)} ·{" "}
                      {new Date(row.ts).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {row.legacy && " · earlier history"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
