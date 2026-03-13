import { query } from "../db/pool";
import { CreateMenuItemInput } from "../types/validators";

export const menuItemService = {
  async createMenuItem(input: CreateMenuItemInput) {
    const res = await query(
      `INSERT INTO "MenuItem" (name, category, price, cost, "isActive", "restaurantId")
       VALUES ($1, $2, $3, $4, COALESCE($5, true), $6)
       RETURNING *`,
      [input.name, input.category, input.price, input.cost, input.isActive ?? true, input.restaurantId]
    );
    return res.rows[0];
  },

  async listMenuItems(restaurantId: string) {
    const res = await query(
      `SELECT * FROM "MenuItem" WHERE "restaurantId" = $1 ORDER BY "createdAt" DESC`,
      [restaurantId]
    );
    return res.rows;
  }
};
