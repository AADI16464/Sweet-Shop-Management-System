import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./app";
import { prisma } from "./prisma";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("PORT:", process.env.PORT);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
  console.log("Starting server...");
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
  console.log("Server started successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });