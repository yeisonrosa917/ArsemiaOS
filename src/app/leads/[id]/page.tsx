"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LEADS } from "@/lib/data/leads";
import { fmtUSD } from "@/lib/calculator/engine";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lead = LEADS.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/leads">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to leads
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">Lead not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/leads">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to leads
        </Link>
      </Button>

      <PageHeader title={lead.name} description={`Lead ${lead.id} · ${lead.source}`} />

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{lead.source}</Badge>
              <Badge variant="outline">{lead.status}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {lead.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {lead.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {lead.fromCity}
                <ArrowRight className="h-2.5 w-2.5" />
                {lead.toCity}
              </span>
            </div>
            {lead.notes && (
              <p className="mt-2 rounded-lg bg-muted/30 p-2 text-xs">
                {lead.notes}
              </p>
            )}
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-2">
            <Stat label="Estimated value" value={fmtUSD(lead.estimatedValue)} primary />
            <Stat label="Est. CuFt" value={String(lead.estimatedCuFt)} />
            <Stat
              label="Scheduled"
              value={lead.scheduledDate ?? "—"}
            />
            <Stat
              label="Assigned"
              value={lead.assignedSeller?.split(" ")[0] ?? "—"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Convert this lead</CardTitle>
          <CardDescription>
            Leads convert into a <strong>Quote Draft</strong>, not directly into a
            Job. The customer must accept the quote first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="gap-2">
            <Link
              href={{
                pathname: "/quotes",
                query: {
                  leadId: lead.id,
                  customer: lead.name,
                  phone: lead.phone,
                  email: lead.email,
                  fromCity: lead.fromCity,
                  toCity: lead.toCity,
                  cuft: String(lead.estimatedCuFt),
                },
              }}
            >
              <Briefcase className="h-4 w-4" />
              Convert Lead to Quote Draft
            </Link>
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Quote Draft → Sales reviews → Quote Sent to customer → Customer accepts →
            Booked → Converted to Job.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  primary,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border border-border bg-muted/20 p-2 " +
        (primary ? "border-primary/40 bg-primary/[0.04]" : "")
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-0.5 font-mono text-sm font-bold " + (primary ? "text-primary" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
