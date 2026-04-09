import { AppError } from "./appError.js";

export const BASE_WISH_PRICE = 1000;

export function calculateDiscount(baseAmount, coupon) {
  if (!coupon) {
    return { discountAmount: 0, finalAmount: baseAmount };
  }

  if (baseAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Coupon requires a minimum order amount of Rs.${(
        coupon.minOrderAmount / 100
      ).toFixed(0)}.`,
      400
    );
  }

  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((baseAmount * coupon.discountValue) / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  if (coupon.maxDiscount) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }

  discountAmount = Math.min(discountAmount, baseAmount);

  return {
    discountAmount,
    finalAmount: Math.max(baseAmount - discountAmount, 0)
  };
}

export function formatPaise(amount) {
  return `Rs.${(amount / 100).toFixed(2)}`;
}
