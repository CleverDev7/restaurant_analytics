import { Router } from "express";
import { getOverview } from "../controllers/analyticsController";

export const router = Router();

router.get("/overview", getOverview);
