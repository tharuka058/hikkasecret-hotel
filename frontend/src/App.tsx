import React, { useState, useEffect, useRef, useCallback } from "react";
import { bookingsApi, offersApi } from "./services/api.js";
import AdminModal from "./components/AdminModal.js";
import BookingLookupModal from "./components/BookingLookupModal.js";

// ─── Theme context ────────────────────────────────────────────────────────────
type Theme = "light" | "dark";

// ─── Data ─────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    url: "/images/dining/breakfast.jpg",
    caption: "Fresh tropical breakfast by the lake",
  },
  {
    url: "/images/hero/pool-wide.jpg",
    caption: "Infinity pool at dusk",
  },
  {
    url: "/images/hero/aerial-pool.jpg",
    caption: "Resort pool among the palms",
  },
  {
    url: "/images/hero/pool-side.jpg",
    caption: "Golden hour at the pool terrace",
  },
  {
    url: "/images/hero/lake-sunset.jpg",
    caption: "Serene lake at sunset",
  },
  {
    url: "/images/hero/villa-exterior.jpg",
    caption: "Villa view from the lush garden",
  },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "LKR", symbol: "Rs", rate: 315 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "AUD", symbol: "A$", rate: 1.53 },
];

// Real room amenities shared across all doubles
const ROOMS = [
  {
    id: 1,
    name: "Deluxe Double Room",
    type: "Deluxe Double Room with Lake & Pool View",
    thumb: "/images/rooms/deluxe-main.jpg",
    gallery: [
      "/images/rooms/deluxe-main.jpg",
      "/images/rooms/double-bed.jpg",
      "/images/booking_gallery/booking-photo-16.png",
      "/images/booking_gallery/booking-photo-17.png",
      "/images/booking_gallery/booking-photo-18.png",
      "/images/booking_gallery/booking-photo-19.png",
      "/images/booking_gallery/booking-photo-20.png",
      "/images/booking_gallery/booking-photo-21.png",
      "/images/booking_gallery/booking-photo-22.png",
      "/images/booking_gallery/booking-photo-23.png",
      "/images/booking_gallery/booking-photo-24.png",
      "/images/booking_gallery/booking-photo-25.png",
      "/images/booking_gallery/booking-photo-26.png",
      "/images/booking_gallery/booking-photo-27.png",
      "/images/booking_gallery/booking-photo-28.png",
      "/images/booking_gallery/booking-photo-29.png",
      "/images/booking_gallery/booking-photo-30.png",
      "/images/rooms/room-interior-1.jpg",
      "/images/rooms/room-interior-2.jpg",
      "/images/rooms/bed-detail.jpg",
      "/images/rooms/bathroom.jpg",
      "/images/rooms/vanity.jpg",
    ],
    price: 85,
    rating: "9.3 Comfy beds (Based on 43 reviews)",
    bedType: "1 Extra-Long King Bed (> 80 inches)",
    tags: ["28 m²", "1 Extra-Long King Bed", "Private Bathroom & Bidet", "Lake View", "Garden View", "Pool View", "Balcony & Terrace", "Barbecue", "A/C", "Free Wi-Fi", "Electric Kettle", "Personal Fridge"],
    desc: "This double room's special feature is the pool with a view. The spacious double room provides air conditioning, a seating area, a terrace & balcony with lake views as well as a private bathroom featuring a shower & bidet. Features 1 extra-long king bed.",
    size: "28 m²",
    maxGuests: 2,
    kitchen: ["Personal Refrigerator", "Electric Kettle", "Outdoor Dining Area", "Barbecue", "Dining Area", "Dining Table"],
    bathroom: ["Free Toiletries", "Bidet", "Toilet", "Bath or Shower", "Towels", "Towels/sheets (extra fee)", "Toilet Paper"],
    views: ["Lake View", "Garden View", "Pool View"],
    facilities: [
      "Balcony",
      "Terrace",
      "Air conditioning",
      "Linens",
      "Socket near the bed",
      "Tile/marble floor",
      "Desk",
      "Seating area",
      "Refrigerator",
      "Ironing facilities",
      "Extra long beds (> 80 inches)",
      "Electric kettle",
      "Outdoor dining area",
      "Barbecue",
      "Dining area",
      "Dining table",
      "Upper floors accessible by stairs only",
      "Clothes rack",
      "Drying rack for clothing",
      "Free Wi-Fi",
      "Smoking permitted",
    ],
  },
  {
    id: 2,
    name: "The Lake Apartment",
    type: "Private 85 m² Apartment with Lake View",
    thumb: "/images/rooms/apt-living.jpg",
    gallery: [
      "/images/rooms/apt-living.jpg",
      "/images/rooms/apt-interior-1.jpg",
      "/images/rooms/apt-kitchen.jpg",
      "/images/booking_gallery/booking-photo-20.png",
      "/images/booking_gallery/booking-photo-21.png",
      "/images/booking_gallery/booking-photo-22.png",
      "/images/booking_gallery/booking-photo-23.png",
      "/images/rooms/bathroom-shower.jpg",
      "/images/rooms/night-ambient.jpg",
    ],
    price: 150,
    rating: "9.3 Comfy beds (Based on 43 reviews)",
    bedType: "1 King Bed & 1 Sofa Bed (2 Beds)",
    tags: ["85 m²", "1 King Bed + 1 Sofa Bed", "Private Kitchen", "Washing Machine", "Lake View", "Garden View", "Pool View", "Balcony & Terrace", "Barbecue", "A/C", "Free Wi-Fi", "Private Bathroom & Bidet"],
    desc: "The pool with a view is a top feature of this spacious 85 m² double room / apartment. Guests will find a refrigerator and an electric kettle in the kitchen. The unit also includes a barbecue. The spacious apartment features air conditioning, a washing machine, a terrace with lake views as well as a private bathroom boasting a shower & bidet. Features 2 beds (1 king bed & 1 sofa bed).",
    size: "85 m²",
    maxGuests: 4,
    kitchen: [
      "Washing machine",
      "Refrigerator",
      "Electric kettle",
      "Dining table",
      "Kitchenette",
    ],
    bathroom: [
      "Free toiletries",
      "Bidet",
      "Toilet",
      "Bath or shower",
      "Towels",
      "Towels/sheets (extra fee)",
      "Toilet paper",
    ],
    views: [
      "Lake view",
      "Garden view",
      "Pool view",
    ],
    facilities: [
      "Balcony",
      "Terrace",
      "Air conditioning",
      "Kitchen",
      "Washing machine",
      "Sofa",
      "Linens",
      "Socket near the bed",
      "Tile/marble floor",
      "Desk",
      "Seating area",
      "Private entrance",
      "Refrigerator",
      "Mosquito net",
      "Ironing facilities",
      "Kitchenette",
      "Extra long beds (> 80 inches)",
      "Electric kettle",
      "Outdoor dining area",
      "Barbecue",
      "Dining area",
      "Dining table",
      "Upper floors accessible by stairs only",
      "Clothes rack",
      "Drying rack for clothing",
      "Free Wi-Fi",
      "Smoking permitted",
    ],
  },
  {
    id: 3,
    name: "Whole Villa",
    type: "4 Rooms + 85 m² Apartment",
    thumb: "/images/villa/master-suite.jpg",
    gallery: [
      "/images/villa/master-suite.jpg",
      "/images/hero/villa-exterior.jpg",
      "/images/booking_gallery/booking-photo-01.png",
      "/images/booking_gallery/booking-photo-05.png",
      "/images/booking_gallery/booking-photo-10.png",
      "/images/gallery/villa-architecture.jpg",
      "/images/gallery/pool-reflection.jpg",
    ],
    price: 490,
    rating: "9.8 Exceptional Exclusive Luxury",
    bedType: "4 King Beds + 1 Sofa Bed (5 Beds total)",
    tags: ["4 Double Rooms", "85 m² Lake Apartment", "Lush Garden", "Pool Access", "Lake Activities", "Lake View", "Garden View", "Free Wi-Fi", "Total Privacy", "Up to 12 Guests"],
    desc: "Book the entire Hikka Secret Lake Villa exclusively for your group. All 4 double rooms plus the 85 m² lake apartment are yours — complete with the private outdoor swimming pool, tropical garden, kitchen, barbecue facilities, and absolute privacy by the lake.",
    size: "Entire Property (350+ m²)",
    maxGuests: 12,
    villa: true,
    kitchen: ["Fully Equipped Kitchen", "Washing Machine", "Refrigerators", "Electric Kettles", "Barbecue Facilities", "Indoor & Outdoor Dining Tables"],
    bathroom: ["5 Private Bathrooms", "Free Toiletries", "Bidets", "Bath or Shower", "Towels & Linens"],
    views: ["Panoramic Lake View", "Tropical Garden View", "Swimming Pool View"],
    facilities: ["Private Swimming Pool", "Private Barbecue Area", "Lake Kayaks & Boat", "Private Entrance", "Air Conditioning Throughout", "Free High-Speed Wi-Fi", "Total Privacy for up to 12 Guests"],
  },
];

const AMENITY_ICONS: Record<string, React.ReactElement> = {
  pool: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22c2 0 3-1.5 5-1.5S10 22 12 22s3-1.5 5-1.5S20 22 22 22s3-1.5 5-1.5S30 22 30 22" />
      <path d="M2 27c2 0 3-1.5 5-1.5S10 27 12 27s3-1.5 5-1.5S20 27 22 27s3-1.5 5-1.5S30 27 30 27" />
      <circle cx="21" cy="8" r="2.5" />
      <path d="M21 10.5v5l-5 4" /><path d="M11 19.5l4-4 3 3" />
    </svg>
  ),
  garden: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 28V14" /><path d="M16 14c0-5 6-10 6-10s0 8-6 10" />
      <path d="M16 18c0-4-6-8-6-8s1 7 6 8" /><path d="M8 28h16" />
    </svg>
  ),
  dining: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4v8a4 4 0 0 0 8 0V4" /><path d="M14 12v16" />
      <path d="M22 4v24" /><path d="M19 4c0 4 3 6 3 8" />
    </svg>
  ),
  lake: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h24" /><path d="M7 20l3-8h12l3 8" />
      <path d="M13 12V8" /><path d="M10 8h12" />
      <path d="M2 24c3 0 4-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2" />
    </svg>
  ),
  spa: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 6c0 0-8 6-8 13a8 8 0 0 0 16 0c0-7-8-13-8-13z" />
      <path d="M16 19v9" /><path d="M12 22l4-3 4 3" />
    </svg>
  ),
  transfer: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22c0-4 4-8 12-8s12 4 12 8" />
      <path d="M16 14V8" />
      <path d="M10 10l6-4 6 4" />
      <ellipse cx="16" cy="22" rx="5" ry="2.5" />
      <path d="M8 20c1.5-1.5 3.5-2.5 8-2.5" />
      <path d="M24 20c-1.5-1.5-3.5-2.5-8-2.5" />
    </svg>
  ),
  beach: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 26h24" /><path d="M12 26c0-6 4-14 4-14s4 8 4 14" />
      <path d="M12 12c-2-4-6-6-6-6s2 5 6 6z" /><path d="M20 12c2-4 6-6 6-6s-2 5-6 6z" />
    </svg>
  ),
  ac: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="28" height="10" rx="2" />
      <path d="M8 17v4M16 17v4M24 17v4" />
      <path d="M6 12h4M13 12h6M23 12h3" />
    </svg>
  ),
  wifi: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11a20 20 0 0 1 28 0" /><path d="M6 16a14 14 0 0 1 20 0" />
      <path d="M10 21a8 8 0 0 1 12 0" /><circle cx="16" cy="26" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const AMENITIES = [
  { iconKey: "pool", label: "Outdoor Swimming Pool" },
  { iconKey: "lake", label: "Garden & Lake Views" },
  { iconKey: "dining", label: "Fully Equipped Kitchen" },
  { iconKey: "spa", label: "Hot Water Showers" },
  { iconKey: "transfer", label: "Lake Activities" },
  { iconKey: "beach", label: "Beach 1 km Away" },
  { iconKey: "ac", label: "Air Conditioning" },
  { iconKey: "wifi", label: "Free Wi-Fi" },
];

// ─── Sun / Moon icons ─────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Villa Logo Icon ─────────────────────────────────────────────────────────
function VillaLogoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#f3e5ab" />
          <stop offset="100%" stopColor="#b8933a" />
        </linearGradient>
      </defs>
      {/* Outer Diamond Crest */}
      <rect x="20" y="3" width="24" height="24" rx="3" transform="rotate(45 20 3)" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" opacity="0.85" />
      {/* Villa Monogram 'H' & Lake Motif */}
      <path d="M14 13V27M26 13V27M14 20H26" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 29C14.5 28 17.5 28 20 29C22.5 30 25.5 30 28 29" stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}
