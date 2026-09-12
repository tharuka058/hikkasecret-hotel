import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

/** Generate a unique booking reference like "HSV-84920" */
async function generateReference(): Promise<string> {
  let ref: string;
  let exists = true;
  do {
    const num = Math.floor(10000 + Math.random() * 90000);
    ref = `HSV-${num}`;
    const existing = await prisma.booking.findUnique({
      where: { bookingReference: ref },
    });
    exists = !!existing;
  } while (exists);
  return ref;
}

/** Calculate number of nights between two dates */
function calcNights(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/check-availability
/**
 * Calculates remaining room inventory for a given check-in / check-out range.
 * Property inventory limits:
 * - Deluxe Double Rooms (id: 1): max 4 units
 * - The Lake Apartment (id: 2): max 1 unit
 * - Whole Villa (id: 3): books all 4 double rooms + apartment
 */
async function getPropertyAvailability(inDate: Date, outDate: Date) {
  // 1. Check if Whole Villa (id: 3) is booked
  const villaBooked = await prisma.booking.count({
    where: {
      status: { in: ["pending", "confirmed"] },
      roomId: 3,
      AND: [{ checkIn: { lt: outDate } }, { checkOut: { gt: inDate } }],
    },
  }) > 0;

  if (villaBooked) {
    return {
      doubleRoomsRemaining: 0,
      apartmentRemaining: 0,
      villaAvailable: false,
    };
  }

  // 2. Count booked Deluxe Double Rooms (id: 1)
  const bookedDoubles = await prisma.booking.count({
    where: {
      status: { in: ["pending", "confirmed"] },
      roomId: 1,
      AND: [{ checkIn: { lt: outDate } }, { checkOut: { gt: inDate } }],
    },
  });

  // 3. Count booked Lake Apartments (id: 2)
  const bookedApartments = await prisma.booking.count({
    where: {
      status: { in: ["pending", "confirmed"] },
      roomId: 2,
      AND: [{ checkIn: { lt: outDate } }, { checkOut: { gt: inDate } }],
    },
  });

  const doubleRoomsRemaining = Math.max(0, 4 - bookedDoubles);
  const apartmentRemaining = Math.max(0, 1 - bookedApartments);
  const villaAvailable = bookedDoubles === 0 && bookedApartments === 0;

  return {
    doubleRoomsRemaining,
    apartmentRemaining,
    villaAvailable,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/check-availability
// Query params: checkIn, checkOut, roomId (optional)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/check-availability", async (req: Request, res: Response) => {
  try {
    const { checkIn, checkOut } = req.query as {
      checkIn?: string;
      checkOut?: string;
    };

    if (!checkIn || !checkOut) {
      res.status(400).json({ error: "checkIn and checkOut are required" });
      return;
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      res.status(400).json({ error: "checkOut must be after checkIn" });
      return;
    }

    const avail = await getPropertyAvailability(inDate, outDate);

    const availability = [
      {
        roomId: 1,
        roomName: "Deluxe Double Room",
        available: avail.doubleRoomsRemaining > 0,
        remainingUnits: avail.doubleRoomsRemaining,
        price: 85,
      },
      {
        roomId: 2,
        roomName: "The Lake Apartment",
        available: avail.apartmentRemaining > 0,
        remainingUnits: avail.apartmentRemaining,
        price: 150,
      },
      {
        roomId: 3,
        roomName: "Whole Villa",
        available: avail.villaAvailable,
        remainingUnits: avail.villaAvailable ? 1 : 0,
        price: 490,
      },
    ];

    const nights = calcNights(inDate, outDate);

    res.json({ availability, nights, checkIn: inDate, checkOut: outDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/ref/:reference — guest lookup by reference
// ──────────────────────────────────────────────────────────────────────────────
router.get("/ref/:reference", async (req: Request, res: Response) => {
  try {
    const ref = (req.params.reference as string).toUpperCase();
    const booking = await prisma.booking.findUnique({
      where: { bookingReference: ref },
      include: { room: true },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found. Please check your reference number." });
      return;
    }

    res.json({
      booking: {
        ...booking,
        room: booking.room
          ? {
              ...booking.room,
              tags: JSON.parse(booking.room.tags) as string[],
              gallery: JSON.parse(booking.room.gallery) as string[],
            }
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/bookings — admin list all bookings
// ──────────────────────────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit = "20" } = req.query as {
      search?: string;
      status?: string;
      page?: string;
      limit?: string;
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        status ? { status } : {},
        search
          ? {
              OR: [
                { guestName: { contains: search } },
                { guestEmail: { contains: search } },
                { bookingReference: { contains: search.toUpperCase() } },
              ],
            }
          : {},
      ],
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { room: { select: { name: true, type: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/bookings — create new booking
// ──────────────────────────────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      roomId,
      roomIds,
      roomName,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      adults,
      children,
      guestType,
      notes,
      promoCode,
    } = req.body as {
      roomId?: number;
      roomIds?: number[];
      roomName: string;
      guestName: string;
      guestEmail: string;
      guestPhone?: string;
      checkIn: string;
      checkOut: string;
      adults: number;
      children?: number;
      guestType?: string;
      notes?: string;
      promoCode?: string;
    };

    // Basic validation
    if (!guestName || !guestEmail || !checkIn || !checkOut || !roomName) {
      res.status(400).json({ error: "Missing required fields: guestName, guestEmail, checkIn, checkOut, roomName" });
      return;
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      res.status(400).json({ error: "Invalid date format for checkIn or checkOut" });
      return;
    }

    if (outDate <= inDate) {
      res.status(400).json({ error: "Check-out must be after check-in" });
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    // Determine target room IDs to check
    const targetRoomIds: number[] = Array.isArray(roomIds) && roomIds.length > 0
      ? roomIds.map(Number)
      : roomId
      ? [roomId]
      : [1];

    const avail = await getPropertyAvailability(inDate, outDate);

    const reqDoubleCount = targetRoomIds.filter(id => id === 1).length;
    const reqAptCount = targetRoomIds.filter(id => id === 2).length;
    const reqVillaCount = targetRoomIds.filter(id => id === 3).length;

    if (reqVillaCount > 0 && !avail.villaAvailable) {
      res.status(409).json({
        error: `"Whole Villa" is not available for the selected dates (${checkIn} to ${checkOut}) because individual rooms or the villa are already booked.`,
      });
      return;
    }

    if (reqDoubleCount > avail.doubleRoomsRemaining) {
      res.status(409).json({
        error: `"Deluxe Double Room" is not available for the selected dates (${checkIn} to ${checkOut}). Only ${avail.doubleRoomsRemaining} room(s) available.`,
      });
      return;
    }

    if (reqAptCount > avail.apartmentRemaining) {
      res.status(409).json({
        error: `"The Lake Apartment" is not available for the selected dates (${checkIn} to ${checkOut}) as it is already booked.`,
      });
      return;
    }

    let basePrice = 85;
    let actualRoomId: number | undefined = targetRoomIds[0] ?? roomId;

    if (actualRoomId) {
      const roomObj = await prisma.room.findUnique({ where: { id: actualRoomId, isActive: true } });
      if (roomObj) basePrice = roomObj.price;
    }

    // Validate promo code and calculate discount
    let discountPercent = 0;
    let appliedPromo = "";

    if (promoCode) {
      const offer = await prisma.offer.findUnique({
        where: { code: promoCode.trim().toUpperCase(), isActive: true },
      });
      if (offer) {
        discountPercent = offer.discountPercent;
        appliedPromo = offer.code;
      }
    }

    // Calculate totals
    const nights = calcNights(inDate, outDate);
    const subtotal = basePrice * nights;
    const discount = (subtotal * discountPercent) / 100;
    const totalPrice = Math.round((subtotal - discount) * 100) / 100;
    const advancePayment = Math.round((totalPrice * 0.5) * 100) / 100;

    // Generate unique reference
    const bookingReference = await generateReference();

    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        roomId: actualRoomId,
        roomName,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone ?? "",
        checkIn: inDate,
        checkOut: outDate,
        adults: adults ?? 1,
        children: children ?? 0,
        guestType: guestType ?? "foreign",
        notes: notes ?? "",
        promoCode: appliedPromo,
        discountPercent,
        basePrice,
        nights,
        totalPrice,
        advancePayment,
        status: "pending",
      },
    });

    res.status(201).json({
      booking,
      message: "Your reservation has been received! A confirmation has been sent to your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/bookings/:id/status — update booking status (admin only)
// ──────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body as { status: string };

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Valid values: ${validStatuses.join(", ")}` });
      return;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json({ booking, message: `Booking ${booking.bookingReference} updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /api/bookings/:id — cancel booking (admin only)
// ──────────────────────────────────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });
    res.json({ booking, message: "Booking cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
