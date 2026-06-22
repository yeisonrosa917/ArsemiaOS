import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { QuoteBuilder } from "@/components/quotes/quote-builder";

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Quote"
        description="Build a customer quote with the moving calculator. CuFt minimums and audit-ready commissionable base computed live."
      />
      <Suspense fallback={<QuoteBuilderFallback />}>
        <QuoteBuilder />
      </Suspense>
    </div>
  );
}

function QuoteBuilderFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="h-48 animate-pulse rounded-xl border border-border bg-muted/20" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/20" />
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-border bg-muted/20" />
    </div>
  );
}
