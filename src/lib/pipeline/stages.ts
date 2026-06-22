import type { JobStatus } from "@/lib/types";

export type PipelineStage =
  | "new_quote"
  | "booked"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface PipelineStageMeta {
  id: PipelineStage;
  label: string;
  accent: string;
  description: string;
}

export const PIPELINE_STAGES: PipelineStageMeta[] = [
  {
    id: "new_quote",
    label: "New / Quote",
    accent: "from-violet-400/30 to-violet-500/10",
    description: "Inbound leads, quotes drafted but not yet booked.",
  },
  {
    id: "booked",
    label: "Booked",
    accent: "from-blue-400/30 to-blue-500/10",
    description: "Customer accepted the quote; awaiting driver assignment.",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    accent: "from-cyan-400/30 to-cyan-500/10",
    description: "Driver and crew assigned; date on calendar.",
  },
  {
    id: "in_progress",
    label: "In Progress",
    accent: "from-amber-400/30 to-amber-500/10",
    description: "Crew is en route, picking up, or delivering.",
  },
  {
    id: "completed",
    label: "Completed",
    accent: "from-emerald-400/30 to-emerald-500/10",
    description: "Delivered. Awaiting invoice / payroll close.",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    accent: "from-rose-400/30 to-rose-500/10",
    description: "Job cancelled or refunded.",
  },
];

const STATUS_TO_STAGE: Record<JobStatus, PipelineStage> = {
  Unassigned: "booked",
  Assigned: "scheduled",
  "En Route": "in_progress",
  "Pickup Started": "in_progress",
  "Pickup Completed": "in_progress",
  "Delivery Started": "in_progress",
  Completed: "completed",
  Cancelled: "cancelled",
};

const STAGE_TO_STATUS: Record<PipelineStage, JobStatus | null> = {
  new_quote: null,
  booked: "Unassigned",
  scheduled: "Assigned",
  in_progress: "En Route",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function stageOf(status: JobStatus): PipelineStage {
  return STATUS_TO_STAGE[status];
}

export function statusForStage(stage: PipelineStage): JobStatus | null {
  return STAGE_TO_STATUS[stage];
}
