import { prisma } from "../prisma/client";
import { CreateOrderInput } from "../types/validators";

export const orderService = {
  async createOrder(input: CreateOrderInput) {
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: input.items.map((i) => i.menuItemId) }, restaurantId: input.restaurantId }
    });

    if (menuItems.length !== input.items.length) {
      throw new Error("One or more menu items not found for this restaurant");
    }

    const itemMap = new Map(menuItems.map((m) => [m.id, m]));

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

    const order = await prisma.order.create({
      data: {
        restaurantId: input.restaurantId,
        staffId: input.staffId,
        customerId: input.customerId,
        serviceType: input.serviceType,
        subtotal,
        tax,
        discount,
        total,
        orderItems: { create: orderItemsData }
      },
      include: {
        staff: true,
        customer: true,
        orderItems: { include: { menuItem: true } }
      }
    });

    return order;
  },

  async listOrders() {
    return prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      include: {
        staff: true,
        customer: true,
        orderItems: { include: { menuItem: true } }
      }
    });
  }
};
