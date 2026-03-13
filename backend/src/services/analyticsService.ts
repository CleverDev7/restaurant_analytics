import { query } from "../db/pool";
import {
  AnalyticsOverview,
  BestSeller,
  CustomerPattern,
  DailySales,
  PeakHour,
  StaffPerformance,
  MenuPerformance,
  CustomerSegmentSummary,
  CustomerTop
} from "../types/analytics";

export type RangeParams = {
  from?: Date;
  to?: Date;
  restaurantId?: string | null;
  limit?: number;
};

type RangeNormalized = {
  from: Date;
  to: Date;
  restaurantId: string | null;
  limit?: number;
};

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return Number(value);
}

function normalizeRange(range: RangeParams): RangeNormalized {
  if (range.from && range.to) {
    return {
      from: range.from,
      to: range.to,
      restaurantId: range.restaurantId ?? null,
      limit: range.limit
    };
  }
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { from: start, to: end, restaurantId: range.restaurantId ?? null, limit: range.limit };
}

async function getSalesTotal(range: RangeNormalized) {
  const res = await query(
    `SELECT COALESCE(SUM(total),0) as sum
     FROM "Order"
     WHERE "placedAt" BETWEEN $1 AND $2
       AND status != 'CANCELLED'
       AND ($3::text IS NULL OR "restaurantId" = $3::text)`,
    [range.from, range.to, range.restaurantId]
  );
  return toNumber(res.rows[0]?.sum || 0);
}

async function getOrderCount(range: RangeNormalized) {
  const res = await query(
    `SELECT COUNT(*)::int as count
     FROM "Order"
     WHERE "placedAt" BETWEEN $1 AND $2
       AND status != 'CANCELLED'
       AND ($3::text IS NULL OR "restaurantId" = $3::text)`,
    [range.from, range.to, range.restaurantId]
  );
  return toNumber(res.rows[0]?.count || 0);
}

async function getCogs(range: RangeNormalized) {
  const rows = await query(
    `SELECT COALESCE(SUM(oi.cost * oi.quantity), 0) as cost
     FROM "OrderItem" oi
     JOIN "Order" o ON oi."orderId" = o.id
     WHERE o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
       AND ($3::text IS NULL OR o."restaurantId" = $3::text)`,
    [range.from, range.to, range.restaurantId]
  );
  return toNumber(rows.rows[0]?.cost || 0);
}

async function getBestSellers(range: RangeNormalized): Promise<BestSeller[]> {
  const limit = range.limit ?? 5;
  const rows = await query(
    `SELECT mi.name as name,
            COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
            COALESCE(SUM(oi.quantity), 0) as quantity
     FROM "OrderItem" oi
     JOIN "Order" o ON oi."orderId" = o.id
     JOIN "MenuItem" mi ON oi."menuItemId" = mi.id
     WHERE o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
       AND ($3::text IS NULL OR o."restaurantId" = $3::text)
     GROUP BY mi.name
     ORDER BY revenue DESC
     LIMIT $4`,
    [range.from, range.to, range.restaurantId, limit]
  );
  return rows.rows.map((r) => ({ ...r, revenue: toNumber(r.revenue), quantity: toNumber(r.quantity) }));
}

async function getPeakHours(range: RangeNormalized): Promise<PeakHour[]> {
  const rows = await query(
    `SELECT to_char(date_trunc('hour', o."placedAt"), 'HH24:MI') as hour,
            COUNT(*) as orders
     FROM "Order" o
     WHERE o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
       AND ($3::text IS NULL OR o."restaurantId" = $3::text)
     GROUP BY date_trunc('hour', o."placedAt")
     ORDER BY hour`,
    [range.from, range.to, range.restaurantId]
  );
  return rows.rows.map((r) => ({ hour: r.hour, orders: toNumber(r.orders) }));
}

async function computeInventoryCost(range: RangeNormalized) {
  const rows = await query(
    `SELECT COALESCE(SUM(ip.quantity * ip."unitCost"), 0) as cost
     FROM "InventoryPurchase" ip
     WHERE ip."purchasedAt" BETWEEN $1 AND $2
       AND ($3::text IS NULL OR ip."restaurantId" = $3::text)`,
    [range.from, range.to, range.restaurantId]
  );
  return toNumber(rows.rows[0]?.cost || 0);
}

