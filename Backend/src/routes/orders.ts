import { Router } from "express";
import {
  createOrder,
  getOrders,
  createPaymentSession,
  getAllOrders,
  updateOrderStatus,
  getOrderAnalytics,
  handleRazorpayWebhook,
  cancelOrder,
} from "../controllers/orderController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, createOrder);
router.get("/", authenticateToken, getOrders);
router.post("/payment-session", authenticateToken, createPaymentSession);
router.get("/admin", authenticateToken, requireAdmin, getAllOrders);
router.patch("/:id/status", authenticateToken, requireAdmin, updateOrderStatus);
router.post("/:id/cancel", authenticateToken, cancelOrder);
router.get("/admin/analytics", authenticateToken, requireAdmin, getOrderAnalytics);

// Webhook route (No auth, uses signature verification)
router.post("/webhook/razorpay", handleRazorpayWebhook);

export default router;