// ─── Custom Date Input (dd/mm/yyyy format) ──────────────────────────────────
function DateInput({
  label,
  value,
  onChange,
  required,
  style,
  inputStyle,
  labelStyle,
  placeholder = "dd/mm/yyyy",
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  placeholder?: string;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const formattedDisplay = (() => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return value;
  })();

  const openPicker = () => {
    if (hiddenInputRef.current) {
      if (typeof hiddenInputRef.current.showPicker === "function") {
        try {
          hiddenInputRef.current.showPicker();
        } catch {
          hiddenInputRef.current.focus();
        }
      } else {
        hiddenInputRef.current.focus();
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div
        onClick={openPicker}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          ...inputStyle,
        }}
      >
        <span style={{ color: "inherit", fontFamily: "var(--font-sans)" }}>
          {formattedDisplay || placeholder}
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.85 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <input
        ref={hiddenInputRef}
        type="date"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 5,
        }}
      />
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const SIDE_NAV_LINKS = [
  { label: "The Property", href: "#property" },
  { label: "Accommodations", href: "#accommodations" },
  { label: "Dining", href: "#dining" },
  { label: "Gallery", href: "#gallery" },
  { label: "Offers", href: "#offers" },
  { label: "Amenities", href: "#amenities" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#contact" },
];

function Navbar({
  scrolled, theme, toggleTheme, onBook,
}: {
  scrolled: boolean; theme: Theme; toggleTheme: () => void; onBook: () => void;
}) {
  const dark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);

  // Secure staff access via specific secret URL hash (#hsv_portal) or keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const checkHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === "#hsv_portal") {
        setAdminOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    const h = window.location.hash.toLowerCase();
    if (h === "#hsv_portal") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? dark ? "rgba(11,26,38,0.97)" : "rgba(255,251,245,0.97)"
            : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled
            ? `1px solid ${dark ? "rgba(201,168,76,0.18)" : "rgba(201,168,76,0.3)"}`
            : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
          {/* Left Group: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(true)}
              style={{ display: "flex", flexDirection: "column", gap: 5, background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
              aria-label="Open menu"
            >
              <span style={{ display: "block", width: 22, height: 1.5, background: scrolled ? (dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)") : "#ffffff", borderRadius: 2, transition: "all 0.3s" }} />
              <span style={{ display: "block", width: 16, height: 1.5, background: scrolled ? (dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)") : "#ffffff", borderRadius: 2, transition: "all 0.3s" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: scrolled ? (dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)") : "#ffffff", borderRadius: 2, transition: "all 0.3s" }} />
            </button>

            {/* Brand Logo on Left */}
            <a href="#" className="flex items-center gap-3 select-none cursor-pointer text-left" style={{ textDecoration: "none" }}>
              <VillaLogoIcon />
              <div className="flex flex-col leading-none">
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  HIKKA SECRET
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 400, color: scrolled ? (dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)") : "rgba(255,255,255,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>
                  Lake Villa · Hikkaduwa
                </span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", border: `1px solid ${scrolled ? (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)") : "rgba(255,255,255,0.3)"}`, background: "transparent", cursor: "pointer", color: scrolled ? (dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)") : "rgba(255,255,255,0.8)", transition: "all 0.2s" }}
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            {/* Find Reservation */}
            <button onClick={() => setLookupOpen(true)}
              className="hidden sm:inline-block"
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "9px 14px", background: "transparent", color: scrolled ? (dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)") : "rgba(255,255,255,0.8)", border: `1px solid ${scrolled ? (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)") : "rgba(255,255,255,0.3)"}`, borderRadius: 2, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
              title="Find your booking"
            >
              My Booking
            </button>
            {/* Book CTA */}
            <button onClick={onBook}
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", padding: "9px 16px", background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 2, cursor: "pointer", transition: "opacity 0.2s, transform 0.15s", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Side nav overlay */}
      {adminOpen && <AdminModal theme={theme} onClose={handleCloseAdmin} />}
      {lookupOpen && <BookingLookupModal theme={theme} onClose={() => setLookupOpen(false)} onBook={onBook} />}

      {menuOpen && (
        <div className="fixed inset-0 z-[60]" style={{ animation: "backdropIn 0.25s ease" }}>
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={() => setMenuOpen(false)} />
          {/* Panel */}
          <div className="absolute top-0 left-0 h-full" style={{ width: 320, background: dark ? "#0b1a26" : "#ffffff", boxShadow: "4px 0 40px rgba(0,0,0,0.3)", animation: "modalSlideIn 0.3s ease", display: "flex", flexDirection: "column", padding: "32px 40px" }}>
            {/* Close */}
            <button onClick={() => setMenuOpen(false)}
              style={{ alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", marginBottom: 48, padding: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l14 14M17 3L3 17" />
              </svg>
            </button>

            {/* Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {SIDE_NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, color: dark ? "rgba(232,224,208,0.85)" : "rgba(13,34,51,0.85)", textDecoration: "none", padding: "14px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(26,58,82,0.08)"}`, transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#c9a84c")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = dark ? "rgba(232,224,208,0.85)" : "rgba(13,34,51,0.85)")}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Bottom contact */}
            <div style={{ marginTop: "auto", paddingTop: 32, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(26,58,82,0.08)"}` }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 8 }}>Call Us</p>
              <a href="tel:+94763740090" style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: dark ? "#e8e0d0" : "#0d2233", textDecoration: "none" }}>+94 76 374 0090</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
interface BookingPrefill {
  checkin: string;
  checkout: string;
  adults?: number;
  children?: number;
  roomsCount?: number;
  roomConfigs?: { adults: number; children: number; customRoomId?: number }[];
}
function Hero({ onBook }: { onBook: (prefill?: BookingPrefill) => void }) {
  const [slide, setSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guestOpen, setGuestOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);

  const addRoom = () => setRooms(r => [...r, { adults: 1, children: 0 }]);
  const removeRoom = (i: number) => setRooms(r => r.filter((_, idx) => idx !== i));
  const updateRoom = (i: number, field: "adults" | "children", val: number) =>
    setRooms(r => r.map((rm, idx) => idx === i ? { ...rm, [field]: val } : rm));

  const totalAdults = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children, 0);
  const guestLabel = `${totalAdults} Adult${totalAdults !== 1 ? "s" : ""}${totalChildren > 0 ? `, ${totalChildren} Child${totalChildren !== 1 ? "ren" : ""}` : ""} · ${rooms.length} Room${rooms.length !== 1 ? "s" : ""}`;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    setSlide(idx);
    setAnimKey((k) => k + 1);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => goTo((slide + 1) % HERO_SLIDES.length), 5500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slide, goTo]);

  useEffect(() => {
    if (!guestOpen) return;
    const handler = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setGuestOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [guestOpen]);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-visible" style={{ minHeight: "100vh" }}>
      {/* Slides */}
      <div className="absolute inset-0 overflow-hidden">
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slide ? 1 : 0, background: "#0d2233" }}
          >
            <img src={s.url} alt={s.caption} className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.82, animation: i === slide ? `kenBurns 6s ease-out both` : "none" }} key={`img-${i}-${animKey}`}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(11,26,38,0.45) 0%, rgba(11,26,38,0.25) 45%, rgba(11,26,38,0.65) 80%, #0b1a26 100%)" }} />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full" style={{ paddingTop: "clamp(75px, 12vh, 110px)", paddingBottom: 40 }}>
        <p className="fade-up fade-up-1" style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>
          Hikkaduwa · Sri Lanka
        </p>
        <h1 className="fade-up fade-up-2" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px, 7.5vw, 92px)", fontWeight: 300, lineHeight: 1.05, color: "#ffffff", marginBottom: 14, maxWidth: 820 }}>
          Hikka Secret<br />
          <em style={{ fontStyle: "italic", color: "#e6c97a" }}>Lake Villa</em>
        </h1>
        <p className="fade-up fade-up-3" style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(13px, 3.5vw, 15px)", fontWeight: 300, letterSpacing: "0.04em", color: "rgba(255,255,255,0.75)", marginBottom: "clamp(24px, 5vh, 48px)", maxWidth: 460 }}>
          Your Private Luxury Sanctuary by the Lake &amp; Beach
        </p>

        {/* Booking widget — Dedicated Mobile View (< 768px) */}
        <div className="fade-up fade-up-4 w-full block md:hidden max-w-sm mx-auto">
          <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderRadius: 8, padding: 12, border: "1px solid #e8d5bc", boxShadow: "0 20px 48px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              {/* Check-in */}
              <div style={{ background: "#fcf8f2", padding: "10px 12px", borderRadius: 6, border: "1px solid #e8d5bc" }}>
                <label style={{ fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 3, display: "block" }}>
                  CHECK-IN
                </label>
                <DateInput value={checkin} onChange={setCheckin} placeholder="dd/mm/yyyy" inputStyle={{ border: "none", outline: "none", fontSize: 12, color: "#0d2233", background: "transparent", padding: 0, width: "100%" }} />
              </div>
              {/* Check-out */}
              <div style={{ background: "#fcf8f2", padding: "10px 12px", borderRadius: 6, border: "1px solid #e8d5bc" }}>
                <label style={{ fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 3, display: "block" }}>
                  CHECK-OUT
                </label>
                <DateInput value={checkout} onChange={setCheckout} placeholder="dd/mm/yyyy" inputStyle={{ border: "none", outline: "none", fontSize: 12, color: "#0d2233", background: "transparent", padding: 0, width: "100%" }} />
              </div>
            </div>

            {/* Guests */}
            <div style={{ background: "#fcf8f2", padding: "10px 12px", borderRadius: 6, border: "1px solid #e8d5bc", marginBottom: 10, position: "relative" }}>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 3, display: "block" }}>
                GUESTS & ROOMS
              </label>
              <button
                type="button"
                onClick={() => setGuestOpen((o) => !o)}
                style={{ border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: 12, color: "#0d2233", background: "transparent", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0, width: "100%" }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{guestLabel}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0d2233" strokeWidth="1.5" strokeLinecap="round" style={{ transform: guestOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {guestOpen && (
                <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, width: "100%", maxHeight: "55vh", overflowY: "auto", background: "#ffffff", borderRadius: 6, boxShadow: "0 16px 40px rgba(0,0,0,0.3)", zIndex: 200, border: "1px solid #e8d5bc" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f0e8dc", background: "#fdf9f5" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "#0d2233", margin: 0 }}>Rooms</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button type="button" onClick={() => rooms.length > 1 && removeRoom(rooms.length - 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${rooms.length > 1 ? "#c9a84c" : "#e0d0bc"}`, background: "transparent", color: rooms.length > 1 ? "#c9a84c" : "#ccc", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", cursor: rooms.length > 1 ? "pointer" : "default" }}>−</button>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#0d2233" }}>{rooms.length}</span>
                      <button type="button" onClick={addRoom} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #c9a84c", background: "transparent", color: "#c9a84c", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>+</button>
                    </div>
                  </div>
                  {rooms.map((rm, ri) => (
                    <div key={ri} style={{ borderBottom: "1px solid #f0e8dc", padding: "8px 14px" }}>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 6 }}>Room {ri + 1}</p>
                      {[
                        { label: "Adults", field: "adults" as const, val: rm.adults, min: 1, max: 10 },
                        { label: "Children", field: "children" as const, val: rm.children, min: 0, max: 6 },
                      ].map((row) => (
                        <div key={row.field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0" }}>
                          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#0d2233" }}>{row.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button type="button" onClick={() => updateRoom(ri, row.field, Math.max(row.min, row.val - 1))} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #c9a84c", background: "transparent", color: "#c9a84c", fontSize: 14 }}>−</button>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2233" }}>{row.val}</span>
                            <button type="button" onClick={() => updateRoom(ri, row.field, Math.min(row.max, row.val + 1))} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #c9a84c", background: "transparent", color: "#c9a84c", fontSize: 14 }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ padding: "8px 14px", background: "#fdf9f5", display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setGuestOpen(false)} style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, color: "#fff", background: "#c9a84c", border: "none", borderRadius: 2, padding: "6px 16px" }}>Done ✓</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onBook({ checkin, checkout, adults: totalAdults, children: totalChildren, roomsCount: rooms.length, roomConfigs: rooms })}
              style={{ width: "100%", padding: "12px 0", background: "linear-gradient(135deg, #c9a84c 0%, #b8933a 100%)", color: "#0d2233", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4, boxShadow: "0 4px 14px rgba(201,168,76,0.35)" }}
            >
              Check Availability
            </button>
          </div>
        </div>

        {/* Booking widget — Dedicated Desktop View (>= 768px) */}
        <div className="fade-up fade-up-4 w-full hidden md:block" style={{ maxWidth: 780 }}>
          <div className="hero-search-bar" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1.2fr auto",
            background: "rgba(255,255,255,0.97)",
            borderRadius: 4,
            overflow: "visible",
            boxShadow: "0 28px 72px rgba(0,0,0,0.4)",
          }}>
            {/* Check-in */}
            <div className="hero-search-item" style={{ borderRight: "1px solid #e8d5bc", padding: "14px 18px" }}>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 5, display: "block" }}>
                CHECK-IN
              </label>
              <DateInput
                value={checkin}
                onChange={setCheckin}
                placeholder="dd/mm/yyyy"
                inputStyle={{ border: "none", outline: "none", fontSize: 13, color: "#0d2233", background: "transparent", padding: 0 }}
              />
            </div>
            {/* Check-out */}
            <div className="hero-search-item" style={{ borderRight: "1px solid #e8d5bc", padding: "14px 18px" }}>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 5, display: "block" }}>
                CHECK-OUT
              </label>
              <DateInput
                value={checkout}
                onChange={setCheckout}
                placeholder="dd/mm/yyyy"
                inputStyle={{ border: "none", outline: "none", fontSize: 13, color: "#0d2233", background: "transparent", padding: 0 }}
              />
            </div>
            {/* Guests */}
            <div ref={guestRef} className="hero-search-item" style={{ borderRight: "1px solid #e8d5bc", padding: "14px 18px", position: "relative" }}>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 5, display: "block" }}>
                GUESTS & ROOMS
              </label>
              <button
                type="button"
                onClick={() => setGuestOpen((o) => !o)}
                style={{ border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: 13, color: "#0d2233", background: "transparent", cursor: "pointer", textAlign: "left", display: "flex", items: "center", gap: 6, padding: 0, width: "100%" }}
              >
                <span style={{ flex: 1 }}>{guestLabel}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0d2233" strokeWidth="1.5" strokeLinecap="round"
                  style={{ transform: guestOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {guestOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    width: 290,
                    maxHeight: "65vh",
                    overflowY: "auto",
                    background: "#ffffff",
                    borderRadius: 6,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
                    zIndex: 200,
                    border: "1px solid #e8d5bc",
                  }}
                >
                  {/* Rooms row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid #f0e8dc", background: "#fdf9f5" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#0d2233", margin: 0 }}>Rooms</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => rooms.length > 1 && removeRoom(rooms.length - 1)}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${rooms.length > 1 ? "#c9a84c" : "#e0d0bc"}`, background: "transparent", color: rooms.length > 1 ? "#c9a84c" : "#ccc", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: rooms.length > 1 ? "pointer" : "default", fontWeight: 600, lineHeight: 1 }}
                      >−</button>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#0d2233", minWidth: 20, textAlign: "center" }}>{rooms.length}</span>
                      <button
                        type="button"
                        onClick={addRoom}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #c9a84c", background: "transparent", color: "#c9a84c", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 600, lineHeight: 1 }}
                      >+</button>
                    </div>
                  </div>

                  {/* Per-room adult / children */}
                  {rooms.map((rm, ri) => (
                    <div key={ri} style={{ borderBottom: "1px solid #f0e8dc" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px 2px" }}>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", margin: 0 }}>
                          Room {ri + 1}
                        </p>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoom(ri)}
                            style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e07070", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                          >Remove</button>
                        )}
                      </div>

                      {[
                        { label: "Adults", sub: "Age 12+", field: "adults" as const, val: rm.adults, min: 1, max: 10 },
                        { label: "Children", sub: "Age 2–11", field: "children" as const, val: rm.children, min: 0, max: 6 },
                      ].map((row) => (
                        <div key={row.field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px" }}>
                          <div>
                            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: "#0d2233", margin: 0 }}>{row.label}</p>
                            <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "#8a9aaa", margin: 0 }}>{row.sub}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => updateRoom(ri, row.field, Math.max(row.min, row.val - 1))}
                              style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${row.val > row.min ? "#c9a84c" : "#e0d0bc"}`, background: "transparent", color: row.val > row.min ? "#c9a84c" : "#ccc", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", cursor: row.val > row.min ? "pointer" : "default", fontWeight: 600 }}
                            >−</button>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#0d2233", minWidth: 20, textAlign: "center" }}>{row.val}</span>
                            <button
                              type="button"
                              onClick={() => updateRoom(ri, row.field, Math.min(row.max, row.val + 1))}
                              style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #c9a84c", background: "transparent", color: "#c9a84c", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 600 }}
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Done button */}
                  <div style={{ padding: "12px 18px", background: "#fdf9f5", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => setGuestOpen(false)}
                      style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", background: "linear-gradient(135deg, #c9a84c, #b8933a)", border: "none", borderRadius: 2, padding: "8px 20px", cursor: "pointer" }}
                    >
                      Done ✓
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Check Availability CTA */}
            <button
              onClick={() => onBook({ checkin, checkout, adults: totalAdults, children: totalChildren, roomsCount: rooms.length, roomConfigs: rooms })}
              style={{ padding: "0 28px", background: "linear-gradient(135deg, #c9a84c 0%, #b8933a 100%)", color: "#0d2233", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer", minHeight: 64, transition: "opacity 0.2s", whiteSpace: "nowrap", borderRadius: "0 4px 4px 0" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Check<br />Availability
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex items-center gap-2 mt-10">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, background: i === slide ? "#c9a84c" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", transition: "all 0.4s", padding: 0 }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide nav arrows (hidden on mobile for clean smartphone view) */}
        {[{ dir: -1, pos: "left-4" }, { dir: 1, pos: "right-4" }].map(({ dir, pos }) => (
          <button key={dir}
            onClick={() => goTo((slide + dir + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className={`hidden sm:flex absolute ${pos} top-1/2 -translate-y-1/2 z-20`}
            style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)", color: "#fff", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.4)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.25)")}
          >
            {dir === -1 ? <ChevronLeft /> : <ChevronRight />}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Location highlight SVG icons ─────────────────────────────────────────────
const HIGHLIGHT_ICONS: Record<string, React.ReactElement> = {
  beach: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 26h24" />
      <path d="M12 26c0-6 4-14 4-14s4 8 4 14" />
      <path d="M12 12c-2-4-6-6-6-6s2 5 6 6z" />
      <path d="M20 12c2-4 6-6 6-6s-2 5-6 6z" />
    </svg>
  ),
  lake: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18c3 0 4-2.5 6-2.5S11 18 14 18s3-2.5 6-2.5S23 18 26 18s3-2.5 4-2.5" />
      <path d="M2 24c3 0 4-2.5 6-2.5S11 24 14 24s3-2.5 6-2.5S23 24 26 24s3-2.5 4-2.5" />
      <path d="M8 14V8l8-4 8 4v6" />
    </svg>
  ),
  pool: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20c2.5 0 3.5-2 6-2s3.5 2 6 2 3.5-2 6-2 3.5 2 6 2" />
      <path d="M2 26c2.5 0 3.5-2 6-2s3.5 2 6 2 3.5-2 6-2 3.5 2 6 2" />
      <path d="M20 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
      <path d="M20 12v5l-6 3" />
      <path d="M10 20l4-5 3.5 3.5" />
    </svg>
  ),
  privacy: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3L4 9v8c0 7 5.4 12.6 12 14 6.6-1.4 12-7 12-14V9z" />
      <path d="M11 16l3 3 7-7" />
    </svg>
  ),
};

// ─── Location ─────────────────────────────────────────────────────────────────
function LocationSection({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  const bg = dark ? "#0f2030" : "#f4f0ea";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.12)";
  const cardBg = dark ? "rgba(255,255,255,0.04)" : "#ffffff";

  const highlights = [
    { iconKey: "beach", title: "1 km to Beach", body: "A leisurely walk to Hikkaduwa's famous surf and coral reef." },
    { iconKey: "lake", title: "Private Lake", body: "A glassy freshwater lake entirely within the property boundary." },
    { iconKey: "pool", title: "Infinity Pool", body: "The pool visually merges with the lake at the horizon edge." },
    { iconKey: "privacy", title: "Total Privacy", body: "Gated estate with lush tropical gardens on all sides." },
  ];

  return (
    <section style={{ background: bg }} className="py-24 transition-colors duration-500" id="property">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 16 }}>The Setting</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px, 4vw, 56px)", fontWeight: 400, lineHeight: 1.12, color: text, marginBottom: 20 }}>
            Lake serenity.<br /><em style={{ color: "#c9a84c" }}>Beach moments.</em>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 300, lineHeight: 1.85, color: sub, marginBottom: 40, maxWidth: 440 }}>
            Hikka Secret Lake Villa occupies a rare private peninsula between a glassy freshwater lake and the Indian Ocean. Our infinity pool mirrors the water beyond—and Hikkaduwa Beach is a leisurely 1 km stroll away.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h) => (
              <div key={h.title}
                className="rounded p-5 cursor-default"
                style={{ background: cardBg, border: `1px solid ${border}`, transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#c9a84c"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = border; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ color: "#c9a84c", marginBottom: 12 }}>{HIGHLIGHT_ICONS[h.iconKey]}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500, color: text, marginBottom: 4 }}>{h.title}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 300, color: sub, lineHeight: 1.65 }}>{h.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded overflow-hidden" style={{ height: 260, background: "#1a3a52" }}>
            <img 
              src="/images/gallery/pool-reflection.jpg"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/gallery/garden-path.jpg"; }}
              alt="Lounge chairs by the pool at sunset" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="rounded overflow-hidden" style={{ height: 190, background: "#1a3a52" }}>
            <img 
              src="/images/gallery/garden-path.jpg"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/gallery/patio.jpg"; }}
              alt="Lush tropical garden path" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="rounded overflow-hidden" style={{ height: 190, background: "#1a3a52" }}>
            <img 
              src="/images/gallery/patio.jpg"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/gallery/nature.jpg"; }}
              alt="Relaxing courtyard patio" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Price formatter ─────────────────────────────────────────────────────────
function fmtPrice(usd: number, currency: string): string {
  const c = CURRENCIES.find(x => x.code === currency) ?? CURRENCIES[0];
  const val = Math.round(usd * c.rate);
  return `${c.symbol}${val.toLocaleString()}`;
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room, theme, currency, setCurrency, onSelect }: { room: typeof ROOMS[0]; theme: Theme; currency: string; setCurrency: (c: string) => void; onSelect: () => void }) {
  const [hov, setHov] = useState(false);
  const dark = theme === "dark";
  const cardBg = dark ? "#112233" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.55)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.14)";
  const tagBg = dark ? "rgba(255,255,255,0.07)" : "rgba(26,58,82,0.07)";
  const tagText = dark ? "rgba(232,224,208,0.7)" : "#1a3a52";

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: cardBg, border: `1px solid ${hov ? "#c9a84c" : border}`, borderRadius: 4, overflow: "hidden", transition: "all 0.3s", boxShadow: hov ? "0 16px 48px rgba(13,34,51,0.2)" : "0 2px 12px rgba(0,0,0,0.06)", transform: hov ? "translateY(-5px)" : "translateY(0)", cursor: "pointer" }}
    >
      <div style={{ height: 300, background: "#0d2233", overflow: "hidden", position: "relative" }}>
        <img src={room.thumb} alt={room.name} className="w-full h-full object-cover"
          style={{ objectPosition: "center 45%", transition: "transform 0.6s", transform: hov ? "scale(1.07)" : "scale(1)" }} />
      </div>
      <div className="p-5">
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 5 }}>{room.type}</p>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 21, fontWeight: 500, color: text, marginBottom: 7, lineHeight: 1.2 }}>{room.name}</h3>
        <div className="flex flex-wrap gap-1 mb-4">
          {room.tags.slice(0, 6).map((tag) => (
            <span key={tag} style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: tagText, background: tagBg, padding: "3px 8px", borderRadius: 2 }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 500, color: text }}>
                {fmtPrice(room.price, currency)}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: dark ? "rgba(255,255,255,0.35)" : "#8a9aaa", marginLeft: 4 }}>/night</span>
            </div>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, background: "transparent", border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(26,58,82,0.2)"}`, borderRadius: 2, color: "#c9a84c", padding: "3px 6px", cursor: "pointer", outline: "none" }}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code} style={{ background: "#0d2233", color: "#e8e0d0" }}>{c.code}</option>)}
            </select>
          </div>
          <button onClick={onSelect}
            style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 18px", background: hov ? "linear-gradient(135deg, #c9a84c 0%, #b8933a 100%)" : "transparent", color: hov ? "#0d2233" : "#c9a84c", border: "1px solid #c9a84c", borderRadius: 2, cursor: "pointer", transition: "all 0.2s" }}
          >
            View Room
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Villa full-width card ────────────────────────────────────────────────────
function VillaCard({ room, theme, currency, setCurrency, onSelect }: { room: typeof ROOMS[0]; theme: Theme; currency: string; setCurrency: (c: string) => void; onSelect: () => void }) {
  const [hov, setHov] = useState(false);
  const dark = theme === "dark";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: "relative", borderRadius: 6, overflow: "hidden", minHeight: 480, cursor: "pointer", boxShadow: hov ? "0 24px 64px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.2)", transition: "box-shadow 0.3s" }}
    >
      {/* Full-bleed image */}
      <img src={room.thumb} alt={room.name} className="w-full h-full object-cover absolute inset-0"
        style={{ transition: "transform 0.7s", transform: hov ? "scale(1.04)" : "scale(1)" }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,34,51,0.92) 0%, rgba(13,34,51,0.7) 60%, rgba(13,34,51,0.3) 100%)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-6 py-8 md:px-16 h-full" style={{ maxWidth: 580 }}>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c" }}>{room.type}</span>
          <span className="inline-block sm:hidden" style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, color: "#e6c97a", background: "rgba(13,34,51,0.75)", padding: "2px 8px", borderRadius: 2, border: "1px solid rgba(201,168,76,0.3)" }}>Up to 12 guests</span>
        </div>
        
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 56px)", fontWeight: 400, color: "#ffffff", lineHeight: 1.1, marginBottom: 12 }}>{room.name}</h3>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 18 }}>{room.desc}</p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {room.tags.slice(0, 5).map((tag) => (
            <span key={tag} style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.45)", padding: "4px 10px", borderRadius: 2 }}>{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 300, color: "#e6c97a" }}>{fmtPrice(room.price, currency)}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>/night</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, background: "transparent", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 2, color: "#c9a84c", padding: "3px 6px", cursor: "pointer", outline: "none", marginLeft: 8 }}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code} style={{ background: "#0d2233", color: "#e8e0d0" }}>{c.code}</option>)}
            </select>
          </div>
          <button onClick={onSelect}
            style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", padding: "12px 22px", background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 2, cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Book Whole Villa
          </button>
        </div>
      </div>

      {/* Guest badge top-right */}
      <div style={{ position: "absolute", top: 24, right: 24, background: "rgba(13,34,51,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 3, padding: "8px 16px" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>Entire Property</p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Up to {room.maxGuests} guests · Kids Welcome</p>
      </div>
    </div>
  );
}

