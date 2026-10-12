import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();

await db.room.createMany({
  data: [
    { number: "103", name: "Archive Standard", type: "STANDARD", capacity: 1, nightlyRate: 3600, amenities: ["Single bed", "Reading nook"], imageUrl: "/rooms/103.jpg" },
    { number: "104", name: "Harbor Standard", type: "STANDARD", capacity: 2, nightlyRate: 4200, amenities: ["Twin beds", "City view"], imageUrl: "/rooms/104.jpg" },
    { number: "201", name: "Courtyard Deluxe", type: "DELUXE", capacity: 2, nightlyRate: 6400, amenities: ["Queen bed", "Courtyard view", "Minibar"], imageUrl: "/rooms/201.jpg" },
    { number: "202", name: "Courtyard Deluxe", type: "DELUXE", capacity: 2, nightlyRate: 6400, amenities: ["Queen bed", "Courtyard view", "Minibar"], imageUrl: "/rooms/202.jpg" },
    { number: "305", name: "Loft Deluxe", type: "DELUXE", capacity: 3, nightlyRate: 7100, amenities: ["King bed", "Workspace", "Free breakfast"], imageUrl: "/rooms/305.jpg" },
    { number: "402", name: "The Garret Suite", type: "SUITE", capacity: 2, nightlyRate: 8900, amenities: ["King bed", "Skylight", "Free breakfast"], imageUrl: "/rooms/402.jpg" },
    { number: "501", name: "Atelier Suite", type: "SUITE", capacity: 4, nightlyRate: 10500, amenities: ["2 bedrooms", "Kitchenette", "Balcony"], imageUrl: "/rooms/501.jpg" },
    { number: "502", name: "Harbour Suite", type: "SUITE", capacity: 4, nightlyRate: 9800, amenities: ["2 bedrooms", "Sea view", "Free breakfast"], imageUrl: "/rooms/502.jpg" },
  ],
  skipDuplicates: true, // running the seed again won't add the rooms twice
});

console.log("Rooms seeded.");
await db.$disconnect();
