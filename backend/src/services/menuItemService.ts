import { prisma } from "../prisma/client";
import { CreateMenuItemInput } from "../types/validators";

export const menuItemService = {
  async createMenuItem(input: CreateMenuItemInput) {
    return prisma.menuItem.create({ data: input });
  },

  async listMenuItems() {
    return prisma.menuItem.findMany({ orderBy: { createdAt: "desc" } });
  }
};
