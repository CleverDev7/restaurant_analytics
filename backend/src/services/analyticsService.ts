import { prisma } from "../prisma/client";
import {
  AnalyticsOverview,
  BestSeller,
  CustomerPattern,
  DailySales,
  PeakHour,
  StaffPerformance
} from "../types/analytics";

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return Number(value);
}

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function getSalesTotal(start: Date, end: Date) {
  const result = await prisma.order.aggregate({
    _sum: { total: true },
    where: { placedAt: { gte: start, lte: end }, status: { not: "CANCELLED" } }
  });
  return toNumber(result._sum.total);
}

async function getOrderCount(start: Date, end: Date) {
  return prisma.order.count({ where: { placedAt: { gte: start, lte: end }, status: { not: "CANCELLED" } } });
}

async function getCogs(start: Date, end: Date) {
  const rows = await prisma.$queryRaw<{ cost: number }[]>`
    SELECT COALESCE(SUM(oi.cost * oi.quantity), 0) as cost
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."placedAt" BETWEEN ${start} AND ${end}
      AND o.status != 'CANCELLED';
  `;
  return toNumber(rows[0]?.cost || 0);
}

async function getBestSellers(start: Date, end: Date, limit = 5): Promise<BestSeller[]> {
  const rows = await prisma.$queryRaw<
    { name: string; revenue: number; quantity: number }[]
  >`
    SELECT mi.name as name,
           COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
           COALESCE(SUM(oi.quantity), 0) as quantity
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    JOIN "MenuItem" mi ON oi."menuItemId" = mi.id
    WHERE o."placedAt" BETWEEN ${start} AND ${end}
      AND o.status != 'CANCELLED'
    GROUP BY mi.name
    ORDER BY revenue DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ ...r, revenue: toNumber(r.revenue), quantity: toNumber(r.quantity) }));
}

async function getPeakHours(start: Date, end: Date): Promise<PeakHour[]> {
  const rows = await prisma.$queryRaw<{ hour: string; orders: number }[]>`
    SELECT to_char(date_trunc('hour', o."placedAt"), 'HH24:MI') as hour,
           COUNT(*) as orders
    FROM "Order" o
    WHERE o."placedAt" BETWEEN ${start} AND ${end}
      AND o.status != 'CANCELLED'
    GROUP BY date_trunc('hour', o."placedAt")
    ORDER BY hour;
  `;
  return rows.map((r) => ({ hour: r.hour, orders: toNumber(r.orders) }));
}

async function computeInventoryCost(start: Date, end: Date) {
  const rows = await prisma.$queryRaw<{ cost: number }[]>`
    SELECT COALESCE(SUM(ip.quantity * ip."unitCost"), 0) as cost
    FROM "InventoryPurchase" ip
    WHERE ip."purchasedAt" BETWEEN ${start} AND ${end};
  `;
  return toNumber(rows[0]?.cost || 0);
}

async function getStaffPerformance(start: Date, end: Date, limit = 5): Promise<StaffPerformance[]> {
  const rows = await prisma.$queryRaw<
    { name: string; orders: number; upsell: number }[]
  >`
    SELECT s.name as name,
           COUNT(o.id) as orders,
           COALESCE(AVG(sh."upsellRate"), 0) as upsell
    FROM "Staff" s
    LEFT JOIN "Order" o ON o."staffId" = s.id AND o."placedAt" BETWEEN ${start} AND ${end} AND o.status != 'CANCELLED'
    LEFT JOIN "Shift" sh ON sh."staffId" = s.id AND sh."startedAt" BETWEEN ${start} AND ${end}
    GROUP BY s.name
    ORDER BY orders DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ name: r.name, ordersHandled: toNumber(r.orders), upsellRate: Number(r.upsell) }));
}

async function getCustomerPatterns(start: Date, end: Date, limit = 5): Promise<CustomerPattern[]> {
  const rows = await prisma.$queryRaw<
    { name: string; visits: number; avg_ticket: number }[]
  >`
    SELECT COALESCE(c.name, 'Guest') as name,
           COUNT(o.id) as visits,
           COALESCE(AVG(o.total), 0) as avg_ticket
    FROM "Order" o
    LEFT JOIN "Customer" c ON c.id = o."customerId"
    WHERE o."placedAt" BETWEEN ${start} AND ${end}
      AND o.status != 'CANCELLED'
    GROUP BY COALESCE(c.name, 'Guest')
    ORDER BY visits DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ customer: r.name, visits: toNumber(r.visits), avgTicket: toNumber(r.avg_ticket) }));
}

export const analyticsService = {
  async getDailySales(date = new Date()): Promise<DailySales> {
    const { start, end } = dayBounds(date);
    const [sales, orders, cogs, inventoryCost] = await Promise.all([
      getSalesTotal(start, end),
      getOrderCount(start, end),
      getCogs(start, end),
      computeInventoryCost(start, end)
    ]);
    const profitMargin = sales === 0 ? 0 : (sales - cogs - inventoryCost) / sales;
    const avgTicket = orders === 0 ? 0 : sales / orders;
    return {
      date: start.toISOString().slice(0, 10),
      sales,
      orders,
      avgTicket,
      profitMargin,
      cogs,
      inventoryCost
    };
  },

  async getBestSellingItems(date = new Date(), limit = 5) {
    const { start, end } = dayBounds(date);
    return getBestSellers(start, end, limit);
  },

  async getPeakHours(date = new Date()) {
    const { start, end } = dayBounds(date);
    return getPeakHours(start, end);
  },

  async getProfitMargins(date = new Date()) {
    const { start, end } = dayBounds(date);
    const [sales, cogs, inventoryCost] = await Promise.all([
      getSalesTotal(start, end),
      getCogs(start, end),
      computeInventoryCost(start, end)
    ]);
    const profitMargin = sales === 0 ? 0 : (sales - cogs - inventoryCost) / sales;
    return { date: start.toISOString().slice(0, 10), sales, cogs, inventoryCost, profitMargin };
  },

  async getInventoryCost(date = new Date()) {
    const { start, end } = dayBounds(date);
    const cost = await computeInventoryCost(start, end);
    return { date: start.toISOString().slice(0, 10), inventoryCost: cost };
  },

  async getStaffPerformance(date = new Date(), limit = 5) {
    const { start, end } = dayBounds(date);
    return getStaffPerformance(start, end, limit);
  },

  async getCustomerSpendingPatterns(date = new Date(), limit = 5) {
    const { start, end } = dayBounds(date);
    return getCustomerPatterns(start, end, limit);
  },

  async getDailyOverview(date = new Date()): Promise<AnalyticsOverview> {
    const { start, end } = dayBounds(date);

    const [sales, ordersCount, cogs, bestSellers, peakHours, inventoryCost, staffPerformance, customerPatterns] =
      await Promise.all([
        getSalesTotal(start, end),
        getOrderCount(start, end),
        getCogs(start, end),
        getBestSellers(start, end),
        getPeakHours(start, end),
        computeInventoryCost(start, end),
        getStaffPerformance(start, end),
        getCustomerPatterns(start, end)
      ]);

    const profitMargin = sales === 0 ? 0 : (sales - cogs - inventoryCost) / sales;
    const avgTicket = ordersCount === 0 ? 0 : sales / ordersCount;

    return {
      date: start.toISOString().slice(0, 10),
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
