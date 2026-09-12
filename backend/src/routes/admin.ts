import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken, requireAuth } from "../lib/auth.js";

const router = Router();

// Rate-limiting tracking: IP/Username -> { count, lockUntil }
const loginTracker = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes lock out

// POST /api/admin/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const ip = req.ip || "unknown";
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const trackerKey = `${ip}:${username.trim().toLowerCase()}`;
    const record = loginTracker.get(trackerKey);

    // Check if account is temporarily locked out
    if (record && record.lockUntil > Date.now()) {
      const remainingSecs = Math.ceil((record.lockUntil - Date.now()) / 1000);
      res.status(429).json({
        error: `Too many failed login attempts. Locked for ${Math.ceil(remainingSecs / 60)} more minutes.`
      });
      return;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { username: username.trim() },
    });

    if (!admin) {
      // Record failed attempt
      const attempts = (record?.count || 0) + 1;
      loginTracker.set(trackerKey, {
        count: attempts,
        lockUntil: attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_TIME_MS : 0,
      });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      // Record failed attempt
      const attempts = (record?.count || 0) + 1;
      loginTracker.set(trackerKey, {
        count: attempts,
        lockUntil: attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_TIME_MS : 0,
      });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Success - reset failed attempts
    loginTracker.delete(trackerKey);

    const token = signToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/admin/me — verify token
router.get("/me", requireAuth, async (req: Request & { admin?: { id: number } }, res: Response) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json({ admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin" });
  }
});

// GET /api/admin/stats — dashboard analytics
router.get("/stats", requireAuth, async (_req: Request, res: Response) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      revenueResult,
      totalRooms,
      todayArrivals,
      todayDepartures,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.booking.count({ where: { status: "cancelled" } }),
      prisma.booking.count({ where: { status: "completed" } }),
      prisma.booking.aggregate({
        where: { status: { in: ["confirmed", "completed"] } },
        _sum: { totalPrice: true },
      }),
      prisma.room.count({ where: { isActive: true } }),
      prisma.booking.count({
        where: {
          status: { in: ["pending", "confirmed"] },
          checkIn: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.booking.count({
        where: {
          status: "confirmed",
          checkOut: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    // Recent 5 bookings
    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { room: { select: { name: true } } },
    });

    // Upcoming arrivals (next 7 days)
    const upcoming = await prisma.booking.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        checkIn: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { checkIn: "asc" },
      take: 10,
      include: { room: { select: { name: true } } },
    });

    res.json({
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue: revenueResult._sum.totalPrice ?? 0,
        totalRooms,
        todayArrivals,
        todayDepartures,
      },
      recentBookings,
      upcoming,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