// ─── Accommodations ───────────────────────────────────────────────────────────
function AccommodationsSection({ theme, currency, setCurrency, onSelectRoom }: { theme: Theme; currency: string; setCurrency: (c: string) => void; onSelectRoom: (r: typeof ROOMS[0]) => void }) {
  const dark = theme === "dark";
  const bg = dark ? "#0b1a26" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";

  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <section id="accommodations" style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16" style={{ position: "relative" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Accommodations</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, color: text, lineHeight: 1.12 }}>
            Spaces Crafted for <em style={{ color: "#c9a84c" }}>Extraordinary Rest</em>
          </h2>
        </div>

        {/* Double Room + Apartment — two equal cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {ROOMS.filter((r) => !(r as any).villa).map((room) => (
            <RoomCard key={room.id} room={room} theme={theme} currency={currency} setCurrency={setCurrency} onSelect={() => onSelectRoom(room)} />
          ))}
        </div>

        {/* Compare Options CTA Button */}
        <div className="flex justify-center mb-10">
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "14px 28px",
              background: dark ? "rgba(201,168,76,0.12)" : "#fdf9f3",
              color: "#c9a84c",
              border: "1px solid #c9a84c",
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 16px rgba(201,168,76,0.12)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #c9a84c, #e6c97a)";
              (e.currentTarget as HTMLElement).style.color = "#0d2233";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = dark ? "rgba(201,168,76,0.12)" : "#fdf9f3";
              (e.currentTarget as HTMLElement).style.color = "#c9a84c";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" />
              <path d="M8 21H3v-5" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
            Compare Deluxe Room vs Lake Apartment
          </button>
        </div>

        {/* Whole Villa — full width */}
        {ROOMS.filter((r) => (r as any).villa).map((room) => (
          <VillaCard key={room.id} room={room} theme={theme} currency={currency} setCurrency={setCurrency} onSelect={() => onSelectRoom(room)} />
        ))}
      </div>

      {compareOpen && (
        <CompareModal
          theme={theme}
          currency={currency}
          onClose={() => setCompareOpen(false)}
          onSelectRoom={onSelectRoom}
        />
      )}
    </section>
  );
}

