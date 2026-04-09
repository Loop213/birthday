import Coupon from "../models/Coupon.js";
import { validateCoupon } from "../services/couponService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseCouponExpiryDate } from "../utils/dateHelpers.js";
import { BASE_WISH_PRICE, calculateDiscount } from "../utils/pricing.js";

function normalizeCouponPayload(body) {
  return {
    ...body,
    code: body.code?.toUpperCase()?.trim(),
    expiresAt: parseCouponExpiryDate(body.expiresAt)
  };
}

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await validateCoupon(code, req.user._id);
  const pricing = calculateDiscount(BASE_WISH_PRICE, coupon);

  res.json({
    success: true,
    data: {
      coupon,
      pricing: {
        baseAmount: BASE_WISH_PRICE,
        ...pricing
      }
    }
  });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: coupons
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(normalizeCouponPayload(req.body));

  res.status(201).json({
    success: true,
    message: "Coupon created.",
    data: coupon
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    normalizeCouponPayload(req.body),
    { new: true }
  );

  res.json({
    success: true,
    message: "Coupon updated.",
    data: coupon
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Coupon deleted."
  });
});
