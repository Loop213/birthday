import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id);

    if (!user) {
      throw new AppError("User no longer exists.", 401);
    }

    if (user.isBlocked) {
      throw new AppError("Your account has been blocked by admin.", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Admin access required.", 403));
  }

  next();
}
