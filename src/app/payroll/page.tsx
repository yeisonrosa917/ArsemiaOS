"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PayrollForemanList } from "@/components/payroll/foreman-list";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";

export default function PayrollPage() {
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps = resolveCapabilities(activeRoleId, overrides);
  // Audit Tools are not a primary flow — Owner/Accounting only (payroll.audit).
  const canAudit = caps.includes("payroll.audit");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Foreman-first weekly payroll. Pick a range, open any foreman to review jobs, reimbursements and deductions."
        actions={
          canAudit ? (
            <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs">
              <Link href="/payroll/tools">
                <Calculator className="h-3.5 w-3.5" />
                Audit Tools
              </Link>
            </Button>
          ) : undefined
        }
      />

      <PayrollForemanList />
    </div>
  );
}
