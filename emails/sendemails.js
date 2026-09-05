import { sendEmail } from "./mailer.js";
import {
  createWelcomeEmail,
  resetEmailTemplate,
  PaymentComfirmationEmail,
  sendUserTicket,
  createAdminEmail,
} from "./emailtemplate.js";
import { FRONTEND_URL, FRONTEND_TICKET } from "../config/config.js";



const sendWelcomeEmail = async ({ firstname, clientUrl, email }) => {
  const subject = "Welcome to Eventra";
  const html = createWelcomeEmail(firstname, clientUrl);

  sendEmail({
    to: email,
    subject,
    html,
  });
};

const sendAdminEmail = async ({ firstname, email, password }) => {
  const subject = "Your Admin Account Details";
  const html = createAdminEmail(firstname, email, password);

  sendEmail({
    to: email,
    subject,
    html,
  });
};
const sendResetEmail = async ({ firstname, clientUrl, email }) => {
  const subject = "Password Reset";
  const html = resetEmailTemplate(firstname, clientUrl);
  sendEmail({
    to: email,
    subject,
    html,
  });
};

const sendPaymentConfirmationEmail = async ({
  email,
  lastname,
  reference,
  amount,
  currency,
  ticketDetails,
  clientBaseUrl = (FRONTEND_URL || "http://localhost:5500").replace(/\/$/, ""),
  frontendRoute = FRONTEND_TICKET || "/dashboard/tickets"
}) => {
  const subject = "Your Purchase Confirmation ";
  const ticketUrl = `${clientBaseUrl}${frontendRoute}`;
  const html = PaymentComfirmationEmail(
    lastname,
    reference,
    amount,
    currency,
    ticketDetails,
    ticketUrl
  );

  sendEmail({
    to: email,
    subject,
    html,
  });
};

const sendTicket = async ({
  email,
  lastname,
  ticketDetails,
  account,
}) => {
  const subject = "Eventra Ticket Details";


  // --- 2. Generate HTML with CID Reference ---
  const html = sendUserTicket(
    lastname,
    ticketDetails,
    account,
  );

  // --- 3. Send Email with Attachments ---
  sendEmail({
    to: email,
    subject,
    html,
  });
};

export {
  sendWelcomeEmail,
  sendResetEmail,
  sendPaymentConfirmationEmail,
  sendTicket,
  sendAdminEmail,
};

export default {
  sendWelcomeEmail,
  sendResetEmail,
  sendPaymentConfirmationEmail,
  sendTicket,
  sendAdminEmail,
};
