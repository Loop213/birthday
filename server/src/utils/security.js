import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

export async function hashValue(value) {
  return bcrypt.hash(value, 12);
}

export async function compareValue(value, hash) {
  return bcrypt.compare(value, hash);
}

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}
