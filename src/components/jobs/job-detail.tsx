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
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  Truck,
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
import { useNotifications } from "@/lib/store/notifications";
import { useJobEvents } from "@/lib/store/job-events";
import { JobEventLog } from "./job-event-log";
import { JobAdjustmentsPanel } from "./job-adjustments-panel";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

const CONTRACTOR_COMPANIES: Record<string, { company: string; commissionPct: number }> = {
  "DRV-1042": { company: "Arsemia LLC", commissionPct: 33.5 },
  "DRV-1043": { company: "Hernandez Moving Co.", commissionPct: 32 },
  "DRV-1044": { company: "—", commissionPct: 30 },
  "DRV-1045": { company: "Volkov Logistics LLC", commissionPct: 33.5 },
  "DRV-1046": { company: "Carter Bros Movers", commissionPct: 33.5 },
  "DRV-1047": { company: "—", commissionPct: 30 },
  "DRV-1048": { company: "Shankar Long Haul LLC", commissionPct: 33.5 },
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
  const stageReassignment = useJobsStore((s) => s.stageReassignment);
  const cancelPending = useJobsStore((s) => s.cancelPending);
  const confirmPending = useJobsStore((s) => s.confirmPending);
  const currentJob = useJobsStore((s) => s.jobs.find((j) => j.id === initial.id)) ?? initial;
  const pendingForJob = useJobsStore((s) =>
    s.pendingReassignments.find((p) => p.jobId === initial.id),
  );
  const job = currentJob;
  const pushNotif = useNotifications((s) => s.push);
  const pushEvent = useJobEvents((s) => s.push);
  const contractor = job.driverId ? CONTRACTOR_COMPANIES[job.driverId] : undefined;

  const [editingInv, setEditingInv] = useState(false);

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

  const handleStageReassign = (driverId: string, driverName: string) => {
    const staged = stageReassignment(job.id, driverId, driverName, "Mariana Castro");
    pushNotif({
      kind: "job_reassigned",
      title: `Pending reassignment — ${job.id}`,
      body: staged.fromDriverName
        ? `${staged.fromDriverName} → ${driverName}. Awaiting confirmation.`
        : `Staged for ${driverName}. Awaiting confirmation.`,
      href: `/jobs/${job.id}`,
    });
    pushEvent({
      jobId: job.id,
      type: "reassigned",
      actor: "Mariana Castro",
      message: staged.fromDriverName
        ? `Staged reassignment: ${staged.fromDriverName} → ${driverName}.`
        : `Staged assignment to ${driverName}.`,
    });
  };

  const handleStageUnassign = () => {
    const staged = stageReassignment(job.id, undefined, undefined, "Mariana Castro");
    pushNotif({
      kind: "job_reassigned",
      title: `Pending unassignment — ${job.id}`,
      body: `Removing ${staged.fromDriverName ?? "current foreman"}. Awaiting confirmation.`,
      href: `/jobs/${job.id}`,
    });
  };

  const handleConfirmPending = () => {
    const p = confirmPending(job.id);
    if (!p) return;
    pushNotif({
      kind: "job_reassigned",
      title: `Job ${job.id} reassigned`,
      body: p.toDriverName
        ? `${p.fromDriverName ?? "—"} → ${p.toDriverName}. Foreman will be notified via the mobile app.`
        : `Unassigned from ${p.fromDriverName ?? "—"}.`,
      href: `/jobs/${job.id}`,
    });
    pushEvent({
      jobId: job.id,
      type: "reassigned",
      actor: "Mariana Castro",
      message: p.toDriverName
        ? `Reassignment confirmed: ${p.fromDriverName ?? "—"} → ${p.toDriverName}.`
        : `Unassignment confirmed.`,
    });
  };

  const handleCancelPending = () => {
    if (!pendingForJob) return;
    cancelPending(job.id);
    pushEvent({
      jobId: job.id,
      type: "reassigned",
      actor: "Mariana Castro",
      message: `Pending reassignment cancelled.`,
    });
  };

  const updateBuilding = (which: "pickupBuilding" | "deliveryBuilding", patch: Partial<BuildingDetails>) => {
    const existing = (job[which] ?? { type: "Apartment" }) as BuildingDetails;
    updateJob(job.id, { [which]: { ...existing, ...patch } } as Partial<Job>);
  };

  const updateInventoryItem = (idx: number, patch: Partial<JobInventoryItem>) => {
    const inv = [...(job.inventoryItems ?? [])];
    inv[idx] = { ...inv[idx], ...patch };
    updateJob(job.id, { inventoryItems: inv });
  };

  const removeInventoryItem = (idx: number) => {
    const inv = (job.inventoryItems ?? []).filter((_, i) => i !== idx);
    updateJob(job.id, { inventoryItems: inv });
  };

  const addInventoryItem = () => {
    const inv = [
      ...(job.inventoryItems ?? []),
      { name: "New item", qty: 1, cuft: 5 },
    ];
    updateJob(job.id, { inventoryItems: inv });
  };

  return (
    <div className="space-y-4">
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
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {job.customerPhone}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3 w-3" />
                {new Date(job.scheduledAt).toLocaleString(undefined, {
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
          <div className="lg:col-span-5">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Addresses + buildings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" /> Addresses & buildings
              </CardTitle>
              <CardDescription>
                Editable. Building requirements flow to the foreman app.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <AddressBlock
                label="Pickup"
                address={job.pickup}
                onAddressChange={(v) => updateJob(job.id, { pickup: v })}
                building={job.pickupBuilding}
                onBuildingChange={(p) => updateBuilding("pickupBuilding", p)}
              />
              <AddressBlock
                label="Delivery"
                address={job.delivery}
                onAddressChange={(v) => updateJob(job.id, { delivery: v })}
                building={job.deliveryBuilding}
                onBuildingChange={(p) => updateBuilding("deliveryBuilding", p)}
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
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                                it.packByCrew
                                  ? "bg-success/15 text-success"
                                  : "bg-muted text-muted-foreground hover:bg-accent",
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
                onChange={(e) => updateJob(job.id, { notes: e.target.value })}
                placeholder="Foreman-facing notes — building access, fragile items, customer preferences..."
                className="min-h-24 w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
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
                      {new Date(pendingForJob.stagedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={!!pendingForJob}
                        >
                          Reassign <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuLabel>Reassign to foreman</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {seedDrivers
                          .filter((d) => d.id !== job.driverId)
                          .map((d) => (
                            <DropdownMenuItem
                              key={d.id}
                              onClick={() => handleStageReassign(d.id, d.name)}
                              className="flex flex-col items-start gap-0.5"
                            >
                              <p className="text-sm font-semibold">{d.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {d.status} · {d.vehicleName}
                              </p>
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleStageUnassign}>
                          <span className="text-destructive">Unassign</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="mt-1 w-full gap-1"
                        disabled={!!pendingForJob}
                      >
                        Assign foreman <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60">
                      <DropdownMenuLabel>Available foremen</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {seedDrivers.map((d) => (
                        <DropdownMenuItem
                          key={d.id}
                          onClick={() => handleStageReassign(d.id, d.name)}
                          className="flex flex-col items-start gap-0.5"
                        >
                          <p className="text-sm font-semibold">{d.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {d.status} · {d.vehicleName}
                          </p>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <CardContent className="space-y-2">
              <ConfirmRow
                label="Customer confirmed"
                checked={!!job.confirmations?.customerConfirmed}
                at={job.confirmations?.customerConfirmedAt}
                onChange={(v) =>
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
                        {a.appliedBy} · {new Date(a.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
}: {
  label: string;
  address: string;
  onAddressChange: (v: string) => void;
  building?: BuildingDetails;
  onBuildingChange: (p: Partial<BuildingDetails>) => void;
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
      </div>
      <Input
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        className="text-sm"
      />
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/20 p-2">
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
              {new Date(at).toLocaleString(undefined, {
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
