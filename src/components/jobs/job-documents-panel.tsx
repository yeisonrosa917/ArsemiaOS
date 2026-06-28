"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Plus,
  Printer,
  Send,
  XCircle,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useJobDocuments,
  type JobDocumentInstance,
  type JobDocumentStatus,
} from "@/lib/store/job-documents";
import { useCompanyConfig } from "@/lib/store/company-config";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { useActivityLog } from "@/lib/store/activity-log";
import { cn } from "@/lib/utils";
import { formatDateStable, formatDateTimeStable } from "@/lib/dates";

const STATUS_STYLES: Record<JobDocumentStatus, string> = {
  draft: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  ready: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  sent: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  partially_signed: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  signed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  voided: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

const STATUS_LABEL: Record<JobDocumentStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  sent: "Sent",
  partially_signed: "Partially signed",
  signed: "Signed",
  voided: "Voided",
};

export function JobDocumentsPanel({
  jobId,
  customerName,
  foremanName,
}: {
  jobId: string;
  customerName: string;
  foremanName?: string;
}) {
  const templates = useCompanyConfig((s) => s.documentTemplates);
  // Select stable store state, derive the filtered list with useMemo. Filtering
  // inside the selector returns a new array every render → infinite loop.
  const allItems = useJobDocuments((s) => s.items);
  const items = useMemo(
    () => allItems.filter((d) => d.jobId === jobId),
    [allItems, jobId],
  );
  const generate = useJobDocuments((s) => s.generate);
  const markSent = useJobDocuments((s) => s.markSent);
  const signAs = useJobDocuments((s) => s.signAs);
  const voidDoc = useJobDocuments((s) => s.voidDoc);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const preview = items.find((d) => d.id === previewId) ?? null;

  const activeTemplates = useMemo(() => templates.filter((t) => t.active), [templates]);

  const log = (action: "created" | "submitted" | "updated", title: string) => {
    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Jobs",
      action,
      objectType: "JobDocument",
      objectId: jobId,
      title,
    });
  };

  const handleGenerate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const doc = generate({ jobId, template: tpl });
    log("created", `Document ${tpl.title} generated for ${jobId}`);
    setPreviewId(doc.id);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Documents
          </CardTitle>
          <CardDescription>
            Quote terms, BOL, start agreement, inventory, delivery, claim
            release. Templates are configured in Settings → Calculator & Pricing.
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Generate
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {activeTemplates.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => handleGenerate(t.id)}>
                {t.title}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  v{t.version}
                </span>
              </DropdownMenuItem>
            ))}
            {activeTemplates.length === 0 && (
              <DropdownMenuItem disabled>
                No active templates
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
            No documents generated yet. Use <em>Generate</em> to create the
            quote terms, BOL or start agreement.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
              >
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{d.title}</p>
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                        STATUS_STYLES[d.status],
                      )}
                    >
                      {STATUS_LABEL[d.status]}
                    </span>
                    {d.signatures.map((sg) => (
                      <Badge key={sg.role} variant="outline" className="text-[10px]">
                        {sg.role} ✓ {sg.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Generated {formatDateTimeStable(d.generatedAt)}
                    {d.sentAt && ` · sent ${formatDateStable(d.sentAt)}`}
                    {d.signedAt && ` · signed ${formatDateStable(d.signedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px]"
                    onClick={() => setPreviewId(d.id)}
                  >
                    Preview
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-[10px]"
                  >
                    <Link
                      href={`/jobs/${jobId}/documents/${d.id}/print`}
                      target="_blank"
                    >
                      <Printer className="h-3 w-3" />
                      Print
                    </Link>
                  </Button>
                  {d.status !== "voided" && d.status !== "signed" && (
                    <>
                      {d.status === "ready" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-[10px]"
                          onClick={() => {
                            markSent(d.id, user.name);
                            log("submitted", `Document ${d.title} sent for ${jobId}`);
                          }}
                        >
                          <Send className="h-3 w-3" />
                          Mark sent
                        </Button>
                      )}
                      {(d.status === "sent" || d.status === "partially_signed") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px]">
                              <CheckCircle2 className="h-3 w-3" />
                              Sign
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                signAs(d.id, "customer", customerName);
                                log("updated", `Customer signed ${d.title}`);
                              }}
                            >
                              Customer ({customerName})
                            </DropdownMenuItem>
                            {foremanName && (
                              <DropdownMenuItem
                                onClick={() => {
                                  signAs(d.id, "foreman", foremanName);
                                  log("updated", `Foreman signed ${d.title}`);
                                }}
                              >
                                Foreman ({foremanName})
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title="Void document"
                        onClick={() => {
                          if (confirm(`Void ${d.title}?`)) {
                            voidDoc(d.id);
                            log("updated", `Document ${d.title} voided`);
                          }
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 text-rose-500" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {preview && (
          <>
            <Separator />
            <div className="rounded-xl border border-border bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{preview.title}</p>
                <button
                  onClick={() => setPreviewId(null)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Close preview
                </button>
              </div>
              <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-md bg-background p-3 font-mono text-[11px] leading-relaxed">
                {renderTemplate(preview.snapshotContent, {
                  company: "Arsemia Logistics LLC",
                  customer: customerName,
                  foreman: foremanName ?? "",
                  jobId,
                  date: formatDateStable(new Date()),
                  timestamp: formatDateTimeStable(new Date()),
                  validDays: "14",
                })}
              </pre>
              <p className="mt-2 text-[10px] text-amber-700">
                Template only — review with legal counsel before sending to a customer.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function renderTemplate(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}