async function getStaffPerformance(range: RangeNormalized): Promise<StaffPerformance[]> {
  const limit = range.limit ?? 5;
  const rows = await query(
    `SELECT s.name as name,
            COUNT(o.id) as orders,
            COALESCE(AVG(sh."upsellRate"), 0) as upsell
     FROM "Staff" s
     LEFT JOIN "Order" o ON o."staffId" = s.id
       AND o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
     LEFT JOIN "Shift" sh ON sh."staffId" = s.id
       AND sh."startedAt" BETWEEN $1 AND $2
     WHERE ($3::text IS NULL OR s."restaurantId" = $3::text)
     GROUP BY s.name
     ORDER BY orders DESC
     LIMIT $4`,
    [range.from, range.to, range.restaurantId, limit]
  );
  return rows.rows.map((r) => ({ name: r.name, ordersHandled: toNumber(r.orders), upsellRate: Number(r.upsell) }));
}

async function getCustomerPatterns(range: RangeNormalized): Promise<CustomerPattern[]> {
  const limit = range.limit ?? 5;
  const rows = await query(
    `SELECT COALESCE(c.name, 'Guest') as name,
            COUNT(o.id) as visits,
            COALESCE(AVG(o.total), 0) as avg_ticket
     FROM "Order" o
     LEFT JOIN "Customer" c ON c.id = o."customerId"
     WHERE o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
       AND ($3::text IS NULL OR o."restaurantId" = $3::text)
     GROUP BY COALESCE(c.name, 'Guest')
     ORDER BY visits DESC
     LIMIT $4`,
    [range.from, range.to, range.restaurantId, limit]
  );
  return rows.rows.map((r) => ({ customer: r.name, visits: toNumber(r.visits), avgTicket: toNumber(r.avg_ticket) }));
}

async function getMenuPerformance(range: RangeNormalized): Promise<MenuPerformance[]> {
  const rows = await query(
    `SELECT mi.name,
            COALESCE(SUM(oi.price * oi.quantity), 0)      AS revenue,
            COALESCE(SUM((oi.price - oi.cost) * oi.quantity), 0) AS profit,
            COALESCE(SUM(oi.quantity), 0)                 AS quantity
     FROM "OrderItem" oi
     JOIN "Order" o ON oi."orderId" = o.id
     JOIN "MenuItem" mi ON mi.id = oi."menuItemId"
     WHERE o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
       AND ($3::text IS NULL OR o."restaurantId" = $3::text)
     GROUP BY mi.name
     ORDER BY revenue DESC`,
    [range.from, range.to, range.restaurantId]
  );
  return rows.rows.map((r) => ({
    name: r.name,
    revenue: toNumber(r.revenue),
    quantity: toNumber(r.quantity),
    profit: toNumber(r.profit),
    marginRate: toNumber(r.revenue) === 0 ? 0 : toNumber(r.profit) / toNumber(r.revenue)
  }));
}

async function getHighProfitLowSales(range: RangeNormalized, maxQty = 20): Promise<MenuPerformance[]> {
  const perf = await getMenuPerformance(range);
  return perf
    .filter((p) => p.quantity <= maxQty)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, range.limit ?? 5);
}

async function getLowProfitHighSales(range: RangeNormalized, minQty = 30, maxMargin = 0.18): Promise<MenuPerformance[]> {
  const perf = await getMenuPerformance(range);
  return perf
    .filter((p) => p.quantity >= minQty && p.marginRate <= maxMargin)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, range.limit ?? 5);
}

async function getTopCustomers(range: RangeNormalized): Promise<CustomerTop[]> {
  const limit = range.limit ?? 5;
  const rows = await query(
    `SELECT COALESCE(c.name, 'Guest') as name,
            COUNT(o.id) as visits,
            COALESCE(SUM(o.total), 0) as total_spend,
            COALESCE(AVG(o.total), 0) as avg_ticket
     FROM "Order" o
     LEFT JOIN "Customer" c ON c.id = o."customerId"
     WHERE o."placedAt" BETWEEN $1 AND $2
       AND o.status != 'CANCELLED'
       AND ($3::text IS NULL OR o."restaurantId" = $3::text)
     GROUP BY COALESCE(c.name, 'Guest')
     ORDER BY total_spend DESC
     LIMIT $4`,
    [range.from, range.to, range.restaurantId, limit]
  );
  return rows.rows.map((r) => ({
    customer: r.name,
    visits: toNumber(r.visits),
    totalSpend: toNumber(r.total_spend),
    avgTicket: toNumber(r.avg_ticket)
  }));
}

