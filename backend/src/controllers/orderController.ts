import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import { createOrderSchema } from "../types/validators";

export async function createOrder(req: Request, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }
  try {
    const order = await orderService.createOrder({ ...parsed.data, restaurantId: req.user?.restaurantId! });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Unable to create order" });
  }
}

export async function listOrders(req: Request, res: Response) {
  const orders = await orderService.listOrders(req.user?.restaurantId!);
  res.json(orders);
}
