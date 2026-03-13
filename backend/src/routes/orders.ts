import { Router } from "express";
import { createOrder, listOrders } from "../controllers/orderController";

export const router = Router();

router.post("/", createOrder);
router.get("/", listOrders);
