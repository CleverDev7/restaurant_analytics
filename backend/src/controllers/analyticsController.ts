import { Request, Response } from "express";
import { analyticsService } from "../services/analyticsService";

function parseRange(req: Request) {
  const { from, to, restaurant_id: restaurantId, limit } = req.query;
  const parsedFrom = from ? new Date(String(from)) : undefined;
  const parsedTo = to ? new Date(String(to)) : undefined;
  if ((from && isNaN(parsedFrom!.getTime())) || (to && isNaN(parsedTo!.getTime()))) {
    throw new Error("Invalid date format. Use ISO date (YYYY-MM-DD)");
  }
  const lim = limit ? Number(limit) : undefined;
  return { from: parsedFrom, to: parsedTo, restaurantId: restaurantId as string | undefined, limit: lim };
}

export async function getOverview(req: Request, res: Response) {
  const { restaurant_id: restaurantId } = req.query;
  const overview = await analyticsService.getDailyOverview(new Date(), restaurantId as string | undefined);
  res.json(overview);
}

export async function getDailySales(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getDailySales(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getBestItems(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getBestSellingItems(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getPeakHours(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getPeakHours(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getProfitMargins(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getProfitMargins(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getInventoryCost(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getInventoryCost(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getStaffPerformance(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getStaffPerformance(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getCustomerSpending(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getCustomerSpendingPatterns(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getMenuPerformance(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getMenuPerformance(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getHighProfitLowSales(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getHighProfitLowSales(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getLowProfitHighSales(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getLowProfitHighSales(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getTopCustomers(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getTopCustomers(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getCustomerSegments(req: Request, res: Response) {
  try {
    const range = parseRange(req);
    const data = await analyticsService.getCustomerSegments(range);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
