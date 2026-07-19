"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Plus,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ADJUSTMENT_FLOW,
  useAdjustments,
  type AdjustmentStatus,
} from "@/lib/store/adjustments";
import { useNotifications } from "@/lib/store/notifications";
import { useJobsStore } from "@/lib/store/jobs";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<AdjustmentStatus, string> = {
  "Requested by Foreman":
    "bg-violet-500/15 text-violet-600 border-violet-500/30",
  "Pending Sales Review": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Sales Confirming with Foreman":
    "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Waiting for Client Payment":
    "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Paid / Approved":
    "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "Applied to Job": "bg-success/15 text-success border-success/30",
  "Rejected / Cancelled": "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

export function JobAdjustmentsPanel({ jobId }: { jobId: string }) {
  const allItems = useAdjustments((s) => s.items);
  const advance = useAdjustments((s) => s.advance);
  const reject = useAdjustments((s) => s.reject);
  const pushNotif = useNotifications((s) => s.push);

  const adjustments = useMemo(
    () =>
      allItems
        .filter((a) => a.jobId === jobId)
        .sort(
          (a, b) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime(),
        ),
    [allItems, jobId],
  );

  const [expanded, setExpanded] = useState<string | null>(
    adjustments[0]?.id ?? null,
  );

  const applyAdjustment = useJobsStore((s) => s.applyAdjustment);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);
  // Foreman requests adjustments in the field; advancing/rejecting the
  // review flow is a sales/admin action (Sprint 3 QA patch).
  const canReview = activeRoleId !== "foreman";

  const handleAdvance = (id: string, current: AdjustmentStatus) => {
    const idx = ADJUSTMENT_FLOW.indexOf(current);
    const next = ADJUSTMENT_FLOW[idx + 1];
    advance(id, actor.name);
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Adjustments",
      action: "status_changed",
      objectType: "Adjustment",
      objectId: id,
      title: `Adjustment ${id}: ${current} → ${next}.`,
      beforeValue: { status: current },
      afterValue: { status: next },
      metadata: { jobId },
      eventType: "adjustment_event",
      source: "owner_web",
      linkedType: "job",
      linkedId: jobId,
    });
    pushNotif({
      kind: "info",
      severity: "info",
      title: `Adjustment ${id} advanced`,
      body: `${current} → ${next}.`,
      href: `/jobs/${jobId}`,
    });

    // When advancing INTO "Applied to Job", actually update the job.
    if (next === "Applied to Job") {
      const adj = adjustments.find((a) => a.id === id);
      if (adj) {
        const updated = applyAdjustment(jobId, {
          extraCuFt: adj.extraCuFt,
          extraBill: adj.extraBill,
          adjustmentId: id,
        });
        if (updated) {
          pushActivity({
            actorId: actor.id,
            actorName: actor.name,
            actorRole: activeRoleId,
            module: "Jobs",
            action: "updated",
            objectType: "Job",
            objectId: jobId,
            title: `Job updated by adjustment ${id}: +${adj.extraCuFt} ft³, +${fmtUSD(adj.extraBill)}.`,
            beforeValue: { cuFt: adj.beforeCuFt, price: adj.beforeBill },
            afterValue: { cuFt: adj.afterCuFt, price: adj.afterBill },
            eventType: "adjustment_event",
            source: "owner_web",
            linkedType: "job",
            linkedId: jobId,
          });
        }
      }
    }
  };

  const handleReject = (id: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    reject(id, actor.name, reason);
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Adjustments",
      action: "rejected",
      objectType: "Adjustment",
      objectId: id,
      title: `Adjustment ${id} rejected: ${reason}`,
      notes: reason,
      metadata: { jobId },
      eventType: "adjustment_event",
      source: "owner_web",
      linkedType: "job",
      linkedId: jobId,
    });
    pushNotif({
      kind: "info",
      severity: "warning",
      title: `Adjustment ${id} rejected`,
      body: reason,
      href: `/jobs/${jobId}`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Adjustments
            {adjustments.length > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {adjustments.length}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            On-site requests from the foreman that change CuFt and bill.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {adjustments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
            No adjustments. When the foreman finds extra items on-site, the
            request will appear here.
          </p>
        ) : (
          adjustments.map((a) => {
            const isExpanded = expanded === a.id;
            const idx = ADJUSTMENT_FLOW.indexOf(a.status);
            const next = idx >= 0 ? ADJUSTMENT_FLOW[idx + 1] : null;
            const isTerminal =
              a.status === "Applied to Job" ||
              a.status === "Rejected / Cancelled";
            return (
              <div
                key={a.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : a.id)}
                  className="grid w-full grid-cols-12 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                >
                  <div className="col-span-12 flex items-center gap-3 sm:col-span-5">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full",
                        a.status === "Applied to Job"
                          ? "bg-success/15 text-success"
                          : a.status === "Rejected / Cancelled"
                            ? "bg-rose-500/15 text-rose-600"
                            : "bg-amber-500/15 text-amber-600",
                      )}
                    >
                      {a.status === "Applied to Job" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : a.status === "Rejected / Cancelled" ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {a.id} · +{a.extraCuFt} ft³ · +{fmtUSD(a.extraBill)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Requested by {a.requestedBy} ·{" "}
                        {new Date(a.requestedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-8 sm:col-span-5">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                        STATUS_STYLES[a.status],
                      )}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center justify-end sm:col-span-2">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90",
                      )}
                    />
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border/60 bg-muted/20 p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border bg-background p-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Before
                        </p>
                        <p className="mt-0.5 font-mono text-sm">
                          {a.beforeCuFt} ft³ · {fmtUSD(a.beforeBill)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-primary/40 bg-primary/[0.06] p-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          After
                        </p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-primary">
                          {a.afterCuFt} ft³ · {fmtUSD(a.afterBill)}
                        </p>
                      </div>
                    </div>

                    {a.items.length > 0 && (
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Items added
                        </p>
                        <div className="space-y-1">
                          {a.items.map((it, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-md bg-background px-3 py-1.5 text-xs"
                            >
                              <span>
                                {it.qty} × {it.name}
                                {it.cuft > 0 && (
                                  <span className="ml-2 text-muted-foreground">
                                    {it.qty * it.cuft} ft³
                                  </span>
                                )}
                              </span>
                              <span className="font-mono font-semibold">
                                {fmtUSD(it.qty * it.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {a.notes && (
                      <div className="rounded-md bg-background p-3 text-xs">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Notes
                        </p>
                        <p className="mt-1">{a.notes}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-1 text-[10px] text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">
                          Requested by:
                        </span>{" "}
                        {a.requestedBy} · {timeOf(a.requestedAt)}
                      </p>
                      {a.reviewedBy && (
                        <p>
                          <span className="font-semibold text-foreground">
                            Reviewed by:
                          </span>{" "}
                          {a.reviewedBy} · {timeOf(a.reviewedAt)}
                        </p>
                      )}
                      {a.approvedBy && (
                        <p>
                          <span className="font-semibold text-foreground">
                            Approved by:
                          </span>{" "}
                          {a.approvedBy} · {timeOf(a.approvedAt)}
                        </p>
                      )}
                      {a.paidAt && (
                        <p>
                          <span className="font-semibold text-foreground">
                            Paid:
                          </span>{" "}
                          {timeOf(a.paidAt)}
                        </p>
                      )}
                      {a.rejectReason && (
                        <p className="text-rose-600">
                          <span className="font-semibold">Rejected:</span>{" "}
                          {a.rejectReason}
                        </p>
                      )}
                    </div>

                    {!isTerminal && next && canReview && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleAdvance(a.id, a.status)}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                          Move to: {next}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleReject(a.id)}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {!isTerminal && next && !canReview && (
                      <p className="text-[10px] text-muted-foreground">
                        Waiting on sales/admin review — dispatch will follow up.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function timeOf(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
