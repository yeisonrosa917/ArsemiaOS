"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Plus,
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
import {
  calculateQuote,
  fmtCuft,
  fmtUSD,
  type InventoryLine,
} from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

export function QuoteBuilder() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [miles, setMiles] = useState<number>(0);
  const [stairsFlights, setStairsFlights] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState<InventoryLine[]>([]);
  const [handlingPicked, setHandlingPicked] = useState<Record<string, boolean>>(
    {},
  );
  // Collapsed by default — open on click.
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [ltaAmount, setLtaAmount] = useState<number>(0);
  const [fromLeadId, setFromLeadId] = useState<string | null>(null);

  useEffect(() => {
    const c = searchParams.get("customer");
    const p = searchParams.get("phone");
    const fromCity = searchParams.get("fromCity");
    const toCity = searchParams.get("toCity");
    const cuft = searchParams.get("cuft");
    const leadId = searchParams.get("leadId");
    if (c) setCustomer(c);
    if (p) setPhone(p);
    if (fromCity) setPickup(fromCity);
    if (toCity) setDelivery(toCity);
    if (cuft && !Number.isNaN(Number(cuft))) {
      setInventory([
        {
          itemName: `Estimated inventory (${cuft} ft³)`,
          qty: 1,
          cuftEach: Number(cuft),
        },
      ]);
    }
    if (leadId) setFromLeadId(leadId);
  }, [searchParams]);

  const filteredPresets = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PRESET_ITEMS.slice(0, 12);
    return PRESET_ITEMS.filter((it) =>
      it.name.toLowerCase().includes(q),
    ).slice(0, 25);
  }, [search]);

  const addPreset = (name: string, cuft: number) => {
    setInventory((prev) => {
      const idx = prev.findIndex((p) => p.itemName === name);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { itemName: name, qty: 1, cuftEach: cuft }];
    });
    setSearch("");
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

  const result = useMemo(
    () =>
      calculateQuote({
        inventory,
        miles,
        stairsFlights,
        handlingItems: pickedHandling,
      }),
    [inventory, miles, stairsFlights, pickedHandling],
  );

  const totalCuft = useMemo(
    () => inventory.reduce((acc, it) => acc + it.qty * it.cuftEach, 0),
    [inventory],
  );

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
                Adjust inventory and addresses, then save.
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Customer & route</CardTitle>
            <CardDescription>
              Captures the basics before adding inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer">
              <Input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
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
            <Field label="Miles">
              <Input
                type="number"
                min={0}
                value={miles || ""}
                onChange={(e) => setMiles(Number(e.target.value) || 0)}
                placeholder="0"
              />
            </Field>
            <Field label="Stairs (flights)">
              <Input
                type="number"
                min={0}
                value={stairsFlights || ""}
                onChange={(e) =>
                  setStairsFlights(Number(e.target.value) || 0)
                }
                placeholder="0"
              />
            </Field>
            <div className="flex flex-col gap-1 rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Active rates
              </p>
              <p className="text-xs text-muted-foreground">
                Customer ${DEFAULT_RATES.cuftRateCustomer}/CuFt · Internal $
                {DEFAULT_RATES.cuftRateInternal}/CuFt
              </p>
              <p className="text-xs text-muted-foreground">
                Miles ${DEFAULT_RATES.milesShortRate} (≤
                {DEFAULT_RATES.milesThreshold}mi) · $
                {DEFAULT_RATES.milesLongRate} (&gt;
                {DEFAULT_RATES.milesThreshold}mi)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              Pick items from the catalog. Toggle &ldquo;Pack by crew&rdquo; to
              add box packing.
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

            {inventory.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-6 text-center text-xs text-muted-foreground">
                No items added yet. Search above to start building the quote.
              </p>
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
                {fmtCuft(totalCuft)} ft³
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
              Disassembly, cardboard protection, special items, LTA.
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
                                {picked ? <X className="mx-auto h-3.5 w-3.5" /> : <Plus className="mx-auto h-3.5 w-3.5" />}
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
            <Row label="CuFt billed" value={`${fmtCuft(result.cuftTotal)} ft³`} />
            <Separator />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Customer pays
              </p>
              <Row label="CuFt charge" value={fmtUSD(result.customer.cuftCharge)} />
              <Row label="Mileage" value={fmtUSD(result.customer.milesCharge)} />
              <Row label="Packing" value={fmtUSD(result.customer.packingCharge)} />
              <Row label="Stairs" value={fmtUSD(result.customer.stairsCharge)} />
              <Row label="Handling" value={fmtUSD(result.customer.handlingCharge)} />
              <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-mono text-2xl font-bold text-primary">
                  {fmtUSD(result.customer.total)}
                </span>
              </div>
            </div>
            <Separator />
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Internal commissionable base
              </p>
              <Row label="CuFt @ internal" value={fmtUSD(result.internal.cuftCharge)} muted />
              <Row label="Mileage" value={fmtUSD(result.internal.milesCharge)} muted />
              <Row label="Packing @ internal" value={fmtUSD(result.internal.packingCharge)} muted />
              <Row label="Stairs" value={fmtUSD(result.internal.stairsCharge)} muted />
              <Row label="Handling" value={fmtUSD(result.internal.handlingCharge)} muted />
              <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2">
                <span className="text-xs font-semibold">Commissionable</span>
                <span className="font-mono text-sm font-bold">
                  {fmtUSD(result.internal.commissionableBase)}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                33.5% expected payroll line:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {fmtUSD(result.internal.commissionableBase * 0.335)}
                </span>
              </p>
            </div>

            <Button className="w-full" size="lg">
              Save quote
            </Button>
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
