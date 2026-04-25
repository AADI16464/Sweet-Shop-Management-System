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
import { upload } from "../middleware/upload";

const router = Router();

// Public routes - anyone can view sweets
router.get("/", listSweets);
router.get("/search", searchSweets);

// Protected routes - require authentication
router.post("/:id/purchase", authenticateToken, purchaseSweet);

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, upload.single("image"), createSweet);
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), updateSweet);
router.delete("/:id", authenticateToken, requireAdmin, deleteSweet);
router.post("/:id/restock", authenticateToken, requireAdmin, restockSweet);

export default router;