// ─── Compare Card Gallery Helper ──────────────────────────────────────────────
function CompareCardGallery({
  room,
  imgIdx,
  setImgIdx,
  badge,
}: {
  room: typeof ROOMS[0];
  imgIdx: number;
  setImgIdx: React.Dispatch<React.SetStateAction<number>>;
  badge?: string;
}) {
  const images = room.gallery && room.gallery.length > 0 ? room.gallery : [room.thumb];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <div style={{ height: 190, position: "relative", overflow: "hidden", background: "#0d2233" }}>
      <img
        src={images[imgIdx]}
        alt={`${room.name} photo ${imgIdx + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)" }} />

      {badge && (
        <span style={{ position: "absolute", top: 8, right: 8, background: "#c9a84c", color: "#0d2233", fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, zIndex: 10 }}>
          {badge}
        </span>
      )}

      {/* Prev / Next Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        style={{
          position: "absolute",
          left: 6,
          top: "50%",
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(13,34,51,0.75)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
        }}
        aria-label="Previous photo"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={handleNext}
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(13,34,51,0.75)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
        }}
        aria-label="Next photo"
      >
        ›
      </button>

      {/* Counter Badge */}
      <div style={{ position: "absolute", bottom: 8, left: 8, zIndex: 10, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", padding: "2px 6px", borderRadius: 2 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, color: "#e6c97a" }}>
          {imgIdx + 1} / {images.length} Photos
        </span>
      </div>

      {/* Dots Indicator */}
      <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 3, zIndex: 10 }}>
        {images.slice(0, 6).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
            style={{
              width: i === imgIdx ? 10 : 4,
              height: 4,
              borderRadius: 2,
              background: i === imgIdx ? "#c9a84c" : "rgba(255,255,255,0.5)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Room Comparison Modal ──────────────────────────────────────────────────
function CompareModal({
  theme,
  currency,
  onClose,
  onSelectRoom,
}: {
  theme: Theme;
  currency: string;
  onClose: () => void;
  onSelectRoom: (r: typeof ROOMS[0]) => void;
}) {
  const dark = theme === "dark";
  const modalBg = dark ? "#0f2030" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(26,58,82,0.12)";
  const cellBg = dark ? "rgba(255,255,255,0.02)" : "#faf8f5";
  const altBg = dark ? "rgba(201,168,76,0.06)" : "#f5f0e6";

  const room1 = ROOMS[0]; // Deluxe Double Room
  const room2 = ROOMS[1]; // The Lake Apartment

  const [imgIdx1, setImgIdx1] = useState(0);
  const [imgIdx2, setImgIdx2] = useState(0);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const features = [
    {
      label: "Nightly Rate",
      val1: `${fmtPrice(room1.price, currency)} / night`,
      val2: `${fmtPrice(room2.price, currency)} / night`,
      highlight: false,
    },
    {
      label: "Living Space Size",
      val1: "28 m² Deluxe Room",
      val2: "85 m² Private Apartment (3x Larger)",
      highlight: true,
    },
    {
      label: "Max Guest Capacity",
      val1: "Up to 3 Guests (2 Adults)",
      val2: "Up to 4 Guests",
      highlight: false,
    },
    {
      label: "Bed Configuration",
      val1: "1 Extra-Long King Bed (> 80 in)",
      val2: "1 King Bed + 1 Sofa Bed (2 Beds)",
      highlight: false,
    },
    {
      label: "Private Kitchen",
      val1: "Not included (Fridge & electric kettle provided in-room)",
      val2: "Included — Full private kitchen (washing machine, fridge, kettle, dining table)",
      highlight: true,
    },
    {
      label: "Washing Machine",
      val1: "Laundry service on request",
      val2: "Included — Private in-room washing machine",
      highlight: false,
    },
    {
      label: "Bathroom Features",
      val1: "Private bathroom with bath/shower & bidet",
      val2: "Private bathroom with shower & bidet",
      highlight: false,
    },
    {
      label: "Balcony & Views",
      val1: "Balcony & terrace with pool, lake & garden views",
      val2: "Balcony & terrace with lake & garden views + private BBQ area",
      highlight: false,
    },
    {
      label: "Ideal For",
      val1: "Couples & solo travelers seeking cozy poolside luxury",
      val2: "Families, long-stays & guests who prefer home-cooked meals",
      highlight: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)", animation: "backdropIn 0.25s ease" }}
      onClick={onClose}
    >
      <div className="w-full max-w-5xl rounded overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto"
        style={{ background: modalBg, animation: "modalSlideIn 0.3s ease", boxShadow: "0 32px 96px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", margin: "0 0 4px" }}>
              Accommodation Comparison
            </p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500, color: text, margin: 0 }}>
              Deluxe Double Room <span style={{ color: "#c9a84c" }}>vs</span> The Lake Apartment
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${border}`, background: "transparent", color: sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: "auto" }}>
            <XIcon />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Top 2 Cards Preview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Card 1 */}
            <div style={{ border: `1px solid ${border}`, borderRadius: 4, overflow: "hidden", background: cellBg }}>
              <CompareCardGallery room={room1} imgIdx={imgIdx1} setImgIdx={setImgIdx1} />
              <div style={{ padding: 14 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 2px" }}>{room1.type}</p>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: text, margin: "0 0 6px" }}>{room1.name}</h3>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "#c9a84c", margin: 0 }}>{fmtPrice(room1.price, currency)}<span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub }}>/night</span></p>
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ border: "1.5px solid #c9a84c", borderRadius: 4, overflow: "hidden", background: altBg }}>
              <CompareCardGallery room={room2} imgIdx={imgIdx2} setImgIdx={setImgIdx2} badge="Featured Space" />
              <div style={{ padding: 14 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 2px" }}>{room2.type}</p>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: text, margin: "0 0 6px" }}>{room2.name}</h3>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "#c9a84c", margin: 0 }}>{fmtPrice(room2.price, currency)}<span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub }}>/night</span></p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{ border: `1px solid ${border}`, borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
            {features.map((f, i) => (
              <div key={f.label} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", borderBottom: i < features.length - 1 ? `1px solid ${border}` : "none", background: f.highlight ? altBg : (i % 2 === 0 ? cellBg : "transparent") }}>
                <div style={{ padding: "12px 16px", borderRight: `1px solid ${border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9a84c" }}>
                    {f.label}
                  </span>
                </div>
                <div style={{ padding: "12px 16px", borderRight: `1px solid ${border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: text, lineHeight: 1.5 }}>
                    {f.val1}
                  </span>
                </div>
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: f.highlight ? 600 : 400, color: text, lineHeight: 1.5 }}>
                    {f.val2}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { onClose(); onSelectRoom(room1); }}
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", padding: "14px", background: "transparent", color: "#c9a84c", border: "1px solid #c9a84c", borderRadius: 3, cursor: "pointer", transition: "all 0.2s" }}
            >
              Book Deluxe Double Room ($85)
            </button>
            <button
              onClick={() => { onClose(); onSelectRoom(room2); }}
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", padding: "14px", background: "linear-gradient(135deg, #c9a84c, #e6c97a)", color: "#0d2233", border: "none", borderRadius: 3, cursor: "pointer", transition: "all 0.2s" }}
            >
              Book The Lake Apartment ($150)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Room Modal ───────────────────────────────────────────────────────────────
function RoomModal({ room, theme, currency, setCurrency, onClose, onBook }: { room: typeof ROOMS[0]; theme: Theme; currency: string; setCurrency: (c: string) => void; onClose: () => void; onBook: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const dark = theme === "dark";
  const modalBg = dark ? "#0f2030" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(26,58,82,0.12)";
  const tagBg = dark ? "rgba(255,255,255,0.07)" : "rgba(26,58,82,0.07)";
  const tagText = dark ? "rgba(232,224,208,0.7)" : "#1a3a52";

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", animation: "backdropIn 0.25s ease" }}
      onClick={onClose}
    >
      <div className="w-full max-w-4xl rounded overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto"
        style={{ background: modalBg, animation: "modalSlideIn 0.3s ease", boxShadow: "0 32px 96px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gallery Stage with 3-photo preview (Left Small | Center Large | Right Small) */}
        <div className="relative flex flex-col" style={{ background: dark ? "#06131f" : "#0d2233", flexShrink: 0, overflow: "hidden" }}>
          {/* Main 3-Photo Stage */}
          <div className="relative flex items-center justify-center h-[380px] md:h-[430px] px-2 overflow-hidden">
            {/* Left Preview Image (Previous) */}
            <div
              onClick={() => setImgIdx((imgIdx - 1 + room.gallery.length) % room.gallery.length)}
              className="absolute left-2 md:left-5 z-10 cursor-pointer transition-all duration-300 hover:opacity-80"
              style={{ width: "20%", height: "68%", borderRadius: 6, overflow: "hidden", opacity: 0.45, transform: "scale(0.88)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <img
                src={room.gallery[(imgIdx - 1 + room.gallery.length) % room.gallery.length]}
                alt="Previous"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center Active Main Image */}
            <div className="relative z-20 w-[82%] md:w-[74%] h-[92%] flex items-center justify-center rounded overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(201,168,76,0.3)", background: "#081826" }}>
              <img
                src={room.gallery[imgIdx]}
                alt={room.name}
                className="w-full h-full object-contain"
                style={{ transition: "all 0.3s ease" }}
              />
            </div>

            {/* Right Preview Image (Next) */}
            <div
              onClick={() => setImgIdx((imgIdx + 1) % room.gallery.length)}
              className="absolute right-2 md:right-5 z-10 cursor-pointer transition-all duration-300 hover:opacity-80"
              style={{ width: "20%", height: "68%", borderRadius: 6, overflow: "hidden", opacity: 0.45, transform: "scale(0.88)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <img
                src={room.gallery[(imgIdx + 1) % room.gallery.length]}
                alt="Next"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nav Arrows */}
            <button
              onClick={() => setImgIdx((imgIdx - 1 + room.gallery.length) % room.gallery.length)}
              className="absolute left-3 z-30 flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => setImgIdx((imgIdx + 1) % room.gallery.length)}
              className="absolute right-3 z-30 flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}
            >
              <ChevronRight />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{ position: "absolute", top: 14, right: 14, zIndex: 40, width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <XIcon />
            </button>

            {/* Photo Counter */}
            <div className="absolute bottom-3 left-4 z-30 px-3 py-1 rounded" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "#e6c97a", letterSpacing: "0.08em" }}>
                {imgIdx + 1} / {room.gallery.length} Photos
              </span>
            </div>
          </div>

          {/* Booking.com Style Interactive Thumbnail Grid Strip */}
          <div className="p-3 flex items-center gap-2 overflow-x-auto" style={{ background: dark ? "#040d16" : "#091926", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {room.gallery.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setImgIdx(i)}
                className="relative flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all duration-200"
                style={{
                  width: 66,
                  height: 48,
                  border: i === imgIdx ? "2.5px solid #c9a84c" : "1px solid rgba(255,255,255,0.2)",
                  opacity: i === imgIdx ? 1 : 0.55,
                  transform: i === imgIdx ? "scale(1.05)" : "scale(1)",
                  padding: 0,
                  background: "transparent",
                }}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "#c9a84c" }}>{room.type}</p>
            {room.rating && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "#e6c97a", background: dark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", padding: "3px 12px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#c9a84c" }}>★</span> {room.rating}
              </span>
            )}
          </div>

          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 500, color: text, marginBottom: 12 }}>{room.name}</h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 300, color: sub, lineHeight: 1.85, marginBottom: 20 }}>{room.desc}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {room.tags.map((tag) => (
              <span key={tag} style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: tagText, background: tagBg, padding: "4px 10px", borderRadius: 2 }}>{tag}</span>
            ))}
          </div>

          {/* Key Specs Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 rounded" style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f9f6f0", border: `1px solid ${border}` }}>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>Room Size</p>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: text }}>{room.size}</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>Beds</p>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500, color: text }}>{room.bedType || "Plush King Bed"}</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>Max Capacity</p>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: text }}>{room.maxGuests} Guests</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>Nightly Rate</p>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: text }}>{fmtPrice(room.price, currency)} <span style={{ fontSize: 11, color: sub, fontFamily: "var(--font-sans)" }}>/ night</span></p>
            </div>
          </div>

          {/* Categorized Specifications Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8 pb-6" style={{ borderBottom: `1px solid ${border}` }}>
            {/* Private Kitchen */}
            {room.kitchen && room.kitchen.length > 0 && (
              <div className="p-5 rounded" style={{ background: dark ? "rgba(255,255,255,0.02)" : "#fcfaf7", border: `1px solid ${dark ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.25)"}` }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                    </svg>
                  </div>
                  <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: text, margin: 0 }}>Private Kitchen</h4>
                </div>
                <ul className="space-y-2.5 pl-0 list-none m-0">
                  {room.kitchen.map((k) => (
                    <li key={k} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: sub, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c9a84c", flexShrink: 0 }} />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Private Bathroom */}
            {room.bathroom && room.bathroom.length > 0 && (
              <div className="p-5 rounded" style={{ background: dark ? "rgba(255,255,255,0.02)" : "#fcfaf7", border: `1px solid ${dark ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.25)"}` }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
                      <path d="M6 12V5a3 3 0 0 1 6 0v1" />
                      <path d="M4 21v2M20 21v2" />
                    </svg>
                  </div>
                  <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: text, margin: 0 }}>Private Bathroom</h4>
                </div>
                <ul className="space-y-2.5 pl-0 list-none m-0">
                  {room.bathroom.map((b) => (
                    <li key={b} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: sub, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c9a84c", flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Views */}
            {room.views && room.views.length > 0 && (
              <div className="p-5 rounded" style={{ background: dark ? "rgba(255,255,255,0.02)" : "#fcfaf7", border: `1px solid ${dark ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.25)"}` }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    </svg>
                  </div>
                  <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: text, margin: 0 }}>Scenic Views</h4>
                </div>
                <ul className="space-y-2.5 pl-0 list-none m-0">
                  {room.views.map((v) => (
                    <li key={v} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: sub, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c9a84c", flexShrink: 0 }} />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Full Facilities List */}
          {room.facilities && room.facilities.length > 0 && (
            <div className="mb-8 pb-6" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-4">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: text, margin: 0 }}>Facilities & Comforts</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {room.facilities.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      fontWeight: 400,
                      color: dark ? "#e8e0d0" : "#1a3a52",
                      background: dark ? "rgba(255,255,255,0.04)" : "#f4efe6",
                      border: `1px solid ${dark ? "rgba(201,168,76,0.25)" : "rgba(26,58,82,0.12)"}`,
                      padding: "6px 14px",
                      borderRadius: 4,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>
              Rates include breakfast · Free cancellation up to 48h before arrival
            </p>
            <button onClick={onBook}
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", padding: "14px 32px", background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap" }}>
              Book This Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Room Recommendation & Inventory Helper Functions ─────────────────────────
function recommendRoomForConfig(
  adults: number,
  children: number,
  currentDoubleCount: number = 0,
  currentAptCount: number = 0,
  maxDoubleAvailable: number = 4,
  maxAptAvailable: number = 1,
  maxVillaAvailable: number = 1
) {
  const total = adults + children;

  // Deluxe Double Room (max 2 adults, 3 total, max maxDoubleAvailable units in hotel)
  if (adults <= 2 && total <= 3 && currentDoubleCount < maxDoubleAvailable) {
    return ROOMS[0]; // Deluxe Double Room ($85)
  }

  // The Lake Apartment (max 4 total, max maxAptAvailable unit in hotel)
  if (total <= 4 && currentAptCount < maxAptAvailable) {
    return ROOMS[1]; // The Lake Apartment ($150)
  }

  // Fallback to Double Room if available
  if (currentDoubleCount < maxDoubleAvailable) {
    return ROOMS[0];
  }

  // Only recommend Whole Villa if Whole Villa is actually available for selected dates!
  if (maxVillaAvailable > 0) {
    return ROOMS[2]; // Whole Villa ($490)
  }

  return ROOMS[0];
}

function getValidRoomsForConfig(
  adults: number,
  children: number,
  otherDoubleCount: number,
  otherAptCount: number,
  isCurrentDouble: boolean,
  isCurrentApt: boolean,
  maxDoubleAvailable: number = 4,
  maxAptAvailable: number = 1,
  maxVillaAvailable: number = 1
) {
  const total = adults + children;
  const valid: typeof ROOMS = [];

  // Deluxe Double Room: valid if guest count fits AND double rooms remaining (< maxDoubleAvailable or already this one)
  if (adults <= 2 && total <= 3 && (otherDoubleCount < maxDoubleAvailable || isCurrentDouble)) {
    valid.push(ROOMS[0]);
  }

  // The Lake Apartment: valid if guest count fits AND apartment remaining (< maxAptAvailable or already this one)
  if (total <= 4 && (otherAptCount < maxAptAvailable || isCurrentApt)) {
    valid.push(ROOMS[1]);
  }

  // Whole Villa: valid ONLY if Whole Villa is available on selected dates
  if (maxVillaAvailable > 0) {
    valid.push(ROOMS[2]);
  }

  if (valid.length === 0) {
    valid.push(ROOMS[0]);
  }

  return valid;
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ theme, selectedRoom, prefill, onClose }: { theme: Theme; selectedRoom: typeof ROOMS[0] | null; prefill?: BookingPrefill; onClose: () => void }) {
  const dark = theme === "dark";
  const modalBg = dark ? "#0f2030" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(26,58,82,0.12)";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#f4f0ea";

  const [step, setStep] = useState<"form" | "confirm">("form");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    checkin: prefill?.checkin ?? "",
    checkout: prefill?.checkout ?? "",
    nationality: "foreign", notes: "",
  });

  const [roomConfigs, setRoomConfigs] = useState<{ adults: number; children: number; customRoomId?: number }[]>(() => {
    if (prefill?.roomConfigs && prefill.roomConfigs.length > 0) {
      return prefill.roomConfigs;
    }
    if (selectedRoom) {
      return [{ adults: selectedRoom.id === 2 ? 2 : 2, children: selectedRoom.id === 2 ? 2 : 0, customRoomId: selectedRoom.id }];
    }
    return [{ adults: prefill?.adults ?? 2, children: prefill?.children ?? 0 }];
  });

  const [dateAvailability, setDateAvailability] = useState<{ [roomId: number]: number }>({ 1: 4, 2: 1, 3: 1 });
  const [isCheckingDates, setIsCheckingDates] = useState(false);

  // Fetch real-time date availability as soon as dates are selected or updated
  useEffect(() => {
    if (!form.checkin || !form.checkout) return;
    let isMounted = true;
    setIsCheckingDates(true);
    bookingsApi.checkAvailability(form.checkin, form.checkout)
      .then(res => {
        if (!isMounted) return;
        const map: { [roomId: number]: number } = {};
        res.availability.forEach(item => {
          map[item.roomId] = item.available ? (item.remainingUnits ?? 1) : 0;
        });
        setDateAvailability(map);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsCheckingDates(false);
      });
    return () => { isMounted = false; };
  }, [form.checkin, form.checkout]);

  const maxDoubleAvailable = dateAvailability[1] ?? 4;
  const maxAptAvailable = dateAvailability[2] ?? 1;
  const maxVillaAvailable = dateAvailability[3] ?? 1;

  const addRoom = () => {
    if (roomConfigs.length >= 5) {
      setStep1Error("The villa has 5 rooms in total (4 Double Rooms + 1 Apartment). For 5+ rooms, the Whole Villa package ($490/night) gives you complete exclusive access.");
      return;
    }
    setStep1Error("");
    setRoomConfigs(rcs => [...rcs, { adults: 1, children: 0 }]);
  };
  const removeRoom = (idx: number) => setRoomConfigs(rcs => rcs.filter((_, i) => i !== idx));
  const updateRoomGuest = (idx: number, field: "adults" | "children", delta: number) => {
    setRoomConfigs(rcs => rcs.map((rc, i) => {
      if (i !== idx) return rc;
      const currentVal = rc[field];
      const minVal = field === "adults" ? 1 : 0;
      const newVal = Math.max(minVal, Math.min(8, currentVal + delta));
      return { ...rc, [field]: newVal, customRoomId: undefined };
    }));
  };
  const updateRoomType = (idx: number, roomId: number) => {
    setRoomConfigs(rcs => rcs.map((rc, i) => {
      if (i !== idx) return rc;
      return { ...rc, customRoomId: roomId };
    }));
  };

  const totalAdults = roomConfigs.reduce((sum, rc) => sum + rc.adults, 0);
  const totalChildren = roomConfigs.reduce((sum, rc) => sum + rc.children, 0);
  const totalGuests = totalAdults + totalChildren;

  // Calculate room selections respecting physical property inventory AND real-time date availability
  const roomSelections = (() => {
    let doubleCount = 0;
    let aptCount = 0;

    return roomConfigs.map((rc, idx) => {
      const otherDoubleCount = roomConfigs.reduce((acc, c, i) => {
        if (i === idx) return acc;
        return c.customRoomId === 1 ? acc + 1 : acc;
      }, 0);

      const otherAptCount = roomConfigs.reduce((acc, c, i) => {
        if (i === idx) return acc;
        return c.customRoomId === 2 ? acc + 1 : acc;
      }, 0);

      const isCurrentDouble = rc.customRoomId === 1;
      const isCurrentApt = rc.customRoomId === 2;

      const validRooms = getValidRoomsForConfig(
        rc.adults,
        rc.children,
        otherDoubleCount,
        otherAptCount,
        isCurrentDouble,
        isCurrentApt,
        maxDoubleAvailable,
        maxAptAvailable,
        maxVillaAvailable
      );

      const recommended = recommendRoomForConfig(
        rc.adults,
        rc.children,
        doubleCount,
        aptCount,
        maxDoubleAvailable,
        maxAptAvailable,
        maxVillaAvailable
      );

      let selected = ROOMS.find(r => r.id === rc.customRoomId) ?? recommended;

      if (!validRooms.some(r => r.id === selected.id)) {
        selected = validRooms[0] ?? ROOMS[0];
      }

      if (selected.id === 1) doubleCount++;
      if (selected.id === 2) aptCount++;

      return {
        rc,
        recommended,
        selected,
        validRooms,
      };
    });
  })();

  const totalPricePerNight = roomSelections.reduce((sum, s) => sum + s.selected.price, 0);

  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [step1Error, setStep1Error] = useState("");

  // Automatically check availability whenever dates, roomSelections, or dateAvailability update (SHOWS ERROR BEFORE FIRST NEXT)
  useEffect(() => {
    if (!form.checkin || !form.checkout || isCheckingDates) return;

    const reqDoubleCount = roomSelections.filter(s => s.selected.id === 1).length;
    const reqAptCount = roomSelections.filter(s => s.selected.id === 2).length;
    const reqVillaCount = roomSelections.filter(s => s.selected.id === 3).length;

    const availDouble = dateAvailability[1] ?? 4;
    const availApt = dateAvailability[2] ?? 1;
    const availVilla = dateAvailability[3] ?? 1;

    if (reqVillaCount > 0 && availVilla === 0) {
      setStep1Error(`"Whole Villa" is not available for the selected dates (${form.checkin} to ${form.checkout}) because individual rooms or the villa are already booked.`);
      return;
    }

    if (reqDoubleCount > availDouble) {
      if (availDouble === 0) {
        setStep1Error(`"Deluxe Double Room" is not available for the selected dates (${form.checkin} to ${form.checkout}). Please choose different dates or another room option.`);
      } else {
        setStep1Error(`"Deluxe Double Room" is not available for ${reqDoubleCount} rooms. Only ${availDouble} room(s) remaining for the selected dates.`);
      }
      return;
    }

    if (reqAptCount > availApt) {
      setStep1Error(`"The Lake Apartment" is not available for the selected dates (${form.checkin} to ${form.checkout}) as it is already booked.`);
      return;
    }

    setStep1Error("");
  }, [form.checkin, form.checkout, roomSelections, dateAvailability, isCheckingDates]);

  const [checkingStep1, setCheckingStep1] = useState(false);

  const handleNextStep1 = async () => {
    if (!form.checkin || !form.checkout) {
      setStep1Error("Please select both Check-In and Check-Out dates before proceeding.");
      return;
    }

    setCheckingStep1(true);
    setStep1Error("");

    try {
      const res = await bookingsApi.checkAvailability(form.checkin, form.checkout);
      const map: { [roomId: number]: number } = {};
      let villaAvail = true;

      res.availability.forEach(item => {
        map[item.roomId] = item.available ? (item.remainingUnits ?? 1) : 0;
        if (item.roomId === 3 && !item.available) villaAvail = false;
      });

      setDateAvailability(map);

      const reqDoubleCount = roomSelections.filter(s => s.selected.id === 1).length;
      const reqAptCount = roomSelections.filter(s => s.selected.id === 2).length;
      const reqVillaCount = roomSelections.filter(s => s.selected.id === 3).length;

      const availDouble = map[1] ?? 4;
      const availApt = map[2] ?? 1;

      if (reqVillaCount > 0 && !villaAvail) {
        setStep1Error(`"Whole Villa" is not available for the selected dates (${form.checkin} to ${form.checkout}) because individual rooms or the villa are already booked.`);
        return;
      }

      if (reqDoubleCount > availDouble) {
        if (availDouble === 0) {
          setStep1Error(`"Deluxe Double Room" is not available for the selected dates (${form.checkin} to ${form.checkout}). Please choose different dates or another room option.`);
        } else {
          setStep1Error(`"Deluxe Double Room" is not available for ${reqDoubleCount} rooms. Only ${availDouble} room(s) remaining for the selected dates.`);
        }
        return;
      }

      if (reqAptCount > availApt) {
        setStep1Error(`"The Lake Apartment" is not available for the selected dates (${form.checkin} to ${form.checkout}) as it is already booked.`);
        return;
      }

      // All requested rooms are available!
      setStep1Error("");
      setFormStep(2);
    } catch {
      // Fallback
      setStep1Error("");
      setFormStep(2);
    } finally {
      setCheckingStep1(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingReference: string;
    totalPrice: number;
    advancePayment: number;
    discountPercent: number;
    promoCode: string;
  } | null>(null);

  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [promoMessage, setPromoMessage] = useState("");

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await offersApi.validate(code);
      if (res.valid) {
        setPromoStatus("valid");
        setPromoMessage(res.message);
      } else {
        setPromoStatus("invalid");
        setPromoMessage("");
      }
    } catch {
      setPromoStatus("invalid");
      setPromoMessage("");
    }
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");
    try {
      const roomNamesSummary = roomSelections.map((s, idx) => `Room ${idx + 1}: ${s.selected.name}`).join(", ");
      const primaryRoomId = roomSelections[0]?.selected.id ?? 1;

      const res = await bookingsApi.create({
        roomId: primaryRoomId,
        roomIds: roomSelections.map(s => s.selected.id),
        roomName: roomNamesSummary,
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        checkIn: form.checkin,
        checkOut: form.checkout,
        adults: totalAdults,
        children: totalChildren,
        guestType: form.nationality,
        notes: form.notes ? `${form.notes} [Rooms Breakdown: ${roomNamesSummary}]` : `[Rooms Breakdown: ${roomNamesSummary}]`,
        promoCode: promoStatus === "valid" ? promoCode.trim().toUpperCase() : undefined,
      });
      setConfirmedBooking({
        bookingReference: res.booking.bookingReference,
        totalPrice: res.booking.totalPrice,
        advancePayment: res.booking.advancePayment,
        discountPercent: res.booking.discountPercent,
        promoCode: res.booking.promoCode,
      });
      setStep("confirm");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { fontFamily: "var(--font-sans)", fontSize: 13, color: text, background: inputBg, border: `1px solid ${border}`, borderRadius: 3, padding: "10px 14px", width: "100%", outline: "none", transition: "border-color 0.2s" };
  const labelStyle = { fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#c9a84c", marginBottom: 5, display: "block" };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", animation: "backdropIn 0.25s ease" }}
      onClick={onClose}
    >
      <div className="w-full md:max-w-lg rounded-t md:rounded overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: modalBg, animation: "modalSlideIn 0.3s ease", boxShadow: "0 32px 96px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "confirm" ? (
          /* ── Confirmation ── */
          <div className="flex flex-col items-center text-center p-12">
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #e6c97a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0d2233", marginBottom: 24 }}>
              <CheckIcon />
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 10 }}>Reservation Confirmed</p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400, color: text, marginBottom: 8 }}>Thank you, {form.name.split(" ")[0] || "Guest"}.</h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 300, color: sub, lineHeight: 1.8, marginBottom: 28 }}>
              Your reservation at Hikka Secret Lake Villa is confirmed. A detailed confirmation has been sent to <strong style={{ color: text }}>{form.email || "your email"}</strong>.
            </p>
            <div style={{ background: dark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.08)", border: `1px solid ${dark ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.25)"}`, borderRadius: 4, padding: "16px 28px", marginBottom: 20 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>Reference Number</p>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 500, color: text }}>{confirmedBooking?.bookingReference ?? "HSV-XXXXX"}</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub, marginTop: 2 }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              {confirmedBooking && confirmedBooking.discountPercent > 0 && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#4caf82", marginTop: 8, fontWeight: 500 }}>✓ {confirmedBooking.discountPercent}% off applied ({confirmedBooking.promoCode})</p>
              )}
              {confirmedBooking && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: sub, marginTop: 6 }}>Total: <strong style={{ color: text }}>${confirmedBooking.totalPrice.toFixed(2)}</strong> · Advance: <strong style={{ color: "#c9a84c" }}>${confirmedBooking.advancePayment.toFixed(2)}</strong></p>
              )}
            </div>

            {/* Advance payment notice */}
            <div style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f9f5ef", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(26,58,82,0.12)"}`, borderRadius: 4, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 8 }}>Payment Instructions</p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", flexShrink: 0, marginTop: 5 }} />
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: text, lineHeight: 1.7, margin: 0 }}>
                  A <strong style={{ color: "#c9a84c" }}>50% advance payment</strong> is required within 48 hours to secure your reservation.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", flexShrink: 0, marginTop: 5 }} />
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: text, lineHeight: 1.7, margin: 0 }}>
                  The remaining <strong style={{ color: "#c9a84c" }}>50% balance</strong> is due upon arrival at the property.
                </p>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub, marginTop: 10, lineHeight: 1.6 }}>
                Our team will contact you via email or WhatsApp with payment details shortly.
              </p>
            </div>
            <button onClick={onClose}
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", padding: "13px 36px", background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 2, cursor: "pointer" }}>
              Close
            </button>
          </div>
        ) : (
          /* ── Multi-step Form ── */
          <div>
            {/* Header with Step indicator */}
            <div style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center justify-between px-8 py-5">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c" }}>
                      Step {formStep} of 2
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: sub }}>•</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub }}>
                      {formStep === 1 ? "Rooms & Guests" : "Contact & Details"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: text }}>
                    {formStep === 1 ? "Select Rooms & Dates" : "Guest Information"}
                  </h3>
                </div>
                <button type="button" onClick={onClose}
                  style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${border}`, background: "transparent", color: sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <XIcon />
                </button>
              </div>
              {/* Progress Bar */}
              <div style={{ height: 3, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", position: "relative" }}>
                <div style={{ width: formStep === 1 ? "50%" : "100%", height: "100%", background: "linear-gradient(90deg, #c9a84c, #e6c97a)", transition: "width 0.3s ease" }} />
              </div>
            </div>

            {formStep === 1 ? (
              /* ── STEP 1: Dates & Rooms Configuration ── */
              <div className="px-8 py-6 flex flex-col gap-5">
                {/* Check-in / Check-out Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <DateInput
                    label="Check-In"
                    required
                    value={form.checkin}
                    onChange={(val) => { setForm({ ...form, checkin: val }); setStep1Error(""); }}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                    placeholder="dd/mm/yyyy"
                  />
                  <DateInput
                    label="Check-Out"
                    required
                    value={form.checkout}
                    onChange={(val) => { setForm({ ...form, checkout: val }); setStep1Error(""); }}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                {/* Per-Room Guest & Room Selection Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Room & Guest Configuration</label>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>
                      {roomConfigs.length} Room{roomConfigs.length > 1 ? "s" : ""} · {totalGuests} Guest{totalGuests !== 1 ? "s" : ""} ({totalAdults} Adults{totalChildren > 0 ? `, ${totalChildren} Kids` : ""})
                    </span>
                  </div>

                  {roomSelections.map((sel, ri) => (
                    <div key={ri} style={{
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      background: dark ? "rgba(255,255,255,0.02)" : "#faf8f5",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}>
                      {/* Room title & Remove button */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500, color: text, margin: 0 }}>
                          Room {ri + 1}
                        </h4>
                        {roomConfigs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoom(ri)}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#e07070",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              textDecoration: "underline",
                            }}
                          >
                            Remove room
                          </button>
                        )}
                      </div>

                      {/* Steppers Box 1: Adults */}
                      <div style={{
                        border: `1px solid ${border}`,
                        borderRadius: 3,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: inputBg,
                      }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: text, margin: 0 }}>
                            Adults (Ages 12 or above)
                          </p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, color: text, margin: "2px 0 0" }}>
                            {sel.rc.adults}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <button
                            type="button"
                            onClick={() => updateRoomGuest(ri, "adults", -1)}
                            disabled={sel.rc.adults <= 1}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              border: `1px solid ${border}`,
                              background: "transparent",
                              color: sel.rc.adults <= 1 ? "rgba(128,128,128,0.4)" : text,
                              fontSize: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: sel.rc.adults <= 1 ? "not-allowed" : "pointer",
                            }}
                          >−</button>
                          <button
                            type="button"
                            onClick={() => updateRoomGuest(ri, "adults", 1)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              border: `1px solid ${border}`,
                              background: "transparent",
                              color: text,
                              fontSize: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >+</button>
                        </div>
                      </div>

                      {/* Steppers Box 2: Children */}
                      <div style={{
                        border: `1px solid ${border}`,
                        borderRadius: 3,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: inputBg,
                      }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: text, margin: 0 }}>
                            Children (Ages 0-11)
                          </p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, color: text, margin: "2px 0 0" }}>
                            {sel.rc.children}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <button
                            type="button"
                            onClick={() => updateRoomGuest(ri, "children", -1)}
                            disabled={sel.rc.children <= 0}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              border: `1px solid ${border}`,
                              background: "transparent",
                              color: sel.rc.children <= 0 ? "rgba(128,128,128,0.4)" : text,
                              fontSize: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: sel.rc.children <= 0 ? "not-allowed" : "pointer",
                            }}
                          >−</button>
                          <button
                            type="button"
                            onClick={() => updateRoomGuest(ri, "children", 1)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              border: `1px solid ${border}`,
                              background: "transparent",
                              color: text,
                              fontSize: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >+</button>
                        </div>
                      </div>

                      {/* Recommended Option & Flexible Choice */}
                      <div style={{
                        padding: "12px 14px",
                        background: dark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.07)",
                        border: "1px solid rgba(201,168,76,0.3)",
                        borderRadius: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: "rgba(201,168,76,0.25)", color: "#c9a84c", padding: "2px 6px", borderRadius: 2 }}>
                              Recommended
                            </span>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: text }}>
                              {sel.recommended.name}
                            </span>
                          </div>
                          <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500, color: "#c9a84c" }}>
                            ${sel.selected.price}<span style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: sub }}>/night</span>
                          </span>
                        </div>

                        {/* Dropdown with flexible choices for Room {ri+1} */}
                        <div>
                          <label style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4, display: "block" }}>
                            Select Room Type for Room {ri + 1}
                          </label>
                          <select
                            value={sel.selected.id}
                            onChange={(e) => {
                              updateRoomType(ri, Number(e.target.value));
                              setStep1Error("");
                            }}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: 12,
                              color: text,
                              background: dark ? "#0a1824" : "#ffffff",
                              border: `1px solid ${border}`,
                              borderRadius: 3,
                              padding: "8px 10px",
                              width: "100%",
                              outline: "none",
                              cursor: "pointer",
                            }}
                          >
                            {ROOMS.map((room) => {
                              const isAvail =
                                room.id === 1 ? maxDoubleAvailable > 0 :
                                room.id === 2 ? maxAptAvailable > 0 :
                                maxVillaAvailable > 0;
                              const isRec = room.id === sel.recommended.id && isAvail;

                              return (
                                <option key={room.id} value={room.id}>
                                  {room.name} — ${room.price}/night {isRec ? "(Recommended)" : !isAvail ? "(Not available for dates)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub, margin: 0 }}>
                          {sel.selected.desc}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Add another room button */}
                  <button
                    type="button"
                    onClick={addRoom}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#c9a84c",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: "4px 0",
                      textDecoration: "underline",
                      alignSelf: "flex-start",
                    }}
                  >
                    + Add another room
                  </button>
                </div>

                {/* Total Summary Box */}
                <div style={{
                  background: dark ? "rgba(201,168,76,0.12)" : "#f7f2e8",
                  border: "1px solid rgba(201,168,76,0.4)",
                  borderRadius: 4,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", margin: "0 0 3px" }}>
                      Total Reservation Summary
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: text, margin: 0 }}>
                      {roomSelections.map((s, idx) => `Room ${idx + 1}: ${s.selected.name}`).join(" + ")}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: "#c9a84c", margin: 0 }}>
                      ${totalPricePerNight}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: sub, margin: 0 }}>
                      total per night
                    </p>
                  </div>
                </div>

                {step1Error && (
                  <div style={{ background: "rgba(224,112,112,0.1)", border: "1px solid rgba(224,112,112,0.35)", borderRadius: 4, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#e07070", margin: 0, lineHeight: 1.5 }}>
                      ✕ {step1Error}
                    </p>
                    {/* Quick switch options to available room types for selected dates */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                      {maxDoubleAvailable > 0 && !roomSelections.some(s => s.selected.id === 1) && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoomConfigs(rcs => rcs.map(rc => ({ ...rc, customRoomId: 1 })));
                            setStep1Error("");
                          }}
                          style={{
                            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "#c9a84c",
                            background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 3, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          Switch to Deluxe Double Room ($85/night)
                        </button>
                      )}
                      {maxAptAvailable > 0 && !roomSelections.some(s => s.selected.id === 2) && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoomConfigs(rcs => rcs.map(rc => ({ ...rc, customRoomId: 2 })));
                            setStep1Error("");
                          }}
                          style={{
                            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "#c9a84c",
                            background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 3, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          Switch to The Lake Apartment ($150/night)
                        </button>
                      )}
                      {maxVillaAvailable > 0 && !roomSelections.some(s => s.selected.id === 3) && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoomConfigs(rcs => rcs.map(rc => ({ ...rc, customRoomId: 3 })));
                            setStep1Error("");
                          }}
                          style={{
                            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "#c9a84c",
                            background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 3, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          Switch to Whole Villa ($490/night)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons: Back and Next */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: "0 0 32%",
                      fontFamily: "var(--font-sans)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "15px",
                      background: "transparent",
                      border: `1px solid ${border}`,
                      borderRadius: 2,
                      color: text,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    disabled={checkingStep1}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      padding: "15px",
                      background: checkingStep1 ? "#a88630" : "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)",
                      color: "#0d2233",
                      border: "none",
                      borderRadius: 2,
                      cursor: checkingStep1 ? "wait" : "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10
                    }}
                  >
                    {checkingStep1 ? (
                      <>
                        <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#0d2233", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                        Checking Availability…
                      </>
                    ) : "Next: Guest Details →"}
                  </button>
                </div>
              </div>
            ) : (
              /* ── STEP 2: Guest Information & Confirmation ── */
              <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">
                {/* Summary of Step 1 Choices */}
                <div style={{ background: dark ? "rgba(201,168,76,0.08)" : "#f7f2e8", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9a84c", margin: "0 0 2px" }}>
                      Selected ({roomConfigs.length} Room{roomConfigs.length > 1 ? "s" : ""}, {totalGuests} Guests)
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: text, margin: 0 }}>
                      {form.checkin} → {form.checkout} · <strong>${totalPricePerNight}/night</strong>
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub, margin: "2px 0 0" }}>
                      {roomSelections.map((s, idx) => `R${idx + 1}: ${s.selected.name}`).join(" • ")}
                    </p>
                  </div>
                  <button type="button" onClick={() => setFormStep(1)} style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                    Edit Rooms
                  </button>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                      onBlur={(e) => (e.target.style.borderColor = border)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+94 77 000 0000" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                      onBlur={(e) => (e.target.style.borderColor = border)} />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                    onBlur={(e) => (e.target.style.borderColor = border)} />
                </div>

                {/* Guest Type */}
                <div>
                  <label style={labelStyle}>Guest Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ val: "foreign", label: "Foreign Guest" }, { val: "local", label: "Sri Lankan Resident" }].map((opt) => (
                      <button key={opt.val} type="button"
                        onClick={() => setForm({ ...form, nationality: opt.val })}
                        style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500, padding: "9px 12px", borderRadius: 3, cursor: "pointer", transition: "all 0.2s", border: form.nationality === opt.val ? "1.5px solid #c9a84c" : `1px solid ${border}`, background: form.nationality === opt.val ? (dark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.1)") : inputBg, color: form.nationality === opt.val ? "#c9a84c" : sub }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div>
                  <label style={labelStyle}>Offer / Promo Code</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoStatus("idle"); }}
                      placeholder="Enter code (e.g. HSVHONEY)"
                      style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
                      onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                      onBlur={(e) => (e.target.style.borderColor = border)}
                    />
                    <button type="button" onClick={applyPromo}
                      style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "0 18px", background: "transparent", border: "1px solid #c9a84c", borderRadius: 3, color: "#c9a84c", cursor: "pointer", whiteSpace: "nowrap" }}>
                      Apply
                    </button>
                  </div>
                  {promoStatus === "valid" && (
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#4caf82", marginTop: 6 }}>✓ {promoMessage || "Promo code applied!"}</p>
                  )}
                  {promoStatus === "invalid" && (
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#e07070", marginTop: 6 }}>Invalid code. Please check and try again.</p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label style={labelStyle}>Special Requests</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Dietary requirements, arrival time, celebrations..." style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                    onBlur={(e) => (e.target.style.borderColor = border)} />
                </div>

                {submitError && (
                  <div style={{ background: "rgba(224,112,112,0.1)", border: "1px solid rgba(224,112,112,0.3)", borderRadius: 3, padding: "12px 14px" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#e07070", margin: 0 }}>✕ {submitError}</p>
                  </div>
                )}

                {/* Step 2 Buttons: Back and Submit */}
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <button type="button" onClick={() => setFormStep(1)}
                    style={{ flex: "0 0 32%", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "14px", background: "transparent", border: `1px solid ${border}`, borderRadius: 2, color: text, cursor: "pointer" }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    style={{
                      flex: 1, fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px",
                      background: loading ? "#a88630" : "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)",
                      color: "#0d2233", border: "none", borderRadius: 2, cursor: loading ? "wait" : "pointer",
                      transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                    }}>
                    {loading ? (
                      <>
                        <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#0d2233", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                        Processing…
                      </>
                    ) : "Confirm Reservation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Amenities ────────────────────────────────────────────────────────────────
function AmenitiesSection({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  const bg = dark ? "#0a1e2e" : "#1a3a52";
  return (
    <section id="amenities" style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Amenities</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, color: "#ffffff", lineHeight: 1.12 }}>
            Every Comfort, <em style={{ color: "#e6c97a" }}>Considered</em>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.07)" }}>
          {AMENITIES.map((a) => (
            <div key={a.label}
              className="flex flex-col items-center justify-center gap-4 py-10 transition-colors duration-250 cursor-default"
              style={{ background: bg, color: "rgba(255,255,255,0.42)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = dark ? "#061525" : "#0d2233"; (e.currentTarget as HTMLElement).style.color = "#c9a84c"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bg; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.42)"; }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}>
                {AMENITY_ICONS[a.iconKey]}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.58)", textAlign: "center" }}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Booking Options Section ──────────────────────────────────────────────────
const BOOKING_OPTIONS = [
  {
    id: "room",
    label: "Deluxe Double Room",
    sublabel: "28 m² Deluxe Room · Up to 2 Guests",
    price: 85,
    priceNote: "per night",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    features: [
      "28 m² deluxe room with pool & lake view",
      "1 Extra-Long King Bed (> 80 inches)",
      "Private bathroom with bath/shower & bidet",
      "Balcony & terrace with lake, pool & garden view",
      "Outdoor dining area & barbecue access",
      "Air conditioning, fridge, electric kettle & Free Wi-Fi",
    ],
    highlight: false,
  },
  {
    id: "apartment",
    label: "The Lake Apartment",
    sublabel: "85 m² Private Apartment · Up to 4 Guests",
    price: 150,
    priceNote: "per night",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h2v3H7zM11 8h2v3h-2zM15 8h2v3h-2z" />
      </svg>
    ),
    features: [
      "85 m² private living space",
      "Private kitchen (washing machine, fridge, kettle, dining table)",
      "1 King bed + 1 Sofa bed (2 beds total)",
      "Private bathroom with shower & bidet",
      "Balcony & terrace with lake, pool & garden view",
      "Private barbecue area & outdoor dining",
      "Air conditioning & Free Wi-Fi",
    ],
    highlight: true,
  },
  {
    id: "villa",
    label: "Whole Villa",
    sublabel: "4 Rooms + Apartment · Up to 12 Guests",
    price: 490,
    priceNote: "per night",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 22V9l11-7 11 7v13" />
        <path d="M9 22V12h6v10" />
        <path d="M5 22v-4h3v4M16 22v-4h3v4" />
      </svg>
    ),
    features: ["4 double rooms + lake apartment", "All room comforts included", "Fully equipped kitchen", "Exclusive outdoor pool & garden", "Entire property — total privacy", "Ideal for groups & celebrations"],
    highlight: false,
  },
];

function BookingOptionsSection({ theme, onBook }: { theme: Theme; onBook: (label: string) => void }) {
  const dark = theme === "dark";
  const bg = dark ? "#0f2030" : "#f4f0ea";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const cardBg = dark ? "#112233" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.12)";

  return (
    <section style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Reserve Your Stay</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 400, color: text, lineHeight: 1.12, marginBottom: 14 }}>
            Choose Your <em style={{ color: "#c9a84c" }}>Perfect Option</em>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 300, color: sub, maxWidth: 480, lineHeight: 1.8 }}>
            Book a single room, the cozy lake apartment, or take the entire villa exclusively for your group. One shared outdoor pool for all guests.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {BOOKING_OPTIONS.map((opt) => (
            <div key={opt.id}
              style={{
                background: opt.highlight ? (dark ? "#0d2233" : "#1a3a52") : cardBg,
                border: opt.highlight ? "2px solid #c9a84c" : `1px solid ${border}`,
                borderRadius: 6,
                padding: "36px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: opt.highlight ? "0 16px 48px rgba(201,168,76,0.18)" : "0 2px 16px rgba(0,0,0,0.06)",
                transition: "transform 0.25s, box-shadow 0.25s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = opt.highlight ? "0 24px 64px rgba(201,168,76,0.25)" : "0 12px 40px rgba(0,0,0,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = opt.highlight ? "0 16px 48px rgba(201,168,76,0.18)" : "0 2px 16px rgba(0,0,0,0.06)"; }}
            >
              {opt.highlight && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%) translateY(-50%)", background: "linear-gradient(135deg, #c9a84c, #e6c97a)", borderRadius: 20, padding: "4px 16px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0d2233" }}>Most Popular</span>
                </div>
              )}

              {/* Title */}
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 6 }}>{opt.sublabel}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500, color: opt.highlight ? "#ffffff" : text, marginBottom: 24, lineHeight: 1.2 }}>{opt.label}</h3>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 28, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {opt.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="8" cy="8" r="7" fill="rgba(201,168,76,0.18)" />
                      <path d="M5 8l2 2 4-4" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 300, color: opt.highlight ? "rgba(255,255,255,0.72)" : sub, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div style={{ borderTop: `1px solid ${opt.highlight ? "rgba(255,255,255,0.1)" : border}`, paddingTop: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 400, color: opt.highlight ? "#e6c97a" : text }}>
                    ${opt.price}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: opt.highlight ? "rgba(255,255,255,0.45)" : sub, marginLeft: 6 }}>{opt.priceNote}</span>
                </div>
                <button
                  onClick={() => onBook(opt.label)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: opt.highlight ? "linear-gradient(135deg, #c9a84c, #e6c97a)" : "transparent",
                    color: opt.highlight ? "#0d2233" : "#c9a84c",
                    border: opt.highlight ? "none" : "1px solid #c9a84c",
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!opt.highlight) {
                      (e.currentTarget as HTMLElement).style.background = "#c9a84c";
                      (e.currentTarget as HTMLElement).style.color = "#0d2233";
                    } else {
                      (e.currentTarget as HTMLElement).style.opacity = "0.88";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!opt.highlight) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#c9a84c";
                    } else {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                    }
                  }}
                >
                  Book {opt.id === "villa" ? "Whole Villa" : opt.id === "apartment" ? "Apartment" : "This Room"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Phone CTA */}
        <div className="flex flex-col items-center mt-12 gap-3">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: sub }}>Prefer to speak with us directly?</p>
          <a href="tel:+94763740090"
            style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: "#c9a84c", textDecoration: "none", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.08-.95a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z" />
            </svg>
            +94 76 374 0090
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Map Section ─────────────────────────────────────────────────────────────
function MapSection({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  const bg = dark ? "#0b1a26" : "#f4f0ea";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const cardBg = dark ? "#112233" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.12)";

  return (
    <section id="location" style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Location</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 400, color: text, lineHeight: 1.12, marginBottom: 16 }}>
            Find Us in <em style={{ color: "#c9a84c" }}>Hikkaduwa</em>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 300, color: sub, maxWidth: 480, lineHeight: 1.8 }}>
            Nestled between the glassy Hikkaduwa Lake and the Indian Ocean — minutes from the beach, far from the ordinary.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
              ), label: "Address", value: "Hikkaduwa Lake Road,\nHikkaduwa 80240, Sri Lanka"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              ), label: "Transfer Time", value: "~2.5 hrs from\nBandaranaike International Airport"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              ), label: "Nearest Beach", value: "Hikkaduwa Beach\n1 km · 12 min walk"
            },
          ].map((item) => (
            <div key={item.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 4, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 14, transition: "border-color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#c9a84c")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = border)}
            >
              <span style={{ color: "#c9a84c", flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 5 }}>{item.label}</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map embed */}
        <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${border}`, boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(26,58,82,0.1)", position: "relative" }}>
          <iframe
            title="Hikka Secret Lake Resort location map"
            src="https://maps.google.com/maps?q=Hikka%20Secret%20Lake%20Resort,%20Hikkaduwa,%20Sri%20Lanka&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="460"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Pin overlay label */}
          <div style={{ position: "absolute", bottom: 20, left: 20, background: dark ? "rgba(11,26,38,0.95)" : "rgba(255,255,255,0.97)", border: `1px solid ${dark ? "rgba(201,168,76,0.3)" : "rgba(26,58,82,0.14)"}`, borderRadius: 4, padding: "10px 16px", backdropFilter: "blur(8px)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a84c" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: text, marginBottom: 1 }}>Hikka Secret Lake Villa</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: sub }}>Hikkaduwa, Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Get directions link */}
        <div className="flex justify-center mt-6">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Hikkaduwa+Lake,+Hikkaduwa,+Sri+Lanka"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9a84c", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 2, transition: "all 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#c9a84c"; (e.currentTarget as HTMLElement).style.color = "#0d2233"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#c9a84c"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
            Get Directions in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Dining Section ───────────────────────────────────────────────────────────
