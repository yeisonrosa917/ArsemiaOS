import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ClaimStatus,
  DriverStatus,
  JobStatus,
  PayrollStatus,
  VehicleStatus,
} from "@/lib/types";

const jobStatusVariant: Record<
  JobStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Unassigned: "slate",
  Assigned: "info",
  "En Route": "violet",
  "Pickup Started": "warning",
  "Pickup Completed": "warning",
  "Delivery Started": "default",
  Completed: "success",
  Cancelled: "danger",
};

const driverStatusVariant: Record<
  DriverStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Available: "success",
  "On Job": "default",
  "En Route": "violet",
  Break: "warning",
  Offline: "slate",
};

const payrollStatusVariant: Record<
  PayrollStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Pending: "slate",
  Approved: "info",
  Paid: "success",
  Flagged: "danger",
};

const claimStatusVariant: Record<
  ClaimStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  New: "info",
  "Under Review": "warning",
  "Customer Contacted": "violet",
  Approved: "success",
  Denied: "danger",
  Closed: "slate",
};

const vehicleStatusVariant: Record<
  VehicleStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Active: "success",
  Idle: "info",
  Maintenance: "warning",
  "Out of Service": "danger",
};

export function JobStatusBadge({
  status,
  className,
}: {
  status: JobStatus;
  className?: string;
}) {
  return (
    <Badge variant={jobStatusVariant[status]} className={cn(className)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </Badge>
  );
}

export function DriverStatusBadge({
  status,
  className,
}: {
  status: DriverStatus;
  className?: string;
}) {
  const isLive = status === "On Job" || status === "En Route";
  return (
    <Badge variant={driverStatusVariant[status]} className={cn(className)}>
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full bg-current",
          isLive && "animate-pulse-dot",
        )}
      />
      {status}
    </Badge>
  );
}

export function PayrollStatusBadge({
  status,
  className,
}: {
  status: PayrollStatus;
  className?: string;
}) {
  return (
    <Badge variant={payrollStatusVariant[status]} className={cn(className)}>
      {status}
    </Badge>
  );
}

export function ClaimStatusBadge({
  status,
  className,
}: {
  status: ClaimStatus;
  className?: string;
}) {
  return (
    <Badge variant={claimStatusVariant[status]} className={cn(className)}>
      {status}
    </Badge>
  );
}

export function VehicleStatusBadge({
  status,
  className,
}: {
  status: VehicleStatus;
  className?: string;
}) {
  return (
    <Badge variant={vehicleStatusVariant[status]} className={cn(className)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}
