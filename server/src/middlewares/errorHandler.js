import { AppError } from "../utils/appError.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found.", 404));
}

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error?.message === "string" && error.message.includes("not allowed by CORS")) {
    return new AppError(error.message, 403);
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0] || "Field";
    return new AppError(`${duplicateField} already exists.`, 409);
  }

  if (error?.name === "ValidationError") {
    const validationMessage =
      Object.values(error.errors || {})
        .map((entry) => entry.message)
        .join(", ") || "Validation failed.";

    return new AppError(validationMessage, 400);
  }

  if (error?.name === "CastError") {
    return new AppError(`Invalid ${error.path || "resource"} value.`, 400);
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return new AppError("Session expired or invalid. Please login again.", 401);
  }

  return error;
}

export function errorHandler(error, _req, res, _next) {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;

  if (statusCode >= 500) {
    console.error(normalizedError);
  }

  res.status(statusCode).json({
    success: false,
    message: normalizedError.message || "Something went wrong.",
    details: normalizedError.details || null
  });
}
