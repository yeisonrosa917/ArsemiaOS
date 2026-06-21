/**
 * Pure pricing engine — no UI, no side effects.
 * Customer-facing total (what client pays) and internal commissionable base
 * (what payroll uses) are calculated separately.
 */

import {
  DEFAULT_RATES,
  PACK_PRICES_CUSTOMER,
  PACK_PRICES_INTERNAL,
  type HandlingItem,
  type RateConfig,
} from "./catalog";

export interface InventoryLine {
  itemName: string;
  qty: number;
  cuftEach: number;
  packByCrew?: boolean;
}

export interface QuoteInput {
  cuftOverride?: number;
  inventory?: InventoryLine[];
  miles?: number;
  stairsFlights?: number;
  stairsRatePerFlight?: number;
  handlingItems?: HandlingItem[];
  rates?: Partial<RateConfig>;
  applyCuftMinimum?: boolean;
}

export interface QuoteResult {
  cuftTotal: number;
  cuftMinimumApplied: boolean;
  customer: {
    cuftCharge: number;
    milesCharge: number;
    packingCharge: number;
    stairsCharge: number;
    handlingCharge: number;
    total: number;
  };
  internal: {
    cuftCharge: number;
    milesCharge: number;
    packingCharge: number;
    stairsCharge: number;
    handlingCharge: number;
    commissionableBase: number;
  };
}

function safeNum(n: unknown): number {
  const v = Number(n ?? 0);
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

export function calcMilesCharge(miles: number, rates: RateConfig): number {
  const m = safeNum(miles);
  if (m <= 0) return 0;
  return m * (m > rates.milesThreshold ? rates.milesLongRate : rates.milesShortRate);
}

export function sumInventoryCuft(items: InventoryLine[] = []): number {
  return items.reduce((acc, it) => acc + safeNum(it.qty) * safeNum(it.cuftEach), 0);
}

export function calcPacking(items: InventoryLine[] = [], internal: boolean): number {
  const prices = internal ? PACK_PRICES_INTERNAL : PACK_PRICES_CUSTOMER;
  return items.reduce((acc, it) => {
    if (!it.packByCrew) return acc;
    const price = prices[it.itemName] ?? 0;
    return acc + safeNum(it.qty) * price;
  }, 0);
}

export function calcHandling(items: HandlingItem[] = []): number {
  return items.reduce((acc, it) => acc + safeNum(it.price), 0);
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const rates: RateConfig = { ...DEFAULT_RATES, ...input.rates };

  const inventoryCuft = sumInventoryCuft(input.inventory);
  const rawCuft = input.cuftOverride ?? inventoryCuft;
  const applyMin = input.applyCuftMinimum ?? true;
  const cuftMinimumApplied = applyMin && rawCuft < rates.cuftMinimum;
  const cuftTotal = cuftMinimumApplied ? rates.cuftMinimum : rawCuft;

  const customerCuft = cuftTotal * rates.cuftRateCustomer;
  const internalCuft = cuftTotal * rates.cuftRateInternal;

  const miles = calcMilesCharge(input.miles ?? 0, rates);

  const stairsFlights = safeNum(input.stairsFlights);
  const stairsRate = safeNum(input.stairsRatePerFlight ?? 35);
  const stairs = stairsFlights * stairsRate;

  const packCustomer = calcPacking(input.inventory, false);
  const packInternal = calcPacking(input.inventory, true);

  const handling = calcHandling(input.handlingItems);

  const customerTotal = customerCuft + miles + packCustomer + stairs + handling;
  const commissionableBase =
    internalCuft + miles + packInternal + stairs + handling;

  return {
    cuftTotal,
    cuftMinimumApplied,
    customer: {
      cuftCharge: customerCuft,
      milesCharge: miles,
      packingCharge: packCustomer,
      stairsCharge: stairs,
      handlingCharge: handling,
      total: customerTotal,
    },
    internal: {
      cuftCharge: internalCuft,
      milesCharge: miles,
      packingCharge: packInternal,
      stairsCharge: stairs,
      handlingCharge: handling,
      commissionableBase,
    },
  };
}

export function fmtUSD(n: number): string {
  return Number(n || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtCuft(n: number): string {
  const v = safeNum(n);
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1);
}
