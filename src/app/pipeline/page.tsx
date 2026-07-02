"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LeadActionsMenu } from "@/components/sales/lead-actions";
import {
  useLeads,
  followUpState,
  isOpenStage,
  type Lead,
} from "@/lib/store/leads";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole, getSellers } from "@/lib/auth/users";
import type { SalesStage } from "@/lib/types";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";
import { formatShortDateStable } from "@/lib/dates";

const STAGES: { id: SalesStage; label: string; accent: string }[] = [
  { id: "New Lead", label: "New Lead", accent: "from-blue-400/25 to-blue-500/5" },
  { id: "Contacted", label: "Contacted", accent: "from-cyan-400/25 to-cyan-500/5" },
  { id: "Quote Requested", label: "Quote Requested", accent: "from-violet-400/25 to-violet-500/5" },
  { id: "Quote Drafted", label: "Quote Draft", accent: "from-violet-400/25 to-violet-500/5" },
  { id: "Quote Sent", label: "Quote Sent", accent: "from-amber-400/25 to-amber-500/5" },
  { id: "Follow-Up Needed", label: "Follow-Up Due", accent: "from-orange-400/25 to-orange-500/5" },
  { id: "Booked", label: "Booked", accent: "from-emerald-400/25 to-emerald-500/5" },
  { id: "Converted to Job", label: "Converted", accent: "from-success/25 to-success/5" },
  { id: "Lost", label: "Lost", accent: "from-rose-400/25 to-rose-500/5" },
  { id: "Cancelled", label: "Cancelled", accent: "from-slate-400/25 to-slate-500/5" },
];

type QuickFilter =
  | "all"
  | "followToday"
  | "overdue"
  | "high"
  | "createdToday"
  | "thisWeek";

function createdWithin(lead: Lead, days: number): boolean {
  const diff = Date.now() - new Date(lead.createdAt).getTime();
  return diff <= days * 86400000;
}

