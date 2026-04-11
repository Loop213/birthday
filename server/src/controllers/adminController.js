import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Wish from "../models/Wish.js";
import Coupon from "../models/Coupon.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { approveManualOrder, rejectManualOrder } from "./paymentController.js";

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  const [totalUsers, totalWishes, coupons, recentUsers, recentWishes, revenue, pendingManualOrders] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Wish.countDocuments(),
      Coupon.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(6),
      Wish.find().populate("owner", "name email").sort({ createdAt: -1 }).limit(8),
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" }
          }
        }
      ]),
      Payment.countDocuments({ provider: "cod", orderStatus: "pending" })
    ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalWishes,
        totalCoupons: coupons,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        pendingManualOrders
      },
      recentUsers,
      recentWishes
    }
  });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

export const toggleUserBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  if (user.role === "admin") {
    return res.status(400).json({
      success: false,
      message: "Admin users cannot be blocked."
    });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    message: user.isBlocked ? "User blocked." : "User unblocked.",
    data: user
  });
});

export const getModerationQueue = asyncHandler(async (_req, res) => {
  const wishes = await Wish.find().populate("owner", "name email").sort({ createdAt: -1 });
  res.json({
    success: true,
    data: wishes
  });
});

export const moderateWish = asyncHandler(async (req, res) => {
  const wish = await Wish.findById(req.params.id);
  wish.status = "moderated";
  wish.isActive = false;
  await wish.save();

  res.json({
    success: true,
    message: "Wish removed by admin.",
    data: wish
  });
});

export const getManualOrders = asyncHandler(async (req, res) => {
  const filter = String(req.query.status || "all");
  const query = { provider: "cod" };

  if (filter !== "all") {
    query.orderStatus = filter;
  }

  const orders = await Payment.find(query)
    .populate("user", "name email")
    .populate({
      path: "wish",
      populate: {
        path: "owner",
        select: "name email"
      }
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders
  });
});

export { approveManualOrder, rejectManualOrder };
