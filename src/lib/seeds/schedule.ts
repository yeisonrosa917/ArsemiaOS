import type { Job, JobType, JobStatus } from "@/lib/types";
import { drivers } from "@/lib/mock-data";

/**
 * Deterministic operating schedule, April → September 2026. Generated once at
 * module load with a fixed seed so the server and client produce identical data
 * (no hydration mismatch). These supplement the hand-written mock jobs so the
 * hub has history (completed), current work, and future bookings for the
 * dashboard, dispatch, foreman roster, payroll periods, and analytics.
 *
 * IDs are prefixed JOB-S… to avoid colliding with the mock JOB-104xx set.
 */

// mulberry32 — tiny deterministic PRNG.
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS = [
  "Alvarez", "Bennett", "Castillo", "Delgado", "Ellison", "Ferreira", "Guzman",
  "Hendricks", "Ibrahim", "Jimenez", "Kowalski", "Lambert", "Moreno", "Nakamura",
  "Ortega", "Petrov", "Quintero", "Ramirez", "Sullivan", "Thompson", "Ugarte",
  "Vega", "Whitaker", "Xiong", "Younis", "Zapata", "Brennan", "Okonkwo",
  "Kaufman", "Silva", "Rossi", "Pierce", "Okafor", "Fuentes", "Whitfield",
];
const SUFFIX = ["Residence", "Move", "Household", "Family", "Office", "Studio", "Apartment"];
const CITIES = [
  "Brickell", "Coral Gables", "Wynwood", "Aventura", "Doral", "Kendall",
  "Miami Beach", "North Miami", "Pinecrest", "Hialeah", "Coconut Grove",
  "Key Biscayne", "Sunny Isles", "Miami Lakes", "Palmetto Bay",
];
const TYPES: { type: JobType; weight: number }[] = [
  { type: "Local Move", weight: 6 },
  { type: "Long Distance", weight: 2 },
  { type: "Delivery", weight: 1 },
  { type: "Commercial", weight: 1 },
  { type: "Storage In", weight: 1 },
];

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}
function pickType(r: number): JobType {
  const total = TYPES.reduce((s, t) => s + t.weight, 0);
  let x = r * total;
  for (const t of TYPES) {
    if (x < t.weight) return t.type;
    x -= t.weight;
  }
  return "Local Move";
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function iso(y: number, m: number, d: number, h: number) {
  return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:00:00`;
}

// App "today" for the demo is 2026-07-02.
const TODAY = new Date("2026-07-02T00:00:00");

function statusForDate(date: Date, r: number): { status: JobStatus; payroll: Job["payrollStatus"] } {
  const daysFromToday = Math.round((date.getTime() - TODAY.getTime()) / 86400000);
  if (daysFromToday < -1) return { status: "Completed", payroll: r < 0.85 ? "Approved" : "Paid" };
  if (daysFromToday <= 1) {
    const live: JobStatus[] = ["En Route", "Pickup Started", "Pickup Completed", "Delivery Started"];
    return { status: pick(live, r), payroll: "Pending" };
  }
  if (daysFromToday <= 5) return { status: r < 0.5 ? "Assigned" : "En Route", payroll: "Pending" };
  // Future — booked/assigned, some still needing a foreman.
  return { status: r < 0.2 ? "Unassigned" : "Assigned", payroll: "Pending" };
}

function build(): Job[] {
  const r = rng(20260702);
  const out: Job[] = [];
  let n = 1;
  // April 1 → September 30, 2026.
  const start = new Date("2026-04-01T00:00:00");
  const end = new Date("2026-09-30T00:00:00");
  for (let t = start.getTime(); t <= end.getTime(); t += 7 * 86400000) {
    const perWeek = 3 + Math.floor(r() * 3); // 3–5 jobs/week
    for (let j = 0; j < perWeek; j++) {
      const day = new Date(t + Math.floor(r() * 6) * 86400000);
      const hour = 7 + Math.floor(r() * 6);
      const foreman = drivers[Math.floor(r() * drivers.length)];
      const type = pickType(r());
      const cuFt = type === "Long Distance" ? 700 + Math.floor(r() * 900) : 300 + Math.floor(r() * 700);
      const miles = type === "Long Distance" ? 120 + Math.floor(r() * 220) : 4 + Math.floor(r() * 30);
      const price = Math.round((cuFt * 2.6 + miles * 3 + 150) / 5) * 5;
      const from = pick(CITIES, r());
      let to = pick(CITIES, r());
      if (to === from) to = CITIES[(CITIES.indexOf(to) + 1) % CITIES.length];
      const { status, payroll } = statusForDate(day, r());
      const assigned = status !== "Unassigned";
      const cust = `${pick(CUSTOMERS, r())} ${pick(SUFFIX, r())}`;
      out.push({
        id: `JOB-S${1000 + n}`,
        customer: cust,
        customerPhone: `(305) 555-${pad(10 + (n % 89))}${pad(n % 99)}`.slice(0, 14),
        pickup: `${100 + (n % 900)} ${from} Ave`,
        delivery: `${100 + ((n * 7) % 900)} ${to} St`,
        pickupCity: from,
        deliveryCity: to,
        type,
        cuFt,
        miles,
        status,
        driverId: assigned ? foreman.id : undefined,
        driverName: assigned ? foreman.name : undefined,
        crew: assigned ? [foreman.name] : [],
        price,
        payrollStatus: payroll,
        scheduledAt: iso(day.getFullYear(), day.getMonth() + 1, day.getDate(), hour),
        zone: from,
        priority: r() < 0.15 ? "High" : r() < 0.5 ? "Medium" : "Low",
      });
      n++;
    }
  }
  return out;
}

export const SCHEDULE_JOBS: Job[] = build();
