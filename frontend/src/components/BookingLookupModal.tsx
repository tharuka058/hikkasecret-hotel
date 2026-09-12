import React, { useState, useEffect } from "react";
import { bookingsApi } from "../services/api.js";
import type { Booking } from "../services/api.js";

type Theme = "light" | "dark";

interface Props {
  theme: Theme;
  onClose: () => void;
  onBook: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:   { label: "Pending Confirmation", color: "#e6a830", icon: "⏳" },
  confirmed: { label: "Confirmed",            color: "#4caf82", icon: "✓" },
  cancelled: { label: "Cancelled",            color: "#e07070", icon: "✕" },
  completed: { label: "Completed",            color: "#7095e0", icon: "★" },
};

export default function BookingLookupModal({ theme, onClose, onBook }: Props) {
  const dark = theme === "dark";
  const modalBg = dark ? "#0f2030" : "#ffffff";
  const text     = dark ? "#e8e0d0" : "#0d2233";
  const sub      = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border   = dark ? "rgba(255,255,255,0.1)" : "rgba(26,58,82,0.12)";
  const inputBg  = dark ? "rgba(255,255,255,0.05)" : "#f4f0ea";

  const [reference, setReference] = useState("");
  const [booking, setBooking]     = useState<Booking | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reference.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const res = await bookingsApi.getByReference(trimmed);
      setBooking(res.booking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking not found. Please check your reference number.");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = booking ? (STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending) : null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", animation: "backdropIn 0.25s ease" }}
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: modalBg, boxShadow: "0 32px 96px rgba(0,0,0,0.5)", animation: "modalSlideIn 0.3s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6" style={{ borderBottom: `1px solid ${border}` }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 3 }}>
              Guest Services
            </p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 400, color: text }}>
              Find Your Reservation
            </h2>
          </div>
          <button onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${border}`, background: "transparent", color: sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>
            ✕
          </button>
        </div>

        <div className="px-8 py-6">
          {/* Search form */}
          <form onSubmit={handleLookup} className="flex gap-3 mb-6">
            <div style={{ flex: 1 }}>
              <input
                autoFocus
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. HSV-84920"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  letterSpacing: "0.08em",
                  color: text,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: 3,
                  padding: "12px 16px",
                  width: "100%",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </div>
            <button type="submit" disabled={loading || !reference.trim()}
              style={{
                padding: "0 22px",
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)",
                color: "#0d2233",
                border: "none",
                borderRadius: 3,
                cursor: loading || !reference.trim() ? "not-allowed" : "pointer",
                opacity: loading || !reference.trim() ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? (
                <span style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#0d2233", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              ) : "Look Up"}
            </button>
          </form>

          {/* Error state */}
          {error && (
            <div style={{ background: "rgba(224,112,112,0.1)", border: "1px solid rgba(224,112,112,0.3)", borderRadius: 4, padding: "14px 18px", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#e07070" }}>✕ {error}</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub, marginTop: 4 }}>
                Reference numbers are in the format HSV-XXXXX. Check your confirmation email.
              </p>
            </div>
          )}

          {/* Booking result */}
          {booking && statusConfig && (
            <div style={{ animation: "modalSlideIn 0.3s ease" }}>
              {/* Status banner */}
              <div style={{
                background: `${statusConfig.color}18`,
                border: `1px solid ${statusConfig.color}44`,
                borderRadius: 6,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: "50%",
                  background: `${statusConfig.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {statusConfig.icon}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: statusConfig.color, marginBottom: 2 }}>
                    Booking Status
                  </p>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: statusConfig.color }}>
                    {statusConfig.label}
                  </p>
                </div>
              </div>

              {/* Reference */}
              <div style={{ background: dark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 4, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 3 }}>Reference Number</p>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: text }}>{booking.bookingReference}</p>
                </div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>
                  {new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Guest Name",   value: booking.guestName },
                  { label: "Room",         value: booking.roomName },
                  { label: "Check-In",     value: formatDate(booking.checkIn) },
                  { label: "Check-Out",    value: formatDate(booking.checkOut) },
                  { label: "Nights",       value: `${booking.nights} nights` },
                  { label: "Guests",       value: `${booking.adults} adults${booking.children > 0 ? `, ${booking.children} children` : ""}` },
                ].map((item) => (
                  <div key={item.label} style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f9f5ef", border: `1px solid ${border}`, borderRadius: 4, padding: "12px 14px" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: sub, marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: text }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 4, padding: "16px 18px", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Payment Summary</p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: sub }}>
                      ${booking.basePrice}/night × {booking.nights} nights
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: text }}>
                      ${(booking.basePrice * booking.nights).toFixed(2)}
                    </span>
                  </div>
                  {booking.discountPercent > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#4caf82" }}>
                        Discount ({booking.discountPercent}% — {booking.promoCode})
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#4caf82" }}>
                        −${((booking.basePrice * booking.nights * booking.discountPercent) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8, marginTop: 4 }} className="flex justify-between">
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: text }}>Total</span>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "#c9a84c" }}>${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>Advance Payment (50%)</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: text }}>${booking.advancePayment.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>Balance Due on Arrival</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: text }}>${(booking.totalPrice - booking.advancePayment).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div style={{ border: `1px solid ${border}`, borderRadius: 4, padding: "12px 16px", marginBottom: 16 }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 6 }}>Special Requests</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: sub, lineHeight: 1.6 }}>{booking.notes}</p>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <button onClick={onClose}
                  style={{ flex: 1, padding: "12px", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", border: `1px solid ${border}`, color: sub, borderRadius: 3, cursor: "pointer" }}>
                  Close
                </button>
                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <button onClick={() => { onClose(); onBook(); }}
                    style={{ flex: 2, padding: "12px", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 3, cursor: "pointer" }}>
                    Make Another Booking
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty hint */}
          {!booking && !error && !loading && (
            <div className="flex flex-col items-center py-8 text-center">
              <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid rgba(201,168,76,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#c9a84c" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: text, marginBottom: 8 }}>Enter your booking reference</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: sub, maxWidth: 300, lineHeight: 1.65 }}>
                Your reference number (e.g. HSV-84920) was included in your reservation confirmation.
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub, marginTop: 12 }}>
                Need help? Contact us at{" "}
                <a href="tel:+94763740090" style={{ color: "#c9a84c", textDecoration: "none" }}>+94 76 374 0090</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
