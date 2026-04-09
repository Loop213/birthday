import { Router } from "express";
import {
  getDashboardSummary,
  getModerationQueue,
  getUsers,
  moderateWish,
  toggleUserBlock
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/dashboard", getDashboardSummary);
router.get("/users", getUsers);
router.patch("/users/:id/toggle-block", toggleUserBlock);
router.get("/wishes", getModerationQueue);
router.delete("/wishes/:id", moderateWish);

export default router;
