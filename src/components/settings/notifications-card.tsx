"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/lib/store/notifications";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<{
  key: string;
  label: string;
  description: string;
}> = [
  { key: "expenses", label: "Expense reviews", description: "Pending approvals, missing receipts." },
  { key: "claims", label: "Claims", description: "Foreman response needed, resolution updates." },
  { key: "invoices", label: "Invoices", description: "Overdue, paid, voided." },
  { key: "payroll", label: "Payroll", description: "Flagged or pending periods." },
  { key: "fleet", label: "Fleet reminders", description: "Maintenance, insurance, registration windows." },
  { key: "jobs", label: "Jobs", description: "Unassigned and reassigned alerts." },
];

export function NotificationsSettingsCard() {
  const items = useNotifications((s) => s.items);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const unread = items.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Notifications
        </CardTitle>
        <CardDescription>
          Decide which signals reach you. The Notification Center auto-syncs
          with expenses, claims, invoices, fleet and payroll data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
          <div>
            <p className="text-sm font-semibold">{items.length} active signal{items.length !== 1 ? "s" : ""}</p>
            <p className="text-[11px] text-muted-foreground">
              {unread} unread · {items.filter((n) => n.severity === "danger").length} critical
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/notifications">Open center</Link>
            </Button>
            <Button size="sm" onClick={markAllRead} disabled={unread === 0} className="gap-1">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </p>
          <ul className="mt-2 space-y-1.5">
            {CATEGORIES.map((c) => (
              <li
                key={c.key}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-2.5",
                )}
              >
                <div>
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="text-[11px] text-muted-foreground">{c.description}</p>
                </div>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  In-app on
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Email/SMS toggles ship with the Integrations layer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
