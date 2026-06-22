import Link from "next/link";
import { Briefcase, ClipboardList, Coins, Phone, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForemanPortalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Foreman Portal"
        description="Field role. The full Foreman App ships separately on mobile. Use the items below from the Hub in the meantime."
      />

      <Card className="border-primary/40 bg-primary/[0.04]">
        <CardContent className="flex items-start gap-4 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Smartphone className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Foreman App coming soon</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The full field experience — start/end job documents, pickup &
              delivery completion, inventory scanning, signature capture,
              expenses, claim evidence, truck inspections — will ship in the
              dedicated mobile app. Until then, you can view assigned jobs and
              your own payroll/expenses below.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <PortalLink
          href="/jobs"
          icon={ClipboardList}
          title="Assigned jobs"
          description="The jobs you are working today and this week."
        />
        <PortalLink
          href="/payroll"
          icon={Coins}
          title="My payroll"
          description="Your own commissions, week by week."
        />
        <PortalLink
          href="/expenses"
          icon={Briefcase}
          title="My expenses"
          description="Receipts you've submitted; reimbursement status."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need help?</CardTitle>
          <CardDescription>
            Your dispatcher is the first point of contact for any job change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="tel:3055550900">
              <Phone className="h-3.5 w-3.5" /> Call dispatch
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PortalLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/30"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
