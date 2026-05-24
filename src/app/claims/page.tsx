import { Camera, Filter, Plus, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClaimStatusBadge } from "@/components/shared/status-badge";
import { claims } from "@/lib/mock-data";
import { cn, formatCurrency, initials } from "@/lib/utils";

export default function ClaimsPage() {
  const totalAtRisk = claims.reduce((s, c) => s + c.amountAtRisk, 0);
  const openCount = claims.filter(
    (c) => !["Approved", "Denied", "Closed"].includes(c.status),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims & evidence"
        description="Damage, lost items, late deliveries, and billing disputes — with the photo trail attached."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              File claim
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Open claims" value={String(openCount)} tone="warning" />
        <SummaryCard label="Total claims" value={String(claims.length)} />
        <SummaryCard
          label="Amount at risk"
          value={formatCurrency(totalAtRisk)}
          tone="danger"
        />
        <SummaryCard
          label="Avg resolution"
          value="3.8 days"
          helper="last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {claims.slice(0, 3).map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="flex items-start justify-between gap-3 p-5 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {c.id}
                  </p>
                  <Badge variant="outline">{c.damageType}</Badge>
                </div>
                <p className="mt-1 text-base font-semibold">{c.customer}</p>
                <p className="text-xs text-muted-foreground">
                  Linked to {c.jobId} • opened {c.openedAt}
                </p>
              </div>
              <ClaimStatusBadge status={c.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 px-5 pb-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900"
                >
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute bottom-1 right-1 rounded-md bg-background/80 px-1 py-0.5 text-[9px] font-semibold backdrop-blur">
                    EVID-{i + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="px-5 pb-3 text-xs text-muted-foreground">
              + {Math.max(0, c.evidenceCount - 3)} more attachments
            </p>

            <div className="grid grid-cols-2 border-t bg-muted/30 px-5 py-3 text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Manager
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-violet-500/15 text-[9px] text-violet-700 dark:text-violet-300">
                      {initials(c.assignedManager)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {c.assignedManager}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  At risk
                </p>
                <p className="text-base font-semibold text-rose-600 dark:text-rose-400">
                  {formatCurrency(c.amountAtRisk)}
                </p>
              </div>
            </div>
            <p className="border-t bg-background px-5 py-3 text-xs italic text-muted-foreground">
              {c.notes}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b p-4">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <p className="text-sm font-semibold">All claims</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Claim</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Damage type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="pr-5 text-right">At risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-5 font-mono text-xs">{c.id}</TableCell>
                <TableCell className="font-mono text-xs">{c.jobId}</TableCell>
                <TableCell className="font-medium">{c.customer}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.damageType}</Badge>
                </TableCell>
                <TableCell>
                  <ClaimStatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-semibold">
                    <Camera className="h-3 w-3" />
                    {c.evidenceCount}
                  </span>
                </TableCell>
                <TableCell className="text-xs">{c.assignedManager}</TableCell>
                <TableCell className="pr-5 text-right font-semibold">
                  {formatCurrency(c.amountAtRisk)}
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
  tone?: "warning" | "danger";
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
          tone === "danger" && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
      {helper && (
        <p className="text-[11px] text-muted-foreground">{helper}</p>
      )}
    </Card>
  );
}
