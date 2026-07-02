export type ExpenseStatus =
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Reimbursed"
  | "Deducted"
  | "Needs Receipt";

export type ExpenseCategory =
  | "Gas"
  | "Hotel"
  | "Tolls"
  | "Parking"
  | "Packing Material"
  | "Truck Repair"
  | "Emergency Supplies"
  | "Rental Equipment";

export interface Expense {
  id: string;
  foremanName: string;
  foremanId: string;
  truckId: string;
  truckName: string;
  jobId?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  status: ExpenseStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reimbursedAt?: string;
  notes?: string;
  receiptUrl?: string;
}

export const EXPENSES: Expense[] = [
  {
    id: "EXP-M901",
    foremanName: "Marcus Reyes",
    foremanId: "FM-1042",
    truckId: "VEH-204",
    truckName: "Truck #04 - ISUZU NPR 20' - 2024 - Foreman Marcus",
    jobId: "JOB-M502",
    category: "Packing Material",
    amount: 84.75,
    date: "2026-07-01T18:20:00",
    status: "Approved",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-07-01T20:05:00",
    notes: "Extra moving blankets + shrink wrap for the Orlando long-distance load.",
  },
  {
    id: "EXP-2401",
    foremanName: "Marcus Reyes",
    foremanId: "FM-1042",
    truckId: "VEH-204",
    truckName: "Truck #04 - ISUZU NPR 20' - 2024 - Foreman Marcus",
    jobId: "JOB-10421",
    category: "Gas",
    amount: 87.32,
    date: "2026-06-22T07:14:00",
    status: "Approved",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-22T08:01:00",
    notes: "Full tank before Brickell → Coral Gables job.",
    receiptUrl: "/receipts/EXP-2401.jpg",
  },
  {
    id: "EXP-2402",
    foremanName: "Ravi Shankar",
    foremanId: "FM-1048",
    truckId: "VEH-230",
    truckName: "Truck #30 - Freightliner M2 26' - 2021 - Foreman Ravi",
    jobId: "JOB-10426",
    category: "Hotel",
    amount: 142.5,
    date: "2026-06-20T22:30:00",
    status: "Reimbursed",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-21T09:00:00",
    reimbursedAt: "2026-06-21T18:42:00",
    notes: "Overnight stay in Tampa for LD delivery.",
    receiptUrl: "/receipts/EXP-2402.jpg",
  },
  {
    id: "EXP-2403",
    foremanName: "Sofia Hernandez",
    foremanId: "FM-1043",
    truckId: "VEH-207",
    truckName: "Truck #07 - Mercedes Sprinter 170 - 2023 - Foreman Sofia",
    jobId: "JOB-10422",
    category: "Tolls",
    amount: 18.75,
    date: "2026-06-22T08:42:00",
    status: "Approved",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-22T10:15:00",
    notes: "SunPass tolls — Hialeah → Downtown.",
    receiptUrl: "/receipts/EXP-2403.jpg",
  },
  {
    id: "EXP-2404",
    foremanName: "Trevon Walker",
    foremanId: "FM-1044",
    truckId: "VEH-211",
    truckName: "Truck #11 - Freightliner M2 26' - 2022 - Foreman Trevon",
    jobId: "JOB-10423",
    category: "Packing Material",
    amount: 64.2,
    date: "2026-06-21T11:08:00",
    status: "Under Review",
    notes: "Extra moving blankets + shrink wrap for fragile items.",
    receiptUrl: "/receipts/EXP-2404.jpg",
  },
  {
    id: "EXP-2405",
    foremanName: "Anya Volkov",
    foremanId: "FM-1045",
    truckId: "VEH-215",
    truckName: "Truck #15 - Ford Transit 250 - 2023 - Foreman Anya",
    category: "Truck Repair",
    amount: 285.0,
    date: "2026-06-19T15:30:00",
    status: "Submitted",
    notes: "Brake pad replacement at Pep Boys, Brickell.",
  },
  {
    id: "EXP-2406",
    foremanName: "Jamal Carter",
    foremanId: "FM-1046",
    truckId: "VEH-220",
    truckName: "Truck #20 - ISUZU NPR 26' - 2025 - Foreman Jamal",
    jobId: "JOB-10429",
    category: "Parking",
    amount: 22.0,
    date: "2026-06-22T13:05:00",
    status: "Needs Receipt",
    notes: "Garage parking in Coral Gables — receipt lost.",
  },
  {
    id: "EXP-2407",
    foremanName: "Elena Park",
    foremanId: "FM-1047",
    truckId: "VEH-224",
    truckName: "Truck #24 - Mercedes Sprinter 144 - 2024 - Foreman Elena",
    jobId: "JOB-10427",
    category: "Emergency Supplies",
    amount: 38.4,
    date: "2026-06-21T16:50:00",
    status: "Approved",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-22T07:30:00",
    notes: "Customer's elevator pad missing — bought a replacement on the spot.",
    receiptUrl: "/receipts/EXP-2407.jpg",
  },
  {
    id: "EXP-2408",
    foremanName: "Marcus Reyes",
    foremanId: "FM-1042",
    truckId: "VEH-204",
    truckName: "Truck #04 - ISUZU NPR 20' - 2024 - Foreman Marcus",
    category: "Gas",
    amount: 76.18,
    date: "2026-06-19T07:30:00",
    status: "Reimbursed",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-19T18:00:00",
    reimbursedAt: "2026-06-20T09:00:00",
    receiptUrl: "/receipts/EXP-2408.jpg",
  },
  {
    id: "EXP-2409",
    foremanName: "Ravi Shankar",
    foremanId: "FM-1048",
    truckId: "VEH-230",
    truckName: "Truck #30 - Freightliner M2 26' - 2021 - Foreman Ravi",
    category: "Rental Equipment",
    amount: 95.0,
    date: "2026-06-18T10:00:00",
    status: "Deducted",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-19T14:20:00",
    notes: "Hand truck rental — flagged as personal use.",
  },
  {
    id: "EXP-2410",
    foremanName: "Sofia Hernandez",
    foremanId: "FM-1043",
    truckId: "VEH-207",
    truckName: "Truck #07 - Mercedes Sprinter 170 - 2023 - Foreman Sofia",
    category: "Hotel",
    amount: 159.0,
    date: "2026-06-17T22:00:00",
    status: "Rejected",
    reviewedBy: "Luis Mendoza",
    reviewedAt: "2026-06-18T11:00:00",
    notes: "Reason: Local job did not require overnight stay.",
  },
];
