import { z } from "zod";

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1).optional(),
  staffId: z.string().optional(),
  customerId: z.string().optional(),
  serviceType: z.enum(["DINE_IN", "TAKEOUT", "DELIVERY"]).optional(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export const createMenuItemSchema = z.object({
  restaurantId: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  cost: z.number().nonnegative(),
  isActive: z.boolean().optional()
});

export const createInventorySchema = z.object({
  restaurantId: z.string().min(1).optional(),
  itemName: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
  purchasedAt: z.coerce.date().optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
