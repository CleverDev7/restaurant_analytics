import { ChartPanel } from "@/components/ChartPanel";
import { DataTable } from "@/components/DataTable";
import { StatsCard } from "@/components/StatsCard";
import { fetchAnalyticsOverview } from "@/lib/api";

export default async function DashboardPage() {
  const analytics = await fetchAnalyticsOverview();

  return (
    <main className="container-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Daily snapshot</p>
          <h1 className="text-3xl font-semibold text-white">{analytics.date} – Profitability Control</h1>
        </div>
        <span className="rounded-full border border-green-400/60 px-3 py-1 text-xs text-green-200">Live</span>
      </div>

      <section className="grid-auto">
        <StatsCard label="Daily Sales" value={`$${analytics.sales.toLocaleString()}`} helper="Gross revenue" />
        <StatsCard label="Profit Margin" value={`${(analytics.profitMargin * 100).toFixed(1)}%`} helper="After COGS & labor" />
        <StatsCard label="Inventory Cost" value={`$${analytics.inventoryCost.toLocaleString()}`} helper="COGS today" />
        <StatsCard label="Avg Ticket" value={`$${analytics.avgTicket.toFixed(2)}`} helper="Per customer" />
      </section>

      <section className="grid-auto">
        <ChartPanel
          title="Peak Hours"
          labels={analytics.peakHours.map((p) => p.hour)}
          dataset={[
            {
              label: "Orders",
              data: analytics.peakHours.map((p) => p.orders),
              backgroundColor: "rgba(99,102,241,0.45)",
              borderColor: "rgba(99,102,241,1)"
            }
          ]}
          kind="bar"
        />
        <ChartPanel
          title="Best Sellers (Revenue)"
          labels={analytics.bestSellers.map((i) => i.name)}
          dataset={[
            {
              label: "Revenue",
              data: analytics.bestSellers.map((i) => i.revenue),
              backgroundColor: "rgba(14,165,233,0.4)",
              borderColor: "rgba(14,165,233,1)"
            }
          ]}
          kind="bar"
        />
      </section>

      <section className="grid-auto">
        <DataTable
          title="Best Selling Items"
          data={analytics.bestSellers}
          columns={[
            { header: "Item", accessor: (row) => row.name },
            { header: "Qty", accessor: (row) => row.quantity },
            { header: "Revenue", accessor: (row) => `$${row.revenue.toLocaleString()}` }
          ]}
        />
        <DataTable
          title="Staff Performance"
          data={analytics.staffPerformance}
          columns={[
            { header: "Staff", accessor: (row) => row.name },
            { header: "Orders", accessor: (row) => row.ordersHandled },
            { header: "Upsell Rate", accessor: (row) => `${(row.upsellRate * 100).toFixed(1)}%` }
          ]}
        />
      </section>
    </main>
  );
}
