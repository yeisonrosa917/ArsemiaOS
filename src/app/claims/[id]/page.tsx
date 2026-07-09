"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useClaims,
  CLAIM_STATUSES,
  CLAIM_PRIORITIES,
  CLAIM_STATUS_STYLE,
  type ClaimStatus,
  type ClaimPriority,
  type ClaimMessage,
  type ClaimVisibility,
} from "@/lib/store/claims";
import { useActivityLog } from "@/lib/store/activity-log";
import { useNotifications } from "@/lib/store/notifications";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole, SEED_USERS } from "@/lib/auth/users";
import { cn, formatCurrency, initials } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

const VIS_LABEL: Record<ClaimVisibility, string> = {
  internal: "Internal only",
  customer: "Customer-facing",
  foreman: "Foreman-facing",
  claims_team: "Claims team",
};

const MSG_STYLE: Record<string, { label: string; cls: string }> = {
  customer_message: { label: "Customer", cls: "border-blue-500/40 bg-blue-500/[0.05]" },
  foreman_response: { label: "Foreman", cls: "border-emerald-500/40 bg-emerald-500/[0.05]" },
  internal_note: { label: "Internal note", cls: "border-amber-500/40 bg-amber-500/[0.05]" },
  claims_message: { label: "Claims", cls: "border-primary/40 bg-primary/[0.05]" },
  dispatch_note: { label: "Dispatch", cls: "border-sky-500/40 bg-sky-500/[0.05]" },
  resolution: { label: "Resolution", cls: "border-emerald-500/50 bg-emerald-500/[0.08]" },
};

const SYSTEM_KINDS = new Set(["system_event", "status_changed", "evidence_uploaded"]);

