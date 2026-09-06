import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendMail({ to, subject, text, html, attachments }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`Email was not sent to ${to}: SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env.`);
    return { delivered: false };
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html, attachments });
  return { delivered: true };
}
