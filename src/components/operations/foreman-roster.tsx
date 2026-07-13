"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Phone, UserSquare2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DriverStatusBadge } from "@/components/shared/status-badge";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import {
  useForemanAvailability,
  AVAILABILITY_LABEL,
  AVAILABILITY_STYLES,
} from "@/lib/store/foreman-availability";
import { cn, initials, telHref } from "@/lib/utils";

/**
 * Foreman Roster tab — daily operational availability for the selected date.
 * Reads the existing roster (demo data), availability overrides and the shared
 * jobs store. Deliberately shallow: profiles/history/payroll stay in /foremen.
 */
export function ForemanRoster({ selectedDate }: { selectedDate: string }) {
  const jobs = useJobsStore((s) => s.jobs);
  const overrides = useForemanAvailability((s) => s.overrides);

  const rows = useMemo(() => {
    return drivers.map((d) => {
      const dayJobs = jobs
        .filter(
          (j) =>
            (j.scheduledAt ?? "").slice(0, 10) === selectedDate &&
            (j.driverId === d.id || j.driverName === d.name) &&
            j.status !== "Cancelled",
        )
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      const override = overrides[d.id];
      return { d, dayJobs, override };
    });
  }, [jobs, overrides, selectedDate]);

  const working = rows.filter((r) => r.dayJobs.length > 0).length;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        {working} of {drivers.length} foremen have jobs on this date · roster is
        demo data (local only)
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ d, dayJobs, override }) => (
          <Card key={d.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn("text-white", d.avatarColor)}>
                    {initials(d.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{d.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{d.id}</p>
                    </div>
                    {override ? (
                      <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", AVAILABILITY_STYLES[override])}>
                        {AVAILABILITY_LABEL[override]}
                      </span>
                    ) : (
                      <DriverStatusBadge status={d.status} />
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{d.vehicleName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <Badge variant={dayJobs.length > 0 ? "success" : "outline"} className="text-[9px]">
                      {dayJobs.length} job{dayJobs.length === 1 ? "" : "s"} this day
                    </Badge>
                    {dayJobs[0] && (
                      <span className="text-muted-foreground">
                        first at {dayJobs[0].scheduledAt.slice(11, 16)}
                      </span>
                    )}
                  </div>
                  {dayJobs.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {dayJobs.map((j) => (
                        <li key={j.id}>
                          <Link href={`/jobs/${j.id}`} className="flex items-center justify-between rounded-md bg-muted px-2 py-1 text-[11px] hover:bg-accent">
                            <span className="font-mono">{j.id}</span>
                            <span className="truncate pl-2 text-muted-foreground">{j.customer}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <a href={telHref(d.phone)} className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                      <Phone className="h-3 w-3" /> Call
                    </a>
                    <Link href="/foremen" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline">
                      <UserSquare2 className="h-3 w-3" /> Profile
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
