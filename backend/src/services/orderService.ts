import { pool, query } from "../db/pool";
import { CreateOrderInput } from "../types/validators";
import { v4 as uuidv4 } from "uuid";

export const orderService = {
  async createOrder(input: CreateOrderInput) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const menuIds = input.items.map((i) => i.menuItemId);
      const menuRes = await client.query<{ id: string; price: number; cost: number }>(
        `SELECT id, price, cost FROM "MenuItem" WHERE id = ANY($1::uuid[]) AND "restaurantId" = $2`,
        [menuIds, input.restaurantId]
      );
      if (menuRes.rowCount !== input.items.length) {
        throw new Error("One or more menu items not found for this restaurant");
      }

      const itemMap = new Map(menuRes.rows.map((m) => [m.id, m]));
      const orderItemsData = input.items.map((i) => {
        const item = itemMap.get(i.menuItemId)!;
        return {
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          price: Number(item.price),
          cost: Number(item.cost)
        };
      });

      const subtotal = orderItemsData.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const tax = input.tax ?? 0;
      const discount = input.discount ?? 0;
      const total = subtotal + tax - discount;

      const orderId = uuidv4();
      await client.query(
        `INSERT INTO "Order" (id, "restaurantId", "customerId", "staffId", status, subtotal, tax, discount, total, "serviceType", "placedAt")
         VALUES ($1, $2, $3, $4, 'PLACED', $5, $6, $7, $8, COALESCE($9,'DINE_IN'), NOW())`,
        [orderId, input.restaurantId, input.customerId ?? null, input.staffId ?? null, subtotal, tax, discount, total, input.serviceType]
      );

      const orderItemValues: any[] = [];
      const valueStrings: string[] = [];
      orderItemsData.forEach((oi, idx) => {
        const base = idx * 6;
        valueStrings.push(
          `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`
        );
        orderItemValues.push(uuidv4(), orderId, oi.menuItemId, oi.quantity, oi.price, oi.cost);
      });

      await client.query(
        `INSERT INTO "OrderItem" (id, "orderId", "menuItemId", quantity, price, cost)
         VALUES ${valueStrings.join(", ")}`,
        orderItemValues
      );

      await client.query("COMMIT");

      const full = await client.query(
        `SELECT o.*, 
                s.name as staff_name, 
                c.name as customer_name,
                json_agg(json_build_object(
                  'id', oi.id,
                  'menuItemId', oi."menuItemId",
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'cost', oi.cost,
                  'menuItem', json_build_object('id', mi.id, 'name', mi.name, 'price', mi.price)
                )) as items
         FROM "Order" o
         LEFT JOIN "Staff" s ON o."staffId" = s.id
         LEFT JOIN "Customer" c ON o."customerId" = c.id
         JOIN "OrderItem" oi ON oi."orderId" = o.id
         JOIN "MenuItem" mi ON mi.id = oi."menuItemId"
         WHERE o.id = $1
         GROUP BY o.id, s.name, c.name`,
        [orderId]
      );

      return full.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async listOrders() {
    const res = await query(
      `SELECT o.*, 
              s.name as staff_name, 
              c.name as customer_name,
              json_agg(json_build_object(
                'id', oi.id,
                'menuItemId', oi."menuItemId",
                'quantity', oi.quantity,
                'price', oi.price,
                'cost', oi.cost,
                'menuItem', json_build_object('id', mi.id, 'name', mi.name, 'price', mi.price)
              )) as items
       FROM "Order" o
       LEFT JOIN "Staff" s ON o."staffId" = s.id
       LEFT JOIN "Customer" c ON o."customerId" = c.id
       JOIN "OrderItem" oi ON oi."orderId" = o.id
       JOIN "MenuItem" mi ON mi.id = oi."menuItemId"
       WHERE o.status != 'CANCELLED'
       GROUP BY o.id, s.name, c.name
       ORDER BY o."placedAt" DESC`
    );
    return res.rows;
  }
};
