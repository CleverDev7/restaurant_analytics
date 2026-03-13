import { Request, Response } from "express";
import { menuItemService } from "../services/menuItemService";
import { createMenuItemSchema } from "../types/validators";

export async function createMenuItem(req: Request, res: Response) {
  const parsed = createMenuItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }
  const item = await menuItemService.createMenuItem({ ...parsed.data, restaurantId: req.user?.restaurantId! });
  res.status(201).json(item);
}

export async function listMenuItems(req: Request, res: Response) {
  const items = await menuItemService.listMenuItems(req.user?.restaurantId!);
  res.json(items);
}
