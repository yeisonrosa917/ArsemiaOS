"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ─────────────────────────────────────────────────────────────
 * Quote modes — which costing model a company uses for a job.
 * Storage is intentionally NOT in this list. Out of scope.
 * ────────────────────────────────────────────────────────── */
export type QuoteMode =
  | "itemized"
  | "cuft_only"
  | "room_based"
  | "hourly"
  | "flat_rate"
  | "long_distance"
  | "pickup"
  | "delivery"
  | "other";

export const QUOTE_MODES: { id: QuoteMode; label: string; description: string }[] = [
  { id: "itemized", label: "Itemized Inventory", description: "Customer-listed items each with CuFt + handling." },
  { id: "cuft_only", label: "Estimated CuFt Only", description: "Single CuFt estimate, no item-level detail." },
  { id: "room_based", label: "Room-Based Estimate", description: "Bedroom/office templates expand into CuFt + suggested items." },
  { id: "hourly", label: "Hourly", description: "Crew-hours × rate. Minimum applies." },
  { id: "flat_rate", label: "Flat Rate", description: "Single fixed price negotiated up front." },
  { id: "long_distance", label: "Long Distance", description: "CuFt + tiered mileage." },
  { id: "pickup", label: "Pick Up", description: "One-leg pickup-only job." },
  { id: "delivery", label: "Delivery", description: "One-leg delivery-only job." },
  { id: "other", label: "Other / Custom", description: "Custom quote — sales rep notes the model used." },
];

/* ─────────────────────────────────────────────────────────────
 * Item catalog — replaces hardcoded inventory items.
 * Companies can disable/add/edit items without touching code.
 * ────────────────────────────────────────────────────────── */
export type CatalogCategory =
  | "Furniture"
  | "Appliance"
  | "Box"
  | "Fragile"
  | "Bulky"
  | "Specialty"
  | "Other";

export interface CatalogItem {
  id: string;
  companyId: string;
  name: string;
  category: CatalogCategory;
  aliases: string[];
  defaultCuFt: number;
  minCuFt?: number;
  maxCuFt?: number;
  active: boolean;
  fragile: boolean;
  bulky: boolean;
  requiresPacking: boolean;
  specialHandlingEligible: boolean;
  notes?: string;
}

/* ─────────────────────────────────────────────────────────────
 * Room templates — for the room-based quote mode.
 * ────────────────────────────────────────────────────────── */
export type RoomTemplateId =
  | "studio"
  | "1br"
  | "2br"
  | "3br"
  | "4br"
  | "5br_plus"
  | "office"
  | "commercial";

export interface RoomTemplate {
  id: RoomTemplateId;
  label: string;
  cuFtMin: number;
  cuFtMax: number;
  suggestedItems: string[]; // catalog item ids
  suggestedBoxes: number;
  packingNotes?: string;
}

/* ─────────────────────────────────────────────────────────────
 * Pricing — customer-facing vs internal/payroll, kept separate.
 * ────────────────────────────────────────────────────────── */
export interface CompanyPricing {
  /** Hourly */
  hourlyRate: number;
  hourlyMinimumHours: number;
  /** CuFt */
  customerCuFtRate: number; // what the customer sees
  internalCuFtRate: number; // payroll/commission base
  /** Mileage */
  customerMileageRate: number;
  customerMileageTierStart: number; // miles before tier-2 rate applies
  customerMileageRateTier2: number;
  internalMileageRate: number;
  internalMileageRateTier2: number;
  internalMileageTierStart: number;
  /** Common fees */
  adminCharge: number;
  stairsFeePerFlight: number;
  longCarryFee: number;
  pianoOrSafeFee: number;
  packingMaterialKit: number; // standard kit
  defaultHandlingFee: number;
  /** Custom presets — quick-add by sales rep */
  customFeePresets: { label: string; amount: number; commissionable: boolean }[];
}

