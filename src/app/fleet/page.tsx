import {
  Fuel,
  Gauge,
  MapPin,
  Plus,
  Radio,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleStatusBadge } from "@/components/shared/status-badge";
import { vehicles } from "@/lib/mock-data";
import { cn, formatNumber } from "@/lib/utils";

export default function FleetPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet"
        description="Vehicles, maintenance, telematics and document compliance across the fleet."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Wrench className="h-4 w-4" />
              Schedule maintenance
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Total vehicles" value={String(vehicles.length)} />
        <SummaryCard
          label="In service"
          value={String(
            vehicles.filter((v) => v.status === "Active" || v.status === "Idle")
              .length,
          )}
        />
        <SummaryCard
          label="In shop"
          value={String(
            vehicles.filter(
              (v) => v.status === "Maintenance" || v.status === "Out of Service",
            ).length,
          )}
          tone="warning"
        />
        <SummaryCard
          label="Avg mileage"
          value={formatNumber(
            Math.round(
              vehicles.reduce((s, v) => s + v.mileage, 0) / vehicles.length,
            ),
          )}
          helper="miles"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((v) => {
          const lifePct = Math.min(100, (v.mileage / 200000) * 100);
          return (
            <Card key={v.id} className="overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-5 pb-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {v.id} • {v.plate}
                  </p>
                  <p className="text-base font-semibold">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.type}</p>
                </div>
                <VehicleStatusBadge status={v.status} />
              </div>

              <div className="space-y-3 px-5 pb-4">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Gauge className="h-3.5 w-3.5" />
                      Odometer
                    </span>
                    <span className="font-semibold">
                      {formatNumber(v.mileage)} mi
                    </span>
                  </div>
                  <Progress
                    value={lifePct}
                    className="mt-1.5 h-1.5"
                    indicatorClassName={cn(
                      lifePct > 75
                        ? "bg-rose-500"
                        : lifePct > 50
                          ? "bg-amber-500"
                          : "bg-emerald-500",
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Info icon={Wrench} label="Next service" value={v.nextMaintenance} />
                  <Info
                    icon={ShieldCheck}
                    label="Insurance"
                    value={v.insuranceExpiry}
                  />
                  <Info
                    icon={Fuel}
                    label="Registration"
                    value={v.registrationExpiry}
                  />
                  <Info icon={MapPin} label="Location" value={v.location} />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-2 w-2 rounded-full",
                        v.gpsActive
                          ? "animate-pulse-dot bg-emerald-500"
                          : "bg-rose-500",
                      )}
                    />
                    <span className="font-medium">
                      {v.gpsActive ? "GPS tracking" : "GPS offline"}
                    </span>
                  </div>
                  {v.currentDriver ? (
                    <span className="text-muted-foreground">
                      Driver: <span className="font-semibold text-foreground">{v.currentDriver}</span>
                    </span>
                  ) : (
                    <Badge variant="slate">No driver</Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b p-4">
          <Radio className="h-4 w-4 text-brand-600" />
          <p className="text-sm font-semibold">Fleet roster</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Mileage</TableHead>
              <TableHead>Next service</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead>Current driver</TableHead>
              <TableHead className="pr-5">GPS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="pl-5">
                  <p className="text-xs font-semibold">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {v.id} • {v.plate}
                  </p>
                </TableCell>
                <TableCell className="text-xs">{v.type}</TableCell>
                <TableCell>
                  <VehicleStatusBadge status={v.status} />
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatNumber(v.mileage)}
                </TableCell>
                <TableCell className="text-xs">{v.nextMaintenance}</TableCell>
                <TableCell className="text-xs">
                  {v.registrationExpiry}
                </TableCell>
                <TableCell className="text-xs">{v.insuranceExpiry}</TableCell>
                <TableCell className="text-xs">
                  {v.currentDriver ?? "—"}
                </TableCell>
                <TableCell className="pr-5">
                  {v.gpsActive ? (
                    <Badge variant="success">Online</Badge>
                  ) : (
                    <Badge variant="danger">Offline</Badge>
                  )}
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
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper?: string;
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
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </Card>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold">{value}</p>
    </div>
  );
}
