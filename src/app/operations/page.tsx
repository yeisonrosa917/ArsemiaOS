"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DateNavigator } from "@/components/calendar/date-navigator";
import { useJobsStore } from "@/lib/store/jobs";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * Operations Control workspace (Sprint 2).
 *
 * The daily command room: Dispatch Board · Schedule/Routes · Foreman Roster ·
 * Truck Assignment · Capacity & Load · Alerts. One shared selected date drives
 * every tab via the full-width DateNavigator. Tabs lazy-mount; Board and
 * Schedule reuse the existing components unchanged in behavior. All data is
 * the existing local demo stores.
 */

const DispatchBoard = dynamic(
  () => import("@/components/dispatch/dispatch-board").then((m) => m.DispatchBoard),
  { ssr: false, loading: () => <TabLoading /> },
);
const ScheduleView = dynamic(
  () => import("@/components/operations/schedule-view").then((m) => m.ScheduleView),
  { ssr: false, loading: () => <TabLoading /> },
);
const ForemanRoster = dynamic(
  () => import("@/components/operations/foreman-roster").then((m) => m.ForemanRoster),
  { ssr: false, loading: () => <TabLoading /> },
);
const TruckAssignment = dynamic(
  () => import("@/components/operations/truck-assignment").then((m) => m.TruckAssignment),
  { ssr: false, loading: () => <TabLoading /> },
);
const CapacityLoad = dynamic(
  () => import("@/components/operations/capacity-load").then((m) => m.CapacityLoad),
  { ssr: false, loading: () => <TabLoading /> },
);
const OpsAlerts = dynamic(
  () => import("@/components/operations/ops-alerts").then((m) => m.OpsAlerts),
  { ssr: false, loading: () => <TabLoading /> },
);

type TabId = "board" | "schedule" | "roster" | "trucks" | "capacity" | "alerts";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function OperationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps = resolveCapabilities(activeRoleId, overrides);
  const jobs = useJobsStore((s) => s.jobs);

  const canDispatch = caps.includes("dispatch.view");
  const canRoutes = caps.includes("routes.view");
  const tabs: { id: TabId; label: string; allowed: boolean }[] = [
    { id: "board", label: "Dispatch Board", allowed: canDispatch },
    { id: "schedule", label: "Schedule / Routes", allowed: canRoutes },
    { id: "roster", label: "Foreman Roster", allowed: caps.includes("drivers.view") },
    { id: "trucks", label: "Truck Assignment", allowed: caps.includes("fleet.view") },
    { id: "capacity", label: "Capacity & Load", allowed: canDispatch || canRoutes },
    { id: "alerts", label: "Alerts", allowed: canDispatch || canRoutes },
  ];
  const visible = tabs.filter((t) => t.allowed);

  const param = searchParams.get("tab") as TabId | null;
  const initial: TabId =
    param && visible.some((t) => t.id === param) ? param : (visible[0]?.id ?? "board");
  const [tab, setTab] = useState<TabId>(initial);

  // Shared operational date across every tab.
  const [date, setDate] = useState<string>(todayISO());

  // Per-day job counts for the navigator strip.
  const dayCounts = useMemo(() => {
    const m: Record<string, number> = {};
    jobs.forEach((j) => {
      const d = (j.scheduledAt ?? "").slice(0, 10);
      if (!d) return;
      if (j.status === "Cancelled") return;
      m[d] = (m[d] ?? 0) + 1;
    });
    return m;
  }, [jobs]);

  // Keep tab state in sync when arriving via redirect with ?tab=.
  useEffect(() => {
    if (param && param !== tab && visible.some((t) => t.id === param)) setTab(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  const select = (id: TabId) => {
    setTab(id);
    router.replace(`/operations?tab=${id}`, { scroll: false });
  };

  const allowed = (id: TabId) => visible.some((t) => t.id === id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operations Control"
        description="The daily command room — dispatch, schedule, roster, trucks, capacity and alerts share one operational date. Demo data (local only)."
      />

      <DateNavigator
        selectedDate={date}
        onDateChange={setDate}
        variant="full"
        dayCounts={dayCounts}
      />

      <div className="flex flex-wrap gap-1 border-b border-border">
        {visible.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={cn(
              "rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "board" && allowed("board") && (
        <DispatchBoard selectedDate={date} onDateChange={setDate} hideDateStrip />
      )}
      {tab === "schedule" && allowed("schedule") && (
        <ScheduleView selectedDate={date} onDateChange={setDate} />
      )}
      {tab === "roster" && allowed("roster") && <ForemanRoster selectedDate={date} />}
      {tab === "trucks" && allowed("trucks") && <TruckAssignment selectedDate={date} />}
      {tab === "capacity" && allowed("capacity") && <CapacityLoad selectedDate={date} />}
      {tab === "alerts" && allowed("alerts") && <OpsAlerts selectedDate={date} />}
    </div>
  );
}

function TabLoading() {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export default function OperationsPage() {
  return (
    <Suspense fallback={<TabLoading />}>
      <OperationsContent />
    </Suspense>
  );
}
