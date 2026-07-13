"use client";

import { ScheduleView } from "@/components/operations/schedule-view";

/**
 * /routes is redirected to /operations?tab=schedule (next.config.mjs).
 * The view body lives in components/operations/schedule-view.tsx and is
 * mounted by the Operations shell; this wrapper keeps the module valid if
 * the redirect is ever removed.
 */
export default function RoutesPage() {
  return <ScheduleView />;
}
