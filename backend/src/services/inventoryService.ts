import { prisma } from "../prisma/client";
import { CreateInventoryInput } from "../types/validators";

export const inventoryService = {
  async createInventory(input: CreateInventoryInput) {
    return prisma.inventoryPurchase.create({
      data: {
        restaurantId: input.restaurantId,
        itemName: input.itemName,
        quantity: input.quantity,
        unitCost: input.unitCost,
        purchasedAt: input.purchasedAt ?? undefined
      }
    });
  },

  async listInventory() {
    return prisma.inventoryPurchase.findMany({ orderBy: { purchasedAt: "desc" } });
  }
};
