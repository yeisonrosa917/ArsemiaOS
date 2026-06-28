"use client";

import { useState } from "react";
import { AlertTriangle, Lock, Shield, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/lib/store/account";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { useNotifications } from "@/lib/store/notifications";
import { getUserByRole } from "@/lib/auth/users";
import { cn } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

export function PrivacyDataCard() {
  const account = useAccount((s) => s.account);
  const requestDeletion = useAccount((s) => s.requestDeletion);
  const completeDeletion = useAccount((s) => s.completeDeletion);
  const cancelDeletion = useAccount((s) => s.cancelDeletion);
  const pushActivity = useActivityLog((s) => s.push);
  const clearNotifications = useNotifications((s) => s.clear);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const currentUser = getUserByRole(activeRoleId);

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isDeleted = !!account?.anonymized;
  const isRequested = !!account?.deletionRequestedAt && !isDeleted;

  const handleRequest = () => {
    requestDeletion(currentUser.id);
    pushActivity({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: activeRoleId,
      module: "Account",
      action: "account_deletion_requested",
      objectType: "User",
      objectId: currentUser.id,
      title: "Account deletion requested",
      notes:
        "User requested account deletion. Will complete with anonymization in 30 days unless cancelled.",
    });
    setOpen(false);
  };

  const handleComplete = () => {
    if (confirmText !== "DELETE") return;
    const state = completeDeletion();
    pushActivity({
      actorId: currentUser.id,
      actorName: "Deleted Account",
      actorRole: activeRoleId,
      module: "Privacy",
      action: "account_deletion_completed",
      objectType: "User",
      objectId: currentUser.id,
      title: "Account deletion completed",
      beforeValue: { name: currentUser.name, email: currentUser.email },
      afterValue: { name: "Deleted Account", email: null, anonymized: true },
      notes:
        "PII anonymized. Business records (jobs, payroll, claims) preserved for legal/tax purposes.",
      metadata: { deletedAt: state.deletedAt },
    });
    // Mock session revocation
    clearNotifications();
    setConfirmText("");
    setOpen(false);
  };

  const handleCancel = () => {
    cancelDeletion();
    pushActivity({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: activeRoleId,
      module: "Account",
      action: "updated",
      objectType: "User",
      objectId: currentUser.id,
      title: "Account deletion request cancelled",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Privacy & Data
        </CardTitle>
        <CardDescription>
          Control your personal data and platform account. Business records are
          retained per legal/tax requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What gets removed
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Avatar, phone, personal notes</li>
            <li>• Email replaced with non-personal placeholder</li>
            <li>• Display name anonymized to &ldquo;Deleted Account&rdquo;</li>
            <li>• Notifications disabled</li>
            <li>• Sessions and tokens revoked</li>
            <li>• Third-party providers disconnected</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What is preserved (retention policy)
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Job records (operational history)</li>
            <li>• Payroll lines (tax filings)</li>
            <li>• Invoices & accounting</li>
            <li>• Claims & legal defense evidence</li>
            <li>• Activity log entries (anonymized actor name)</li>
            <li>• Fraud-prevention audit trail</li>
          </ul>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Deleting a platform user is separate from deleting a customer
            record or anonymizing a foreman profile. Each has its own flow.
          </p>
        </div>

        <Separator />

        {isDeleted ? (
          <div className="rounded-xl border border-success/40 bg-success/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-success" />
              Account anonymized
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Completed{" "}
              {account?.deletedAt
                ? formatDateTimeStable(account.deletedAt)
                : "—"}
              . Business records preserved.
            </p>
          </div>
        ) : isRequested ? (
          <div className="rounded-xl border border-warning/40 bg-warning/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Deletion requested
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Requested{" "}
              {account?.deletionRequestedAt
                ? formatDateTimeStable(account.deletionRequestedAt)
                : "—"}
              . You can cancel this request until anonymization is final.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel request
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() => setOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Finalize anonymization
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        )}
      </CardContent>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-popover p-6 shadow-elevated"
            aria-describedby="delete-desc"
          >
            <Dialog.Title className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {isRequested ? "Finalize anonymization?" : "Request account deletion?"}
            </Dialog.Title>
            <p id="delete-desc" className="mt-2 text-sm text-muted-foreground">
              {isRequested
                ? "This will anonymize all your personal data immediately. Business records will be preserved for tax/legal purposes."
                : "We will mark your account for deletion. You can cancel the request before anonymization. Your business records (jobs, payroll, claims) stay intact for legal/tax compliance."}
            </p>

            {isRequested && (
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type DELETE to confirm
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  className={cn(
                    "mt-1 font-mono",
                    confirmText === "DELETE" && "border-destructive",
                  )}
                />
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {isRequested ? (
                <Button
                  variant="destructive"
                  onClick={handleComplete}
                  disabled={confirmText !== "DELETE"}
                  className="gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Anonymize now
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleRequest} className="gap-1">
                  <Trash2 className="h-3.5 w-3.5" />
                  Request deletion
                </Button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Card>
  );
}
