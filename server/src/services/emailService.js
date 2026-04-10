import nodemailer from "nodemailer";
import env from "../config/env.js";

let transporter = null;

if (env.smtpHost && env.smtpUser && env.smtpPass) {
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

export async function sendWishDeliveryEmail({
  recipientEmail,
  recipientName,
  senderName,
  shareUrl,
  accessPassword
}) {
  if (!recipientEmail) {
    return { sent: false, mode: "skipped" };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; background: #070b1a; color: white; padding: 32px;">
      <h2 style="margin-top: 0;">A surprise birthday experience is waiting for you</h2>
      <p>Hi ${recipientName},</p>
      <p>${senderName} created a premium birthday page just for you.</p>
      <p><strong>Open link:</strong> <a href="${shareUrl}" style="color:#7dd3fc;">${shareUrl}</a></p>
      <p><strong>Password:</strong> ${accessPassword}</p>
      <p>This wish page stays active for 24 hours after delivery.</p>
    </div>
  `;

  if (!transporter) {
    console.log("Email preview", { recipientEmail, shareUrl, accessPassword });
    return { sent: false, mode: "console" };
  }

  await transporter.sendMail({
    from: env.smtpFrom,
    to: recipientEmail,
    subject: "Your birthday surprise is ready",
    html
  });

  return { sent: true, mode: "smtp" };
}

export async function sendWishCountdownEmail({
  recipientEmail,
  recipientName,
  senderName,
  shareUrl,
  scheduleAt
}) {
  if (!recipientEmail) {
    return { sent: false, mode: "skipped" };
  }

  const formattedSchedule = scheduleAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(scheduleAt))
    : "soon";

  const html = `
    <div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #090b18, #1e1030, #0d2240); color: white; padding: 32px;">
      <h2 style="margin-top: 0;">Your birthday surprise unlocks in less than one hour</h2>
      <p>Hi ${recipientName},</p>
      <p>${senderName} scheduled a premium birthday wish for you.</p>
      <p><strong>Countdown link:</strong> <a href="${shareUrl}" style="color:#7dd3fc;">${shareUrl}</a></p>
      <p><strong>Unlock time:</strong> ${formattedSchedule}</p>
      <p>The link opens to a live countdown first, then reveals the full celebration automatically.</p>
    </div>
  `;

  if (!transporter) {
    console.log("Countdown email preview", { recipientEmail, shareUrl, scheduleAt });
    return { sent: false, mode: "console" };
  }

  await transporter.sendMail({
    from: env.smtpFrom,
    to: recipientEmail,
    subject: "Your birthday surprise starts in less than an hour",
    html
  });

  return { sent: true, mode: "smtp" };
}
