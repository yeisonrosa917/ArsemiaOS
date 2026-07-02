import { PageHeader } from "@/components/layout/page-header";
import { LeadsTable } from "@/components/leads/leads-table";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Database of every inbound prospect. Filter, assign to a seller, and act on follow-ups. Use the Pipeline for the visual board."
      />
      <LeadsTable />
    </div>
  );
}
