import crypto from "crypto";
import Razorpay from "razorpay";
import env from "../config/env.js";

const razorpay =
  env.paymentProvider === "razorpay" && env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret
      })
    : null;

export async function createPaymentOrder({
  amount,
  receipt,
  notes = {}
}) {
  if (env.paymentProvider === "razorpay" && razorpay) {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes
    });

    return {
      provider: "razorpay",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    };
  }

  return {
    provider: "demo",
    orderId: `demo_order_${crypto.randomBytes(6).toString("hex")}`,
    amount,
    currency: "INR",
    demoSuccessToken: "DEMO_SUCCESS"
  };
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
  demoSuccessToken
}) {
  if (env.paymentProvider === "razorpay" && razorpay) {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(body)
      .digest("hex");

    return expected === signature;
  }

  return demoSuccessToken === "DEMO_SUCCESS";
}
