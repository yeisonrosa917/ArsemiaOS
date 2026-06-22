"use client";

import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Phone, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEADS } from "@/lib/data/leads";
import type { SalesStage } from "@/lib/types";
import { fmtUSD } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

interface SalesCard {
  id: string;
  stage: SalesStage;
  customerName: string;
  phone: string;
  email: string;
  fromCity: string;
  toCity: string;
  estimatedValue: number;
  estimatedCuFt?: number;
  assignedSeller?: string;
  daysInStage: number;
  source: string;
}

const SALES_STAGES: { id: SalesStage; label: string; description: string; accent: string }[] = [
  {
    id: "New Lead",
    label: "New Lead",
    description: "Just came in, not yet contacted.",
    accent: "from-blue-400/30 to-blue-500/10",
  },
  {
    id: "Contacted",
    label: "Contacted",
    description: "First touch made.",
    accent: "from-cyan-400/30 to-cyan-500/10",
  },
  {
    id: "Quote Requested",
    label: "Quote Requested",
    description: "Customer asked for pricing.",
    accent: "from-violet-400/30 to-violet-500/10",
  },
  {
    id: "Quote Drafted",
    label: "Quote Drafted",
    description: "Sales building the quote.",
    accent: "from-violet-400/30 to-violet-500/10",
  },
  {
    id: "Quote Sent",
    label: "Quote Sent",
    description: "Quote delivered to customer.",
    accent: "from-amber-400/30 to-amber-500/10",
  },
  {
    id: "Follow-Up Needed",
    label: "Follow-Up",
    description: "No response — needs nudge.",
    accent: "from-orange-400/30 to-orange-500/10",
  },
  {
    id: "Booked",
    label: "Booked",
    description: "Customer accepted; about to be a job.",
    accent: "from-emerald-400/30 to-emerald-500/10",
  },
  {
    id: "Converted to Job",
    label: "Converted",
    description: "Now a real job in Operations.",
    accent: "from-success/30 to-success/10",
  },
  {
    id: "Lost",
    label: "Lost",
    description: "Went with another mover.",
    accent: "from-rose-400/30 to-rose-500/10",
  },
  {
    id: "Cancelled",
    label: "Cancelled",
    description: "Customer cancelled their plan.",
    accent: "from-slate-400/30 to-slate-500/10",
  },
];

// Build initial cards from the leads seeds, mapping LeadStatus → SalesStage.
const LEAD_STATUS_TO_STAGE: Record<string, SalesStage> = {
  New: "New Lead",
  Contacted: "Contacted",
  "Quote Sent": "Quote Sent",
  Booked: "Booked",
  Lost: "Lost",
};

const SEED_CARDS: SalesCard[] = LEADS.map((l) => ({
  id: l.id,
  stage: LEAD_STATUS_TO_STAGE[l.status] ?? "New Lead",
  customerName: l.name,
  phone: l.phone,
  email: l.email,
  fromCity: l.fromCity,
  toCity: l.toCity,
  estimatedValue: l.estimatedValue,
  estimatedCuFt: l.estimatedCuFt,
  assignedSeller: l.assignedSeller,
  daysInStage: Math.max(
    1,
    Math.round((Date.now() - new Date(l.createdAt).getTime()) / 86400000),
  ),
  source: l.source,
}));

// Augment with a couple of synthetic cards to fill late-funnel stages
const EXTRA_CARDS: SalesCard[] = [
  {
    id: "OP-3001",
    stage: "Quote Requested",
    customerName: "Vanessa Tran",
    phone: "(305) 555-7811",
    email: "v.tran@gmail.com",
    fromCity: "Brickell",
    toCity: "Coral Gables",
    estimatedValue: 2150,
    estimatedCuFt: 540,
    assignedSeller: "Carlos Estevez",
    daysInStage: 1,
    source: "Website",
  },
  {
    id: "OP-3002",
    stage: "Quote Drafted",
    customerName: "Joseph Salinas",
    phone: "(786) 555-2042",
    email: "j.salinas@yahoo.com",
    fromCity: "Miami Beach",
    toCity: "Aventura",
    estimatedValue: 3290,
    estimatedCuFt: 820,
    assignedSeller: "Carlos Estevez",
    daysInStage: 2,
    source: "Referral",
  },
  {
    id: "OP-3003",
    stage: "Follow-Up Needed",
    customerName: "Khalid Stephens",
    phone: "(305) 555-8801",
    email: "k.stephens@gmail.com",
    fromCity: "Wynwood",
    toCity: "Hialeah",
    estimatedValue: 1480,
    estimatedCuFt: 320,
    assignedSeller: "Carlos Estevez",
    daysInStage: 5,
    source: "Yelp",
  },
  {
    id: "OP-3004",
    stage: "Converted to Job",
    customerName: "Sofia Martinez",
    phone: "(305) 555-3120",
    email: "sofia.m@gmail.com",
    fromCity: "Brickell",
    toCity: "Coral Gables",
    estimatedValue: 2480,
    estimatedCuFt: 640,
    assignedSeller: "Carlos Estevez",
    daysInStage: 0,
    source: "Website",
  },
  {
    id: "OP-3005",
    stage: "Cancelled",
    customerName: "Marcus DeWitt",
    phone: "(786) 555-9921",
    email: "m.dewitt@gmail.com",
    fromCity: "Doral",
    toCity: "Pinecrest",
    estimatedValue: 1820,
    estimatedCuFt: 460,
    assignedSeller: "Carlos Estevez",
    daysInStage: 3,
    source: "Walk-in",
  },
];

