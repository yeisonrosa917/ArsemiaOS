"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  Briefcase,
  ClipboardList,
  Coins,
  Compass,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Receipt,
  Settings,
  ShieldAlert,
  Truck,
  UserRound,
  Users,
  UserSquare2,
  Wallet,
  Zap,
} from "lucide-react";
import { useNotifications } from "@/lib/store/notifications";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/lib/store/preferences";
import {
  canAccessRoute,
  resolveCapabilities,
  ROLES,
} from "@/lib/auth/roles";
import type { CapabilityId } from "@/lib/auth/capabilities";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Dispatch", href: "/dispatch", icon: Zap, badge: "Live" },
  { label: "Jobs", href: "/jobs", icon: ClipboardList },
];

const salesNav: NavItem[] = [
  { label: "Pipeline", href: "/pipeline", icon: Compass },
  { label: "Leads", href: "/leads", icon: UserRound },
  { label: "Quotes", href: "/quotes", icon: Briefcase },
  { label: "Customers", href: "/customers", icon: Users },
];

const operationsNav: NavItem[] = [
  { label: "Foremen", href: "/foremen", icon: UserSquare2 },
  { label: "Fleet", href: "/fleet", icon: Truck },
  { label: "Storage", href: "/storage", icon: Boxes },
];

const financeNav: NavItem[] = [
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Expenses", href: "/expenses", icon: Wallet },
  { label: "Payroll", href: "/payroll", icon: Coins },
];

const riskNav: NavItem[] = [
  { label: "Claims", href: "/claims", icon: ShieldAlert },
];

const insightsNav: NavItem[] = [
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** Foreman-only sidebar — completely separate from the admin hub. */
const foremanPortalNav: NavItem[] = [
  { label: "Foreman Portal", href: "/foreman-portal", icon: LayoutDashboard },
  { label: "My Jobs", href: "/jobs", icon: ClipboardList },
  { label: "My Payroll", href: "/foreman-portal/payroll", icon: Coins },
  { label: "My Expenses", href: "/expenses", icon: Wallet },
];

function NavGroup({
  label,
  items,
  pathname,
  caps,
  badges,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  caps: CapabilityId[];
  badges?: Record<string, string>;
}) {
  const visible = items.filter((it) => canAccessRoute(caps, it.href));
  if (visible.length === 0) return null;
  return (
    <div className="px-3">
      <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
        {label}
      </p>
      <ul className="space-y-0.5">
        {visible.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground/90",
                    )}
                  />
                  {item.label}
                </span>
                {(badges?.[item.href] ?? item.badge) && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      badges?.[item.href]
                        ? "bg-rose-500 text-white"
                        : active
                          ? "bg-white/15 text-white"
                          : "bg-white/10 text-sidebar-foreground/70",
                    )}
                  >
                    {badges?.[item.href] ?? item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarSide, activeRoleId, capabilityOverrides } = usePreferences();
  const role = ROLES[activeRoleId];
  const caps = resolveCapabilities(activeRoleId, capabilityOverrides);
  const unread = useNotifications((s) => s.items.filter((n) => !n.read).length);
  const adminBadges = unread > 0 ? { "/notifications": unread > 9 ? "9+" : String(unread) } : undefined;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex",
        sidebarSide === "right"
          ? "order-2 border-l border-sidebar-border"
          : "order-0 border-r border-sidebar-border",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <img
          src="/brand/arsemia-mark.png"
          alt="Arsemia"
          width={36}
          height={36}
          className="rounded-xl shadow-elevated"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Arsemia</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/55">
            Moving Hub
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {activeRoleId === "foreman" ? (
          <NavGroup label="My Portal" items={foremanPortalNav} pathname={pathname} caps={caps} />
        ) : (
          <>
            <NavGroup label="Operate" items={primaryNav} pathname={pathname} caps={caps} />
            <NavGroup label="Sales" items={salesNav} pathname={pathname} caps={caps} />
            <NavGroup label="People & Assets" items={operationsNav} pathname={pathname} caps={caps} />
            <NavGroup label="Finance" items={financeNav} pathname={pathname} caps={caps} />
            <NavGroup label="Risk" items={riskNav} pathname={pathname} caps={caps} />
            <NavGroup label="Insights" items={insightsNav} pathname={pathname} caps={caps} />
            <NavGroup label="Admin" items={adminNav} pathname={pathname} caps={caps} badges={adminBadges} />
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-200">
            <Map className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">Active role</p>
            <p className="text-[11px] text-sidebar-foreground/60">{role.label}</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
        >
          <LifeBuoy className="h-4 w-4" />
          Support & Docs
        </Link>
      </div>
    </aside>
  );
}
