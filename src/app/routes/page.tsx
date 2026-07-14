"use client";

import { ScheduleView } from "@/components/operations/schedule-view";

/**
 * /routes is redirected to /operations?tab=assignments (next.config.mjs).
 * Since Sprint 2.2 the Schedule tab no longer exists in the Operations
 * shell; this wrapper keeps the old daily schedule reachable only if the
 * redirect is ever removed.
 */
export default function RoutesPage() {
  return <ScheduleView />;
}
