import { Router } from "express";
import { createMenuItem, listMenuItems } from "../controllers/menuItemController";

export const router = Router();

router.post("/", createMenuItem);
router.get("/", listMenuItems);
