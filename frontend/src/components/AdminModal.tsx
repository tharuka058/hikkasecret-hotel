import React, { useState, useEffect, useCallback } from "react";
import { adminApi, bookingsApi } from "../services/api.js";
import type { AdminStats, Booking } from "../services/api.js";

type Theme = "light" | "dark";
type AdminView = "login" | "dashboard" | "bookings";

interface Props {
  theme: Theme;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "rgba(255,180,50,0.15)",  text: "#e6a830" },
  confirmed: { bg: "rgba(70,200,120,0.15)",  text: "#4caf82" },
  cancelled: { bg: "rgba(220,80,80,0.15)",   text: "#e07070" },
  completed: { bg: "rgba(100,140,230,0.15)", text: "#7095e0" },
};

export default function AdminModal({ theme, onClose }: Props) {
  const dark = theme === "dark";
  const modalBg  = dark ? "#0c1f30" : "#ffffff";
  const sideBg   = dark ? "#071522" : "#f4f0ea";
  const text      = dark ? "#e8e0d0" : "#0d2233";
  const sub       = dark ? "rgba(232,224,208,0.55)" : "#52637a";
  const border    = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.12)";
  const inputBg   = dark ? "rgba(255,255,255,0.05)" : "#f4f0ea";

  // Auth state
  const [view, setView]         = useState<AdminView>("login");
  const [token, setToken]       = useState(() => localStorage.getItem("hsv_admin_token") ?? "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);

  // Bookings list state
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingPage, setBookingPage]     = useState(1);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating]   = useState<number | null>(null);

  // ── Check saved token on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      adminApi.me(token)
        .then(() => setView("dashboard"))
        .catch(() => {
          localStorage.removeItem("hsv_admin_token");
          setToken("");
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load dashboard stats ───────────────────────────────────────────────────
  useEffect(() => {
    if (view === "dashboard" && token) {
      adminApi.getStats(token)
        .then((data) => {
          setStats(data.stats);
          setRecentBookings(data.recentBookings);
          setUpcoming(data.upcoming);
        })
        .catch(console.error);
    }
  }, [view, token]);

  // ── Load bookings list ─────────────────────────────────────────────────────
  const fetchBookings = useCallback(() => {
    if (!token) return;
    setBookingsLoading(true);
    bookingsApi.getAll(token, {
      search: bookingSearch || undefined,
      status: bookingStatus || undefined,
      page: bookingPage,
    })
      .then((data) => {
        setBookings(data.bookings);
        setBookingsTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setBookingsLoading(false));
  }, [token, bookingSearch, bookingStatus, bookingPage]);

  useEffect(() => {
    if (view === "bookings") fetchBookings();
  }, [view, fetchBookings]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await adminApi.login(loginForm.username, loginForm.password);
      localStorage.setItem("hsv_admin_token", res.token);
      setToken(res.token);
      setView("dashboard");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hsv_admin_token");
    setToken("");
    setView("login");
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    if (!token) return;
    setStatusUpdating(bookingId);
    try {
      await bookingsApi.updateStatus(token, bookingId, status);
      fetchBookings();
      // Also refresh stats if on dashboard
      if (view === "dashboard") {
        const data = await adminApi.getStats(token);
        setStats(data.stats);
        setRecentBookings(data.recentBookings);
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: text,
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 3,
    padding: "10px 14px",
    width: "100%",
    outline: "none",
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Login form
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "login") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", animation: "backdropIn 0.25s ease" }}
        onClick={onClose}
      >
        <div className="w-full max-w-md rounded overflow-hidden"
          style={{ background: modalBg, boxShadow: "0 32px 96px rgba(0,0,0,0.5)", animation: "modalSlideIn 0.3s ease" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-7" style={{ borderBottom: `1px solid ${border}` }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>
              Staff Access
            </p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 400, color: text }}>
              Admin Portal
            </h2>
          </div>

          <form onSubmit={handleLogin} className="px-8 py-7 flex flex-col gap-4">
            <div>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", display: "block", marginBottom: 6 }}>
                Username
              </label>
              <input
                autoFocus
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </div>

            {loginError && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#e07070" }}>
                ✕ {loginError}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: "12px", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", border: `1px solid ${border}`, color: sub, borderRadius: 3, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={loginLoading}
                style={{ flex: 2, padding: "12px", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", background: loginLoading ? "#a88630" : "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 3, cursor: loginLoading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loginLoading ? (
                  <>
                    <span style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#0d2233", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Signing in…
                  </>
                ) : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Dashboard / Bookings — Full screen / Responsive
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex p-0 md:p-4" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="flex flex-col md:flex-row w-full h-full max-w-6xl mx-auto rounded-none md:rounded overflow-hidden"
        style={{ background: modalBg, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "modalSlideIn 0.3s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sidebar / Top Navigation Header ───────────────────────────────── */}
        <div className="flex flex-col md:w-56 w-full" style={{ background: sideBg, borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          {/* Logo */}
          <div className="px-5 py-4 md:py-7 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500, color: "#c9a84c" }}>HIKKA SECRET</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: sub, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>Admin Portal</p>
            </div>
            <button className="md:hidden" onClick={onClose} style={{ color: "#c9a84c", background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>

          {/* Nav links & Actions */}
          <div className="flex flex-row md:flex-col justify-between items-center md:items-stretch p-2 md:p-3 gap-2" style={{ flex: 1 }}>
            <nav className="flex flex-row md:flex-col gap-1 flex-1">
              {[
                {
                  key: "dashboard",
                  label: "Dashboard",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" />
                      <rect x="14" y="3" width="7" height="5" />
                      <rect x="14" y="12" width="7" height="9" />
                      <rect x="3" y="16" width="7" height="5" />
                    </svg>
                  )
                },
                {
                  key: "bookings",
                  label: "Reservations",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  )
                },
              ].map((item) => (
                <button key={item.key}
                  onClick={() => setView(item.key as AdminView)}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    fontWeight: view === item.key ? 600 : 400,
                    color: view === item.key ? "#c9a84c" : sub,
                    background: view === item.key ? (dark ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.08)") : "transparent",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Logout & Close buttons */}
            <div className="flex flex-row md:flex-col gap-2">
              <button onClick={handleLogout}
                style={{ padding: "7px 12px", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", border: `1px solid ${border}`, color: sub, borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap" }}>
                Sign Out
              </button>
              <button className="hidden md:block" onClick={onClose}
                style={{ padding: "7px 12px", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", border: `1px solid rgba(201,168,76,0.3)`, color: "#c9a84c", borderRadius: 3, cursor: "pointer" }}>
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* ─── DASHBOARD view ─────────────────────────────────────────── */}
          {view === "dashboard" && (
            <div className="p-4 md:p-8">
              <div className="mb-6 md:mb-8">
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>Overview</p>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 400, color: text }}>Dashboard</h2>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                {stats ? [
                  { label: "Total Bookings",   value: stats.totalBookings,   color: "#c9a84c" },
                  { label: "Pending",           value: stats.pendingBookings, color: "#e6a830" },
                  { label: "Confirmed",         value: stats.confirmedBookings, color: "#4caf82" },
                  { label: "Today's Arrivals",  value: stats.todayArrivals,   color: "#7095e0" },
                  { label: "Total Revenue",     value: `$${stats.totalRevenue.toLocaleString()}`, color: "#c9a84c" },
                  { label: "Active Rooms",      value: stats.totalRooms,      color: "#4caf82" },
                ].map((s) => (
                  <div key={s.label} style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f9f5ef", border: `1px solid ${border}`, borderRadius: 6, padding: "20px 18px" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: sub, marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500, color: s.color }}>{s.value}</p>
                  </div>
                )) : (
                  <p style={{ color: sub, fontFamily: "var(--font-sans)", fontSize: 13 }}>Loading stats…</p>
                )}
              </div>

              {/* Upcoming arrivals */}
              {upcoming.length > 0 && (
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 14 }}>Upcoming Arrivals (Next 7 Days)</p>
                  <div style={{ border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
                    {upcoming.map((b, i) => (
                      <div key={b.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 18px",
                        borderTop: i > 0 ? `1px solid ${border}` : "none",
                        background: i % 2 === 0 ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(26,58,82,0.02)"),
                      }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: text }}>{b.guestName}</p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>{b.roomName}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: text }}>
                            {new Date(b.checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </p>
                          <span style={{ ...STATUS_COLORS[b.status], fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 2 }}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent bookings */}
              {recentBookings.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c" }}>Recent Reservations</p>
                    <button onClick={() => setView("bookings")}
                      style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c", background: "transparent", border: "none", cursor: "pointer" }}>
                      View All →
                    </button>
                  </div>
                  <div style={{ border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
                    {recentBookings.map((b, i) => (
                      <div key={b.id} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 18px",
                        borderTop: i > 0 ? `1px solid ${border}` : "none",
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: text }}>{b.guestName}</p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub }}>{b.bookingReference} · {b.roomName}</p>
                        </div>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500, color: "#c9a84c", whiteSpace: "nowrap" }}>
                          ${b.totalPrice.toLocaleString()}
                        </p>
                        <div style={{ ...STATUS_COLORS[b.status], padding: "3px 10px", borderRadius: 2, fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          {b.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── BOOKINGS view ───────────────────────────────────────────── */}
          {view === "bookings" && (
            <div className="p-4 md:p-8">
              <div className="mb-6">
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>Management</p>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 400, color: text }}>All Reservations</h2>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <input
                  value={bookingSearch}
                  onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                  placeholder="Search guest, email, or reference…"
                  style={{ ...inputStyle, flex: 1, minWidth: 200 }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = border)}
                />
                <select
                  value={bookingStatus}
                  onChange={(e) => { setBookingStatus(e.target.value); setBookingPage(1); }}
                  style={{ ...inputStyle, width: "auto", cursor: "pointer" }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Table */}
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <span style={{ width: 24, height: 24, border: "2px solid rgba(201,168,76,0.3)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20" style={{ color: sub }}>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>No reservations found</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, marginTop: 8 }}>Try adjusting your search filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto" style={{ border: `1px solid ${border}`, borderRadius: 6 }}>
                  <div style={{ minWidth: 620 }}>
                    {/* Header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: dark ? "rgba(255,255,255,0.04)" : "#f4f0ea", borderBottom: `1px solid ${border}` }}>
                      {["Guest", "Room", "Check-in", "Nights", "Total", "Status"].map((h) => (
                        <p key={h} style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: sub }}>{h}</p>
                      ))}
                    </div>

                    {/* Rows */}
                    {bookings.map((b, i) => (
                      <div key={b.id} style={{
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
                        padding: "14px 16px",
                        borderTop: i > 0 ? `1px solid ${border}` : "none",
                        alignItems: "center",
                        background: i % 2 === 0 ? "transparent" : (dark ? "rgba(255,255,255,0.015)" : "rgba(26,58,82,0.015)"),
                      }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: text }}>{b.guestName}</p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "#c9a84c" }}>{b.bookingReference}</p>
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>{b.roomName.split(" ").slice(0, 2).join(" ")}</p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: text }}>
                          {new Date(b.checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                        </p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: text }}>{b.nights} nts</p>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500, color: "#c9a84c" }}>${b.totalPrice.toLocaleString()}</p>

                        {/* Status selector */}
                        <select
                          value={b.status}
                          disabled={statusUpdating === b.id}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding: "4px 8px",
                            borderRadius: 3,
                            border: "none",
                            cursor: statusUpdating === b.id ? "wait" : "pointer",
                            outline: "none",
                            ...STATUS_COLORS[b.status],
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {bookingsTotal > 20 && (
                <div className="flex items-center justify-between mt-6">
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>
                    Showing {Math.min((bookingPage - 1) * 20 + 1, bookingsTotal)}–{Math.min(bookingPage * 20, bookingsTotal)} of {bookingsTotal} reservations
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setBookingPage((p) => Math.max(1, p - 1))} disabled={bookingPage === 1}
                      style={{ padding: "6px 14px", fontFamily: "var(--font-sans)", fontSize: 11, background: "transparent", border: `1px solid ${border}`, color: sub, borderRadius: 3, cursor: "pointer", opacity: bookingPage === 1 ? 0.4 : 1 }}>
                      Previous
                    </button>
                    <button onClick={() => setBookingPage((p) => p + 1)} disabled={bookingPage * 20 >= bookingsTotal}
                      style={{ padding: "6px 14px", fontFamily: "var(--font-sans)", fontSize: 11, background: "transparent", border: `1px solid ${border}`, color: sub, borderRadius: 3, cursor: "pointer", opacity: bookingPage * 20 >= bookingsTotal ? 0.4 : 1 }}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