export default function SalesPipelinePage() {
  const [cards, setCards] = useState<SalesCard[]>([...SEED_CARDS, ...EXTRA_CARDS]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<SalesStage | null>(null);

  const groups = useMemo(() => {
    const g: Record<SalesStage, SalesCard[]> = {
      "New Lead": [],
      Contacted: [],
      "Quote Requested": [],
      "Quote Drafted": [],
      "Quote Sent": [],
      "Follow-Up Needed": [],
      Booked: [],
      "Converted to Job": [],
      Lost: [],
      Cancelled: [],
    };
    for (const c of cards) g[c.stage].push(c);
    return g;
  }, [cards]);

  const stats = useMemo(() => {
    const openStages: SalesStage[] = [
      "New Lead",
      "Contacted",
      "Quote Requested",
      "Quote Drafted",
      "Quote Sent",
      "Follow-Up Needed",
      "Booked",
    ];
    const open = cards.filter((c) => openStages.includes(c.stage));
    const wonValue = cards
      .filter((c) => c.stage === "Booked" || c.stage === "Converted to Job")
      .reduce((s, c) => s + c.estimatedValue, 0);
    const followUpCount = cards.filter((c) => c.stage === "Follow-Up Needed").length;
    return {
      openPipelineValue: open.reduce((s, c) => s + c.estimatedValue, 0),
      openCount: open.length,
      wonValue,
      followUpCount,
    };
  }, [cards]);

  const moveCard = (id: string, stage: SalesStage) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage, daysInStage: 0 } : c)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        description="Commercial funnel — from inbound lead to booked customer. Distinct from Operations (post-booking)."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Open pipeline value"
          value={fmtUSD(stats.openPipelineValue)}
          hint={`${stats.openCount} opportunities in flight`}
          accent="primary"
        />
        <Stat
          label="Won / Booked value"
          value={fmtUSD(stats.wonValue)}
          hint="Customer accepted"
          accent="success"
        />
        <Stat
          label="Follow-up needed"
          value={String(stats.followUpCount)}
          hint="Quote sent, no answer"
          accent="warning"
        />
        <Stat
          label="Total opportunities"
          value={String(cards.length)}
          hint="Across all stages"
        />
      </div>

      <div className="grid auto-rows-min grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {SALES_STAGES.map((stage) => {
          const items = groups[stage.id];
          const isTarget = dropTarget === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (dropTarget !== stage.id) setDropTarget(stage.id);
              }}
              onDragLeave={() => {
                if (dropTarget === stage.id) setDropTarget(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/sales-card-id");
                if (id) moveCard(id, stage.id);
                setDropTarget(null);
                setDragging(null);
              }}
              className={cn(
                "flex min-h-[260px] flex-col rounded-2xl border border-border bg-card/40 transition-colors",
                isTarget && "border-primary bg-primary/[0.04] shadow-elevated",
              )}
            >
              <div
                className={cn(
                  "rounded-t-2xl bg-gradient-to-br px-3 py-2.5",
                  stage.accent,
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {stage.label}
                  </p>
                  <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                    {items.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                  {stage.description}
                </p>
              </div>
              <div className="flex-1 space-y-1.5 p-2 scrollbar-thin overflow-y-auto max-h-[60vh]">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-3 text-center text-[10px] text-muted-foreground">
                    Drop a card here
                  </p>
                )}
                {items.map((c) => (
                  <Card
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/sales-card-id", c.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(c.id);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setDropTarget(null);
                    }}
                    className={cn(
                      "cursor-grab select-none border-border/60 transition-all active:cursor-grabbing",
                      dragging === c.id && "opacity-50 ring-2 ring-primary",
                    )}
                  >
                    <CardContent className="space-y-1.5 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-xs font-semibold">{c.customerName}</p>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold">
                          {fmtUSD(c.estimatedValue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{c.fromCity}</span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{c.toCity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Phone className="h-2.5 w-2.5 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <Badge variant="outline" className="text-[9px]">
                          {c.source}
                        </Badge>
                        {c.assignedSeller && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-2.5 w-2.5" />
                            {c.assignedSeller.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      {c.daysInStage > 2 &&
                        ["Follow-Up Needed", "Quote Sent"].includes(c.stage) && (
                          <p className="text-[9px] font-semibold text-warning">
                            ⚠ {c.daysInStage} days in stage
                          </p>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: "primary" | "success" | "warning";
}) {
  const c = {
    primary: "border-primary/40 text-primary",
    success: "border-success/40 text-success",
    warning: "border-warning/40 text-warning",
  }[accent ?? "primary"];
  return (
    <Card className={cn("border", accent ? c : "")}>
      <CardContent className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-mono text-xl font-bold">{value}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
