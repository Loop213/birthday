import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    wish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wish",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    provider: {
      type: String,
      enum: ["demo", "razorpay"],
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    paymentId: {
      type: String,
      default: ""
    },
    signature: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created"
    },
    couponCode: {
      type: String,
      default: ""
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
