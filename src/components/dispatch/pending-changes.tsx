"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJobsStore } from "@/lib/store/jobs";
import { useActivityLog } from "@/lib/store/activity-log";
import { useNotifications } from "@/lib/store/notifications";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { formatDateTimeStable } from "@/lib/dates";
import type { PendingReassignment } from "@/lib/store/jobs";

/**
 * Pending Dispatch Changes — every staged reassignment across the board in one
 * place. Confirm individually, confirm all, or cancel. Confirming writes the job
 * change + activity log + notification (the same effect as confirming in the
 * reassign modal), so there is one workflow, surfaced in two places.
 */
export function PendingDispatchChanges() {
  const pending = useJobsStore((s) => s.pendingReassignments);
  const jobs = useJobsStore((s) => s.jobs);
  const confirmPending = useJobsStore((s) => s.confirmPending);
  const cancelPending = useJobsStore((s) => s.cancelPending);
  const pushActivity = useActivityLog((s) => s.push);
  const pushNotif = useNotifications((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);
  const [collapsed, setCollapsed] = useState(false);

  if (pending.length === 0) return null;

  const customerFor = (jobId: string) => jobs.find((j) => j.id === jobId)?.customer ?? "—";

  const doConfirm = (p: PendingReassignment) => {
    const done = confirmPending(p.jobId);
    if (!done) return;
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Dispatch",
      action: "reassigned",
      objectType: "Job",
      objectId: p.jobId,
      title: `Job ${p.jobId} reassigned`,
      beforeValue: { foreman: p.fromDriverName ?? null },
      afterValue: { foreman: p.toDriverName ?? null, reason: p.reason },
    });
    pushNotif({
      kind: "job_reassigned",
      severity: "info",
      title: `Job ${p.jobId} reassigned`,
      body: `${p.fromDriverName ?? "Unassigned"} → ${p.toDriverName ?? "Unassigned"}.`,
      href: `/jobs/${p.jobId}`,
    });
  };

  const doCancel = (p: PendingReassignment) => {
    cancelPending(p.jobId);
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Dispatch",
      action: "updated",
      objectType: "Job",
      objectId: p.jobId,
      title: `Pending reassignment cancelled for ${p.jobId}`,
    });
  };

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.04] shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 px-4 py-2.5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <Clock className="h-4 w-4 text-amber-600" />
          Pending Dispatch Changes
          <Badge variant="warning">{pending.length}</Badge>
          <span className="text-[10px] font-normal text-muted-foreground">
            {collapsed ? "show" : "hide"}
          </span>
        </button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => pending.forEach(doCancel)}
          >
            Cancel all
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={() => [...pending].forEach(doConfirm)}>
            Confirm all
          </Button>
        </div>
      </div>

      {!collapsed && (
        <ul className="divide-y divide-amber-500/15">
          {pending.map((p) => (
            <li key={p.jobId} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-xs">
              <span className="font-mono font-semibold">{p.jobId}</span>
              <span className="flex-1 truncate">{customerFor(p.jobId)}</span>
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{p.fromDriverName ?? "Unassigned"}</span>
                {" → "}
                <span className="font-medium text-foreground">{p.toDriverName ?? "Unassigned"}</span>
              </span>
              <Badge variant="outline" className="text-[10px]">{p.reason ?? "—"}</Badge>
              <span className="text-[10px] text-muted-foreground">
                by {p.stagedBy} · {formatDateTimeStable(p.stagedAt, { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
              </span>
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => doCancel(p)}>
                  Cancel
                </Button>
                <Button size="sm" className="h-6 px-2 text-[11px]" onClick={() => doConfirm(p)}>
                  Confirm
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
