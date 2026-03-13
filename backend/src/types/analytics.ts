export type AnalyticsOverview = {
  date: string;
  sales: number;
  profitMargin: number;
  bestSellers: { name: string; revenue: number; quantity: number }[];
  peakHours: { hour: string; orders: number }[];
  inventoryCost: number;
  staffPerformance: { name: string; ordersHandled: number; upsellRate: number }[];
  avgTicket: number;
  customerPatterns: { customer: string; visits: number; avgTicket: number }[];
};
