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
