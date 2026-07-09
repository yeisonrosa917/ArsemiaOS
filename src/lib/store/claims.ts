"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ClaimStatus =
  | "New"
  | "Under Review"
  | "Waiting for Foreman"
  | "Waiting for Customer"
  | "Waiting for Evidence"
  | "Foreman Response Needed"
  | "Insurance Review"
  | "Approved"
  | "Denied"
  | "Rejected"
  | "Deduction Pending"
  | "Reimbursed"
  | "Deducted"
  | "Resolved"
  | "Closed";

/** The statuses a handler can pick, in workflow order. */
export const CLAIM_STATUSES: ClaimStatus[] = [
  "New",
  "Under Review",
  "Waiting for Foreman",
  "Waiting for Customer",
  "Waiting for Evidence",
  "Approved",
  "Denied",
  "Deduction Pending",
  "Resolved",
  "Closed",
];

/** Statuses that count as still-open / needing work. */
export const OPEN_CLAIM_STATUSES: ClaimStatus[] = [
  "New",
  "Under Review",
  "Waiting for Foreman",
  "Waiting for Customer",
  "Waiting for Evidence",
  "Foreman Response Needed",
  "Insurance Review",
  "Deduction Pending",
];

export type ClaimPriority = "Low" | "Normal" | "High" | "Urgent";
export const CLAIM_PRIORITIES: ClaimPriority[] = ["Low", "Normal", "High", "Urgent"];

