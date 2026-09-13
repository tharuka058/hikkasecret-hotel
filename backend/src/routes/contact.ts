import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// POST /api/contact — submit a guest inquiry
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body as {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
    };

    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ?? "",
        subject: subject ?? "General Inquiry",
        message: message.trim(),
      },
    });

    res.status(201).json({
      inquiry,
      message: "Your message has been received. Our team will contact you shortly.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

// GET /api/contact — list all inquiries (admin only)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };

    const inquiries = await prisma.inquiry.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ inquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

// PATCH /api/contact/:id/status — mark inquiry as read/replied (admin only)
router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body as { status: string };

    const validStatuses = ["unread", "read", "replied"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Valid: ${validStatuses.join(", ")}` });
      return;
    }

    const inquiry = await prisma.inquiry.update({ where: { id }, data: { status } });
    res.json({ inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inquiry" });
  }
});

export default router;
