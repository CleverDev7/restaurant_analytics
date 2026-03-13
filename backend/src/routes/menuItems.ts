import { Router } from "express";
import { createMenuItem, listMenuItems } from "../controllers/menuItemController";
import { requireAuth, requireRole } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.post("/", requireRole(["ADMIN", "MANAGER"]), createMenuItem);
router.get("/", listMenuItems);
