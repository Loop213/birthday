import { Router } from "express";
import {
  approveManualOrder,
  getDashboardSummary,
  getManualOrders,
  getModerationQueue,
  getUsers,
  moderateWish,
  rejectManualOrder,
  toggleUserBlock
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/dashboard", getDashboardSummary);
router.get("/users", getUsers);
router.patch("/users/:id/toggle-block", toggleUserBlock);
router.get("/orders", getManualOrders);
router.patch("/orders/:id/approve", approveManualOrder);
router.patch("/orders/:id/reject", rejectManualOrder);
router.get("/wishes", getModerationQueue);
router.delete("/wishes/:id", moderateWish);

export default router;
