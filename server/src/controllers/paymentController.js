import Coupon from "../models/Coupon.js";
import Payment from "../models/Payment.js";
import Wish from "../models/Wish.js";
import { validateCoupon } from "../services/couponService.js";
import { createPaymentOrder, verifyPaymentSignature } from "../services/paymentService.js";
import { createUniqueShareSlug } from "../services/shareSlugService.js";
import { sendManualApprovalEmail, sendManualRejectionEmail } from "../services/emailService.js";
import env from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { BASE_WISH_PRICE, calculateDiscount } from "../utils/pricing.js";

async function ensureWishOwnership(wishId, userId) {
  const wish = await Wish.findOne({ _id: wishId, owner: userId });
  if (!wish) {
    throw new AppError("Wish not found.", 404);
  }
  return wish;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { wishId, couponCode, paymentMethod = "razorpay" } = req.body;
  const wish = await ensureWishOwnership(wishId, req.user._id);
  const coupon = await validateCoupon(couponCode, req.user._id);
  const pricing = calculateDiscount(BASE_WISH_PRICE, coupon);

  wish.priceBreakdown = {
    baseAmount: BASE_WISH_PRICE,
    discountAmount: pricing.discountAmount,
    finalAmount: pricing.finalAmount,
    couponCode: coupon?.code || ""
  };
  wish.paymentMethod = paymentMethod === "cod" ? "cod" : env.paymentProvider === "razorpay" ? "razorpay" : "demo";

  if (paymentMethod === "cod") {
    wish.status = "pending_payment";
    wish.paymentStatus = "pending";
    wish.orderStatus = "pending";
    wish.isActive = false;
    wish.adminDecisionNote = "";
    await wish.save();

    const payment = await Payment.create({
      wish: wish._id,
      user: req.user._id,
      provider: "cod",
      orderId: `cod_order_${Date.now()}`,
      amount: pricing.finalAmount,
      couponCode: coupon?.code || "",
      status: "pending",
      orderStatus: "pending",
      rawPayload: {
        paymentMethod: "cod"
      }
    });

    res.json({
      success: true,
      message: "Manual payment request sent for admin approval.",
      data: {
        order: {
          provider: "cod",
          orderId: payment.orderId,
          amount: pricing.finalAmount,
          currency: "INR"
        },
        payment,
        keyId: "",
        pricing: {
          baseAmount: BASE_WISH_PRICE,
          ...pricing
        },
        wish
      }
    });
    return;
  }

  const order = await createPaymentOrder({
    amount: pricing.finalAmount,
    receipt: `wish_${wish._id}`,
    notes: {
      wishId: wish._id.toString(),
      ownerId: req.user._id.toString()
    }
  });

  wish.status = "pending_payment";
  wish.paymentStatus = "unpaid";
  wish.orderStatus = "draft";
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
      keyId: order.provider === "razorpay" ? env.razorpayKeyId : "",
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
  payment.orderStatus = "approved";
  payment.approvalNote = "";
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
  wish.paymentMethod = payment.provider;
  wish.orderStatus = "approved";
  wish.adminDecisionNote = "";
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

export const approveManualOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("wish").populate("user", "name email");

  if (!payment || payment.provider !== "cod") {
    throw new AppError("Manual order not found.", 404);
  }

  const wish = await Wish.findById(payment.wish._id).populate("owner", "name email");
  const note = String(req.body?.note || "").trim();

  payment.status = "paid";
  payment.orderStatus = "approved";
  payment.approvalNote = note;
  payment.paymentId = `cod_approved_${Date.now()}`;
  await payment.save();

  wish.paymentStatus = "paid";
  wish.paymentMethod = "cod";
  wish.orderStatus = "approved";
  wish.adminDecisionNote = note;
  wish.status = wish.deliveryMode === "scheduled" && wish.scheduleAt ? "scheduled" : "active";
  wish.isActive = wish.status === "active";
  wish.expiresAt =
    wish.status === "active"
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;
  await wish.save();

  await sendManualApprovalEmail({
    recipientEmail: payment.user.email,
    recipientName: payment.user.name,
    shareUrl: `${env.clientPublicUrl}/wish/${wish.shareSlug}`,
    accessPassword: "Use the password you created while placing the request"
  });

  res.json({
    success: true,
    message: "Manual order approved and wish activated.",
    data: {
      payment,
      wish
    }
  });
});

export const rejectManualOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("wish").populate("user", "name email");

  if (!payment || payment.provider !== "cod") {
    throw new AppError("Manual order not found.", 404);
  }

  const wish = await Wish.findById(payment.wish._id);
  const note = String(req.body?.note || "").trim();

  payment.status = "rejected";
  payment.orderStatus = "rejected";
  payment.approvalNote = note;
  await payment.save();

  wish.paymentStatus = "failed";
  wish.paymentMethod = "cod";
  wish.orderStatus = "rejected";
  wish.adminDecisionNote = note;
  wish.status = "draft";
  wish.isActive = false;
  await wish.save();

  await sendManualRejectionEmail({
    recipientEmail: payment.user.email,
    recipientName: payment.user.name,
    reason: note
  });

  res.json({
    success: true,
    message: "Manual order rejected.",
    data: {
      payment,
      wish
    }
  });
});
