import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/dining — list all active dining items
router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.diningItem.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dining items" });
  }
});

export default router;
