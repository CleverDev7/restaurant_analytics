import { Router } from "express";
import { createOrder, listOrders } from "../controllers/orderController";
import { requireAuth } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.post("/", createOrder);
router.get("/", listOrders);
