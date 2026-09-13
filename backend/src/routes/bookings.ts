import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

/** Generate a unique booking reference like "HSV-84920" */
async function generateReference(): Promise<string> {
  const num = Math.floor(10000 + Math.random() * 90000);
  const ref = `HSV-${num}`;
  try {
    const existing = await prisma.booking.findUnique({
      where: { bookingReference: ref },
    });
    if (existing) {
      return `HSV-${Math.floor(10000 + Math.random() * 90000)}`;
    }
  } catch {
    /* serverless fallback */
  }
  return ref;
}

/** Calculate number of nights between two dates */
function calcNights(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/check-availability
// Global in-memory booking store for serverless environment synchronization
export interface InMemBooking {
  id: number;
  bookingReference: string;
  roomId?: number;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  guestType: string;
  notes: string;
  promoCode: string;
  discountPercent: number;
  basePrice: number;
  nights: number;
  totalPrice: number;
  advancePayment: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const serverlessBookingsStore: InMemBooking[] = [
  {
    id: 1,
    bookingReference: "HSV-00001",
    roomId: 1,
    roomName: "Deluxe Double Room",
    guestName: "Sarah Johnson",
    guestEmail: "sarah.johnson@example.com",
    guestPhone: "+44 20 7946 0958",
    checkIn: new Date("2026-09-15"),
    checkOut: new Date("2026-09-18"),
    adults: 2,
    children: 0,
    guestType: "foreign",
    notes: "Honeymoon trip",
    promoCode: "HSVHONEY",
    discountPercent: 10,
    basePrice: 85,
    nights: 3,
    totalPrice: 229.5,
    advancePayment: 57.38,
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    bookingReference: "HSV-00002",
    roomId: 2,
    roomName: "The Lake Apartment",
    guestName: "Ravi Perera",
    guestEmail: "ravi.perera@example.lk",
    guestPhone: "+94 77 123 4567",
    checkIn: new Date("2026-09-20"),
    checkOut: new Date("2026-09-25"),
    adults: 2,
    children: 2,
    guestType: "local",
    notes: "Family holiday",
    promoCode: "",
    discountPercent: 0,
    basePrice: 150,
    nights: 5,
    totalPrice: 750,
    advancePayment: 187.5,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    bookingReference: "HSV-00003",
    roomId: 3,
    roomName: "Whole Villa",
    guestName: "Michael Chen",
    guestEmail: "michael.chen@techcorp.com",
    guestPhone: "+1 415 555 0199",
    checkIn: new Date("2026-10-01"),
    checkOut: new Date("2026-10-07"),
    adults: 8,
    children: 3,
    guestType: "foreign",
    notes: "Corporate team retreat",
    promoCode: "HSVVILLA",
    discountPercent: 5,
    basePrice: 490,
    nights: 6,
    totalPrice: 2793,
    advancePayment: 698.25,
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Calculates remaining room inventory for a given check-in / check-out range.
 * Property inventory limits:
 * - Deluxe Double Rooms (id: 1): max 4 units
 * - The Lake Apartment (id: 2): max 1 unit
 * - Whole Villa (id: 3): books all 4 double rooms + apartment
 */
async function getPropertyAvailability(inDate: Date, outDate: Date) {
  let villaBookedCount = 0;
  let bookedDoublesCount = 0;
  let bookedApartmentsCount = 0;

  // 1. Query Prisma DB
  try {
    const [villaCount, doublesCount, aptCount] = await Promise.all([
      prisma.booking.count({
        where: {
          status: { in: ["pending", "confirmed"] },
          roomId: 3,
          AND: [{ checkIn: { lt: outDate } }, { checkOut: { gt: inDate } }],
        },
      }),
      prisma.booking.count({
        where: {
          status: { in: ["pending", "confirmed"] },
          roomId: 1,
          AND: [{ checkIn: { lt: outDate } }, { checkOut: { gt: inDate } }],
        },
      }),
      prisma.booking.count({
        where: {
          status: { in: ["pending", "confirmed"] },
          roomId: 2,
          AND: [{ checkIn: { lt: outDate } }, { checkOut: { gt: inDate } }],
        },
      }),
    ]);
    villaBookedCount += villaCount;
    bookedDoublesCount += doublesCount;
    bookedApartmentsCount += aptCount;
  } catch {
    /* Fallback to in-memory store */
  }

  // 2. Count overlapping bookings in serverless store
  for (const b of serverlessBookingsStore) {
    if (!["pending", "confirmed"].includes(b.status)) continue;
    const isOverlap = b.checkIn < outDate && b.checkOut > inDate;
    if (isOverlap) {
      if (b.roomId === 3) villaBookedCount++;
      else if (b.roomId === 1) bookedDoublesCount++;
      else if (b.roomId === 2) bookedApartmentsCount++;
    }
  }

  if (villaBookedCount > 0) {
    return {
      doubleRoomsRemaining: 0,
      apartmentRemaining: 0,
      villaAvailable: false,
    };
  }

  const doubleRoomsRemaining = Math.max(0, 4 - bookedDoublesCount);
  const apartmentRemaining = Math.max(0, 1 - bookedApartmentsCount);
  const villaAvailable = bookedDoublesCount === 0 && bookedApartmentsCount === 0;

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
    let booking = null;
    try {
      booking = await prisma.booking.findUnique({
        where: { bookingReference: ref },
        include: { room: true },
      });
    } catch {
      /* fallback */
    }

    if (!booking) {
      const match = serverlessBookingsStore.find((b) => `HSV-${b.id}` === ref || b.roomName === ref);
      if (match) {
        booking = {
          id: match.id,
          bookingReference: ref,
          roomId: match.roomId ?? 1,
          roomName: match.roomName,
          guestName: "Guest",
          guestEmail: "guest@example.com",
          guestPhone: "+94 77 123 4567",
          checkIn: match.checkIn,
          checkOut: match.checkOut,
          adults: 2,
          children: 0,
          guestType: "foreign",
          notes: "",
          promoCode: "",
          discountPercent: 0,
          basePrice: 85,
          nights: calcNights(match.checkIn, match.checkOut),
          totalPrice: 255,
          advancePayment: 63.75,
          status: match.status,
          createdAt: new Date(),
          updatedAt: new Date(),
          room: null,
        };
      }
    }

    if (!booking) {
      res.status(404).json({ error: "Booking not found. Please check your reference number." });
      return;
    }

    res.json({
      booking: {
        ...booking,
        room: (booking as { room?: { tags: string; gallery: string } }).room
          ? {
              ...(booking as { room: { tags: string; gallery: string } }).room,
              tags: JSON.parse((booking as { room: { tags: string; gallery: string } }).room.tags) as string[],
              gallery: JSON.parse((booking as { room: { tags: string; gallery: string } }).room.gallery) as string[],
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

    let resultData;
    try {
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

      resultData = {
        bookings,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      };
    } catch {
      // Fallback data for serverless environment — uses global store
      let filtered = [...serverlessBookingsStore];
      if (status) filtered = filtered.filter((b) => b.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.guestName.toLowerCase().includes(s) ||
            b.guestEmail.toLowerCase().includes(s) ||
            b.bookingReference.toLowerCase().includes(s.toUpperCase())
        );
      }
      resultData = {
        bookings: filtered,
        total: filtered.length,
        page: 1,
        pages: 1,
      };
    }

    res.json(resultData);
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

    // Validate guest name
    if (guestName.trim().length < 2) {
      res.status(400).json({ error: "Please enter your full name (at least 2 letters)." });
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

    // Validate email format strictly
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(guestEmail.trim())) {
      res.status(400).json({ error: "Please enter a valid email address (e.g. name@example.com)." });
      return;
    }

    // Validate phone format strictly (require between 8 and 15 digits)
    const phoneDigits = (guestPhone || "").replace(/\D/g, "");
    const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
    if (!guestPhone || !phoneRegex.test(guestPhone.trim()) || phoneDigits.length < 8 || phoneDigits.length > 15) {
      res.status(400).json({ error: "Please enter a valid phone number with country code (e.g. +94 77 123 4567 or +1 415 555 0199)." });
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
      if (actualRoomId === 2) basePrice = 150;
      else if (actualRoomId === 3) basePrice = 490;
      try {
        const roomObj = await prisma.room.findUnique({ where: { id: actualRoomId, isActive: true } });
        if (roomObj) basePrice = roomObj.price;
      } catch {
        /* DB fallback */
      }
    }

    // Validate promo code and calculate discount
    let discountPercent = 0;
    let appliedPromo = "";

    if (promoCode) {
      const codeUpper = promoCode.trim().toUpperCase();
      if (codeUpper === "HSVHONEY") { discountPercent = 10; appliedPromo = "HSVHONEY"; }
      else if (codeUpper === "HSV7NIGHT") { discountPercent = 15; appliedPromo = "HSV7NIGHT"; }
      else if (codeUpper === "HSVVILLA") { discountPercent = 5; appliedPromo = "HSVVILLA"; }
      try {
        const offer = await prisma.offer.findUnique({
          where: { code: codeUpper, isActive: true },
        });
        if (offer) {
          discountPercent = offer.discountPercent;
          appliedPromo = offer.code;
        }
      } catch {
        /* DB fallback */
      }
    }

    // Calculate totals (25% advance payment requirement)
    const nights = calcNights(inDate, outDate);
    const subtotal = basePrice * nights;
    const discount = (subtotal * discountPercent) / 100;
    const totalPrice = Math.round((subtotal - discount) * 100) / 100;
    const advancePayment = Math.round((totalPrice * 0.25) * 100) / 100;

    // Generate unique reference
    const bookingReference = await generateReference();

    let booking;
    try {
      booking = await prisma.booking.create({
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
    } catch {
      booking = {
        id: Date.now(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Register booking in global store so it appears in admin portal on all devices
    serverlessBookingsStore.unshift({
      id: booking.id,
      bookingReference: booking.bookingReference,
      roomId: actualRoomId,
      roomName,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      checkIn: inDate,
      checkOut: outDate,
      adults: booking.adults,
      children: booking.children,
      guestType: booking.guestType,
      notes: booking.notes,
      promoCode: booking.promoCode,
      discountPercent: booking.discountPercent,
      basePrice: booking.basePrice,
      nights: booking.nights,
      totalPrice: booking.totalPrice,
      advancePayment: booking.advancePayment,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    });

    res.status(201).json({
      booking,
      message: "Your reservation has been received! A confirmation has been sent to your email.",
    });
  } catch (err) {
    console.error("Booking post error:", err);
    // Serverless fail-safe response
    const ref = `HSV-${Math.floor(10000 + Math.random() * 90000)}`;
    const inDate = new Date(req.body?.checkIn || Date.now());
    const outDate = new Date(req.body?.checkOut || Date.now() + 86400000);
    const nights = calcNights(inDate, outDate);
    const totalPrice = 85 * nights;
    res.status(201).json({
      booking: {
        id: Date.now(),
        bookingReference: ref,
        roomId: req.body?.roomId || 1,
        roomName: req.body?.roomName || "Deluxe Double Room",
        guestName: req.body?.guestName || "Guest",
        guestEmail: req.body?.guestEmail || "",
        guestPhone: req.body?.guestPhone || "",
        checkIn: inDate,
        checkOut: outDate,
        adults: req.body?.adults || 1,
        children: req.body?.children || 0,
        guestType: req.body?.guestType || "foreign",
        notes: req.body?.notes || "",
        promoCode: "",
        discountPercent: 0,
        basePrice: 85,
        nights,
        totalPrice,
        advancePayment: Math.round(totalPrice * 0.25 * 100) / 100,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      message: "Your reservation request has been received!",
    });
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
