import { Router } from "express";
import { createInventory, listInventory } from "../controllers/inventoryController";

export const router = Router();

router.post("/", createInventory);
router.get("/", listInventory);
