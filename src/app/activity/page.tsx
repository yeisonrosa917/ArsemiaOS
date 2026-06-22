"use client";

import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Filter,
  Shield,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { humanizeActivity } from "@/lib/activity/humanize";
import type { ActivityModule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState as useReactState } from "react";

function TechnicalDetails({ entry }: { entry: { beforeValue?: unknown; afterValue?: unknown } }) {
  const [open, setOpen] = useReactState(false);
  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {open ? "Hide" : "View"} technical details
      </button>
      {open && (
        <div className="mt-1 grid gap-1 text-[10px] sm:grid-cols-2">
          {entry.beforeValue !== undefined && entry.beforeValue !== null && (
            <code className="block rounded bg-rose-500/10 px-2 py-1 text-rose-700">
              before: {JSON.stringify(entry.beforeValue)}
            </code>
          )}
          {entry.afterValue !== undefined && entry.afterValue !== null && (
            <code className="block rounded bg-emerald-500/10 px-2 py-1 text-emerald-700">
              after: {JSON.stringify(entry.afterValue)}
            </code>
          )}
        </div>
      )}
    </div>
  );
}

const MODULES: ("All" | ActivityModule)[] = [
  "All",
  "Jobs",
  "Adjustments",
  "Quotes",
  "Leads",
  "Customers",
  "Foremen",
  "Fleet",
  "Payroll",
  "Expenses",
  "Invoices",
  "Claims",
  "Settings",
  "Permissions",
  "Account",
  "Privacy",
  "Dispatch",
];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-brand-500/15 text-brand-700",
  dispatcher: "bg-amber-500/15 text-amber-700",
  seller: "bg-emerald-500/15 text-emerald-700",
  foreman: "bg-rose-500/15 text-rose-700",
  marketing: "bg-violet-500/15 text-violet-700",
  accountant: "bg-slate-500/15 text-slate-700",
};

export default function ActivityLogPage() {
  const entries = useActivityLog((s) => s.entries);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const [moduleFilter, setModuleFilter] = useState<(typeof MODULES)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return entries
      .filter((e) => moduleFilter === "All" || e.module === moduleFilter)
      .filter((e) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.actorName.toLowerCase().includes(q) ||
          e.objectId.toLowerCase().includes(q) ||
          (e.notes ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [entries, moduleFilter, query]);

  if (activeRoleId !== "owner") {
    return (
      <div className="space-y-6">
        <PageHeader title="Activity Log" description="Cross-module audit trail." />
        <Card className="border-warning/40">
          <CardContent className="flex items-center gap-3 p-6">
            <Shield className="h-6 w-6 text-warning" />
            <div>
              <p className="text-sm font-semibold">Owner-only area</p>
              <p className="text-xs text-muted-foreground">
                Switch to the Owner role from the top-right avatar to view the global
                activity log.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Cross-module audit trail. Every important action across the hub, with actor, role, before/after values."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ActivityIcon className="h-4 w-4 text-primary" />
              {filtered.length} entries
            </CardTitle>
            <CardDescription>
              Filtered from {entries.length} total · sorted newest first
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled title="CSV export comes in Phase 10">
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, actor, object ID, notes..."
              className="flex-1"
            />
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
              <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
              {MODULES.map((m) => (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={cn(
                    "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                    moduleFilter === m
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {filtered.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center text-xs text-muted-foreground">
                No activity matches your filters.
              </p>
            )}
            {filtered.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-12 items-start gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="col-span-12 sm:col-span-2">
                  <Badge variant="outline" className="text-[10px]">
                    {e.module}
                  </Badge>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(e.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="col-span-12 sm:col-span-7">
                  <p className="text-sm font-semibold">{humanizeActivity(e)}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="font-mono">{e.objectType}</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                    <span className="font-mono">{e.objectId}</span>
                  </p>
                  {e.notes && humanizeActivity(e) !== `${e.notes}.` && (
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {e.notes}
                    </p>
                  )}
                  {/* Owner-only "technical details" drawer */}
                  {(e.beforeValue !== undefined || e.afterValue !== undefined) && (
                    <TechnicalDetails entry={e} />
                  )}
                </div>
                <div className="col-span-12 sm:col-span-3">
                  <p className="flex items-center gap-1 text-xs font-medium">
                    <User className="h-2.5 w-2.5 text-muted-foreground" />
                    {e.actorName}
                  </p>
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                      ROLE_COLORS[e.actorRole] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {e.actorRole}
                  </span>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {e.action.replaceAll("_", " ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
