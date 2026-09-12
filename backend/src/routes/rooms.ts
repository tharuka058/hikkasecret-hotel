import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/rooms — list all active rooms
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });

    const parsed = rooms.map((r) => ({
      ...r,
      tags: JSON.parse(r.tags) as string[],
      gallery: JSON.parse(r.gallery) as string[],
    }));

    res.json({ rooms: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/:id — get single room
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid room ID" });
      return;
    }

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json({
      room: {
        ...room,
        tags: JSON.parse(room.tags) as string[],
        gallery: JSON.parse(room.gallery) as string[],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// POST /api/rooms — create room (admin only)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, type, price, size, maxGuests, isVilla, desc, tags, gallery, thumb } = req.body as {
      name: string;
      type: string;
      price: number;
      size: string;
      maxGuests: number;
      isVilla: boolean;
      desc: string;
      tags: string[];
      gallery: string[];
      thumb: string;
    };

    const room = await prisma.room.create({
      data: {
        name,
        type,
        price,
        size,
        maxGuests,
        isVilla: isVilla ?? false,
        desc,
        tags: JSON.stringify(tags),
        gallery: JSON.stringify(gallery),
        thumb,
      },
    });

    res.status(201).json({
      room: {
        ...room,
        tags: JSON.parse(room.tags) as string[],
        gallery: JSON.parse(room.gallery) as string[],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// PUT /api/rooms/:id — update room (admin only)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body as {
      name?: string;
      type?: string;
      price?: number;
      size?: string;
      maxGuests?: number;
      isVilla?: boolean;
      desc?: string;
      tags?: string[];
      gallery?: string[];
      thumb?: string;
      isActive?: boolean;
    };

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...body,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
        gallery: body.gallery ? JSON.stringify(body.gallery) : undefined,
      },
    });

    res.json({
      room: {
        ...room,
        tags: JSON.parse(room.tags) as string[],
        gallery: JSON.parse(room.gallery) as string[],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// DELETE /api/rooms/:id — soft delete (admin only)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ message: "Room deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate room" });
  }
});

export default router;
