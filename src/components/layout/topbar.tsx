"use client";

import Link from "next/link";
import {
  ChevronDown,
  CommandIcon,
  Plus,
  Search,
  Truck,
  UserPlus,
  UserRound,
  Wallet,
  Briefcase,
  Receipt,
  ShieldAlert,
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

type CtaItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

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

function RoleAwareCta({ activeRoleId }: { activeRoleId: string }) {
  // Owner: dropdown with all quick actions
  if (activeRoleId === "owner") {
    const items: CtaItem[] = [
      { label: "New Quote", href: "/quotes", icon: Briefcase },
      { label: "New Lead", href: "/leads", icon: UserRound },
      { label: "New Job", href: "/quotes?type=job", icon: Plus },
      { label: "Add Foreman", href: "/foremen?add=1", icon: UserPlus },
      { label: "Add Vehicle", href: "/fleet?add=1", icon: Truck },
      { label: "File Claim", href: "/claims?add=1", icon: ShieldAlert },
      { label: "Add Expense", href: "/expenses?add=1", icon: Wallet },
    ];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="h-9 rounded-lg gap-1 px-3 text-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Owner quick actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((it) => {
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

  // Per-role single CTA
  const ROLE_CTA: Record<string, CtaItem | null> = {
    seller: { label: "New Quote", href: "/quotes", icon: Briefcase },
    dispatcher: { label: "Assign Job", href: "/dispatch", icon: Truck },
    accountant: { label: "Payroll Review", href: "/payroll", icon: Receipt },
    claims: { label: "File Claim", href: "/claims?add=1", icon: ShieldAlert },
    marketing: null,
    foreman: null,
  };

  const cta = ROLE_CTA[activeRoleId];
  if (!cta) return null;
  const Icon = cta.icon;

  return (
    <Button variant="default" size="sm" className="h-9 rounded-lg px-3 text-sm" asChild>
      <Link href={cta.href}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{cta.label}</span>
      </Link>
    </Button>
  );
}
