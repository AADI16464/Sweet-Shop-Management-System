import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { prisma } from "../src/prisma";

async function seed() {
  console.log("🌱 Seeding sweet shop database...");

  // Clear existing sweets (DEV ONLY – remove for production)
  await prisma.sweet.deleteMany();

  const sweets = [
    {
      name: "Gulab Jamun",
      description:
        "Soft deep-fried milk-solid dumplings soaked in aromatic sugar syrup.",
      category: "Milk-based",
      price: 400, // ₹/kg
      quantity: 50,
      imageUrl: "/sweets/gulab-jamun.jpg",
    },
    {
      name: "Jalebi",
      description:
        "Crispy spiral-shaped sweet soaked in saffron-flavored sugar syrup.",
      category: "Fried",
      price: 300,
      quantity: 40,
      imageUrl: "/sweets/jalebi.jpg",
    },
    {
      name: "Kaju Katli",
      description:
        "Premium cashew-based fudge with a smooth texture and rich taste.",
      category: "Barfi",
      price: 900,
      quantity: 25,
      imageUrl: "/sweets/kaju-katli.jpg",
    },
    {
      name: "Laddu",
      description:
        "Traditional round sweet made with gram flour, ghee, and sugar.",
      category: "Laddu",
      price: 250,
      quantity: 60,
      imageUrl: "/sweets/laddu.jpg",
    },
    {
      name: "Mysore Pak",
      description:
        "Classic South Indian sweet made from ghee, sugar, and gram flour.",
      category: "Halwa",
      price: 450,
      quantity: 30,
      imageUrl: "/sweets/mysore-pak.jpg",
    },
    {
      name: "Rasgulla",
      description:
        "Spongy cottage cheese balls soaked in light sugar syrup.",
      category: "Milk-based",
      price: 350,
      quantity: 45,
      imageUrl: "/sweets/rasgulla.jpg",
    },
    {
      name: "Rasmalai",
      description:
        "Soft paneer discs immersed in thick saffron-flavored milk.",
      category: "Milk-based",
      price: 550,
      quantity: 20,
      imageUrl: "/sweets/rasmalai.jpg",
    },
  ];

  await prisma.sweet.createMany({
    data: sweets.map((sweet) => ({
      ...sweet,
      inStock: sweet.quantity > 0,
    })),
  });

  console.log("✅ Sweet shop database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
