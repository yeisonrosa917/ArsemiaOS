"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useClaims,
  claimAwaitingResponse,
  claimEvidenceMissing,
  claimState,
  CLAIM_STATES,
  CLAIM_STATE_STYLE,
  OPEN_CLAIM_STATUSES,
  CLAIM_STATUS_STYLE,
  CLAIM_PRIORITY_STYLE,
  type Claim,
  type ClaimState,
} from "@/lib/store/claims";
import { cn, formatCurrency } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

type Filter = "all" | "open" | "unread" | "awaiting" | "evidence" | "urgent" | "resolved";

function lastMessage(c: Claim) {
  const msgs = c.messages ?? [];
  return msgs[msgs.length - 1];
}

export default function ClaimsInboxPage() {
  const router = useRouter();
  const claims = useClaims((s) => s.items);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [stateTab, setStateTab] = useState<"all" | ClaimState>("all");

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return [...claims]
      .filter((c) => {
        if (stateTab !== "all" && claimState(c.status) !== stateTab) return false;
        if (filter === "open" && !OPEN_CLAIM_STATUSES.includes(c.status)) return false;
        if (filter === "unread" && c.read !== false) return false;
        if (filter === "awaiting" && !claimAwaitingResponse(c)) return false;
        if (filter === "evidence" && !claimEvidenceMissing(c)) return false;
        if (filter === "urgent" && c.priority !== "Urgent" && c.priority !== "High") return false;
        if (filter === "resolved" && !["Resolved", "Closed", "Approved", "Denied"].includes(c.status)) return false;
        if (q) {
          return `${c.id} ${c.customerName} ${c.jobId} ${c.claimType} ${c.foremanName} ${c.assignedReviewer}`
            .toLowerCase()
            .includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const la = lastMessage(a)?.createdAt ?? a.openedAt;
        const lb = lastMessage(b)?.createdAt ?? b.openedAt;
        return lb.localeCompare(la);
      });
  }, [claims, search, filter, stateTab]);

  const counts = useMemo(
    () => ({
      open: claims.filter((c) => OPEN_CLAIM_STATUSES.includes(c.status)).length,
      unread: claims.filter((c) => c.read === false).length,
      awaiting: claims.filter(claimAwaitingResponse).length,
      atRisk: claims.filter((c) => OPEN_CLAIM_STATUSES.includes(c.status)).reduce((s, c) => s + c.claimAmount, 0),
    }),
    [claims],
  );

  const stateCounts = useMemo(() => {
    const m: Record<ClaimState, number> = { Active: 0, Pending: 0, Resolved: 0, Closed: 0 };
    claims.forEach((c) => (m[claimState(c.status)] += 1));
    return m;
  }, [claims]);

  const FILTERS: [Filter, string][] = [
    ["open", `Open (${counts.open})`],
    ["all", "All"],
    ["unread", `Unread (${counts.unread})`],
    ["awaiting", `Awaiting response (${counts.awaiting})`],
    ["evidence", "Missing evidence"],
    ["urgent", "High / Urgent"],
    ["resolved", "Resolved / Closed"],
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Claims inbox"
        description="Every claim is a conversation — customer, foreman, and claims-team messages in one thread. Click a claim to open it."
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Open claims" value={String(counts.open)} tone={counts.open > 0 ? "warning" : undefined} />
        <Stat label="Awaiting response" value={String(counts.awaiting)} tone={counts.awaiting > 0 ? "danger" : undefined} />
        <Stat label="Unread" value={String(counts.unread)} />
        <Stat label="Amount at risk" value={formatCurrency(counts.atRisk)} />
      </div>

      {/* Lifecycle state tabs — active / pending / resolved / closed */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
        <StateTab label="All" count={claims.length} active={stateTab === "all"} onClick={() => setStateTab("all")} />
        {CLAIM_STATES.map((st) => (
          <StateTab
            key={st}
            label={st}
            count={stateCounts[st]}
            active={stateTab === st}
            onClick={() => setStateTab(st)}
            cls={CLAIM_STATE_STYLE[st]}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search claim, customer, job, foreman..." className="h-9 pl-9" />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                filter === id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {rows.map((c) => {
              const lm = lastMessage(c);
              return (
                <li key={c.id}>
                  <button
                    onClick={() => router.push(`/claims/${c.id}`)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30",
                      c.read === false && "bg-primary/[0.03]",
                    )}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", c.read === false ? "bg-primary" : "bg-transparent")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-sm", c.read === false ? "font-bold" : "font-semibold")}>{c.customerName}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                        <Badge variant="outline" className="text-[10px]">{c.claimType}</Badge>
                        {c.priority && (
                          <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase", CLAIM_PRIORITY_STYLE[c.priority])}>
                            {c.priority}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {lm ? `${lm.authorName}: ${lm.body}` : "No messages yet."}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Job {c.jobId}</span>
                        <span>· {c.assignedReviewer}</span>
                        {claimAwaitingResponse(c) && <Badge variant="warning" className="text-[9px]">Awaiting response</Badge>}
                        {claimEvidenceMissing(c) && <Badge variant="danger" className="text-[9px]">Evidence needed</Badge>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", CLAIM_STATE_STYLE[claimState(c.status)])}>{claimState(c.status)}</span>
                        <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", CLAIM_STATUS_STYLE[c.status])}>{c.status}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold">{formatCurrency(c.claimAmount)}</span>
                      <span className="text-[9px] text-muted-foreground">{lm ? formatDateTimeStable(lm.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                  </button>
                </li>
              );
            })}
            {rows.length === 0 && (
              <li className="flex flex-col items-center gap-2 p-12 text-center">
                <ShieldAlert className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold">No claims in this view</p>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StateTab({
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
        active
          ? cls
            ? cls
            : "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px]", active ? "bg-background/70" : "bg-muted")}>{count}</span>
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warning" | "danger" }) {
  return (
    <Card className={cn("border p-3", tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]", tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
    </Card>
  );
}
