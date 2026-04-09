import { Router } from "express";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon
} from "../controllers/couponController.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/apply", requireAuth, applyCoupon);
router.get("/", requireAuth, requireAdmin, listCoupons);
router.post("/", requireAuth, requireAdmin, createCoupon);
router.put("/:id", requireAuth, requireAdmin, updateCoupon);
router.delete("/:id", requireAuth, requireAdmin, deleteCoupon);

export default router;
