import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { compareValue, hashValue, signToken } from "../utils/security.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt
  };
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required.", 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await hashValue(password)
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      token,
      user: sanitizeUser(user)
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.isBlocked) {
    throw new AppError("Your account has been blocked by admin.", 403);
  }

  const isValid = await compareValue(password, user.passwordHash);

  if (!isValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken(user);

  res.json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: sanitizeUser(user)
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user)
    }
  });
});
