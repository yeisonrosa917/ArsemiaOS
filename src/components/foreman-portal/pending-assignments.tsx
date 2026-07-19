"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, UserRound, Warehouse, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJobsStore } from "@/lib/store/jobs";
import { usePreloadTasks, PRELOAD_STATUS_STYLE } from "@/lib/store/preload-tasks";
import { usePreferences } from "@/lib/store/preferences";
import { getActiveForemanId, getUserByRole } from "@/lib/auth/users";
import { fmtDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Foreman Portal — temporary web placeholder until the mobile Foreman App
 * ships (Sprint 3 QA patch). Execution-only surface for the linked foreman:
 * accept/decline what dispatch SENT, see upcoming accepted work and
 * warehouse preload tasks. Everything is local demo state; nothing is sent
 * anywhere. Acceptance here is the ONLY way an assignment becomes
 * "Accepted by foreman".
 */
export function PendingAssignments() {
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const jobs = useJobsStore((s) => s.jobs);
  const setJobAssignment = useJobsStore((s) => s.setJobAssignment);
  const preloadTasks = usePreloadTasks((s) => s.tasks);
  const setPreloadStatus = usePreloadTasks((s) => s.setStatus);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  // Stores rehydrate from localStorage on the client — render after mount only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const foremanId = getActiveForemanId(activeRoleId);
  const me = getUserByRole(activeRoleId);

  const { pending, upcoming, myPreloads } = useMemo(() => {
    if (!foremanId) return { pending: [], upcoming: [], myPreloads: [] };
    const todayIso = new Date().toISOString().slice(0, 10);
    const mine = jobs
      .filter(
        (j) =>
          j.driverId === foremanId &&
          (j.scheduledAt ?? "").slice(0, 10) >= todayIso &&
          j.status !== "Cancelled" &&
          j.status !== "Completed",
      )
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    return {
      // Only what dispatch actually SENT is waiting on the foreman —
      // drafts and unsent changes are dispatcher-side state they never saw.
      pending: mine.filter((j) => j.assignment?.status === "Notified"),
      upcoming: mine.filter((j) => j.assignment?.status === "Confirmed"),
      myPreloads: preloadTasks
        .filter(
          (t) =>
            t.foremanId === foremanId &&
            t.date >= todayIso &&
            (t.status === "Assigned" || t.status === "Needed"),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, [jobs, preloadTasks, foremanId]);

  if (!mounted) return null;

  // Foreman role without a linked FM-#### record: explain, don't pretend.
  if (activeRoleId === "foreman" && !foremanId) {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <UserRound className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">This user is not linked to a foreman profile yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask an admin to connect this user to a foreman record (FM-####) in
              Settings → Users &amp; access. Until then, no assignments can be shown.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!foremanId) return null;

  const act = (jobId: string, status: "Confirmed" | "Declined", declineReason?: string) => {
    // The store writes the unified timeline event (source: foreman_portal).
    setJobAssignment(jobId, status, {
      by: me.name,
      reason: declineReason?.trim() || undefined,
      source: "foreman",
      actorId: me.id,
      actorRole: me.roleId,
    });
    setDecliningId(null);
    setReason("");
  };

  const portalCtx = {
    actorId: me.id,
    actorName: me.name,
    actorRole: me.roleId,
    source: "foreman_portal" as const,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>Your assignments</span>
          <Badge variant="outline" className="gap-1 text-[10px] font-normal">
            <UserRound className="h-3 w-3" /> {me.name} · {foremanId}
          </Badge>
        </CardTitle>
        <CardDescription>
          Accepting or declining here updates the dispatcher&apos;s board locally in
          this browser — demo only, nothing is sent. Only jobs dispatch has
          SENT appear below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Waiting for your response */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Waiting for your response ({pending.length})
          </p>
          {pending.length === 0 ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              No assignments are waiting for your response.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-2">
              {pending.map((j) => (
                <li key={j.id} className="rounded-xl border border-border/70 bg-background p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold">
                        {fmtDate(j.scheduledAt, { month: "short", day: "numeric" })} · {j.scheduledAt.slice(11, 16)}
                      </span>
                      <Link href={`/jobs/${j.id}`} className="font-mono text-muted-foreground hover:underline">
                        {j.id}
                      </Link>
                      <Badge variant="outline" className="text-[9px]">{j.type}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {j.cuFt} cuft · {j.zone}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {j.pickup} → {j.delivery}
                  </p>
                  {decliningId === j.id ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="h-8 max-w-xs text-xs"
                      />
                      <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => act(j.id, "Declined", reason)}>
                        Decline assignment
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setDecliningId(null); setReason(""); }}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => act(j.id, "Confirmed")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setDecliningId(j.id)}>
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Warehouse preload tasks */}
        {myPreloads.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Operational tasks ({myPreloads.length})
            </p>
            <ul className="mt-1.5 space-y-2">
              {myPreloads.map((t) => (
                <li key={t.id} className="rounded-xl border border-violet-500/40 bg-violet-500/[0.05] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex min-w-0 items-start gap-1.5 text-xs text-violet-700 dark:text-violet-300">
                      <Warehouse className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Load at {t.warehouse} on{" "}
                        <span className="font-semibold">{fmtDate(t.date, { weekday: "short", month: "short", day: "numeric" })}</span>{" "}
                        for delivery{" "}
                        <Link href={`/jobs/${t.deliveryJobId}`} className="font-mono hover:underline">
                          {t.deliveryJobId}
                        </Link>{" "}
                        on {fmtDate(t.deliveryDate, { month: "short", day: "numeric" })}. Load before leaving that day.
                      </span>
                    </p>
                    <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold", PRELOAD_STATUS_STYLE[t.status])}>
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => setPreloadStatus(t.id, "Completed", portalCtx)}
                    >
                      Mark loaded
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming accepted */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming accepted ({upcoming.length})
          </p>
          {upcoming.length === 0 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">No upcoming accepted assignments yet.</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {upcoming.slice(0, 6).map((j) => (
                <li key={j.id} className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-[11px]">
                  <span className="font-mono font-semibold">
                    {fmtDate(j.scheduledAt, { month: "short", day: "numeric" })} · {j.scheduledAt.slice(11, 16)}
                  </span>
                  <Link href={`/jobs/${j.id}`} className="font-mono text-muted-foreground hover:underline">
                    {j.id}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {j.type} · {j.cuFt} cuft
                  </span>
                  <Badge variant="success" className="text-[9px]">Accepted</Badge>
                </li>
              ))}
              {upcoming.length > 6 && (
                <li className="px-2 text-[10px] text-muted-foreground">
                  +{upcoming.length - 6} more — see{" "}
                  <Link href="/jobs" className="text-primary hover:underline">My jobs</Link>.
                </li>
              )}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
