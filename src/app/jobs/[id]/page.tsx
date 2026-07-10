"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetail } from "@/components/jobs/job-detail";
import { useJobsStore } from "@/lib/store/jobs";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // Read from the shared jobs store (seeded from all-jobs) so jobs created from
  // a lead/quote booking are viewable here, not just the static seed jobs.
  const job = useJobsStore((s) => s.jobs.find((j) => j.id === id));

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/jobs">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to jobs
        </Link>
      </Button>
      {job ? (
        <JobDetail job={job} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-semibold">Job not found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This job doesn&apos;t exist in the current workspace.
          </p>
        </div>
      )}
    </div>
  );
}
