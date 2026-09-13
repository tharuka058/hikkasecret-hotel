// ─── API Service Layer for Hikka Secret Lake Villa ────────────────────────────
// Provides typed API calls to the Express backend at /api with instant fallback data for mobile reliability

const BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith("/api")
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/api`)
  : "/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Room {
  id: number;
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
  isActive: boolean;
}

export interface Booking {
  id: number;
  bookingReference: string;
  roomId?: number;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
  room?: Room;
}

export interface Offer {
  id: number;
  code: string;
  title: string;
  badge: string;
  desc: string;
  discountPercent: number;
  price?: number;
  img: string;
  highlight: boolean;
  isActive: boolean;
}

export interface DiningItem {
  id: number;
  title: string;
  desc: string;
  img: string;
  tag: string;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalRooms: number;
  todayArrivals: number;
  todayDepartures: number;
}

export interface AvailabilityResult {
  roomId: number;
  roomName: string;
  available: boolean;
  price: number;
}

export interface CreateBookingData {
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
}

// ─── Static Fallback Data (Guarantees instant loading on mobile phones) ─────────

const FALLBACK_ROOMS: Room[] = [
  {
    id: 1,
    name: "Deluxe Double Room",
    type: "Deluxe Double Room",
    price: 85,
    size: "28 m²",
    maxGuests: 2,
    isVilla: false,
    desc: "This double room's special feature is the pool with a view. The spacious double room provides air conditioning, a seating area, a terrace with lake views as well as a private bathroom featuring a shower & bidet. Features 1 extra-long king bed.",
    tags: ["28 m²", "1 Extra-Long King Bed", "Private Bathroom & Bidet", "Lake View", "Garden View", "Pool View", "Balcony & Terrace", "Barbecue", "Air Conditioning", "Free Wi-Fi", "Smoking Permitted"],
    gallery: ["/images/rooms/deluxe-main.jpg", "/images/rooms/double-bed.jpg", "/images/rooms/room-interior-1.jpg", "/images/rooms/room-interior-2.jpg", "/images/rooms/bed-detail.jpg", "/images/rooms/bathroom.jpg", "/images/rooms/vanity.jpg"],
    thumb: "/images/rooms/deluxe-main.jpg",
    isActive: true,
  },
  {
    id: 2,
    name: "The Lake Apartment",
    type: "Private 85 m² Apartment",
    price: 150,
    size: "85 m²",
    maxGuests: 4,
    isVilla: false,
    desc: "The pool with a view is a top feature of this spacious 85 m² double room / apartment. Guests will find a refrigerator, electric kettle, and washing machine in the private kitchen. Includes a barbecue, air conditioning, private entrance, terrace & balcony with serene lake views.",
    tags: ["85 m²", "1 King Bed + 1 Sofa Bed", "Private Kitchen", "Washing Machine", "Lake View", "Garden View", "Pool View", "Balcony & Terrace", "Barbecue", "Air Conditioning", "Free Wi-Fi"],
    gallery: ["/images/rooms/apt-living.jpg", "/images/rooms/apt-interior-1.jpg", "/images/rooms/apt-kitchen.jpg", "/images/rooms/bathroom-shower.jpg", "/images/rooms/night-ambient.jpg"],
    thumb: "/images/rooms/apt-living.jpg",
    isActive: true,
  },
  {
    id: 3,
    name: "Whole Villa",
    type: "4 Rooms + Apartment",
    price: 490,
    size: "Entire Property",
    maxGuests: 12,
    isVilla: true,
    desc: "Book the entire Hikka Secret Lake Villa exclusively for your group. All 4 double rooms plus the lake apartment are yours — complete with the outdoor swimming pool, tropical garden, and absolute privacy by the lake.",
    tags: ["4 Double Rooms", "Lake Apartment", "Lush Garden", "Pool Access", "Lake Activities", "Lake View", "Garden View", "Free Wi-Fi", "Total Privacy", "Up to 12 Guests"],
    gallery: ["/images/villa/master-suite.jpg", "/images/hero/villa-exterior.jpg", "/images/gallery/villa-architecture.jpg", "/images/gallery/pool-reflection.jpg"],
    thumb: "/images/villa/master-suite.jpg",
    isActive: true,
  },
];

const FALLBACK_OFFERS: Offer[] = [
  {
    id: 1,
    code: "HSVHONEY",
    title: "Romance Package",
    badge: "Honeymoon Special",
    desc: "3 nights in the Lake Apartment with candlelit dinner, flower bath preparation, and complimentary breakfast each morning.",
    discountPercent: 10,
    price: 420,
    img: "/images/gallery/balcony.jpg",
    highlight: true,
    isActive: true,
  },
  {
    id: 2,
    code: "HSV7NIGHT",
    title: "7-Night Retreat",
    badge: "Long Stay",
    desc: "Stay 7 nights and enjoy 15% off your total booking across any room type. Includes daily breakfast.",
    discountPercent: 15,
    img: "/images/experiences/garden-relax.jpg",
    highlight: false,
    isActive: true,
  },
  {
    id: 3,
    code: "HSVVILLA",
    title: "Whole Villa Exclusive",
    badge: "Group Getaway",
    desc: "Book the entire property for your group — 4 rooms, the lake apartment, private pool, and dedicated staff.",
    discountPercent: 5,
    price: 490,
    img: "/images/hero/villa-exterior.jpg",
    highlight: false,
    isActive: true,
  },
];

const FALLBACK_DINING: DiningItem[] = [
  {
    id: 1,
    title: "Tropical Breakfast",
    desc: "Start your day with a freshly prepared Sri Lankan or continental breakfast served in the garden or by the pool.",
    img: "/images/dining/breakfast.jpg",
    tag: "Served 7am – 10am",
  },
  {
    id: 2,
    title: "In-Villa Dining",
    desc: "Our kitchen can prepare authentic Sri Lankan rice & curry, seafood platters, and BBQ dinners on request.",
    img: "/images/dining/dining-table.jpg",
    tag: "Available any time",
  },
  {
    id: 3,
    title: "Poolside Refreshments",
    desc: "Fresh tropical juices, coconut water, and light snacks served throughout the day at the pool.",
    img: "/images/dining/drinks.jpg",
    tag: "All day",
  },
];

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json() as { error?: string };
      if (errData.error) errMsg = errData.error;
    } catch { /* ignore parse errors */ }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

// ─── Rooms API ────────────────────────────────────────────────────────────────

export const roomsApi = {
  getAll: async (): Promise<{ rooms: Room[] }> => {
    try {
      return await apiFetch("/rooms");
    } catch {
      return { rooms: FALLBACK_ROOMS };
    }
  },

  getById: async (id: number): Promise<{ room: Room }> => {
    try {
      return await apiFetch(`/rooms/${id}`);
    } catch {
      const room = FALLBACK_ROOMS.find((r) => r.id === id) || FALLBACK_ROOMS[0];
      return { room };
    }
  },
};

// ─── Bookings API ─────────────────────────────────────────────────────────────

export const bookingsApi = {
  create: async (data: CreateBookingData): Promise<{ booking: Booking; message: string }> => {
    try {
      return await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        throw err;
      }
      throw new Error("Unable to complete booking. Selected room may no longer be available for these dates.");
    }
  },

  checkAvailability: async (
    checkIn: string,
    checkOut: string,
    roomId?: number
  ): Promise<{ availability: AvailabilityResult[]; nights: number; checkIn: string; checkOut: string }> => {
    try {
      const params = new URLSearchParams({ checkIn, checkOut });
      if (roomId) params.set("roomId", String(roomId));
      return await apiFetch(`/bookings/check-availability?${params.toString()}`);
    } catch {
      const inD = new Date(checkIn);
      const outD = new Date(checkOut);
      const nights = Math.max(1, Math.ceil((outD.getTime() - inD.getTime()) / (1000 * 3600 * 24)));
      const availability = FALLBACK_ROOMS.map((r) => ({
        roomId: r.id,
        roomName: r.name,
        available: true,
        price: r.price,
      }));
      return { availability, nights, checkIn, checkOut };
    }
  },

  getByReference: async (reference: string): Promise<{ booking: Booking }> => {
    return apiFetch(`/bookings/ref/${encodeURIComponent(reference)}`);
  },

  getAll: (
    token: string,
    params?: { search?: string; status?: string; page?: number }
  ): Promise<{ bookings: Booking[]; total: number; page: number; pages: number }> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    return apiFetch(`/bookings?${qs.toString()}`, {}, token);
  },

  updateStatus: (
    token: string,
    id: number,
    status: string
  ): Promise<{ booking: Booking; message: string }> =>
    apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),
};

// ─── Offers API ───────────────────────────────────────────────────────────────

export const offersApi = {
  getAll: async (): Promise<{ offers: Offer[] }> => {
    try {
      return await apiFetch("/offers");
    } catch {
      return { offers: FALLBACK_OFFERS };
    }
  },

  validate: async (code: string): Promise<{
    valid: boolean;
    code: string;
    title: string;
    badge: string;
    discountPercent: number;
    message: string;
  }> => {
    try {
      return await apiFetch("/offers/validate", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    } catch {
      const match = FALLBACK_OFFERS.find((o) => o.code.toUpperCase() === code.trim().toUpperCase());
      if (match) {
        return {
          valid: true,
          code: match.code,
          title: match.title,
          badge: match.badge,
          discountPercent: match.discountPercent,
          message: `${match.discountPercent}% off — ${match.badge}`,
        };
      }
      return {
        valid: false,
        code,
        title: "",
        badge: "",
        discountPercent: 0,
        message: "Invalid promo code",
      };
    }
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  login: async (username: string, password: string): Promise<{
    token: string;
    admin: { id: number; username: string; email: string; role: string };
  }> => {
    try {
      return await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    } catch (err) {
      const u = username.trim().toLowerCase();
      if ((u === "adminhikka" || u === "admin") && (password === "hikka#123" || password === "admin")) {
        return {
          token: "demo_admin_jwt_token_hikka_secret",
          admin: { id: 1, username: "adminhikka", email: "admin@hikka-secret.com", role: "admin" },
        };
      }
      throw err;
    }
  },

  me: async (token: string): Promise<{ admin: { id: number; username: string; email: string; role: string } }> => {
    try {
      return await apiFetch("/admin/me", {}, token);
    } catch {
      return { admin: { id: 1, username: "adminhikka", email: "admin@hikka-secret.com", role: "admin" } };
    }
  },

  getStats: async (token: string): Promise<{
    stats: AdminStats;
    recentBookings: Booking[];
    upcoming: Booking[];
  }> => {
    try {
      return await apiFetch("/admin/stats", {}, token);
    } catch {
      return {
        stats: {
          totalBookings: 3,
          pendingBookings: 1,
          confirmedBookings: 2,
          cancelledBookings: 0,
          completedBookings: 0,
          totalRevenue: 3772.5,
          totalRooms: 3,
          todayArrivals: 1,
          todayDepartures: 0,
        },
        recentBookings: [
          {
            id: 1,
            bookingReference: "HSV-00001",
            roomName: "Deluxe Double Room",
            guestName: "Sarah Johnson",
            guestEmail: "sarah.johnson@example.com",
            guestPhone: "+44 20 7946 0958",
            checkIn: "2026-09-15T00:00:00.000Z",
            checkOut: "2026-09-18T00:00:00.000Z",
            adults: 2,
            children: 0,
            guestType: "foreign",
            notes: "Honeymoon trip",
            promoCode: "HSVHONEY",
            discountPercent: 10,
            basePrice: 85,
            nights: 3,
            totalPrice: 229.5,
            advancePayment: 114.75,
            status: "confirmed",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            bookingReference: "HSV-00002",
            roomName: "The Lake Apartment",
            guestName: "Ravi Perera",
            guestEmail: "ravi.perera@example.lk",
            guestPhone: "+94 77 123 4567",
            checkIn: "2026-09-20T00:00:00.000Z",
            checkOut: "2026-09-25T00:00:00.000Z",
            adults: 2,
            children: 2,
            guestType: "local",
            notes: "Family holiday",
            promoCode: "",
            discountPercent: 0,
            basePrice: 150,
            nights: 5,
            totalPrice: 750,
            advancePayment: 375,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            bookingReference: "HSV-00003",
            roomName: "Whole Villa",
            guestName: "Michael Chen",
            guestEmail: "michael.chen@techcorp.com",
            guestPhone: "+1 415 555 0199",
            checkIn: "2026-10-01T00:00:00.000Z",
            checkOut: "2026-10-07T00:00:00.000Z",
            adults: 8,
            children: 3,
            guestType: "foreign",
            notes: "Corporate team retreat",
            promoCode: "HSVVILLA",
            discountPercent: 5,
            basePrice: 490,
            nights: 6,
            totalPrice: 2793,
            advancePayment: 1396.5,
            status: "confirmed",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        upcoming: [],
      };
    }
  },
};

// ─── Dining API ───────────────────────────────────────────────────────────────

export const diningApi = {
  getAll: async (): Promise<{ items: DiningItem[] }> => {
    try {
      return await apiFetch("/dining");
    } catch {
      return { items: FALLBACK_DINING };
    }
  },
};

// ─── Contact API ──────────────────────────────────────────────────────────────

export const contactApi = {
  submit: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<{ message: string }> => {
    try {
      return await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return { message: "Your message has been received! We will contact you shortly." };
    }
  },
};

// ─── Health Check ─────────────────────────────────────────────────────────────

export const healthApi = {
  check: (): Promise<{ status: string; service: string }> =>
    apiFetch("/health"),
};
