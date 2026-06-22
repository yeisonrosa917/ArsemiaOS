import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Plus,
  TrendingUp,
  Truck,
} from "lucide-react";
import { customers, jobs } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, initials } from "@/lib/utils";
import { fmtUSD } from "@/lib/calculator/engine";

export function generateStaticParams() {
  return customers.map((c) => ({ id: c.id }));
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customers.find((c) => c.id === id);
  if (!customer) notFound();

  // Surface jobs that match by customer name (mock — Phase 3 uses real FK)
  // Match by customerId FK (preferred). Fall back to exact name match only
  // for customers that don't yet have a FK populated.
  const customerJobs = jobs.filter(
    (j) => j.customerId === customer.id || (!j.customerId && j.customer === customer.name),
  );

  const lifetimeFromJobs = customerJobs.reduce((acc, j) => acc + j.price, 0);
  const completed = customerJobs.filter((j) => j.status === "Completed").length;
  const upcoming = customerJobs.filter(
    (j) => !["Completed", "Cancelled"].includes(j.status),
  ).length;
  const avgTicket =
    customerJobs.length > 0 ? lifetimeFromJobs / customerJobs.length : 0;

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/customers">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to customers
        </Link>
      </Button>

      <Card className="border-primary/20">
        <CardContent className="grid gap-4 p-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-brand-500/20 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {initials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{customer.name}</h1>
                  <Badge variant="outline">{customer.segment}</Badge>
                  <Badge
                    variant={
                      customer.status === "Active"
                        ? "success"
                        : customer.status === "Lead"
                          ? "warning"
                          : "slate"
                    }
                  >
                    {customer.status}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {customer.id}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> {customer.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {customer.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Last job {customer.lastJobDate}
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-2">
              <Stat
                label="Lifetime value"
                value={formatCurrency(customer.lifetimeValue)}
                icon={TrendingUp}
                primary
              />
              <Stat
                label="Total jobs"
                value={String(customer.totalJobs)}
                icon={Briefcase}
              />
              <Stat
                label="Avg ticket"
                value={fmtUSD(avgTicket)}
                icon={Truck}
              />
              <Stat
                label="In progress"
                value={String(upcoming)}
                icon={ClipboardList}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Job history
                </CardTitle>
                <CardDescription>
                  {customerJobs.length} job{customerJobs.length !== 1 ? "s" : ""}{" "}
                  · {fmtUSD(lifetimeFromJobs)} billed · {completed} completed
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-1">
                <Link
                  href={`/quotes?customer=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone)}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New quote
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {customerJobs.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
                  No jobs yet for this customer. Start with a new quote.
                </p>
              ) : (
                customerJobs
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledAt).getTime() -
                      new Date(b.scheduledAt).getTime(),
                  )
                  .map((j, i) => (
                    <div
                      key={j.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-[9px] font-semibold uppercase leading-none">
                          Move
                        </span>
                        <span className="font-mono text-sm font-bold leading-none">
                          #{i + 1}
                        </span>
                      </div>
                      <Link
                        href={`/jobs/${j.id}`}
                        className="min-w-0 flex-1 hover:underline"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {j.id}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {j.type}
                          </Badge>
                          {j.bedrooms && (
                            <Badge variant="outline" className="text-[10px]">
                              {j.bedrooms}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs">
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                          <span>{j.pickupCity}</span>
                          <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                          <span>{j.deliveryCity}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(j.scheduledAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · Foreman: {j.driverName ?? "—"} · {j.cuFt} CuFt
                        </p>
                      </Link>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold">
                          {formatCurrency(j.price)}
                        </p>
                        <JobStatusBadge status={j.status} />
                        <div className="mt-1">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-6 gap-1 px-2 text-[10px]"
                            title="Open the New Quote builder prefilled with this customer + job context"
                          >
                            <Link
                              href={{
                                pathname: "/quotes",
                                query: {
                                  customer: customer.name,
                                  customerId: customer.id,
                                  phone: customer.phone,
                                  email: customer.email,
                                  fromCity: j.pickupCity,
                                  toCity: j.deliveryCity,
                                  cuft: String(j.cuFt),
                                  jobType: j.type,
                                },
                              }}
                            >
                              Clone as new quote
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link
                  href={`/quotes?customer=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone)}`}
                >
                  <Plus className="h-4 w-4" />
                  New quote for this customer
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={`mailto:${customer.email}`}>
                  <Mail className="h-4 w-4" />
                  Send email
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={`tel:${customer.phone.replace(/\D/g, "")}`}>
                  <Phone className="h-4 w-4" />
                  Call customer
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account notes</CardTitle>
              <CardDescription>
                Visible to sellers and dispatchers. Foreman sees during job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="e.g. Prefers weekday moves, has 2 dogs, garage access from rear..."
                className="min-h-32 w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  primary,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-muted/20 p-2 ${primary ? "border-primary/40 bg-primary/[0.04]" : ""}`}
    >
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" /> {label}
      </p>
      <p
        className={`mt-0.5 font-mono text-lg font-bold ${primary ? "text-primary" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
