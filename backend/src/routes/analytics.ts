import { Router } from "express";
import {
  getOverview,
  getDailySales,
  getBestItems,
  getPeakHours,
  getProfitMargins,
  getInventoryCost,
  getStaffPerformance,
  getCustomerSpending,
  getMenuPerformance,
  getHighProfitLowSales,
  getLowProfitHighSales,
  getTopCustomers,
  getCustomerSegments
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
router.get("/menu-performance", getMenuPerformance);
router.get("/high-profit-low-sales", getHighProfitLowSales);
router.get("/low-profit-high-sales", getLowProfitHighSales);
router.get("/top-customers", getTopCustomers);
router.get("/customer-segments", getCustomerSegments);
