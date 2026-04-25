import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import sweetsRoutes from "./routes/sweets";
import orderRoutes from "./routes/orders";

dotenv.config();

const app = express();

// CORS configuration - allow frontend domains
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  credentials: true,
}));

// Request size limits to prevent large payload attacks
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Serve uploads with security headers
app.use("/uploads", express.static("uploads", {
  maxAge: "1d",
  etag: false,
}));

app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetsRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "Sweet Shop API" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Basic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;