export interface DocumentTemplateMeta {
  id: string;
  companyId: string;
  type:
    | "pre_move_guide"
    | "quote_terms"
    | "bol"
    | "start_job_agreement"
    | "inventory_acknowledgment"
    | "delivery_completion"
    | "claim_release"
    | "final_invoice_receipt";
  title: string;
  content: string;
  version: number;
  active: boolean;
  requiredSignatures: ("customer" | "foreman")[];
  linkedJobTypes: string[];
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────────────────────
 * Seeds — Arsemia's current configuration. Used as factory defaults.
 * ────────────────────────────────────────────────────────── */
const COMPANY_ID = "arsemia";

const DEFAULT_PRICING: CompanyPricing = {
  hourlyRate: 145,
  hourlyMinimumHours: 3,
  customerCuFtRate: 3.0,
  internalCuFtRate: 1.25,
  customerMileageRate: 7,
  customerMileageTierStart: 300,
  customerMileageRateTier2: 8,
  internalMileageRate: 3,
  internalMileageRateTier2: 4,
  internalMileageTierStart: 300,
  adminCharge: 150,
  stairsFeePerFlight: 35,
  longCarryFee: 50,
  pianoOrSafeFee: 200,
  packingMaterialKit: 120,
  defaultHandlingFee: 75,
  customFeePresets: [
    { label: "Shuttle truck", amount: 250, commissionable: false },
    { label: "Reschedule fee", amount: 75, commissionable: false },
    { label: "Wall mirror handling", amount: 25, commissionable: true },
  ],
};

const DEFAULT_CATALOG: CatalogItem[] = [
  { id: "sofa_3", companyId: COMPANY_ID, name: "Sofa (3-seat)", category: "Furniture", aliases: ["couch", "loveseat large"], defaultCuFt: 35, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "sofa_sec", companyId: COMPANY_ID, name: "Sectional Sofa", category: "Furniture", aliases: ["sectional"], defaultCuFt: 75, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: true },
  { id: "bed_q", companyId: COMPANY_ID, name: "Queen Bed (frame + mattress)", category: "Furniture", aliases: ["queen mattress", "queen bed"], defaultCuFt: 45, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "bed_k", companyId: COMPANY_ID, name: "King Bed (frame + mattress)", category: "Furniture", aliases: ["king mattress"], defaultCuFt: 60, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "dresser", companyId: COMPANY_ID, name: "Dresser", category: "Furniture", aliases: ["chest"], defaultCuFt: 30, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "dining_t", companyId: COMPANY_ID, name: "Dining Table", category: "Furniture", aliases: [], defaultCuFt: 25, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "dining_c", companyId: COMPANY_ID, name: "Dining Chair", category: "Furniture", aliases: [], defaultCuFt: 8, active: true, fragile: false, bulky: false, requiresPacking: false, specialHandlingEligible: false },
  { id: "fridge", companyId: COMPANY_ID, name: "Refrigerator", category: "Appliance", aliases: ["fridge"], defaultCuFt: 35, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: true },
  { id: "washer", companyId: COMPANY_ID, name: "Washer", category: "Appliance", aliases: [], defaultCuFt: 18, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "dryer", companyId: COMPANY_ID, name: "Dryer", category: "Appliance", aliases: [], defaultCuFt: 18, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: false },
  { id: "tv_55", companyId: COMPANY_ID, name: "TV 55–65\"", category: "Fragile", aliases: ["flatscreen"], defaultCuFt: 12, active: true, fragile: true, bulky: false, requiresPacking: true, specialHandlingEligible: true },
  { id: "mirror", companyId: COMPANY_ID, name: "Wall mirror / Art", category: "Fragile", aliases: ["picture frame"], defaultCuFt: 8, active: true, fragile: true, bulky: false, requiresPacking: true, specialHandlingEligible: true },
  { id: "piano_u", companyId: COMPANY_ID, name: "Piano (upright)", category: "Specialty", aliases: [], defaultCuFt: 70, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: true },
  { id: "safe", companyId: COMPANY_ID, name: "Safe (heavy)", category: "Specialty", aliases: [], defaultCuFt: 25, active: true, fragile: false, bulky: true, requiresPacking: false, specialHandlingEligible: true },
  { id: "box_s", companyId: COMPANY_ID, name: "Small box (1.5 ft³)", category: "Box", aliases: ["small carton"], defaultCuFt: 1.5, active: true, fragile: false, bulky: false, requiresPacking: false, specialHandlingEligible: false },
  { id: "box_m", companyId: COMPANY_ID, name: "Medium box (3 ft³)", category: "Box", aliases: ["medium carton"], defaultCuFt: 3, active: true, fragile: false, bulky: false, requiresPacking: false, specialHandlingEligible: false },
  { id: "box_l", companyId: COMPANY_ID, name: "Large box (4.5 ft³)", category: "Box", aliases: [], defaultCuFt: 4.5, active: true, fragile: false, bulky: false, requiresPacking: false, specialHandlingEligible: false },
  { id: "wardrobe_box", companyId: COMPANY_ID, name: "Wardrobe box", category: "Box", aliases: [], defaultCuFt: 12, active: true, fragile: false, bulky: false, requiresPacking: false, specialHandlingEligible: false },
];

const DEFAULT_ROOMS: RoomTemplate[] = [
  { id: "studio", label: "Studio", cuFtMin: 200, cuFtMax: 350, suggestedItems: ["sofa_3", "bed_q", "tv_55", "dresser", "box_m", "box_l"], suggestedBoxes: 15 },
  { id: "1br", label: "1 Bedroom", cuFtMin: 350, cuFtMax: 550, suggestedItems: ["sofa_3", "bed_q", "tv_55", "dresser", "dining_t", "dining_c", "box_m", "box_l"], suggestedBoxes: 25 },
  { id: "2br", label: "2 Bedrooms", cuFtMin: 550, cuFtMax: 850, suggestedItems: ["sofa_sec", "bed_q", "bed_q", "tv_55", "dresser", "dining_t", "fridge", "box_m", "box_l", "wardrobe_box"], suggestedBoxes: 40 },
  { id: "3br", label: "3 Bedrooms", cuFtMin: 850, cuFtMax: 1200, suggestedItems: ["sofa_sec", "bed_k", "bed_q", "bed_q", "tv_55", "dresser", "dresser", "dining_t", "fridge", "washer", "dryer", "box_l", "wardrobe_box"], suggestedBoxes: 60 },
  { id: "4br", label: "4 Bedrooms", cuFtMin: 1200, cuFtMax: 1700, suggestedItems: ["sofa_sec", "bed_k", "bed_q", "bed_q", "bed_q", "tv_55", "fridge", "washer", "dryer", "wardrobe_box"], suggestedBoxes: 85 },
  { id: "5br_plus", label: "5+ Bedrooms", cuFtMin: 1700, cuFtMax: 2400, suggestedItems: ["sofa_sec", "bed_k", "bed_q", "bed_q", "bed_q", "bed_q", "fridge", "washer", "dryer", "piano_u"], suggestedBoxes: 120 },
  { id: "office", label: "Office", cuFtMin: 300, cuFtMax: 800, suggestedItems: ["dining_t", "dining_c", "box_m", "box_l"], suggestedBoxes: 30, packingNotes: "Bring extra wardrobe boxes for filing." },
  { id: "commercial", label: "Commercial", cuFtMin: 800, cuFtMax: 3000, suggestedItems: ["dining_t", "dining_c", "box_l", "wardrobe_box", "safe"], suggestedBoxes: 100, packingNotes: "Coordinate with building management for elevator hold." },
];

const TEMPLATE_PRE_MOVE = `WELCOME TO YOUR MOVE WITH {{company}}

Please prepare your home so our crew can move quickly and safely:

- Empty drawers and cabinets if requested by your contract.
- Pack and clearly label fragile items, or request our packing service.
- Declare high-value items (jewelry, art, electronics) on the inventory list.
- TVs, mirrors and art are handled per company policy.
- Confirm parking, loading dock and elevator availability with your building.
- COI (Certificate of Insurance) must be on file before move day if your building requires it.
- Customer-packed boxes (CPB) travel at customer's risk per liability policy.
- Additional items not declared on the quote may change the final price.
- For claims, photo evidence at pickup and delivery speeds resolution.

This is a TEMPLATE for company review. Replace before production use.`;

const TEMPLATE_BOL = `BILL OF LADING — {{company}}

Shipper: {{customer}}
Pickup: {{pickup}}
Delivery: {{delivery}}
Date: {{date}}
Foreman: {{foreman}}

Acknowledgment of goods received in apparent good order, subject to inventory
and condition exceptions noted below.

Signatures:
- Customer: ___________________________
- Foreman: ___________________________

TEMPLATE ONLY — review with legal counsel before production.`;

const TEMPLATE_START_AGREEMENT = `JOB START AGREEMENT — {{company}}

Job: {{jobId}}
Customer: {{customer}}
Foreman: {{foreman}}
Start time: {{timestamp}}

By signing below, customer and foreman acknowledge:
- Inventory list has been reviewed.
- Pickup address has been confirmed.
- Terms of service have been read.
- Any pre-existing damage has been documented.

Customer signature: ___________________________
Foreman signature:  ___________________________

TEMPLATE ONLY — review before production use.`;

const TEMPLATE_DELIVERY = `DELIVERY COMPLETION — {{company}}

Job: {{jobId}}
Customer: {{customer}}
Foreman: {{foreman}}
Delivery time: {{timestamp}}

By signing below, customer acknowledges:
- All declared items have been delivered.
- Final balance and charges have been reviewed.
- Any damage has been noted on the inventory and photographed.

Customer signature: ___________________________
Foreman signature:  ___________________________

TEMPLATE ONLY — review before production use.`;

const TEMPLATE_QUOTE_TERMS = `QUOTE TERMS — {{company}}

This estimate is valid for {{validDays}} days. Final price may change based on
final inventory, accessibility, and additional services requested on move day.

TEMPLATE ONLY — replace with company terms before sending to customers.`;

const TEMPLATE_INVENTORY_ACK = `INVENTORY ACKNOWLEDGMENT — {{company}}

Customer acknowledges the inventory list below as accurate at time of pickup.

TEMPLATE ONLY — review with legal counsel.`;

const TEMPLATE_CLAIM_RELEASE = [
  "CLAIM RELEASE — {{company}}",
  "",
  "In consideration of payment of {{amount}} for claim {{claimId}}, customer",
  "releases {{company}} from further liability for the items listed.",
  "",
  "TEMPLATE ONLY — review with legal counsel before use.",
].join("\n");

const TEMPLATE_FINAL_RECEIPT = [
  "RECEIPT — {{company}}",
  "",
  "Job: {{jobId}}",
  "Customer: {{customer}}",
  "Date: {{date}}",
  "",
  "Total: {{total}}",
  "Paid: {{paid}}",
  "Balance: {{balance}}",
  "",
  "Thank you for your business.",
].join("\n");

const now = () => new Date().toISOString();

const DEFAULT_TEMPLATES: DocumentTemplateMeta[] = [
  { id: "tpl_premove", companyId: COMPANY_ID, type: "pre_move_guide", title: "Pre-Move Customer Guide", content: TEMPLATE_PRE_MOVE, version: 1, active: true, requiredSignatures: [], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_quote_terms", companyId: COMPANY_ID, type: "quote_terms", title: "Quote Terms", content: TEMPLATE_QUOTE_TERMS, version: 1, active: true, requiredSignatures: ["customer"], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_bol", companyId: COMPANY_ID, type: "bol", title: "Bill of Lading", content: TEMPLATE_BOL, version: 1, active: true, requiredSignatures: ["customer", "foreman"], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_start", companyId: COMPANY_ID, type: "start_job_agreement", title: "Start Job Agreement", content: TEMPLATE_START_AGREEMENT, version: 1, active: true, requiredSignatures: ["customer", "foreman"], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_inv_ack", companyId: COMPANY_ID, type: "inventory_acknowledgment", title: "Inventory Acknowledgment", content: TEMPLATE_INVENTORY_ACK, version: 1, active: true, requiredSignatures: ["customer"], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_delivery", companyId: COMPANY_ID, type: "delivery_completion", title: "Delivery Completion", content: TEMPLATE_DELIVERY, version: 1, active: true, requiredSignatures: ["customer", "foreman"], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_claim", companyId: COMPANY_ID, type: "claim_release", title: "Claim Release", content: TEMPLATE_CLAIM_RELEASE, version: 1, active: true, requiredSignatures: ["customer"], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
  { id: "tpl_receipt", companyId: COMPANY_ID, type: "final_invoice_receipt", title: "Final Receipt", content: TEMPLATE_FINAL_RECEIPT, version: 1, active: true, requiredSignatures: [], linkedJobTypes: [], createdAt: now(), updatedAt: now() },
];

/* ─────────────────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────────────── */
interface CompanyConfigState {
  companyId: string;
  enabledModes: QuoteMode[];
  defaultMode: QuoteMode;
  pricing: CompanyPricing;
  catalog: CatalogItem[];
  rooms: RoomTemplate[];
  documentTemplates: DocumentTemplateMeta[];

  setEnabledModes: (modes: QuoteMode[]) => void;
  setDefaultMode: (mode: QuoteMode) => void;
  setPricing: (patch: Partial<CompanyPricing>) => void;

  upsertCatalogItem: (item: CatalogItem) => void;
  toggleCatalogItem: (id: string) => void;
  removeCatalogItem: (id: string) => void;

  upsertRoomTemplate: (room: RoomTemplate) => void;

  upsertDocumentTemplate: (
    tpl: Omit<DocumentTemplateMeta, "createdAt" | "updatedAt" | "version"> & {
      version?: number;
    },
  ) => void;
  toggleDocumentTemplate: (id: string) => void;

  resetToDefaults: () => void;
}

export const useCompanyConfig = create<CompanyConfigState>()(
  persist(
    (set) => ({
      companyId: COMPANY_ID,
      enabledModes: ["itemized", "cuft_only", "room_based", "hourly", "flat_rate", "long_distance", "pickup", "delivery"],
      defaultMode: "itemized",
      pricing: DEFAULT_PRICING,
      catalog: DEFAULT_CATALOG,
      rooms: DEFAULT_ROOMS,
      documentTemplates: DEFAULT_TEMPLATES,

      setEnabledModes: (enabledModes) => set({ enabledModes }),
      setDefaultMode: (defaultMode) => set({ defaultMode }),
      setPricing: (patch) =>
        set((s) => ({ pricing: { ...s.pricing, ...patch } })),

      upsertCatalogItem: (item) =>
        set((s) => ({
          catalog: s.catalog.some((c) => c.id === item.id)
            ? s.catalog.map((c) => (c.id === item.id ? item : c))
            : [...s.catalog, item],
        })),
      toggleCatalogItem: (id) =>
        set((s) => ({
          catalog: s.catalog.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c,
          ),
        })),
      removeCatalogItem: (id) =>
        set((s) => ({ catalog: s.catalog.filter((c) => c.id !== id) })),

      upsertRoomTemplate: (room) =>
        set((s) => ({
          rooms: s.rooms.some((r) => r.id === room.id)
            ? s.rooms.map((r) => (r.id === room.id ? room : r))
            : [...s.rooms, room],
        })),

      upsertDocumentTemplate: (tpl) =>
        set((s) => {
          const existing = s.documentTemplates.find((t) => t.id === tpl.id);
          const stamped: DocumentTemplateMeta = existing
            ? {
                ...existing,
                ...tpl,
                version: tpl.version ?? existing.version + 1,
                updatedAt: now(),
              }
            : {
                ...tpl,
                version: tpl.version ?? 1,
                createdAt: now(),
                updatedAt: now(),
              };
          return {
            documentTemplates: existing
              ? s.documentTemplates.map((t) => (t.id === tpl.id ? stamped : t))
              : [...s.documentTemplates, stamped],
          };
        }),
      toggleDocumentTemplate: (id) =>
        set((s) => ({
          documentTemplates: s.documentTemplates.map((t) =>
            t.id === id ? { ...t, active: !t.active, updatedAt: now() } : t,
          ),
        })),

      resetToDefaults: () =>
        set({
          enabledModes: ["itemized", "cuft_only", "room_based", "hourly", "flat_rate", "long_distance", "pickup", "delivery"],
          defaultMode: "itemized",
          pricing: DEFAULT_PRICING,
          catalog: DEFAULT_CATALOG,
          rooms: DEFAULT_ROOMS,
          documentTemplates: DEFAULT_TEMPLATES,
        }),
    }),
    {
      name: "arsemia.company-config.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
