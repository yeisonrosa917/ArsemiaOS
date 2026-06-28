"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Filter, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LEADS, type LeadStatus } from "@/lib/data/leads";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Contacted: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "Quote Sent": "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  Booked: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Lost: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const STATUSES: ("All" | LeadStatus)[] = [
  "All",
  "New",
  "Contacted",
  "Quote Sent",
  "Booked",
  "Lost",
];

export function LeadsTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      if (filter !== "All" && l.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.fromCity.toLowerCase().includes(q) ||
        l.toCity.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const totalsByStatus = useMemo(() => {
    const t: Record<string, { count: number; value: number }> = {};
    for (const l of LEADS) {
      if (!t[l.status]) t[l.status] = { count: 0, value: 0 };
      t[l.status].count++;
      t[l.status].value += l.estimatedValue;
    }
    return t;
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {(["New", "Contacted", "Quote Sent", "Booked", "Lost"] as LeadStatus[]).map(
          (s) => {
            const t = totalsByStatus[s];
            return (
              <Card key={s} className="border-border/60">
                <CardContent className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s}
                  </p>
                  <p className="mt-0.5 text-xl font-bold">{t?.count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {fmtUSD(t?.value ?? 0)} pipeline value
                  </p>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3">
          <div>
            <CardTitle>Inbound leads</CardTitle>
            <CardDescription>
              {filtered.length} of {LEADS.length} leads ·{" "}
              {fmtUSD(filtered.reduce((acc, l) => acc + l.estimatedValue, 0))}{" "}
              estimated value
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, city..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
              <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    filter === s
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="p-2.5">Lead</th>
                  <th className="p-2.5">Source</th>
                  <th className="p-2.5">Route</th>
                  <th className="p-2.5 text-right">CuFt</th>
                  <th className="p-2.5 text-right">Est. value</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Created</th>
                  <th className="p-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-border/60 hover:bg-accent/20"
                  >
                    <td className="p-2.5">
                      <Link
                        href={`/leads/${l.id}`}
                        className="font-semibold hover:underline"
                      >
                        {l.name}
                      </Link>
                      <p className="text-[10px] text-muted-foreground">
                        {l.email} · {l.phone}
                      </p>
                    </td>
                    <td className="p-2.5">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                        {l.source}
                      </span>
                    </td>
                    <td className="p-2.5 text-xs">
                      <span className="font-medium">{l.fromCity}</span>{" "}
                      <ArrowRight className="inline h-2.5 w-2.5 text-muted-foreground" />{" "}
                      <span className="font-medium">{l.toCity}</span>
                      {l.scheduledDate && (
                        <p className="text-[10px] text-muted-foreground">
                          Wants{" "}
                          {new Date(l.scheduledDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      )}
                    </td>
                    <td className="p-2.5 text-right font-mono text-xs">
                      {l.estimatedCuFt}
                    </td>
                    <td className="p-2.5 text-right font-mono text-xs font-semibold">
                      {fmtUSD(l.estimatedValue)}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                          STATUS_STYLES[l.status],
                        )}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-[10px] text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-2.5">
                      <Button asChild variant="outline" size="sm" className="h-7 gap-1 text-[10px]">
                        <Link
                          href={{
                            pathname: "/quotes",
                            query: {
                              leadId: l.id,
                              customer: l.name,
                              phone: l.phone,
                              fromCity: l.fromCity,
                              toCity: l.toCity,
                              cuft: String(l.estimatedCuFt),
                            },
                          }}
                        >
                          Convert to Quote Draft{" "}
                          <ChevronDown className="h-3 w-3 -rotate-90" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-sm text-muted-foreground"
                    >
                      No leads match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
