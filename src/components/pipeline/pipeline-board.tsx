"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  MapPin,
  Truck,
} from "lucide-react";
import { jobs as seedJobs } from "@/lib/data";
import type { Job, JobStatus } from "@/lib/types";
import {
  PIPELINE_STAGES,
  stageOf,
  statusForStage,
  type PipelineStage,
} from "@/lib/pipeline/stages";
import { Card, CardContent } from "@/components/ui/card";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

export function PipelineBoard() {
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<PipelineStage | null>(null);

  const groups = useMemo(() => {
    const map: Record<PipelineStage, Job[]> = {
      new_quote: [],
      booked: [],
      scheduled: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };
    for (const j of jobs) {
      map[stageOf(j.status)].push(j);
    }
    return map;
  }, [jobs]);

  const moveJobTo = (jobId: string, stage: PipelineStage) => {
    const newStatus = statusForStage(stage);
    if (!newStatus) return;
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
    );
  };

  return (
    <div className="grid auto-rows-min grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {PIPELINE_STAGES.map((stage) => {
        const items = groups[stage.id];
        const isTarget = dropTarget === stage.id;
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault();
              if (dropTarget !== stage.id) setDropTarget(stage.id);
            }}
            onDragLeave={() => {
              if (dropTarget === stage.id) setDropTarget(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const jobId = e.dataTransfer.getData("text/job-id");
              if (jobId) moveJobTo(jobId, stage.id);
              setDropTarget(null);
              setDraggingId(null);
            }}
            className={cn(
              "flex min-h-[280px] flex-col rounded-2xl border border-border bg-card/40 transition-colors",
              isTarget && "border-primary bg-primary/[0.04] shadow-elevated",
            )}
          >
            <div
              className={cn(
                "rounded-t-2xl bg-gradient-to-br px-3 py-2.5",
                stage.accent,
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {stage.label}
                </p>
                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                  {items.length}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                {stage.description}
              </p>
            </div>
            <div className="flex-1 space-y-1.5 p-2 scrollbar-thin overflow-y-auto max-h-[60vh]">
              {items.length === 0 && (
                <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-3 text-center text-[10px] text-muted-foreground">
                  Drop a job here
                </p>
              )}
              {items.map((j) => (
                <JobCard
                  key={j.id}
                  job={j}
                  isDragging={draggingId === j.id}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/job-id", j.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(j.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDropTarget(null);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JobCard({
  job,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  job: Job;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab select-none border-border/60 transition-all active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary",
        job.priority === "High" && "border-l-2 border-l-primary",
      )}
    >
      <CardContent className="space-y-1.5 p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{job.customer}</p>
            <p className="text-[10px] text-muted-foreground">
              #{job.id} · {job.type}
            </p>
          </div>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold">
            {fmtUSD(job.price)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{job.pickupCity}</span>
          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{job.deliveryCity}</span>
        </div>
        {job.driverName && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Truck className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{job.driverName}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <CalendarClock className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">
            {new Date(job.scheduledAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