async function getCustomerSegments(range: RangeNormalized): Promise<CustomerSegmentSummary[]> {
  const rows = await query(
    `WITH customer_totals AS (
        SELECT COALESCE(c.name, 'Guest') as name,
               COUNT(o.id) as visits,
               SUM(o.total) as total_spend,
               AVG(o.total) as avg_ticket
        FROM "Order" o
        LEFT JOIN "Customer" c ON c.id = o."customerId"
        WHERE o."placedAt" BETWEEN $1 AND $2
          AND o.status != 'CANCELLED'
          AND ($3::uuid IS NULL OR o."restaurantId" = $3::uuid)
        GROUP BY COALESCE(c.name, 'Guest')
      )
      SELECT CASE
               WHEN total_spend >= 300 THEN 'VIP'
               WHEN visits >= 5 THEN 'Loyal'
               WHEN visits = 1 THEN 'New'
               ELSE 'Regular'
             END as segment,
             COUNT(*) as customers,
             COALESCE(SUM(total_spend), 0) as total_spend,
             COALESCE(AVG(avg_ticket), 0) as avg_ticket
      FROM customer_totals
      GROUP BY segment`,
    [range.from, range.to, range.restaurantId]
  );
  return rows.rows.map((r) => ({
    segment: r.segment,
    customers: toNumber(r.customers),
    totalSpend: toNumber(r.total_spend),
    avgTicket: toNumber(r.avg_ticket)
  }));
}

export const analyticsService = {
  async getDailySales(range: RangeParams = {}): Promise<DailySales> {
    const normalized = normalizeRange(range);
    const [sales, orders, cogs, inventoryCost] = await Promise.all([
      getSalesTotal(normalized),
      getOrderCount(normalized),
      getCogs(normalized),
      computeInventoryCost(normalized)
    ]);
    const profitMargin = sales === 0 ? 0 : (sales - cogs - inventoryCost) / sales;
    const avgTicket = orders === 0 ? 0 : sales / orders;
    return {
      date: normalized.from.toISOString().slice(0, 10),
      sales,
      orders,
      avgTicket,
      profitMargin,
      cogs,
      inventoryCost
    };
  },

  async getBestSellingItems(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getBestSellers(normalized);
  },

  async getPeakHours(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getPeakHours(normalized);
  },

  async getProfitMargins(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    const [sales, cogs, inventoryCost] = await Promise.all([
      getSalesTotal(normalized),
      getCogs(normalized),
      computeInventoryCost(normalized)
    ]);
    const profitMargin = sales === 0 ? 0 : (sales - cogs - inventoryCost) / sales;
    return {
      date: normalized.from.toISOString().slice(0, 10),
      sales,
      cogs,
      inventoryCost,
      profitMargin
    };
  },

  async getInventoryCost(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    const cost = await computeInventoryCost(normalized);
    return { date: normalized.from.toISOString().slice(0, 10), inventoryCost: cost };
  },

  async getStaffPerformance(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getStaffPerformance(normalized);
  },

  async getCustomerSpendingPatterns(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getCustomerPatterns(normalized);
  },

  async getMenuPerformance(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getMenuPerformance(normalized);
  },

  async getHighProfitLowSales(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getHighProfitLowSales(normalized);
  },

  async getLowProfitHighSales(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getLowProfitHighSales(normalized);
  },

  async getTopCustomers(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getTopCustomers(normalized);
  },

  async getCustomerSegments(range: RangeParams = {}) {
    const normalized = normalizeRange(range);
    return getCustomerSegments(normalized);
  },

  async getDailyOverview(date = new Date(), restaurantId?: string): Promise<AnalyticsOverview> {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(date);
    to.setHours(23, 59, 59, 999);
    const range: RangeNormalized = { from, to, restaurantId: restaurantId ?? null, limit: 5 };

    const [sales, ordersCount, cogs, bestSellers, peakHours, inventoryCost, staffPerformance, customerPatterns] =
      await Promise.all([
        getSalesTotal(range),
        getOrderCount(range),
        getCogs(range),
        getBestSellers(range),
        getPeakHours(range),
        computeInventoryCost(range),
        getStaffPerformance(range),
        getCustomerPatterns(range)
      ]);

    const profitMargin = sales === 0 ? 0 : (sales - cogs - inventoryCost) / sales;
    const avgTicket = ordersCount === 0 ? 0 : sales / ordersCount;

    return {
      date: range.from.toISOString().slice(0, 10),
      sales,
      profitMargin,
      bestSellers,
      peakHours,
      inventoryCost,
      staffPerformance,
      avgTicket,
      customerPatterns
    };
  }
};
