import type { SalesStage } from "@/lib/types";

export type LeadSource =
  | "Website"
  | "Yelp"
  | "Google Ads"
  | "Referral"
  | "Phone"
  | "Repeat Customer"
  | "Walk-in";

export type LeadPriority = "Low" | "Normal" | "High" | "Urgent";

export interface LeadOwnershipEntry {
  at: string;
  sellerId: string | null;
  sellerName: string;
  by: string;
}

export interface LeadNote {
  at: string;
  by: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  stage: SalesStage;
  fromCity: string;
  toCity: string;
  moveDate?: string;
  estimatedValue: number;
  estimatedCuFt: number;
  priority: LeadPriority;
  assignedSellerId: string | null;
  assignedSellerName: string | null;
  createdAt: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  quoteId?: string;
  jobId?: string;
  notes?: string;
  ownershipHistory: LeadOwnershipEntry[];
  noteLog: LeadNote[];
}

// Sellers referenced by the seed (ids match SEED_USERS).
const CE = { id: "u_sell", name: "Carlos Estevez" };
const DR = { id: "u_sell2", name: "Daniela Rios" };
const AM = { id: "u_sell3", name: "Andres Molina" };

function lead(l: Omit<Lead, "ownershipHistory" | "noteLog"> & {
  ownershipHistory?: LeadOwnershipEntry[];
  noteLog?: LeadNote[];
}): Lead {
  return {
    ownershipHistory: l.assignedSellerId
      ? [
          {
            at: l.createdAt,
            sellerId: l.assignedSellerId,
            sellerName: l.assignedSellerName ?? "",
            by: "System",
          },
        ]
      : [],
    noteLog: [],
    ...l,
  };
}