export default function ClaimThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const claim = useClaims((s) => s.items.find((c) => c.id === id));
  const setStatus = useClaims((s) => s.setStatus);
  const setPriority = useClaims((s) => s.setPriority);
  const assignHandler = useClaims((s) => s.assignHandler);
  const requestForemanResponse = useClaims((s) => s.requestForemanResponse);
  const requestEvidence = useClaims((s) => s.requestEvidence);
  const setResolutionNote = useClaims((s) => s.setResolutionNote);
  const addMessage = useClaims((s) => s.addMessage);
  const markRead = useClaims((s) => s.markRead);
  const pushActivity = useActivityLog((s) => s.push);
  const pushNotif = useNotifications((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  const handlers = useMemo(
    () => SEED_USERS.filter((u) => u.roleId === "claims" || u.roleId === "owner"),
    [],
  );

  const [composer, setComposer] = useState<"customer" | "internal" | "foreman">("internal");
  const [draft, setDraft] = useState("");

  // Opening a claim marks it read.
  useEffect(() => {
    if (claim && claim.read === false) markRead(claim.id);
  }, [claim, markRead]);

  if (!claim) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/claims"><ArrowLeft className="h-3.5 w-3.5" /> Back to claims</Link>
        </Button>
        <Card><CardContent className="p-8 text-center text-sm font-semibold">Claim not found</CardContent></Card>
      </div>
    );
  }

  const log = (title: string) =>
    pushActivity({
      actorId: user.id, actorName: user.name, actorRole: activeRoleId,
      module: "Claims", action: "status_changed", objectType: "Claim", objectId: claim.id, title,
    });

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    const map: Record<typeof composer, { kind: ClaimMessage["kind"]; visibility: ClaimVisibility }> = {
      customer: { kind: "claims_message", visibility: "customer" },
      internal: { kind: "internal_note", visibility: "internal" },
      foreman: { kind: "claims_message", visibility: "foreman" },
    };
    const { kind, visibility } = map[composer];
    addMessage(claim.id, { kind, body, visibility, authorName: user.name, authorRole: "Claims" });
    log(`Message added to ${claim.id} (${VIS_LABEL[visibility]})`);
    setDraft("");
  };

  const doRequestForeman = () => {
    requestForemanResponse(claim.id, user.name);
    log(`Foreman response requested for ${claim.id}`);
    pushNotif({
      kind: "claim_foreman_response", severity: "danger", priority: "high",
      title: "Claim needs your response", body: `${claim.id} · ${claim.claimType} · ${claim.customerName}`,
      href: `/claims/${claim.id}`, audience: "foreman",
    });
  };
  const doRequestEvidence = () => {
    requestEvidence(claim.id, user.name);
    log(`Evidence requested for ${claim.id}`);
    pushNotif({
      kind: "claim_evidence_needed", severity: "warning", priority: "normal",
      title: "Claim missing evidence", body: `${claim.id} · ${claim.customerName}`,
      href: `/claims/${claim.id}`, audience: "claims",
    });
  };
  const doResolve = () => {
    const note = window.prompt("Resolution summary:");
    if (!note) return;
    setResolutionNote(claim.id, note, user.name);
    log(`Claim ${claim.id} resolved`);
  };

  const thread = [...(claim.messages ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/claims"><ArrowLeft className="h-3.5 w-3.5" /> Back to claims</Link>
      </Button>

      <PageHeader title={`${claim.customerName} · ${claim.claimType}`} description={`${claim.id} · opened ${formatDateTimeStable(claim.openedAt)}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Thread */}
        <div className="space-y-3 lg:col-span-2">
          <Card>
            <CardContent className="space-y-2 p-4">
              {thread.map((m) => <Message key={m.id} m={m} />)}
              {thread.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">No messages yet.</p>}
            </CardContent>
          </Card>

          {/* Composer */}
          <Card>
            <CardContent className="space-y-2 p-3">
              <div className="flex gap-1 text-xs">
                {([["internal", "Internal note"], ["customer", "Reply to customer"], ["foreman", "Note to foreman"]] as const).map(([id2, label]) => (
                  <button key={id2} onClick={() => setComposer(id2)}
                    className={cn("rounded-md border px-2.5 py-1.5 font-semibold transition-colors",
                      composer === id2 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={composer === "internal" ? "Internal note — only the claims team sees this…" : composer === "customer" ? "Reply to the customer…" : "Note to the foreman…"}
                className="min-h-[90px] w-full rounded-lg border border-border bg-background p-3 text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Logged in this thread. No external email is sent yet — {VIS_LABEL[composer === "customer" ? "customer" : composer === "foreman" ? "foreman" : "internal"]}.
                </p>
                <Button size="sm" className="gap-1.5" onClick={send} disabled={!draft.trim()}>
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Paperclip className="h-4 w-4 text-primary" /> Evidence ({claim.evidence.length})</CardTitle></CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {claim.evidence.map((ev) => (
                <div key={ev.id} className="rounded-lg border border-border/60 bg-background p-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] capitalize">{ev.side} · {ev.kind}</Badge>
                    <span className="text-[9px] text-muted-foreground">{formatDateTimeStable(ev.uploadedAt, { month: "short", day: "numeric" })}</span>
                  </div>
                  <p className="mt-1 font-medium">{ev.caption}</p>
                  {ev.body && <p className="mt-0.5 text-muted-foreground">{ev.body}</p>}
                  <p className="mt-1 text-[9px] text-muted-foreground">— {ev.uploadedBy}</p>
                </div>
              ))}
              {claim.evidence.length === 0 && <p className="col-span-full rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">No evidence yet.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Action rail */}
        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold", CLAIM_STATUS_STYLE[claim.status])}>{claim.status}</span>
                <span className="font-mono text-lg font-bold">{formatCurrency(claim.claimAmount)}</span>
              </div>

              <Labeled label="Status">
                <select value={claim.status} onChange={(e) => { setStatus(claim.id, e.target.value as ClaimStatus, user.name); log(`${claim.id} → ${e.target.value}`); }}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                  {CLAIM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Labeled>

              <Labeled label="Priority">
                <select value={claim.priority ?? "Normal"} onChange={(e) => setPriority(claim.id, e.target.value as ClaimPriority)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                  {CLAIM_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Labeled>

              <Labeled label="Assigned handler">
                <select value={claim.assignedReviewer} onChange={(e) => { assignHandler(claim.id, e.target.value, user.name); log(`${claim.id} assigned to ${e.target.value}`); }}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                  {[claim.assignedReviewer, ...handlers.map((h) => h.name)].filter((v, i, a) => a.indexOf(v) === i).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Labeled>

              <div className="grid gap-1.5">
                <Button size="sm" variant="outline" className="justify-start gap-2" onClick={doRequestForeman}>
                  <User className="h-3.5 w-3.5" /> Request foreman response
                </Button>
                <Button size="sm" variant="outline" className="justify-start gap-2" onClick={doRequestEvidence}>
                  <Paperclip className="h-3.5 w-3.5" /> Request more evidence
                </Button>
                <Button size="sm" variant="outline" className="justify-start gap-2" onClick={doResolve}>
                  <MessageSquare className="h-3.5 w-3.5" /> Add resolution
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Connections</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <Conn icon={Briefcase} label="Job" value={claim.jobId} href={`/jobs/${claim.jobId}`} />
              {claim.customerId && <Conn icon={User} label="Customer" value={claim.customerName} href={`/customers/${claim.customerId}`} />}
              <Conn icon={Shield} label="Foreman" value={claim.foremanName} href={`/foremen`} />
              <Conn icon={Truck} label="Truck" value={claim.truckName} />
              {claim.invoiceId && <Conn icon={FileText} label="Invoice" value={claim.invoiceId} href={`/invoices/${claim.invoiceId}`} />}
              {claim.expenseId && <Conn icon={FileText} label="Expense" value={claim.expenseId} href={`/expenses/${claim.expenseId}`} />}
              {(claim.status === "Deduction Pending" || claim.status === "Deducted") && (
                <p className="rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-2 py-1.5 text-[11px] text-amber-700">
                  A payroll deduction is linked to this claim for {claim.foremanName}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Message({ m }: { m: ClaimMessage }) {
  if (SYSTEM_KINDS.has(m.kind)) {
    return (
      <div className="flex items-center gap-2 py-1 text-[10px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>{m.body} · {m.authorName} · {formatDateTimeStable(m.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }
  const s = MSG_STYLE[m.kind] ?? MSG_STYLE.claims_message;
  return (
    <div className={cn("rounded-lg border p-3", s.cls)}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-[9px] font-bold">{initials(m.authorName)}</span>
        <span className="text-xs font-semibold">{m.authorName}</span>
        <Badge variant="outline" className="text-[9px]">{s.label}</Badge>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{VIS_LABEL[m.visibility]}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{formatDateTimeStable(m.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm">{m.body}</p>
      {m.attachments ? <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Paperclip className="h-3 w-3" />{m.attachments} attachment</p> : null}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Conn({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }) {
  const inner = (
    <span className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-2 py-1.5">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3 w-3" />{label}</span>
      <span className="truncate font-medium">{value}</span>
    </span>
  );
  return href ? <Link href={href} className="block hover:underline">{inner}</Link> : inner;
}
