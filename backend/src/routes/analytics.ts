import { Router } from "express";
import {
  getOverview,
  getDailySales,
  getBestItems,
  getPeakHours,
  getProfitMargins,
  getInventoryCost,
  getStaffPerformance,
  getCustomerSpending
} from "../controllers/analyticsController";

export const router = Router();

router.get("/overview", getOverview);
router.get("/daily-sales", getDailySales);
router.get("/best-items", getBestItems);
router.get("/peak-hours", getPeakHours);
router.get("/profit-margins", getProfitMargins);
router.get("/inventory-cost", getInventoryCost);
router.get("/staff-performance", getStaffPerformance);
router.get("/customer-spending", getCustomerSpending);
