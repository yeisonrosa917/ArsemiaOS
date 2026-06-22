import { Bell, Building2, CreditCard, Lock, Users } from "lucide-react";
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

const SECTIONS = [
  { icon: Building2, label: "Organization", description: "Company profile, branches, time zones" },
  { icon: Users, label: "Team", description: "Roles, permissions, dispatcher seats" },
  { icon: CreditCard, label: "Billing", description: "Plan, invoices, payment methods" },
  { icon: Bell, label: "Notifications", description: "Email, SMS, in-app alerts" },
  { icon: Lock, label: "Security", description: "SSO, 2FA, session policies" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Workspace, team, billing, and integrations for Arsemia Dispatch OS."
      />

      <AppearanceCard />

      <RolesAndPermissionsCard />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Browse configuration sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
            <CardDescription>
              Visible on invoices, customer notifications, and driver apps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Legal name" defaultValue="Arsemia Logistics LLC" />
              <Field label="DBA" defaultValue="Arsemia Dispatch" />
              <Field label="DOT number" defaultValue="DOT-3491220" />
              <Field label="MC number" defaultValue="MC-1180445" />
              <Field label="Primary phone" defaultValue="(415) 555-0900" />
              <Field
                label="Operations email"
                defaultValue="ops@arsemia.co"
              />
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold">Operating zones</p>
              <p className="text-xs text-muted-foreground">
                Default zones used to auto-route jobs
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  "SF Central",
                  "SF SOMA",
                  "SF FiDi",
                  "SF North",
                  "East Bay",
                  "North Bay",
                  "Peninsula",
                  "Statewide",
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
              <Button>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <Input defaultValue={defaultValue} className="mt-1" />
    </label>
  );
}
