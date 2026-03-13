import { prisma } from "../prisma/client";
import {
  AnalyticsOverview,
  BestSeller,
  CustomerPattern,
  DailySales,
  PeakHour,
  StaffPerformance
} from "../types/analytics";

export type RangeParams = {
  from?: Date;
  to?: Date;
  restaurantId?: string;
  limit?: number;
};

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return Number(value);
}

function normalizeRange(range: RangeParams) {
  if (range.from && range.to) return range as Required<RangeParams>;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { from: start, to: end, restaurantId: range.restaurantId, limit: range.limit } as Required<RangeParams>;
}

async function getSalesTotal(range: Required<RangeParams>) {
  const result = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      placedAt: { gte: range.from, lte: range.to },
      status: { not: "CANCELLED" },
      restaurantId: range.restaurantId ? range.restaurantId : undefined
    }
  });
  return toNumber(result._sum.total);
}

async function getOrderCount(range: Required<RangeParams>) {
  return prisma.order.count({
    where: {
      placedAt: { gte: range.from, lte: range.to },
      status: { not: "CANCELLED" },
      restaurantId: range.restaurantId ? range.restaurantId : undefined
    }
  });
}

async function getCogs(range: Required<RangeParams>) {
  const restaurantParam = range.restaurantId ?? null;
  const rows = await prisma.$queryRaw<{ cost: number }[]>`
    SELECT COALESCE(SUM(oi.cost * oi.quantity), 0) as cost
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to}
      AND o.status != 'CANCELLED'
      AND (${restaurantParam}::uuid IS NULL OR o."restaurantId" = ${restaurantParam}::uuid);
  `;
  return toNumber(rows[0]?.cost || 0);
}

async function getBestSellers(range: Required<RangeParams>): Promise<BestSeller[]> {
  const limit = range.limit ?? 5;
  const restaurantParam = range.restaurantId ?? null;
  const rows = await prisma.$queryRaw<
    { name: string; revenue: number; quantity: number }[]
  >`
    SELECT mi.name as name,
           COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
           COALESCE(SUM(oi.quantity), 0) as quantity
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    JOIN "MenuItem" mi ON oi."menuItemId" = mi.id
    WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to}
      AND o.status != 'CANCELLED'
      AND (${restaurantParam}::uuid IS NULL OR o."restaurantId" = ${restaurantParam}::uuid)
    GROUP BY mi.name
    ORDER BY revenue DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ ...r, revenue: toNumber(r.revenue), quantity: toNumber(r.quantity) }));
}

async function getPeakHours(range: Required<RangeParams>): Promise<PeakHour[]> {
  const restaurantParam = range.restaurantId ?? null;
  const rows = await prisma.$queryRaw<{ hour: string; orders: number }[]>`
    SELECT to_char(date_trunc('hour', o."placedAt"), 'HH24:MI') as hour,
           COUNT(*) as orders
    FROM "Order" o
    WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to}
      AND o.status != 'CANCELLED'
      AND (${restaurantParam}::uuid IS NULL OR o."restaurantId" = ${restaurantParam}::uuid)
    GROUP BY date_trunc('hour', o."placedAt")
    ORDER BY hour;
  `;
  return rows.map((r) => ({ hour: r.hour, orders: toNumber(r.orders) }));
}

async function computeInventoryCost(range: Required<RangeParams>) {
  const restaurantParam = range.restaurantId ?? null;
  const rows = await prisma.$queryRaw<{ cost: number }[]>`
    SELECT COALESCE(SUM(ip.quantity * ip."unitCost"), 0) as cost
    FROM "InventoryPurchase" ip
    WHERE ip."purchasedAt" BETWEEN ${range.from} AND ${range.to}
      AND (${restaurantParam}::uuid IS NULL OR ip."restaurantId" = ${restaurantParam}::uuid);
  `;
  return toNumber(rows[0]?.cost || 0);
}

async function getStaffPerformance(range: Required<RangeParams>): Promise<StaffPerformance[]> {
  const limit = range.limit ?? 5;
  const restaurantParam = range.restaurantId ?? null;
  const rows = await prisma.$queryRaw<
    { name: string; orders: number; upsell: number }[]
  >`
    SELECT s.name as name,
           COUNT(o.id) as orders,
           COALESCE(AVG(sh."upsellRate"), 0) as upsell
    FROM "Staff" s
    LEFT JOIN "Order" o ON o."staffId" = s.id
      AND o."placedAt" BETWEEN ${range.from} AND ${range.to}
      AND o.status != 'CANCELLED'
    LEFT JOIN "Shift" sh ON sh."staffId" = s.id
      AND sh."startedAt" BETWEEN ${range.from} AND ${range.to}
    WHERE (${restaurantParam}::uuid IS NULL OR s."restaurantId" = ${restaurantParam}::uuid)
    GROUP BY s.name
    ORDER BY orders DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ name: r.name, ordersHandled: toNumber(r.orders), upsellRate: Number(r.upsell) }));
}

async function getCustomerPatterns(range: Required<RangeParams>): Promise<CustomerPattern[]> {
  const limit = range.limit ?? 5;
  const restaurantParam = range.restaurantId ?? null;
  const rows = await prisma.$queryRaw<
    { name: string; visits: number; avg_ticket: number }[]
  >`
    SELECT COALESCE(c.name, 'Guest') as name,
           COUNT(o.id) as visits,
           COALESCE(AVG(o.total), 0) as avg_ticket
    FROM "Order" o
    LEFT JOIN "Customer" c ON c.id = o."customerId"
    WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to}
      AND o.status != 'CANCELLED'
      AND (${restaurantParam}::uuid IS NULL OR o."restaurantId" = ${restaurantParam}::uuid)
    GROUP BY COALESCE(c.name, 'Guest')
    ORDER BY visits DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ customer: r.name, visits: toNumber(r.visits), avgTicket: toNumber(r.avg_ticket) }));
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

  async getDailyOverview(date = new Date(), restaurantId?: string): Promise<AnalyticsOverview> {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(date);
    to.setHours(23, 59, 59, 999);
    const range: Required<RangeParams> = { from, to, restaurantId, limit: 5 };

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
