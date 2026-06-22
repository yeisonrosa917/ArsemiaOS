import { PageHeader } from "@/components/layout/page-header";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="The veins of the operation — every job from lead to paid. Drag cards between stages to move them through the lifecycle."
      />
      <PipelineBoard />
    </div>
  );
}
