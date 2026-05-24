"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jobsByStatus } from "@/lib/mock-data";
import type { JobStatus } from "@/lib/types";

const COLORS: Record<JobStatus, string> = {
  Unassigned: "#94a3b8",
  Assigned: "#0ea5e9",
  "En Route": "#8b5cf6",
  "Pickup Started": "#f59e0b",
  "Pickup Completed": "#fbbf24",
  "Delivery Started": "#3b62ff",
  Completed: "#10b981",
  Cancelled: "#f43f5e",
};

export function JobsStatusChart() {
  const total = jobsByStatus.reduce((sum, j) => sum + j.count, 0);

  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle>Jobs by status</CardTitle>
        <CardDescription>Live operational mix</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={jobsByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={56}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {jobsByStatus.map((entry) => (
                  <Cell key={entry.status} fill={COLORS[entry.status]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Active jobs
            </p>
            <p className="text-2xl font-semibold tracking-tight">{total}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {jobsByStatus.map((entry) => (
            <li
              key={entry.status}
              className="flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: COLORS[entry.status] }}
                />
                {entry.status}
              </span>
              <span className="font-semibold text-foreground">
                {entry.count}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
