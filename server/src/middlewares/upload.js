import multer from "multer";
import { AppError } from "../utils/appError.js";

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  const allowedPatterns = [
    /^image\//,
    /^audio\//
  ];

  const isAllowed = allowedPatterns.some((pattern) => pattern.test(file.mimetype));

  if (!isAllowed) {
    cb(new AppError("Only image and audio uploads are supported.", 400));
    return;
  }

  cb(null, true);
}

export const uploadWishAssets = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 8
  }
}).fields([
  { name: "images", maxCount: 6 },
  { name: "musicUpload", maxCount: 1 },
  { name: "voiceMessage", maxCount: 1 }
]);
