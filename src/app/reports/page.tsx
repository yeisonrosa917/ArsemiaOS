"use client";

import dynamic from "next/dynamic";

/**
 * Reports & Intelligence (Sprint 1 IA shell).
 *
 * Repositions the former Analytics page under the Reports workspace name.
 * The content is the existing analytics page unchanged — still local/demo
 * data. Business-specific intelligence reports (sales conversion, foreman
 * revenue vs claims, storage exposure, …) are a later phase.
 */

const AnalyticsView = dynamic(() => import("@/app/analytics/page"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  ),
});

export default function ReportsPage() {
  return <AnalyticsView />;
}
