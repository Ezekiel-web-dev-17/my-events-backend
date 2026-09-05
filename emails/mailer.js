import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE, EMAIL, PASSWORD } from "../config/config.js";

const createTransporter = () => {
  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === "true",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
};

const transporter = createTransporter();

/**
 * Send an email using Nodemailer
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.from] - Optional custom sender address
 */
export const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const mailOptions = {
      from: from || `"Eventra" <${EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Email sent successfully to ${to}: ${info.messageId || info.response}`);
    return info;
  } catch (error) {
    console.error("[Nodemailer] Error sending email:", error);
  }
};

export default sendEmail;
