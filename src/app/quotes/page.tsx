import { PageHeader } from "@/components/layout/page-header";
import { QuoteBuilder } from "@/components/quotes/quote-builder";

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Quote"
        description="Build a customer quote with the moving calculator. CuFt minimums and audit-ready commissionable base computed live."
      />
      <QuoteBuilder />
    </div>
  );
}
