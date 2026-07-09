"use client";

import { useState } from "react";
import { Check, PackagePlus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCatalogPending,
  pendingCount,
  type PendingCatalogItem,
} from "@/lib/store/catalog-pending";
import { useCompanyConfig, type CatalogCategory, type CatalogItem } from "@/lib/store/company-config";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { useActivityLog } from "@/lib/store/activity-log";
import { formatDateTimeStable } from "@/lib/dates";

const CATEGORIES: CatalogCategory[] = ["Furniture", "Appliance", "Box", "Fragile", "Bulky", "Specialty", "Other"];

function slug(name: string): string {
  return "cust_" + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}

export function CatalogApprovalCard() {
  const items = useCatalogPending((s) => s.items);
  const approve = useCatalogPending((s) => s.approve);
  const reject = useCatalogPending((s) => s.reject);
  const upsertCatalogItem = useCompanyConfig((s) => s.upsertCatalogItem);
  const companyId = useCompanyConfig((s) => s.companyId);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const reviewer = getUserByRole(activeRoleId).name;
  const pushActivity = useActivityLog((s) => s.push);

  // Per-item editable draft (cuft + category) before approving.
  const [drafts, setDrafts] = useState<Record<string, { cuft: number; category: CatalogCategory }>>({});
  const draftFor = (i: PendingCatalogItem) => drafts[i.id] ?? { cuft: i.cuft, category: i.category };
  const setDraft = (id: string, patch: Partial<{ cuft: number; category: CatalogCategory }>) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? { cuft: 0, category: "Other" }), ...patch } as { cuft: number; category: CatalogCategory } }));

  const pending = items.filter((i) => i.status === "Pending");
  const reviewed = items.filter((i) => i.status !== "Pending").slice(0, 6);

  const doApprove = (i: PendingCatalogItem) => {
    const d = draftFor(i);
    const catalogItem: CatalogItem = {
      id: slug(i.name),
      companyId,
      name: i.name,
      category: d.category,
      aliases: i.aliases ?? [],
      defaultCuFt: d.cuft,
      active: true,
      fragile: d.category === "Fragile",
      bulky: d.category === "Bulky",
      requiresPacking: d.category === "Fragile",
      specialHandlingEligible: d.category === "Specialty" || d.category === "Bulky",
    };
    upsertCatalogItem(catalogItem);
    approve(i.id, reviewer);
    pushActivity({
      actorId: `role_${activeRoleId}`,
      actorName: reviewer,
      actorRole: activeRoleId,
      module: "Settings",
      action: "approved",
      objectType: "CatalogItem",
      objectId: catalogItem.id,
      title: `Approved "${i.name}" into the catalog (${d.cuft} ft³, ${d.category})`,
    });
  };

  const doReject = (i: PendingCatalogItem) => {
    reject(i.id, reviewer);
    pushActivity({
      actorId: `role_${activeRoleId}`,
      actorName: reviewer,
      actorRole: activeRoleId,
      module: "Settings",
      action: "rejected",
      objectType: "CatalogItem",
      objectId: i.id,
      title: `Rejected catalog suggestion "${i.name}"`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-primary" />
              Catalog approvals
            </CardTitle>
            <CardDescription>
              Items sellers suggested for the master catalog. Approving adds them to the company item catalog used by every quote.
            </CardDescription>
          </div>
          {pendingCount(items) > 0 && <Badge variant="warning">{pendingCount(items)} pending</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-6 text-center text-sm text-muted-foreground">
            No items waiting for review.
          </p>
        )}

        {pending.map((i) => {
          const d = draftFor(i);
          return (
            <div key={i.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{i.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Suggested by {i.submittedBy} ({i.submittedByRole}) · {formatDateTimeStable(i.submittedAt)}
                  </p>
                  {i.note && <p className="mt-1 text-[11px] italic text-muted-foreground">“{i.note}”</p>}
                  {i.aliases && i.aliases.length > 0 && (
                    <p className="mt-1 text-[10px] text-muted-foreground">Aliases: {i.aliases.join(", ")}</p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  ft³
                  <Input
                    type="number"
                    value={d.cuft || ""}
                    onChange={(e) => setDraft(i.id, { cuft: Number(e.target.value) })}
                    className="h-8 w-20"
                  />
                </label>
                <select
                  value={d.category}
                  onChange={(e) => setDraft(i.id, { category: e.target.value as CatalogCategory })}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => doReject(i)}>
                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button size="sm" className="h-8 text-xs" disabled={!d.cuft || d.cuft <= 0} onClick={() => doApprove(i)}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {reviewed.length > 0 && (
          <div className="pt-1">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recently reviewed</p>
            <ul className="space-y-1">
              {reviewed.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs">
                  <span className="truncate">{i.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{i.reviewedBy}</span>
                    <Badge variant={i.status === "Approved" ? "success" : "danger"} className="text-[9px]">{i.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
