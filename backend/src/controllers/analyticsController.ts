import { Request, Response } from "express";
import { analyticsService } from "../services/analyticsService";

export async function getOverview(_req: Request, res: Response) {
  const data = await analyticsService.getDailyOverview();
  res.json(data);
}
