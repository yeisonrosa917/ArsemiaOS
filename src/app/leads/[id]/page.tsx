"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  XCircle,
} from "lucide-react";
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
import { useLeads, followUpState } from "@/lib/store/leads";
import { useLeadActions } from "@/components/sales/lead-actions";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn, telHref } from "@/lib/utils";
import { formatDateTimeStable, formatShortDateStable } from "@/lib/dates";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lead = useLeads((s) => s.leads.find((l) => l.id === id));
  const a = useLeadActions();

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

  const fu = followUpState(lead);

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/leads">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to leads
        </Link>
      </Button>

      <PageHeader title={lead.name} description={`Lead ${lead.id} · ${lead.source}`} />

      {/* Action bar — every button does something real */}
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <a href={telHref(lead.phone)}>
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <a href={`mailto:${lead.email}`}>
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => a.markContacted(lead)}>
          <UserCheck className="h-3.5 w-3.5" /> Mark contacted
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => a.scheduleFollowUp(lead)}>
          <CalendarClock className="h-3.5 w-3.5" /> Schedule follow-up
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => a.createQuote(lead)}>
          <Briefcase className="h-3.5 w-3.5" /> Create quote
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => a.convertToJob(lead)}>
          {lead.jobId ? "Open linked job" : "Convert to booked job"}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-rose-600" onClick={() => a.markLost(lead)}>
          <XCircle className="h-3.5 w-3.5" /> Mark lost
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{lead.source}</Badge>
              <Badge variant="outline">{lead.stage}</Badge>
              <Badge variant={lead.priority === "High" || lead.priority === "Urgent" ? "danger" : "outline"}>
                {lead.priority} priority
              </Badge>
              {lead.quoteId && <Badge variant="outline">Quote {lead.quoteId}</Badge>}
              {lead.jobId && <Badge variant="success">Job {lead.jobId}</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
              <p className="mt-2 rounded-lg bg-muted/30 p-2 text-xs">{lead.notes}</p>
            )}
            <div className="pt-2">
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => a.addNote(lead)}>
                + Add note
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-2">
            <Stat label="Estimated value" value={fmtUSD(lead.estimatedValue)} primary />
            <Stat label="Est. CuFt" value={String(lead.estimatedCuFt)} />
            <Stat label="Move date" value={lead.moveDate ? formatShortDateStable(lead.moveDate) : "—"} />
            <Stat label="Assigned seller" value={lead.assignedSellerName ?? "Unassigned"} />
            <Stat
              label="Next follow-up"
              value={lead.nextFollowUpAt ? formatShortDateStable(lead.nextFollowUpAt) : "—"}
              tone={fu === "overdue" ? "danger" : fu === "today" ? "warning" : undefined}
            />
            <Stat
              label="Last contact"
              value={lead.lastContactedAt ? formatShortDateStable(lead.lastContactedAt) : "Never"}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes & activity</CardTitle>
            <CardDescription>Everything logged on this lead.</CardDescription>
          </CardHeader>
          <CardContent>
            {lead.noteLog.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                No notes yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {lead.noteLog.map((n, i) => (
                  <li key={i} className="rounded-md border border-border/60 bg-background px-3 py-2 text-xs">
                    <p>{n.text}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {n.by} · {formatDateTimeStable(n.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ownership history</CardTitle>
            <CardDescription>Who this lead has been assigned to.</CardDescription>
          </CardHeader>
          <CardContent>
            {lead.ownershipHistory.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                Never assigned.
              </p>
            ) : (
              <ul className="space-y-2">
                {[...lead.ownershipHistory].reverse().map((o, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2 text-xs">
                    <span className="font-semibold">{o.sellerName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      by {o.by} · {formatDateTimeStable(o.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  primary,
  tone,
}: {
  label: string;
  value: string;
  primary?: boolean;
  tone?: "danger" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 p-2",
        primary && "border-primary/40 bg-primary/[0.04]",
        tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
        tone === "warning" && "border-amber-500/40 bg-amber-500/[0.04]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 font-mono text-sm font-bold", primary && "text-primary")}>
        {value}
      </p>
    </div>
  );
}