function DiningSection({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  const bg = dark ? "#0f2030" : "#f9f5ef";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const cardBg = dark ? "#112233" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.1)";

  const items = [
    {
      title: "Tropical Breakfast",
      desc: "Start your day with a freshly prepared Sri Lankan or continental breakfast served in the garden or by the pool.",
      img: "/images/dining/breakfast.jpg",
      tag: "Served 7am – 10am",
    },
    {
      title: "In-Villa Dining",
      desc: "Our kitchen can prepare authentic Sri Lankan rice & curry, seafood platters, and BBQ dinners on request.",
      img: "/images/dining/dining-table.jpg",
      tag: "Available any time",
    },
    {
      title: "Poolside Refreshments",
      desc: "Fresh tropical juices, coconut water, and light snacks served throughout the day at the pool.",
      img: "/images/dining/drinks.jpg",
      tag: "All day",
    },
  ];

  return (
    <section id="dining" style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Dining</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 400, color: text, lineHeight: 1.12 }}>
            Flavours of <em style={{ color: "#c9a84c" }}>Sri Lanka</em>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 300, color: sub, maxWidth: 500, lineHeight: 1.8, marginTop: 14 }}>
            From garden breakfasts to candlelit seafood dinners — every meal is prepared fresh with local ingredients.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: 220, overflow: "hidden" }}>
                <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.06)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")} />
              </div>
              <div style={{ padding: "20px 22px" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 8 }}>{item.tag}</p>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: text, marginBottom: 8, lineHeight: 1.2 }}>{item.title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 300, color: sub, lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Offers Section ───────────────────────────────────────────────────────────
function OffersSection({ theme, onBook }: { theme: Theme; onBook: () => void }) {
  const dark = theme === "dark";
  const bg = dark ? "#0b1a26" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.1)";

  const offers = [
    {
      badge: "Honeymoon Special",
      title: "Romance Package",
      desc: "3 nights in the Lake Apartment with candlelit dinner, flower bath preparation, and complimentary breakfast each morning.",
      price: 420,
      img: "/images/gallery/balcony.jpg",
      highlight: true,
    },
    {
      badge: "Group Getaway",
      title: "Whole Villa Exclusive",
      desc: "Book the entire property for your group — 4 rooms, the lake apartment, private pool, and dedicated staff.",
      price: 490,
      img: "/images/hero/villa-exterior.jpg",
      highlight: false,
    },
    {
      badge: "Long Stay",
      title: "7-Night Retreat",
      desc: "Stay 7 nights and enjoy 15% off your total booking across any room type. Includes daily breakfast.",
      price: null,
      img: "/images/experiences/garden-relax.jpg",
      highlight: false,
    },
  ];

  return (
    <section id="offers" style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Special Offers</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 400, color: text, lineHeight: 1.12 }}>
            Curated <em style={{ color: "#c9a84c" }}>Experiences</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.title} style={{ background: dark ? "#112233" : "#f9f5ef", border: `1px solid ${offer.highlight ? "#c9a84c" : border}`, borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                <img src={offer.img} alt={offer.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.06)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")} />
                <div style={{ position: "absolute", top: 14, left: 14, background: offer.highlight ? "linear-gradient(135deg,#c9a84c,#e6c97a)" : "rgba(13,34,51,0.75)", backdropFilter: "blur(6px)", borderRadius: 2, padding: "4px 12px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: offer.highlight ? "#0d2233" : "#c9a84c" }}>{offer.badge}</span>
                </div>
              </div>
              <div style={{ padding: "22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: text, marginBottom: 10, lineHeight: 1.2 }}>{offer.title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 300, color: sub, lineHeight: 1.75, flex: 1 }}>{offer.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                  {offer.price ? (
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, color: text }}>From <strong style={{ color: "#c9a84c" }}>${offer.price}</strong><span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub, marginLeft: 3 }}>/night</span></span>
                  ) : (
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c" }}>15% Off</span>
                  )}
                  <button onClick={onBook}
                    style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 18px", background: offer.highlight ? "linear-gradient(135deg,#c9a84c,#e6c97a)" : "transparent", color: offer.highlight ? "#0d2233" : "#c9a84c", border: "1px solid #c9a84c", borderRadius: 2, cursor: "pointer", transition: "all 0.2s" }}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ theme, onBook }: { theme: Theme; onBook: () => void }) {
  const dark = theme === "dark";
  const [clicks, setClicks] = useState(0);

  const handleCopyrightClick = () => {
    if (clicks + 1 >= 3) {
      window.location.hash = "#hsv_portal";
      setClicks(0);
    } else {
      setClicks((c) => c + 1);
    }
  };

  return (
    <footer id="contact" style={{ background: dark ? "#06111b" : "#0d2233", borderTop: "1px solid rgba(201,168,76,0.15)", transition: "background 0.5s" }} className="py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10 mb-10">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <VillaLogoIcon />
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "#c9a84c" }}>HIKKA SECRET</span>
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 300, color: "rgba(255,255,255,0.38)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Lake Villa · Hikkaduwa, Sri Lanka</span>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginTop: 14, maxWidth: 260 }}>
            A private luxury estate by the lake — and 1 km from Hikkaduwa Beach.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>Contact</p>
          {["+94 76 374 0090", "reservations@hikka-secret.com", "Hikkaduwa, Southern Province, Sri Lanka"].map((l) => (
            <p key={l} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{l}</p>
          ))}
        </div>
        <div className="flex flex-col items-start md:items-end justify-between">
          <button onClick={onBook}
            style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 36px", background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)", color: "#0d2233", border: "none", borderRadius: 2, cursor: "pointer" }}>
            Book Now
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p
          onClick={handleCopyrightClick}
          style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.08em", cursor: "default", userSelect: "none" }}
          title="© 2026 Hikka Secret Lake Villa"
        >
          © 2026 Hikka Secret Lake Villa. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Spinner keyframe ─────────────────────────────────────────────────────────
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ─── Photo Gallery Section ──────────────────────────────────────────────────
interface GalleryItem {
  src: string;
  title: string;
  category: "villa" | "rooms" | "dining" | "experiences";
  desc: string;
}

