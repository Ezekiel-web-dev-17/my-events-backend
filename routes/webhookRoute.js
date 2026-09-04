import express from "express";
import { handleWebhookNotification } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/webhooks", handleWebhookNotification);

export default router;