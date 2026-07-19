"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJobsStore } from "@/lib/store/jobs";
import { usePreferences } from "@/lib/store/preferences";
import { getActiveForemanId, getUserByRole } from "@/lib/auth/users";
import { fmtDate } from "@/lib/utils";

/**
 * Foreman Portal — minimal local confirm/decline of pending assignments
 * (Sprint 2.2). Updates the same jobs store the dispatcher's Assignments
 * board reads; everything is in-browser demo state, nothing is sent anywhere.
 */
export function PendingAssignments() {
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const jobs = useJobsStore((s) => s.jobs);
  const setJobAssignment = useJobsStore((s) => s.setJobAssignment);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  // Stores rehydrate from localStorage on the client — render after mount only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const foremanId = getActiveForemanId(activeRoleId);
  const me = getUserByRole(activeRoleId);

  const { pending, confirmed } = useMemo(() => {
    if (!foremanId) return { pending: [], confirmed: [] };
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
      // Only what dispatch actually SENT is pending for the foreman —
      // drafts and unsent changes are dispatcher-side state they never saw.
      pending: mine.filter((j) => j.assignment?.status === "Notified"),
      confirmed: mine.filter((j) => j.assignment?.status === "Confirmed"),
    };
  }, [jobs, foremanId]);

  if (!mounted || !foremanId) return null;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pending assignments</CardTitle>
        <CardDescription>
          Confirm or decline your upcoming jobs. This updates the dispatcher&apos;s board
          locally in this browser — demo only, nothing is sent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {pending.length === 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Nothing waiting on you{confirmed.length > 0 ? ` — ${confirmed.length} upcoming job${confirmed.length === 1 ? "" : "s"} confirmed.` : "."}
          </p>
        ) : (
          <ul className="space-y-2">
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
                      Confirm decline
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setDecliningId(null); setReason(""); }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => act(j.id, "Confirmed")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
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
      </CardContent>
    </Card>
  );
}
