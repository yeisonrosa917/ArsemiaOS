import { PageHeader } from "@/components/layout/page-header";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default function OperationsBoardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Board"
        description="Post-booking operational view — every job from booked to completed. Drag cards between operational stages. (Sales Pipeline lives under Sales.)"
      />
      <PipelineBoard />
    </div>
  );
}
