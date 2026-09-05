import { contactEmailReply } from "../emails/emailtemplate.js";
import { sendEmail } from "../emails/mailer.js";
import { ADMIN_EMAIL, EMAIL } from "../config/config.js";

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    await sendEmail({
      from: email,
      to: ADMIN_EMAIL || EMAIL,
      subject: `📩 New Contact Form Message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    await sendEmail({
      from: EMAIL,
      to: email,
      subject: " Message Received",
      html: contactEmailReply(name),
    });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

export default { handleContactForm };
