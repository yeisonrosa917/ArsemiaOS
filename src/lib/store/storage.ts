"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createId } from "@/lib/id";

/**
 * Storage module.
 *
 * Arsemia stores customer goods in a mix of THIRD-PARTY facilities
 * (CubeSmart, Public Storage, Extra Space) and its own IN-HOUSE warehouse
 * bays. A "unit" is one rented space that belongs to a customer (or is shared
 * between several). Every physical item inside a unit carries a scannable tag
 * and moves through an 8-stage chain of custody from the customer's origin to
 * the storage floor and back out to the delivery address.
 *
 * NOTE: this is the read + operate foundation. Billing sync, a dedicated
 * mobile scan screen, and automatic claim linking are follow-ups.
 */

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

export type StorageProviderKind = "third_party" | "in_house";

export interface StorageProvider {
  id: string;
  name: string;
  kind: StorageProviderKind;
  /** Facility / branch label, e.g. "CubeSmart – Doral". */
  facility: string;
  address: string;
  city: string;
  phone: string;
  accessHours: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Units (storage accounts)                                            */
/* ------------------------------------------------------------------ */

export type StorageUnitStatus = "Active" | "Vacant" | "Overdue" | "Closed";

export const STORAGE_UNIT_STATUSES: StorageUnitStatus[] = [
  "Active",
  "Vacant",
  "Overdue",
  "Closed",
];

export const STORAGE_UNIT_STATUS_STYLE: Record<StorageUnitStatus, string> = {
  Active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  Vacant: "border-border bg-muted text-muted-foreground",
  Overdue: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  Closed: "border-border bg-muted text-muted-foreground",
};

export interface StorageUnit {
  id: string;
  providerId: string;
  unitNumber: string;
  /** e.g. "10x10", "5x10", "Bay A". */
  size: string;
  climateControlled?: boolean;
  monthlyCost: number;
  status: StorageUnitStatus;
  /** Multiple customers/jobs share this unit. */
  shared: boolean;
  primaryCustomerId?: string;
  primaryCustomerName?: string;
  jobId?: string;
  startedAt: string;
  /** Paid-through date; if in the past the unit reads Overdue. */
  paidThrough?: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Chain of custody — 8 scan stages, in order                          */
/* ------------------------------------------------------------------ */

export type ScanStage =
  | "Registered"
  | "Picked Up"
  | "In Transit → Storage"
  | "Received at Storage"
  | "In Storage"
  | "Pulled for Delivery"
  | "Out for Delivery"
  | "Delivered";

export const SCAN_STAGES: ScanStage[] = [
  "Registered",
  "Picked Up",
  "In Transit → Storage",
  "Received at Storage",
  "In Storage",
  "Pulled for Delivery",
  "Out for Delivery",
  "Delivered",
];

export function scanStageIndex(stage: ScanStage): number {
  return SCAN_STAGES.indexOf(stage);
}

export function nextScanStage(stage: ScanStage): ScanStage | undefined {
  const i = scanStageIndex(stage);
  return i >= 0 && i < SCAN_STAGES.length - 1 ? SCAN_STAGES[i + 1] : undefined;
}

export const SCAN_STAGE_STYLE: Record<ScanStage, string> = {
  Registered: "border-slate-500/40 bg-slate-500/10 text-slate-600",
  "Picked Up": "border-sky-500/40 bg-sky-500/10 text-sky-600",
  "In Transit → Storage": "border-amber-500/40 bg-amber-500/10 text-amber-600",
  "Received at Storage": "border-indigo-500/40 bg-indigo-500/10 text-indigo-600",
  "In Storage": "border-violet-500/40 bg-violet-500/10 text-violet-600",
  "Pulled for Delivery": "border-amber-500/40 bg-amber-500/10 text-amber-600",
  "Out for Delivery": "border-sky-500/40 bg-sky-500/10 text-sky-600",
  Delivered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
};

/* ------------------------------------------------------------------ */
/* Items (inventory)                                                   */
/* ------------------------------------------------------------------ */

export type ItemCondition = "Good" | "Minor Wear" | "Damaged" | "Missing";

export const ITEM_CONDITIONS: ItemCondition[] = [
  "Good",
  "Minor Wear",
  "Damaged",
  "Missing",
];

export const ITEM_CONDITION_STYLE: Record<ItemCondition, string> = {
  Good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  "Minor Wear": "border-amber-500/40 bg-amber-500/10 text-amber-600",
  Damaged: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  Missing: "border-rose-600/50 bg-rose-600/15 text-rose-700",
};

export interface ScanEvent {
  id: string;
  stage: ScanStage;
  at: string;
  /** Who scanned — foreman or storage staff. */
  by: string;
  location?: string;
  note?: string;
}

export interface StorageItem {
  id: string;
  /** Scannable tag, e.g. "ARS-88213". */
  tag: string;
  unitId: string;
  name: string;
  category: string;
  quantity: number;
  condition: ItemCondition;
  /** For SHARED units — which customer owns this item. */
  ownerCustomerId?: string;
  ownerName?: string;
  jobId?: string;
  /** Origin room. */
  room?: string;
  /** Grouping label used to sort items by where they go on the way out. */
  destinationGroup?: string;
  stage: ScanStage;
  scanHistory: ScanEvent[];
  photos?: number;
  notes?: string;
  /** Linked claim (raised when the item is damaged/missing). */
  claimId?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function isItemFlagged(i: StorageItem): boolean {
  return i.condition === "Damaged" || i.condition === "Missing";
}

let scanSeq = 0;
function mkScanId(): string {
  scanSeq += 1;
  return `SCN-${scanSeq.toString().padStart(5, "0")}`;
}

/**
 * Build a plausible scan history from an item's current stage so no item shows
 * up with an empty chain of custody. Each stage before the current one gets a
 * timestamped scan, spaced a few hours apart working backwards.
 */
function buildScanHistory(item: {
  stage: ScanStage;
  ownerName?: string;
  jobId?: string;
}): ScanEvent[] {
  const upto = scanStageIndex(item.stage);
  if (upto < 0) return [];
  const scanners = ["Marcus Reyes", "Andres Molina", "Storage Desk", "Luis Mendoza"];
  const base = new Date("2026-06-10T09:00:00Z").getTime();
  const events: ScanEvent[] = [];
  for (let i = 0; i <= upto; i++) {
    const at = new Date(base + i * 26 * 3600 * 1000).toISOString();
    events.push({
      id: mkScanId(),
      stage: SCAN_STAGES[i],
      at,
      by: scanners[i % scanners.length],
      location: i <= 1 ? "Customer origin" : i >= 6 ? "Delivery address" : "Storage floor",
    });
  }
  return events;
}

function hydrateItem(i: Omit<StorageItem, "scanHistory"> & { scanHistory?: ScanEvent[] }): StorageItem {
  return {
    ...i,
    scanHistory: i.scanHistory && i.scanHistory.length ? i.scanHistory : buildScanHistory(i),
  };
}

/* ------------------------------------------------------------------ */
/* Seed data (Miami / Florida)                                         */
/* ------------------------------------------------------------------ */

const SEED_PROVIDERS: StorageProvider[] = [
  {
    id: "PRV-1",
    name: "CubeSmart",
    kind: "third_party",
    facility: "CubeSmart – Doral",
    address: "2100 NW 84th Ave",
    city: "Doral, FL 33122",
    phone: "(305) 555-2210",
    accessHours: "6:00 AM – 10:00 PM daily",
    notes: "Gate code on file. Elevator access to 2nd floor units.",
  },
  {
    id: "PRV-2",
    name: "Public Storage",
    kind: "third_party",
    facility: "Public Storage – Miami Gardens",
    address: "18400 NW 2nd Ave",
    city: "Miami Gardens, FL 33169",
    phone: "(305) 555-7788",
    accessHours: "6:00 AM – 9:00 PM daily",
  },
  {
    id: "PRV-3",
    name: "Extra Space Storage",
    kind: "third_party",
    facility: "Extra Space – Kendall",
    address: "12325 SW 88th St",
    city: "Kendall, FL 33186",
    phone: "(786) 555-4412",
    accessHours: "6:00 AM – 11:00 PM daily",
    notes: "Climate-controlled building. Loading dock on south side.",
  },
  {
    id: "PRV-4",
    name: "Arsemia Self-Storage",
    kind: "in_house",
    facility: "Arsemia Warehouse – Medley",
    address: "7550 NW 74th Ave",
    city: "Medley, FL 33166",
    phone: "(305) 555-1042",
    accessHours: "Mon–Sat 7:00 AM – 6:00 PM (staffed)",
    notes: "Arsemia's own bays. Staff-scanned in/out — full chain of custody.",
  },
];

const SEED_UNITS: StorageUnit[] = [
  {
    id: "UNIT-501",
    providerId: "PRV-1",
    unitNumber: "B-114",
    size: "10x10",
    climateControlled: true,
    monthlyCost: 189,
    status: "Active",
    shared: false,
    primaryCustomerId: "CUS-401",
    primaryCustomerName: "Sofia Martinez",
    jobId: "JOB-10421",
    startedAt: "2026-06-11",
    paidThrough: "2026-08-01",
    notes: "2-bed apartment contents in transition between homes.",
  },
  {
    id: "UNIT-502",
    providerId: "PRV-1",
    unitNumber: "C-207",
    size: "10x15",
    climateControlled: true,
    monthlyCost: 264,
    status: "Active",
    shared: true,
    primaryCustomerName: "Shared — 2 customers",
    startedAt: "2026-05-28",
    paidThrough: "2026-08-01",
    notes: "Shared unit — Aronson Design Studio staging + Layla Khoury overflow.",
  },
  {
    id: "UNIT-503",
    providerId: "PRV-2",
    unitNumber: "A-045",
    size: "5x10",
    monthlyCost: 96,
    status: "Overdue",
    shared: false,
    primaryCustomerId: "CUS-404",
    primaryCustomerName: "Marcus Thompson",
    jobId: "JOB-10424",
    startedAt: "2026-04-19",
    paidThrough: "2026-06-19",
    notes: "Autopay failed. Two damaged items pending customer response.",
  },
  {
    id: "UNIT-504",
    providerId: "PRV-3",
    unitNumber: "D-330",
    size: "10x20",
    climateControlled: true,
    monthlyCost: 312,
    status: "Active",
    shared: false,
    primaryCustomerId: "CUS-403",
    primaryCustomerName: "Olivia Chen",
    jobId: "JOB-10423",
    startedAt: "2026-06-02",
    paidThrough: "2026-08-01",
  },
  {
    id: "UNIT-505",
    providerId: "PRV-4",
    unitNumber: "Bay A",
    size: "Bay (~14x24)",
    monthlyCost: 0,
    status: "Active",
    shared: false,
    primaryCustomerId: "CUS-406",
    primaryCustomerName: "Isabella Fernandez",
    jobId: "JOB-10426",
    startedAt: "2026-06-20",
    notes: "Held in Arsemia's own warehouse — delivery scheduled next week.",
  },
  {
    id: "UNIT-506",
    providerId: "PRV-4",
    unitNumber: "Bay B",
    size: "Bay (~14x24)",
    monthlyCost: 0,
    status: "Vacant",
    shared: false,
    startedAt: "2026-06-20",
    notes: "Empty — available for the next storage job.",
  },
];

const SEED_ITEMS: StorageItem[] = [
  // UNIT-501 — Sofia Martinez
  hydrateItem({ id: "ITM-0001", tag: "ARS-88201", unitId: "UNIT-501", name: "Queen Mattress + Box Spring", category: "Furniture", quantity: 1, condition: "Good", jobId: "JOB-10421", room: "Master Bedroom", destinationGroup: "Bedroom", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0002", tag: "ARS-88202", unitId: "UNIT-501", name: "Sleeper Sofa", category: "Furniture", quantity: 1, condition: "Minor Wear", jobId: "JOB-10421", room: "Living Room", destinationGroup: "Living Room", stage: "In Storage", notes: "Small scuff on left arm noted at pickup." }),
  hydrateItem({ id: "ITM-0003", tag: "ARS-88203", unitId: "UNIT-501", name: "Wardrobe Boxes", category: "Boxes", quantity: 6, condition: "Good", jobId: "JOB-10421", room: "Master Bedroom", destinationGroup: "Bedroom", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0004", tag: "ARS-88204", unitId: "UNIT-501", name: "55\" TV (boxed)", category: "Fragile", quantity: 1, condition: "Good", jobId: "JOB-10421", room: "Living Room", destinationGroup: "Living Room", stage: "In Storage", photos: 2 }),

  // UNIT-502 — SHARED: Aronson Design Studio + Layla Khoury
  hydrateItem({ id: "ITM-0010", tag: "ARS-88210", unitId: "UNIT-502", name: "Showroom Display Shelving", category: "Furniture", quantity: 4, condition: "Good", ownerCustomerId: "CUS-411", ownerName: "Aronson Design Studio", room: "Showroom", destinationGroup: "Aronson — Showroom", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0011", tag: "ARS-88211", unitId: "UNIT-502", name: "Sample Rugs (rolled)", category: "Furniture", quantity: 12, condition: "Good", ownerCustomerId: "CUS-411", ownerName: "Aronson Design Studio", room: "Showroom", destinationGroup: "Aronson — Showroom", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0012", tag: "ARS-88212", unitId: "UNIT-502", name: "Dining Table (6-seat)", category: "Furniture", quantity: 1, condition: "Minor Wear", ownerCustomerId: "CUS-408", ownerName: "Layla Khoury", room: "Dining Room", destinationGroup: "Khoury — Overflow", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0013", tag: "ARS-88213", unitId: "UNIT-502", name: "Assorted Kitchen Boxes", category: "Boxes", quantity: 9, condition: "Good", ownerCustomerId: "CUS-408", ownerName: "Layla Khoury", room: "Kitchen", destinationGroup: "Khoury — Overflow", stage: "In Storage" }),

  // UNIT-503 — Marcus Thompson (overdue, has damage)
  hydrateItem({ id: "ITM-0020", tag: "ARS-88220", unitId: "UNIT-503", name: "Antique Dresser", category: "Furniture", quantity: 1, condition: "Damaged", jobId: "JOB-10424", room: "Bedroom", destinationGroup: "Bedroom", stage: "In Storage", photos: 4, notes: "Water ring + cracked veneer found on inbound scan. Flagged for claim." }),
  hydrateItem({ id: "ITM-0021", tag: "ARS-88221", unitId: "UNIT-503", name: "Floor Lamp", category: "Fragile", quantity: 1, condition: "Missing", jobId: "JOB-10424", room: "Living Room", destinationGroup: "Living Room", stage: "In Storage", notes: "Not located at inbound count. Customer notified." }),
  hydrateItem({ id: "ITM-0022", tag: "ARS-88222", unitId: "UNIT-503", name: "Book Boxes", category: "Boxes", quantity: 5, condition: "Good", jobId: "JOB-10424", room: "Office", destinationGroup: "Office", stage: "In Storage" }),

  // UNIT-504 — Olivia Chen
  hydrateItem({ id: "ITM-0030", tag: "ARS-88230", unitId: "UNIT-504", name: "Sectional Sofa (3-piece)", category: "Furniture", quantity: 1, condition: "Good", jobId: "JOB-10423", room: "Living Room", destinationGroup: "Living Room", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0031", tag: "ARS-88231", unitId: "UNIT-504", name: "Glass Dining Set", category: "Fragile", quantity: 1, condition: "Good", jobId: "JOB-10423", room: "Dining Room", destinationGroup: "Dining Room", stage: "In Storage", photos: 3 }),
  hydrateItem({ id: "ITM-0032", tag: "ARS-88232", unitId: "UNIT-504", name: "Peloton Bike", category: "Appliance", quantity: 1, condition: "Good", jobId: "JOB-10423", room: "Gym", destinationGroup: "Gym", stage: "In Storage" }),
  hydrateItem({ id: "ITM-0033", tag: "ARS-88233", unitId: "UNIT-504", name: "Garage / Tool Boxes", category: "Boxes", quantity: 8, condition: "Good", jobId: "JOB-10423", room: "Garage", destinationGroup: "Garage", stage: "In Storage" }),

  // UNIT-505 — Isabella Fernandez (in-house, moving out for delivery)
  hydrateItem({ id: "ITM-0040", tag: "ARS-88240", unitId: "UNIT-505", name: "King Bedroom Set", category: "Furniture", quantity: 1, condition: "Good", jobId: "JOB-10426", room: "Master Bedroom", destinationGroup: "Bedroom", stage: "Pulled for Delivery" }),
  hydrateItem({ id: "ITM-0041", tag: "ARS-88241", unitId: "UNIT-505", name: "Refrigerator", category: "Appliance", quantity: 1, condition: "Minor Wear", jobId: "JOB-10426", room: "Kitchen", destinationGroup: "Kitchen", stage: "Pulled for Delivery", notes: "Small dent on door — documented at intake." }),
  hydrateItem({ id: "ITM-0042", tag: "ARS-88242", unitId: "UNIT-505", name: "China Cabinet", category: "Fragile", quantity: 1, condition: "Good", jobId: "JOB-10426", room: "Dining Room", destinationGroup: "Dining Room", stage: "Out for Delivery", photos: 2 }),
];

/* ------------------------------------------------------------------ */
/* Derived item status (for the item-first table)                      */
/* ------------------------------------------------------------------ */

export type StorageItemStatus =
  | "in_storage"
  | "pulled_for_delivery"
  | "delivered_out"
  | "damaged"
  | "missing"
  | "claimed";

export const STORAGE_ITEM_STATUS_LABEL: Record<StorageItemStatus, string> = {
  in_storage: "In storage",
  pulled_for_delivery: "Pulled",
  delivered_out: "Delivered out",
  damaged: "Damaged",
  missing: "Missing",
  claimed: "Claimed",
};

export const STORAGE_ITEM_STATUS_STYLE: Record<StorageItemStatus, string> = {
  in_storage: "border-violet-500/40 bg-violet-500/10 text-violet-600",
  pulled_for_delivery: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  delivered_out: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  damaged: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  missing: "border-rose-600/50 bg-rose-600/15 text-rose-700",
  claimed: "border-sky-500/40 bg-sky-500/10 text-sky-600",
};

export const STORAGE_ITEM_STATUSES: StorageItemStatus[] = [
  "in_storage", "pulled_for_delivery", "delivered_out", "damaged", "missing", "claimed",
];

export function storageItemStatus(i: StorageItem): StorageItemStatus {
  if (i.condition === "Missing") return "missing";
  if (i.condition === "Damaged") return i.claimId ? "claimed" : "damaged";
  if (i.claimId) return "claimed";
  if (i.stage === "Delivered" || i.stage === "Out for Delivery") return "delivered_out";
  if (i.stage === "Pulled for Delivery") return "pulled_for_delivery";
  return "in_storage";
}

/* ------------------------------------------------------------------ */
/* Exceptions                                                          */
/* ------------------------------------------------------------------ */

export type StorageExceptionType = "damaged" | "missing" | "wrong_unit" | "condition_change";
export type StorageExceptionStatus = "open" | "resolved";

export const EXCEPTION_TYPE_LABEL: Record<StorageExceptionType, string> = {
  damaged: "Damaged",
  missing: "Missing",
  wrong_unit: "Wrong unit",
  condition_change: "Condition change",
};

export interface StorageException {
  id: string;
  itemId: string;
  unitId: string;
  jobId?: string;
  type: StorageExceptionType;
  severity: "low" | "medium" | "high";
  description: string;
  createdBy: string;
  createdAt: string;
  linkedClaimId?: string;
  status: StorageExceptionStatus;
}

const SEED_EXCEPTIONS: StorageException[] = [
  { id: "STE-0001", itemId: "ITM-0020", unitId: "UNIT-503", jobId: "JOB-10424", type: "damaged", severity: "high", description: "Water ring + cracked veneer on Antique Dresser (inbound scan).", createdBy: "Storage Desk", createdAt: "2026-06-21T14:10:00", status: "open" },
  { id: "STE-0002", itemId: "ITM-0021", unitId: "UNIT-503", jobId: "JOB-10424", type: "missing", severity: "high", description: "Floor Lamp not located at inbound count.", createdBy: "Storage Desk", createdAt: "2026-06-21T14:20:00", status: "open" },
  { id: "STE-0003", itemId: "ITM-0002", unitId: "UNIT-501", jobId: "JOB-10421", type: "condition_change", severity: "low", description: "Minor scuff noted on Sleeper Sofa left arm.", createdBy: "Marcus Reyes", createdAt: "2026-06-12T10:00:00", status: "resolved" },
];

/* ------------------------------------------------------------------ */
/* Reminders                                                           */
/* ------------------------------------------------------------------ */

export type StorageReminderType = "billing" | "access_check" | "inventory_audit" | "delivery_due" | "exception_followup";

export const STORAGE_REMINDER_LABEL: Record<StorageReminderType, string> = {
  billing: "Billing due",
  access_check: "Access check",
  inventory_audit: "Inventory audit",
  delivery_due: "Delivery due",
  exception_followup: "Exception follow-up",
};

export interface StorageReminder {
  id: string;
  type: StorageReminderType;
  providerId?: string;
  unitId?: string;
  jobId?: string;
  dueDate: string;
  priority: "low" | "normal" | "high";
  status: "open" | "done";
  note?: string;
}

const SEED_REMINDERS: StorageReminder[] = [
  { id: "STR-0001", type: "billing", unitId: "UNIT-503", providerId: "PRV-2", dueDate: "2026-06-19", priority: "high", status: "open", note: "Autopay failed — Marcus Thompson unit overdue." },
  { id: "STR-0002", type: "delivery_due", unitId: "UNIT-505", jobId: "JOB-10426", dueDate: "2026-07-11", priority: "high", status: "open", note: "Isabella Fernandez delivery scheduled." },
  { id: "STR-0003", type: "billing", unitId: "UNIT-501", providerId: "PRV-1", dueDate: "2026-08-01", priority: "normal", status: "open" },
  { id: "STR-0004", type: "inventory_audit", unitId: "UNIT-502", providerId: "PRV-1", dueDate: "2026-07-15", priority: "normal", status: "open", note: "Shared unit — quarterly audit." },
];

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

interface StorageState {
  providers: StorageProvider[];
  units: StorageUnit[];
  items: StorageItem[];
  exceptions: StorageException[];
  reminders: StorageReminder[];

  advanceScan: (itemId: string, by: string, note?: string) => StorageItem | undefined;
  setStage: (itemId: string, stage: ScanStage, by: string, note?: string) => StorageItem | undefined;
  setCondition: (itemId: string, condition: ItemCondition, by: string, note?: string) => StorageItem | undefined;
  setUnitStatus: (unitId: string, status: StorageUnitStatus) => StorageUnit | undefined;
  linkItemClaim: (itemId: string, claimId: string) => StorageItem | undefined;
  reportException: (input: Omit<StorageException, "id" | "createdAt" | "status">) => StorageException;
  resolveException: (id: string) => void;
  resolveReminder: (id: string) => void;

  getProvider: (id: string) => StorageProvider | undefined;
  getUnit: (id: string) => StorageUnit | undefined;
  getItem: (id: string) => StorageItem | undefined;
  unitsForProvider: (providerId: string) => StorageUnit[];
  itemsForUnit: (unitId: string) => StorageItem[];
  exceptionsForUnit: (unitId: string) => StorageException[];
}

function mkLocalScanId(): string {
  return createId("storageScan");
}

export const useStorage = create<StorageState>()(
  persist(
    (set, get) => {
      const applyItem = (
        itemId: string,
        fn: (i: StorageItem) => StorageItem,
      ): StorageItem | undefined => {
        let updated: StorageItem | undefined;
        set((s) => ({
          items: s.items.map((i) => {
            if (i.id !== itemId) return i;
            updated = fn(i);
            return updated;
          }),
        }));
        return updated;
      };

      return {
        providers: SEED_PROVIDERS,
        units: SEED_UNITS,
        items: SEED_ITEMS,
        exceptions: SEED_EXCEPTIONS,
        reminders: SEED_REMINDERS,

        advanceScan: (itemId, by, note) => {
          const current = get().items.find((i) => i.id === itemId);
          if (!current) return undefined;
          const next = nextScanStage(current.stage);
          if (!next) return current; // already Delivered
          return applyItem(itemId, (i) => ({
            ...i,
            stage: next,
            scanHistory: [
              ...i.scanHistory,
              { id: mkLocalScanId(), stage: next, at: new Date().toISOString(), by, note },
            ],
          }));
        },

        setStage: (itemId, stage, by, note) =>
          applyItem(itemId, (i) => ({
            ...i,
            stage,
            scanHistory: [
              ...i.scanHistory,
              { id: mkLocalScanId(), stage, at: new Date().toISOString(), by, note },
            ],
          })),

        setCondition: (itemId, condition, by, note) => {
          const updated = applyItem(itemId, (i) => ({
            ...i,
            condition,
            notes: note ?? i.notes,
            scanHistory: [
              ...i.scanHistory,
              {
                id: mkLocalScanId(),
                stage: i.stage,
                at: new Date().toISOString(),
                by,
                note: `Condition set to ${condition}${note ? ` — ${note}` : ""}`,
              },
            ],
          }));
          // Damaged/Missing auto-raises an open exception (once).
          if (updated && (condition === "Damaged" || condition === "Missing")) {
            const existing = get().exceptions.find(
              (e) => e.itemId === itemId && e.status === "open",
            );
            if (!existing) {
              const exc: StorageException = {
                id: createId("storageException"),
                itemId,
                unitId: updated.unitId,
                jobId: updated.jobId,
                type: condition === "Missing" ? "missing" : "damaged",
                severity: "high",
                description: `${updated.name} reported ${condition.toLowerCase()}${note ? ` — ${note}` : ""}`,
                createdBy: by,
                createdAt: new Date().toISOString(),
                status: "open",
              };
              set((s) => ({ exceptions: [exc, ...s.exceptions] }));
            }
          }
          return updated;
        },

        setUnitStatus: (unitId, status) => {
          let updated: StorageUnit | undefined;
          set((s) => ({
            units: s.units.map((u) => {
              if (u.id !== unitId) return u;
              updated = { ...u, status };
              return updated;
            }),
          }));
          return updated;
        },

        linkItemClaim: (itemId, claimId) => {
          const updated = applyItem(itemId, (i) => ({ ...i, claimId }));
          // Link any open exception for this item to the claim too.
          set((s) => ({
            exceptions: s.exceptions.map((e) =>
              e.itemId === itemId && e.status === "open" ? { ...e, linkedClaimId: claimId } : e,
            ),
          }));
          return updated;
        },

        reportException: (input) => {
          const exc: StorageException = {
            ...input,
            id: createId("storageException"),
            createdAt: new Date().toISOString(),
            status: "open",
          };
          set((s) => ({ exceptions: [exc, ...s.exceptions] }));
          return exc;
        },
        resolveException: (id) =>
          set((s) => ({
            exceptions: s.exceptions.map((e) => (e.id === id ? { ...e, status: "resolved" } : e)),
          })),
        resolveReminder: (id) =>
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? { ...r, status: "done" } : r)),
          })),

        getProvider: (id) => get().providers.find((p) => p.id === id),
        getUnit: (id) => get().units.find((u) => u.id === id),
        getItem: (id) => get().items.find((i) => i.id === id),
        unitsForProvider: (providerId) => get().units.filter((u) => u.providerId === providerId),
        itemsForUnit: (unitId) => get().items.filter((i) => i.unitId === unitId),
        exceptionsForUnit: (unitId) => get().exceptions.filter((e) => e.unitId === unitId),
      };
    },
    {
      name: "arsemia.storage.v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
