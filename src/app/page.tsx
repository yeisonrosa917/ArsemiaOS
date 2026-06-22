import {
  CalendarDays,
  Coins,
  Download,
  PackageCheck,
  ShieldAlert,
  Truck,
  UserSquare2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { JobsStatusChart } from "@/components/dashboard/jobs-status-chart";
import { RecentJobsTable } from "@/components/dashboard/recent-jobs-table";
import { MapRoutePreview } from "@/components/dashboard/map-preview";
import { DriverActivityCard } from "@/components/dashboard/driver-activity-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { kpiSnapshot } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations overview"
        description="Friday, May 24 • Live snapshot of dispatch, fleet, and revenue across all zones."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Today
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <Truck className="h-4 w-4" />
              Open dispatch board
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Jobs today"
          value={String(kpiSnapshot.jobsToday)}
          delta={kpiSnapshot.jobsTodayDelta}
          icon={PackageCheck}
          accent="brand"
        />
        <KpiCard
          label="Active foremen"
          value={String(kpiSnapshot.activeDrivers)}
          delta={kpiSnapshot.activeDriversDelta}
          deltaSuffix=""
          icon={UserSquare2}
          accent="emerald"
        />
        <KpiCard
          label="Pending deliveries"
          value={String(kpiSnapshot.pendingDeliveries)}
          delta={kpiSnapshot.pendingDeliveriesDelta}
          deltaSuffix=""
          positiveIsGood={false}
          icon={Truck}
          accent="sky"
        />
        <KpiCard
          label="Revenue today"
          value={formatCurrency(kpiSnapshot.revenueToday)}
          delta={kpiSnapshot.revenueTodayDelta}
          icon={Coins}
          accent="violet"
        />
        <KpiCard
          label="Payroll due"
          value={formatCurrency(kpiSnapshot.payrollDue)}
          delta={kpiSnapshot.payrollDueDelta}
          positiveIsGood={false}
          icon={Coins}
          accent="amber"
        />
        <KpiCard
          label="Open claims"
          value={String(kpiSnapshot.openClaims)}
          delta={kpiSnapshot.openClaimsDelta}
          deltaSuffix=""
          positiveIsGood={false}
          icon={ShieldAlert}
          accent="rose"
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <RevenueChart />
        <JobsStatusChart />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <RecentJobsTable />
        <MapRoutePreview />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <DriverActivityCard />
        <AlertsCard />
      </div>
    </div>
  );
}
