"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * Finance workspace (Sprint 1 IA shell).
 *
 * Hosts the existing Invoices, Expenses and Payroll pages as lazy tabs.
 * Pages and payroll logic are unchanged; old URLs redirect here. Tabs are
 * capability-gated: a Foreman arriving from "My Expenses" sees only the
 * Expenses tab (the page itself already self-scopes to their own records).
 * Overview/Payments/Reimbursements/etc. are Sprint 3 scope.
 */

const InvoicesView = dynamic(() => import("@/app/invoices/page"), {
  ssr: false,
  loading: () => <TabLoading />,
});
const ExpensesView = dynamic(() => import("@/app/expenses/page"), {
  ssr: false,
  loading: () => <TabLoading />,
});
const PayrollView = dynamic(() => import("@/app/payroll/page"), {
  ssr: false,
  loading: () => <TabLoading />,
});

type TabId = "invoices" | "expenses" | "payroll";

function FinanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps = resolveCapabilities(activeRoleId, overrides);

  const tabs: { id: TabId; label: string; allowed: boolean }[] = [
    { id: "invoices", label: "Invoices", allowed: caps.includes("invoices.view") },
    {
      id: "expenses",
      label: "Expenses",
      allowed: caps.includes("expenses.view_all") || caps.includes("expenses.view_own"),
    },
    {
      id: "payroll",
      label: "Payroll",
      allowed: caps.includes("payroll.view_all"),
    },
  ];
  const visible = tabs.filter((t) => t.allowed);

  const param = searchParams.get("tab") as TabId | null;
  const initial: TabId =
    param && visible.some((t) => t.id === param) ? param : (visible[0]?.id ?? "invoices");
  const [tab, setTab] = useState<TabId>(initial);

  useEffect(() => {
    if (param && param !== tab && visible.some((t) => t.id === param)) setTab(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  const select = (id: TabId) => {
    setTab(id);
    router.replace(`/finance?tab=${id}`, { scroll: false });
  };

  const allowed = (id: TabId) => visible.some((t) => t.id === id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Finance"
        description={`${visible.map((t) => t.label).join(", ")} in one workspace. Overview, payments, reimbursements, deductions and storage billing arrive in a later phase.`}
      />
      <div className="flex flex-wrap gap-1 border-b border-border">
        {visible.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={cn(
              "rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "invoices" && allowed("invoices") && <InvoicesView />}
      {tab === "expenses" && allowed("expenses") && <ExpensesView />}
      {tab === "payroll" && allowed("payroll") && <PayrollView />}
    </div>
  );
}

function TabLoading() {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<TabLoading />}>
      <FinanceContent />
    </Suspense>
  );
}
