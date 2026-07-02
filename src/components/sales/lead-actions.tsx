"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLeads, type Lead } from "@/lib/store/leads";
import { useActivityLog } from "@/lib/store/activity-log";
import { useNotifications } from "@/lib/store/notifications";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole, getSellers } from "@/lib/auth/users";
import { telHref } from "@/lib/utils";

/**
 * Central set of real actions for a lead — reused by the pipeline board, the
 * leads table, and the lead detail page so there is exactly one implementation
 * and no dead buttons.
 */
export function useLeadActions() {
  const router = useRouter();
  const assign = useLeads((s) => s.assign);
  const setStage = useLeads((s) => s.setStage);
  const markContacted = useLeads((s) => s.markContacted);
  const scheduleFollowUp = useLeads((s) => s.scheduleFollowUp);
  const addNote = useLeads((s) => s.addNote);
  const markLost = useLeads((s) => s.markLost);
  const linkQuote = useLeads((s) => s.linkQuote);
  const pushActivity = useActivityLog((s) => s.push);
  const pushNotif = useNotifications((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);

  const log = (
    action: "assigned" | "status_changed" | "updated" | "created",
    lead: Lead,
    title: string,
  ) =>
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Leads",
      action,
      objectType: "Lead",
      objectId: lead.id,
      title,
    });

  return {
    open: (lead: Lead) => router.push(`/leads/${lead.id}`),

    assignSeller: (lead: Lead, sellerId: string | null, sellerName: string | null) => {
      assign(lead.id, sellerId, sellerName, actor.name);
      log(
        "assigned",
        lead,
        sellerName
          ? `${lead.name} assigned to ${sellerName}`
          : `${lead.name} moved to Unassigned`,
      );
      if (sellerId && sellerName) {
        pushNotif({
          kind: "lead_assigned",
          severity: "info",
          title: "New lead assigned to you",
          body: `${lead.name} · ${lead.fromCity} → ${lead.toCity}`,
          href: `/leads/${lead.id}`,
          audience: "seller",
        });
      }
    },

    createQuote: (lead: Lead) => {
      if (lead.stage === "New Lead" || lead.stage === "Contacted") {
        setStage(lead.id, "Quote Requested", actor.name);
      }
      log("created", lead, `Quote started for ${lead.name}`);
      router.push(`/quotes?leadId=${lead.id}`);
    },

    convertToJob: (lead: Lead) => {
      if (lead.jobId) {
        router.push(`/jobs/${lead.jobId}`);
        return;
      }
      setStage(lead.id, "Booked", actor.name);
      log("status_changed", lead, `${lead.name} marked Booked — hand off to Operations`);
      pushNotif({
        kind: "job_unassigned",
        severity: "warning",
        title: "New booking needs a job",
        body: `${lead.name} · ${lead.fromCity} → ${lead.toCity} · ${lead.moveDate ?? "date TBD"}`,
        href: `/leads/${lead.id}`,
        audience: "dispatcher",
      });
    },

    markContacted: (lead: Lead) => {
      markContacted(lead.id, actor.name);
      log("status_changed", lead, `${lead.name} marked contacted`);
    },

    markLost: (lead: Lead) => {
      markLost(lead.id, actor.name);
      log("status_changed", lead, `${lead.name} marked Lost`);
    },

    scheduleFollowUp: (lead: Lead) => {
      const date = window.prompt(
        "Follow-up date (YYYY-MM-DD):",
        lead.nextFollowUpAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      );
      if (!date) return;
      scheduleFollowUp(lead.id, date);
      log("updated", lead, `Follow-up scheduled for ${lead.name} on ${date}`);
    },

    addNote: (lead: Lead) => {
      const text = window.prompt(`Add a note for ${lead.name}:`);
      if (!text) return;
      addNote(lead.id, text, actor.name);
      log("updated", lead, `Note added to ${lead.name}`);
    },

    linkQuote,
  };
}

/** Dropdown of every real lead action — used on cards and table rows. */
export function LeadActionsMenu({ lead }: { lead: Lead }) {
  const a = useLeadActions();
  const sellers = getSellers();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => e.stopPropagation()}
          aria-label="Lead actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => a.open(lead)}>Open lead</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={telHref(lead.phone)}>Call {lead.phone}</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`mailto:${lead.email}`}>Send email</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => a.markContacted(lead)}>
          Mark contacted
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => a.createQuote(lead)}>
          Create quote
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => a.convertToJob(lead)}>
          {lead.jobId ? "Open linked job" : "Convert to booked job"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => a.scheduleFollowUp(lead)}>
          Schedule follow-up
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => a.addNote(lead)}>Add note</DropdownMenuItem>
        <DropdownMenuItem
          className="text-rose-600"
          onClick={() => a.markLost(lead)}
        >
          Mark lost
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Assign to
        </DropdownMenuLabel>
        {sellers.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={() => a.assignSeller(lead, s.id, s.name)}
            className={lead.assignedSellerId === s.id ? "font-semibold text-primary" : ""}
          >
            {s.name}
            {lead.assignedSellerId === s.id && " ✓"}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => a.assignSeller(lead, null, null)}>
          Unassign
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
