import { ArrowUpRight, Navigation, Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveMap } from "@/components/shared/live-map";

export function MapRoutePreview() {
  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Live route map</CardTitle>
          <CardDescription>Miami Metro • 7 vehicles tracked</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          Open dispatch
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-56 overflow-hidden rounded-xl border border-border">
          <LiveMap
            height="100%"
            zoom={11}
            center={[25.7617, -80.1918]}
            markers={[
              { id: "d1", lat: 25.7741, lng: -80.1937, label: "Driver 12 · Pedro", kind: "driver" },
              { id: "d2", lat: 25.7907, lng: -80.13, label: "Driver 07 · Roberto", kind: "driver" },
              { id: "p1", lat: 25.795, lng: -80.21, label: "Pickup · 1601 Collins Ave, Miami Beach", kind: "pickup" },
              { id: "v1", lat: 25.74, lng: -80.34, label: "Delivery · 8000 NW 33rd St, Doral", kind: "delivery" },
            ]}
          />
          <Badge
            variant="success"
            className="absolute left-3 top-3 bg-emerald-500/90 text-white"
          >
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
            Live
          </Badge>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-background/90 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2 text-xs">
              <Truck className="h-3.5 w-3.5 text-brand-600" />
              <span className="font-semibold">7 active vehicles</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Updated 12s ago
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Stops today", value: "42" },
            { label: "Miles", value: "318" },
            { label: "On-time", value: "94%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/60 bg-muted/30 px-2 py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-base font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full gap-2 text-xs">
          <Navigation className="h-3.5 w-3.5" />
          Optimize routes for today
        </Button>
      </CardContent>
    </Card>
  );
}
