import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { prisma } from "../src/prisma";

async function seedAdmin() {
  const adminEmail =
    process.env.ADMIN_EMAIL || "pratapadityasingh2000@gmail.com";
  const adminPassword =
    process.env.ADMIN_PASSWORD || "Babita@12";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      isAdmin: true,
      displayName: "Sweet Shop Admin",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      displayName: "Sweet Shop Admin",
    },
  });

  console.log("✅ Admin user seeded successfully!");
  console.log(`📧 Email: ${adminEmail}`);
}

seedAdmin()
  .catch((error) => {
    console.error("❌ Admin seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
