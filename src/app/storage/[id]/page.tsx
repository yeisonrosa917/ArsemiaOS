"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Building2,
  ChevronRight,
  MapPin,
  Phone,
  ScanLine,
  Warehouse,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { getUserByRole } from "@/lib/auth/users";
import { useClaims, type ClaimType } from "@/lib/store/claims";
import {
  useStorage,
  isItemFlagged,
  nextScanStage,
  scanStageIndex,
  SCAN_STAGES,
  SCAN_STAGE_STYLE,
  STORAGE_UNIT_STATUS_STYLE,
  ITEM_CONDITIONS,
  ITEM_CONDITION_STYLE,
  EXCEPTION_TYPE_LABEL,
  type StorageItem,
  type ItemCondition,
} from "@/lib/store/storage";
import { cn, formatCurrency, mapsHref, telHref } from "@/lib/utils";
import { formatShortDateStable, formatDateTimeStable } from "@/lib/dates";

export default function StorageUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const unit = useStorage((s) => s.units.find((u) => u.id === id));
  const provider = useStorage((s) => s.providers.find((p) => p.id === unit?.providerId));
  // Select the whole array (stable ref) and derive with useMemo — filtering inside
  // the selector returns a new array each render and infinite-loops the store.
  const allItems = useStorage((s) => s.items);
  const items = useMemo(() => allItems.filter((i) => i.unitId === id), [allItems, id]);
  const advanceScan = useStorage((s) => s.advanceScan);
  const setCondition = useStorage((s) => s.setCondition);
  const linkItemClaim = useStorage((s) => s.linkItemClaim);
  const allExceptions = useStorage((s) => s.exceptions);
  const resolveException = useStorage((s) => s.resolveException);
  const createClaim = useClaims((s) => s.createClaim);

  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps = resolveCapabilities(activeRoleId, overrides);
  const canManage = caps.includes("storage.manage");
  const scannerName = getUserByRole(activeRoleId).name;

  const [openItem, setOpenItem] = useState<string | null>(null);

  const fileClaim = (item: StorageItem) => {
    if (!unit) return;
    const claimType: ClaimType = item.condition === "Missing" ? "Lost Item" : "Furniture Damage";
    const lastScan = item.scanHistory[item.scanHistory.length - 1];
    const claim = createClaim({
      customerName: item.ownerName ?? unit.primaryCustomerName ?? "Storage customer",
      customerId: item.ownerCustomerId ?? unit.primaryCustomerId,
      jobId: item.jobId ?? unit.jobId,
      foremanName: lastScan?.by,
      claimType,
      priority: item.condition === "Missing" ? "High" : "Normal",
      source: `Storage unit ${unit.unitNumber} · ${item.name} (tag ${item.tag})`,
      note: item.notes,
      linkedStorageUnitId: unit.id,
      linkedStorageItemId: item.id,
    });
    linkItemClaim(item.id, claim.id);
  };

  const grouped = useMemo(() => {
    const m = new Map<string, StorageItem[]>();
    items.forEach((i) => {
      const key = i.destinationGroup ?? "Ungrouped";
      const arr = m.get(key) ?? [];
      arr.push(i);
      m.set(key, arr);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const flaggedCount = items.filter(isItemFlagged).length;
  const openExceptions = allExceptions.filter((e) => e.unitId === id && e.status === "open");
  const totalPieces = items.reduce((s, i) => s + i.quantity, 0);

  if (!unit) {
    return (
      <div className="space-y-4">
        <PageHeader title="Unit not found" description="This storage unit does not exist." />
        <Button asChild variant="outline" size="sm">
          <Link href="/storage"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Storage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/storage" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Storage
        </Link>
        <PageHeader
          title={`Unit ${unit.unitNumber}`}
          description={`${unit.size}${unit.climateControlled ? " · climate-controlled" : ""} · ${provider?.facility ?? ""}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: unit + provider + chain summary */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</span>
                <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", STORAGE_UNIT_STATUS_STYLE[unit.status])}>
                  {unit.status}
                </span>
              </div>
              <Row label="Customer" value={unit.primaryCustomerName ?? "—"} />
              {unit.shared && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/[0.05] px-2.5 py-1.5 text-[11px] text-amber-700">
                  Shared unit — items below are labeled by owner.
                </div>
              )}
              {unit.jobId && (
                <Row label="Job" value={<Link href={`/jobs`} className="font-mono text-primary hover:underline">{unit.jobId}</Link>} />
              )}
              <Row label="Since" value={formatShortDateStable(unit.startedAt)} />
              {unit.paidThrough && <Row label="Paid through" value={formatShortDateStable(unit.paidThrough)} />}
              <Row label="Monthly" value={unit.monthlyCost > 0 ? `${formatCurrency(unit.monthlyCost)}/mo` : "In-house (no charge)"} />
              {unit.notes && <p className="border-t border-border pt-2 text-[11px] text-muted-foreground">{unit.notes}</p>}
            </CardContent>
          </Card>

          {provider && (
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  {provider.kind === "in_house" ? <Warehouse className="h-4 w-4 text-cyan-600" /> : <Building2 className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-semibold">{provider.name}</span>
                  <Badge variant={provider.kind === "in_house" ? "success" : "outline"} className="text-[9px]">
                    {provider.kind === "in_house" ? "In-house" : "Third-party"}
                  </Badge>
                </div>
                <a
                  href={mapsHref(provider.address, provider.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                >
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {provider.address}, {provider.city}
                </a>
                <a href={telHref(provider.phone)} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:underline">
                  <Phone className="h-3 w-3 shrink-0" /> {provider.phone}
                </a>
                <p className="text-[11px] text-muted-foreground">{provider.accessHours}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-2 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This unit</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric value={String(items.length)} label="items" />
                <Metric value={String(totalPieces)} label="pieces" />
                <Metric value={String(flaggedCount)} label="flagged" tone={flaggedCount > 0 ? "danger" : undefined} />
              </div>
            </CardContent>
          </Card>

          {openExceptions.length > 0 && (
            <Card className="border-rose-500/40">
              <CardContent className="p-0">
                <div className="border-b border-border px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Open exceptions ({openExceptions.length})</span>
                </div>
                <ul className="divide-y divide-border">
                  {openExceptions.map((e) => (
                    <li key={e.id} className="flex items-start justify-between gap-2 px-4 py-2.5">
                      <div className="min-w-0">
                        <Badge variant="danger" className="text-[9px]">{EXCEPTION_TYPE_LABEL[e.type]}</Badge>
                        <p className="mt-1 text-[11px] text-muted-foreground">{e.description}</p>
                        {e.linkedClaimId && <Link href={`/claims/${e.linkedClaimId}`} className="text-[10px] font-semibold text-primary hover:underline">→ claim {e.linkedClaimId}</Link>}
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 shrink-0 text-[10px]" onClick={() => resolveException(e.id)}>Resolve</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: inventory grouped by destination */}
        <div className="space-y-4 lg:col-span-2">
          {grouped.map(([group, groupItems]) => (
            <Card key={group}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
                  <span className="text-[11px] text-muted-foreground">{groupItems.length} items</span>
                </div>
                <ul className="divide-y divide-border">
                  {groupItems.map((i) => {
                    const next = nextScanStage(i.stage);
                    const open = openItem === i.id;
                    return (
                      <li key={i.id} className={cn(isItemFlagged(i) && "bg-rose-500/[0.03]")}>
                        <div className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <button onClick={() => setOpenItem(open ? null : i.id)} className="mt-0.5 shrink-0 text-muted-foreground">
                              <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold">{i.name}</span>
                                {i.quantity > 1 && <span className="text-[11px] text-muted-foreground">×{i.quantity}</span>}
                                <span className="font-mono text-[10px] text-muted-foreground">{i.tag}</span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Badge variant="outline" className="text-[9px]">{i.category}</Badge>
                                {i.room && <span>· {i.room}</span>}
                                {i.ownerName && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground/80">Owner: {i.ownerName}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", ITEM_CONDITION_STYLE[i.condition])}>{i.condition}</span>
                              <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", SCAN_STAGE_STYLE[i.stage])}>{i.stage}</span>
                            </div>
                          </div>

                          {/* Chain-of-custody rail */}
                          <div className="mt-2.5 flex items-center gap-1 pl-7">
                            {SCAN_STAGES.map((st, idx) => {
                              const reached = idx <= scanStageIndex(i.stage);
                              return (
                                <span
                                  key={st}
                                  title={st}
                                  className={cn("h-1.5 flex-1 rounded-full", reached ? "bg-primary" : "bg-muted")}
                                />
                              );
                            })}
                          </div>

                          {open && (
                            <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                              {i.notes && <p className="text-[11px] text-muted-foreground">{i.notes}</p>}

                              {/* Damage / missing → claim */}
                              {isItemFlagged(i) && (
                                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/[0.05] px-2.5 py-1.5">
                                  <span className="text-[11px] font-semibold text-rose-700">
                                    {i.condition === "Missing" ? "Item missing" : "Item damaged"}
                                  </span>
                                  {i.claimId ? (
                                    <Link href={`/claims/${i.claimId}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                                      View claim {i.claimId} <ChevronRight className="h-3 w-3" />
                                    </Link>
                                  ) : canManage ? (
                                    <Button size="sm" variant="outline" className="ml-auto h-7 border-rose-500/40 text-[11px] text-rose-700" onClick={() => fileClaim(i)}>
                                      File a claim
                                    </Button>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">Claims team can file a claim.</span>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              {canManage ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="h-7 text-[11px]"
                                    disabled={!next}
                                    onClick={() => advanceScan(i.id, scannerName)}
                                  >
                                    <ScanLine className="mr-1 h-3.5 w-3.5" />
                                    {next ? `Scan → ${next}` : "Delivered"}
                                  </Button>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">Condition:</span>
                                    {ITEM_CONDITIONS.map((c) => (
                                      <button
                                        key={c}
                                        onClick={() => setCondition(i.id, c as ItemCondition, scannerName)}
                                        className={cn(
                                          "rounded border px-1.5 py-0.5 text-[9px] font-semibold transition-colors",
                                          i.condition === c ? ITEM_CONDITION_STYLE[c as ItemCondition] : "border-border text-muted-foreground hover:bg-muted",
                                        )}
                                      >
                                        {c}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-muted-foreground">Read-only — you don&apos;t have permission to scan or edit items.</p>
                              )}

                              {/* Scan history */}
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chain of custody</p>
                                <ul className="space-y-1">
                                  {[...i.scanHistory].reverse().map((e) => (
                                    <li key={e.id} className="flex items-start gap-2 text-[11px]">
                                      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", SCAN_STAGE_STYLE[e.stage])} />
                                      <div className="min-w-0">
                                        <span className="font-semibold">{e.stage}</span>
                                        <span className="text-muted-foreground"> · {e.by}{e.location ? ` · ${e.location}` : ""}</span>
                                        <span className="block text-[10px] text-muted-foreground">{formatDateTimeStable(e.at)}{e.note ? ` — ${e.note}` : ""}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
                <Boxes className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold">This unit is empty</p>
                <p className="text-xs text-muted-foreground">No items are currently stored here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Metric({ value, label, tone }: { value: string; label: string; tone?: "danger" }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 py-2">
      <p className={cn("font-mono text-lg font-bold", tone === "danger" && "text-rose-600")}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
