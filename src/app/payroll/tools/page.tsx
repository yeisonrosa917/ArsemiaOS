"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Table2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PayrollAuditPanel } from "@/components/payroll/payroll-audit-panel";
import { PayrollTable } from "@/components/payroll/payroll-table";
import { cn } from "@/lib/utils";

type Tab = "audit" | "table";

export default function PayrollToolsPage() {
  const [tab, setTab] = useState<Tab>("audit");

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/payroll">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to payroll
        </Link>
      </Button>
      <PageHeader
        title="Payroll tools"
        description="Audit engine and period table. Deep utilities — not part of the primary weekly flow."
      />

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