const BOOKING_GALLERY_ITEMS: GalleryItem[] = Array.from({ length: 61 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  const src = `/images/booking_gallery/booking-photo-${num}.png`;

  let category: "villa" | "rooms" | "dining" | "experiences" = "villa";
  let title = `Resort View #${num}`;
  let desc = "Captured photo of Hikka Secret Lake Resort & grounds.";

  if (i < 15) {
    category = "villa";
    title = `Resort & Pool View #${num}`;
    desc = "Lakeside swimming pool, sunny deck, and tropical villa grounds.";
  } else if (i < 35) {
    category = "rooms";
    title = `Suite & Room Interior #${String(i - 13).padStart(2, "0")}`;
    desc = "Comfortable air-conditioned bedroom and private en-suite amenities.";
  } else if (i < 45) {
    category = "dining";
    title = `Dining & Kitchen Area #${String(i - 33).padStart(2, "0")}`;
    desc = "In-villa kitchen facilities and garden dining area.";
  } else {
    category = "experiences";
    title = `Lake & Nature Spot #${String(i - 43).padStart(2, "0")}`;
    desc = "Tranquil views along Lake Rathgama and lush tropical surroundings.";
  }

  return { src, title, category, desc };
});

const GALLERY_ITEMS: GalleryItem[] = [
  // Villa & Grounds
  { src: "/images/hero/villa-exterior.jpg", title: "Villa & Garden Exterior", category: "villa", desc: "Serene lakeside villa surrounded by tropical palm trees." },
  { src: "/images/hero/pool-wide.jpg", title: "Infinity Pool Dusk", category: "villa", desc: "Private outdoor pool overlooking the calm lake at sunset." },
  { src: "/images/hero/aerial-pool.jpg", title: "Estate Aerial Panorama", category: "villa", desc: "Birdseye view of our villa, pool terrace, and lush gardens." },
  { src: "/images/hero/pool-side.jpg", title: "Poolside Terrace", category: "villa", desc: "Sun loungers by the crystal clear swimming pool." },
  { src: "/images/gallery/pool-reflection.jpg", title: "Sunset Pool Reflection", category: "villa", desc: "Glassy reflections on the pool water at dusk." },
  { src: "/images/gallery/villa-architecture.jpg", title: "Villa Architecture", category: "villa", desc: "Modern Sri Lankan architectural design by the water." },
  { src: "/images/gallery/patio.jpg", title: "Courtyard Patio", category: "villa", desc: "Shaded outdoor seating area for afternoon tea and reading." },
  { src: "/images/gallery/pool-loungers.jpg", title: "Poolside Relaxation", category: "villa", desc: "Comfortable sun loungers for soaking up the tropical sun." },

  // Rooms & Suites
  { src: "/images/rooms/deluxe-main.jpg", title: "Deluxe Double Room", category: "rooms", desc: "Spacious 28 m² air-conditioned room with pool & lake view." },
  { src: "/images/rooms/double-bed.jpg", title: "Plush King Bed", category: "rooms", desc: "Premium bedding and high thread count linens for deep sleep." },
  { src: "/images/rooms/room-interior-1.jpg", title: "Deluxe Bedroom Interior", category: "rooms", desc: "Elegantly styled interior with natural wooden elements." },
  { src: "/images/rooms/room-interior-2.jpg", title: "Bedroom Layout", category: "rooms", desc: "Clean, minimalist decor with warm ambient lighting." },
  { src: "/images/rooms/bed-detail.jpg", title: "Luxury Bed Detail", category: "rooms", desc: "Soft cushions and fresh tropical flower arrangements." },
  { src: "/images/rooms/apt-living.jpg", title: "Lake Apartment Living Room", category: "rooms", desc: "Cozy private living space in the 85 m² Lake Apartment." },
  { src: "/images/rooms/apt-interior-1.jpg", title: "Apartment Bedroom", category: "rooms", desc: "Master bedroom suite inside the Lake Apartment." },
  { src: "/images/rooms/apt-kitchen.jpg", title: "Fully Equipped Kitchen", category: "rooms", desc: "Modern kitchenette with refrigerator, stove & cookware." },
  { src: "/images/villa/master-suite.jpg", title: "Master Villa Suite", category: "rooms", desc: "The principal master bedroom of the entire villa." },
  { src: "/images/rooms/bathroom.jpg", title: "Private En-Suite Bathroom", category: "rooms", desc: "Spotless en-suite bathroom with modern fixtures." },
  { src: "/images/rooms/bathroom-shower.jpg", title: "Hot Water Rain Shower", category: "rooms", desc: "Refreshing hot water shower with eco amenities." },
  { src: "/images/rooms/vanity.jpg", title: "En-Suite Vanity", category: "rooms", desc: "Illuminated mirror and vanity counter." },
  { src: "/images/rooms/night-ambient.jpg", title: "Evening Room Atmosphere", category: "rooms", desc: "Warm lighting creating a soothing night ambience." },

  // Dining
  { src: "/images/dining/breakfast.jpg", title: "Tropical Breakfast", category: "dining", desc: "Fresh fruits, hoppers, toast, and freshly brewed coffee." },
  { src: "/images/dining/dining-table.jpg", title: "Al-Fresco Dining Table", category: "dining", desc: "Outdoor dining setup for authentic Sri Lankan dinners." },
  { src: "/images/dining/drinks.jpg", title: "Fresh Tropical Drinks", category: "dining", desc: "King coconut water and fresh fruit juices by the pool." },

  // Experiences & Nature
  { src: "/images/hero/lake-wide.jpg", title: "Private Lake View", category: "experiences", desc: "Panoramas across the serene Hikkaduwa Lake." },
  { src: "/images/hero/lake-sunset.jpg", title: "Golden Lake Sunset", category: "experiences", desc: "Spectacular sunset hues over the peaceful waters." },
  { src: "/images/experiences/boating.jpg", title: "Lake Boating & Kayaking", category: "experiences", desc: "Explore the lake ecosystem directly from our private dock." },
  { src: "/images/experiences/garden-relax.jpg", title: "Tropical Garden Oasis", category: "experiences", desc: "Unwind under coconut palms listening to birdsong." },
  { src: "/images/gallery/garden-path.jpg", title: "Garden Pathway", category: "experiences", desc: "Lush green walkway leading from villa to the lake." },
  { src: "/images/gallery/nature.jpg", title: "Lakeside Flora & Wildlife", category: "experiences", desc: "Native exotic plants and bird species in our grounds." },
  { src: "/images/gallery/balcony.jpg", title: "Balcony Lake Vista", category: "experiences", desc: "Private upper balcony overlooking the gardens and lake." },

  // All 61 property photos from the imgs folder
  ...BOOKING_GALLERY_ITEMS,
];

