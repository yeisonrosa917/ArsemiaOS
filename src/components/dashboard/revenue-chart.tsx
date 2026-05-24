"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revenueByDay, revenueByMonth } from "@/lib/mock-data";
import { formatCompactCurrency } from "@/lib/utils";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elevated">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="mt-1 flex items-center gap-2 font-medium"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="capitalize text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-semibold text-foreground">
            {formatCompactCurrency(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function RevenueChart() {
  return (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Revenue performance</CardTitle>
          <CardDescription>
            Revenue vs payroll • Last 6 months
          </CardDescription>
        </div>
        <Tabs defaultValue="month">
          <TabsList className="h-8">
            <TabsTrigger value="week" className="h-6 text-xs">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="h-6 text-xs">
              Month
            </TabsTrigger>
            <TabsTrigger value="year" className="h-6 text-xs">
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-6 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Month-to-date revenue
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              $542,000
              <span className="ml-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                +5.0%
              </span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Payroll
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              $178,000
              <span className="ml-2 text-sm font-medium text-rose-600 dark:text-rose-400">
                +6.0%
              </span>
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueByMonth}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b62ff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3b62ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="payrollFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompactCurrency(Number(v))}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b62ff"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
              />
              <Area
                type="monotone"
                dataKey="payroll"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#payrollFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2 text-center">
          {revenueByDay.map((d) => (
            <div
              key={d.day}
              className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {d.day}
              </p>
              <p className="text-xs font-semibold text-foreground">
                {formatCompactCurrency(d.revenue)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
