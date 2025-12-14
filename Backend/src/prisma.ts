import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Parse PostgreSQL connection string manually
// Format: postgresql://user:password@host:port/database
const urlMatch = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  throw new Error(`Invalid DATABASE_URL format: ${connectionString}`);
}

const [, user, encodedPassword, host, port, database] = urlMatch;
const password = decodeURIComponent(encodedPassword);

const pool = new Pool({
  host,
  port: parseInt(port),
  database,
  user,
  password,
  ssl: false, // For local development
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;