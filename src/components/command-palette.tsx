"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Coins,
  LayoutDashboard,
  Receipt,
  Route as RouteIcon,
  Search,
  Settings,
  ShieldAlert,
  Truck,
  Users,
  UserSquare2,
  Zap,
} from "lucide-react";
import {
  customers,
  drivers,
  jobs,
  invoices,
} from "@/lib/data";

interface PageItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

const PAGES: PageItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, hint: "Home" },
  { label: "Operations Board", href: "/operations-board", icon: ClipboardList, hint: "Kanban" },
  { label: "Dispatch", href: "/dispatch", icon: Zap, hint: "Live board" },
  { label: "Jobs", href: "/jobs", icon: ClipboardList },
  { label: "Routes", href: "/routes", icon: RouteIcon },
  { label: "Activity Log", href: "/activity", icon: ShieldAlert, hint: "Owner" },
  { label: "Pipeline", href: "/pipeline", icon: Briefcase, hint: "Sales" },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Quotes", href: "/quotes", icon: Briefcase, hint: "Calculator" },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Foremen", href: "/foremen", icon: UserSquare2 },
  { label: "Fleet", href: "/fleet", icon: Truck },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Payroll", href: "/payroll", icon: Coins, hint: "Audit" },
  { label: "Claims", href: "/claims", icon: ShieldAlert },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
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

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

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

              <Command.Group heading="Pages" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                {PAGES.map((p) => {
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
              </Command.Group>

              <Command.Group heading="Jobs" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                {jobs.slice(0, 12).map((j) => (
                  <Command.Item
                    key={j.id}
                    value={`job ${j.id} ${j.customer} ${j.pickupCity} ${j.deliveryCity}`}
                    onSelect={() => go("/jobs")}
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
              </Command.Group>

              <Command.Group heading="Customers" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                {customers.slice(0, 12).map((c) => (
                  <Command.Item
                    key={c.id}
                    value={`customer ${c.name} ${c.email}`}
                    onSelect={() => go("/customers")}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {c.segment}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Foremen" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                {drivers.slice(0, 10).map((d) => (
                  <Command.Item
                    key={d.id}
                    value={`foreman ${d.name} ${d.vehicleName}`}
                    onSelect={() => go("/foremen")}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                  >
                    <UserSquare2 className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{d.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {d.vehicleName}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Invoices" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                {invoices.slice(0, 10).map((inv) => (
                  <Command.Item
                    key={inv.id}
                    value={`invoice ${inv.id} ${inv.customer}`}
                    onSelect={() => go("/invoices")}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm aria-selected:bg-accent"
                  >
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="font-semibold">{inv.id}</span> · {inv.customer}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {inv.status}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
