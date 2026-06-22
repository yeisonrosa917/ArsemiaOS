import Link from "next/link";
import { Mail, Phone, Plus, Search, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customers } from "@/lib/mock-data";
import { formatCurrency, initials } from "@/lib/utils";

const SEGMENT_VARIANT = {
  Residential: "info",
  Commercial: "violet",
  Repeat: "success",
} as const;

const STATUS_VARIANT = {
  Active: "success",
  Lead: "warning",
  Inactive: "slate",
} as const;

export default function CustomersPage() {
  const lifetimeValue = customers.reduce((s, c) => s + c.lifetimeValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Residential, commercial and repeat accounts — segmented by value and activity."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Import
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New customer
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total accounts" value={String(customers.length)} />
        <Stat
          label="Active customers"
          value={String(
            customers.filter((c) => c.status === "Active").length,
          )}
        />
        <Stat
          label="Open leads"
          value={String(customers.filter((c) => c.status === "Lead").length)}
        />
        <Stat label="Book value" value={formatCurrency(lifetimeValue)} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            {Object.keys(SEGMENT_VARIANT).map((s) => (
              <Badge
                key={s}
                variant={
                  SEGMENT_VARIANT[s as keyof typeof SEGMENT_VARIANT]
                }
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Jobs</TableHead>
              <TableHead className="text-right">Lifetime value</TableHead>
              <TableHead>Last job</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id} className="hover:bg-accent/30">
                <TableCell className="pl-5">
                  <Link
                    href={`/customers/${c.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-brand-500/15 text-[10px] text-brand-700 dark:text-brand-300">
                        {initials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.id}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-xs">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {c.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {c.phone}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={SEGMENT_VARIANT[c.segment]}>
                    {c.segment}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {c.totalJobs}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(c.lifetimeValue)}
                </TableCell>
                <TableCell className="text-xs">{c.lastJobDate}</TableCell>
                <TableCell className="pr-5">
                  <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}
