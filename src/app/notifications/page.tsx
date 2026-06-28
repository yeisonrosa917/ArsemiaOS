"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Briefcase,
  CheckCheck,
  Coins,
  FileText,
  Filter,
  ReceiptText,
  ShieldAlert,
  Trash2,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useNotifications,
  type NotificationKind,
  type NotificationSeverity,
} from "@/lib/store/notifications";
import { usePreferences } from "@/lib/store/preferences";
import { filterNotificationsForRole } from "@/lib/notifications/audience";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  expense_pending: ReceiptText,
  expense_missing_receipt: ReceiptText,
  claim_foreman_response: ShieldAlert,
  claim_status_changed: ShieldAlert,
  invoice_overdue: FileText,
  invoice_paid: FileText,
  payroll_flag: Coins,
  payroll_pending: Coins,
  fleet_maintenance: Wrench,
  fleet_insurance: Truck,
  fleet_registration: Truck,
  job_unassigned: Briefcase,
  job_reassigned: Truck,
  adjustment_requested: Briefcase,
  quote_saved: Briefcase,
  settings_reset: UserRound,
  info: Bell,
};

const SEVERITY_STYLES: Record<NotificationSeverity, string> = {
  info: "bg-primary/15 text-primary border-primary/30",
  warning: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

type FilterValue = "all" | "unread" | NotificationSeverity;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "danger", label: "Critical" },
  { value: "warning", label: "Warnings" },
  { value: "info", label: "Info" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export default function NotificationsPage() {
  const allItems = useNotifications((s) => s.items);
  const markRead = useNotifications((s) => s.markRead);
  const markUnread = useNotifications((s) => s.markUnread);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const remove = useNotifications((s) => s.remove);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const [filter, setFilter] = useState<FilterValue>("all");

  // Only this role's notifications — Marketing never sees fleet/payroll, etc.
  const items = useMemo(
    () => filterNotificationsForRole(allItems, activeRoleId),
    [allItems, activeRoleId],
  );

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return !n.read;
      return n.severity === filter;
    });
  }, [items, filter]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      unread: items.filter((n) => !n.read).length,
      danger: items.filter((n) => n.severity === "danger").length,
      warning: items.filter((n) => n.severity === "warning").length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Every signal that needs attention — pulled live from expenses, claims, invoices, payroll and fleet."
        actions={
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={markAllRead}
            disabled={summary.unread === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total" value={summary.total} />
        <Stat label="Unread" value={summary.unread} tone="primary" />
        <Stat label="Warnings" value={summary.warning} tone="warning" />
        <Stat label="Critical" value={summary.danger} tone="danger" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
            <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  filter === f.value
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="space-y-2 p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-semibold">No notifications</p>
              <p className="text-xs text-muted-foreground">
                {filter === "all"
                  ? "You're all caught up."
                  : "Nothing in this view."}
              </p>
            </div>
          ) : (
            filtered.map((n) => {
              const Icon = ICONS[n.kind] ?? Bell;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/30",
                    !n.read && "bg-primary/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                      SEVERITY_STYLES[n.severity],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {n.audience && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          For {n.audience}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {n.href && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => markRead(n.id)}
                      >
                        <Link href={n.href}>Open</Link>
                      </Button>
                    )}
                    {n.read ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px]"
                        onClick={() => markUnread(n.id)}
                      >
                        Mark unread
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px]"
                        onClick={() => markRead(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    {!n.sourceKey && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => remove(n.id)}
                        title="Dismiss"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "warning" | "danger";
}) {
  return (
    <Card
      className={cn(
        "p-4",
        tone === "primary" && "border-primary/40 bg-primary/[0.04]",
        tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]",
        tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
    </Card>
  );
}
