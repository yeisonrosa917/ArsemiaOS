"use client";

import Link from "next/link";
import {
  Bell,
  BellOff,
  Briefcase,
  CheckCheck,
  Coins,
  FileText,
  ReceiptText,
  ShieldAlert,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
  info: "bg-primary/15 text-primary",
  warning: "bg-amber-500/15 text-amber-600",
  danger: "bg-rose-500/15 text-rose-600",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationsBell() {
  const allItems = useNotifications((s) => s.items);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  // Only show notifications routed to the active role.
  const items = filterNotificationsForRole(allItems, activeRoleId);
  const unread = items.filter((n) => !n.read).length;
  const visible = items.slice(0, 8);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="px-0 py-0">
            Notifications {unread > 0 && <span className="ml-1 text-muted-foreground">· {unread} unread</span>}
          </DropdownMenuLabel>
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <CheckCheck className="h-3 w-3" /> Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {visible.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
              <BellOff className="h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          )}
          {visible.map((n) => {
            const Icon = ICONS[n.kind] ?? Bell;
            return (
              <Link
                key={n.id}
                href={n.href ?? "/notifications"}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex items-start gap-2.5 border-b border-border/40 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent/30",
                  !n.read && "bg-primary/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    !n.read ? SEVERITY_STYLES[n.severity] : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-tight">{n.title}</p>
                  <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <Link
          href="/notifications"
          className="block px-3 py-2 text-center text-[11px] font-semibold text-primary hover:bg-accent/30"
        >
          View all notifications →
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
