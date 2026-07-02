"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  JobStatusBadge,
  PayrollStatusBadge,
} from "@/components/shared/status-badge";
import { jobStatuses } from "@/lib/mock-data";
import { allJobs as jobs } from "@/lib/data/all-jobs";
import type { JobStatus, JobType } from "@/lib/types";
import { usePreferences } from "@/lib/store/preferences";
import { getActiveForemanId, getUserByRole } from "@/lib/auth/users";
import { cn, formatCurrency, initials } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

const TYPES: (JobType | "All")[] = [
  "All",
  "Local Move",
  "Long Distance",
  "Delivery",
  "Storage In",
  "Storage Out",
  "Pickup",
  "Commercial",
];

export function JobsTable() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<JobType | "All">("All");
  const [status, setStatus] = useState<JobStatus | "All">("All");

  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const foremanId = getActiveForemanId(activeRoleId);
  const foremanName = foremanId ? getUserByRole(activeRoleId).name : null;

  // A foreman only sees the jobs they are assigned to (driver or crew member).
  const scopedJobs = useMemo(() => {
    if (!foremanId) return jobs;
    return jobs.filter(
      (j) =>
        j.driverId === foremanId ||
        j.driverName === foremanName ||
        j.crew.includes(foremanName ?? " "),
    );
  }, [foremanId, foremanName]);

  const rows = useMemo(() => {
    return scopedJobs.filter((j) => {
      if (type !== "All" && j.type !== type) return false;
      if (status !== "All" && j.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !`${j.id} ${j.customer} ${j.pickup} ${j.delivery} ${j.driverName ?? ""}`
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      return true;
    });
  }, [scopedJobs, search, type, status]);

  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="border-b p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, customers, addresses..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as JobType | "All")}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Types" : t}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus | "All")}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="All">All Status</option>
              {jobStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <ChipButton
            label="All"
            count={scopedJobs.length}
            active={status === "All"}
            onClick={() => setStatus("All")}
          />
          {jobStatuses.map((s) => (
            <ChipButton
              key={s}
              label={s}
              count={scopedJobs.filter((j) => j.status === s).length}
              active={status === s}
              onClick={() => setStatus(s)}
            />
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Job</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">CuFt</TableHead>
            <TableHead className="text-right">Miles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Driver / Crew</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Payroll</TableHead>
            <TableHead className="pr-5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="pl-5">
                <p className="font-mono text-xs text-muted-foreground">
                  {job.id}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {formatDateTimeStable(job.scheduledAt, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </TableCell>
              <TableCell className="font-medium">{job.customer}</TableCell>
              <TableCell className="max-w-[200px]">
                <p className="truncate text-xs">{job.pickup}</p>
                <p className="text-[10px] text-muted-foreground">
                  {job.pickupCity}
                </p>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <p className="truncate text-xs">{job.delivery}</p>
                <p className="text-[10px] text-muted-foreground">
                  {job.deliveryCity}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{job.type}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {job.cuFt}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {job.miles.toFixed(1)}
              </TableCell>
              <TableCell>
                <JobStatusBadge status={job.status} />
              </TableCell>
              <TableCell>
                {job.crew.length > 0 ? (
                  <div className="flex items-center -space-x-2">
                    {job.crew.slice(0, 3).map((c, i) => (
                      <Avatar
                        key={c}
                        className={cn(
                          "h-6 w-6 border-2 border-card",
                          i === 0 && "z-30",
                          i === 1 && "z-20",
                          i === 2 && "z-10",
                        )}
                      >
                        <AvatarFallback className="bg-brand-500/20 text-[9px] text-brand-700 dark:text-brand-300">
                          {initials(c)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {job.crew.length > 3 && (
                      <span className="z-0 ml-2 text-[10px] font-semibold text-muted-foreground">
                        +{job.crew.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="slate">Needs crew</Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(job.price)}
              </TableCell>
              <TableCell>
                <PayrollStatusBadge status={job.payrollStatus} />
              </TableCell>
              <TableCell className="pr-5">
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[10px]">
                  <Link href={`/jobs/${job.id}`}>Open</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
        <p>
          Showing <span className="font-semibold text-foreground">{rows.length}</span>{" "}
          of {scopedJobs.length} jobs
        </p>
      </div>
    </div>
  );
}

function ChipButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {label}{" "}
      <span className={cn("ml-1", active ? "text-primary" : "text-foreground/55")}>
        {count}
      </span>
    </button>
  );
}
