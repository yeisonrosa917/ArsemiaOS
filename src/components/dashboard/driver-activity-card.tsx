"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DriverStatusBadge } from "@/components/shared/status-badge";
import { driverActivity, drivers } from "@/lib/mock-data";
import { cn, initials } from "@/lib/utils";

export function DriverActivityCard() {
  const activeDrivers = drivers
    .filter((d) => d.status === "On Job" || d.status === "En Route")
    .slice(0, 4);

  return (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Driver activity</CardTitle>
          <CardDescription>
            Live status • {activeDrivers.length} drivers on the road
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={driverActivity}
                  margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
                  barCategoryGap={4}
                >
                  <XAxis
                    dataKey="hour"
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="active"
                    radius={[6, 6, 0, 0]}
                    fill="url(#driverFill)"
                  />
                  <defs>
                    <linearGradient id="driverFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b62ff" />
                      <stop offset="100%" stopColor="#3b62ff" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Peak crew utilization: 9 AM – 3 PM
            </p>
          </div>

          <ul className="space-y-2">
            {activeDrivers.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={cn("text-white", d.avatarColor)}>
                    {initials(d.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    <DriverStatusBadge status={d.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.vehicleName} • {d.currentLocation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    ETA
                  </p>
                  <p className="text-sm font-semibold">{d.eta ?? "—"}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
