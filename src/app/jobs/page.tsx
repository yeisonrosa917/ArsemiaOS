import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { JobsTable } from "@/components/jobs/jobs-table";
import { jobs } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function JobsPage() {
  const total = jobs.length;
  const revenue = jobs.reduce((sum, j) => sum + j.price, 0);
  const cuFt = jobs.reduce((sum, j) => sum + j.cuFt, 0);
  const completed = jobs.filter((j) => j.status === "Completed").length;

  const stats = [
    { label: "Total jobs", value: total.toString() },
    { label: "Booked revenue", value: formatCurrency(revenue) },
    { label: "Volume moved", value: `${cuFt.toLocaleString()} CuFt` },
    {
      label: "Completion rate",
      value: `${((completed / total) * 100).toFixed(0)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Every move, delivery, and pickup across the fleet. Filter by status, type, or driver to drill in."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New job
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <JobsTable />
    </div>
  );
}
