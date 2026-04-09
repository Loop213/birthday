import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    maxDiscount: {
      type: Number,
      default: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: null
    },
    usageLimit: {
      type: Number,
      default: 0
    },
    userUsageLimit: {
      type: Number,
      default: 1
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
