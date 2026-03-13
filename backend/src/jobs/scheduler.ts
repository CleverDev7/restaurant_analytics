import cron from "node-cron";
import { analyticsService } from "../services/analyticsService";
import { query } from "../db/pool";

async function runDailySalesSummary() {
  const today = new Date();
  const restaurantIds = await query(`SELECT id FROM "Restaurant"`);
  for (const r of restaurantIds.rows as { id: string }[]) {
    const summary = await analyticsService.getDailySales({ restaurantId: r.id, from: today, to: today });
    await query(
      `INSERT INTO "DailySalesSummary" ("restaurantId", date, sales, orders, "avgTicket", "profitMargin", cogs, "inventoryCost")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ("restaurantId", date) DO UPDATE
         SET sales = EXCLUDED.sales,
             orders = EXCLUDED.orders,
             "avgTicket" = EXCLUDED."avgTicket",
             "profitMargin" = EXCLUDED."profitMargin",
             cogs = EXCLUDED.cogs,
             "inventoryCost" = EXCLUDED."inventoryCost"`,
      [
        r.id,
        new Date(summary.date),
        summary.sales,
        summary.orders,
        summary.avgTicket,
        summary.profitMargin,
        summary.cogs,
        summary.inventoryCost
      ]
    );
  }
}

async function runHourlySalesSummary() {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);
  const hourEnd = new Date(hourStart);
  hourEnd.setHours(hourEnd.getHours() + 1);
  const restaurantIds = await query(`SELECT id FROM "Restaurant"`);
  for (const r of restaurantIds.rows as { id: string }[]) {
    const sales = await query(
      `SELECT COALESCE(SUM(total),0) as sum
       FROM "Order"
       WHERE "restaurantId" = $1 AND "placedAt" >= $2 AND "placedAt" < $3 AND status != 'CANCELLED'`,
      [r.id, hourStart, hourEnd]
    );
    const ordersRes = await query(
      `SELECT COUNT(*)::int as count FROM "Order"
       WHERE "restaurantId" = $1 AND "placedAt" >= $2 AND "placedAt" < $3 AND status != 'CANCELLED'`,
      [r.id, hourStart, hourEnd]
    );

    await query(
      `INSERT INTO "HourlySalesSummary" ("restaurantId", "hourStart", sales, orders)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("restaurantId", "hourStart") DO UPDATE
         SET sales = EXCLUDED.sales,
             orders = EXCLUDED.orders`,
      [r.id, hourStart, sales.rows[0]?.sum ?? 0, ordersRes.rows[0]?.count ?? 0]
    );
  }
}

async function runMenuItemPerformance() {
  const today = new Date();
  const restaurantIds = await query(`SELECT id FROM "Restaurant"`);
  for (const r of restaurantIds.rows as { id: string }[]) {
    const perf = await analyticsService.getMenuPerformance({ restaurantId: r.id, from: today, to: today });
    for (const item of perf) {
      const menuRes = await query(
        `SELECT id FROM "MenuItem" WHERE name = $1 AND "restaurantId" = $2 LIMIT 1`,
        [item.name, r.id]
      );
      const menuItem = menuRes.rows[0];
      if (!menuItem) continue;
      await query(
        `INSERT INTO "MenuItemPerformanceSummary" ("restaurantId", date, "menuItemId", revenue, quantity, profit, "marginRate")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ("restaurantId", date, "menuItemId") DO UPDATE
           SET revenue = EXCLUDED.revenue,
               quantity = EXCLUDED.quantity,
               profit = EXCLUDED.profit,
               "marginRate" = EXCLUDED."marginRate"`,
        [
          r.id,
          new Date(today.toISOString().slice(0, 10)),
          menuItem.id,
          item.revenue,
          item.quantity,
          item.profit,
          item.marginRate
        ]
      );
    }
  }
}

export function startSchedulers() {
  // Every hour at minute 5
  cron.schedule("5 * * * *", async () => {
    await runHourlySalesSummary();
    await runMenuItemPerformance();
  });

  // Daily at 00:10
  cron.schedule("10 0 * * *", async () => {
    await runDailySalesSummary();
  });
}
