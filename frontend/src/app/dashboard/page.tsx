import { ChartPanel } from "@/components/ChartPanel";
import { ExportButtons } from "@/components/ExportButtons";
import {
  fetchAnalyticsOverview,
  fetchBestItems,
  fetchPeakHours,
  fetchProfitMargins,
  fetchSalesTrend
} from "@/lib/api";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const numberFmt = new Intl.NumberFormat("en-US");

type ComparisonRow = { label: string; current: number; lastYear: number; delta: number };
type DayPart = { name: string; value: number; percent: number; color: string; accent: string; icon: string };
type Channel = { name: string; value: number; color: string; icon: string; orders: number };
type Quadrant = { name: string; value: number; percent: number; color: string };

export default async function DashboardPage() {
  const [overview, salesTrend, bestItems, peakHours, profitMargins] = await Promise.all([
    fetchAnalyticsOverview(),
    fetchSalesTrend(7),
    fetchBestItems(),
    fetchPeakHours(),
    fetchProfitMargins(7)
  ]);

  const ordersToday = overview.sales && overview.avgTicket ? Math.round(overview.sales / overview.avgTicket) : 0;
  const mtdRevenue = salesTrend.reduce((sum, d) => sum + d.sales, 0);
  const mtdOrders = salesTrend.reduce((sum, d) => sum + d.orders, 0);

  const todayVsLastYear: ComparisonRow[] = [
    { label: "Restaurant B", current: 47000, lastYear: 42000, delta: 11 },
    { label: "Restaurant C", current: 38500, lastYear: 38000, delta: 1 },
    { label: "Restaurant D", current: 51000, lastYear: 44000, delta: 16 }
  ];

  const currentMonthVsLastYear: ComparisonRow[] = [
    { label: "Restaurant B", current: 186000, lastYear: 168000, delta: 11 },
    { label: "Restaurant C", current: 150500, lastYear: 149000, delta: 1 },
    { label: "Restaurant D", current: 198700, lastYear: 178000, delta: 16 }
  ];

  const currentYearVsLastYear: ComparisonRow[] = [
    { label: "Restaurant B", current: 2100000, lastYear: 1910000, delta: 11 },
    { label: "Restaurant C", current: 1850000, lastYear: 1830000, delta: 1 },
    { label: "Restaurant D", current: 2240000, lastYear: 1930000, delta: 16 }
  ];

  const dayParts: DayPart[] = [
    { name: "Breakfast", value: 40889, percent: 10, color: "bg-sky-100", accent: "bg-sky-500", icon: "BF" },
    { name: "Lunch", value: 159510, percent: 40, color: "bg-amber-100", accent: "bg-amber-500", icon: "LN" },
    { name: "Dinner", value: 200524, percent: 50, color: "bg-rose-100", accent: "bg-rose-500", icon: "DN" }
  ];

  const menuItems = bestItems.map((item) => ({
    name: item.name,
    cm: Math.round(item.revenue * (overview.profitMargin ?? 0.3)),
    sold: item.quantity
  }));
  const maxCm = menuItems.reduce((max, item) => Math.max(max, item.cm), 1);
  const maxSold = menuItems.reduce((max, item) => Math.max(max, item.sold), 1);

  const channels: Channel[] = [
    { name: "Car hop", value: 13347, color: "#0ea5e9", icon: "CH", orders: 9 },
    { name: "Take away", value: 1008, color: "#f59e0b", icon: "TA", orders: 2 },
    { name: "Delivery", value: 27941, color: "#10b981", icon: "DL", orders: 14 },
    { name: "Google", value: 12, color: "#3b82f6", icon: "G", orders: 12 },
    { name: "TripAdvisor", value: 11, color: "#84cc16", icon: "TR", orders: 11 },
    { name: "Zomato", value: 11, color: "#ef4444", icon: "ZO", orders: 11 }
  ];

  const quadrants: Quadrant[] = [
    { name: "Star", value: 9, percent: 33, color: "bg-emerald-500" },
    { name: "Puzzle", value: 2, percent: 7, color: "bg-amber-500" },
    { name: "Plow Horse", value: 7, percent: 26, color: "bg-orange-500" },
    { name: "Dog", value: 9, percent: 33, color: "bg-rose-500" }
  ];

  const contribution = { high: 16, low: 11 };
  const menuMix = { high: 16, low: 11 };

  return (
    <main className="container-page space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Weekly Sales Report</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Multi-Restaurant Performance</h1>
          <p className="text-sm text-slate-500">Updated {overview.date} - Profitability Control</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons
            date={overview.date}
            revenue={overview.sales}
            orders={ordersToday}
            avgTicket={overview.avgTicket}
            profitMargin={overview.profitMargin}
            bestSellers={bestItems}
            staffPerformance={overview.staffPerformance}
            customerPatterns={overview.customerPatterns}
          />
        </div>
      </div>

      <section className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {["Rest A", "Rest B", "Rest C", "Rest D", "Rest E"].map((r, idx) => (
            <span
              key={r}
              className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                idx === 0
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {r}
            </span>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          {["W1", "W2", "W3", "W4", "W5"].map((w, idx) => (
            <span
              key={w}
              className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                idx === 0
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Month to Date" value={currency.format(mtdRevenue)} helper="Net Sales Value" accent="emerald" />
            <KpiCard label="Number Sold" value={numberFmt.format(mtdOrders)} helper="All Locations" accent="amber" />
            <KpiCard label="Total Items" value={numberFmt.format(bestItems.length * 20 + 7)} helper="Menu Count" accent="sky" />
            <KpiCard label="Menu C.M." value={currency.format(overview.inventoryCost)} helper="Cost of Menu" accent="rose" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Checks" value={numberFmt.format(1494)} helper="808 Avg." />
            <MiniStat label="Customers" value={numberFmt.format(1454)} helper="827 Avg." />
            <MiniStat label="Menu Revenue" value={currency.format(overview.sales)} helper="Today" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DonutCard title="Contributions Margin" high={contribution.high} low={contribution.low} color="#22c55e" />
            <DonutCard title="Menu Mix" high={menuMix.high} low={menuMix.low} color="#f97316" />
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Sales vs Last Year</h3>
              <p className="text-sm text-slate-500">Average Checks / Net Sales Value</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ComparisonBlock title="Today vs Last Year" data={todayVsLastYear} color="bg-amber-500" />
              <ComparisonBlock title="Current Month vs Last Year" data={currentMonthVsLastYear} color="bg-orange-500" />
              <ComparisonBlock title="Current Year vs Last Year" data={currentYearVsLastYear} color="bg-emerald-600" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {dayParts.map((part) => (
              <DayPartCard key={part.name} part={part} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Menu Mix - Top Items</h3>
                <p className="text-xs text-slate-500">CM vs Units Sold</p>
              </div>
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <MenuItemBar key={item.name} item={item} maxCm={maxCm} maxSold={maxSold} />
                ))}
              </div>
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Channels</h3>
                <p className="text-xs text-slate-500">Value and Orders</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {channels.map((channel) => (
                  <ChannelBadge key={channel.name} channel={channel} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {quadrants.map((q) => (
                  <QuadrantBar key={q.name} quadrant={q} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4">
          <ChartPanel
            title="Daily Sales Trend"
            data={salesTrend}
            xKey="date"
            series={[{ name: "Sales", dataKey: "sales", color: "#22c55e" }]}
            kind="line"
            height={220}
          />
          <ChartPanel
            title="Peak Hours"
            data={peakHours}
            xKey="hour"
            series={[{ name: "Orders", dataKey: "orders", color: "#0ea5e9" }]}
            kind="bar"
            height={220}
          />
          <ChartPanel
            title="Profit Margins (7d)"
            data={profitMargins}
            xKey="date"
            series={[{ name: "Profit Margin", dataKey: "profitMargin", color: "#f97316" }]}
            kind="line"
            height={220}
          />
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  helper,
  accent
}: {
  label: string;
  value: string;
  helper: string;
  accent: "emerald" | "amber" | "sky" | "rose";
}) {
  const colorMap: Record<"emerald" | "amber" | "sky" | "rose", string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200"
  };
  return (
    <div className={`card p-4 border ${colorMap[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function MiniStat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function DonutCard({ title, high, low, color }: { title: string; high: number; low: number; color: string }) {
  const total = high + low;
  const highPct = Math.round((high / total) * 100);
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className="relative h-24 w-24 rounded-full"
        style={{
          background: `conic-gradient(${color} ${highPct}%, #e2e8f0 ${highPct}% 100%)`
        }}
      >
        <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
          <span className="text-lg font-semibold text-slate-900">{highPct}%</span>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          <LegendDot label="High" value={high} color={color} />
          <LegendDot label="Low" value={low} color="#94a3b8" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-slate-600">{label}</span>
      <span className="ml-auto text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ComparisonBlock({ title, data, color }: { title: string; data: ComparisonRow[]; color: string }) {
  const maxVal = Math.max(...data.map((d) => d.current), ...data.map((d) => d.lastYear));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </div>
      <div className="mt-3 space-y-3">
        {data.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center text-sm text-slate-700">
              <span>{row.label}</span>
              <span className="ml-auto text-xs text-emerald-600 font-semibold">{row.delta}%</span>
            </div>
            <div className="h-12 rounded-lg bg-slate-100 p-2 flex flex-col justify-between">
              <BarPair label="Net Sales Value" current={row.current} lastYear={row.lastYear} max={maxVal} color={color} />
              <BarPair label="No of Checks" current={row.current * 0.45} lastYear={row.lastYear * 0.42} max={maxVal} color={color} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarPair({
  label,
  current,
  lastYear,
  max,
  color
}: {
  label: string;
  current: number;
  lastYear: number;
  max: number;
  color: string;
}) {
  const currentPct = Math.max(5, Math.round((current / max) * 100));
  const lastPct = Math.max(5, Math.round((lastYear / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 w-24">{label}</span>
      <div className="flex-1 flex gap-1 items-center">
        <div className="h-2 rounded-full bg-slate-300/80" style={{ width: `${lastPct}%` }} />
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${currentPct}%` }} />
      </div>
    </div>
  );
}

function DayPartCard({ part }: { part: DayPart }) {
  const textAccent = part.accent.replace("bg-", "text-");
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 shadow-card ${part.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full ${part.accent} text-white flex items-center justify-center text-xs font-semibold`}>
            {part.icon}
          </div>
          <div>
            <p className="text-sm text-slate-600">Avg. per day</p>
            <p className="text-xl font-semibold text-slate-900">{numberFmt.format(Math.round(part.value / 7))}</p>
          </div>
        </div>
        <div className={`text-3xl font-semibold ${textAccent}`}>
          {Math.round(part.value / 1000)}k
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{part.name}</p>
          <p className="text-xs text-slate-600">{currency.format(part.value)}</p>
        </div>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${part.accent} text-white`}>{part.percent}%</span>
      </div>
    </div>
  );
}

function MenuItemBar({ item, maxCm, maxSold }: { item: { name: string; cm: number; sold: number }; maxCm: number; maxSold: number }) {
  const cmPct = Math.round((item.cm / maxCm) * 100);
  const soldPct = Math.round((item.sold / maxSold) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{item.name}</span>
        <span className="font-semibold text-slate-900">{currency.format(item.cm)}</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${cmPct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span>Number Sold</span>
        <span className="font-semibold text-slate-900">{item.sold}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-amber-500" style={{ width: `${soldPct}%` }} />
      </div>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div
        className="h-9 w-9 flex items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: channel.color }}
      >
        {channel.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{channel.value.toLocaleString()}</p>
        <p className="text-xs text-slate-600">{channel.name}</p>
      </div>
      <span className="text-xs font-semibold text-slate-500">{channel.orders}</span>
    </div>
  );
}

function QuadrantBar({ quadrant }: { quadrant: Quadrant }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{quadrant.name}</span>
        <span className="font-semibold text-slate-900">{quadrant.value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${quadrant.color}`} style={{ width: `${quadrant.percent}%` }} />
      </div>
    </div>
  );
}
