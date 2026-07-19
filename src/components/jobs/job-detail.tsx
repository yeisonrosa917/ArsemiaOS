"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  DollarSign,
  History,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  Truck,
  UserCog,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { drivers as seedDrivers } from "@/lib/data";
import type { BuildingDetails, Job, JobInventoryItem } from "@/lib/types";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { useLeads } from "@/lib/store/leads";
import { useQuotesStore } from "@/lib/store/quotes";
import { useStorage, isItemFlagged } from "@/lib/store/storage";
import { useClaims } from "@/lib/store/claims";
import { useNotifications } from "@/lib/store/notifications";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole, getActiveForemanId } from "@/lib/auth/users";
import { JobEventLog } from "./job-event-log";
import { JobAdjustmentsPanel } from "./job-adjustments-panel";
import { JobDocumentsPanel } from "./job-documents-panel";
import { JobHistoryDrawer } from "./job-history-drawer";
import { ReassignModal } from "./reassign-modal";
import { fmtUSD } from "@/lib/calculator/engine";
import {
  vehicleCapacity,
  capacityLevel,
  capacityMessage,
  CAPACITY_STYLES,
  CAPACITY_LABEL,
} from "@/lib/fleet/capacity";
import { cn, mapsHref, telHref } from "@/lib/utils";
import { formatDateStable } from "@/lib/dates";

const CONTRACTOR_COMPANIES: Record<string, { company: string; commissionPct: number }> = {
  "FM-1042": { company: "Arsemia LLC", commissionPct: 33.5 },
  "FM-1043": { company: "Hernandez Moving Co.", commissionPct: 32 },
  "FM-1044": { company: "—", commissionPct: 30 },
  "FM-1045": { company: "Volkov Logistics LLC", commissionPct: 33.5 },
  "FM-1046": { company: "Carter Bros Movers", commissionPct: 33.5 },
  "FM-1047": { company: "—", commissionPct: 30 },
  "FM-1048": { company: "Shankar Long Haul LLC", commissionPct: 33.5 },
};

