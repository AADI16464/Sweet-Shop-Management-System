import fs from "fs";
import path from "path";
import csvParse from "csv-parse/lib/sync";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { prisma } from "../src/prisma";

async function run(filePath: string) {
  const csv = fs.readFileSync(filePath, "utf8");
  const records = csvParse(csv, { columns: true, skip_empty_lines: true });

  const data = records.map((r: any) => ({
    name: r.name,
    description: r.description || null,
    category: r.category || null,
    price: parseFloat(r.price) || 0,
    quantity: parseInt(r.quantity, 10) || 0,
    imageUrl: r.imageUrl || null,
    inStock: (parseInt(r.quantity, 10) || 0) > 0,
  }));

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.sweet.createMany({ data: batch, skipDuplicates: true });
  }

  console.log("Bulk import complete");
}

if (process.argv.length < 3) {
  console.error("Usage: node bulk-import.js <path-to-csv>");
  process.exit(1);
}

run(process.argv[2])
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
