"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Info,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
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
import {
  DEFAULT_RATES,
  HANDLING_CATS,
  HANDLING_ITEMS,
  PRESET_ITEMS,
  type HandlingItem,
} from "@/lib/calculator/catalog";
import { parseItemText, type ParseResult } from "@/lib/calculator/parse-items";
import { useCompanyConfig } from "@/lib/store/company-config";
import {
  calculateQuote,
  fmtCuft,
  fmtUSD,
  type InventoryLine,
} from "@/lib/calculator/engine";
import {
  JOB_TYPES,
  useQuotesStore,
  type JobType,
  type QuoteFee,
  type QuoteNotes,
} from "@/lib/store/quotes";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { useCatalogPending } from "@/lib/store/catalog-pending";
import { ROLES } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * Default LD customer-facing mileage rate. Configurable per quote and totally
 * separate from the internal payroll rate (which lives on the audit engine).
 */
const DEFAULT_CUSTOMER_MILEAGE_RATE = 7;
const DEFAULT_INTERNAL_MILEAGE_RATE = 3;

export function QuoteBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Company-config-driven presets. When the catalog/pricing changes in
  // Settings → Calculator & Pricing, this component re-renders with the new
  // catalog + rates without any extra wiring.
  const companyCatalog = useCompanyConfig((s) => s.catalog);
  const companyPricing = useCompanyConfig((s) => s.pricing);
  const enabledModes = useCompanyConfig((s) => s.enabledModes);

  // Built-in presets stay as the fallback (covers items the catalog hasn't
  // been customized to include yet). Active catalog items take priority on
  // duplicates so company overrides win.
  const activeCatalog = useMemo(
    () => companyCatalog.filter((c) => c.active),
    [companyCatalog],
  );
  const mergedPresets = useMemo(() => {
    const catalogAsPresets = activeCatalog.map((c) => ({
      name: c.name,
      cuft: c.defaultCuFt,
      aliases: c.aliases,
    }));
    const seenNames = new Set(catalogAsPresets.map((p) => p.name.toLowerCase()));
    const fallback = PRESET_ITEMS.filter(
      (p) => !seenNames.has(p.name.toLowerCase()),
    ).map((p) => ({ ...p, aliases: [] as string[] }));
    return [...catalogAsPresets, ...fallback];
  }, [activeCatalog]);

  // Form state
  const [jobType, setJobType] = useState<JobType>("Local Move");
  const [otherDescription, setOtherDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [miles, setMiles] = useState<number>(0);
  const [customerMileageRate, setCustomerMileageRate] = useState<number>(
    DEFAULT_CUSTOMER_MILEAGE_RATE,
  );
  const [internalMileageRate, setInternalMileageRate] = useState<number>(
    DEFAULT_INTERNAL_MILEAGE_RATE,
  );
  // Seed rates from Company Config on first render.
  useEffect(() => {
    setCustomerMileageRate((r) =>
      r === DEFAULT_CUSTOMER_MILEAGE_RATE ? companyPricing.customerMileageRate : r,
    );
    setInternalMileageRate((r) =>
      r === DEFAULT_INTERNAL_MILEAGE_RATE ? companyPricing.internalMileageRate : r,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [stairsFlights, setStairsFlights] = useState<number>(0);

  // Estimated CuFt — used when the quote has no itemized inventory yet.
  // This is a separate concept from inventory lines. Previously bug: it was
  // injected as a fake "Estimated inventory" row.
  const [estimatedCuFt, setEstimatedCuFt] = useState<number>(0);

  // Inventory — REAL moving items only.
  const [inventory, setInventory] = useState<InventoryLine[]>([]);
  const [search, setSearch] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteResult, setPasteResult] = useState<ParseResult | null>(null);

  // Handling charges
  const [handlingPicked, setHandlingPicked] = useState<Record<string, boolean>>(
    {},
  );
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [ltaAmount, setLtaAmount] = useState<number>(0);

  // Admin Charge — customer-visible, NON-commissionable by default
  const [adminCharge, setAdminCharge] = useState<number>(0);
  const [adminCommissionable, setAdminCommissionable] = useState(false);

  // Notes (per audience)
  const [notesCustomer, setNotesCustomer] = useState("");
  const [notesForeman, setNotesForeman] = useState("");
  const [notesInternal, setNotesInternal] = useState("");
  const [notesAccounting, setNotesAccounting] = useState("");

  // Source tracking
  const [fromLeadId, setFromLeadId] = useState<string | null>(null);
  const [fromCustomerId, setFromCustomerId] = useState<string | null>(null);

  const saveQuote = useQuotesStore((s) => s.saveQuote);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const user = getUserByRole(activeRoleId);

  useEffect(() => {
    const c = searchParams.get("customer");
    const p = searchParams.get("phone");
    const e = searchParams.get("email");
    const fromCity = searchParams.get("fromCity");
    const toCity = searchParams.get("toCity");
    const cuft = searchParams.get("cuft");
    const leadId = searchParams.get("leadId");
    const customerId = searchParams.get("customerId");
    const md = searchParams.get("moveDate");
    const type = searchParams.get("jobType") as JobType | null;
    if (c) setCustomerName(c);
    if (p) setPhone(p);
    if (e) setEmail(e);
    if (fromCity) setPickup(fromCity);
    if (toCity) setDelivery(toCity);
    if (cuft && !Number.isNaN(Number(cuft))) {
      setEstimatedCuFt(Number(cuft));
    }
    if (md) setMoveDate(md);
    if (leadId) setFromLeadId(leadId);
    if (customerId) setFromCustomerId(customerId);
    if (type && JOB_TYPES.includes(type)) setJobType(type);
  }, [searchParams]);

  const filteredPresets = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return mergedPresets.slice(0, 12);
    return mergedPresets
      .filter((it) => {
        const hay = [it.name, ...(it.aliases ?? [])].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 25);
  }, [search, mergedPresets]);

  const addPreset = (name: string, cuft: number, qty = 1) => {
    setInventory((prev) => {
      const idx = prev.findIndex((p) => p.itemName === name);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { itemName: name, qty, cuftEach: cuft }];
    });
    setSearch("");
  };

  const runPasteParse = () => {
    const res = parseItemText(pasteText);
    res.matched.forEach((m) => addPreset(m.name, m.cuftEach, m.qty));
    setPasteResult(res);
  };

  const submitPending = useCatalogPending((s) => s.submit);
  const [suggested, setSuggested] = useState<Record<string, boolean>>({});
  const suggestToCatalog = (name: string) => {
    const clean = name.replace(/^\d+\s*[xX]?\s*/, "").trim();
    submitPending({
      name: clean,
      submittedBy: user.name,
      submittedByRole: ROLES[activeRoleId].label,
      note: "Suggested from quote inventory (no catalog match).",
    });
    setSuggested((s) => ({ ...s, [name]: true }));
  };

  /** Clear the whole estimate back to a blank slate for a new quote. */
  const resetForm = () => {
    setJobType("Local Move");
    setOtherDescription("");
    setCustomerName("");
    setPhone("");
    setEmail("");
    setPickup("");
    setDelivery("");
    setMoveDate("");
    setMiles(0);
    setCustomerMileageRate(companyPricing.customerMileageRate);
    setInternalMileageRate(companyPricing.internalMileageRate);
    setStairsFlights(0);
    setEstimatedCuFt(0);
    setInventory([]);
    setSearch("");
    setPasteOpen(false);
    setPasteText("");
    setPasteResult(null);
    setSuggested({});
    setHandlingPicked({});
    setOpenCats({});
    setLtaAmount(0);
    setAdminCharge(0);
    setAdminCommissionable(false);
    setNotesCustomer("");
    setNotesForeman("");
    setNotesInternal("");
    setNotesAccounting("");
    setFromLeadId(null);
    setFromCustomerId(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateQty = (idx: number, qty: number) => {
    setInventory((prev) => {
      if (qty <= 0) return prev.filter((_, i) => i !== idx);
      const next = [...prev];
      next[idx] = { ...next[idx], qty };
      return next;
    });
  };

  const togglePack = (idx: number) => {
    setInventory((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], packByCrew: !next[idx].packByCrew };
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setInventory((prev) => prev.filter((_, i) => i !== idx));
  };

  const pickedHandling = useMemo<HandlingItem[]>(
    () =>
      HANDLING_ITEMS.filter((h) => handlingPicked[h.id]).map((h) =>
        h.id === "h55" ? { ...h, price: ltaAmount } : h,
      ),
    [handlingPicked, ltaAmount],
  );

  // If inventory is empty BUT estimatedCuFt > 0, pass that as the override so
  // pricing still works. Real items take precedence.
  const inventoryCuft = useMemo(
    () => inventory.reduce((acc, it) => acc + it.qty * it.cuftEach, 0),
    [inventory],
  );

  // Rates come from Company Config — customer-facing vs internal stay separate.
  const result = useMemo(
    () =>
      calculateQuote({
        cuftOverride: inventory.length === 0 ? estimatedCuFt : undefined,
        inventory,
        miles,
        stairsFlights,
        handlingItems: pickedHandling,
        rates: {
          cuftRateCustomer: companyPricing.customerCuFtRate,
          cuftRateInternal: companyPricing.internalCuFtRate,
          milesShortRate: internalMileageRate,
          milesLongRate: internalMileageRate,
        },
      }),
    [
      inventory,
      estimatedCuFt,
      miles,
      stairsFlights,
      pickedHandling,
      internalMileageRate,
      companyPricing.customerCuFtRate,
      companyPricing.internalCuFtRate,
    ],
  );

  const customerMileageCharge = miles * customerMileageRate;

  const customerTotal = useMemo(
    () =>
      result.customer.cuftCharge +
      customerMileageCharge +
      result.customer.packingCharge +
      result.customer.stairsCharge +
      result.customer.handlingCharge +
      adminCharge,
    [result, customerMileageCharge, adminCharge],
  );

  const commissionableBase = useMemo(
    () =>
      result.internal.commissionableBase +
      (adminCommissionable ? adminCharge : 0),
    [result, adminCharge, adminCommissionable],
  );

  const nonCommissionableTotal = useMemo(
    () => (adminCommissionable ? 0 : adminCharge),
    [adminCharge, adminCommissionable],
  );

  // Validation
  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!customerName.trim()) errs.push("Customer name is required");
    if (!jobType) errs.push("Job type is required");
    if (jobType === "Other" && !otherDescription.trim())
      errs.push("Custom description is required when type is Other");
    if (
      jobType !== "Hourly" &&
      jobType !== "Driving Day" &&
      jobType !== "2nd Day" &&
      inventory.length === 0 &&
      estimatedCuFt === 0
    )
      errs.push("Add at least one item or set Estimated CuFt");
    return errs;
  }, [customerName, jobType, otherDescription, inventory, estimatedCuFt]);

  const handleSave = (status: "Draft" | "Sent") => {
    if (errors.length > 0) return;

    const fees: QuoteFee[] = [];
    if (adminCharge > 0) {
      fees.push({
        id: "fee_admin",
        name: "Administrative Surcharge",
        amount: adminCharge,
        commissionable: adminCommissionable,
        customerVisible: true,
        isAdminCharge: true,
      });
    }
    pickedHandling.forEach((h) => {
      fees.push({
        id: `fee_${h.id}`,
        name: h.name,
        amount: h.price,
        commissionable: true,
        customerVisible: true,
      });
    });

    const notes: QuoteNotes = {
      customer: notesCustomer || undefined,
      foreman: notesForeman || undefined,
      internal: notesInternal || undefined,
      accounting: notesAccounting || undefined,
    };

    const saved = saveQuote({
      customerId: fromCustomerId ?? undefined,
      customerName: customerName.trim(),
      customerPhone: phone || undefined,
      customerEmail: email || undefined,
      leadId: fromLeadId ?? undefined,
      jobType,
      otherDescription: otherDescription || undefined,
      moveDate: moveDate || undefined,
      pickupAddress: pickup || undefined,
      deliveryAddress: delivery || undefined,
      estimatedCuFt: inventory.length > 0 ? inventoryCuft : estimatedCuFt,
      inventory: inventory.map((i) => ({
        itemName: i.itemName,
        qty: i.qty,
        cuftEach: i.cuftEach,
        packByCrew: i.packByCrew,
      })),
      fees,
      mileage: {
        miles,
        customerRatePerMile: customerMileageRate,
        internalRatePerMile: internalMileageRate,
      },
      notes,
      customerTotal: Math.round(customerTotal * 100) / 100,
      commissionableBase: Math.round(commissionableBase * 100) / 100,
      nonCommissionableTotal: Math.round(nonCommissionableTotal * 100) / 100,
      status,
      createdBy: user.id,
    });

    pushActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: activeRoleId,
      module: "Quotes",
      action: status === "Sent" ? "submitted" : "created",
      objectType: "Quote",
      objectId: saved.id,
      title:
        status === "Sent"
          ? `Quote ${saved.id} sent to customer`
          : `Quote ${saved.id} drafted`,
      afterValue: {
        customer: saved.customerName,
        jobType: saved.jobType,
        customerTotal: saved.customerTotal,
        commissionableBase: saved.commissionableBase,
      },
      metadata: { leadId: fromLeadId, customerId: fromCustomerId },
    });

    router.push(`/quotes/${saved.id}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {fromLeadId && (
          <Card className="border-success/40 bg-success/[0.04]">
            <CardContent className="flex items-center gap-3 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/20 text-success">
                ✓
              </span>
              <p className="text-xs">
                Prefilled from lead{" "}
                <span className="font-mono font-semibold">{fromLeadId}</span>.
                Saving will mark the lead as Quote Drafted.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Job type & customer</CardTitle>
            <CardDescription>
              Select the move type — it controls visible fields downstream.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Job type">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Quote modes enabled by the company:{" "}
                {enabledModes.length === 0
                  ? "none"
                  : enabledModes.join(", ").replace(/_/g, " ")}
                . Manage in Settings → Calculator & Pricing.
              </p>
            </Field>
            {jobType === "Other" && (
              <Field label="Custom description (required)">
                <Input
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="Briefly describe this custom service"
                />
              </Field>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Customer name">
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(305) 555-0000"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                />
              </Field>
              <Field label="Move date">
                <Input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                />
              </Field>
              <Field label="Pickup address">
                <Input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Pickup"
                />
              </Field>
              <Field label="Delivery address">
                <Input
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  placeholder="Delivery"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mileage</CardTitle>
            <CardDescription>
              Customer-facing rate is separate from internal/payroll rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Field label="Miles">
              <Input
                type="number"
                min={0}
                value={miles || ""}
                onChange={(e) => setMiles(Number(e.target.value) || 0)}
                placeholder="0"
              />
            </Field>
            <Field label={`Customer rate ($/mi)`}>
              <Input
                type="number"
                step={0.25}
                value={customerMileageRate}
                onChange={(e) =>
                  setCustomerMileageRate(Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label={`Internal rate ($/mi)`}>
              <Input
                type="number"
                step={0.25}
                value={internalMileageRate}
                onChange={(e) =>
                  setInternalMileageRate(Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field label="Stairs (flights)">
              <Input
                type="number"
                min={0}
                value={stairsFlights || ""}
                onChange={(e) => setStairsFlights(Number(e.target.value) || 0)}
                placeholder="0"
              />
            </Field>
            <Field label="Estimated CuFt (if not itemized)">
              <Input
                type="number"
                min={0}
                value={estimatedCuFt || ""}
                onChange={(e) => setEstimatedCuFt(Number(e.target.value) || 0)}
                placeholder="0"
                disabled={inventory.length > 0}
              />
            </Field>
            <Field label="Admin charge ($)">
              <Input
                type="number"
                min={0}
                value={adminCharge || ""}
                onChange={(e) => setAdminCharge(Number(e.target.value) || 0)}
                placeholder="0"
              />
              <label className="mt-1 flex cursor-pointer items-center gap-1.5 text-[10px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={adminCommissionable}
                  onChange={(e) => setAdminCommissionable(e.target.checked)}
                  className="h-3 w-3 accent-primary"
                />
                Count in commissionable base
              </label>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              Real moving items only. Pack-by-crew toggles box packing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog — sofa, mattress, box…"
              />
              {search && (
                <div className="absolute left-0 right-0 top-[110%] z-10 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-elevated scrollbar-thin">
                  {filteredPresets.length === 0 && (
                    <p className="p-3 text-sm text-muted-foreground">
                      No items match &ldquo;{search}&rdquo;
                    </p>
                  )}
                  {filteredPresets.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => addPreset(p.name, p.cuft)}
                      className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                    >
                      <span>{p.name}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {fmtCuft(p.cuft)} ft³
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Paste a list — parse free text into catalog items */}
            <div className="rounded-xl border border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setPasteOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  Paste an item list
                </span>
                <span className="text-[10px] text-muted-foreground">{pasteOpen ? "Hide" : "Expand"}</span>
              </button>
              {pasteOpen && (
                <div className="space-y-2 border-t border-border p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Paste from an email, text or call notes — one item per line (e.g. <span className="font-mono">3 dining chairs</span>, <span className="font-mono">2x queen mattress</span>, <span className="font-mono">couch</span>). We match each line to the catalog.
                  </p>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={5}
                    placeholder={"3 dining chairs\nsofa 3 seater\n2x queen mattress\ncoffee table\nfridge"}
                    className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" className="h-8 text-xs" disabled={!pasteText.trim()} onClick={runPasteParse}>
                      Parse &amp; add
                    </Button>
                    {(pasteText || pasteResult) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setPasteText("");
                          setPasteResult(null);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {pasteResult && (
                    <div className="space-y-2 text-[11px]">
                      <p className="font-semibold text-emerald-600">
                        Added {pasteResult.matched.reduce((s, m) => s + m.qty, 0)} item(s) from {pasteResult.matched.length} line(s).
                      </p>
                      {pasteResult.unmatched.length > 0 && (
                        <div className="rounded-lg border border-amber-500/40 bg-amber-500/[0.05] p-2">
                          <p className="mb-1 font-semibold text-amber-700">
                            {pasteResult.unmatched.length} line(s) didn&apos;t match the catalog — add them manually or search:
                          </p>
                          <ul className="space-y-0.5">
                            {pasteResult.unmatched.map((u, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="font-mono text-muted-foreground">{u.qty}×</span>
                                <span>{u.raw}</span>
                                <button
                                  type="button"
                                  onClick={() => setSearch(u.query)}
                                  className="text-[10px] font-semibold text-primary hover:underline"
                                >
                                  search
                                </button>
                                {suggested[u.raw] ? (
                                  <span className="text-[10px] font-semibold text-emerald-600">✓ suggested</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => suggestToCatalog(u.raw)}
                                    className="text-[10px] font-semibold text-amber-700 hover:underline"
                                  >
                                    suggest to catalog
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {inventory.length === 0 ? (
              <div className="space-y-2">
                <p className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-4 text-center text-xs text-muted-foreground">
                  No itemized inventory yet.
                  {estimatedCuFt > 0 && (
                    <>
                      {" "}
                      Pricing uses the <strong>Estimated CuFt</strong> field
                      above ({estimatedCuFt} ft³).
                    </>
                  )}
                </p>
                {estimatedCuFt > 0 && (
                  <p className="flex items-start gap-1.5 px-2 text-[10px] text-muted-foreground">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    Sales should still itemize before sending the quote so the
                    foreman can match items on pickup day.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-right">CuFt</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((it, idx) => (
                      <tr
                        key={`${it.itemName}-${idx}`}
                        className="border-t border-border/60"
                      >
                        <td className="p-2.5">
                          <p className="font-semibold">{it.itemName}</p>
                          <button
                            onClick={() => togglePack(idx)}
                            className={cn(
                              "mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                              it.packByCrew
                                ? "bg-success/15 text-success"
                                : "bg-muted text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {it.packByCrew ? "✓ Pack by crew" : "Pack by crew?"}
                          </button>
                        </td>
                        <td className="p-2.5 text-right font-mono text-xs">
                          {fmtCuft(it.cuftEach)}
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => updateQty(idx, it.qty - 1)}
                              className="h-7 w-7 rounded border border-border bg-muted text-xs font-semibold hover:bg-accent"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={it.qty}
                              onChange={(e) =>
                                updateQty(idx, Number(e.target.value) || 0)
                              }
                              className="h-7 w-12 rounded border border-border bg-background text-center font-mono text-xs"
                            />
                            <button
                              onClick={() => updateQty(idx, it.qty + 1)}
                              className="h-7 w-7 rounded border border-border bg-muted text-xs font-semibold hover:bg-accent"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono text-xs">
                          {fmtCuft(it.qty * it.cuftEach)}
                        </td>
                        <td className="p-2.5">
                          <button
                            onClick={() => removeItem(idx)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 text-xs">
              <span className="text-muted-foreground">Total inventory:</span>
              <span className="font-mono font-semibold">
                {fmtCuft(inventoryCuft || estimatedCuFt)} ft³
              </span>
              {result.cuftMinimumApplied && (
                <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning">
                  Min {DEFAULT_RATES.cuftMinimum} ft³ applied
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Handling charges</CardTitle>
            <CardDescription>
              Disassembly, cardboard, special items, LTA. Collapsed by default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(HANDLING_CATS).map(([catId, meta]) => {
              const items = HANDLING_ITEMS.filter((h) => h.cat === catId);
              const isOpen = openCats[catId];
              const count = items.filter((h) => handlingPicked[h.id]).length;
              return (
                <div
                  key={catId}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    onClick={() =>
                      setOpenCats((s) => ({ ...s, [catId]: !s[catId] }))
                    }
                    className="flex w-full items-center justify-between gap-2 bg-muted/30 px-4 py-2.5 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {meta.label}
                      </span>
                      {count > 0 && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {count}
                        </span>
                      )}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="divide-y divide-border/50">
                      {items.map((h) => {
                        const picked = !!handlingPicked[h.id];
                        return (
                          <div
                            key={h.id}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium">{h.name}</p>
                              {h.editable && picked && (
                                <input
                                  type="number"
                                  value={ltaAmount || ""}
                                  onChange={(e) =>
                                    setLtaAmount(Number(e.target.value) || 0)
                                  }
                                  placeholder="LTA amount"
                                  className="mt-1 h-7 w-32 rounded border border-border bg-background px-2 font-mono text-xs"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold">
                                {fmtUSD(h.editable ? ltaAmount : h.price)}
                              </span>
                              <button
                                onClick={() =>
                                  setHandlingPicked((s) => ({
                                    ...s,
                                    [h.id]: !s[h.id],
                                  }))
                                }
                                className={cn(
                                  "h-7 w-7 rounded-md border text-base font-semibold transition-colors",
                                  picked
                                    ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
                                )}
                              >
                                {picked ? (
                                  <X className="mx-auto h-3.5 w-3.5" />
                                ) : (
                                  <Plus className="mx-auto h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Each audience sees only their own notes. Carry forward to job.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NotesField
              label="Customer notes (visible to customer)"
              value={notesCustomer}
              onChange={setNotesCustomer}
            />
            <NotesField
              label="Foreman notes (visible in foreman app)"
              value={notesForeman}
              onChange={setNotesForeman}
            />
            <NotesField
              label="Internal notes (owner/sales/dispatch)"
              value={notesInternal}
              onChange={setNotesInternal}
            />
            <NotesField
              label="Accounting notes (finance/payroll)"
              value={notesAccounting}
              onChange={setNotesAccounting}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-1">
        <Card className="sticky top-20 border-primary/40 shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-primary" />
              Quote summary
            </CardTitle>
            <CardDescription>
              Customer total vs internal commissionable base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Job type" value={jobType} />
            <Row
              label="CuFt billed"
              value={`${fmtCuft(result.cuftTotal)} ft³`}
            />
            <Separator />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Customer pays
              </p>
              <Row
                label="CuFt charge"
                value={fmtUSD(result.customer.cuftCharge)}
              />
              <Row
                label={`Mileage @ $${customerMileageRate}/mi`}
                value={fmtUSD(customerMileageCharge)}
              />
              <Row
                label="Packing"
                value={fmtUSD(result.customer.packingCharge)}
              />
              <Row label="Stairs" value={fmtUSD(result.customer.stairsCharge)} />
              <Row
                label="Handling"
                value={fmtUSD(result.customer.handlingCharge)}
              />
              <Row label="Admin charge" value={fmtUSD(adminCharge)} />
              <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-mono text-2xl font-bold text-primary">
                  {fmtUSD(customerTotal)}
                </span>
              </div>
            </div>

            <Separator />
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Internal commissionable base
              </p>
              <Row
                label="CuFt @ internal"
                value={fmtUSD(result.internal.cuftCharge)}
                muted
              />
              <Row
                label={`Mileage @ $${internalMileageRate}/mi`}
                value={fmtUSD(result.internal.milesCharge)}
                muted
              />
              <Row
                label="Packing @ internal"
                value={fmtUSD(result.internal.packingCharge)}
                muted
              />
              <Row label="Stairs" value={fmtUSD(result.internal.stairsCharge)} muted />
              <Row
                label="Handling"
                value={fmtUSD(result.internal.handlingCharge)}
                muted
              />
              {adminCommissionable && adminCharge > 0 && (
                <Row
                  label="Admin (commissionable)"
                  value={fmtUSD(adminCharge)}
                  muted
                />
              )}
              <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2">
                <span className="text-xs font-semibold">Commissionable</span>
                <span className="font-mono text-sm font-bold">
                  {fmtUSD(commissionableBase)}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                33.5% expected payroll line:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {fmtUSD(commissionableBase * 0.335)}
                </span>
              </p>
            </div>

            {nonCommissionableTotal > 0 && (
              <p className="rounded-lg bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
                Non-commissionable: {fmtUSD(nonCommissionableTotal)} (admin
                charge not counted toward payroll)
              </p>
            )}

            {errors.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/[0.06] p-2 text-xs">
                <p className="font-semibold text-destructive">Cannot save:</p>
                <ul className="ml-4 mt-1 list-disc text-destructive">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                disabled={errors.length > 0}
                onClick={() => handleSave("Draft")}
              >
                Save as draft
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                disabled={errors.length > 0}
                onClick={() => handleSave("Sent")}
              >
                Save & mark sent
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (typeof window !== "undefined" && !window.confirm("Clear this estimate and start a new one?")) return;
                  resetForm();
                }}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset · new estimate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function NotesField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-20 rounded-lg border border-border bg-background p-2 text-xs focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className={cn(muted ? "text-muted-foreground" : "")}>{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
