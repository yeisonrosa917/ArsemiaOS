import Link from "next/link";
import { Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { DispatchBoard } from "@/components/dispatch/dispatch-board";

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch board"
        description="Real-time control room — assign drivers, optimize routes, and monitor every move in flight."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Radio className="h-4 w-4 text-emerald-500" />
              Live • 7 foremen
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/quotes?type=job">
                <Plus className="h-4 w-4" />
                New job
              </Link>
            </Button>
          </>
        }
      />
      <DispatchBoard />
    </div>
  );
}
