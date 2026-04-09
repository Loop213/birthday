import { AppError } from "../utils/appError.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong.",
    details: error.details || null
  });
}
