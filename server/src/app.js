import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import wishRoutes from "./routes/wishRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import env from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = new Set([env.clientOrigin]);

try {
  const clientUrl = new URL(env.clientOrigin);

  if (clientUrl.hostname === "localhost") {
    allowedOrigins.add(`http://127.0.0.1:${clientUrl.port}`);
  }

  if (clientUrl.hostname === "127.0.0.1") {
    allowedOrigins.add(`http://localhost:${clientUrl.port}`);
  }
} catch (_error) {
  // Ignore malformed CLIENT_ORIGIN and fall back to the raw value.
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Birthday Glow API is healthy."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/wishes", wishRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
