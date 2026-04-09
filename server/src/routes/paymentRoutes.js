import { Router } from "express";
import { createOrder, verifyOrder } from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyOrder);

export default router;
