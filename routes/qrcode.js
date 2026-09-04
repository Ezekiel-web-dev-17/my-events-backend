import express from "express";
import { verifyTicketScan } from "../controllers/verifyQrcode.js";
import { isAdmin, isUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/verifyQrcode", isUser, isAdmin, verifyTicketScan);

export default router;