function GallerySection({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  const bg = dark ? "#0a1e2e" : "#ffffff";
  const text = dark ? "#e8e0d0" : "#0d2233";
  const sub = dark ? "rgba(232,224,208,0.6)" : "#52637a";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,82,0.12)";

  const [cat, setCat] = useState<string>("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = cat === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((i) => i.category === cat);
  const INITIAL_LIMIT = 8;
  const displayedItems = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT);
  const remainingCount = filtered.length - (INITIAL_LIMIT - 1);

  return (
    <section id="gallery" style={{ background: bg, transition: "background 0.5s" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>Visual Journey</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 400, color: text, lineHeight: 1.12, marginBottom: 16 }}>
            The Villa <em style={{ color: "#c9a84c" }}>Gallery</em>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 300, color: sub, maxWidth: 520, lineHeight: 1.8 }}>
            Explore every corner of Hikka Secret Lake Villa — from our lakeside pool and private rooms to tropical dining and natural surroundings.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[
              { id: "all", label: "All Photos" },
              { id: "villa", label: "Villa & Pool" },
              { id: "rooms", label: "Rooms & Suites" },
              { id: "dining", label: "Dining" },
              { id: "experiences", label: "Nature & Lake" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setCat(t.id); setShowAll(false); }}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "8px 20px",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.25s",
                  border: cat === t.id ? "1px solid #c9a84c" : `1px solid ${border}`,
                  background: cat === t.id ? "linear-gradient(135deg, #c9a84c 0%, #b8933a 100%)" : "transparent",
                  color: cat === t.id ? "#0d2233" : sub,
                }}
              >
                {t.label} ({t.id === "all" ? GALLERY_ITEMS.length : GALLERY_ITEMS.filter(i => i.category === t.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid (8 photos max initially) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedItems.map((item, idx) => {
            const isLastThumbnail = !showAll && filtered.length > INITIAL_LIMIT && idx === INITIAL_LIMIT - 1;
            return (
              <div
                key={item.src + idx}
                onClick={() => setLightboxIdx(idx)}
                className="group relative rounded overflow-hidden cursor-pointer"
                style={{ height: 220, background: "#1a3a52", border: `1px solid ${border}` }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />

                {/* 8th Card "+XX Photos" Overlay */}
                {isLastThumbnail ? (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
                    style={{ background: "rgba(11,26,38,0.82)", backdropFilter: "blur(4px)" }}
                  >
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 500, color: "#e6c97a" }}>
                      +{remainingCount}
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ffffff", marginTop: 4 }}>
                      More Photos
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                      Click to view album
                    </span>
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                    style={{ background: "linear-gradient(to top, rgba(13,34,51,0.92) 0%, rgba(13,34,51,0.4) 60%, transparent 100%)" }}
                  >
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>{item.category}</p>
                    <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500, color: "#ffffff", margin: 0, lineHeight: 1.2 }}>{item.title}</h4>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        {filtered.length > INITIAL_LIMIT && (
          <div className="flex flex-col items-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "14px 36px",
                background: "linear-gradient(135deg, #c9a84c 0%, #e6c97a 100%)",
                color: "#0d2233",
                border: "none",
                borderRadius: 2,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
                transition: "all 0.25s",
              }}
            >
              {showAll ? "Show Less Photos" : `View All ${filtered.length} Photos (+${filtered.length - INITIAL_LIMIT})`}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ maxHeight: "75vh", overflow: "hidden", borderRadius: 4, position: "relative" }}>
              <img
                src={filtered[lightboxIdx].src}
                alt={filtered[lightboxIdx].title}
                style={{ maxHeight: "75vh", maxWidth: "100%", objectFit: "contain", borderRadius: 4 }}
              />
            </div>
            <div className="text-center mt-4 px-4">
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: "#ffffff", marginBottom: 4 }}>{filtered[lightboxIdx].title}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.7)" }}>{filtered[lightboxIdx].desc}</p>
            </div>

            {/* Nav controls */}
            <button
              onClick={() => setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2"
              style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => setLightboxIdx((lightboxIdx + 1) % filtered.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronRight />
            </button>
            <button
              onClick={() => setLightboxIdx(null)}
              style={{ position: "absolute", top: -48, right: 0, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [scrolled, setScrolled] = useState(false);
  const [roomModal, setRoomModal] = useState<typeof ROOMS[0] | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<typeof ROOMS[0] | null>(null);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | undefined>(undefined);

  const openBooking = (room?: typeof ROOMS[0], prefill?: BookingPrefill) => {
    setBookingRoom(room ?? null);
    setBookingPrefill(prefill);
    setRoomModal(null);
    setBookingOpen(true);
  };

  const dark = theme === "dark";

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: dark ? "#0b1a26" : "#f4f0ea", transition: "background 0.5s", overflowX: "hidden" }}>

      <Navbar scrolled={scrolled} theme={theme} toggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")} onBook={() => openBooking()} />
      <Hero onBook={(prefill) => openBooking(undefined, prefill)} />
      <LocationSection theme={theme} />
      <AccommodationsSection theme={theme} currency={currency} setCurrency={setCurrency} onSelectRoom={(r) => setRoomModal(r)} />
      <DiningSection theme={theme} />
      <GallerySection theme={theme} />
      <OffersSection theme={theme} onBook={() => openBooking()} />
      <AmenitiesSection theme={theme} />
      <MapSection theme={theme} />
      <Footer theme={theme} onBook={() => openBooking()} />

      {roomModal && (
        <RoomModal room={roomModal} theme={theme} currency={currency} setCurrency={setCurrency} onClose={() => setRoomModal(null)} onBook={() => openBooking(roomModal)} />
      )}
      {bookingOpen && (
        <BookingModal theme={theme} selectedRoom={bookingRoom} prefill={bookingPrefill} onClose={() => { setBookingOpen(false); setBookingPrefill(undefined); }} />
      )}

      {/* WhatsApp FAB */}
      <a href="https://wa.me/94763740090" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200, width: 54, height: 54, borderRadius: "50%", background: "#25d366", boxShadow: "0 4px 20px rgba(37,211,102,0.45)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(37,211,102,0.6)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)"; }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="white">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.664 4.797 1.82 6.793L2 30l7.42-1.793A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 0 1-5.892-1.607l-.422-.252-4.404 1.064 1.1-4.286-.276-.44A11.56 11.56 0 0 1 4.4 16C4.4 9.594 9.594 4.4 16 4.4S27.6 9.594 27.6 16 22.406 27.6 16 27.6zm6.34-8.668c-.346-.174-2.05-1.01-2.368-1.125-.317-.116-.548-.174-.778.174-.23.346-.892 1.125-1.094 1.356-.202.23-.404.26-.75.086-.346-.174-1.46-.538-2.781-1.716-1.028-.917-1.722-2.05-1.924-2.396-.202-.346-.022-.533.152-.706.156-.155.346-.404.52-.606.173-.202.23-.346.346-.578.115-.23.058-.433-.029-.606-.086-.174-.778-1.876-1.066-2.568-.28-.674-.566-.582-.778-.593l-.663-.012c-.23 0-.606.086-.924.433-.317.346-1.21 1.182-1.21 2.884s1.24 3.346 1.413 3.578c.173.23 2.44 3.724 5.912 5.222.826.356 1.47.569 1.973.728.829.264 1.584.226 2.18.137.665-.1 2.05-.838 2.34-1.647.29-.81.29-1.502.202-1.647-.086-.145-.317-.23-.663-.404z" />
        </svg>
      </a>
    </div>
  );
}
