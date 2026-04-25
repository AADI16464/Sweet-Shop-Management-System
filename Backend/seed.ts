import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      password: hashedPassword,
      displayName: "Admin User",
      isAdmin: true,
    },
  });

  console.log({ admin });

  await prisma.sweet.create({
    data: {
      name: "Gulab Jamun",
      description: "Delicious sweet milk balls in syrup",
      category: "Dessert",
      price: 5.99,
      quantity: 100,
      imageUrl: "https://example.com/gulab.jpg",
      inStock: true,
    }
  });

  console.log("Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
