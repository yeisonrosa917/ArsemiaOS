"use client";

import { useState } from "react";
import {
  Boxes,
  Building2,
  Calculator,
  FileText,
  Home,
  Plus,
  RotateCcw,
  Trash2,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useCompanyConfig,
  QUOTE_MODES,
  type CatalogItem,
  type CatalogCategory,
  type QuoteMode,
} from "@/lib/store/company-config";
import { cn, formatCurrency } from "@/lib/utils";

type Tab = "modes" | "pricing" | "catalog" | "rooms" | "templates";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "modes", label: "Quote modes", icon: Calculator },
  { id: "pricing", label: "Pricing", icon: Building2 },
  { id: "catalog", label: "Item catalog", icon: Boxes },
  { id: "rooms", label: "Room templates", icon: Home },
  { id: "templates", label: "Documents", icon: FileText },
];

const CATEGORIES: CatalogCategory[] = [
  "Furniture",
  "Appliance",
  "Box",
  "Fragile",
  "Bulky",
  "Specialty",
  "Other",
];

export function CompanyConfigCard() {
  const [tab, setTab] = useState<Tab>("modes");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Calculator & Pricing
        </CardTitle>
        <CardDescription>
          Configure how your company quotes jobs — modes, rates, catalog, room
          templates and document templates. These are the levers the calculator
          and document pipeline read from.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "modes" && <ModesTab />}
        {tab === "pricing" && <PricingTab />}
        {tab === "catalog" && <CatalogTab />}
        {tab === "rooms" && <RoomsTab />}
        {tab === "templates" && <TemplatesTab />}
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────── Quote modes */

