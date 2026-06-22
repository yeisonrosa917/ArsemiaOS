import { Navigation, Plus, Route as RouteIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPreview } from "@/components/shared/map-preview";
import { routes } from "@/lib/mock-data";

const STATUS_VARIANT = {
  Active: "success",
  Planned: "info",
  Completed: "slate",
} as const;

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Routes"
        description="Zone-based planning, drive-time optimization, and live multi-stop tracking."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Navigation className="h-4 w-4" />
              Optimize all
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New route
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-8">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Today&apos;s active routes</CardTitle>
              <CardDescription>
                Miami Metro • 4 active vehicles • 13 total stops
              </CardDescription>
            </div>
            <Badge variant="success">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] overflow-hidden rounded-xl border">
              <MapPreview />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 xl:col-span-4">
          <CardHeader>
            <CardTitle>Route summary</CardTitle>
            <CardDescription>
              All scheduled and active routes for the next two days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {routes.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border/70 bg-background p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {r.id} • {r.date}
                    </p>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.driverName} • {r.zone}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <Metric label="Stops" value={String(r.stops)} />
                  <Metric label="Miles" value={r.miles.toFixed(1)} />
                  <Metric
                    label="Duration"
                    value={`${r.durationHours.toFixed(1)}h`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b p-4">
          <RouteIcon className="h-4 w-4 text-brand-600" />
          <p className="text-sm font-semibold">All routes</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Route</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead className="text-right">Stops</TableHead>
              <TableHead className="text-right">Miles</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-5">
                  <p className="font-mono text-xs text-muted-foreground">
                    {r.id}
                  </p>
                  <p className="text-xs font-semibold">{r.name}</p>
                </TableCell>
                <TableCell className="text-xs">{r.driverName}</TableCell>
                <TableCell className="text-xs">{r.zone}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {r.stops}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {r.miles.toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {r.durationHours.toFixed(1)}h
                </TableCell>
                <TableCell className="text-xs">{r.date}</TableCell>
                <TableCell className="pr-5">
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
