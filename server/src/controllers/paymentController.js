import Coupon from "../models/Coupon.js";
import Payment from "../models/Payment.js";
import Wish from "../models/Wish.js";
import { validateCoupon } from "../services/couponService.js";
import { createPaymentOrder, verifyPaymentSignature } from "../services/paymentService.js";
import env from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { generateShareSlug } from "../utils/generateShareSlug.js";
import { BASE_WISH_PRICE, calculateDiscount } from "../utils/pricing.js";

async function ensureWishOwnership(wishId, userId) {
  const wish = await Wish.findOne({ _id: wishId, owner: userId });
  if (!wish) {
    throw new AppError("Wish not found.", 404);
  }
  return wish;
}

async function createUniqueShareSlug() {
  let shareSlug = generateShareSlug();

  while (await Wish.exists({ shareSlug })) {
    shareSlug = generateShareSlug();
  }

  return shareSlug;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { wishId, couponCode } = req.body;
  const wish = await ensureWishOwnership(wishId, req.user._id);
  const coupon = await validateCoupon(couponCode, req.user._id);
  const pricing = calculateDiscount(BASE_WISH_PRICE, coupon);
  const order = await createPaymentOrder({
    amount: pricing.finalAmount,
    receipt: `wish_${wish._id}`,
    notes: {
      wishId: wish._id.toString(),
      ownerId: req.user._id.toString()
    }
  });

  wish.priceBreakdown = {
    baseAmount: BASE_WISH_PRICE,
    discountAmount: pricing.discountAmount,
    finalAmount: pricing.finalAmount,
    couponCode: coupon?.code || ""
  };
  wish.status = "pending_payment";
  await wish.save();

  const payment = await Payment.create({
    wish: wish._id,
    user: req.user._id,
    provider: order.provider,
    orderId: order.orderId,
    amount: pricing.finalAmount,
    couponCode: coupon?.code || ""
  });

  res.json({
    success: true,
    data: {
      order,
      payment,
      pricing: {
        baseAmount: BASE_WISH_PRICE,
        ...pricing
      }
    }
  });
});

export const verifyOrder = asyncHandler(async (req, res) => {
  const {
    wishId,
    orderId,
    paymentId,
    signature,
    demoSuccessToken
  } = req.body;

  const wish = await ensureWishOwnership(wishId, req.user._id);
  const payment = await Payment.findOne({ wish: wish._id, orderId }).sort({
    createdAt: -1
  });

  if (!payment) {
    throw new AppError("Payment order not found.", 404);
  }

  const isValid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
    demoSuccessToken
  });

  if (!isValid) {
    payment.status = "failed";
    payment.rawPayload = req.body;
    await payment.save();
    throw new AppError("Payment verification failed.", 400);
  }

  const wasAlreadyPaid = payment.status === "paid";

  payment.paymentId = paymentId || `demo_payment_${Date.now()}`;
  payment.signature = signature || "";
  payment.status = "paid";
  payment.rawPayload = req.body;
  await payment.save();

  if (!wasAlreadyPaid && wish.priceBreakdown.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: wish.priceBreakdown.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  if (!wish.shareSlug) {
    wish.shareSlug = await createUniqueShareSlug();
  }

  wish.paymentStatus = "paid";
  wish.status = wish.deliveryMode === "scheduled" && wish.scheduleAt ? "scheduled" : "active";
  wish.isActive = wish.status === "active";
  wish.expiresAt =
    wish.status === "active"
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;

  await wish.save();

  res.json({
    success: true,
    message: "Payment verified and wish published.",
    data: {
      wish,
      shareUrl: `${env.clientPublicUrl}/wish/${wish.shareSlug}`
    }
  });
});
