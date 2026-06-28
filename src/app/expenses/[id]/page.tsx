"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Copy,
  DollarSign,
  PauseCircle,
  Receipt,
  Send,
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useExpenses,
  EXPENSE_STATUSES,
  type ExpenseStatus,
} from "@/lib/store/expenses";
import { useActivityLog } from "@/lib/store/activity-log";
import type { ActivityAction } from "@/lib/types";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole, getActiveForemanId } from "@/lib/auth/users";
import { formatCurrency } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  Submitted: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Needs Receipt": "bg-warning/15 text-warning border-warning/30",
  "Under Review": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  Duplicate: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Paid: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  Reimbursed: "bg-success/15 text-success border-success/30",
  "On Hold": "bg-orange-500/15 text-orange-600 border-orange-500/30",
};

export default function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const expense = useExpenses((s) => s.items.find((e) => e.id === id));
  const setStatus = useExpenses((s) => s.setStatus);
  const approve = useExpenses((s) => s.approve);
  const reject = useExpenses((s) => s.reject);
  const markDuplicate = useExpenses((s) => s.markDuplicate);
  const markPaid = useExpenses((s) => s.markPaid);
  const markReimbursed = useExpenses((s) => s.markReimbursed);
  const addReviewNote = useExpenses((s) => s.addReviewNote);
  const setReimbursable = useExpenses((s) => s.setReimbursable);
  const updateDetection = useExpenses((s) => s.updateDetection);

  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  const [noteDraft, setNoteDraft] = useState("");

  const foremanId = getActiveForemanId(activeRoleId);
  // A foreman may only open their own expense, never another foreman's.
  const blockedForForeman = !!foremanId && !!expense && expense.foremanId !== foremanId;

  if (!expense || blockedForForeman) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/expenses">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to expenses
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold">
              {blockedForForeman ? "Not available" : "Expense not found"}
            </p>
            {blockedForForeman && (
              <p className="mt-1 text-xs text-muted-foreground">
                You can only view your own expenses.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const log = (
    action: ActivityAction,
    title: string,
    before?: Record<string, unknown>,
    after?: Record<string, unknown>,
  ) => {
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Expenses",
      action,
      objectType: "Expense",
      objectId: expense.id,
      title,
      beforeValue: before,
      afterValue: after,
    });
  };

  const handleStatus = (next: ExpenseStatus) => {
    const prev = expense.status;
    setStatus(expense.id, next, user.name);
    log(
      "status_changed",
      `Expense ${expense.id} → ${next}`,
      { status: prev },
      { status: next },
    );
  };

  const handleApprove = () => {
    approve(expense.id, user.name);
    log(
      "approved",
      `Expense ${expense.id} approved (${formatCurrency(expense.amount)})`,
      { status: expense.status },
      { status: "Approved" },
    );
  };

  const handleReject = () => {
    const reason = prompt("Reason for rejecting this expense?");
    if (!reason) return;
    reject(expense.id, user.name, reason);
    log(
      "rejected",
      `Expense ${expense.id} rejected — ${reason}`,
      { status: expense.status },
      { status: "Rejected", reason },
    );
  };

  const handleDuplicate = () => {
    const dup = prompt("Duplicate of which expense ID? (leave blank if unknown)") ?? "";
    markDuplicate(expense.id, user.name, dup || undefined);
    log(
      "status_changed",
      `Expense ${expense.id} flagged duplicate${dup ? ` of ${dup}` : ""}`,
      { status: expense.status },
      { status: "Duplicate", duplicateOf: dup },
    );
  };

  const handlePaid = () => {
    markPaid(expense.id, user.name);
    log(
      "paid",
      `Expense ${expense.id} marked Paid`,
      { status: expense.status },
      { status: "Paid" },
    );
  };

  const handleReimbursed = () => {
    markReimbursed(expense.id, user.name);
    log(
      "paid",
      `Expense ${expense.id} reimbursed to ${expense.foremanName}`,
      { status: expense.status },
      { status: "Reimbursed" },
    );
  };

  const handleAddNote = () => {
    if (!noteDraft.trim()) return;
    addReviewNote(expense.id, {
      authorName: user.name,
      authorId: user.id,
      text: noteDraft.trim(),
    });
    log("updated", `Reviewer note added on ${expense.id}`);
    setNoteDraft("");
  };

  const terminalStatuses: ExpenseStatus[] = ["Paid", "Reimbursed", "Rejected", "Duplicate"];
  const isTerminal = terminalStatuses.includes(expense.status);

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/expenses">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to expenses
        </Link>
      </Button>

      <PageHeader
        title={`Expense ${expense.id}`}
        description={`${expense.category} · ${expense.foremanName}`}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold " +
                  STATUS_STYLES[expense.status]
                }
              >
                {expense.status}
              </span>
              <Badge variant="outline">{expense.category}</Badge>
              <Badge variant="outline" className="text-[10px]">
                {expense.paymentMethod}
              </Badge>
              {expense.duplicateOf && (
                <Badge variant="outline" className="text-[10px]">
                  Dup of {expense.duplicateOf}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Row label="Submitted" value={formatDateTimeStable(expense.date)} />
              <Row label="Foreman" value={`${expense.foremanName} (${expense.foremanId})`} />
              <Row label="Truck" value={expense.truckName} />
              {expense.jobId && (
                <Row label="Job" value={expense.jobId} link={`/jobs/${expense.jobId}`} />
              )}
              {expense.vendor && <Row label="Vendor" value={expense.vendor} />}
              {expense.reviewedBy && (
                <Row label="Reviewed by" value={expense.reviewedBy} />
              )}
              {expense.reviewedAt && (
                <Row
                  label="Reviewed at"
                  value={formatDateTimeStable(expense.reviewedAt)}
                />
              )}
              {expense.paidAt && (
                <Row label="Paid at" value={formatDateTimeStable(expense.paidAt)} />
              )}
              {expense.reimbursedAt && (
                <Row
                  label="Reimbursed at"
                  value={formatDateTimeStable(expense.reimbursedAt)}
                />
              )}
            </div>
            {expense.notes && (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 p-2 text-xs italic">
                {expense.notes}
              </p>
            )}
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-primary/40 bg-primary/[0.04] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount
                </p>
                <p className="mt-0.5 font-mono text-2xl font-bold">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reimbursable
                  </p>
                  <label className="flex items-center gap-1.5 text-[10px]">
                    <input
                      type="checkbox"
                      checked={expense.reimbursable}
                      onChange={(e) => setReimbursable(expense.id, e.target.checked)}
                      className="h-3.5 w-3.5"
                    />
                    {expense.reimbursable ? "Yes" : "No"}
                  </label>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {expense.paymentMethod === "Foreman Out-of-Pocket"
                    ? "Foreman paid out of pocket → flows to payroll reimbursements once approved."
                    : "Company-paid expense — not added to foreman payroll."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" />
            Receipt
          </CardTitle>
          <CardDescription>
            Submission requires a receipt. Detection runs through OCR once wired
            — reviewer can correct any field below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            {expense.receiptUrl ? (
              <div className="aspect-[4/5] overflow-hidden rounded-xl border border-border bg-gradient-to-b from-muted/40 to-muted/10">
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                  <Receipt className="h-10 w-10 text-muted-foreground/60" />
                  <p className="text-xs font-semibold">Receipt on file</p>
                  <p className="break-all font-mono text-[10px] text-muted-foreground">
                    {expense.receiptUrl}
                  </p>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Image preview lights up once the Foreman App ships and
                    receipts upload to storage.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-500/50 bg-rose-500/[0.04] p-6 text-center">
                <Receipt className="h-10 w-10 text-rose-500/70" />
                <p className="text-xs font-semibold text-rose-600">
                  Receipt missing
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Use <em>Request receipt</em> to push the foreman an upload
                  request via the mobile app.
                </p>
              </div>
            )}
          </div>
          <div className="md:col-span-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetectField
              label="Detected merchant"
              value={expense.detection?.merchant ?? ""}
              onChange={(v) => updateDetection(expense.id, { merchant: v })}
            />
            <DetectField
              label="Detected date"
              value={expense.detection?.date ?? ""}
              onChange={(v) => updateDetection(expense.id, { date: v })}
              hint="YYYY-MM-DD"
            />
            <DetectField
              label="Detected total"
              value={
                expense.detection?.total != null
                  ? String(expense.detection.total)
                  : ""
              }
              onChange={(v) =>
                updateDetection(expense.id, { total: v ? Number(v) : undefined })
              }
            />
            <DetectField
              label="Detected tax"
              value={
                expense.detection?.tax != null
                  ? String(expense.detection.tax)
                  : ""
              }
              onChange={(v) =>
                updateDetection(expense.id, { tax: v ? Number(v) : undefined })
              }
            />
            <DetectField
              label="Detected description"
              value={expense.detection?.description ?? ""}
              onChange={(v) => updateDetection(expense.id, { description: v })}
              full
            />
            <div className="rounded-lg border border-border bg-muted/20 p-2 sm:col-span-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>AI confidence</span>
                <span>
                  {expense.detection?.confidence != null
                    ? `${Math.round(expense.detection.confidence * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${(expense.detection?.confidence ?? 0) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Duplicate risk</span>
                <span>
                  {expense.detection?.duplicateRisk != null
                    ? `${Math.round(expense.detection.duplicateRisk * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-rose-500"
                  style={{
                    width: `${(expense.detection?.duplicateRisk ?? 0) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
          <CardDescription>
            {isTerminal
              ? "This expense is in a terminal state. Use the status menu to override."
              : "Approve, reject, mark paid or flag as duplicate. Each change is logged."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {expense.status === "Submitted" && (
            <Button size="sm" onClick={() => handleStatus("Under Review")} className="gap-1">
              <Send className="h-3.5 w-3.5" />
              Move to review
            </Button>
          )}
          {!isTerminal && expense.status !== "Approved" && (
            <Button size="sm" onClick={handleApprove} className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
          )}
          {expense.status === "Approved" && (
            <Button size="sm" onClick={handlePaid} className="gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Mark Paid
            </Button>
          )}
          {(expense.status === "Approved" || expense.status === "Paid") &&
            expense.paymentMethod === "Foreman Out-of-Pocket" && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReimbursed}
                className="gap-1"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Mark Reimbursed
              </Button>
            )}
          {!isTerminal && (
            <Button size="sm" variant="outline" onClick={handleReject} className="gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          )}
          {!isTerminal && (
            <Button size="sm" variant="outline" onClick={handleDuplicate} className="gap-1">
              <Copy className="h-3.5 w-3.5" />
              Mark Duplicate
            </Button>
          )}
          {!isTerminal && expense.status !== "On Hold" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatus("On Hold")}
              className="gap-1"
            >
              <PauseCircle className="h-3.5 w-3.5" />
              Hold
            </Button>
          )}
          {!isTerminal && expense.status !== "Needs Receipt" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatus("Needs Receipt")}
              className="gap-1"
            >
              <Ban className="h-3.5 w-3.5" />
              Request receipt
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                Change status…
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {EXPENSE_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => handleStatus(s)}
                  disabled={s === expense.status}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviewer notes</CardTitle>
          <CardDescription>
            {expense.reviewNotes.length} note
            {expense.reviewNotes.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {expense.reviewNotes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
              No reviewer notes yet.
            </p>
          ) : (
            <div className="space-y-2">
              {expense.reviewNotes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-border bg-muted/20 p-2 text-sm"
                >
                  <p>{n.text}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {n.authorName} · {formatDateTimeStable(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Separator />
          <div className="flex gap-2">
            <Input
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a reviewer note (e.g. ask foreman to upload receipt)…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
            />
            <Button size="sm" onClick={handleAddNote} disabled={!noteDraft.trim()}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, link }: { label: string; value: string; link?: string }) {
  const content = (
    <>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-semibold">{value}</span>
    </>
  );
  return link ? (
    <Link href={link} className="hover:underline">
      {content}
    </Link>
  ) : (
    <p>{content}</p>
  );
}

function DetectField({
  label,
  value,
  onChange,
  hint,
  full,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  full?: boolean;
}) {
  return (
    <div className={"space-y-1 " + (full ? "sm:col-span-2" : "")}>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
