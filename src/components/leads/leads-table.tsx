"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn, formatCurrency } from "@/lib/utils";
import { formatShortDateStable } from "@/lib/dates";

type StatusFilter =
  | "All"
  | "New"
  | "Needs follow-up"
  | "Quote not sent"
  | "Quote sent"
  | "Booked"
  | "Lost";

const STAGES: SalesStage[] = [
  "New Lead",
  "Contacted",
  "Quote Requested",
  "Quote Drafted",
  "Quote Sent",
  "Follow-Up Needed",
  "Booked",
  "Converted to Job",
  "Lost",
  "Cancelled",
];

function quoteStatus(l: Lead): string {
  if (l.jobId) return "Booked";
  if (l.stage === "Quote Sent") return "Sent";
  if (l.quoteId) return "Draft";
  return "Not sent";
}

export function LeadsTable() {
  const router = useRouter();
  const leads = useLeads((s) => s.leads);
  const bulkAssign = useLeads((s) => s.bulkAssign);
  const distributeEvenly = useLeads((s) => s.distributeEvenly);
  const bulkSetStage = useLeads((s) => s.bulkSetStage);
  const markContacted = useLeads((s) => s.markContacted);
  const scheduleFollowUp = useLeads((s) => s.scheduleFollowUp);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);
  const sellers = getSellers();
  const isSeller = activeRoleId === "seller";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sellerFilter, setSellerFilter] = useState<string>(isSeller ? actor.id : "All");
  const [source, setSource] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      // Seller only ever sees their own book.
      const sf = isSeller ? actor.id : sellerFilter;
      if (sf === "Unassigned" && l.assignedSellerId) return false;
      if (sf !== "All" && sf !== "Unassigned" && l.assignedSellerId !== sf) return false;
      if (source !== "All" && l.source !== source) return false;
      if (fromDate && l.createdAt.slice(0, 10) < fromDate) return false;
      if (toDate && l.createdAt.slice(0, 10) > toDate) return false;

      if (status === "New" && l.stage !== "New Lead") return false;
      if (status === "Needs follow-up" && !["overdue", "today"].includes(followUpState(l)))
        return false;
      if (status === "Quote not sent" && !(isOpenStage(l.stage) && !l.quoteId)) return false;
      if (status === "Quote sent" && l.stage !== "Quote Sent") return false;
      if (status === "Booked" && !(l.stage === "Booked" || l.stage === "Converted to Job"))
        return false;
      if (status === "Lost" && !(l.stage === "Lost" || l.stage === "Cancelled")) return false;

      if (q) {
        return `${l.id} ${l.name} ${l.phone} ${l.email} ${l.fromCity} ${l.toCity}`
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [leads, search, status, sellerFilter, source, fromDate, toDate, isSeller, actor.id]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ids = [...selected];
  const logBulk = (title: string) =>
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Leads",
      action: "assigned",
      objectType: "Lead",
      objectId: `${selected.size} leads`,
      title,
    });

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lead, phone, email, city..."
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium"
        >
          {["All", "New", "Needs follow-up", "Quote not sent", "Quote sent", "Booked", "Lost"].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ),
          )}
        </select>
        {!isSeller && (
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="All">All sellers</option>
            <option value="Unassigned">Unassigned</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
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
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-36 text-xs" />
          <span>→</span>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-36 text-xs" />
        </div>
      </div>

      {/* Bulk toolbar (owner/manager only) */}
      {!isSeller && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/40 bg-primary/[0.04] p-2 text-xs">
          <span className="px-1 font-semibold">{selected.size} selected</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            defaultValue=""
            onChange={(e) => {
              const s = sellers.find((x) => x.id === e.target.value);
              if (!s) return;
              bulkAssign(ids, s.id, s.name, actor.name);
              logBulk(`${ids.length} leads assigned to ${s.name}`);
              setSelected(new Set());
              e.currentTarget.value = "";
            }}
          >
            <option value="">Assign to…</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              distributeEvenly(ids, sellers.map((s) => ({ id: s.id, name: s.name })), actor.name);
              logBulk(`${ids.length} leads distributed evenly across ${sellers.length} sellers`);
              setSelected(new Set());
            }}
          >
            Distribute evenly
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              ids.forEach((id) => markContacted(id, actor.name));
              logBulk(`${ids.length} leads marked contacted`);
              setSelected(new Set());
            }}
          >
            Mark contacted
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              const d = window.prompt("Follow-up date (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
              if (!d) return;
              ids.forEach((id) => scheduleFollowUp(id, d));
              logBulk(`Follow-up scheduled for ${ids.length} leads on ${d}`);
              setSelected(new Set());
            }}
          >
            Schedule follow-up
          </Button>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              bulkSetStage(ids, e.target.value as SalesStage, actor.name);
              logBulk(`${ids.length} leads moved to ${e.target.value}`);
              setSelected(new Set());
              e.currentTarget.value = "";
            }}
          >
            <option value="">Change stage…</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              {!isSeller && (
                <TableHead className="w-8 pl-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                </TableHead>
              )}
              <TableHead>Lead</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last contact</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="text-right">Est. value</TableHead>
              <TableHead>Quote</TableHead>
              <TableHead className="pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((l) => {
              const fu = followUpState(l);
              return (
                <TableRow
                  key={l.id}
                  className="cursor-pointer hover:bg-accent/30"
                  onClick={() => router.push(`/leads/${l.id}`)}
                >
                  {!isSeller && (
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} aria-label={`Select ${l.name}`} />
                    </TableCell>
                  )}
                  <TableCell>
                    <p className="text-xs font-semibold">{l.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{l.id}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{l.source}</Badge>
                  </TableCell>
                  <TableCell className="text-[11px]">
                    <p>{l.phone}</p>
                    <p className="text-muted-foreground">{l.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{l.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-[11px]">
                    {l.assignedSellerName ?? <span className="text-amber-600">Unassigned</span>}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {formatShortDateStable(l.createdAt)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {l.lastContactedAt ? formatShortDateStable(l.lastContactedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    {l.nextFollowUpAt ? (
                      <span
                        className={cn(
                          fu === "overdue" && "font-semibold text-rose-600",
                          fu === "today" && "font-semibold text-amber-600",
                          fu === "upcoming" && "text-muted-foreground",
                        )}
                      >
                        {formatShortDateStable(l.nextFollowUpAt)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">
                    {formatCurrency(l.estimatedValue)}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-muted-foreground">{quoteStatus(l)}</span>
                  </TableCell>
                  <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                    <LeadActionsMenu lead={l} />
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={isSeller ? 11 : 12} className="p-8 text-center text-sm text-muted-foreground">
                  No leads match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{rows.length}</span> of {leads.length} leads
        </div>
      </div>
    </div>
  );
}
