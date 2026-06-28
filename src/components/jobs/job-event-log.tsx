"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  FileText,
  History,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useJobEvents, type JobEventType } from "@/lib/store/job-events";
import { cn } from "@/lib/utils";

const EVENT_META: Record<
  JobEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  created: { icon: Plus, color: "text-blue-600 bg-blue-500/15" },
  assigned: { icon: Truck, color: "text-cyan-600 bg-cyan-500/15" },
  reassigned: { icon: RefreshCw, color: "text-amber-600 bg-amber-500/15" },
  status_changed: { icon: RefreshCw, color: "text-violet-600 bg-violet-500/15" },
  edited: { icon: FileText, color: "text-slate-600 bg-slate-500/15" },
  confirmed_by_customer: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/15" },
  confirmed_by_foreman: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/15" },
  coi_submitted: { icon: Mail, color: "text-blue-600 bg-blue-500/15" },
  adjustment_added: { icon: ShieldCheck, color: "text-amber-600 bg-amber-500/15" },
  note_added: { icon: MessageSquare, color: "text-slate-600 bg-slate-500/15" },
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

export function JobEventLog({ jobId }: { jobId: string }) {
  const allEvents = useJobEvents((s) => s.events);
  const events = useMemo(
    () =>
      allEvents
        .filter((ev) => ev.jobId === jobId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [allEvents, jobId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Activity log
        </CardTitle>
        <CardDescription>
          Audit trail. Every change to this job — who, when, what.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
            No activity recorded yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => {
              const meta = EVENT_META[ev.type];
              const Icon = meta.icon;
              return (
                <li key={ev.id} className="flex gap-3">
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
                    <p className="text-xs font-semibold leading-tight">
                      {ev.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      <span className="font-medium">{ev.actor}</span> ·{" "}
                      {timeAgo(ev.createdAt)} ·{" "}
                      {new Date(ev.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
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