export default function SalesPipelinePage() {
  const leads = useLeads((s) => s.leads);
  const setStage = useLeads((s) => s.setStage);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);
  const sellers = getSellers();

  const isSeller = activeRoleId === "seller";
  // Seller is locked to their own book; owner/marketing choose a scope.
  const [scope, setScope] = useState<string>(isSeller ? actor.id : "all");
  const effectiveScope = isSeller ? actor.id : scope;

  const [search, setSearch] = useState("");
  const [source, setSource] = useState<string>("All");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<SalesStage | null>(null);

  const scoped = useMemo(() => {
    let list = leads;
    if (effectiveScope === "unassigned") list = list.filter((l) => !l.assignedSellerId);
    else if (effectiveScope !== "all") list = list.filter((l) => l.assignedSellerId === effectiveScope);
    return list;
  }, [leads, effectiveScope]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scoped.filter((l) => {
      if (source !== "All" && l.source !== source) return false;
      if (quick === "followToday" && followUpState(l) !== "today") return false;
      if (quick === "overdue" && followUpState(l) !== "overdue") return false;
      if (quick === "high" && !(l.priority === "High" || l.priority === "Urgent")) return false;
      if (quick === "createdToday" && !createdWithin(l, 1)) return false;
      if (quick === "thisWeek" && !createdWithin(l, 7)) return false;
      if (q) {
        return `${l.name} ${l.phone} ${l.email} ${l.fromCity} ${l.toCity}`
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [scoped, search, source, quick]);

  const groups = useMemo(() => {
    const g = {} as Record<SalesStage, Lead[]>;
    for (const s of STAGES) g[s.id] = [];
    for (const l of filtered) (g[l.stage] ??= []).push(l);
    return g;
  }, [filtered]);

  // Workload metrics computed on the full scope (not the quick filter).
  const metrics = useMemo(() => {
    const open = leads.filter((l) => isOpenStage(l.stage));
    const perSeller = sellers.map((s) => ({
      name: s.name,
      count: open.filter((l) => l.assignedSellerId === s.id).length,
    }));
    return {
      totalOpen: open.length,
      unassigned: leads.filter((l) => !l.assignedSellerId && isOpenStage(l.stage)).length,
      followToday: leads.filter((l) => followUpState(l) === "today").length,
      overdue: leads.filter((l) => followUpState(l) === "overdue").length,
      perSeller,
    };
  }, [leads, sellers]);

  const move = (id: string, stage: SalesStage) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    setStage(id, stage, actor.name);
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Leads",
      action: "status_changed",
      objectType: "Lead",
      objectId: id,
      title: `${lead.name}: ${lead.stage} → ${stage}`,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Pipeline"
        description="Visual board from inbound lead to booked customer. Drag a card to change its stage. Booked leads hand off to Operations."
      />

      {/* Workload metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Open leads" value={String(metrics.totalOpen)} tone="primary" />
        <Metric label="Unassigned" value={String(metrics.unassigned)} tone={metrics.unassigned > 0 ? "warning" : undefined} />
        <Metric label="Follow-ups due today" value={String(metrics.followToday)} />
        <Metric label="Overdue follow-ups" value={String(metrics.overdue)} tone={metrics.overdue > 0 ? "danger" : undefined} />
      </div>

      {!isSeller && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 text-xs">
          <span className="px-1 font-semibold text-muted-foreground">View</span>
          <ScopeChip label="All leads" active={scope === "all"} onClick={() => setScope("all")} />
          <ScopeChip
            label={`Unassigned (${metrics.unassigned})`}
            active={scope === "unassigned"}
            onClick={() => setScope("unassigned")}
            tone="warning"
          />
          {sellers.map((s) => {
            const w = metrics.perSeller.find((p) => p.name === s.name)?.count ?? 0;
            return (
              <ScopeChip
                key={s.id}
                label={`${s.name.split(" ")[0]} (${w})`}
                active={scope === s.id}
                onClick={() => setScope(s.id)}
              />
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, city..."
            className="h-9"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium"
        >
          {["All", "Website", "Yelp", "Google Ads", "Referral", "Phone", "Repeat Customer", "Walk-in"].map(
            (s) => (
              <option key={s} value={s}>
                {s === "All" ? "All sources" : s}
              </option>
            ),
          )}
        </select>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", "All"],
              ["followToday", "Follow-up today"],
              ["overdue", "Overdue"],
              ["high", "High priority"],
              ["createdToday", "New today"],
              ["thisWeek", "This week"],
            ] as [QuickFilter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setQuick(id)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                quick === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {STAGES.map((stage) => {
          const items = groups[stage.id] ?? [];
          const isTarget = dropTarget === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (dropTarget !== stage.id) setDropTarget(stage.id);
              }}
              onDragLeave={() => dropTarget === stage.id && setDropTarget(null)}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/lead-id");
                if (id) move(id, stage.id);
                setDropTarget(null);
                setDragging(null);
              }}
              className={cn(
                "flex w-[240px] shrink-0 flex-col rounded-2xl border border-border bg-card/40 transition-colors",
                isTarget && "border-primary bg-primary/[0.04] shadow-elevated",
              )}
            >
              <div className={cn("rounded-t-2xl bg-gradient-to-br px-3 py-2", stage.accent)}>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">
                    {stage.label}
                  </p>
                  <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                    {items.length}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto p-2 scrollbar-thin max-h-[64vh]">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-3 text-center text-[10px] text-muted-foreground">
                    —
                  </p>
                )}
                {items.map((l) => {
                  const fu = followUpState(l);
                  return (
                    <Card
                      key={l.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/lead-id", l.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragging(l.id);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setDropTarget(null);
                      }}
                      className={cn(
                        "cursor-grab select-none border-border/60 transition-all active:cursor-grabbing",
                        dragging === l.id && "opacity-50 ring-2 ring-primary",
                      )}
                    >
                      <CardContent className="space-y-1.5 p-2.5">
                        <div className="flex items-start justify-between gap-1">
                          <p className="truncate text-xs font-semibold">{l.name}</p>
                          <LeadActionsMenu lead={l} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-semibold">
                            {fmtUSD(l.estimatedValue)}
                          </span>
                          {(l.priority === "High" || l.priority === "Urgent") && (
                            <Badge variant="danger" className="text-[9px]">
                              {l.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{l.fromCity}</span>
                          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{l.toCity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Phone className="h-2.5 w-2.5 shrink-0" />
                          {l.phone}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <Badge variant="outline" className="text-[9px]">
                            {l.source}
                          </Badge>
                          <span className="truncate text-[9px] text-muted-foreground">
                            {l.assignedSellerName ?? "Unassigned"}
                          </span>
                        </div>
                        {l.nextFollowUpAt && fu !== "none" && (
                          <p
                            className={cn(
                              "flex items-center gap-1 text-[9px] font-semibold",
                              fu === "overdue" && "text-rose-600",
                              fu === "today" && "text-amber-600",
                              fu === "upcoming" && "text-muted-foreground",
                            )}
                          >
                            <CalendarClock className="h-2.5 w-2.5" />
                            {fu === "overdue" ? "Overdue " : fu === "today" ? "Today " : ""}
                            {formatShortDateStable(l.nextFollowUpAt)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary" | "warning" | "danger";
}) {
  return (
    <Card
      className={cn(
        "border p-3",
        tone === "primary" && "border-primary/40 bg-primary/[0.04]",
        tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]",
        tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
    </Card>
  );
}

function ScopeChip({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "warning";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : tone === "warning"
            ? "border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
            : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
