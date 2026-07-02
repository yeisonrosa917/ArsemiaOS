"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  ClipboardList,
  Clock,
  Coins,
  Receipt,
  ShieldAlert,
  Truck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobs, drivers } from "@/lib/mock-data";
import { useLeads, followUpState, isOpenStage } from "@/lib/store/leads";
import { useExpenses } from "@/lib/store/expenses";
import { useInvoices } from "@/lib/store/invoices";
import { useClaims } from "@/lib/store/claims";
import { useFleet } from "@/lib/store/fleet";
import { useNotifications } from "@/lib/store/notifications";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { filterNotificationsForRole } from "@/lib/notifications/audience";
import { payrollLinesAll } from "@/lib/payroll/data";
import { vehicleCapacity, capacityLevel } from "@/lib/fleet/capacity";
import { cn, formatCurrency } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

const ACTIVE_JOB = (s: string) => s !== "Completed" && s !== "Cancelled";

export default function DashboardPage() {
  const leads = useLeads((s) => s.leads);
  const expenses = useExpenses((s) => s.items);
  const invoices = useInvoices((s) => s.items);
  const claims = useClaims((s) => s.items);
  const vehicles = useFleet((s) => s.vehicles);
  const allNotifs = useNotifications((s) => s.items);
  const activity = useActivityLog((s) => s.entries);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const caps = resolveCapabilities(activeRoleId);

  const canFinance = caps.includes("invoices.view") || caps.includes("payroll.view_all") || caps.includes("expenses.view_all");
  const canClaims = caps.includes("claims.view");
  const canSales = caps.includes("leads.view");
  const canOps = caps.includes("dispatch.view") || caps.includes("jobs.view") || caps.includes("roles.manage");

  const ops = useMemo(() => {
    const active = jobs.filter((j) => ACTIVE_JOB(j.status));
    const unassigned = active.filter((j) => !j.driverId);
    const overCap = active.filter((j) => {
      if (!j.driverId) return false;
      const d = drivers.find((x) => x.id === j.driverId);
      const truck = d ? vehicles.find((v) => v.id === d.vehicleId) : undefined;
      return truck ? capacityLevel(j.cuFt, vehicleCapacity(truck)) === "over" : false;
    });
    return {
      active: active.length,
      unassigned: unassigned.length,
      atRisk: unassigned.length + overCap.length,
      onRoad: drivers.filter((d) => d.status === "On Job" || d.status === "En Route").length,
      trucksAvail: vehicles.filter((v) => v.status === "Active" || v.status === "Idle").length,
      inShop: vehicles.filter((v) => v.status === "Maintenance" || v.status === "Out of Service").length,
    };
  }, [vehicles]);

  const sales = useMemo(() => {
    const open = leads.filter((l) => isOpenStage(l.stage));
    return {
      unassigned: open.filter((l) => !l.assignedSellerId).length,
      followToday: leads.filter((l) => followUpState(l) === "today").length,
      overdue: leads.filter((l) => followUpState(l) === "overdue").length,
      quotesSent: leads.filter((l) => l.stage === "Quote Sent").length,
      booked: leads.filter((l) => l.stage === "Booked").length,
    };
  }, [leads]);

  const finance = useMemo(() => {
    const flags = payrollLinesAll.filter((p) => p.auditFlags.length > 0 || p.status === "Flagged").length;
    const pendingExp = expenses.filter((e) => ["Submitted", "Under Review", "Needs Receipt", "On Hold"].includes(e.status)).length;
    const overdueInv = invoices.filter((i) => i.status === "Overdue").length;
    const reimb = expenses.filter((e) => e.reimbursable && e.status === "Approved").length;
    return { flags, pendingExp, overdueInv, reimb };
  }, [expenses, invoices]);

  const risk = useMemo(() => {
    const open = claims.filter((c) => ["New", "Under Review", "Customer Contacted"].includes(c.status));
    return {
      open: open.length,
      untriaged: claims.filter((c) => c.status === "New").length,
      reviewing: claims.filter((c) => c.status === "Under Review").length,
    };
  }, [claims]);

  const roleNotifs = useMemo(
    () => filterNotificationsForRole(allNotifs, activeRoleId).filter((n) => n.priority),
    [allNotifs, activeRoleId],
  );
  const recentActivity = useMemo(() => activity.slice(0, 6), [activity]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command center"
        description="What happened overnight and what needs attention today — every card opens the exact record."
      />

      {canOps && (
        <Section title="Today's operations" icon={Truck}>
          <Tile label="Active jobs" value={ops.active} href="/jobs" icon={ClipboardList} />
          <Tile label="Unassigned" value={ops.unassigned} href="/dispatch" icon={UserRound} tone={ops.unassigned > 0 ? "warning" : undefined} />
          <Tile label="Jobs at risk" value={ops.atRisk} href="/dispatch" icon={AlertTriangle} tone={ops.atRisk > 0 ? "danger" : undefined} hint="unassigned or over truck capacity" />
          <Tile label="Foremen on road" value={ops.onRoad} href="/foremen" icon={UserRound} />
          <Tile label="Trucks available" value={ops.trucksAvail} href="/fleet" icon={Truck} />
          <Tile label="Trucks in shop" value={ops.inShop} href="/fleet" icon={Truck} tone={ops.inShop > 0 ? "warning" : undefined} />
        </Section>
      )}

      {canSales && (
        <Section title="Sales attention" icon={UserRound}>
          <Tile label="Unassigned leads" value={sales.unassigned} href="/pipeline" icon={UserRound} tone={sales.unassigned > 0 ? "warning" : undefined} />
          <Tile label="Follow-ups due today" value={sales.followToday} href="/leads" icon={Clock} tone={sales.followToday > 0 ? "warning" : undefined} />
          <Tile label="Overdue follow-ups" value={sales.overdue} href="/leads" icon={AlertTriangle} tone={sales.overdue > 0 ? "danger" : undefined} />
          <Tile label="Quotes sent" value={sales.quotesSent} href="/leads" icon={Receipt} />
          <Tile label="Booked" value={sales.booked} href="/pipeline" icon={ClipboardList} tone="success" />
        </Section>
      )}

      {canFinance && (
        <Section title="Finance attention" icon={Coins}>
          <Tile label="Payroll flags" value={finance.flags} href="/payroll/tools" icon={ShieldAlert} tone={finance.flags > 0 ? "danger" : undefined} />
          <Tile label="Expenses pending" value={finance.pendingExp} href="/expenses" icon={Receipt} tone={finance.pendingExp > 0 ? "warning" : undefined} />
          <Tile label="Invoices overdue" value={finance.overdueInv} href="/invoices" icon={Receipt} tone={finance.overdueInv > 0 ? "danger" : undefined} />
          <Tile label="Reimbursements pending" value={finance.reimb} href="/expenses" icon={Coins} tone={finance.reimb > 0 ? "warning" : undefined} />
        </Section>
      )}

      {canClaims && (
        <Section title="Risk & claims" icon={ShieldAlert}>
          <Tile label="Open claims" value={risk.open} href="/claims" icon={ShieldAlert} tone={risk.open > 0 ? "warning" : undefined} />
          <Tile label="New / untriaged" value={risk.untriaged} href="/claims" icon={AlertTriangle} tone={risk.untriaged > 0 ? "danger" : undefined} />
          <Tile label="Under review" value={risk.reviewing} href="/claims" icon={Clock} />
        </Section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Needs action */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Needs your action</p>
              <Badge variant="outline">{roleNotifs.length}</Badge>
            </div>
            {roleNotifs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                All clear — nothing needs action right now.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {roleNotifs.slice(0, 7).map((n) => (
                  <li key={n.id}>
                    <Link href={n.href ?? "/notifications"} className="flex items-start gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs transition-colors hover:bg-accent/30">
                      <PriorityDot priority={n.priority} />
                      <span className="flex-1">
                        <span className="font-semibold">{n.title}</span>
                        <span className="block text-[11px] text-muted-foreground">{n.body}</span>
                      </span>
                      {n.dueDate && <span className="text-[10px] text-muted-foreground">due {n.dueDate.slice(5)}</span>}
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Overnight activity */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Recent activity</p>
            </div>
            {recentActivity.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recentActivity.map((a) => (
                  <li key={a.id} className="rounded-lg border border-border/60 bg-background p-2 text-xs">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.actorName} · {a.module} · {formatDateTimeStable(a.timestamp, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/activity" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Full audit log <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{children}</div>
    </div>
  );
}

function Tile({
  label,
  value,
  href,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "warning" | "danger" | "success";
  hint?: string;
}) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "h-full border transition-colors hover:border-primary/50 hover:bg-accent/20",
          tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]",
          tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
          tone === "success" && "border-emerald-500/40 bg-emerald-500/[0.04]",
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
          {hint && <p className="text-[9px] text-muted-foreground">{hint}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function PriorityDot({ priority }: { priority?: string }) {
  const color =
    priority === "urgent"
      ? "bg-rose-500"
      : priority === "high"
        ? "bg-amber-500"
        : priority === "normal"
          ? "bg-sky-500"
          : "bg-slate-400";
  return <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", color)} />;
}
