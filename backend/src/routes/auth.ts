import { Router } from "express";
import { invite, login, signup } from "../controllers/authController";
import { requireAuth, requireRole } from "../middleware/auth";

export const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/invite", requireAuth, requireRole(["ADMIN", "MANAGER"]), invite);
