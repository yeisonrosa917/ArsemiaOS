import { AlertTriangle, FileWarning, ShieldAlert, Wrench } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    icon: ShieldAlert,
    tone: "danger",
    title: "Open claim CLM-880",
    detail: "Atelier West Inc — $4,200 at risk, photos pending.",
    time: "2h ago",
  },
  {
    icon: FileWarning,
    tone: "warning",
    title: "DOT expiring soon",
    detail: "Jamal Carter — medical card renews 2026-05-30.",
    time: "today",
  },
  {
    icon: AlertTriangle,
    tone: "warning",
    title: "Payroll audit flags",
    detail: "3 lines flagged — review CuFt minimum on JOB-10423.",
    time: "5h ago",
  },
  {
    icon: Wrench,
    tone: "info",
    title: "Maintenance scheduled",
    detail: "Truck #220 in service bay, ETA tomorrow 8am.",
    time: "yesterday",
  },
] as const;

const toneStyles = {
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
} as const;

export function AlertsCard() {
  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle>Operations alerts</CardTitle>
        <CardDescription>
          Items requiring dispatcher attention today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.title}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneStyles[alert.tone]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {alert.title}
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {alert.detail}
                </p>
              </div>
            </div>
          );
        })}
        <Badge variant="outline" className="mt-2 w-full justify-center py-1.5">
          View all alerts
        </Badge>
      </CardContent>
    </Card>
  );
}
