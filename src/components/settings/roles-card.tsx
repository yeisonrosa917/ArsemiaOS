"use client";

import { useState } from "react";
import { RotateCcw, ShieldCheck, ShieldX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CAPABILITIES,
  CAPABILITY_GROUPS,
  type CapabilityGroup,
  type CapabilityId,
} from "@/lib/auth/capabilities";
import { ROLES, ROLE_IDS, resolveCapabilities, type UserRoleId } from "@/lib/auth/roles";
import { usePreferences } from "@/lib/store/preferences";
import { cn } from "@/lib/utils";

export function RolesAndPermissionsCard() {
  const { capabilityOverrides, toggleCapability, resetRoleCapabilities, setRoleCapabilities } =
    usePreferences();
  const [selectedRole, setSelectedRole] = useState<UserRoleId>("dispatcher");

  const role = ROLES[selectedRole];
  const activeCaps = resolveCapabilities(selectedRole, capabilityOverrides);
  const isOverridden = capabilityOverrides[selectedRole] != null;

  const grantAllInGroup = (group: CapabilityGroup) => {
    const groupCaps = CAPABILITIES.filter((c) => c.group === group).map(
      (c) => c.id,
    );
    const next = Array.from(new Set([...activeCaps, ...groupCaps]));
    setRoleCapabilities(selectedRole, next);
  };

  const revokeAllInGroup = (group: CapabilityGroup) => {
    const groupCaps = new Set(
      CAPABILITIES.filter((c) => c.group === group).map((c) => c.id),
    );
    const next = activeCaps.filter((c) => !groupCaps.has(c));
    setRoleCapabilities(selectedRole, next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Roles & Permissions
        </CardTitle>
        <CardDescription>
          Picks a role and toggles which capabilities it grants — WordPress
          style. Owner is always full-access and cannot be edited.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {ROLE_IDS.map((rid) => {
            const r = ROLES[rid];
            const isActive = rid === selectedRole;
            const isOwner = rid === "owner";
            const hasOverride = capabilityOverrides[rid] != null;
            return (
              <button
                key={rid}
                onClick={() => setSelectedRole(rid)}
                disabled={isOwner}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/40 hover:bg-accent/40",
                  isOwner && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{r.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {hasOverride ? "Custom" : "Default"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <Separator />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{role.label}</p>
            <p className="text-xs text-muted-foreground">{role.description}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeCaps.length} of {CAPABILITIES.length} capabilities granted
              {isOverridden && " · custom configuration"}
            </p>
          </div>
          {isOverridden && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetRoleCapabilities(selectedRole)}
              className="gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to defaults
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {CAPABILITY_GROUPS.map((group) => {
            const groupCaps = CAPABILITIES.filter((c) => c.group === group);
            const allGranted = groupCaps.every((c) => activeCaps.includes(c.id));
            const noneGranted = groupCaps.every(
              (c) => !activeCaps.includes(c.id),
            );
            return (
              <div
                key={group}
                className="rounded-xl border border-border bg-muted/20"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    {group}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-[10px]"
                      disabled={role.id === "owner" || allGranted}
                      onClick={() => grantAllInGroup(group)}
                    >
                      <ShieldCheck className="h-3 w-3" /> All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-[10px]"
                      disabled={role.id === "owner" || noneGranted}
                      onClick={() => revokeAllInGroup(group)}
                    >
                      <ShieldX className="h-3 w-3" /> None
                    </Button>
                  </div>
                </div>
                <div className="grid gap-1 p-2 sm:grid-cols-2">
                  {groupCaps.map((cap) => {
                    const granted = activeCaps.includes(cap.id);
                    return (
                      <label
                        key={cap.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-2.5 rounded-md p-2 transition-colors",
                          granted
                            ? "bg-primary/8 hover:bg-primary/12"
                            : "hover:bg-accent/40",
                          role.id === "owner" && "cursor-not-allowed opacity-60",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={granted}
                          disabled={role.id === "owner"}
                          onChange={() => toggleCapability(selectedRole, cap.id as CapabilityId)}
                          className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold leading-tight">
                            {cap.label}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {cap.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
