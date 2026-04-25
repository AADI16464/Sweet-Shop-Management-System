import { Request, Response } from "express";
import { prisma } from "../prisma";
import { createPaymentSession as createGatewayPaymentSession, verifyPayment, verifyWebhookSignature } from "../services/paymentService";

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

/**
 * Create a new order from cart items
 */
export async function createOrder(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { items, paymentReference, paymentProvider, paymentMeta } = req.body; // Array of { sweetId, quantity }
  type OrderItemInput = { sweetId: string; quantity: number; price: number };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items in order" });
  }

  // Basic deduplication - check for recent duplicate order
  const recentOrder = await prisma.order.findFirst({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 5000) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOrder) {
    return res.status(429).json({ error: "Duplicate order detected. Please wait before placing another order." });
  }

  try {
    const paymentVerification = verifyPayment({ provider: paymentProvider, paymentReference, paymentMeta });
    if (!paymentVerification.ok) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Calculate total and verify stock
    let total = 0;
    const orderItemsData: OrderItemInput[] = [];

    for (const item of items) {
      if (!item?.sweetId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: "Invalid order item payload" });
      }

      const sweet = await prisma.sweet.findUnique({ where: { id: item.sweetId } });
      if (!sweet) return res.status(404).json({ error: `Sweet ${item.sweetId} not found` });
      if (sweet.quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${sweet.name}` });
      }

      total += sweet.price * item.quantity;
      orderItemsData.push({
        sweetId: item.sweetId,
        quantity: item.quantity,
        price: sweet.price,
      });
    }

    // Use a transaction to ensure atomic updates
    const order = await prisma.$transaction(async (tx) => {
      // 1. Update stock for each item
      for (const item of orderItemsData) {
        await tx.sweet.update({
          where: { id: item.sweetId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
        
        // Update inStock status after decrement
        const updatedSweet = await tx.sweet.findUnique({ where: { id: item.sweetId } });
        if (updatedSweet && updatedSweet.quantity <= 0) {
          await tx.sweet.update({
            where: { id: item.sweetId },
            data: { inStock: false }
          });
        }
      }

      // 2. Create the order
      const isCOD = paymentVerification.provider === "COD";
      const codReference = isCOD ? `COD_${Date.now()}_${Math.floor(Math.random() * 100000)}` : null;
      return tx.order.create({
        data: {
          userId,
          total,
          status: "PROCESSING",
          paymentStatus: isCOD ? "PENDING" : "PAID",
          paymentProvider: paymentVerification.provider,
          paymentReference:
            paymentReference ||
            paymentMeta?.razorpayPaymentId ||
            paymentMeta?.razorpayOrderId ||
            codReference,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              sweet: true,
            },
          },
        },
      });
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
}

/**
 * Create payment session (mock gateway)
 */
export async function createPaymentSession(req: Request, res: Response) {
  const { amount } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }

  try {
    const session = await createGatewayPaymentSession({ amount, currency: "INR" });
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create payment session" });
  }
}

/**
 * List orders for current user
 */
export async function getOrders(req: Request, res: Response) {
  const userId = (req as any).user.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

/**
 * List all orders for admin
 */
export async function getAllOrders(req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
        items: {
          include: {
            sweet: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  if (status && !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid order status" });
  }

  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json({ error: "Invalid payment status" });
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
        items: {
          include: {
            sweet: true,
          },
        },
      },
    });

    res.json(updated);
  } catch {
    res.status(404).json({ error: "Order not found" });
  }
}

/**
 * Analytics for admin dashboard
 */
export async function getOrderAnalytics(req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const statusCounts = ORDER_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<string, number>);

    const revenueByDay: Record<string, number> = {};
    const topSweets: Record<string, { name: string; quantity: number }> = {};

    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

      const day = new Date(order.createdAt).toISOString().slice(0, 10);
      revenueByDay[day] = (revenueByDay[day] || 0) + order.total;

      for (const item of order.items) {
        if (!item.sweet) continue;
        const key = item.sweet.id;
        if (!topSweets[key]) {
          topSweets[key] = { name: item.sweet.name, quantity: 0 };
        }
        topSweets[key].quantity += item.quantity;
      }
    }

    res.json({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      statusCounts,
      revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
      topSweets: Object.values(topSweets)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}

/**
 * Handle Razorpay webhooks
 */
export async function handleRazorpayWebhook(req: Request, res: Response) {
  const signature = req.headers["x-razorpay-signature"] as string;
  const payload = JSON.stringify(req.body);

  if (!signature || !verifyWebhookSignature(payload, signature)) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { event, payload: eventData } = req.body;

  try {
    if (event === "payment.captured") {
      const payment = eventData.payment.entity;
      const orderId = payment.order_id;

      // Find order by razorpay order id
      const order = await prisma.order.findFirst({
        where: { paymentReference: orderId },
      });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
          },
        });
        console.log(`Order ${order.id} updated via webhook`);
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook handling failed" });
  }
}

/**
 * Cancel order (user or admin)
 */
export async function cancelOrder(req: Request, res: Response) {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const isAdmin = (req as any).user.isAdmin;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify ownership or admin
    if (order.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Only allow cancellation of pending/processing orders
    if (!["PENDING", "PROCESSING"].includes(order.status)) {
      return res.status(400).json({ error: "Cannot cancel order in current status" });
    }

    // Restore stock for each item
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.sweet.update({
          where: { id: item.sweetId },
          data: {
            quantity: { increment: item.quantity },
            inStock: true,
          },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "FAILED",
        },
      });
    });

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
}
