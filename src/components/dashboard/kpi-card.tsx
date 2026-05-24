import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  deltaSuffix = "%",
  positiveIsGood = true,
  icon: Icon,
  accent = "brand",
  helper,
}: {
  label: string;
  value: string;
  delta: number;
  deltaSuffix?: string;
  positiveIsGood?: boolean;
  icon: LucideIcon;
  accent?: "brand" | "emerald" | "amber" | "rose" | "violet" | "sky";
  helper?: string;
}) {
  const isPositive = delta >= 0;
  const good = positiveIsGood ? isPositive : !isPositive;

  const accentStyles: Record<typeof accent, string> = {
    brand: "from-brand-500/15 to-brand-500/0 text-brand-600 dark:text-brand-300",
    emerald:
      "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300",
    amber:
      "from-amber-500/20 to-amber-500/0 text-amber-600 dark:text-amber-300",
    rose: "from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-300",
    violet:
      "from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-300",
    sky: "from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-300",
  };

  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
          accentStyles[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background",
            accentStyles[accent].split(" ").slice(-2).join(" "),
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
            good
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(delta)}
          {deltaSuffix}
        </span>
        <span className="text-xs text-muted-foreground">
          {helper ?? "vs prior period"}
        </span>
      </div>
    </Card>
  );
}
