// ─── API Service Layer for Hikka Secret Lake Villa ────────────────────────────
// Provides typed API calls to the Express backend at /api

const BASE_URL = "/api"; // Proxied by Vite to http://localhost:5000

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
  getAll: (): Promise<{ rooms: Room[] }> =>
    apiFetch("/rooms"),

  getById: (id: number): Promise<{ room: Room }> =>
    apiFetch(`/rooms/${id}`),
};

// ─── Bookings API ─────────────────────────────────────────────────────────────

export const bookingsApi = {
  create: (data: CreateBookingData): Promise<{ booking: Booking; message: string }> =>
    apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkAvailability: (
    checkIn: string,
    checkOut: string,
    roomId?: number
  ): Promise<{ availability: AvailabilityResult[]; nights: number; checkIn: string; checkOut: string }> => {
    const params = new URLSearchParams({ checkIn, checkOut });
    if (roomId) params.set("roomId", String(roomId));
    return apiFetch(`/bookings/check-availability?${params.toString()}`);
  },

  getByReference: (reference: string): Promise<{ booking: Booking }> =>
    apiFetch(`/bookings/ref/${encodeURIComponent(reference)}`),

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
  getAll: (): Promise<{ offers: Offer[] }> =>
    apiFetch("/offers"),

  validate: (code: string): Promise<{
    valid: boolean;
    code: string;
    title: string;
    badge: string;
    discountPercent: number;
    message: string;
  }> =>
    apiFetch("/offers/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  login: (username: string, password: string): Promise<{
    token: string;
    admin: { id: number; username: string; email: string; role: string };
  }> =>
    apiFetch("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: (token: string): Promise<{ admin: { id: number; username: string; email: string; role: string } }> =>
    apiFetch("/admin/me", {}, token),

  getStats: (token: string): Promise<{
    stats: AdminStats;
    recentBookings: Booking[];
    upcoming: Booking[];
  }> =>
    apiFetch("/admin/stats", {}, token),
};

// ─── Dining API ───────────────────────────────────────────────────────────────

export const diningApi = {
  getAll: (): Promise<{ items: DiningItem[] }> =>
    apiFetch("/dining"),
};

// ─── Contact API ──────────────────────────────────────────────────────────────

export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<{ message: string }> =>
    apiFetch("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Health Check ─────────────────────────────────────────────────────────────

export const healthApi = {
  check: (): Promise<{ status: string; service: string }> =>
    apiFetch("/health"),
};
