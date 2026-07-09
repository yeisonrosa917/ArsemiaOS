"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Building2, Search, Warehouse, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useStorage,
  isItemFlagged,
  STORAGE_UNIT_STATUS_STYLE,
  STORAGE_UNIT_STATUSES,
  type StorageUnit,
  type StorageUnitStatus,
} from "@/lib/store/storage";
import { cn, formatCurrency } from "@/lib/utils";
import { formatShortDateStable } from "@/lib/dates";

type StatusFilter = "all" | StorageUnitStatus;

export default function StorageIndexPage() {
  const router = useRouter();
  const providers = useStorage((s) => s.providers);
  const units = useStorage((s) => s.units);
  const items = useStorage((s) => s.items);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusFilter>("all");
  const [providerId, setProviderId] = useState<"all" | string>("all");

  const itemsByUnit = useMemo(() => {
    const m = new Map<string, typeof items>();
    items.forEach((i) => {
      const arr = m.get(i.unitId) ?? [];
      arr.push(i);
      m.set(i.unitId, arr);
    });
    return m;
  }, [items]);

  const providerName = (id: string) => providers.find((p) => p.id === id)?.facility ?? id;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const facility = (pid: string) => providers.find((p) => p.id === pid)?.facility ?? pid;
    return units.filter((u) => {
      if (statusTab !== "all" && u.status !== statusTab) return false;
      if (providerId !== "all" && u.providerId !== providerId) return false;
      if (q) {
        return `${u.unitNumber} ${u.primaryCustomerName ?? ""} ${u.jobId ?? ""} ${facility(u.providerId)}`
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [units, search, statusTab, providerId, providers]);

  const stats = useMemo(() => {
    const active = units.filter((u) => u.status === "Active").length;
    const overdue = units.filter((u) => u.status === "Overdue").length;
    const flagged = items.filter(isItemFlagged).length;
    const monthly = units
      .filter((u) => u.status === "Active" || u.status === "Overdue")
      .reduce((s, u) => s + u.monthlyCost, 0);
    return { active, overdue, flagged, monthly, itemCount: items.length };
  }, [units, items]);

  const statusCounts = useMemo(() => {
    const m: Record<StorageUnitStatus, number> = { Active: 0, Vacant: 0, Overdue: 0, Closed: 0 };
    units.forEach((u) => (m[u.status] += 1));
    return m;
  }, [units]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Storage"
        description="Customer goods held across third-party facilities and Arsemia's own warehouse. Every item is tagged and tracked through an 8-stage chain of custody."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active units" value={String(stats.active)} icon={Warehouse} />
        <Stat label="Items in storage" value={String(stats.itemCount)} icon={Boxes} />
        <Stat label="Damaged / missing" value={String(stats.flagged)} tone={stats.flagged > 0 ? "danger" : undefined} icon={AlertTriangle} />
        <Stat label="Monthly storage cost" value={formatCurrency(stats.monthly)} icon={Building2} />
      </div>

      {/* Providers */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Providers</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((p) => {
            const pUnits = units.filter((u) => u.providerId === p.id);
            const occupied = pUnits.filter((u) => u.status === "Active" || u.status === "Overdue").length;
            const selected = providerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProviderId(selected ? "all" : p.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  selected ? "border-primary bg-primary/[0.04]" : "border-border hover:bg-accent/30",
                )}
              >
                <div className="flex items-center gap-2">
                  {p.kind === "in_house" ? (
                    <Warehouse className="h-4 w-4 text-cyan-600" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate text-sm font-semibold">{p.name}</span>
                </div>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{p.facility}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={p.kind === "in_house" ? "success" : "outline"} className="text-[9px]">
                    {p.kind === "in_house" ? "In-house" : "Third-party"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {occupied}/{pUnits.length} in use
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
        <StatusTab label="All units" count={units.length} active={statusTab === "all"} onClick={() => setStatusTab("all")} />
        {STORAGE_UNIT_STATUSES.map((st) => (
          <StatusTab
            key={st}
            label={st}
            count={statusCounts[st]}
            active={statusTab === st}
            onClick={() => setStatusTab(st)}
            cls={STORAGE_UNIT_STATUS_STYLE[st]}
          />
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search unit, customer, job, facility..."
          className="h-9 pl-9"
        />
      </div>

      {/* Units */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {rows.map((u) => {
              const unitItems = itemsByUnit.get(u.id) ?? [];
              const flagged = unitItems.filter(isItemFlagged).length;
              const qty = unitItems.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={u.id}>
                  <button
                    onClick={() => router.push(`/storage/${u.id}`)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">Unit {u.unitNumber}</span>
                        <span className="text-[11px] text-muted-foreground">{u.size}</span>
                        {u.climateControlled && <Badge variant="outline" className="text-[9px]">Climate</Badge>}
                        {u.shared && <Badge variant="warning" className="text-[9px]">Shared</Badge>}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {u.primaryCustomerName ?? "—"} · {providerName(u.providerId)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{unitItems.length} items ({qty} pcs)</span>
                        {u.jobId && <span>· Job {u.jobId}</span>}
                        <span>· since {formatShortDateStable(u.startedAt)}</span>
                        {flagged > 0 && <Badge variant="danger" className="text-[9px]">{flagged} flagged</Badge>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", STORAGE_UNIT_STATUS_STYLE[u.status])}>
                        {u.status}
                      </span>
                      <span className="font-mono text-xs font-semibold">
                        {u.monthlyCost > 0 ? `${formatCurrency(u.monthlyCost)}/mo` : "In-house"}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
            {rows.length === 0 && (
              <li className="flex flex-col items-center gap-2 p-12 text-center">
                <Boxes className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold">No units in this view</p>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusTab({
  label,
  count,
  active,
  onClick,
  cls,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  cls?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? (cls ? cls : "border-primary bg-primary/10 text-primary") : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px]", active ? "bg-background/70" : "bg-muted")}>{count}</span>
    </button>
  );
}

function Stat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "danger";
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={cn("border p-3", tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]")}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", tone === "danger" ? "text-rose-500" : "text-muted-foreground/60")} />
      </div>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
    </Card>
  );
}
