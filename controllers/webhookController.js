import crypto from "crypto";
import { processSuccessfulPayment } from "../helpers/verifyPaymentSuccess.js";
import { sendPaymentConfirmationEmail } from "../emails/sendemails.js";
import { PAYSTACK_SECRET_KEY } from "../config/config.js";

export const handleWebhookNotification = async (req, res, next) => {
  const secret = PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).json({
      success: "false",
      message: "Invalid signature",
    });
  }

  const { event, data } = req.body;

  try {
    if (event === "charge.success") {
      await processSuccessfulPayment(data.reference, data);
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    if (next) next(error);
    else res.status(500).json({ error: error.message });
  }
};

export default { handleWebhookNotification };