const STATUS_COLORS: Record<string, string> = {
  Unassigned: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Assigned: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "En Route": "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  "Pickup Started": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Pickup Completed": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Delivery Started": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Completed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Cancelled: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

export function JobDetail({ job: initial }: { job: Job }) {
  const updateJob = useJobsStore((s) => s.updateJob);
  const cancelPending = useJobsStore((s) => s.cancelPending);
  const confirmPending = useJobsStore((s) => s.confirmPending);
  const currentJob = useJobsStore((s) => s.jobs.find((j) => j.id === initial.id)) ?? initial;
  const pendingForJob = useJobsStore((s) =>
    s.pendingReassignments.find((p) => p.jobId === initial.id),
  );
  const job = currentJob;
  const pushNotif = useNotifications((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const detailActor = getUserByRole(activeRoleId);
  const eventCtx = {
    actorId: detailActor.id,
    actorName: detailActor.name,
    actorRole: activeRoleId,
    source: "owner_web" as const,
  };
  // Foreman is execution-only (Sprint 3 QA patch): read-only field view, no
  // core-data edits, no transfer/reassign, no admin document actions.
  const isForeman = activeRoleId === "foreman";
  const canEdit = !isForeman;
  const myForemanId = getActiveForemanId(activeRoleId);
  const contractor = job.driverId ? CONTRACTOR_COMPANIES[job.driverId] : undefined;

  // Assigned truck capacity vs this job's CuFt.
  const fleetVehicles = useFleet((s) => s.vehicles);
  const assignedTruck = (() => {
    if (!job.driverId) return undefined;
    const d = seedDrivers.find((x) => x.id === job.driverId);
    return d ? fleetVehicles.find((v) => v.id === d.vehicleId) : undefined;
  })();
  const jobCap = assignedTruck ? vehicleCapacity(assignedTruck) : null;
  const jobCapLevel = jobCap ? capacityLevel(job.cuFt, jobCap) : null;

  const [editingInv, setEditingInv] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  const totalCuft = useMemo(
    () =>
      (job.inventoryItems ?? []).reduce(
        (acc, it) => acc + it.qty * it.cuft,
        0,
      ),
    [job.inventoryItems],
  );

  const totalServices = useMemo(
    () =>
      (job.additionalServices ?? []).reduce((acc, s) => acc + s.price, 0),
    [job.additionalServices],
  );

  const handleConfirmPending = () => {
    // The store routes this through the lifecycle-aware mutations and
    // writes the timeline event itself.
    const p = confirmPending(job.id, eventCtx);
    if (!p) return;
    pushNotif({
      kind: "job_reassigned",
      severity: "info",
      title: `Job ${job.id} reassigned`,
      body: p.toDriverName
        ? `${p.fromDriverName ?? "—"} → ${p.toDriverName}.`
        : `Unassigned from ${p.fromDriverName ?? "—"}.`,
      href: `/jobs/${job.id}`,
    });
  };

  const handleCancelPending = () => {
    if (!pendingForJob) return;
    cancelPending(job.id, eventCtx);
  };

  const updateBuilding = (which: "pickupBuilding" | "deliveryBuilding", patch: Partial<BuildingDetails>) => {
    if (!canEdit) return;
    const existing = (job[which] ?? { type: "Apartment" }) as BuildingDetails;
    updateJob(job.id, { [which]: { ...existing, ...patch } } as Partial<Job>);
  };

  const updateInventoryItem = (idx: number, patch: Partial<JobInventoryItem>) => {
    if (!canEdit) return;
    const inv = [...(job.inventoryItems ?? [])];
    inv[idx] = { ...inv[idx], ...patch };
    updateJob(job.id, { inventoryItems: inv });
  };

  const removeInventoryItem = (idx: number) => {
    if (!canEdit) return;
    const inv = (job.inventoryItems ?? []).filter((_, i) => i !== idx);
    updateJob(job.id, { inventoryItems: inv });
  };

  const addInventoryItem = () => {
    if (!canEdit) return;
    const inv = [
      ...(job.inventoryItems ?? []),
      { name: "New item", qty: 1, cuft: 5 },
    ];
    updateJob(job.id, { inventoryItems: inv });
  };

  // End-to-end lifecycle indicator — shows the customer journey from
  // booking to invoice paid. Each step infers its completion from the data
  // already tracked elsewhere (job status, foreman assignment, signed docs,
  // linked invoice). No new state, no decorative count.
  const lifecycleSteps = [
    {
      label: "Booked",
      done: true,
    },
    {
      label: "Foreman assigned",
      done: Boolean(job.driverId),
    },
    {
      label: "On the way",
      done: ["En Route", "On Site", "In Transit", "Delivering", "Completed"].includes(job.status),
    },
    {
      label: "Job in progress",
      done: ["On Site", "In Transit", "Delivering", "Completed"].includes(job.status),
    },
    {
      label: "Delivered",
      done: ["Delivering", "Completed"].includes(job.status) || job.status === "Completed",
    },
    {
      label: "Invoiced",
      done: ["Completed"].includes(job.status),
    },
  ];

  // A foreman may only open their own assigned jobs.
  if (isForeman && job.driverId !== myForemanId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm font-semibold">This job is not assigned to you.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You can only open jobs on your own schedule. Go back to{" "}
            <Link href="/jobs" className="text-primary hover:underline">My jobs</Link> or the{" "}
            <Link href="/foreman-portal" className="text-primary hover:underline">Foreman Portal</Link>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isForeman && (
        <p className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          Field view — read-only. You can review everything needed for execution;
          changes to job, customer, or pricing data are made by dispatch/admin.
        </p>
      )}
      {/* Header */}
      <Card className="border-primary/20">
        <CardContent className="grid gap-4 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs text-muted-foreground">{job.id}</p>
              <Badge className={cn("border", STATUS_COLORS[job.status])}>
                {job.status}
              </Badge>
              <Badge variant="outline">{job.type}</Badge>
              {job.bedrooms && <Badge variant="outline">{job.bedrooms}</Badge>}
              {job.priority === "High" && (
                <Badge variant="danger">High priority</Badge>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-bold">{job.customer}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <a href={telHref(job.customerPhone)} className="flex items-center gap-1.5 hover:text-foreground hover:underline">
                <Phone className="h-3 w-3" /> {job.customerPhone}
              </a>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3 w-3" />
                {new Date(job.scheduledAt).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {job.eta && (
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3 w-3" /> ETA {job.eta}
                </span>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-2">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="h-3.5 w-3.5" />
                Job History
              </Button>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setReassignOpen(true)}
                >
                  <UserCog className="h-3.5 w-3.5" />
                  Transfer / Reassign
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat
                label="Price"
                value={fmtUSD(job.price)}
                icon={DollarSign}
                primary
              />
              <Stat label="CuFt" value={String(job.cuFt)} />
              <Stat
                label="Miles"
                value={job.miles.toFixed(1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <JobHistoryDrawer
        jobId={job.id}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
      {canEdit && (
        <ReassignModal
          job={job}
          open={reassignOpen}
          onOpenChange={setReassignOpen}
        />
      )}

      {/* Lifecycle strip — customer journey from call to invoice */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {lifecycleSteps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[10px] font-semibold",
                    s.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {s.done ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-[11px] font-medium",
                    s.done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {i < lifecycleSteps.length - 1 && (
                  <span
                    className={cn(
                      "h-px w-4 sm:w-6",
                      s.done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <JobConnections job={job} />
          {/* Addresses + buildings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" /> Addresses & buildings
              </CardTitle>
              <CardDescription>
                {canEdit
                  ? "Editable. Building requirements flow to the foreman app."
                  : "Read-only — building requirements for your move."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <AddressBlock
                label="Pickup"
                address={job.pickup}
                onAddressChange={canEdit ? (v) => updateJob(job.id, { pickup: v }) : undefined}
                building={job.pickupBuilding}
                onBuildingChange={(p) => updateBuilding("pickupBuilding", p)}
                readOnly={!canEdit}
              />
              <AddressBlock
                label="Delivery"
                address={job.delivery}
                onAddressChange={canEdit ? (v) => updateJob(job.id, { delivery: v }) : undefined}
                building={job.deliveryBuilding}
                onBuildingChange={(p) => updateBuilding("deliveryBuilding", p)}
                readOnly={!canEdit}
              />
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-4 w-4 text-primary" /> Inventory
                </CardTitle>
                <CardDescription>
                  {(job.inventoryItems ?? []).length} items · {totalCuft} ft³ total
                </CardDescription>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <Button
                    variant={editingInv ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditingInv((v) => !v)}
                  >
                    {editingInv ? "Done" : "Edit"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={addInventoryItem} className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {(job.inventoryItems ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
                  No inventory items yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-right">CuFt</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                        <th className="p-2.5">Pack</th>
                        {editingInv && <th className="p-2.5"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(job.inventoryItems ?? []).map((it, idx) => (
                        <tr key={idx} className="border-t border-border/60">
                          <td className="p-2.5">
                            {editingInv ? (
                              <Input
                                value={it.name}
                                onChange={(e) =>
                                  updateInventoryItem(idx, { name: e.target.value })
                                }
                                className="h-7 text-xs"
                              />
                            ) : (
                              <span className="font-medium">{it.name}</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs">
                            {editingInv ? (
                              <Input
                                type="number"
                                value={it.cuft}
                                onChange={(e) =>
                                  updateInventoryItem(idx, {
                                    cuft: Number(e.target.value) || 0,
                                  })
                                }
                                className="ml-auto h-7 w-16 text-right text-xs"
                              />
                            ) : (
                              it.cuft
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs">
                            {editingInv ? (
                              <Input
                                type="number"
                                value={it.qty}
                                onChange={(e) =>
                                  updateInventoryItem(idx, {
                                    qty: Number(e.target.value) || 0,
                                  })
                                }
                                className="ml-auto h-7 w-14 text-right text-xs"
                              />
                            ) : (
                              it.qty
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs">
                            {(it.qty * it.cuft).toFixed(0)} ft³
                          </td>
                          <td className="p-2.5">
                            <button
                              onClick={() =>
                                updateInventoryItem(idx, { packByCrew: !it.packByCrew })
                              }
                              disabled={!canEdit}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                                it.packByCrew
                                  ? "bg-success/15 text-success"
                                  : "bg-muted text-muted-foreground",
                                canEdit && !it.packByCrew && "hover:bg-accent",
                                !canEdit && "cursor-default",
                              )}
                            >
                              {it.packByCrew ? "✓ Crew" : "—"}
                            </button>
                          </td>
                          {editingInv && (
                            <td className="p-2.5">
                              <button
                                onClick={() => removeInventoryItem(idx)}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional services</CardTitle>
              <CardDescription>
                Stairs, long carry, packing, handling — anything beyond CuFt + miles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(job.additionalServices ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                  No additional services on this job.
                </p>
              ) : (
                (job.additionalServices ?? []).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span>{s.name}</span>
                    <span className="font-mono font-semibold">{fmtUSD(s.price)}</span>
                  </div>
                ))
              )}
              {totalServices > 0 && (
                <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm font-semibold">
                  <span>Services subtotal</span>
                  <span className="font-mono">{fmtUSD(totalServices)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={job.notes ?? ""}
                onChange={(e) => canEdit && updateJob(job.id, { notes: e.target.value })}
                readOnly={!canEdit}
                placeholder={
                  canEdit
                    ? "Foreman-facing notes — building access, fragile items, customer preferences..."
                    : "No field notes for this job."
                }
                className={cn(
                  "min-h-24 w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none",
                  canEdit && "focus:border-primary",
                )}
              />
            </CardContent>
          </Card>

          {/* On-site adjustments — submitted by foreman */}
          <JobAdjustmentsPanel jobId={job.id} />
        </div>

        <div className="space-y-4">
          {/* Pending reassignment banner */}
          {pendingForJob && (
            <Card className="border-amber-500/50 bg-amber-500/[0.06]">
              <CardContent className="space-y-3 p-3">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">Pending reassignment</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">
                        {pendingForJob.fromDriverName ?? "—"}
                      </span>{" "}
                      →{" "}
                      <span className="font-medium">
                        {pendingForJob.toDriverName ?? "Unassigned"}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Staged by {pendingForJob.stagedBy} ·{" "}
                      {new Date(pendingForJob.stagedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1" onClick={handleConfirmPending}>
                      <Check className="h-3.5 w-3.5" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelPending}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Foreman + contractor + truck */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-primary" /> Foreman & truck
              </CardTitle>
              <CardDescription>
                Single point of contact for this job. Helpers are managed by
                the contractor company, not the hub.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned foreman
                </p>
                {job.driverName ? (
                  <div className="mt-1 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold">{job.driverName}</p>
                      <p className="text-[10px] text-muted-foreground">{job.driverId}</p>
                    </div>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={!!pendingForJob}
                        onClick={() => setReassignOpen(true)}
                      >
                        Reassign
                      </Button>
                    )}
                  </div>
                ) : canEdit ? (
                  <Button
                    variant="outline"
                    className="mt-1 w-full"
                    disabled={!!pendingForJob}
                    onClick={() => setReassignOpen(true)}
                  >
                    Assign foreman
                  </Button>
                ) : (
                  <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    No foreman assigned yet.
                  </p>
                )}

                {/* Assigned truck capacity status */}
                {assignedTruck && jobCap && jobCapLevel && (
                  <div className={cn("mt-2 rounded-md border px-2 py-1.5 text-[11px]", CAPACITY_STYLES[jobCapLevel])}>
                    <span className="font-semibold">Truck capacity: {CAPACITY_LABEL[jobCapLevel]}</span>
                    <span className="mt-0.5 block">{capacityMessage(job.cuFt, jobCap, assignedTruck.name)}</span>
                  </div>
                )}
              </div>
              {contractor && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Contractor company
                      </p>
                      <p className="mt-0.5 text-xs font-semibold">{contractor.company}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Commission
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-semibold">
                        {contractor.commissionPct}%
                      </p>
                    </div>
                  </div>
                </>
              )}

              {job.driverId && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Truck
                    </p>
                    <p className="mt-0.5 text-xs font-semibold">
                      {seedDrivers.find((d) => d.id === job.driverId)?.vehicleName ?? "—"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Confirmations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Check className="h-4 w-4 text-primary" /> Confirmations
              </CardTitle>
            </CardHeader>
            <CardContent className={cn("space-y-2", !canEdit && "pointer-events-none opacity-90")}>
              <ConfirmRow
                label="Customer confirmed"
                checked={!!job.confirmations?.customerConfirmed}
                at={job.confirmations?.customerConfirmedAt}
                onChange={(v) =>
                  canEdit &&
                  updateJob(job.id, {
                    confirmations: {
                      ...(job.confirmations ?? {
                        customerConfirmed: false,
                        foremanAccepted: false,
                      }),
                      customerConfirmed: v,
                      customerConfirmedAt: v ? new Date().toISOString() : undefined,
                    },
                  })
                }
              />
              <ConfirmRow
                label="Foreman accepted"
                checked={!!job.confirmations?.foremanAccepted}
                at={job.confirmations?.foremanAcceptedAt}
                onChange={(v) =>
                  updateJob(job.id, {
                    confirmations: {
                      ...(job.confirmations ?? {
                        customerConfirmed: false,
                        foremanAccepted: false,
                      }),
                      foremanAccepted: v,
                      foremanAcceptedAt: v ? new Date().toISOString() : undefined,
                    },
                  })
                }
              />
              {(job.pickupBuilding?.coiRequired || job.deliveryBuilding?.coiRequired) && (
                <ConfirmRow
                  label="COI submitted to buildings"
                  checked={!!job.confirmations?.coiSubmitted}
                  at={job.confirmations?.coiSubmittedAt}
                  onChange={(v) =>
                    updateJob(job.id, {
                      confirmations: {
                        ...(job.confirmations ?? {
                          customerConfirmed: false,
                          foremanAccepted: false,
                        }),
                        coiSubmitted: v,
                        coiSubmittedAt: v ? new Date().toISOString() : undefined,
                      },
                    })
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adjustments</CardTitle>
              <CardDescription>
                LTA, late changes, refunds — recorded against the job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(job.adjustments ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                  No adjustments on this job.
                </p>
              ) : (
                <div className="space-y-2">
                  {(job.adjustments ?? []).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border border-border bg-muted/20 p-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{a.reason}</span>
                        <span className="font-mono font-semibold">
                          {a.amount >= 0 ? "+" : ""}
                          {fmtUSD(a.amount)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {a.appliedBy} · {formatDateStable(a.appliedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <JobDocumentsPanel
            jobId={job.id}
            customerName={job.customer}
            foremanName={job.driverName}
          />

          <JobEventLog jobId={job.id} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  primary,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 p-2",
        primary && "border-primary/30 bg-primary/[0.04]",
      )}
    >
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-2.5 w-2.5" />}
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono text-lg font-bold",
          primary && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AddressBlock({
  label,
  address,
  onAddressChange,
  building,
  onBuildingChange,
  readOnly = false,
}: {
  label: string;
  address: string;
  onAddressChange?: (v: string) => void;
  building?: BuildingDetails;
  onBuildingChange: (p: Partial<BuildingDetails>) => void;
  /** Field view (foreman): show everything, edit nothing. */
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {building?.type && (
          <Badge variant="outline" className="text-[10px]">
            {building.type}
          </Badge>
        )}
        {address && (
          <a
            href={mapsHref(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          >
            <MapPin className="h-3 w-3" /> Open in Maps
          </a>
        )}
      </div>
      <Input
        value={address}
        onChange={(e) => onAddressChange?.(e.target.value)}
        readOnly={readOnly || !onAddressChange}
        className="text-sm"
      />
      <div
        className={cn(
          "grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/20 p-2",
          readOnly && "pointer-events-none",
        )}
      >
        <BuildingFlag
          label="Elevator"
          icon={Building2}
          on={!!building?.hasElevator}
          onClick={() =>
            onBuildingChange({ hasElevator: !building?.hasElevator })
          }
        />
        <NumberFlag
          label="Stairs"
          value={building?.stairsFlights ?? 0}
          onChange={(v) => onBuildingChange({ stairsFlights: v })}
        />
        <BuildingFlag
          label="Strict bldg"
          icon={ShieldAlert}
          on={!!building?.isStrict}
          onClick={() => onBuildingChange({ isStrict: !building?.isStrict })}
        />
        <BuildingFlag
          label="COI required"
          icon={Mail}
          on={!!building?.coiRequired}
          onClick={() =>
            onBuildingChange({ coiRequired: !building?.coiRequired })
          }
        />
      </div>
      {(building?.parkingNotes || building?.longCarryFeet) && (
        <p className="text-[10px] text-muted-foreground">
          {building?.parkingNotes && `${building.parkingNotes}`}
          {building?.longCarryFeet && building.longCarryFeet > 0
            ? ` · Long carry ~${building.longCarryFeet}ft`
            : ""}
        </p>
      )}
    </div>
  );
}

function BuildingFlag({
  label,
  icon: Icon,
  on,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-semibold transition-colors",
        on
          ? "bg-primary/15 text-primary"
          : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

function NumberFlag({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded bg-background px-2 py-1 text-[11px]">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-6 w-14 text-center text-xs"
      />
    </div>
  );
}

function ConfirmRow({
  label,
  checked,
  at,
  onChange,
}: {
  label: string;
  checked: boolean;
  at?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-lg border border-border p-2 transition-colors",
        checked && "border-success/40 bg-success/[0.05]",
      )}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 accent-success"
        />
        <div>
          <p className="text-xs font-semibold">{label}</p>
          {at && (
            <p className="text-[10px] text-muted-foreground">
              {new Date(at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </label>
  );
}

/**
 * Connections — makes Job Detail the system center. Surfaces the linked lead,
 * quote, customer, foreman, storage items and claims for this job so the record
 * no longer feels isolated. Reads the shared stores by id.
 */
function JobConnections({ job }: { job: Job }) {
  const lead = useLeads((s) => (job.leadId ? s.leads.find((l) => l.id === job.leadId) : undefined));
  const quote = useQuotesStore((s) => (job.quoteId ? s.quotes.find((q) => q.id === job.quoteId) : undefined));
  const allItems = useStorage((s) => s.items);
  const allClaims = useClaims((s) => s.items);
  const storageItems = allItems.filter((i) => i.jobId === job.id);
  const claims = allClaims.filter((c) => c.jobId === job.id);
  const flagged = storageItems.filter(isItemFlagged).length;

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (lead) rows.push({ label: "Lead", value: <Link href={`/leads/${lead.id}`} className="font-mono text-primary hover:underline">{lead.id} · {lead.name}</Link> });
  if (quote) rows.push({ label: "Quote", value: <Link href={`/quotes/${quote.id}`} className="font-mono text-primary hover:underline">{quote.id} · {quote.status}</Link> });
  rows.push({ label: "Customer", value: job.customerId ? <Link href={`/customers/${job.customerId}`} className="text-primary hover:underline">{job.customer}</Link> : job.customer });
  rows.push({ label: "Foreman", value: job.driverName ?? <span className="text-muted-foreground">Unassigned</span> });
  const openClaims = claims.filter((c) => !["Resolved", "Closed", "Approved", "Denied"].includes(c.status)).length;
  const payrollReady = job.status === "Completed" && openClaims === 0;
  rows.push({
    label: "Payroll readiness",
    value: (
      <span className="flex items-center gap-1.5">
        <Badge variant={openClaims > 0 ? "danger" : payrollReady ? "success" : "outline"} className="text-[9px]">
          {openClaims > 0 ? "On hold · open claim" : payrollReady ? "Ready" : job.payrollStatus}
        </Badge>
      </span>
    ),
  });
  if (storageItems.length > 0) {
    const unitId = storageItems[0].unitId;
    rows.push({
      label: "Storage",
      value: (
        <span className="flex items-center gap-2">
          <Link href={`/storage/${unitId}`} className="text-primary hover:underline">{storageItems.length} item(s)</Link>
          {flagged > 0 && <Badge variant="danger" className="text-[9px]">{flagged} flagged</Badge>}
        </span>
      ),
    });
  }
  if (claims.length > 0) {
    rows.push({
      label: "Claims",
      value: <Link href={`/claims/${claims[0].id}`} className="text-primary hover:underline">{claims.length} claim(s) · {claims[0].status}</Link>,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-primary" /> Connections
        </CardTitle>
        <CardDescription>Everything linked to this job across the hub.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 border-b border-border/50 py-1 text-sm last:border-0">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="text-right font-medium">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
