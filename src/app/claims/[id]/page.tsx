"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
  Truck,
  User,
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
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClaims, CLAIM_STATUSES, type ClaimStatus } from "@/lib/store/claims";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { EvidencePlaceholder } from "@/components/claims/evidence-placeholder";
import { formatCurrency } from "@/lib/utils";
import { formatDateStable, formatDateTimeStable } from "@/lib/dates";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  New: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Under Review": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Waiting for Evidence": "bg-orange-500/15 text-orange-600 border-orange-500/30",
  "Foreman Response Needed": "bg-rose-500/15 text-rose-600 border-rose-500/30",
  "Insurance Review": "bg-violet-500/15 text-violet-600 border-violet-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Reimbursed: "bg-success/15 text-success border-success/30",
  Deducted: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  Closed: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

export default function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const claim = useClaims((s) => s.items.find((c) => c.id === id));
  const setStatus = useClaims((s) => s.setStatus);
  const addEvidence = useClaims((s) => s.addEvidence);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);
  const [tab, setTab] = useState<
    "overview" | "customer" | "foreman" | "internal" | "insurance" | "resolution"
  >("overview");

  if (!claim) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/claims">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to claims
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">Claim not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerEvidence = claim.evidence.filter((e) => e.side === "customer");
  const foremanEvidence = claim.evidence.filter((e) => e.side === "foreman");
  const internalEvidence = claim.evidence.filter((e) => e.side === "internal");
  const insuranceEvidence = claim.evidence.filter((e) => e.side === "insurance");

  const handleStatus = (next: ClaimStatus) => {
    const prev = claim.status;
    setStatus(claim.id, next, user.name);
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Claims",
      action: "status_changed",
      objectType: "Claim",
      objectId: claim.id,
      title: `Claim ${claim.id} moved from ${prev} to ${next}`,
      beforeValue: { status: prev },
      afterValue: { status: next },
    });
  };

  const handleRequestForemanResponse = () => {
    handleStatus("Foreman Response Needed");
  };

  const handleAddEvidence = (side: "customer" | "foreman" | "internal" | "insurance") => {
    const caption = window.prompt(`Add ${side} evidence note:`);
    if (!caption) return;
    addEvidence(claim.id, {
      side,
      kind: "note",
      caption,
      placeholderTone:
        side === "customer"
          ? "rose"
          : side === "foreman"
            ? "emerald"
            : side === "internal"
              ? "violet"
              : "cyan",
      uploadedBy: user.name,
      body: caption,
    });
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Claims",
      action: "submitted",
      objectType: "Claim",
      objectId: claim.id,
      title: `Evidence added to claim ${claim.id}`,
      notes: `${side} side: ${caption}`,
    });
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/claims">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to claims
        </Link>
      </Button>

      <PageHeader
        title={`${claim.claimType} — ${claim.customerName}`}
        description={`Claim ${claim.id} · Job ${claim.jobId}`}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold " +
                  STATUS_STYLES[claim.status]
                }
              >
                {claim.status}
              </span>
              <Badge variant="outline">{claim.claimType}</Badge>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
              <Meta icon={User} label="Customer" value={claim.customerName} />
              <Meta icon={ClipboardCheck} label="Job" value={claim.jobId} link={`/jobs/${claim.jobId}`} />
              <Meta icon={User} label="Foreman" value={claim.foremanName} />
              <Meta icon={Truck} label="Truck" value={claim.truckName} />
              <Meta icon={Shield} label="Reviewer" value={claim.assignedReviewer} />
              <Meta icon={Phone} label="Opened" value={formatDateTimeStable(claim.openedAt)} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Claim amount" value={formatCurrency(claim.claimAmount)} primary />
              <Stat
                label="Reimbursed"
                value={formatCurrency(claim.reimbursedAmount ?? 0)}
                accent="success"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1">
                    Change Status <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Move claim to</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {CLAIM_STATUSES.filter((s) => s !== claim.status).map((s) => (
                    <DropdownMenuItem key={s} onClick={() => handleStatus(s)}>
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={handleRequestForemanResponse}
                disabled={claim.status === "Foreman Response Needed"}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Request foreman response
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 overflow-x-auto">
        {(
          [
            ["overview", "Overview"],
            ["customer", `Customer (${customerEvidence.length})`],
            ["foreman", `Foreman Defense (${foremanEvidence.length})`],
            ["internal", `Internal Review (${internalEvidence.length})`],
            ["insurance", `Insurance (${insuranceEvidence.length})`],
            ["resolution", "Resolution"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors " +
              (tab === id
                ? "bg-background text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>All evidence across every side.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {claim.evidence.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-border bg-card p-2">
                <EvidencePlaceholder
                  tone={ev.placeholderTone}
                  kind={ev.kind}
                  label={ev.side.toUpperCase()}
                />
                <p className="mt-2 text-xs font-semibold">{ev.caption}</p>
                {ev.body && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                    {ev.body}
                  </p>
                )}
                <p className="mt-1 text-[9px] text-muted-foreground">
                  {ev.uploadedBy} · {formatDateStable(ev.uploadedAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(tab === "customer" || tab === "foreman" || tab === "internal" || tab === "insurance") && (
        <EvidenceTab
          side={tab}
          title={
            tab === "foreman"
              ? "Foreman Defense"
              : tab.charAt(0).toUpperCase() + tab.slice(1)
          }
          description={
            tab === "foreman"
              ? "The foreman's right to defend themselves with pre-move photos, signed inventory, and condition reports."
              : tab === "customer"
                ? "Customer-submitted photos, notes and documents."
                : tab === "internal"
                  ? "Hub team review notes and inventory reconciliation."
                  : "Insurance carrier responses and decisions."
          }
          evidence={
            tab === "customer"
              ? customerEvidence
              : tab === "foreman"
                ? foremanEvidence
                : tab === "internal"
                  ? internalEvidence
                  : insuranceEvidence
          }
          onAdd={() => handleAddEvidence(tab)}
        />
      )}

      {tab === "resolution" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolution</CardTitle>
            <CardDescription>Reimbursement, deduction, and closure note.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="Reimbursed to customer"
                value={formatCurrency(claim.reimbursedAmount ?? 0)}
                accent="success"
              />
              <Stat
                label="Deducted from foreman"
                value={formatCurrency(claim.deductedAmount ?? 0)}
                accent="warning"
              />
            </div>
            {claim.internalReviewNote && (
              <div className="rounded-lg border border-violet-500/40 bg-violet-500/[0.06] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">
                  Internal review
                </p>
                <p className="mt-1 text-xs">{claim.internalReviewNote}</p>
              </div>
            )}
            {claim.resolutionNote ? (
              <div className="rounded-lg border border-success/40 bg-success/[0.06] p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolved
                </p>
                <p className="mt-1 text-xs">{claim.resolutionNote}</p>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                No resolution recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EvidenceTab({
  side,
  title,
  description,
  evidence,
  onAdd,
}: {
  side: string;
  title: string;
  description: string;
  evidence: ReturnType<typeof useClaims.getState>["items"][number]["evidence"];
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add {side === "customer" ? "evidence" : "note"}
        </Button>
      </CardHeader>
      <CardContent>
        {evidence.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
            No {side} evidence yet.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {evidence.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-border bg-card p-2">
                <EvidencePlaceholder
                  tone={ev.placeholderTone}
                  kind={ev.kind}
                  label={ev.kind.toUpperCase()}
                />
                <p className="mt-2 text-xs font-semibold">{ev.caption}</p>
                {ev.body && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {ev.body}
                  </p>
                )}
                <p className="mt-1 text-[9px] text-muted-foreground">
                  {ev.uploadedBy} · {formatDateTimeStable(ev.uploadedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  link?: string;
}) {
  const content = (
    <>
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
    </>
  );
  return link ? (
    <Link href={link} className="flex items-center gap-1.5 hover:underline">
      {content}
    </Link>
  ) : (
    <p className="flex items-center gap-1.5">{content}</p>
  );
}

function Stat({
  label,
  value,
  primary,
  accent,
}: {
  label: string;
  value: string;
  primary?: boolean;
  accent?: "success" | "warning";
}) {
  return (
    <div
      className={
        "rounded-lg border border-border bg-muted/20 p-2 " +
        (primary
          ? "border-primary/40 bg-primary/[0.04]"
          : accent === "success"
            ? "border-success/40 bg-success/[0.04]"
            : accent === "warning"
              ? "border-warning/40 bg-warning/[0.04]"
              : "")
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-0.5 font-mono text-lg font-bold " +
          (primary ? "text-primary" : accent === "success" ? "text-success" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
