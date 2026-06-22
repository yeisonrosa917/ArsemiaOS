export type LeadStatus =
  | "New"
  | "Contacted"
  | "Quote Sent"
  | "Booked"
  | "Lost";

export type LeadSource =
  | "Website"
  | "Yelp"
  | "Google Ads"
  | "Referral"
  | "Phone"
  | "Walk-in";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  estimatedCuFt: number;
  fromCity: string;
  toCity: string;
  scheduledDate?: string;
  notes?: string;
  assignedSeller?: string;
  createdAt: string;
  estimatedValue: number;
}

export const LEADS: Lead[] = [
  {
    id: "LD-2041",
    name: "Sofia Martinez",
    email: "sofia.m@gmail.com",
    phone: "(305) 555-3120",
    source: "Website",
    status: "New",
    estimatedCuFt: 480,
    fromCity: "Brickell",
    toCity: "Coral Gables",
    scheduledDate: "2026-07-05",
    notes: "2BR apartment, 3rd floor walk-up, has piano.",
    createdAt: "2026-06-22T09:14:00",
    estimatedValue: 1850,
  },
  {
    id: "LD-2042",
    name: "Ryan Cole",
    email: "ryan.cole@outlook.com",
    phone: "(786) 555-4421",
    source: "Yelp",
    status: "Contacted",
    estimatedCuFt: 720,
    fromCity: "Miami Beach",
    toCity: "Aventura",
    scheduledDate: "2026-07-12",
    notes: "Townhouse to townhouse. Lots of fragile art.",
    assignedSeller: "Carlos Estevez",
    createdAt: "2026-06-21T16:42:00",
    estimatedValue: 2640,
  },
  {
    id: "LD-2043",
    name: "Hayward Logistics (Branch 2)",
    email: "ops@haywardlog.com",
    phone: "(305) 555-9009",
    source: "Referral",
    status: "Quote Sent",
    estimatedCuFt: 1640,
    fromCity: "Hialeah",
    toCity: "Doral",
    scheduledDate: "2026-07-18",
    notes: "Commercial. Existing customer wants weekend slot.",
    assignedSeller: "Carlos Estevez",
    createdAt: "2026-06-19T11:05:00",
    estimatedValue: 6280,
  },
  {
    id: "LD-2044",
    name: "Elena Park",
    email: "e.park@me.com",
    phone: "(786) 555-2245",
    source: "Google Ads",
    status: "New",
    estimatedCuFt: 320,
    fromCity: "Wynwood",
    toCity: "Pinecrest",
    notes: "Studio. Wants packing service included.",
    createdAt: "2026-06-22T08:01:00",
    estimatedValue: 1190,
  },
  {
    id: "LD-2045",
    name: "Marcus Chen",
    email: "marcus.chen@gmail.com",
    phone: "(305) 555-7762",
    source: "Phone",
    status: "Booked",
    estimatedCuFt: 540,
    fromCity: "Coconut Grove",
    toCity: "Key Biscayne",
    scheduledDate: "2026-06-30",
    assignedSeller: "Carlos Estevez",
    createdAt: "2026-06-18T14:22:00",
    estimatedValue: 2120,
  },
  {
    id: "LD-2046",
    name: "Priya Sharma",
    email: "priya.sharma@yahoo.com",
    phone: "(786) 555-1184",
    source: "Yelp",
    status: "Quote Sent",
    estimatedCuFt: 880,
    fromCity: "Miami",
    toCity: "Tampa",
    scheduledDate: "2026-07-08",
    notes: "Long distance. Will need 2-day trip.",
    assignedSeller: "Carlos Estevez",
    createdAt: "2026-06-20T10:30:00",
    estimatedValue: 5840,
  },
  {
    id: "LD-2047",
    name: "Trevor Wallace",
    email: "tw@gmail.com",
    phone: "(305) 555-9921",
    source: "Walk-in",
    status: "Lost",
    estimatedCuFt: 240,
    fromCity: "Brickell",
    toCity: "Downtown Miami",
    notes: "Went with a cheaper competitor.",
    createdAt: "2026-06-15T13:18:00",
    estimatedValue: 920,
  },
  {
    id: "LD-2048",
    name: "Aria Williams",
    email: "aria.w@gmail.com",
    phone: "(786) 555-5510",
    source: "Website",
    status: "Contacted",
    estimatedCuFt: 410,
    fromCity: "North Miami",
    toCity: "Aventura",
    scheduledDate: "2026-07-15",
    assignedSeller: "Carlos Estevez",
    createdAt: "2026-06-21T18:55:00",
    estimatedValue: 1580,
  },
];
