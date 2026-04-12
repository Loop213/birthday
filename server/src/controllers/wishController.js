import Wish from "../models/Wish.js";
import env from "../config/env.js";
import { uploadAsset } from "../services/storageService.js";
import { createUniqueShareSlug } from "../services/shareSlugService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { parseBirthdayScheduleDate } from "../utils/dateHelpers.js";
import { compareValue, hashValue } from "../utils/security.js";
import {
  resolveTemplateId,
  resolveTemplateMusicPreset,
  resolveTemplateTheme
} from "../utils/templateConfig.js";
import { getPublicWishPayload } from "../utils/wishPublicView.js";

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  return value === "true";
}

async function extractWishAssets(files = {}) {
  const images = await Promise.all(
    (files.images || []).map((file) => uploadAsset(file, "images"))
  );
  const [musicUpload] = files.musicUpload || [];
  const [voiceMessage] = files.voiceMessage || [];

  const musicAsset = musicUpload
    ? await uploadAsset(musicUpload, "music")
    : null;
  const voiceAsset = voiceMessage
    ? await uploadAsset(voiceMessage, "voices")
    : null;

  return { images, musicAsset, voiceAsset };
}

async function findOwnedWish(id, userId) {
  const wish = await Wish.findOne({ _id: id, owner: userId }).populate("owner");
  if (!wish) {
    throw new AppError("Wish not found.", 404);
  }
  return wish;
}

export const createWish = asyncHandler(async (req, res) => {
  const {
    recipientName,
    relation,
    templateId,
    message,
    shayari,
    theme,
    deliveryMode,
    scheduleAt,
    recipientEmail,
    recipientPhone,
    timezone,
    accessPassword,
    musicMode,
    musicPreset,
    photoFrameStyle,
    photoTransition
  } = req.body;

  if (!recipientName || !relation || !accessPassword) {
    throw new AppError("Recipient name, relation, and access password are required.");
  }

  if (deliveryMode === "scheduled" && !scheduleAt) {
    throw new AppError("Please choose a birthday schedule date for auto-send.", 400);
  }

  const { images, musicAsset, voiceAsset } = await extractWishAssets(req.files);
  const selectedTimezone = timezone || "Asia/Kolkata";
  const selectedTemplateId = resolveTemplateId(templateId);
  const selectedMusicPreset = musicPreset || resolveTemplateMusicPreset(selectedTemplateId);

  const wish = await Wish.create({
    owner: req.user._id,
    recipientName,
    relation,
    shareSlug: await createUniqueShareSlug(),
    templateId: selectedTemplateId,
    message,
    shayari,
    theme: theme || resolveTemplateTheme(selectedTemplateId),
    deliveryMode: deliveryMode || "manual",
    scheduleAt: parseBirthdayScheduleDate(scheduleAt, selectedTimezone),
    recipientEmail,
    recipientPhone,
    timezone: selectedTimezone,
    accessPasswordHash: await hashValue(accessPassword),
    images,
    photoFrameStyle: photoFrameStyle || "romantic",
    photoTransition: photoTransition || "fade",
    music: musicMode === "upload" && musicAsset
      ? {
          type: "upload",
          preset: "",
          ...musicAsset
        }
      : {
          type: "preset",
          preset: selectedMusicPreset,
          url: "",
          publicId: "",
          name: selectedMusicPreset
        },
    voiceMessage: voiceAsset,
    status: "draft"
  });

  res.status(201).json({
    success: true,
    message: "Wish draft created.",
    data: {
      ...wish.toObject(),
      shareUrl: `${env.clientPublicUrl}/wish/${wish.shareSlug}`
    }
  });
});

