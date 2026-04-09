import { Router } from "express";
import { login, me, signup } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;
