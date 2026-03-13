import { Request, Response } from "express";
import { inventoryService } from "../services/inventoryService";
import { createInventorySchema } from "../types/validators";

export async function createInventory(req: Request, res: Response) {
  const parsed = createInventorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }
  const record = await inventoryService.createInventory(parsed.data);
  res.status(201).json(record);
}

export async function listInventory(_req: Request, res: Response) {
  const items = await inventoryService.listInventory();
  res.json(items);
}
