import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

const hasCloudinary =
  env.cloudinaryName && env.cloudinaryKey && env.cloudinarySecret;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinaryName,
    api_key: env.cloudinaryKey,
    api_secret: env.cloudinarySecret
  });
}

async function uploadLocalFile(file, folder = "general") {
  await fs.mkdir(path.join(uploadsDir, folder), { recursive: true });

  const ext = path.extname(file.originalname || "") || "";
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}${ext}`;
  const filepath = path.join(uploadsDir, folder, filename);

  await fs.writeFile(filepath, file.buffer);

  return {
    url: `${env.serverPublicUrl}/uploads/${folder}/${filename}`,
    publicId: `${folder}/${filename}`,
    name: file.originalname
  };
}

async function uploadCloudinaryFile(file, folder = "birthday-glow") {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const response = await cloudinary.uploader.upload(dataUri, {
    resource_type: file.mimetype.startsWith("audio/") ? "video" : "image",
    folder
  });

  return {
    url: response.secure_url,
    publicId: response.public_id,
    name: file.originalname
  };
}

export async function uploadAsset(file, folder) {
  return hasCloudinary
    ? uploadCloudinaryFile(file, folder)
    : uploadLocalFile(file, folder);
}
