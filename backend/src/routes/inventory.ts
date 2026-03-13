import { Router } from "express";
import { createInventory, listInventory } from "../controllers/inventoryController";
import { requireAuth, requireRole } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.post("/", requireRole(["ADMIN", "MANAGER"]), createInventory);
router.get("/", listInventory);
