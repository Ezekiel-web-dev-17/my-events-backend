import { sendEmail } from "./mailer.js";
import { createWelcomeEmail } from "./googleMailTemplate.js";
import { FRONTEND_URL } from "../config/config.js";

export const sendGoogleWelcomeEmail = async ({ firstname, email }) => {
  const subject = "Welcome to Eventra!!";
  const html = createWelcomeEmail(firstname, FRONTEND_URL);

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export default {
  sendGoogleWelcomeEmail,
};
