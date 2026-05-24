"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jobsByZone, revenueByMonth } from "@/lib/mock-data";
import { formatCompactCurrency } from "@/lib/utils";

const ZONE_COLORS = ["#3b62ff", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9"];

const efficiency = [
  { week: "W1", utilization: 68, onTime: 91 },
  { week: "W2", utilization: 72, onTime: 93 },
  { week: "W3", utilization: 75, onTime: 92 },
  { week: "W4", utilization: 79, onTime: 94 },
  { week: "W5", utilization: 82, onTime: 95 },
  { week: "W6", utilization: 84, onTime: 94 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Trend lines, mix analysis, and operational efficiency across the platform."
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Last 90 days
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <CardTitle>Revenue & payroll trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueByMonth}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactCurrency(Number(v))}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatCompactCurrency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b62ff"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payroll"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Jobs by zone</CardTitle>
            <CardDescription>Volume mix this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobsByZone}
                    dataKey="value"
                    nameKey="zone"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {jobsByZone.map((_, i) => (
                      <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1 text-xs">
              {jobsByZone.map((z, i) => (
                <li key={z.zone} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: ZONE_COLORS[i] }}
                    />
                    {z.zone}
                  </span>
                  <span className="font-semibold">{z.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>Operational efficiency</CardTitle>
            <CardDescription>
              Vehicle utilization vs on-time delivery, last 6 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={efficiency}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="utilization"
                    fill="#3b62ff"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar dataKey="onTime" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Fleet utilization up 16 points QoQ; on-time rate stable above 90%.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
