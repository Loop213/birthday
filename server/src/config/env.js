import dotenv from "dotenv";

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.SERVER_PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  clientPublicUrl: process.env.CLIENT_PUBLIC_URL || "http://localhost:5173",
  serverPublicUrl: process.env.SERVER_PUBLIC_URL || "http://localhost:5000",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/birthday-wishes",
  jwtSecret:
    process.env.JWT_SECRET || "birthday-wishes-development-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  paymentProvider: process.env.PAYMENT_PROVIDER || "demo",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "Birthday Glow <hello@birthdayglow.com>",
  cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET || "",
  adminName: process.env.ADMIN_NAME || "Platform Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@birthdayglow.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123"
};

export default env;
