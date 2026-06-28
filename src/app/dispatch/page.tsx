import { PageHeader } from "@/components/layout/page-header";
import { DispatchBoard } from "@/components/dispatch/dispatch-board";

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch board"
        description="Real-time control room — assign foremen, monitor jobs in flight, call customers from the live feed."
      />
      <DispatchBoard />
    </div>
  );
}
