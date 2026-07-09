"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Truck, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleStatusBadge } from "@/components/shared/status-badge";
import {
  useFleet,
  type FleetVehicle,
  type MaintenanceKind,
  type MaintenanceOutcome,
  MAINTENANCE_KINDS,
  MAINTENANCE_OUTCOMES,
  MAINTENANCE_KIND_STYLE,
  MAINTENANCE_OUTCOME_STYLE,
} from "@/lib/store/fleet";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import type { VehicleStatus, VehicleType } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { formatShortDateStable } from "@/lib/dates";

const STATUSES: VehicleStatus[] = ["Active", "Idle", "Maintenance", "Out of Service"];
const VEHICLE_TYPES: VehicleType[] = [
  "ISUZU NPR 20'",
  "ISUZU NPR 26'",
  "Freightliner M2 26'",
  "Mercedes Sprinter 170",
  "Mercedes Sprinter 144",
  "Ford Transit 250",
  "Cargo Van",
  "Box Truck",
];

export default function FleetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const vehicle = useFleet((s) => s.vehicles.find((v) => v.id === id));
  const update = useFleet((s) => s.update);
  const setStatus = useFleet((s) => s.setStatus);
  const allRecords = useFleet((s) => s.records);
  const addRecord = useFleet((s) => s.addRecord);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  const [draft, setDraft] = useState<FleetVehicle | null>(null);
  const records = allRecords
    .filter((r) => r.vehicleId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const [logOpen, setLogOpen] = useState(false);
  const emptyLog = {
    kind: "Maintenance" as MaintenanceKind,
    title: "",
    date: "2026-07-09",
    odometer: "",
    cost: "",
    vendor: "",
    outcome: "Completed" as MaintenanceOutcome,
    nextDue: "",
    notes: "",
  };
  const [log, setLog] = useState(emptyLog);

  const submitLog = () => {
    if (!vehicle || !log.title.trim()) return;
    addRecord({
      vehicleId: vehicle.id,
      kind: log.kind,
      title: log.title.trim(),
      date: log.date,
      odometer: log.odometer ? Number(log.odometer) : undefined,
      cost: log.cost ? Number(log.cost) : undefined,
      vendor: log.vendor || undefined,
      outcome: log.outcome,
      nextDue: log.nextDue || undefined,
      notes: log.notes || undefined,
    });
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Fleet",
      action: "created",
      objectType: "Maintenance",
      objectId: vehicle.id,
      title: `${log.kind} logged for ${vehicle.id}: ${log.title.trim()} (${log.outcome})`,
    });
    setLog(emptyLog);
    setLogOpen(false);
  };

  useEffect(() => {
    if (vehicle) setDraft(vehicle);
  }, [vehicle]);

  if (!vehicle || !draft) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/fleet">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to fleet
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">Vehicle not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(vehicle);

  const handleSave = () => {
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    (Object.keys(draft) as (keyof FleetVehicle)[]).forEach((k) => {
      if (draft[k] !== vehicle[k]) {
        before[k as string] = vehicle[k];
        after[k as string] = draft[k];
      }
    });
    update(vehicle.id, draft);
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Fleet",
      action: "edited",
      objectType: "Vehicle",
      objectId: vehicle.id,
      title: `Vehicle ${vehicle.id} updated`,
      beforeValue: before,
      afterValue: after,
    });
  };

  const handleStatusChange = (next: VehicleStatus) => {
    const prev = vehicle.status;
    setStatus(vehicle.id, next);
    setDraft((d) => (d ? { ...d, status: next } : d));
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Fleet",
      action: "status_changed",
      objectType: "Vehicle",
      objectId: vehicle.id,
      title: `Vehicle ${vehicle.id} → ${next}`,
      beforeValue: { status: prev },
      afterValue: { status: next },
    });
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/fleet">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to fleet
        </Link>
      </Button>

      <PageHeader
        title={vehicle.name}
        description={`${vehicle.id} · ${vehicle.plate}`}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
            <VehicleStatusBadge status={vehicle.status} />
            <Badge variant="outline">{vehicle.type}</Badge>
            <Badge variant="outline" className="text-[10px]">
              {vehicle.gpsActive ? "GPS Online" : "GPS Offline"}
            </Badge>
            {vehicle.currentDriver && (
              <Badge variant="outline" className="text-[10px]">
                Foreman: {vehicle.currentDriver}
              </Badge>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-wrap justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Change status…
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={s === vehicle.status}
                  >
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleSave} disabled={!dirty} className="gap-1">
              <Save className="h-3.5 w-3.5" />
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" />
            Vehicle details
          </CardTitle>
          <CardDescription>
            Editable fields. Click Save to persist; every change is logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Field
            label="Vehicle name / Truck #"
            value={draft.name}
            onChange={(v) => setDraft({ ...draft, name: v })}
          />
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </label>
            <select
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as VehicleType })
              }
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Max CuFt capacity"
            value={draft.maxCuFtCapacity != null ? String(draft.maxCuFtCapacity) : ""}
            onChange={(v) => setDraft({ ...draft, maxCuFtCapacity: v ? Number(v) : undefined })}
            hint="Physical limit — assignments above this are blocked unless overridden"
          />
          <Field
            label="Safe recommended CuFt"
            value={draft.safeRecommendedCuFt != null ? String(draft.safeRecommendedCuFt) : ""}
            onChange={(v) => setDraft({ ...draft, safeRecommendedCuFt: v ? Number(v) : undefined })}
            hint="Comfortable load — jobs above this show a warning"
          />
          <Field
            label="Make"
            value={draft.make ?? ""}
            onChange={(v) => setDraft({ ...draft, make: v })}
          />
          <Field
            label="Model"
            value={draft.model ?? ""}
            onChange={(v) => setDraft({ ...draft, model: v })}
          />
          <Field
            label="Year"
            value={draft.year ? String(draft.year) : ""}
            onChange={(v) =>
              setDraft({ ...draft, year: v ? Number(v) : undefined })
            }
          />
          <Field
            label="Plate"
            value={draft.plate}
            onChange={(v) => setDraft({ ...draft, plate: v })}
          />
          <Field
            label="VIN"
            value={draft.vin}
            onChange={(v) => setDraft({ ...draft, vin: v })}
          />
          <Field
            label="Odometer (miles)"
            value={String(draft.mileage)}
            onChange={(v) => setDraft({ ...draft, mileage: Number(v) || 0 })}
            hint={`Current: ${formatNumber(vehicle.mileage)} mi`}
          />
          <Field
            label="Current foreman"
            value={draft.currentDriver ?? ""}
            onChange={(v) =>
              setDraft({ ...draft, currentDriver: v || undefined })
            }
          />
          <Field
            label="Location / yard"
            value={draft.location}
            onChange={(v) => setDraft({ ...draft, location: v })}
          />
          <Field
            label="Insurance expiry"
            value={draft.insuranceExpiry}
            onChange={(v) => setDraft({ ...draft, insuranceExpiry: v })}
            hint="YYYY-MM-DD"
          />
          <Field
            label="Registration expiry"
            value={draft.registrationExpiry}
            onChange={(v) => setDraft({ ...draft, registrationExpiry: v })}
            hint="YYYY-MM-DD"
          />
          <Field
            label="Next maintenance"
            value={draft.nextMaintenance}
            onChange={(v) => setDraft({ ...draft, nextMaintenance: v })}
            hint="YYYY-MM-DD"
          />
          <div className="flex items-center gap-2 self-end">
            <input
              type="checkbox"
              id="gps"
              checked={draft.gpsActive}
              onChange={(e) =>
                setDraft({ ...draft, gpsActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="gps" className="text-sm font-semibold">
              GPS tracking active
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4 text-primary" />
              Maintenance &amp; inspections
            </CardTitle>
            <CardDescription>
              Service history and DOT inspections. Logging with a next-due date advances the truck&apos;s next-maintenance date.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setLogOpen((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            Log service
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {logOpen && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                  <select
                    value={log.kind}
                    onChange={(e) => setLog({ ...log, kind: e.target.value as MaintenanceKind })}
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  >
                    {MAINTENANCE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Outcome</label>
                  <select
                    value={log.outcome}
                    onChange={(e) => setLog({ ...log, outcome: e.target.value as MaintenanceOutcome })}
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  >
                    {MAINTENANCE_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <LogField label="Description" value={log.title} onChange={(v) => setLog({ ...log, title: v })} placeholder="e.g. Oil change + brake inspection" />
              <div className="grid gap-2 sm:grid-cols-2">
                <LogField label="Date (YYYY-MM-DD)" value={log.date} onChange={(v) => setLog({ ...log, date: v })} />
                <LogField label="Odometer" value={log.odometer} onChange={(v) => setLog({ ...log, odometer: v })} placeholder={String(vehicle.mileage)} />
                <LogField label="Cost (USD)" value={log.cost} onChange={(v) => setLog({ ...log, cost: v })} />
                <LogField label="Vendor" value={log.vendor} onChange={(v) => setLog({ ...log, vendor: v })} />
                <LogField label="Next due (YYYY-MM-DD)" value={log.nextDue} onChange={(v) => setLog({ ...log, nextDue: v })} hint="Updates next maintenance" />
                <LogField label="Notes" value={log.notes} onChange={(v) => setLog({ ...log, notes: v })} />
              </div>
              <div className="flex justify-end">
                <Button size="sm" disabled={!log.title.trim()} onClick={submitLog}>Add record</Button>
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-6 text-center text-sm text-muted-foreground">
              No maintenance or inspection records yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {records.map((r) => (
                <li key={r.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${MAINTENANCE_KIND_STYLE[r.kind]}`}>{r.kind}</span>
                        <span className="text-sm font-semibold">{r.title}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatShortDateStable(r.date)}
                        {r.odometer != null && ` · ${formatNumber(r.odometer)} mi`}
                        {r.vendor && ` · ${r.vendor}`}
                        {r.nextDue && ` · next due ${formatShortDateStable(r.nextDue)}`}
                      </p>
                      {r.notes && <p className="mt-1 text-[11px] italic text-muted-foreground">{r.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${MAINTENANCE_OUTCOME_STYLE[r.outcome]}`}>{r.outcome}</span>
                      {r.cost != null && <span className="font-mono text-xs font-semibold">{formatCurrency(r.cost)}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={draft.notes ?? ""}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="Internal notes about this vehicle (e.g. recent repairs, quirks, restrictions)…"
            className="min-h-[120px] w-full rounded-lg border border-border bg-background p-3 text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function LogField({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-9" />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
