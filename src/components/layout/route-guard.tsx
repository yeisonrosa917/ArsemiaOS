"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { usePreferences } from "@/lib/store/preferences";
import {
  canAccessRouteWithFallback,
  resolveCapabilities,
  ROLES,
} from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";

/**
 * Strict route guard. Deny-by-default — every page in the app must either be
 * mapped in ROUTE_REQUIRES or be reachable via the Owner's `roles.manage`
 * capability. If a role hits a forbidden URL directly, they see this screen
 * with a link back to their landing route.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const overrides = usePreferences((s) => s.capabilityOverrides);
  const caps = resolveCapabilities(activeRoleId, overrides);
  const role = ROLES[activeRoleId];

  const allowed = canAccessRouteWithFallback(caps, pathname);

  if (allowed) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
          <ShieldX className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-lg font-bold">Access denied</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your active role ({role.label}) doesn&apos;t have permission to view{" "}
          <code className="rounded bg-muted px-1 text-xs">{pathname}</code>.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild size="sm">
            <Link href={role.landing}>Back to {role.label} home</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/notifications">My notifications</Link>
          </Button>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          If you believe this is wrong, ask the Owner to update
          Roles & Permissions in Settings.
        </p>
      </div>
    </div>
  );
}
