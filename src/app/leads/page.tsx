import { PageHeader } from "@/components/layout/page-header";
import { LeadsTable } from "@/components/leads/leads-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Inbound prospects from your website, Yelp, Google Ads, referrals, and walk-ins. Convert qualified leads into quotes."
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New lead
          </Button>
        }
      />
      <LeadsTable />
    </div>
  );
}
