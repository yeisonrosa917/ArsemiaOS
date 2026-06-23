"use client";

import {
  Calendar,
  CreditCard,
  FileText,
  HardDrive,
  Mail,
  MapPin,
  MessageSquare,
  Plug,
  Receipt,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Integration = {
  name: string;
  description: string;
  examples: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "planned" | "in-design" | "available";
};

const GROUPS: Array<{ label: string; items: Integration[] }> = [
  {
    label: "Communication",
    items: [
      { name: "Email", description: "Customer notifications, invoice delivery, reminders.", examples: "Resend, SES, Postmark", icon: Mail, status: "planned" },
      { name: "SMS", description: "Foreman dispatch alerts, customer ETA notifications.", examples: "Twilio, MessageBird", icon: MessageSquare, status: "planned" },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Maps & Routing", description: "Live routing, ETA, distance and zone resolution.", examples: "Google Maps, Mapbox", icon: MapPin, status: "in-design" },
      { name: "Calendar", description: "Sync scheduled jobs to operator calendars.", examples: "Google Calendar, iCal", icon: Calendar, status: "planned" },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Payments", description: "Card/ACH/Zelle/Stripe links for invoices.", examples: "Stripe, Plaid", icon: CreditCard, status: "in-design" },
      { name: "Accounting", description: "Push invoices, expenses and payroll out for books.", examples: "QuickBooks, Xero", icon: Receipt, status: "planned" },
    ],
  },
  {
    label: "Files & Storage",
    items: [
      { name: "Receipt / photo storage", description: "Backing store for receipts, claim evidence, signed docs.", examples: "S3, Cloudflare R2", icon: HardDrive, status: "planned" },
      { name: "Document signing", description: "BOL, COI, hourly job confirmations.", examples: "DocuSign, Dropbox Sign", icon: FileText, status: "planned" },
    ],
  },
];

const STATUS_STYLES: Record<Integration["status"], string> = {
  planned: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  "in-design": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  available: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

const STATUS_LABEL: Record<Integration["status"], string> = {
  planned: "Planned",
  "in-design": "In design",
  available: "Available",
};

export function IntegrationsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-primary" /> Integrations
        </CardTitle>
        <CardDescription>
          Slots where Arsemia plugs into external systems. Each is structured so
          a real connector can drop in without redesigning the surface.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </p>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {g.items.map((it) => {
                const Icon = it.icon;
                return (
                  <li
                    key={it.name}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{it.name}</p>
                        <span
                          className={
                            "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold " +
                            STATUS_STYLES[it.status]
                          }
                        >
                          {STATUS_LABEL[it.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {it.description}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        e.g. {it.examples}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
