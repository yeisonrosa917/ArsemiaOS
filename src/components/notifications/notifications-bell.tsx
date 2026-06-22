"use client";

import Link from "next/link";
import {
  Bell,
  BellOff,
  Briefcase,
  Coins,
  ShieldAlert,
  Truck,
  UserRound,
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
} from "@/lib/store/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  job_reassigned: Truck,
  job_updated: Briefcase,
  lead_new: UserRound,
  payroll_flag: Coins,
  claim_new: ShieldAlert,
  info: Bell,
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
  const { items, markRead, markAllRead, clear } = useNotifications();
  const unread = items.filter((n) => !n.read).length;

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
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="px-0 py-0">
            Notifications
          </DropdownMenuLabel>
          <div className="flex gap-1">
            <button
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Mark all read
            </button>
            <span className="text-muted-foreground/50">·</span>
            <button
              onClick={clear}
              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
              <BellOff className="h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">No notifications</p>
            </div>
          )}
          {items.map((n) => {
            const Icon = ICONS[n.kind];
            const Wrapper = n.href ? Link : "div";
            return (
              <Wrapper
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex items-start gap-2.5 border-b border-border/40 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent/30",
                  !n.read && "bg-primary/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    !n.read
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-tight">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </Wrapper>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
