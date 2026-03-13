const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export type BestSeller = { name: string; revenue: number; quantity: number };
export type PeakHour = { hour: string; orders: number };
export type StaffPerformance = { name: string; ordersHandled: number; upsellRate: number };
export type CustomerPattern = { customer: string; visits: number; avgTicket: number };

export type DailySales = {
  date: string;
  sales: number;
  orders: number;
  avgTicket: number;
  profitMargin: number;
  cogs: number;
  inventoryCost: number;
};

export type AnalyticsOverview = {
  date: string;
  sales: number;
  profitMargin: number;
  bestSellers: BestSeller[];
  peakHours: PeakHour[];
  inventoryCost: number;
  staffPerformance: StaffPerformance[];
  avgTicket: number;
  customerPatterns: CustomerPattern[];
};

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed request");
    return (await res.json()) as T;
  } catch (error) {
    return fallback;
  }
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  return safeFetch<AnalyticsOverview>("/analytics/overview", {
    date: new Date().toISOString().slice(0, 10),
    sales: 24850,
    profitMargin: 0.34,
    inventoryCost: 6200,
    avgTicket: 32.4,
    bestSellers: [
      { name: "Truffle Burger", revenue: 5400, quantity: 180 },
      { name: "Spicy Tuna Roll", revenue: 4300, quantity: 210 },
      { name: "House Lemonade", revenue: 2200, quantity: 310 }
    ],
    peakHours: [
      { hour: "12:00", orders: 120 },
      { hour: "13:00", orders: 140 },
      { hour: "19:00", orders: 210 },
      { hour: "20:00", orders: 230 }
    ],
    staffPerformance: [
      { name: "Avery Chen", ordersHandled: 95, upsellRate: 0.18 },
      { name: "Liam Patel", ordersHandled: 88, upsellRate: 0.22 },
      { name: "Sofia Martinez", ordersHandled: 79, upsellRate: 0.2 }
    ],
    customerPatterns: [
      { customer: "Guest", visits: 5, avgTicket: 28 },
      { customer: "VIP A", visits: 3, avgTicket: 62 }
    ]
  });
}

export async function fetchDailySales(date: string): Promise<DailySales> {
  const fallback: DailySales = {
    date,
    sales: 1200,
    orders: 45,
    avgTicket: 26.7,
    profitMargin: 0.32,
    cogs: 400,
    inventoryCost: 150
  };
  const path = `/analytics/daily-sales?from=${date}&to=${date}`;
  return safeFetch<DailySales>(path, fallback);
}

export async function fetchSalesTrend(days = 7): Promise<DailySales[]> {
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  const results = await Promise.all(dates.map((d) => fetchDailySales(d)));
  return results;
}

export async function fetchBestItems(): Promise<BestSeller[]> {
  return safeFetch<BestSeller[]>("/analytics/best-items", [
    { name: "Fallback Dish", revenue: 1000, quantity: 40 }
  ]);
}

export async function fetchPeakHours(): Promise<PeakHour[]> {
  return safeFetch<PeakHour[]>("/analytics/peak-hours", [
    { hour: "12:00", orders: 30 },
    { hour: "19:00", orders: 45 }
  ]);
}

export async function fetchProfitMargins(days = 7): Promise<{ date: string; profitMargin: number }[]> {
  const trend = await fetchSalesTrend(days);
  return trend.map((d) => ({ date: d.date, profitMargin: d.profitMargin }));
}

export async function fetchInventoryValue(): Promise<{ date: string; inventoryCost: number }> {
  return safeFetch<{ date: string; inventoryCost: number }>("/analytics/inventory-cost", {
    date: new Date().toISOString().slice(0, 10),
    inventoryCost: 600
  });
}