export const CLAIM_STATUS_STYLE: Record<ClaimStatus, string> = {
  New: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Under Review": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "Waiting for Foreman": "bg-orange-500/15 text-orange-700 border-orange-500/30",
  "Waiting for Customer": "bg-violet-500/15 text-violet-700 border-violet-500/30",
  "Waiting for Evidence": "bg-rose-500/15 text-rose-700 border-rose-500/30",
  "Foreman Response Needed": "bg-orange-500/15 text-orange-700 border-orange-500/30",
  "Insurance Review": "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
  Approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Denied: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Rejected: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  "Deduction Pending": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Reimbursed: "bg-success/15 text-success border-success/30",
  Deducted: "bg-fuchsia-500/15 text-fuchsia-700 border-fuchsia-500/30",
  Resolved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Closed: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

export const CLAIM_PRIORITY_STYLE: Record<ClaimPriority, string> = {
  Low: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  Normal: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  High: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Urgent: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};

export type ClaimMessageKind =
  | "customer_message"
  | "internal_note"
  | "foreman_response"
  | "claims_message"
  | "dispatch_note"
  | "system_event"
  | "evidence_uploaded"
  | "status_changed"
  | "resolution";

/** Who is allowed to see a message when the customer/foreman apps exist later. */
export type ClaimVisibility = "internal" | "customer" | "foreman" | "claims_team";

export interface ClaimMessage {
  id: string;
  kind: ClaimMessageKind;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
  visibility: ClaimVisibility;
  /** Placeholder count of attachments until Storage is wired. */
  attachments?: number;
}

export type ClaimType =
  | "Scratched Wall"
  | "Broken Dresser"
  | "Cracked TV"
  | "Damaged Floor"
  | "Broken Table"
  | "Missing Box"
  | "Elevator Damage"
  | "Furniture Damage"
  | "Lost Item";

export interface ClaimEvidence {
  id: string;
  side: "customer" | "foreman" | "internal" | "insurance";
  kind: "photo" | "note" | "document" | "video";
  caption: string;
  placeholderTone: "rose" | "amber" | "slate" | "emerald" | "violet" | "cyan";
  uploadedBy: string;
  uploadedAt: string;
  /** When kind === "note" or "document", store the text. */
  body?: string;
}

export interface Claim {
  id: string;
  customerName: string;
  customerId?: string;
  jobId: string;
  foremanName: string;
  foremanId: string;
  truckName: string;
  truckId: string;
  claimType: ClaimType;
  claimAmount: number;
  status: ClaimStatus;
  assignedReviewer: string;
  openedAt: string;
  evidence: ClaimEvidence[];
  internalReviewNote?: string;
  insuranceNote?: string;
  resolutionNote?: string;
  reimbursedAmount?: number;
  deductedAmount?: number;
  // Gmail-style thread additions (hydrated at store init when absent).
  priority?: ClaimPriority;
  read?: boolean;
  messages?: ClaimMessage[];
  /** Optional connections used by the thread header. */
  invoiceId?: string;
  expenseId?: string;
}

const SEED: Claim[] = [
  {
    id: "CLM-1001",
    customerName: "Sofia Martinez",
    customerId: "CUS-401",
    jobId: "JOB-10421",
    foremanName: "Marcus Reyes",
    foremanId: "FM-1042",
    truckName: "Truck #04 - ISUZU NPR 20'",
    truckId: "VEH-204",
    claimType: "Scratched Wall",
    claimAmount: 450,
    status: "Foreman Response Needed",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-22T15:14:00",
    evidence: [
      {
        id: "ev_c1",
        side: "customer",
        kind: "photo",
        caption: "Wall scratch near elevator on delivery floor",
        placeholderTone: "rose",
        uploadedBy: "Sofia Martinez",
        uploadedAt: "2026-06-22T15:14:00",
      },
      {
        id: "ev_c2",
        side: "customer",
        kind: "photo",
        caption: "Close-up of damage",
        placeholderTone: "rose",
        uploadedBy: "Sofia Martinez",
        uploadedAt: "2026-06-22T15:15:00",
      },
      {
        id: "ev_c3",
        side: "customer",
        kind: "note",
        caption: "Customer statement",
        placeholderTone: "slate",
        uploadedBy: "Sofia Martinez",
        uploadedAt: "2026-06-22T15:18:00",
        body: "The wall was perfectly fine before the crew brought up the dresser. They scratched it while turning the corner.",
      },
    ],
  },
  {
    id: "CLM-1002",
    customerName: "Lucas Beltran",
    customerId: "CUS-409",
    jobId: "JOB-10429",
    foremanName: "Jamal Carter",
    foremanId: "FM-1046",
    truckName: "Truck #20 - ISUZU NPR 26'",
    truckId: "VEH-220",
    claimType: "Broken Dresser",
    claimAmount: 1200,
    status: "Insurance Review",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-21T10:42:00",
    evidence: [
      {
        id: "ev_d1",
        side: "customer",
        kind: "photo",
        caption: "Dresser drawer cracked at delivery",
        placeholderTone: "amber",
        uploadedBy: "Lucas Beltran",
        uploadedAt: "2026-06-21T10:42:00",
      },
      {
        id: "ev_d2",
        side: "foreman",
        kind: "photo",
        caption: "Pre-existing crack — photo taken at pickup",
        placeholderTone: "emerald",
        uploadedBy: "Jamal Carter",
        uploadedAt: "2026-06-21T08:30:00",
      },
      {
        id: "ev_d3",
        side: "foreman",
        kind: "note",
        caption: "Foreman defense statement",
        placeholderTone: "emerald",
        uploadedBy: "Jamal Carter",
        uploadedAt: "2026-06-21T11:10:00",
        body: "I documented the crack at pickup. The customer signed the inventory acknowledging pre-existing damage.",
      },
      {
        id: "ev_d4",
        side: "foreman",
        kind: "document",
        caption: "Signed pickup inventory with damage note",
        placeholderTone: "emerald",
        uploadedBy: "Jamal Carter",
        uploadedAt: "2026-06-21T11:12:00",
        body: "Signed pickup inventory document (placeholder).",
      },
    ],
    internalReviewNote: "Foreman provided strong pre-existing damage evidence. Forwarding to insurance.",
  },
  {
    id: "CLM-1003",
    customerName: "Mia Patel",
    customerId: "CUS-407",
    jobId: "JOB-10427",
    foremanName: "Elena Park",
    foremanId: "FM-1047",
    truckName: "Truck #24 - Mercedes Sprinter 144",
    truckId: "VEH-224",
    claimType: "Cracked TV",
    claimAmount: 850,
    status: "Under Review",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-22T09:00:00",
    evidence: [
      {
        id: "ev_t1",
        side: "customer",
        kind: "photo",
        caption: "55\" TV with cracked screen",
        placeholderTone: "rose",
        uploadedBy: "Mia Patel",
        uploadedAt: "2026-06-22T09:00:00",
      },
      {
        id: "ev_t2",
        side: "customer",
        kind: "photo",
        caption: "TV box without protective padding",
        placeholderTone: "rose",
        uploadedBy: "Mia Patel",
        uploadedAt: "2026-06-22T09:02:00",
      },
    ],
  },
  {
    id: "CLM-1004",
    customerName: "Ava Aronson",
    customerId: "CUS-418",
    jobId: "JOB-10438",
    foremanName: "Ravi Shankar",
    foremanId: "FM-1048",
    truckName: "Truck #30 - Freightliner M2 26'",
    truckId: "VEH-230",
    claimType: "Missing Box",
    claimAmount: 300,
    status: "Reimbursed",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-20T17:30:00",
    evidence: [
      {
        id: "ev_m1",
        side: "customer",
        kind: "note",
        caption: "Customer reported missing box",
        placeholderTone: "amber",
        uploadedBy: "Ava Aronson",
        uploadedAt: "2026-06-20T17:30:00",
        body: "Box marked KITCHEN-7 not delivered. Contains glassware.",
      },
      {
        id: "ev_m2",
        side: "internal",
        kind: "document",
        caption: "Inventory reconciliation",
        placeholderTone: "violet",
        uploadedBy: "Andrea Velazquez",
        uploadedAt: "2026-06-20T18:45:00",
        body: "Box found in storage facility, returned to customer next day. Reimbursement issued for inconvenience.",
      },
    ],
    reimbursedAmount: 150,
    resolutionNote: "Box recovered and delivered. $150 inconvenience reimbursement.",
  },
  {
    id: "CLM-1005",
    customerName: "Noah Goldstein",
    customerId: "CUS-419",
    jobId: "JOB-10439",
    foremanName: "Jamal Carter",
    foremanId: "FM-1046",
    truckName: "Truck #20 - ISUZU NPR 26'",
    truckId: "VEH-220",
    claimType: "Damaged Floor",
    claimAmount: 2500,
    status: "Waiting for Evidence",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-23T08:00:00",
    evidence: [
      {
        id: "ev_f1",
        side: "customer",
        kind: "photo",
        caption: "Hardwood floor scratch in living room",
        placeholderTone: "rose",
        uploadedBy: "Noah Goldstein",
        uploadedAt: "2026-06-23T08:00:00",
      },
    ],
  },
  {
    id: "CLM-1006",
    customerName: "Isabella Fernandez",
    customerId: "CUS-405",
    jobId: "JOB-10426",
    foremanName: "Ravi Shankar",
    foremanId: "FM-1048",
    truckName: "Truck #30 - Freightliner M2 26'",
    truckId: "VEH-230",
    claimType: "Elevator Damage",
    claimAmount: 600,
    status: "Closed",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-15T14:00:00",
    evidence: [
      {
        id: "ev_e1",
        side: "internal",
        kind: "note",
        caption: "Resolution",
        placeholderTone: "violet",
        uploadedBy: "Andrea Velazquez",
        uploadedAt: "2026-06-16T11:00:00",
        body: "Building manager confirmed damage was pre-existing. Claim closed without charge to Arsemia.",
      },
    ],
    resolutionNote: "Pre-existing damage. Closed.",
  },
];

const now = () => new Date().toISOString();
const mid = () => `msg_${Math.random().toString(36).slice(2, 9)}`;

const SIDE_TO_MSG: Record<ClaimEvidence["side"], { kind: ClaimMessageKind; role: string; visibility: ClaimVisibility }> = {
  customer: { kind: "customer_message", role: "Customer", visibility: "customer" },
  foreman: { kind: "foreman_response", role: "Foreman", visibility: "foreman" },
  internal: { kind: "internal_note", role: "Claims", visibility: "internal" },
  insurance: { kind: "claims_message", role: "Insurance", visibility: "claims_team" },
};

/** Build an initial thread for a seed claim from its evidence + status. */
function buildSeedMessages(c: Claim): ClaimMessage[] {
  const msgs: ClaimMessage[] = [
    {
      id: mid(),
      kind: "system_event",
      authorName: "System",
      authorRole: "System",
      body: `Claim opened — ${c.claimType} · ${c.customerName} · job ${c.jobId}.`,
      createdAt: c.openedAt,
      visibility: "internal",
    },
  ];
  c.evidence.forEach((ev) => {
    const map = SIDE_TO_MSG[ev.side];
    if (ev.kind === "note" && ev.body) {
      msgs.push({
        id: mid(),
        kind: map.kind,
        authorName: ev.uploadedBy,
        authorRole: map.role,
        body: ev.body,
        createdAt: ev.uploadedAt,
        visibility: map.visibility,
      });
    } else {
      msgs.push({
        id: mid(),
        kind: "evidence_uploaded",
        authorName: ev.uploadedBy,
        authorRole: map.role,
        body: `${ev.kind === "photo" ? "Photo" : ev.kind === "document" ? "Document" : "Attachment"}: ${ev.caption}`,
        createdAt: ev.uploadedAt,
        visibility: map.visibility,
        attachments: 1,
      });
    }
  });
  if (c.resolutionNote) {
    msgs.push({
      id: mid(),
      kind: "resolution",
      authorName: c.assignedReviewer,
      authorRole: "Claims",
      body: c.resolutionNote,
      createdAt: c.openedAt,
      visibility: "internal",
    });
  }
  return msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function inferPriority(c: Claim): ClaimPriority {
  if (c.claimAmount >= 2000) return "Urgent";
  if (c.claimAmount >= 1000) return "High";
  if (c.claimAmount >= 400) return "Normal";
  return "Low";
}

function hydrateClaim(c: Claim): Claim {
  return {
    ...c,
    priority: c.priority ?? inferPriority(c),
    read: c.read ?? true,
    messages: c.messages ?? buildSeedMessages(c),
  };
}

/** Does a claim still need a piece of evidence to proceed? */
export function claimEvidenceMissing(c: Claim): boolean {
  return c.status === "Waiting for Evidence" || c.evidence.length === 0;
}

/** Is the claim currently waiting on someone to respond? */
export function claimAwaitingResponse(c: Claim): boolean {
  return (
    c.status === "Waiting for Foreman" ||
    c.status === "Foreman Response Needed" ||
    c.status === "Waiting for Customer" ||
    c.status === "Waiting for Evidence"
  );
}

interface AddMessageInput {
  kind: ClaimMessageKind;
  body: string;
  visibility: ClaimVisibility;
  authorName: string;
  authorRole: string;
}

interface ClaimsState {
  items: Claim[];
  setStatus: (id: string, status: ClaimStatus, by: string) => Claim | undefined;
  addEvidence: (id: string, evidence: Omit<ClaimEvidence, "id" | "uploadedAt">) => Claim | undefined;
  setInternalNote: (id: string, note: string) => void;
  setResolutionNote: (id: string, note: string, by: string) => void;
  addMessage: (id: string, msg: AddMessageInput) => Claim | undefined;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  setPriority: (id: string, priority: ClaimPriority) => void;
  assignHandler: (id: string, handler: string, by: string) => Claim | undefined;
  requestForemanResponse: (id: string, by: string) => Claim | undefined;
  requestEvidence: (id: string, by: string) => Claim | undefined;
  getById: (id: string) => Claim | undefined;
}

export const useClaims = create<ClaimsState>()(
  persist(
    (set, get) => {
      const appendMessage = (c: Claim, m: Omit<ClaimMessage, "id" | "createdAt">): Claim => ({
        ...c,
        messages: [...(c.messages ?? []), { ...m, id: mid(), createdAt: now() }],
      });

      return {
        items: SEED.map(hydrateClaim),

        setStatus: (id, status, by) => {
          let updated: Claim | undefined;
          set((s) => ({
            items: s.items.map((c) => {
              if (c.id !== id) return c;
              updated = appendMessage({ ...c, status, read: false }, {
                kind: "status_changed",
                authorName: by,
                authorRole: "Claims",
                body: `Status changed to ${status}.`,
                visibility: "internal",
              });
              return updated;
            }),
          }));
          return updated;
        },

        addEvidence: (id, ev) => {
          let updated: Claim | undefined;
          set((s) => ({
            items: s.items.map((c) => {
              if (c.id !== id) return c;
              const newEv: ClaimEvidence = {
                ...ev,
                id: `ev_${Math.random().toString(36).slice(2, 9)}`,
                uploadedAt: now(),
              };
              updated = appendMessage(
                { ...c, evidence: [...c.evidence, newEv], read: false },
                {
                  kind: "evidence_uploaded",
                  authorName: ev.uploadedBy,
                  authorRole: SIDE_TO_MSG[ev.side].role,
                  body: `${ev.kind === "photo" ? "Photo" : ev.kind === "document" ? "Document" : "Attachment"}: ${ev.caption}`,
                  visibility: SIDE_TO_MSG[ev.side].visibility,
                  attachments: 1,
                },
              );
              return updated;
            }),
          }));
          return updated;
        },

        setInternalNote: (id, note) =>
          set((s) => ({
            items: s.items.map((c) =>
              c.id === id ? { ...c, internalReviewNote: note } : c,
            ),
          })),

        setResolutionNote: (id, note, by) =>
          set((s) => ({
            items: s.items.map((c) =>
              c.id === id
                ? appendMessage(
                    { ...c, resolutionNote: note, status: "Resolved", read: false },
                    { kind: "resolution", authorName: by, authorRole: "Claims", body: note, visibility: "internal" },
                  )
                : c,
            ),
          })),

        addMessage: (id, msg) => {
          let updated: Claim | undefined;
          set((s) => ({
            items: s.items.map((c) => {
              if (c.id !== id) return c;
              updated = appendMessage({ ...c, read: false }, {
                kind: msg.kind,
                authorName: msg.authorName,
                authorRole: msg.authorRole,
                body: msg.body,
                visibility: msg.visibility,
              });
              return updated;
            }),
          }));
          return updated;
        },

        markRead: (id) =>
          set((s) => ({ items: s.items.map((c) => (c.id === id ? { ...c, read: true } : c)) })),
        markUnread: (id) =>
          set((s) => ({ items: s.items.map((c) => (c.id === id ? { ...c, read: false } : c)) })),
        setPriority: (id, priority) =>
          set((s) => ({ items: s.items.map((c) => (c.id === id ? { ...c, priority } : c)) })),

        assignHandler: (id, handler, by) => {
          let updated: Claim | undefined;
          set((s) => ({
            items: s.items.map((c) => {
              if (c.id !== id) return c;
              updated = appendMessage({ ...c, assignedReviewer: handler }, {
                kind: "system_event",
                authorName: by,
                authorRole: "Claims",
                body: `Handler assigned to ${handler}.`,
                visibility: "internal",
              });
              return updated;
            }),
          }));
          return updated;
        },

        requestForemanResponse: (id, by) => {
          let updated: Claim | undefined;
          set((s) => ({
            items: s.items.map((c) => {
              if (c.id !== id) return c;
              updated = appendMessage({ ...c, status: "Waiting for Foreman", read: false }, {
                kind: "system_event",
                authorName: by,
                authorRole: "Claims",
                body: `Foreman response requested from ${c.foremanName}.`,
                visibility: "foreman",
              });
              return updated;
            }),
          }));
          return updated;
        },

        requestEvidence: (id, by) => {
          let updated: Claim | undefined;
          set((s) => ({
            items: s.items.map((c) => {
              if (c.id !== id) return c;
              updated = appendMessage({ ...c, status: "Waiting for Evidence", read: false }, {
                kind: "system_event",
                authorName: by,
                authorRole: "Claims",
                body: "Additional evidence requested.",
                visibility: "internal",
              });
              return updated;
            }),
          }));
          return updated;
        },

        getById: (id) => get().items.find((c) => c.id === id),
      };
    },
    {
      name: "arsemia.claims.v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
