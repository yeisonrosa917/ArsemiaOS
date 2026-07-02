"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ClipboardList,
  CommandIcon,
  Phone,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  Truck,
  UserPlus,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleSwitcher } from "./role-switcher";
import { ThemeMenu } from "./theme-menu";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/command-palette";
import { usePreferences } from "@/lib/store/preferences";
import type { UserRoleId } from "@/lib/auth/roles";

type CtaItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * Role-specific quick actions. Strict by design — every entry below must
 * navigate to a real working page. If a role has no actions, the CTA is
 * hidden. Decorative or wrong-role entries belong nowhere.
 */
const ROLE_ACTIONS: Record<UserRoleId, { label: string; items: CtaItem[] }> = {
  owner: {
    label: "Owner quick actions",
    items: [
      { label: "New Lead", href: "/leads", icon: UserRound },
      { label: "New Quote", href: "/quotes", icon: Briefcase },
      { label: "Add Foreman", href: "/foremen", icon: UserPlus },
      { label: "Add Vehicle", href: "/fleet", icon: Truck },
      { label: "Review Payroll Flags", href: "/payroll/tools", icon: Wallet },
      { label: "Review Open Claims", href: "/claims", icon: ShieldAlert },
      { label: "Company Settings", href: "/settings", icon: Building2 },
    ],
  },
  seller: {
    label: "Sales actions",
    items: [
      { label: "New Lead", href: "/leads", icon: UserRound },
      { label: "New Quote", href: "/quotes", icon: Briefcase },
      { label: "Follow-ups Due", href: "/leads", icon: ClipboardList },
      { label: "Open Pipeline", href: "/pipeline", icon: ClipboardList },
    ],
  },
  dispatcher: {
    label: "Dispatch actions",
    items: [
      { label: "Today's Dispatch", href: "/dispatch", icon: Truck },
      { label: "Call a Foreman", href: "/foremen", icon: Phone },
    ],
  },
  accountant: {
    label: "Accounting actions",
    items: [
      { label: "Review Payroll", href: "/payroll", icon: Wallet },
      { label: "Review Expenses", href: "/expenses", icon: Receipt },
      { label: "Review Invoices", href: "/invoices", icon: Receipt },
    ],
  },
  claims: {
    label: "Claims actions",
    items: [{ label: "Open Claims", href: "/claims", icon: ShieldAlert }],
  },
  marketing: {
    label: "Marketing actions",
    items: [{ label: "Lead Sources", href: "/analytics", icon: ClipboardList }],
  },
  foreman: {
    label: "Foreman portal",
    items: [
      { label: "My Jobs", href: "/jobs", icon: ClipboardList },
      { label: "My Payroll", href: "/foreman-portal/payroll", icon: Wallet },
      { label: "My Expenses", href: "/expenses", icon: Briefcase },
    ],
  },
};

export function Topbar() {
  const { open, setOpen } = useCommandPalette();
  const activeRoleId = usePreferences((s) => s.activeRoleId);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl lg:px-8">
        <div className="hidden flex-1 items-center md:flex">
          <button
            onClick={() => setOpen(true)}
            className="group flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-background"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1">Search jobs, foremen, customers...</span>
            <kbd className="hidden items-center gap-1 rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium md:inline-flex">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <RoleAwareCta activeRoleId={activeRoleId} />

          <ThemeMenu />

          <NotificationsBell />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <RoleSwitcher />
        </div>
      </header>
      <CommandPalette open={open} setOpen={setOpen} />
    </>
  );
}

function RoleAwareCta({ activeRoleId }: { activeRoleId: UserRoleId }) {
  const cfg = ROLE_ACTIONS[activeRoleId];
  if (!cfg || cfg.items.length === 0) return null;

  // Single action — render flat button (no dropdown chrome)
  if (cfg.items.length === 1) {
    const it = cfg.items[0];
    const Icon = it.icon;
    return (
      <Button asChild variant="default" size="sm" className="h-9 rounded-lg px-3 text-sm">
        <Link href={it.href}>
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{it.label}</span>
        </Link>
      </Button>
    );
  }

  // Multiple actions — dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="h-9 rounded-lg gap-1 px-3 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Action</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{cfg.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {cfg.items.map((it) => {
          const Icon = it.icon;
          return (
            <DropdownMenuItem key={it.label} asChild>
              <Link href={it.href} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" />
                {it.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
