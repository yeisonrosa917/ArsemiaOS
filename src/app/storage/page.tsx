"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Boxes,
  Building2,
  Search,
  Warehouse,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useStorage,
  storageItemStatus,
  STORAGE_ITEM_STATUS_LABEL,
  STORAGE_ITEM_STATUS_STYLE,
  STORAGE_ITEM_STATUSES,
  STORAGE_UNIT_STATUS_STYLE,
  EXCEPTION_TYPE_LABEL,
  STORAGE_REMINDER_LABEL,
  type StorageItemStatus,
} from "@/lib/store/storage";
import { cn, formatCurrency } from "@/lib/utils";
import { formatShortDateStable } from "@/lib/dates";

type StatusFilter = "all" | StorageItemStatus;

export default function StorageIndexPage() {
  const router = useRouter();
  const providers = useStorage((s) => s.providers);
  const units = useStorage((s) => s.units);
  const items = useStorage((s) => s.items);
  const exceptions = useStorage((s) => s.exceptions);
  const reminders = useStorage((s) => s.reminders);
  const resolveException = useStorage((s) => s.resolveException);
  const resolveReminder = useStorage((s) => s.resolveReminder);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [providerFilter, setProviderFilter] = useState<"all" | string>("all");

  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const providerById = useMemo(() => new Map(providers.map((p) => [p.id, p])), [providers]);
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  // Item-first rows with everything needed for search + the compact table.
  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items
      .map((i) => {
        const unit = unitById.get(i.unitId);
        const provider = unit ? providerById.get(unit.providerId) : undefined;
        const customer = i.ownerName ?? unit?.primaryCustomerName ?? "—";
        const lastScan = i.scanHistory[i.scanHistory.length - 1];
        return { i, unit, provider, customer, lastScan, status: storageItemStatus(i) };
      })
      .filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (providerFilter !== "all" && r.unit?.providerId !== providerFilter) return false;
        if (q) {
          const hay = `${r.i.tag} ${r.i.name} ${r.customer} ${r.i.jobId ?? ""} ${r.unit?.unitNumber ?? ""} ${r.provider?.name ?? ""} ${r.i.room ?? ""}`.toLowerCase();
          return hay.includes(q);
        }
        return true;
      });
  }, [items, unitById, providerById, search, statusFilter, providerFilter]);

  const openExceptions = exceptions.filter((e) => e.status === "open");
  const openReminders = reminders.filter((r) => r.status === "open");

  const stats = {
    activeUnits: units.filter((u) => u.status === "Active" || u.status === "Overdue").length,
    items: items.length,
    exceptions: openExceptions.length,
    monthly: units.filter((u) => u.status === "Active" || u.status === "Overdue").reduce((s, u) => s + u.monthlyCost, 0),
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Storage Command Center"
        description="Every customer item held across third-party facilities and Arsemia's own warehouse — searchable by item, customer, job, unit or provider."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active units" value={String(stats.activeUnits)} icon={Warehouse} />
        <Stat label="Items in storage" value={String(stats.items)} icon={Boxes} />
        <Stat label="Open exceptions" value={String(stats.exceptions)} icon={AlertTriangle} tone={stats.exceptions > 0 ? "danger" : undefined} />
        <Stat label="Monthly cost" value={formatCurrency(stats.monthly)} icon={Building2} />
      </div>

      {/* Global item-first search + filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item #, item, customer, job, unit, provider…" className="h-9 pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="h-9 rounded-md border border-border bg-background px-2 text-xs">
          <option value="all">All statuses</option>
          {STORAGE_ITEM_STATUSES.map((s) => <option key={s} value={s}>{STORAGE_ITEM_STATUS_LABEL[s]}</option>)}
        </select>
        <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-xs">
          <option value="all">All providers</option>
          {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Item table (primary) */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardContent className="p-0">
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Item</th>
                    <th className="px-3 py-2 font-semibold">Customer</th>
                    <th className="px-3 py-2 font-semibold">Unit</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Last scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ i, unit, customer, lastScan, status }) => (
                    <tr key={i.id} className="cursor-pointer hover:bg-accent/30" onClick={() => router.push(`/storage/${i.unitId}`)}>
                      <td className="px-3 py-2">
                        <div className="font-semibold">{i.name}{i.quantity > 1 ? ` ×${i.quantity}` : ""}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{i.tag}{i.room ? ` · ${i.room}` : ""}{i.jobId ? ` · ${i.jobId}` : ""}</div>
                      </td>
                      <td className="px-3 py-2">{customer}</td>
                      <td className="px-3 py-2 font-mono text-[11px]">{unit?.unitNumber ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", STORAGE_ITEM_STATUS_STYLE[status])}>{STORAGE_ITEM_STATUS_LABEL[status]}</span>
                      </td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground">{lastScan ? formatShortDateStable(lastScan.at) : "—"}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">No items match this search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Secondary: exceptions, reminders, units */}
        <div className="space-y-4">
          <Panel title="Exceptions needing review" icon={AlertTriangle} tone={openExceptions.length > 0 ? "danger" : undefined} count={openExceptions.length}>
            {openExceptions.length === 0 && <p className="p-3 text-xs text-muted-foreground">No open exceptions.</p>}
            {openExceptions.map((e) => {
              const it = itemById.get(e.itemId);
              return (
                <div key={e.id} className="flex items-start justify-between gap-2 border-b border-border/50 px-3 py-2 last:border-0">
                  <Link href={`/storage/${e.unitId}`} className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="danger" className="text-[9px]">{EXCEPTION_TYPE_LABEL[e.type]}</Badge>
                      <span className="truncate text-xs font-semibold">{it?.name ?? e.itemId}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{e.description}</p>
                    {e.linkedClaimId && <Link href={`/claims/${e.linkedClaimId}`} className="text-[10px] font-semibold text-primary hover:underline">→ {e.linkedClaimId}</Link>}
                  </Link>
                  <Button size="sm" variant="ghost" className="h-6 shrink-0 text-[10px]" onClick={() => resolveException(e.id)}>Resolve</Button>
                </div>
              );
            })}
          </Panel>

          <Panel title="Reminders" icon={Bell} count={openReminders.length}>
            {openReminders.length === 0 && <p className="p-3 text-xs text-muted-foreground">No reminders.</p>}
            {openReminders.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-2 border-b border-border/50 px-3 py-2 last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={r.priority === "high" ? "danger" : "outline"} className="text-[9px]">{STORAGE_REMINDER_LABEL[r.type]}</Badge>
                    {r.unitId && <Link href={`/storage/${r.unitId}`} className="font-mono text-[10px] text-primary hover:underline">{unitById.get(r.unitId)?.unitNumber ?? r.unitId}</Link>}
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{r.note ?? ""} · due {formatShortDateStable(r.dueDate)}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-6 shrink-0 text-[10px]" onClick={() => resolveReminder(r.id)}>Done</Button>
              </div>
            ))}
          </Panel>

          <Panel title="Units" icon={Warehouse} count={units.length}>
            {units.map((u) => (
              <Link key={u.id} href={`/storage/${u.id}`} className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2 text-xs last:border-0 hover:bg-accent/30">
                <span className="min-w-0">
                  <span className="font-semibold">Unit {u.unitNumber}</span>
                  <span className="ml-1 text-[10px] text-muted-foreground">{providerById.get(u.providerId)?.name}</span>
                </span>
                <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", STORAGE_UNIT_STATUS_STYLE[u.status])}>{u.status}</span>
              </Link>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, count, tone, children }: { title: string; icon: React.ComponentType<{ className?: string }>; count?: number; tone?: "danger"; children: React.ReactNode }) {
  return (
    <Card className={cn("overflow-hidden", tone === "danger" && "border-rose-500/40")}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Icon className={cn("h-3.5 w-3.5", tone === "danger" ? "text-rose-500" : "text-muted-foreground")} /> {title}
        </span>
        {count != null && <Badge variant={tone === "danger" ? "danger" : "outline"} className="text-[9px]">{count}</Badge>}
      </div>
      <div>{children}</div>
    </Card>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone?: "danger" }) {
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
