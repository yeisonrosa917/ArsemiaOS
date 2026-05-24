import {
  CheckCircle2,
  FileWarning,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DriverStatusBadge } from "@/components/shared/status-badge";
import { drivers } from "@/lib/mock-data";
import { cn, formatCurrency, initials } from "@/lib/utils";

export default function DriversPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers & crew"
        description="Roster, compliance and performance across your dispatch team."
        actions={
          <>
            <Button variant="outline" size="sm">
              Schedule shifts
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add driver
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="On roster" value={String(drivers.length)} />
        <SummaryCard
          label="On the road"
          value={String(
            drivers.filter(
              (d) => d.status === "On Job" || d.status === "En Route",
            ).length,
          )}
        />
        <SummaryCard
          label="Avg rating"
          value={(
            drivers.reduce((s, d) => s + d.rating, 0) / drivers.length
          ).toFixed(2)}
        />
        <SummaryCard
          label="Docs expiring < 30d"
          value={String(drivers.filter((d) => !d.documentsOk).length)}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {drivers.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <div className="flex items-start gap-3 p-5 pb-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={cn("text-base text-white", d.avatarColor)}>
                  {initials(d.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.id}</p>
                  </div>
                  <DriverStatusBadge status={d.status} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">
                    {d.rating}
                  </span>
                  <span>•</span>
                  <span>{d.jobsCompleted} jobs</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 px-5 text-xs">
              <Row icon={Phone} value={d.phone} />
              <Row icon={Mail} value={d.email} />
              <Row icon={Truck} value={d.vehicleName} />
              <Row icon={MapPin} value={d.currentLocation} />
            </div>

            <div className="mt-4 grid grid-cols-2 border-t bg-muted/30 text-xs">
              <div className="border-r p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Revenue handled
                </p>
                <p className="text-sm font-semibold">
                  {formatCurrency(d.revenueHandled)}
                </p>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Documents
                </p>
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {d.documentsOk ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Up to date
                    </>
                  ) : (
                    <>
                      <FileWarning className="h-3.5 w-3.5 text-amber-500" />
                      Expiring soon
                    </>
                  )}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <p className="text-sm font-semibold">Roster</p>
          <p className="text-xs text-muted-foreground">
            Compact view of the full driver table
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Driver</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Jobs</TableHead>
              <TableHead className="text-right">Revenue handled</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="pr-5">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={cn("text-white", d.avatarColor)}>
                        {initials(d.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{d.phone}</TableCell>
                <TableCell className="text-xs">{d.vehicleName}</TableCell>
                <TableCell>
                  <DriverStatusBadge status={d.status} />
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {d.jobsCompleted}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(d.revenueHandled)}
                </TableCell>
                <TableCell className="text-right text-xs font-semibold">
                  {d.rating}
                </TableCell>
                <TableCell>
                  {d.documentsOk ? (
                    <Badge variant="success">Valid</Badge>
                  ) : (
                    <Badge variant="warning">Expiring</Badge>
                  )}
                </TableCell>
                <TableCell className="pr-5 text-xs text-muted-foreground">
                  {d.currentLocation}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning";
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value}
      </p>
    </Card>
  );
}

function Row({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="truncate text-foreground">{value}</span>
    </p>
  );
}
