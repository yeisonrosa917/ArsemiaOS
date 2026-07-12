"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * Operations Control workspace (Sprint 1 IA shell).
 *
 * Hosts the existing Dispatch board and Routes/Schedule pages as lazy tabs —
 * the pages themselves are unchanged and share the same stores as before.
 * Old URLs (/dispatch, /routes) redirect here via next.config. The full
 * 7-tab Operations Control (roster, trucks, capacity, map, alerts) is
 * Sprint 2 scope.
 */

const DispatchBoard = dynamic(
  () => import("@/components/dispatch/dispatch-board").then((m) => m.DispatchBoard),
  { ssr: false, loading: () => <TabLoading /> },
);
const ScheduleView = dynamic(() => import("@/app/routes/page"), {
  ssr: false,
  loading: () => <TabLoading />,
});

type TabId = "board" | "schedule";

function OperationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps = resolveCapabilities(activeRoleId, overrides);

  const tabs: { id: TabId; label: string; allowed: boolean }[] = [
    { id: "board", label: "Dispatch Board", allowed: caps.includes("dispatch.view") },
    { id: "schedule", label: "Schedule / Routes", allowed: caps.includes("routes.view") },
  ];
  const visible = tabs.filter((t) => t.allowed);

  const param = searchParams.get("tab") as TabId | null;
  const initial: TabId =
    param && visible.some((t) => t.id === param) ? param : (visible[0]?.id ?? "board");
  const [tab, setTab] = useState<TabId>(initial);

  // Keep state in sync when arriving via redirect with ?tab=.
  useEffect(() => {
    if (param && param !== tab && visible.some((t) => t.id === param)) setTab(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  const select = (id: TabId) => {
    setTab(id);
    router.replace(`/operations?tab=${id}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operations Control"
        description="The daily command room — dispatch, schedule and routing in one workspace. Roster, trucks, capacity and alerts arrive in the next phase."
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
      {tab === "board" && caps.includes("dispatch.view") && <DispatchBoard />}
      {tab === "schedule" && caps.includes("routes.view") && <ScheduleView />}
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
