/**
 * Quote item text parser.
 *
 * Sellers routinely receive an inventory as free text — pasted from an email,
 * a WhatsApp list, or typed from a phone call:
 *
 *   3 dining chairs
 *   sofa 3 seater
 *   2x queen mattress
 *   coffee table
 *   fridge
 *
 * This turns that into structured lines matched against the moving catalog, so
 * the quote inventory can be filled in one paste instead of clicking each item.
 * Lines it can't confidently match are returned separately (they can be added
 * as custom items / sent to catalog approval).
 */

import { PRESET_ITEMS } from "./catalog";

export interface ParsedMatch {
  raw: string;
  qty: number;
  name: string;
  cuftEach: number;
  score: number;
}

export interface ParsedUnmatched {
  raw: string;
  qty: number;
  query: string;
}

export interface ParseResult {
  matched: ParsedMatch[];
  unmatched: ParsedUnmatched[];
}

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

/** Common phrasing → catalog wording, applied before tokenizing. */
const SYNONYMS: Record<string, string> = {
  fridge: "refrigerator",
  couch: "sofa",
  loveseat: "love seat",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singular(token: string): string {
  if (token.length > 3 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function tokenize(s: string): string[] {
  let n = normalize(s);
  for (const [from, to] of Object.entries(SYNONYMS)) {
    n = n.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }
  return n.split(" ").filter(Boolean).map(singular);
}

/** Pull a leading/trailing quantity off a raw line. */
export function extractQty(raw: string): { qty: number; rest: string } {
  const line = raw.trim();

  // leading "3", "3x", "3 x", "3X"
  let m = line.match(/^(\d+)\s*[xX]?\s+(.*)$/) || line.match(/^(\d+)[xX](.*)$/);
  if (m && m[2].trim()) return { qty: clampQty(m[1]), rest: m[2] };

  // leading number word ("two sofas")
  m = line.match(/^([a-zA-Z]+)\s+(.*)$/);
  if (m && NUMBER_WORDS[m[1].toLowerCase()] !== undefined && m[2].trim()) {
    return { qty: NUMBER_WORDS[m[1].toLowerCase()], rest: m[2] };
  }

  // trailing "x3", "(x3)", "- 3", "*3", " 3"
  m = line.match(/^(.*?)[\s\-–]*[xX*(]?\s*(\d+)\s*\)?$/);
  if (m && m[1].trim() && m[1].trim().length > 1) return { qty: clampQty(m[2]), rest: m[1] };

  return { qty: 1, rest: line };
}

function clampQty(s: string): number {
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(n, 99);
}

function score(queryTokens: string[], itemTokens: string[]): number {
  if (queryTokens.length === 0 || itemTokens.length === 0) return 0;
  const qset = new Set(queryTokens);
  const iset = new Set(itemTokens);
  let shared = 0;
  iset.forEach((t) => {
    if (qset.has(t)) shared += 1;
  });
  if (shared === 0) return 0;
  const itemCoverage = shared / iset.size;
  const queryCoverage = shared / qset.size;
  return itemCoverage * 0.6 + queryCoverage * 0.4;
}

const MATCH_THRESHOLD = 0.55;

/** Best catalog match for a single already-quantity-stripped phrase. */
export function matchCatalog(phrase: string): { name: string; cuftEach: number; score: number } | null {
  const qTokens = tokenize(phrase);
  if (qTokens.length === 0) return null;
  const qNorm = qTokens.join(" ");

  let best: { name: string; cuftEach: number; score: number } | null = null;
  for (const item of PRESET_ITEMS) {
    const iTokens = tokenize(item.name);
    let s = score(qTokens, iTokens);
    if (iTokens.join(" ") === qNorm) s = 1; // exact normalized match wins outright
    if (!best || s > best.score) best = { name: item.name, cuftEach: item.cuft, score: s };
  }
  return best && best.score >= MATCH_THRESHOLD ? best : null;
}

/** Parse a whole block of pasted text into matched + unmatched lines. */
export function parseItemText(text: string): ParseResult {
  const lines = text
    .split(/[\n,;•]+/)
    .map((l) => l.replace(/^[\s\-*·]+/, "").trim())
    .filter(Boolean);

  const matched: ParsedMatch[] = [];
  const unmatched: ParsedUnmatched[] = [];

  for (const raw of lines) {
    const { qty, rest } = extractQty(raw);
    if (!rest.trim()) continue;
    const hit = matchCatalog(rest);
    if (hit) {
      matched.push({ raw, qty, name: hit.name, cuftEach: hit.cuftEach, score: hit.score });
    } else {
      unmatched.push({ raw, qty, query: normalize(rest) });
    }
  }

  return { matched, unmatched };
}
