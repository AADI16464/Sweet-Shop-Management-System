import crypto from "crypto";
import Razorpay from "razorpay";

export type PaymentProvider = "MOCK_GATEWAY" | "RAZORPAY" | "COD";

type CreatePaymentSessionInput = {
  amount: number;
  currency?: string;
  paymentMethod?: "card" | "upi" | "wallet" | "netbanking";
};

export type PaymentSession = {
  provider: PaymentProvider;
  sessionId: string;
  amount: number;
  currency: string;
  status: "READY";
  message: string;
  gatewayOrderId?: string;
  keyId?: string;
  supportedMethods?: string[];
};

type VerifyPaymentInput = {
  provider: string;
  paymentReference?: string;
  paymentMeta?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
};

function getProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER?.toUpperCase();
  if (provider === "RAZORPAY") return "RAZORPAY";
  if (provider === "COD") return "COD";
  return "MOCK_GATEWAY";
}

function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
  const currency = input.currency || "INR";
  const provider = getProvider();

  if (provider === "COD") {
    const sessionId = `cod_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
      provider: "COD",
      sessionId,
      amount: input.amount,
      currency,
      status: "READY",
      message: "Cash on Delivery order created - pay when you receive your sweets",
      supportedMethods: ["cod"],
    };
  }

  if (provider === "RAZORPAY") {
    const client = getRazorpayClient();
    const amountInPaise = Math.round(input.amount * 100);
    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      payment_capture: true,
    });

    return {
      provider: "RAZORPAY",
      sessionId: order.id,
      amount: input.amount,
      currency,
      status: "READY",
      message: "Razorpay order created",
      gatewayOrderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  const sessionId = `pay_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  return {
    provider: "MOCK_GATEWAY",
    sessionId,
    amount: input.amount,
    currency,
    status: "READY",
    message: "Mock payment session created",
  };
}

export function verifyPayment(input: VerifyPaymentInput): { ok: boolean; provider: string } {
  const provider = (input.provider || "").toUpperCase();

  if (provider === "COD") {
    return { ok: true, provider: "COD" };
  }

  if (provider !== "RAZORPAY") {
    return { ok: !!input.paymentReference, provider: provider || "MOCK_GATEWAY" };
  }

  const orderId = input.paymentMeta?.razorpayOrderId;
  const paymentId = input.paymentMeta?.razorpayPaymentId;
  const signature = input.paymentMeta?.razorpaySignature;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!orderId || !paymentId || !signature || !keySecret) {
    return { ok: false, provider: "RAZORPAY" };
  }

  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");

  return {
    ok: expected === signature,
    provider: "RAZORPAY",
  };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}
