import nodemailer from "nodemailer";

/**
 * Email configuration using Nodemailer
 * Supports SMTP with fallback to console logging in development
 */
class EmailConfig {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    const isConfigured =
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!isConfigured) {
      console.warn(
        "⚠️  SMTP not configured. Emails will be logged to console."
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("✅ Email transporter initialized");
  }

  getTransporter() {
    return this.transporter;
  }

  isConfigured() {
    return this.transporter !== null;
  }
}

export default new EmailConfig();
