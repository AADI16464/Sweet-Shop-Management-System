import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Simple in-memory rate limiting for auth endpoints
const authRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = authRateLimit.get(ip);
  
  if (!record || now > record.resetTime) {
    authRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function register(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  
  const { email, password, displayName } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      displayName,
    },
  });

  // Return token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin, deliveryAddress: user.deliveryAddress, mobileNumber: user.mobileNumber } });
}

export async function login(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin, deliveryAddress: user.deliveryAddress, mobileNumber: user.mobileNumber } });
}

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, isAdmin: true, deliveryAddress: true, mobileNumber: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { displayName, deliveryAddress, mobileNumber } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: displayName !== undefined ? displayName : undefined,
      deliveryAddress: deliveryAddress !== undefined ? deliveryAddress : undefined,
      mobileNumber: mobileNumber !== undefined ? mobileNumber : undefined,
    },
    select: { id: true, email: true, displayName: true, isAdmin: true, deliveryAddress: true, mobileNumber: true },
  });
  
  res.json(user);
}