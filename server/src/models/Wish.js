import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    name: String
  },
  {
    _id: false
  }
);

const wishSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipientName: {
      type: String,
      required: true,
      trim: true
    },
    relation: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ""
    },
    shayari: {
      type: String,
      default: ""
    },
    theme: {
      type: String,
      enum: ["romantic", "family", "funny", "emotional", "royal", "party"],
      default: "romantic"
    },
    images: {
      type: [mediaSchema],
      default: []
    },
    music: {
      type: {
        type: String,
        enum: ["preset", "upload", ""],
        default: ""
      },
      preset: {
        type: String,
        default: ""
      },
      url: {
        type: String,
        default: ""
      },
      publicId: {
        type: String,
        default: ""
      },
      name: {
        type: String,
        default: ""
      }
    },
    voiceMessage: {
      type: mediaSchema,
      default: null
    },
    accessPasswordHash: {
      type: String,
      default: ""
    },
    shareSlug: {
      type: String,
      unique: true,
      sparse: true
    },
    deliveryMode: {
      type: String,
      enum: ["manual", "scheduled"],
      default: "manual"
    },
    scheduleAt: {
      type: Date,
      default: null
    },
    recipientEmail: {
      type: String,
      default: ""
    },
    recipientPhone: {
      type: String,
      default: ""
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_payment",
        "scheduled",
        "active",
        "expired",
        "moderated"
      ],
      default: "draft"
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid"
    },
    priceBreakdown: {
      baseAmount: {
        type: Number,
        default: 1000
      },
      discountAmount: {
        type: Number,
        default: 0
      },
      finalAmount: {
        type: Number,
        default: 1000
      },
      couponCode: {
        type: String,
        default: ""
      }
    },
    previewViews: {
      type: Number,
      default: 0
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    openedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

wishSchema.index({ owner: 1, createdAt: -1 });
wishSchema.index({ scheduleAt: 1 });
wishSchema.index({ expiresAt: 1 });

const Wish = mongoose.model("Wish", wishSchema);

export default Wish;
