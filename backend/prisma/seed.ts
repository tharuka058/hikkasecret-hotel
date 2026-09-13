import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Seed Admin User (Upsert so existing data is preserved) ────────────────
  const passwordHash = await bcrypt.hash("hikka#123", 12);
  await prisma.adminUser.upsert({
    where: { username: "adminhikka" },
    update: {},
    create: {
      username: "adminhikka",
      email: "admin@hikka-secret.com",
      passwordHash,
      role: "admin",
    },
  });
  console.log("✅ Admin user ready");

  // ─── Seed Rooms if empty ──────────────────────────────────────────────────
  const roomCount = await prisma.room.count();
  if (roomCount === 0) {
    await prisma.room.createMany({
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
          thumb: "/images/villa/master-suite.jpg",
          isActive: true,
        },
      ],
    });
    console.log("✅ Created initial rooms");
  }

  // ─── Seed Offers if empty ─────────────────────────────────────────────────
  const offerCount = await prisma.offer.count();
  if (offerCount === 0) {
    await prisma.offer.createMany({
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
    console.log("✅ Created initial offers");
  }

  // ─── Seed Dining if empty ─────────────────────────────────────────────────
  const diningCount = await prisma.diningItem.count();
  if (diningCount === 0) {
    await prisma.diningItem.createMany({
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
    console.log("✅ Created initial dining items");
  }

  console.log("🎉 Database seeding complete!");
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
