"use client";

import { useEffect } from "react";
import { useNotifications, type Notification } from "@/lib/store/notifications";
import { useExpenses } from "@/lib/store/expenses";
import { useClaims } from "@/lib/store/claims";
import { useInvoices } from "@/lib/store/invoices";
import { useFleet } from "@/lib/store/fleet";

type DerivedInput = Omit<Notification, "id" | "createdAt" | "read">;

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Mounts in the app shell and keeps the derived slice of the notifications
 * store in sync with current expenses / claims / invoices / fleet data.
 * Read state is preserved across re-syncs via sourceKey.
 */
export function NotificationDeriver() {
  const expenses = useExpenses((s) => s.items);
  const claims = useClaims((s) => s.items);
  const invoices = useInvoices((s) => s.items);
  const vehicles = useFleet((s) => s.vehicles);
  const syncDerived = useNotifications((s) => s.syncDerived);

  useEffect(() => {
    const batch: DerivedInput[] = [];

    // Expenses — pending review and missing receipt
    expenses.forEach((e) => {
      if (e.status === "Submitted" || e.status === "Under Review") {
        batch.push({
          kind: "expense_pending",
          severity: "warning",
          title: "Expense waiting for review",
          body: `${e.foremanName} · ${e.category} · $${e.amount.toFixed(2)}`,
          href: `/expenses/${e.id}`,
          audience: "accountant",
          sourceKey: `expense:${e.id}:pending`,
        });
      }
      if (e.status === "Needs Receipt") {
        batch.push({
          kind: "expense_missing_receipt",
          severity: "warning",
          title: "Expense missing receipt",
          body: `${e.id} · ${e.foremanName} owes a receipt for ${e.category}`,
          href: `/expenses/${e.id}`,
          audience: "accountant",
          sourceKey: `expense:${e.id}:no-receipt`,
        });
      }
    });

    // Claims — foreman response needed and recently approved/reimbursed
    claims.forEach((c) => {
      if (c.status === "Foreman Response Needed") {
        batch.push({
          kind: "claim_foreman_response",
          severity: "danger",
          title: "Claim waiting for foreman response",
          body: `${c.id} · ${c.customerName} · ${c.foremanName}`,
          href: `/claims/${c.id}`,
          audience: "claims",
          sourceKey: `claim:${c.id}:foreman`,
        });
      }
      if (c.status === "Approved" || c.status === "Reimbursed") {
        batch.push({
          kind: "claim_status_changed",
          severity: "info",
          title:
            c.status === "Reimbursed"
              ? "Claim reimbursed"
              : "Claim approved",
          body: `${c.id} · ${c.customerName}`,
          href: `/claims/${c.id}`,
          sourceKey: `claim:${c.id}:resolved`,
        });
      }
    });

    // Invoices — overdue + paid
    invoices.forEach((inv) => {
      if (inv.status === "Overdue") {
        batch.push({
          kind: "invoice_overdue",
          severity: "danger",
          title: "Invoice overdue",
          body: `${inv.id} · ${inv.customerName} · $${inv.balance.toFixed(2)} due`,
          href: `/invoices/${inv.id}`,
          audience: "accountant",
          sourceKey: `invoice:${inv.id}:overdue`,
        });
      }
      if (inv.status === "Paid" && inv.paidDate) {
        const days = Math.abs(daysUntil(inv.paidDate));
        if (days <= 7) {
          batch.push({
            kind: "invoice_paid",
            severity: "info",
            title: "Invoice paid",
            body: `${inv.id} · ${inv.customerName} · $${inv.total.toFixed(2)}`,
            href: `/invoices/${inv.id}`,
            sourceKey: `invoice:${inv.id}:paid`,
          });
        }
      }
    });

    // Fleet — maintenance / insurance / registration windows
    vehicles.forEach((v) => {
      const m = daysUntil(v.nextMaintenance);
      if (m <= 3) {
        batch.push({
          kind: "fleet_maintenance",
          severity: m < 0 ? "danger" : "warning",
          title: m < 0 ? "Maintenance overdue" : "Maintenance due soon",
          body: `${v.name} · scheduled ${v.nextMaintenance}`,
          href: `/fleet/${v.id}`,
          sourceKey: `fleet:${v.id}:maint`,
        });
      }
      const ins = daysUntil(v.insuranceExpiry);
      if (ins <= 7) {
        batch.push({
          kind: "fleet_insurance",
          severity: ins < 0 ? "danger" : "warning",
          title: ins < 0 ? "Insurance expired" : "Insurance expiring",
          body: `${v.name} · expires ${v.insuranceExpiry}`,
          href: `/fleet/${v.id}`,
          sourceKey: `fleet:${v.id}:ins`,
        });
      }
      const reg = daysUntil(v.registrationExpiry);
      if (reg <= 7) {
        batch.push({
          kind: "fleet_registration",
          severity: reg < 0 ? "danger" : "warning",
          title: reg < 0 ? "Registration expired" : "Registration expiring",
          body: `${v.name} · expires ${v.registrationExpiry}`,
          href: `/fleet/${v.id}`,
          sourceKey: `fleet:${v.id}:reg`,
        });
      }
    });

    syncDerived(batch);
  }, [expenses, claims, invoices, vehicles, syncDerived]);

  return null;
}
