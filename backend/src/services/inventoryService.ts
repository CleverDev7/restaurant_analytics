import { query } from "../db/pool";
import { CreateInventoryInput } from "../types/validators";

export const inventoryService = {
  async createInventory(input: CreateInventoryInput) {
    const res = await query(
      `INSERT INTO "InventoryPurchase" ("restaurantId", "itemName", quantity, "unitCost", "purchasedAt")
       VALUES ($1, $2, $3, $4, COALESCE($5, NOW()))
       RETURNING *`,
      [input.restaurantId, input.itemName, input.quantity, input.unitCost, input.purchasedAt ?? null]
    );
    return res.rows[0];
  },

  async listInventory(restaurantId: string) {
    const res = await query(
      `SELECT * FROM "InventoryPurchase" WHERE "restaurantId" = $1 ORDER BY "purchasedAt" DESC`,
      [restaurantId]
    );
    return res.rows;
  }
};
