"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { allJobs } from "@/lib/data/all-jobs";
import { useLeads, isOpenStage } from "@/lib/store/leads";
import { useExpenses } from "@/lib/store/expenses";
import { payrollLinesAll } from "@/lib/payroll/data";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9", "#ef4444", "#14b8a6"];
const MONTHS = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
const MONTH_LABEL: Record<string, string> = {
  "2026-04": "Apr", "2026-05": "May", "2026-06": "Jun",
  "2026-07": "Jul", "2026-08": "Aug", "2026-09": "Sep",
};
const TODAY = "2026-07-02";

export default function AnalyticsPage() {
  const leads = useLeads((s) => s.leads);
  const expenses = useExpenses((s) => s.items);

  const revenueByMonth = useMemo(() => {
    const m: Record<string, { actual: number; booked: number }> = {};
    MONTHS.forEach((k) => (m[k] = { actual: 0, booked: 0 }));
    allJobs.forEach((j) => {
      const key = (j.scheduledAt ?? "").slice(0, 7);
      if (!m[key]) return;
      if (j.status === "Cancelled") return;
      if (j.status === "Completed") m[key].actual += j.price;
      else m[key].booked += j.price;
    });
    return MONTHS.map((k) => ({ month: MONTH_LABEL[k], ...m[k] }));
  }, []);

  const totals = useMemo(() => {
    const active = allJobs.filter((j) => j.status !== "Cancelled");
    const completed = active.filter((j) => j.status === "Completed");
    const future = active.filter((j) => (j.scheduledAt ?? "") > TODAY);
    const revenue = completed.reduce((s, j) => s + j.price, 0);
    const pipeline = future.reduce((s, j) => s + j.price, 0);
    const payroll = payrollLinesAll.reduce((s, p) => s + p.foremanPayout, 0);
    return {
      revenue,
      pipeline,
      payroll,
      payrollPct: revenue > 0 ? (payroll / revenue) * 100 : 0,
      completedCount: completed.length,
      futureCount: future.length,
    };
  }, []);

  const funnel = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter((l) => l.stage !== "New Lead").length;
    const quoted = leads.filter((l) => ["Quote Sent", "Follow-Up Needed", "Booked", "Converted to Job"].includes(l.stage)).length;
    const booked = leads.filter((l) => l.stage === "Booked" || l.stage === "Converted to Job").length;
    return {
      rows: [
        { stage: "Leads", n: total },
        { stage: "Contacted", n: contacted },
        { stage: "Quoted", n: quoted },
        { stage: "Booked", n: booked },
      ],
      leadToBooking: total > 0 ? (booked / total) * 100 : 0,
      quoteToBooking: quoted > 0 ? (booked / quoted) * 100 : 0,
      open: leads.filter((l) => isOpenStage(l.stage)).length,
    };
  }, [leads]);

  const bySource = useMemo(() => {
    const m: Record<string, { leads: number; booked: number }> = {};
    leads.forEach((l) => {
      m[l.source] ??= { leads: 0, booked: 0 };
      m[l.source].leads++;
      if (l.stage === "Booked" || l.stage === "Converted to Job") m[l.source].booked++;
    });
    return Object.entries(m).map(([source, v]) => ({ source, ...v }));
  }, [leads]);

  const byForeman = useMemo(() => {
    const m: Record<string, number> = {};
    allJobs.forEach((j) => {
      if (j.status === "Cancelled" || !j.driverName) return;
      m[j.driverName] = (m[j.driverName] ?? 0) + j.price;
    });
    return Object.entries(m)
      .map(([name, revenue]) => ({ name: name.split(" ")[0], revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, []);

  const byType = useMemo(() => {
    const m: Record<string, number> = {};
    allJobs.forEach((j) => {
      if (j.status === "Cancelled") return;
      m[j.type] = (m[j.type] ?? 0) + j.price;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  const expByCategory = useMemo(() => {
    const m: Record<string, number> = {};
    expenses.forEach((e) => (m[e.category] = (m[e.category] ?? 0) + e.amount));
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, sales conversion, and forecast — computed live from jobs, leads, payroll, and expenses through September."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Revenue (completed)" value={formatCurrency(totals.revenue)} hint={`${totals.completedCount} jobs`} />
        <Kpi label="Booked pipeline" value={formatCurrency(totals.pipeline)} hint={`${totals.futureCount} future jobs`} tone="primary" />
        <Kpi label="Lead → booking" value={`${funnel.leadToBooking.toFixed(0)}%`} hint={`${funnel.open} open leads`} />
        <Kpi label="Payroll vs revenue" value={`${totals.payrollPct.toFixed(0)}%`} hint={formatCurrency(totals.payroll)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> Revenue by month — actual vs booked (forecast)
          </CardTitle>
          <CardDescription>Completed revenue plus booked/scheduled work through September.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11 }} width={54} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="actual" name="Completed" stackId="a" fill="#2563eb" />
              <Bar dataKey="booked" name="Booked / forecast" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales funnel</CardTitle>
            <CardDescription>
              Lead → booking {funnel.leadToBooking.toFixed(0)}% · Quote → booking {funnel.quoteToBooking.toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel.rows} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} width={72} />
                <Tooltip />
                <Bar dataKey="n" name="Leads" radius={[0, 4, 4, 0]}>
                  {funnel.rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by job type</CardTitle>
            <CardDescription>Share of booked + completed revenue.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by foreman</CardTitle>
            <CardDescription>Top earners across the schedule.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byForeman}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11 }} width={54} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead source performance</CardTitle>
            <CardDescription>Leads in vs booked, by source.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySource}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="booked" name="Booked" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses by category</CardTitle>
          <CardDescription>Where field spend goes.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expByCategory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11 }} width={54} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" name="Spend" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "primary";
}) {
  return (
    <Card className={cn("border p-4", tone === "primary" && "border-primary/40 bg-primary/[0.04]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
    </Card>
  );
}
