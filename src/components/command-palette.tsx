"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BarChart3,
  Bell,
  Briefcase,
  ClipboardList,
  Coins,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  ShieldAlert,
  Truck,
  Users,
  UserSquare2,
  Wallet,
  Zap,
} from "lucide-react";
import { customers, drivers, jobs, invoices } from "@/lib/data";
import { useInvoices } from "@/lib/store/invoices";
import { useClaims } from "@/lib/store/claims";
import { useExpenses } from "@/lib/store/expenses";
import { useFleet } from "@/lib/store/fleet";
import { usePreferences } from "@/lib/store/preferences";
import {
  canAccessRouteWithFallback,
  resolveCapabilities,
} from "@/lib/auth/roles";
import type { CapabilityId } from "@/lib/auth/capabilities";

interface PageItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  /** Owner route — only shown if guard allows. */
  guardPath?: string;
}

const PAGES: PageItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, hint: "Home" },
  { label: "Dispatch", href: "/dispatch", icon: Zap, hint: "Live board" },
  { label: "Jobs", href: "/jobs", icon: ClipboardList },
  { label: "Pipeline", href: "/pipeline", icon: Briefcase, hint: "Sales" },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Quotes", href: "/quotes", icon: Briefcase, hint: "Calculator" },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Foremen", href: "/foremen", icon: UserSquare2 },
  { label: "Fleet", href: "/fleet", icon: Truck },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Expenses", href: "/expenses", icon: Wallet },
  { label: "Payroll", href: "/payroll", icon: Coins },
  { label: "Claims", href: "/claims", icon: ShieldAlert },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Audit Log", href: "/activity", icon: ShieldAlert, hint: "Owner" },
];

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps: CapabilityId[] = resolveCapabilities(activeRoleId, overrides);
  const can = (path: string) => canAccessRouteWithFallback(caps, path);

  // Live stores for record-level navigation
  const invoiceItems = useInvoices((s) => s.items);
  const claimItems = useClaims((s) => s.items);
  const expenseItems = useExpenses((s) => s.items);
  const vehicleItems = useFleet((s) => s.vehicles);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const visiblePages = PAGES.filter((p) => can(p.href));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-50 w-[90vw] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-elevated data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Command palette" shouldFilter={true}>
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search pages, jobs, customers, foremen, invoices..."
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[55vh] overflow-y-auto p-2 scrollbar-thin">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </Command.Empty>

              <Group heading="Pages">
                {visiblePages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Command.Item
                      key={p.href}
                      value={`${p.label} ${p.hint ?? ""}`}
                      onSelect={() => go(p.href)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{p.label}</span>
                      {p.hint && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {p.hint}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Group>

              {can("/jobs") && (
                <Group heading="Jobs">
                  {jobs.slice(0, 12).map((j) => (
                    <Command.Item
                      key={j.id}
                      value={`job ${j.id} ${j.customer} ${j.pickupCity} ${j.deliveryCity}`}
                      onSelect={() => go(`/jobs/${j.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                    >
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="font-semibold">{j.id}</span> · {j.customer}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {j.status}
                      </span>
                    </Command.Item>
                  ))}
                </Group>
              )}

              {can("/customers") && (
                <Group heading="Customers">
                  {customers.slice(0, 12).map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`customer ${c.name} ${c.email}`}
                      onSelect={() => go(`/customers/${c.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {c.segment}
                      </span>
                    </Command.Item>
                  ))}
                </Group>
              )}

              {can("/foremen") && (
                <Group heading="Foremen">
                  {drivers.slice(0, 10).map((d) => (
                    <Command.Item
                      key={d.id}
                      value={`foreman ${d.name} ${d.vehicleName}`}
                      onSelect={() => go(`/payroll/foreman/${d.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                    >
                      <UserSquare2 className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{d.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {d.vehicleName}
                      </span>
                    </Command.Item>
                  ))}
                </Group>
              )}

              {can("/invoices") && (
                <Group heading="Invoices">
                  {(invoiceItems.length > 0 ? invoiceItems : invoices)
                    .slice(0, 10)
                    .map((inv) => (
                      <Command.Item
                        key={inv.id}
                        value={`invoice ${inv.id} ${"customerName" in inv ? inv.customerName : inv.customer}`}
                        onSelect={() => go(`/invoices/${inv.id}`)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                      >
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">
                          <span className="font-semibold">{inv.id}</span> ·{" "}
                          {"customerName" in inv ? inv.customerName : inv.customer}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {inv.status}
                        </span>
                      </Command.Item>
                    ))}
                </Group>
              )}

              {can("/expenses") && (
                <Group heading="Expenses">
                  {expenseItems.slice(0, 8).map((e) => (
                    <Command.Item
                      key={e.id}
                      value={`expense ${e.id} ${e.foremanName} ${e.category}`}
                      onSelect={() => go(`/expenses/${e.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="font-semibold">{e.id}</span> ·{" "}
                        {e.foremanName} · {e.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {e.status}
                      </span>
                    </Command.Item>
                  ))}
                </Group>
              )}

              {can("/claims") && (
                <Group heading="Claims">
                  {claimItems.slice(0, 8).map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`claim ${c.id} ${c.customerName} ${c.claimType}`}
                      onSelect={() => go(`/claims/${c.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                    >
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="font-semibold">{c.id}</span> ·{" "}
                        {c.customerName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {c.status}
                      </span>
                    </Command.Item>
                  ))}
                </Group>
              )}

              {can("/fleet") && (
                <Group heading="Fleet">
                  {vehicleItems.slice(0, 8).map((v) => (
                    <Command.Item
                      key={v.id}
                      value={`fleet vehicle ${v.id} ${v.name} ${v.plate}`}
                      onSelect={() => go(`/fleet/${v.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="font-semibold">{v.id}</span> · {v.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {v.status}
                      </span>
                    </Command.Item>
                  ))}
                </Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      {children}
    </Command.Group>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
