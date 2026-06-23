"use client";

import Link from "next/link";
import { Calculator, Table2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PayrollForemanList } from "@/components/payroll/foreman-list";

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Foreman-first weekly payroll. Pick a range, open any foreman to review jobs, reimbursements and deductions."
        actions={
          <>
            <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs">
              <Link href="/payroll/tools">
                <Calculator className="h-3.5 w-3.5" />
                Audit & period tools
              </Link>
            </Button>
          </>
        }
      />

      <PayrollForemanList />
    </div>
  );
}