// "Today" reference for the demo is 2026-07-02.
export const LEAD_SEED: Lead[] = [
  // --- Unassigned queue (just came in, no seller yet) ---
  lead({
    id: "LD-2051", name: "Sofia Martinez", phone: "(305) 555-3120",
    email: "sofia.m@gmail.com", source: "Website", stage: "New Lead",
    fromCity: "Brickell", toCity: "Coral Gables", moveDate: "2026-07-19",
    estimatedValue: 1850, estimatedCuFt: 480, priority: "Normal",
    assignedSellerId: null, assignedSellerName: null,
    createdAt: "2026-07-02T08:40:00",
    notes: "2BR apartment, 3rd floor walk-up, has piano.",
  }),
  lead({
    id: "LD-2052", name: "Elena Park", phone: "(786) 555-2245",
    email: "e.park@me.com", source: "Google Ads", stage: "New Lead",
    fromCity: "Wynwood", toCity: "Pinecrest", moveDate: "2026-07-24",
    estimatedValue: 1190, estimatedCuFt: 320, priority: "Low",
    assignedSellerId: null, assignedSellerName: null,
    createdAt: "2026-07-02T08:05:00",
    notes: "Studio. Wants packing service included.",
  }),
  lead({
    id: "LD-2053", name: "Grant Whitfield", phone: "(305) 555-6690",
    email: "grant.w@outlook.com", source: "Phone", stage: "New Lead",
    fromCity: "Aventura", toCity: "Fort Lauderdale", moveDate: "2026-08-02",
    estimatedValue: 3400, estimatedCuFt: 900, priority: "High",
    assignedSellerId: null, assignedSellerName: null,
    createdAt: "2026-07-02T07:20:00",
    notes: "Called this morning. 4BR house, urgent timeline.",
  }),
  lead({
    id: "LD-2054", name: "Nadia Fuentes", phone: "(786) 555-7788",
    email: "nadia.f@gmail.com", source: "Yelp", stage: "New Lead",
    fromCity: "Doral", toCity: "Kendall", moveDate: "2026-07-29",
    estimatedValue: 2050, estimatedCuFt: 560, priority: "Normal",
    assignedSellerId: null, assignedSellerName: null,
    createdAt: "2026-07-01T19:12:00",
  }),

  // --- Carlos Estevez ---
  lead({
    id: "LD-2055", name: "Ryan Cole", phone: "(786) 555-4421",
    email: "ryan.cole@outlook.com", source: "Yelp", stage: "Contacted",
    fromCity: "Miami Beach", toCity: "Aventura", moveDate: "2026-07-12",
    estimatedValue: 2640, estimatedCuFt: 720, priority: "Normal",
    assignedSellerId: CE.id, assignedSellerName: CE.name,
    createdAt: "2026-06-27T16:42:00", lastContactedAt: "2026-06-30T10:00:00",
    nextFollowUpAt: "2026-07-02", // due today
    notes: "Townhouse to townhouse. Lots of fragile art.",
  }),
  lead({
    id: "LD-2056", name: "Hayward Logistics", phone: "(305) 555-9009",
    email: "ops@haywardlog.com", source: "Referral", stage: "Quote Sent",
    fromCity: "Hialeah", toCity: "Doral", moveDate: "2026-07-18",
    estimatedValue: 6280, estimatedCuFt: 1640, priority: "High",
    assignedSellerId: CE.id, assignedSellerName: CE.name,
    createdAt: "2026-06-24T11:05:00", lastContactedAt: "2026-06-29T09:30:00",
    nextFollowUpAt: "2026-06-30", // overdue
    quoteId: "QT-4102",
    notes: "Commercial. Existing customer wants weekend slot.",
  }),
  lead({
    id: "LD-2057", name: "Priya Sharma", phone: "(786) 555-1184",
    email: "priya.sharma@yahoo.com", source: "Repeat Customer", stage: "Follow-Up Needed",
    fromCity: "Miami", toCity: "Tampa", moveDate: "2026-07-08",
    estimatedValue: 5840, estimatedCuFt: 880, priority: "High",
    assignedSellerId: CE.id, assignedSellerName: CE.name,
    createdAt: "2026-06-22T10:30:00", lastContactedAt: "2026-06-28T14:00:00",
    nextFollowUpAt: "2026-07-01", // overdue
    quoteId: "QT-4098",
    notes: "Long distance. Will need 2-day trip.",
  }),
  lead({
    id: "LD-2058", name: "Marcus Chen", phone: "(305) 555-7762",
    email: "marcus.chen@gmail.com", source: "Phone", stage: "Booked",
    fromCity: "Coconut Grove", toCity: "Key Biscayne", moveDate: "2026-07-06",
    estimatedValue: 2120, estimatedCuFt: 540, priority: "Normal",
    assignedSellerId: CE.id, assignedSellerName: CE.name,
    createdAt: "2026-06-20T14:22:00", lastContactedAt: "2026-06-30T11:00:00",
    quoteId: "QT-4090", jobId: "JOB-10421",
    notes: "Deposit paid. Ready to convert.",
  }),

  // --- Daniela Rios ---
  lead({
    id: "LD-2059", name: "Aria Williams", phone: "(786) 555-5510",
    email: "aria.w@gmail.com", source: "Website", stage: "Contacted",
    fromCity: "North Miami", toCity: "Aventura", moveDate: "2026-07-15",
    estimatedValue: 1580, estimatedCuFt: 410, priority: "Normal",
    assignedSellerId: DR.id, assignedSellerName: DR.name,
    createdAt: "2026-06-28T18:55:00", lastContactedAt: "2026-07-01T09:00:00",
    nextFollowUpAt: "2026-07-03",
  }),
  lead({
    id: "LD-2060", name: "Vanessa Tran", phone: "(305) 555-7811",
    email: "v.tran@gmail.com", source: "Website", stage: "Quote Requested",
    fromCity: "Brickell", toCity: "Coral Gables", moveDate: "2026-07-20",
    estimatedValue: 2150, estimatedCuFt: 540, priority: "Normal",
    assignedSellerId: DR.id, assignedSellerName: DR.name,
    createdAt: "2026-07-01T13:15:00", lastContactedAt: "2026-07-01T13:15:00",
    nextFollowUpAt: "2026-07-02", // due today
  }),
  lead({
    id: "LD-2061", name: "Joseph Salinas", phone: "(786) 555-2042",
    email: "j.salinas@yahoo.com", source: "Referral", stage: "Quote Drafted",
    fromCity: "Miami Beach", toCity: "Aventura", moveDate: "2026-07-22",
    estimatedValue: 3290, estimatedCuFt: 820, priority: "High",
    assignedSellerId: DR.id, assignedSellerName: DR.name,
    createdAt: "2026-06-30T10:00:00", lastContactedAt: "2026-07-01T16:00:00",
    nextFollowUpAt: "2026-07-04",
  }),
  lead({
    id: "LD-2062", name: "Khalid Stephens", phone: "(305) 555-8801",
    email: "k.stephens@gmail.com", source: "Yelp", stage: "Follow-Up Needed",
    fromCity: "Wynwood", toCity: "Hialeah", moveDate: "2026-07-14",
    estimatedValue: 1480, estimatedCuFt: 320, priority: "Normal",
    assignedSellerId: DR.id, assignedSellerName: DR.name,
    createdAt: "2026-06-25T12:00:00", lastContactedAt: "2026-06-27T10:00:00",
    nextFollowUpAt: "2026-06-29", // overdue
    quoteId: "QT-4095",
  }),

  // --- Andres Molina ---
  lead({
    id: "LD-2063", name: "Bianca Rossi", phone: "(786) 555-3390",
    email: "bianca.r@gmail.com", source: "Google Ads", stage: "Contacted",
    fromCity: "Kendall", toCity: "Miami Lakes", moveDate: "2026-07-17",
    estimatedValue: 1920, estimatedCuFt: 500, priority: "Normal",
    assignedSellerId: AM.id, assignedSellerName: AM.name,
    createdAt: "2026-06-29T15:30:00", lastContactedAt: "2026-07-01T11:00:00",
    nextFollowUpAt: "2026-07-05",
  }),
  lead({
    id: "LD-2064", name: "Devon Pierce", phone: "(305) 555-4412",
    email: "devon.p@outlook.com", source: "Referral", stage: "Quote Sent",
    fromCity: "Coral Gables", toCity: "Palmetto Bay", moveDate: "2026-07-21",
    estimatedValue: 3980, estimatedCuFt: 1050, priority: "High",
    assignedSellerId: AM.id, assignedSellerName: AM.name,
    createdAt: "2026-06-26T09:45:00", lastContactedAt: "2026-06-30T14:30:00",
    nextFollowUpAt: "2026-07-02", // due today
    quoteId: "QT-4100",
  }),
  lead({
    id: "LD-2065", name: "Grace Okafor", phone: "(786) 555-9932",
    email: "grace.o@gmail.com", source: "Repeat Customer", stage: "Booked",
    fromCity: "Aventura", toCity: "Sunny Isles", moveDate: "2026-07-09",
    estimatedValue: 2760, estimatedCuFt: 700, priority: "High",
    assignedSellerId: AM.id, assignedSellerName: AM.name,
    createdAt: "2026-06-23T11:20:00", lastContactedAt: "2026-06-30T15:00:00",
    quoteId: "QT-4088",
  }),

  // --- Closed (lost / cancelled) ---
  lead({
    id: "LD-2066", name: "Trevor Wallace", phone: "(305) 555-9921",
    email: "tw@gmail.com", source: "Walk-in", stage: "Lost",
    fromCity: "Brickell", toCity: "Downtown Miami", moveDate: "2026-06-28",
    estimatedValue: 920, estimatedCuFt: 240, priority: "Low",
    assignedSellerId: CE.id, assignedSellerName: CE.name,
    createdAt: "2026-06-18T13:18:00",
    notes: "Went with a cheaper competitor.",
  }),
  lead({
    id: "LD-2067", name: "Marcus DeWitt", phone: "(786) 555-1180",
    email: "m.dewitt@gmail.com", source: "Walk-in", stage: "Cancelled",
    fromCity: "Doral", toCity: "Pinecrest", moveDate: "2026-06-27",
    estimatedValue: 1820, estimatedCuFt: 460, priority: "Low",
    assignedSellerId: DR.id, assignedSellerName: DR.name,
    createdAt: "2026-06-19T09:00:00",
    notes: "Customer cancelled the move.",
  }),
];