export const updateWish = asyncHandler(async (req, res) => {
  const wish = await findOwnedWish(req.params.id, req.user._id);
  const {
    recipientName,
    relation,
    templateId,
    message,
    shayari,
    theme,
    deliveryMode,
    scheduleAt,
    recipientEmail,
    recipientPhone,
    timezone,
    accessPassword,
    musicMode,
    musicPreset,
    keepExistingImages,
    photoFrameStyle,
    photoTransition
  } = req.body;

  const { images, musicAsset, voiceAsset } = await extractWishAssets(req.files);

  const retainImages = parseBoolean(keepExistingImages);
  const selectedTimezone = timezone || wish.timezone || "Asia/Kolkata";
  const nextTemplateId = templateId ? resolveTemplateId(templateId) : wish.templateId;
  const nextMusicPreset = musicPreset || wish.music?.preset || resolveTemplateMusicPreset(nextTemplateId);

  wish.recipientName = recipientName || wish.recipientName;
  wish.relation = relation || wish.relation;
  wish.templateId = nextTemplateId;
  wish.message = message ?? wish.message;
  wish.shayari = shayari ?? wish.shayari;
  wish.theme = theme || resolveTemplateTheme(nextTemplateId) || wish.theme;
  wish.deliveryMode = deliveryMode || wish.deliveryMode;
  wish.scheduleAt = scheduleAt
    ? parseBirthdayScheduleDate(scheduleAt, selectedTimezone)
    : wish.scheduleAt;
  wish.recipientEmail = recipientEmail ?? wish.recipientEmail;
  wish.recipientPhone = recipientPhone ?? wish.recipientPhone;
  wish.timezone = selectedTimezone;
  wish.images = retainImages ? [...wish.images, ...images] : images.length ? images : wish.images;
  wish.photoFrameStyle = photoFrameStyle || wish.photoFrameStyle;
  wish.photoTransition = photoTransition || wish.photoTransition;

  if (wish.deliveryMode === "scheduled" && !wish.scheduleAt) {
    throw new AppError("Please choose a birthday schedule date for auto-send.", 400);
  }

  if (accessPassword) {
    wish.accessPasswordHash = await hashValue(accessPassword);
  }

  if (musicMode === "upload" && musicAsset) {
    wish.music = {
      type: "upload",
      preset: "",
      ...musicAsset
    };
  } else if (musicMode === "preset") {
    wish.music = {
      type: "preset",
      preset: nextMusicPreset,
      url: "",
      publicId: "",
      name: nextMusicPreset
    };
  }

  if (voiceAsset) {
    wish.voiceMessage = voiceAsset;
  }

  await wish.save();

  res.json({
    success: true,
    message: "Wish updated.",
    data: wish
  });
});

export const getMyWishes = asyncHandler(async (req, res) => {
  const wishes = await Wish.find({ owner: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: wishes
  });
});

export const getWishById = asyncHandler(async (req, res) => {
  const wish = await findOwnedWish(req.params.id, req.user._id);

  res.json({
    success: true,
    data: {
      ...wish.toObject(),
      shareUrl: wish.shareSlug ? `${env.clientPublicUrl}/wish/${wish.shareSlug}` : "",
      accessPasswordHint: "Protected"
    }
  });
});

export const previewWish = asyncHandler(async (req, res) => {
  const wish = await findOwnedWish(req.params.id, req.user._id);
  wish.previewViews += 1;
  await wish.save();

  res.json({
    success: true,
    data: {
      preview: getPublicWishPayload(wish),
      ownerName: req.user.name
    }
  });
});

export const getWishPublicMeta = asyncHandler(async (req, res) => {
  const wish = await Wish.findOne({ shareSlug: req.params.slug }).select(
    "recipientName relation templateId theme status orderStatus expiresAt createdAt scheduleAt deliveredAt"
  );

  if (!wish) {
    throw new AppError("Wish page not found.", 404);
  }

  res.json({
    success: true,
    data: {
      ...wish.toObject(),
      approvalState: wish.orderStatus
    }
  });
});

export const accessWish = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const wish = await Wish.findOne({ shareSlug: req.params.slug }).populate("owner", "name");

  if (!wish) {
    throw new AppError("Wish page not found.", 404);
  }

  if (wish.orderStatus === "pending") {
    throw new AppError("This birthday wish is waiting for admin approval.", 403);
  }

  if (wish.orderStatus === "rejected" || wish.paymentStatus === "failed") {
    throw new AppError("This birthday wish request was rejected.", 403);
  }

  if (wish.expiresAt && wish.expiresAt <= new Date()) {
    wish.status = "expired";
    wish.isActive = false;
    await wish.save();
    throw new AppError("This birthday page has expired.", 410);
  }

  const isMatch = await compareValue(password, wish.accessPasswordHash);

  if (!isMatch) {
    throw new AppError("Incorrect password.", 401);
  }

  if (wish.status === "scheduled" && wish.scheduleAt && wish.scheduleAt > new Date()) {
    res.json({
      success: true,
      data: {
        accessState: "countdown",
        unlocksAt: wish.scheduleAt,
        wish: getPublicWishPayload(wish),
        shareUrl: `${env.clientPublicUrl}/wish/${wish.shareSlug}`
      }
    });
    return;
  }

  if ((!wish.isActive || wish.status !== "active") && wish.scheduleAt && wish.scheduleAt <= new Date()) {
    wish.status = "active";
    wish.isActive = true;
    wish.deliveredAt = wish.deliveredAt || new Date();
    wish.expiresAt = wish.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    await wish.save();
  }

  if (!wish.isActive || wish.status !== "active") {
    throw new AppError("This wish page is not active right now.", 400);
  }

  if (!wish.openedAt) {
    wish.openedAt = new Date();
    await wish.save();
  }

  res.json({
    success: true,
    data: {
      accessState: "open",
      wish: getPublicWishPayload(wish),
      shareUrl: `${env.clientPublicUrl}/wish/${wish.shareSlug}`
    }
  });
});

export const deleteWish = asyncHandler(async (req, res) => {
  const wish = await findOwnedWish(req.params.id, req.user._id);
  await wish.deleteOne();

  res.json({
    success: true,
    message: "Wish deleted."
  });
});
