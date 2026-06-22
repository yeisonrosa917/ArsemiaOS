"use client";

import { useState } from "react";
import { Calculator, Info, Table2 } from "lucide-react";
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
import { PayrollAuditPanel } from "@/components/payroll/payroll-audit-panel";
import { cn } from "@/lib/utils";

const RULES = [
  {
    title: "Customer total ≠ Payroll base",
    body: "App shows $1.50–$6/CuFt customer-facing. Payroll uses internal $1.25/CuFt.",
  },
  {
    title: "Always excluded",
    body: "Admin surcharge, tolls, hotel/gas/diesel reimbursements never count for commission.",
  },
  {
    title: "Mileage tiers",
    body: "$3/mi up to 300mi, $4/mi over. Pickup-only helpers don't get mileage.",
  },
  {
    title: "Manual rounding",
    body: "Manager may round final payouts for motivation; difference tracked vs formula.",
  },
];

type Tab = "audit" | "table";

export default function PayrollPage() {
  const [tab, setTab] = useState<Tab>("audit");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Commission engine + audit. Cross-checks app totals against internal commissionable base and flags discrepancies."
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

      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            Commission rules cheat sheet
          </CardTitle>
          <CardDescription>
            How Arsemia computes crew payouts and reconciles with the app
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

      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 sm:w-fit">
        <button
          onClick={() => setTab("audit")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            tab === "audit"
              ? "bg-background text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Calculator className="h-3.5 w-3.5" />
          Audit engine
        </button>
        <button
          onClick={() => setTab("table")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            tab === "table"
              ? "bg-background text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Table2 className="h-3.5 w-3.5" />
          Period table
        </button>
      </div>

      {tab === "audit" ? <PayrollAuditPanel /> : <PayrollTable />}
    </div>
  );
}
