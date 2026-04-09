import Coupon from "../models/Coupon.js";
import Payment from "../models/Payment.js";
import { AppError } from "../utils/appError.js";

export async function validateCoupon(code, userId) {
  if (!code) {
    return null;
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon || !coupon.isActive) {
    throw new AppError("Coupon code is invalid.", 404);
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError("Coupon has expired.", 400);
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit has been reached.", 400);
  }

  const userCouponCount = await Payment.countDocuments({
    user: userId,
    couponCode: coupon.code,
    status: "paid"
  });

  if (coupon.userUsageLimit > 0 && userCouponCount >= coupon.userUsageLimit) {
    throw new AppError("You have already used this coupon.", 400);
  }

  return coupon;
}
