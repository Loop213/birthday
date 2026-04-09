import cron from "node-cron";
import Wish from "../models/Wish.js";
import { sendWishDeliveryEmail } from "../services/emailService.js";
import env from "../config/env.js";

async function activateScheduledWishes() {
  const dueWishes = await Wish.find({
    status: "scheduled",
    scheduleAt: { $lte: new Date() }
  }).populate("owner");

  for (const wish of dueWishes) {
    wish.status = "active";
    wish.isActive = true;
    wish.deliveredAt = new Date();
    wish.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await wish.save();

    const shareUrl = `${env.clientPublicUrl}/wish/${wish.shareSlug}`;
    await sendWishDeliveryEmail({
      recipientEmail: wish.recipientEmail,
      recipientName: wish.recipientName,
      senderName: wish.owner.name,
      shareUrl,
      accessPassword: "Shared privately by the creator"
    });
  }
}

async function expireWishes() {
  await Wish.updateMany(
    {
      status: "active",
      expiresAt: { $lte: new Date() }
    },
    {
      $set: {
        status: "expired",
        isActive: false
      }
    }
  );
}

export function startWishScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      await activateScheduledWishes();
      await expireWishes();
    } catch (error) {
      console.error("Wish scheduler failed", error);
    }
  });
}
