import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clear existing data ───────────────────────────────────────────────────
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.diningItem.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.inquiry.deleteMany();

  // ─── Seed Rooms ───────────────────────────────────────────────────────────
  const rooms = await prisma.room.createMany({
    data: [
      {
        id: 1,
        name: "Deluxe Double Room",
        type: "Deluxe Double Room",
        price: 85,
        size: "28 m²",
        maxGuests: 2,
        isVilla: false,
        desc: "This double room's special feature is the pool with a view. The spacious double room provides air conditioning, a seating area, a terrace with lake views as well as a private bathroom featuring a shower & bidet. Features 1 extra-long king bed.",
        tags: JSON.stringify([
          "28 m²",
          "1 Extra-Long King Bed",
          "Private Bathroom & Bidet",
          "Lake View",
          "Garden View",
          "Pool View",
          "Balcony & Terrace",
          "Barbecue",
          "Air Conditioning",
          "Free Wi-Fi",
          "Smoking Permitted",
        ]),
        gallery: JSON.stringify([
          "/images/rooms/deluxe-main.jpg",
          "/images/rooms/double-bed.jpg",
          "/images/rooms/room-interior-1.jpg",
          "/images/rooms/room-interior-2.jpg",
          "/images/rooms/bed-detail.jpg",
          "/images/rooms/bathroom.jpg",
          "/images/rooms/vanity.jpg",
        ]),
        thumb:
          "/images/rooms/deluxe-main.jpg",
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
        desc: "The pool with a view is a top feature of this spacious 85 m² double room / apartment. Guests will find a refrigerator, electric kettle, and washing machine in the private kitchen. Includes a barbecue, air conditioning, private entrance, terrace & balcony with serene lake views, as well as a private bathroom boasting a shower & bidet. Features 2 beds (1 king bed & 1 sofa bed).",
        tags: JSON.stringify([
          "85 m²",
          "1 King Bed + 1 Sofa Bed",
          "Private Kitchen",
          "Washing Machine",
          "Lake View",
          "Garden View",
          "Pool View",
          "Balcony & Terrace",
          "Barbecue",
          "Air Conditioning",
          "Free Wi-Fi",
          "Private Bathroom & Bidet",
          "Smoking Permitted",
        ]),
        gallery: JSON.stringify([
          "/images/rooms/apt-living.jpg",
          "/images/rooms/apt-interior-1.jpg",
          "/images/rooms/apt-kitchen.jpg",
          "/images/rooms/bathroom-shower.jpg",
          "/images/rooms/night-ambient.jpg",
        ]),
        thumb:
          "/images/rooms/apt-living.jpg",
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
        tags: JSON.stringify([
          "4 Double Rooms",
          "Lake Apartment",
          "Lush Garden",
          "Pool Access",
          "Lake Activities",
          "Lake View",
          "Garden View",
          "Free Wi-Fi",
          "Total Privacy",
          "Up to 12 Guests",
        ]),
        gallery: JSON.stringify([
          "/images/villa/master-suite.jpg",
          "/images/hero/villa-exterior.jpg",
          "/images/gallery/villa-architecture.jpg",
          "/images/gallery/pool-reflection.jpg",
        ]),
        thumb:
          "/images/villa/master-suite.jpg",
        isActive: true,
      },
    ],
  });
  console.log(`✅ Created ${rooms.count} rooms`);

  // ─── Seed Offers / Promo Codes ─────────────────────────────────────────────
  const offers = await prisma.offer.createMany({
    data: [
      {
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
        code: "HSV7NIGHT",
        title: "7-Night Retreat",
        badge: "Long Stay",
        desc: "Stay 7 nights and enjoy 15% off your total booking across any room type. Includes daily breakfast.",
        discountPercent: 15,
        price: null,
        img: "/images/experiences/garden-relax.jpg",
        highlight: false,
        isActive: true,
      },
      {
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
    ],
  });
  console.log(`✅ Created ${offers.count} offers/promo codes`);

  // ─── Seed Dining Items ─────────────────────────────────────────────────────
  const dining = await prisma.diningItem.createMany({
    data: [
      {
        title: "Tropical Breakfast",
        desc: "Start your day with a freshly prepared Sri Lankan or continental breakfast served in the garden or by the pool.",
        img: "/images/dining/breakfast.jpg",
        tag: "Served 7am – 10am",
        isActive: true,
      },
      {
        title: "In-Villa Dining",
        desc: "Our kitchen can prepare authentic Sri Lankan rice & curry, seafood platters, and BBQ dinners on request.",
        img: "/images/dining/dining-table.jpg",
        tag: "Available any time",
        isActive: true,
      },
      {
        title: "Poolside Refreshments",
        desc: "Fresh tropical juices, coconut water, and light snacks served throughout the day at the pool.",
        img: "/images/dining/drinks.jpg",
        tag: "All day",
        isActive: true,
      },
    ],
  });
  console.log(`✅ Created ${dining.count} dining items`);

  // ─── Seed Admin User ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("hikka#123", 12);
  const admin = await prisma.adminUser.create({
    data: {
      username: "adminhikka",
      email: "admin@hikka-secret.com",
      passwordHash,
      role: "admin",
    },
  });
  console.log(`✅ Created admin user: ${admin.username}`);

  // ─── Seed Sample Bookings (demo data) ─────────────────────────────────────
  const sampleBookings = await prisma.booking.createMany({
    data: [
      {
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
        notes: "Honeymoon trip — please prepare flower arrangements.",
        promoCode: "HSVHONEY",
        discountPercent: 10,
        basePrice: 85,
        nights: 3,
        totalPrice: 229.5,
        advancePayment: 114.75,
        status: "confirmed",
      },
      {
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
        notes: "Family holiday. Children are 5 and 8 years old.",
        promoCode: "",
        discountPercent: 0,
        basePrice: 150,
        nights: 5,
        totalPrice: 750,
        advancePayment: 375,
        status: "pending",
      },
      {
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
        notes: "Corporate team retreat. Please arrange for BBQ on arrival night.",
        promoCode: "HSVVILLA",
        discountPercent: 5,
        basePrice: 490,
        nights: 6,
        totalPrice: 2793,
        advancePayment: 1396.5,
        status: "confirmed",
      },
    ],
  });
  console.log(`✅ Created ${sampleBookings.count} sample bookings`);

  console.log("\n🎉 Database seeding complete!");
  console.log("\n📋 Admin Credentials:");
  console.log("   Username: adminhikka");
  console.log("   Password: hikka#123");
  console.log("\n🔑 Demo Promo Codes:");
  console.log("   HSVHONEY  — 10% off (Honeymoon Special)");
  console.log("   HSV7NIGHT — 15% off (7-Night Retreat)");
  console.log("   HSVVILLA  — 5% off (Whole Villa Booking)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
