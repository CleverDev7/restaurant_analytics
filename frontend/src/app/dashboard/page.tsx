import { ChartPanel } from "@/components/ChartPanel";
import { DataTable } from "@/components/DataTable";
import { StatsCard } from "@/components/StatsCard";
import {
  fetchAnalyticsOverview,
  fetchBestItems,
  fetchInventoryValue,
  fetchPeakHours,
  fetchProfitMargins,
  fetchSalesTrend
} from "@/lib/api";

export default async function DashboardPage() {
  const [overview, salesTrend, bestItems, peakHours, profitMargins, inventoryValue] = await Promise.all([
    fetchAnalyticsOverview(),
    fetchSalesTrend(7),
    fetchBestItems(),
    fetchPeakHours(),
    fetchProfitMargins(7),
    fetchInventoryValue()
  ]);

  const ordersToday = overview.sales && overview.avgTicket ? Math.round(overview.sales / overview.avgTicket) : 0;
  const inventoryVal = inventoryValue?.inventoryCost ?? overview.inventoryCost;

  return (
    <main className="container-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Daily snapshot</p>
          <h1 className="text-3xl font-semibold text-white">{overview.date} – Profitability Control</h1>
        </div>
        <span className="rounded-full border border-green-400/60 px-3 py-1 text-xs text-green-200">Live</span>
      </div>

      <section className="grid-auto">
        <StatsCard label="Revenue Today" value={`$${overview.sales.toLocaleString()}`} helper="Gross revenue" />
        <StatsCard label="Orders Today" value={`${ordersToday}`} helper="Total tickets" />
        <StatsCard label="Average Order Value" value={`$${overview.avgTicket.toFixed(2)}`} helper="Sales / orders" />
        <StatsCard label="Inventory Value" value={`$${inventoryVal.toLocaleString()}`} helper="Purchases today" />
      </section>

      <section className="grid-auto">
        <ChartPanel
          title="Daily Sales Trend (last 7 days)"
          data={salesTrend}
          xKey="date"
          series={[{ name: "Sales", dataKey: "sales", color: "#8b5cf6" }]}
          kind="line"
        />
        <ChartPanel
          title="Best Selling Items"
          data={bestItems}
          xKey="name"
          series={[{ name: "Revenue", dataKey: "revenue", color: "#38bdf8" }]}
          kind="bar"
        />
      </section>

      <section className="grid-auto">
        <ChartPanel
          title="Peak Hours"
          data={peakHours}
          xKey="hour"
          series={[{ name: "Orders", dataKey: "orders", color: "#22c55e" }]}
          kind="bar"
        />
        <ChartPanel
          title="Profit Margins (last 7 days)"
          data={profitMargins}
          xKey="date"
          series={[{ name: "Profit Margin", dataKey: "profitMargin", color: "#fbbf24" }]}
          kind="line"
        />
      </section>

      <section className="grid-auto">
        <DataTable
          title="Best Selling Items"
          data={bestItems}
          columns={[
            { header: "Item", accessor: (row) => row.name },
            { header: "Qty", accessor: (row) => row.quantity },
            { header: "Revenue", accessor: (row) => `$${row.revenue.toLocaleString()}` }
          ]}
        />
        <DataTable
          title="Staff Performance"
          data={overview.staffPerformance}
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
