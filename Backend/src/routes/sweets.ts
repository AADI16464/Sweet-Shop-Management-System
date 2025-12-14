import { Router } from "express";
import {
  createSweet,
  listSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from "../controllers/sweetsController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// Public routes - anyone can view sweets
router.get("/", listSweets);
router.get("/search", searchSweets);

// Protected routes - require authentication
router.post("/", authenticateToken, createSweet);
router.put("/:id", authenticateToken, updateSweet);
router.post("/:id/purchase", authenticateToken, purchaseSweet);

// Admin-only routes
router.delete("/:id", authenticateToken, requireAdmin, deleteSweet);
router.post("/:id/restock", authenticateToken, requireAdmin, restockSweet);

export default router;