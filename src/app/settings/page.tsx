"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Building2,
  Lock,
  Plug,
  Settings as SettingsIcon,
  Shield,
  UserCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { RolesAndPermissionsCard } from "@/components/settings/roles-card";
import { PrivacyDataCard } from "@/components/settings/privacy-card";
import { NotificationsSettingsCard } from "@/components/settings/notifications-card";
import { IntegrationsCard } from "@/components/settings/integrations-card";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";

const SECTIONS = [
  { id: "account", icon: UserCircle, label: "Account" },
  { id: "company", icon: Building2, label: "Company Profile" },
  { id: "appearance", icon: SettingsIcon, label: "Appearance" },
  { id: "roles", icon: Shield, label: "Roles & Permissions" },
  { id: "audit", icon: Activity, label: "Audit Log", external: "/activity" as const },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "integrations", icon: Plug, label: "Integrations" },
  { id: "privacy", icon: Lock, label: "Privacy & Data" },
];

export default function SettingsPage() {
  const [section, setSection] = useState("account");
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account, company, permissions, privacy, and integrations."
      />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Browse configuration sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              // External links (e.g. Audit Log → /activity)
              if ("external" in s && s.external) {
                return (
                  <Link
                    key={s.id}
                    href={s.external}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Owner-only · opens in this tab
                      </p>
                    </span>
                  </Link>
                );
              }
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={
                    "flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors " +
                    (active ? "bg-primary/10" : "hover:bg-muted")
                  }
                >
                  <span
                    className={
                      "flex h-9 w-9 items-center justify-center rounded-lg " +
                      (active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-foreground")
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <p className="text-sm font-semibold">{s.label}</p>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="col-span-12 space-y-4 lg:col-span-9">
          {section === "account" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-primary" /> Account
                </CardTitle>
                <CardDescription>
                  Personal information for the active session.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Name" defaultValue={user.name} />
                <Field label="Email" defaultValue={user.email} />
                <Field label="Role" defaultValue={activeRoleId} disabled />
                <Field label="User ID" defaultValue={user.id} disabled />
              </CardContent>
            </Card>
          )}

          {section === "company" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Company Profile
                </CardTitle>
                <CardDescription>
                  Visible on invoices, customer notifications, and foreman app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Legal name" defaultValue="Arsemia Logistics LLC" />
                  <Field label="DBA" defaultValue="Arsemia Dispatch" />
                  <Field label="DOT number" defaultValue="DOT-3491220" />
                  <Field label="MC number" defaultValue="MC-1180445" />
                  <Field label="Primary phone" defaultValue="(305) 555-0900" />
                  <Field label="Operations email" defaultValue="ops@arsemia.co" />
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-semibold">Operating zones</p>
                  <p className="text-xs text-muted-foreground">
                    Default zones used to auto-route jobs
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      "Downtown Miami",
                      "Brickell",
                      "Wynwood",
                      "North Miami",
                      "Hialeah",
                      "Aventura",
                      "South Dade",
                      "Coral Gables",
                      "Coconut Grove",
                      "Pinecrest",
                      "Doral",
                      "Long Distance",
                    ].map((z) => (
                      <span
                        key={z}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium"
                      >
                        {z}
                      </span>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    onClick={() => {
                      pushActivity({
                        actorId: user.id,
                        actorName: user.name,
                        actorRole: activeRoleId,
                        module: "Settings",
                        action: "settings_changed",
                        objectType: "CompanyProfile",
                        objectId: "default",
                        title: "Company profile saved",
                        notes: "Field values updated.",
                      });
                    }}
                  >
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === "appearance" && <AppearanceCard />}

          {section === "roles" && <RolesAndPermissionsCard />}

          {section === "notifications" && <NotificationsSettingsCard />}

          {section === "integrations" && <IntegrationsCard />}

          {section === "privacy" && <PrivacyDataCard />}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  disabled,
}: {
  label: string;
  defaultValue: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <Input defaultValue={defaultValue} disabled={disabled} className="mt-1" />
    </label>
  );
}
