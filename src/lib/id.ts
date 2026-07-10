/**
 * Collision-safe ID generation for runtime records.
 *
 * Previously several stores used module-level counters (e.g. `let seq = 9000`)
 * or `Math.random()` to mint IDs. Counters reset on page reload, so a record
 * created in a new session could reuse an ID already persisted in localStorage
 * — causing React key collisions and mis-routed detail pages.
 *
 * `createId(entity)` prefixes a UUID (via `crypto.randomUUID` when available,
 * with a timestamp+random fallback) so new IDs never collide with existing
 * demo IDs or with each other across reloads. Seed/demo IDs keep their existing
 * literal values; only newly created runtime records use this.
 */

const PREFIX = {
  lead: "LD",
  quote: "QT",
  customer: "CUS",
  job: "JOB",
  invoice: "INV",
  claim: "CLM",
  claimMessage: "MSG",
  claimEvidence: "EVD",
  activity: "ACT",
  notification: "NTF",
  expense: "EXP",
  payroll: "PAY",
  storageProvider: "STP",
  storageUnit: "STU",
  storageItem: "STI",
  storageScan: "SCN",
  storageException: "STE",
  storageReminder: "STR",
  maintenance: "MNT",
  catalogPending: "PC",
  user: "USR",
} as const;

export type EntityType = keyof typeof PREFIX;

/** A UUID string — crypto.randomUUID when available, else a safe fallback. */
export function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // Fallback: time + randomness, still collision-safe for local/demo use.
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 12)}`;
}

/**
 * Create a prefixed, collision-safe ID for a runtime record, e.g.
 *   createId("claim") -> "CLM-a1b2c3d4e5f6"
 */
export function createId(entity: EntityType): string {
  const compact = uuid().replace(/-/g, "").slice(0, 12);
  return `${PREFIX[entity]}-${compact}`;
}
