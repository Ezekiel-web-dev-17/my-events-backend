import express from "express";
import {
  handlePaymentInitialization,
  handlePaymentVerification,
  handleAllTransactions,
  handleUserTicket,
  getSalesOverview,
  handleAllTickets,
} from "../controllers/paymentsController.js";
import { isAdmin, isUser, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/initialize/:ticketId", isUser, handlePaymentInitialization);
router.get("/verify", handlePaymentVerification);
router.get("/allTransactions", isUser, isAdmin, handleAllTransactions);
router.get("/myTicket", isUser, handleUserTicket);
router.get("/allTicket", isUser, isAdmin, handleAllTickets);
router.get("/revenue", isUser, isSuperAdmin, getSalesOverview);

export default router;
