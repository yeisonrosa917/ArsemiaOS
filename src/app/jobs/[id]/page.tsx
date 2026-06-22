import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { jobs } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { JobDetail } from "@/components/jobs/job-detail";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/jobs">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to jobs
        </Link>
      </Button>
      <JobDetail job={job} />
    </div>
  );
}