function ModesTab() {
  const enabledModes = useCompanyConfig((s) => s.enabledModes);
  const defaultMode = useCompanyConfig((s) => s.defaultMode);
  const setEnabledModes = useCompanyConfig((s) => s.setEnabledModes);
  const setDefaultMode = useCompanyConfig((s) => s.setDefaultMode);

  const toggle = (id: QuoteMode) => {
    const next = enabledModes.includes(id)
      ? enabledModes.filter((m) => m !== id)
      : [...enabledModes, id];
    setEnabledModes(next);
    if (defaultMode === id && !next.includes(id) && next.length > 0) {
      setDefaultMode(next[0]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Different moving companies quote differently. Turn on the modes your
        sales team uses, and pick a default for new quotes.{" "}
        <span className="font-semibold">
          Storage is intentionally not a quote mode in this phase.
        </span>
      </p>
      <ul className="grid gap-2 md:grid-cols-2">
        {QUOTE_MODES.map((m) => {
          const enabled = enabledModes.includes(m.id);
          const isDefault = defaultMode === m.id;
          return (
            <li
              key={m.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                enabled
                  ? "border-primary/40 bg-primary/[0.04]"
                  : "border-border bg-background",
              )}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggle(m.id)}
                className="mt-0.5 h-4 w-4"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{m.label}</p>
                  {isDefault && (
                    <Badge variant="outline" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {m.description}
                </p>
                {enabled && !isDefault && (
                  <button
                    onClick={() => setDefaultMode(m.id)}
                    className="mt-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    Make default
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── Pricing */

function PricingTab() {
  const pricing = useCompanyConfig((s) => s.pricing);
  const setPricing = useCompanyConfig((s) => s.setPricing);

  return (
    <div className="space-y-5">
      <Section title="Hourly">
        <Money label="Hourly rate" value={pricing.hourlyRate} onChange={(v) => setPricing({ hourlyRate: v })} />
        <Money label="Minimum hours" value={pricing.hourlyMinimumHours} onChange={(v) => setPricing({ hourlyMinimumHours: v })} suffix="hrs" />
      </Section>

      <Section title="CuFt — customer vs internal" warn="Customer-facing and internal/payroll rates must stay separate.">
        <Money label="Customer CuFt rate" value={pricing.customerCuFtRate} onChange={(v) => setPricing({ customerCuFtRate: v })} suffix="/ ft³" />
        <Money label="Internal CuFt rate (payroll)" value={pricing.internalCuFtRate} onChange={(v) => setPricing({ internalCuFtRate: v })} suffix="/ ft³" />
      </Section>

      <Section title="Mileage — customer vs internal" warn="Used by Long Distance jobs and payroll commission math.">
        <Money label="Customer mileage rate" value={pricing.customerMileageRate} onChange={(v) => setPricing({ customerMileageRate: v })} suffix="/ mi" />
        <Money label="Customer mileage tier-2" value={pricing.customerMileageRateTier2} onChange={(v) => setPricing({ customerMileageRateTier2: v })} suffix="/ mi" />
        <Money label="Tier-2 starts at" value={pricing.customerMileageTierStart} onChange={(v) => setPricing({ customerMileageTierStart: v })} suffix="mi" />
        <Money label="Internal mileage rate" value={pricing.internalMileageRate} onChange={(v) => setPricing({ internalMileageRate: v })} suffix="/ mi" />
        <Money label="Internal mileage tier-2" value={pricing.internalMileageRateTier2} onChange={(v) => setPricing({ internalMileageRateTier2: v })} suffix="/ mi" />
        <Money label="Internal tier-2 starts at" value={pricing.internalMileageTierStart} onChange={(v) => setPricing({ internalMileageTierStart: v })} suffix="mi" />
      </Section>

      <Section title="Common fees">
        <Money label="Admin charge" value={pricing.adminCharge} onChange={(v) => setPricing({ adminCharge: v })} />
        <Money label="Stairs (per flight)" value={pricing.stairsFeePerFlight} onChange={(v) => setPricing({ stairsFeePerFlight: v })} />
        <Money label="Long carry" value={pricing.longCarryFee} onChange={(v) => setPricing({ longCarryFee: v })} />
        <Money label="Piano / safe" value={pricing.pianoOrSafeFee} onChange={(v) => setPricing({ pianoOrSafeFee: v })} />
        <Money label="Packing material kit" value={pricing.packingMaterialKit} onChange={(v) => setPricing({ packingMaterialKit: v })} />
        <Money label="Default handling fee" value={pricing.defaultHandlingFee} onChange={(v) => setPricing({ defaultHandlingFee: v })} />
      </Section>

      <Section title="Custom fee presets" hint="Quick-add buttons your sales rep can drop onto a quote.">
        <div className="md:col-span-2">
          {pricing.customFeePresets.length === 0 ? (
            <p className="text-xs text-muted-foreground">No presets configured.</p>
          ) : (
            <ul className="space-y-1.5">
              {pricing.customFeePresets.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="text-xs">
                    <p className="font-semibold">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.commissionable ? "Commissionable" : "Non-commissionable"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold">
                      {formatCurrency(p.amount)}
                    </span>
                    <button
                      onClick={() =>
                        setPricing({
                          customFeePresets: pricing.customFeePresets.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-muted-foreground hover:text-rose-600"
                      title="Remove preset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <PresetForm />
        </div>
      </Section>
    </div>
  );
}

function PresetForm() {
  const setPricing = useCompanyConfig((s) => s.setPricing);
  const pricing = useCompanyConfig((s) => s.pricing);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [commissionable, setCommissionable] = useState(false);

  const add = () => {
    if (!label.trim() || !amount) return;
    setPricing({
      customFeePresets: [
        ...pricing.customFeePresets,
        { label: label.trim(), amount: Number(amount) || 0, commissionable },
      ],
    });
    setLabel("");
    setAmount("");
    setCommissionable(false);
  };

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border bg-muted/10 p-2">
      <div className="flex-1 min-w-[140px]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Label
        </p>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Shuttle truck" className="h-8 text-xs" />
      </div>
      <div className="w-28">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Amount
        </p>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="h-8 text-xs" />
      </div>
      <label className="flex items-center gap-1.5 text-[10px]">
        <input type="checkbox" checked={commissionable} onChange={(e) => setCommissionable(e.target.checked)} />
        Commissionable
      </label>
      <Button size="sm" onClick={add} disabled={!label.trim() || !amount} className="h-8 gap-1">
        <Plus className="h-3 w-3" />
        Add preset
      </Button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── Catalog */

function CatalogTab() {
  const catalog = useCompanyConfig((s) => s.catalog);
  const toggleCatalogItem = useCompanyConfig((s) => s.toggleCatalogItem);
  const removeCatalogItem = useCompanyConfig((s) => s.removeCatalogItem);
  const upsertCatalogItem = useCompanyConfig((s) => s.upsertCatalogItem);

  const [editing, setEditing] = useState<CatalogItem | null>(null);

  const blank = (): CatalogItem => ({
    id: `item_${Math.random().toString(36).slice(2, 8)}`,
    companyId: "arsemia",
    name: "",
    category: "Furniture",
    aliases: [],
    defaultCuFt: 10,
    active: true,
    fragile: false,
    bulky: false,
    requiresPacking: false,
    specialHandlingEligible: false,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {catalog.length} items · {catalog.filter((c) => c.active).length} active.
          The quote builder reads from this list.
        </p>
        <Button size="sm" onClick={() => setEditing(blank())} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add item
        </Button>
      </div>

      {editing && (
        <ItemEditor
          item={editing}
          onCancel={() => setEditing(null)}
          onSave={(item) => {
            upsertCatalogItem(item);
            setEditing(null);
          }}
        />
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((c) => (
          <div
            key={c.id}
            className={cn(
              "rounded-xl border p-3 text-xs",
              c.active ? "border-border bg-background" : "border-border bg-muted/30 opacity-60",
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold leading-tight">{c.name}</p>
              <Badge variant="outline" className="text-[10px]">
                {c.category}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {c.defaultCuFt} ft³
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] font-semibold uppercase tracking-wider">
              {c.fragile && <span className="rounded bg-rose-500/15 px-1 py-0.5 text-rose-600">Fragile</span>}
              {c.bulky && <span className="rounded bg-amber-500/15 px-1 py-0.5 text-amber-700">Bulky</span>}
              {c.requiresPacking && <span className="rounded bg-blue-500/15 px-1 py-0.5 text-blue-600">Packing</span>}
              {c.specialHandlingEligible && <span className="rounded bg-violet-500/15 px-1 py-0.5 text-violet-600">Special</span>}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <button
                onClick={() => setEditing(c)}
                className="font-semibold text-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => toggleCatalogItem(c.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                {c.active ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${c.name}?`)) removeCatalogItem(c.id);
                }}
                className="text-muted-foreground hover:text-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemEditor({
  item,
  onSave,
  onCancel,
}: {
  item: CatalogItem;
  onSave: (item: CatalogItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CatalogItem>(item);

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <Labeled label="Name">
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Labeled>
        <Labeled label="Category">
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as CatalogCategory })}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Default CuFt">
          <Input
            type="number"
            value={draft.defaultCuFt}
            onChange={(e) => setDraft({ ...draft, defaultCuFt: Number(e.target.value) || 0 })}
          />
        </Labeled>
        <Labeled label="Aliases (comma)">
          <Input
            value={draft.aliases.join(", ")}
            onChange={(e) =>
              setDraft({
                ...draft,
                aliases: e.target.value.split(",").map((a) => a.trim()).filter(Boolean),
              })
            }
          />
        </Labeled>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <Check label="Fragile" checked={draft.fragile} onChange={(v) => setDraft({ ...draft, fragile: v })} />
        <Check label="Bulky" checked={draft.bulky} onChange={(v) => setDraft({ ...draft, bulky: v })} />
        <Check label="Requires packing" checked={draft.requiresPacking} onChange={(v) => setDraft({ ...draft, requiresPacking: v })} />
        <Check label="Special handling eligible" checked={draft.specialHandlingEligible} onChange={(v) => setDraft({ ...draft, specialHandlingEligible: v })} />
        <Check label="Active" checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(draft)} disabled={!draft.name.trim()}>
          Save item
        </Button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── Rooms */

function RoomsTab() {
  const rooms = useCompanyConfig((s) => s.rooms);
  const upsertRoomTemplate = useCompanyConfig((s) => s.upsertRoomTemplate);
  const catalog = useCompanyConfig((s) => s.catalog);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Room templates power the room-based quote mode. Each template carries a
        CuFt range and a list of suggested catalog items.
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        {rooms.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-background p-3 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{r.label}</p>
              <Badge variant="outline" className="font-mono text-[10px]">
                {r.cuFtMin}–{r.cuFtMax} ft³
              </Badge>
            </div>
            <div className="mt-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested items ({r.suggestedItems.length}) · {r.suggestedBoxes} boxes
              </p>
              <p className="mt-0.5 text-[11px]">
                {r.suggestedItems
                  .slice(0, 6)
                  .map((id) => catalog.find((c) => c.id === id)?.name ?? id)
                  .join(", ")}
                {r.suggestedItems.length > 6 ? " …" : ""}
              </p>
            </div>
            {r.packingNotes && (
              <p className="mt-1.5 text-[10px] italic text-muted-foreground">
                {r.packingNotes}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              <RoomEditor template={r} onSave={upsertRoomTemplate} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomEditor({
  template,
  onSave,
}: {
  template: ReturnType<typeof useCompanyConfig.getState>["rooms"][number];
  onSave: (room: ReturnType<typeof useCompanyConfig.getState>["rooms"][number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(template);

  if (!open) {
    return (
      <button
        onClick={() => {
          setDraft(template);
          setOpen(true);
        }}
        className="font-semibold text-primary hover:underline"
      >
        Edit range / boxes / notes
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-md border border-primary/30 bg-background p-2 text-xs">
      <div className="grid grid-cols-3 gap-2">
        <Labeled label="CuFt min">
          <Input
            type="number"
            value={draft.cuFtMin}
            onChange={(e) => setDraft({ ...draft, cuFtMin: Number(e.target.value) || 0 })}
            className="h-8"
          />
        </Labeled>
        <Labeled label="CuFt max">
          <Input
            type="number"
            value={draft.cuFtMax}
            onChange={(e) => setDraft({ ...draft, cuFtMax: Number(e.target.value) || 0 })}
            className="h-8"
          />
        </Labeled>
        <Labeled label="Boxes">
          <Input
            type="number"
            value={draft.suggestedBoxes}
            onChange={(e) => setDraft({ ...draft, suggestedBoxes: Number(e.target.value) || 0 })}
            className="h-8"
          />
        </Labeled>
      </div>
      <Labeled label="Packing notes">
        <Input
          value={draft.packingNotes ?? ""}
          onChange={(e) => setDraft({ ...draft, packingNotes: e.target.value })}
          className="h-8"
        />
      </Labeled>
      <div className="mt-2 flex justify-end gap-1">
        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-7 text-[10px]"
          onClick={() => {
            onSave(draft);
            setOpen(false);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── Document templates */

function TemplatesTab() {
  const templates = useCompanyConfig((s) => s.documentTemplates);
  const upsert = useCompanyConfig((s) => s.upsertDocumentTemplate);
  const toggle = useCompanyConfig((s) => s.toggleDocumentTemplate);

  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = templates.find((t) => t.id === editingId) ?? null;

  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2 text-xs text-amber-700">
        Templates only. Review with legal counsel before sending to customers.
      </p>

      <div className="grid gap-2 md:grid-cols-2">
        {templates.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-xs",
              t.active ? "border-border bg-background" : "border-border bg-muted/30 opacity-60",
            )}
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{t.title}</p>
                <Badge variant="outline" className="text-[10px]">
                  v{t.version}
                </Badge>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.type.replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {t.requiredSignatures.length > 0
                  ? `Signed by ${t.requiredSignatures.join(" + ")}`
                  : "No signature required"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                <button
                  onClick={() => setEditingId(t.id)}
                  className="font-semibold text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggle(t.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t.active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <TemplateEditor
          template={editing}
          onCancel={() => setEditingId(null)}
          onSave={(patch) => {
            upsert({ ...editing, ...patch });
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: ReturnType<typeof useCompanyConfig.getState>["documentTemplates"][number];
  onSave: (patch: Partial<typeof template>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(template.title);
  const [content, setContent] = useState(template.content);
  const reset = useCompanyConfig((s) => s.resetToDefaults);

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Editing {template.type.replace(/_/g, " ")}
      </p>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={14}
        className="mt-2 w-full rounded-md border border-border bg-background p-2 font-mono text-[11px]"
      />
      <p className="mt-1 text-[10px] text-muted-foreground">
        Placeholders supported: <code>{`{{company}}`}</code>,{" "}
        <code>{`{{customer}}`}</code>, <code>{`{{jobId}}`}</code>,{" "}
        <code>{`{{foreman}}`}</code>, <code>{`{{date}}`}</code>,{" "}
        <code>{`{{timestamp}}`}</code>.
      </p>
      <div className="mt-3 flex justify-between gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm("Restore ALL config (modes/pricing/catalog/rooms/templates) to defaults?")) {
              reset();
              onCancel();
            }
          }}
          className="gap-1 text-[11px]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset all to defaults
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave({ title, content })}>
            Save template (v{template.version + 1})
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── shared */

function Section({
  title,
  children,
  warn,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  warn?: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {warn && (
        <p className="mt-1 rounded-md border border-amber-500/30 bg-amber-500/[0.06] p-1.5 text-[10px] text-amber-700">
          {warn}
        </p>
      )}
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
      <div className="mt-2 grid gap-2 md:grid-cols-2">{children}</div>
      <Separator className="mt-4" />
    </div>
  );
}

function Money({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {suffix && <span className="text-muted-foreground/70">({suffix})</span>}
      </p>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 h-9 text-sm"
      />
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}
