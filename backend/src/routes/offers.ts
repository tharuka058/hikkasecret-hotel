import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../lib/auth";

const router = Router();

// GET /api/offers — list all active offers
router.get("/", async (_req: Request, res: Response) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: [{ highlight: "desc" }, { id: "asc" }],
    });
    res.json({ offers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});

// POST /api/offers/validate — validate promo code
router.post("/validate", async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code: string };

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Promo code is required" });
      return;
    }

    const offer = await prisma.offer.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!offer || !offer.isActive) {
      res.status(404).json({
        valid: false,
        error: "Invalid promo code. Please check and try again.",
      });
      return;
    }

    res.json({
      valid: true,
      code: offer.code,
      title: offer.title,
      badge: offer.badge,
      discountPercent: offer.discountPercent,
      message: `${offer.discountPercent}% off — ${offer.badge}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate promo code" });
  }
});

// POST /api/offers — create new offer (admin only)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      code: string;
      title: string;
      badge: string;
      desc: string;
      discountPercent: number;
      price?: number;
      img: string;
      highlight?: boolean;
    };

    const offer = await prisma.offer.create({ data: body });
    res.status(201).json({ offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create offer" });
  }
});

// PUT /api/offers/:id — update offer (admin only)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const offer = await prisma.offer.update({
      where: { id },
      data: req.body as object,
    });
    res.json({ offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update offer" });
  }
});

// DELETE /api/offers/:id — deactivate offer (admin only)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.offer.update({ where: { id }, data: { isActive: false } });
    res.json({ message: "Offer deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate offer" });
  }
});

export default router;
