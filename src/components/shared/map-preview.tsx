import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type MarkerKind = "vehicle" | "pickup" | "delivery" | "depot";

interface Marker {
  id: string;
  x: number;
  y: number;
  label: string;
  kind: MarkerKind;
  sub?: string;
}

const DEFAULT_MARKERS: Marker[] = [
  { id: "DEPOT", x: 22, y: 70, label: "Depot", kind: "depot" },
  { id: "FM-1042", x: 38, y: 52, label: "M. Reyes", kind: "vehicle", sub: "26' Box #204" },
  { id: "FM-1043", x: 64, y: 38, label: "S. Hernandez", kind: "vehicle", sub: "Sprinter #207" },
  { id: "FM-1044", x: 30, y: 32, label: "T. Walker", kind: "vehicle", sub: "20' Box #211" },
  { id: "FM-1045", x: 72, y: 60, label: "A. Volkov", kind: "vehicle", sub: "Cargo #215" },
  { id: "FM-1047", x: 50, y: 78, label: "E. Park", kind: "vehicle", sub: "Sprinter #224" },
  { id: "P-A", x: 44, y: 24, label: "Pickup", kind: "pickup" },
  { id: "D-A", x: 80, y: 22, label: "Delivery", kind: "delivery" },
  { id: "D-B", x: 56, y: 88, label: "Delivery", kind: "delivery" },
];

const PATHS = [
  "M 22 70 Q 30 60 38 52 T 64 38",
  "M 22 70 Q 30 50 30 32 T 44 24",
  "M 38 52 Q 56 56 72 60 T 80 22",
  "M 22 70 Q 36 80 50 78 T 56 88",
];

export function MapPreview({
  markers = DEFAULT_MARKERS,
  className,
  compact = false,
}: {
  markers?: Marker[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl map-bg",
        className,
      )}
    >
      <div className="absolute inset-0 grid-bg opacity-50" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* roads */}
        <path
          d="M 0 70 H 100"
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth="0.45"
        />
        <path
          d="M 30 0 V 100"
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth="0.45"
        />
        <path
          d="M 64 0 V 100"
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth="0.45"
        />
        <path
          d="M 0 38 H 100"
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="0.3"
        />
        <path
          d="M 0 22 H 100"
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="0.3"
        />
        <path
          d="M 80 0 V 100"
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="0.3"
        />
        {PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="#3b62ff"
            strokeWidth="0.45"
            strokeDasharray="1.2 1.2"
            fill="none"
            opacity={0.85}
          />
        ))}
      </svg>

      {markers.map((m) => (
        <div
          key={m.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          {m.kind === "vehicle" && (
            <div className="group relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-500 shadow-elevated">
                <Truck className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="absolute -inset-1 -z-10 animate-pulse-dot rounded-full bg-brand-500/30" />
              {!compact && (
                <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-semibold opacity-0 shadow-elevated transition-opacity group-hover:opacity-100">
                  {m.label}
                  {m.sub && (
                    <span className="block text-[10px] font-normal text-muted-foreground">
                      {m.sub}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          {m.kind === "pickup" && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-[9px] font-bold text-white shadow">
              P
            </div>
          )}
          {m.kind === "delivery" && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[9px] font-bold text-white shadow">
              D
            </div>
          )}
          {m.kind === "depot" && (
            <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-white bg-slate-900 text-[9px] font-bold text-white shadow">
              HQ
            </div>
          )}
        </div>
      ))}

      <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-lg border border-border/60 bg-background/80 p-2 text-[10px] font-medium backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-500" /> Vehicle
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Pickup
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Delivery
        </div>
      </div>
    </div>
  );
}
