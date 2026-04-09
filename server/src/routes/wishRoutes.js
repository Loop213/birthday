import { Router } from "express";
import {
  accessWish,
  createWish,
  deleteWish,
  getMyWishes,
  getWishById,
  getWishPublicMeta,
  previewWish,
  updateWish
} from "../controllers/wishController.js";
import { requireAuth } from "../middlewares/auth.js";
import { uploadWishAssets } from "../middlewares/upload.js";

const router = Router();

router.get("/public/meta/:slug", getWishPublicMeta);
router.post("/public/access/:slug", accessWish);

router.get("/", requireAuth, getMyWishes);
router.post("/", requireAuth, uploadWishAssets, createWish);
router.get("/:id", requireAuth, getWishById);
router.put("/:id", requireAuth, uploadWishAssets, updateWish);
router.get("/:id/preview", requireAuth, previewWish);
router.delete("/:id", requireAuth, deleteWish);

export default router;
