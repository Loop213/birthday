import cron from "node-cron";
import Wish from "../models/Wish.js";
import { sendWishCountdownEmail, sendWishDeliveryEmail } from "../services/emailService.js";
import env from "../config/env.js";

async function sendUpcomingWishReminders() {
  const now = new Date();
  const reminderWindowStart = new Date(now.getTime() + 59 * 60 * 1000);
  const reminderWindowEnd = new Date(now.getTime() + 60 * 60 * 1000 + 59 * 1000);

  const upcomingWishes = await Wish.find({
    status: "scheduled",
    reminderSentAt: null,
    scheduleAt: {
      $gte: reminderWindowStart,
      $lte: reminderWindowEnd
    }
  }).populate("owner");

  for (const wish of upcomingWishes) {
    const shareUrl = `${env.clientPublicUrl}/wish/${wish.shareSlug}`;

    await sendWishCountdownEmail({
      recipientEmail: wish.recipientEmail,
      recipientName: wish.recipientName,
      senderName: wish.owner.name,
      shareUrl,
      scheduleAt: wish.scheduleAt
    });

    wish.reminderSentAt = now;
    await wish.save();
  }
}

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
      await sendUpcomingWishReminders();
      await activateScheduledWishes();
      await expireWishes();
    } catch (error) {
      console.error("Wish scheduler failed", error);
    }
  });
}
