import { Calculator, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PayrollTable } from "@/components/payroll/payroll-table";

const RULES = [
  {
    title: "Minimum CuFt",
    body: "Billing volume should never drop below 200 CuFt — small jobs get a min-volume override.",
  },
  {
    title: "Mileage tiers",
    body: "Local hops bill at $3/mile, long-distance (>100 mi) flips to $4/mile automatically.",
  },
  {
    title: "Non-commissionable",
    body: "Admin surcharge and toll reimbursements are excluded from the commissionable total.",
  },
  {
    title: "Audit flags",
    body: "Outliers (missing extras, oversized crew, short volume) surface here before payroll is finalized.",
  },
];

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Crew commissions and audit-ready payouts for the current period."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Calculator className="h-4 w-4" />
              Recompute period
            </Button>
            <Button size="sm">Run payroll</Button>
          </>
        }
      />

      <Card className="border-brand-500/30 bg-brand-500/[0.04]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-brand-600" />
            Commission rules cheat sheet
          </CardTitle>
          <CardDescription>
            How Arsemia computes crew payouts • shown in audit summary on every line
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {RULES.map((r) => (
            <div
              key={r.title}
              className="rounded-xl border border-border/60 bg-background p-3"
            >
              <p className="text-xs font-semibold text-foreground">{r.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {r.body}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <PayrollTable />
    </div>
  );
}
