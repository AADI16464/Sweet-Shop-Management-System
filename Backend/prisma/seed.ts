import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { prisma } from "../src/prisma";

async function seed() {
  const sweets = [
    {
      name: "Gulab Jamun",
      description:
        "Soft deep-fried milk-solid dumplings soaked in aromatic sugar syrup.",
      category: "Indian Sweet",
      price: 40,
      quantity: 50,
      imageUrl: "/sweets/gulab-jamun.jpg",
    },
    {
      name: "Jalebi",
      description:
        "Crispy spiral-shaped sweet soaked in saffron-flavored sugar syrup.",
      category: "Indian Sweet",
      price: 30,
      quantity: 40,
      imageUrl: "/sweets/jalebi.jpg",
    },
    {
      name: "Kaju Katli",
      description:
        "Premium cashew-based fudge with a smooth texture and rich taste.",
      category: "Indian Sweet",
      price: 60,
      quantity: 25,
      imageUrl: "/sweets/kaju-katli.jpg",
    },
    {
      name: "Laddu",
      description:
        "Traditional round sweet made with gram flour, ghee, and sugar.",
      category: "Indian Sweet",
      price: 25,
      quantity: 60,
      imageUrl: "/sweets/laddu.jpg",
    },
    {
      name: "Mysore Pak",
      description:
        "Classic South Indian sweet made from ghee, sugar, and gram flour.",
      category: "Indian Sweet",
      price: 45,
      quantity: 30,
      imageUrl: "/sweets/mysore-pak.jpg",
    },
    {
      name: "Rasgulla",
      description:
        "Spongy cottage cheese balls soaked in light sugar syrup.",
      category: "Indian Sweet",
      price: 35,
      quantity: 45,
      imageUrl: "/sweets/rasgulla.jpg",
    },
    {
      name: "Rasmalai",
      description:
        "Soft paneer discs immersed in thick saffron-flavored milk.",
      category: "Indian Sweet",
      price: 55,
      quantity: 20,
      imageUrl: "/sweets/rasmalai.jpg",
    },
  ];

  await prisma.sweet.createMany({
    data: sweets.map((sweet) => ({
      ...sweet,
      inStock: sweet.quantity > 0,
    })),
    skipDuplicates: true,
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
