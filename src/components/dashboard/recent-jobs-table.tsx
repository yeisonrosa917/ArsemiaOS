import { ArrowUpRight, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { jobs } from "@/lib/mock-data";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";

export function RecentJobsTable() {
  const rows = jobs.slice(0, 6);

  return (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Recent jobs</CardTitle>
          <CardDescription>Latest dispatched moves and deliveries</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Job</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">CuFt</TableHead>
              <TableHead className="text-right">Miles</TableHead>
              <TableHead>Foreman</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="pl-5">
                  <div className="font-semibold text-foreground">
                    {job.id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {job.customer} • {job.type}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {job.pickupCity}
                    <span className="text-muted-foreground">→</span>
                    {job.deliveryCity}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {job.zone}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatNumber(job.cuFt)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {job.miles.toFixed(1)}
                </TableCell>
                <TableCell>
                  {job.driverName ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-brand-500/15 text-[10px] text-brand-700 dark:text-brand-300">
                          {initials(job.driverName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {job.driverName.split(" ")[0]}{" "}
                        {job.driverName.split(" ")[1]?.[0]}.
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="pr-5 text-right font-semibold">
                  {formatCurrency(job.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
